import { mkdir, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

const root = process.cwd();
const postsDir = join(root, 'posts');
const blogDir = join(root, 'blog');
const outFile = join(root, 'data', 'blog.json');
const SITE = (
	process.env.SITE_URL ||
	(process.env.VERCEL_PROJECT_PRODUCTION_URL
		? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
		: 'https://flowconnor.dev')
).replace(/\/$/, '');
const DEFAULT_IMAGE = '/images/og-default.jpg';
const MONTHS = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];

marked.setOptions({ gfm: true, breaks: false });

function toExcerpt(description, body) {
	const explicit = (description || '').trim();
	if (explicit) return explicit;
	const plain = body
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/[#>*_`[\]]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
	if (plain.length <= 180) return plain;
	return `${plain.slice(0, 177).trim()}…`;
}

function toIsoDate(value) {
	if (!value) return '';
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return String(value);
	return date.toISOString().slice(0, 10);
}

function formatDate(iso) {
	if (!iso) return '';
	const parts = String(iso).slice(0, 10).split('-');
	if (parts.length !== 3) return iso;
	const month = MONTHS[Number(parts[1]) - 1];
	if (!month) return iso;
	return `${month} ${Number(parts[2])}, ${parts[0]}`;
}

function escapeHtml(value) {
	return String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function feedHtml(posts) {
	return posts
		.map(function (post) {
			const date = formatDate(post.date);
			const excerpt = post.description
				? '<p class="blog-item-excerpt">' + escapeHtml(post.description) + '</p>'
				: '';
			return (
				'<a class="blog-item" href="blog/' +
				encodeURIComponent(post.slug) +
				'/">' +
				(date ? '<span class="blog-item-date">' + escapeHtml(date) + '</span>' : '') +
				'<span class="blog-item-title">' +
				escapeHtml(post.title) +
				'</span>' +
				excerpt +
				'</a>'
			);
		})
		.join('');
}

function injectHomepageFeed(html, posts) {
	const startMarker = '<!-- blog-feed:start -->';
	const endMarker = '<!-- blog-feed:end -->';
	const startAt = html.indexOf(startMarker);
	const endAt = html.indexOf(endMarker);
	if (startAt === -1 || endAt === -1 || endAt < startAt) {
		throw new Error('index.html is missing blog-feed:start or blog-feed:end');
	}
	const lineStart = html.lastIndexOf('\n', startAt) + 1;
	const indent = html.slice(lineStart, startAt);
	if (!/^[\t ]*$/.test(indent)) {
		throw new Error('blog-feed:start must be the first content on its line');
	}
	const className = posts.length ? 'blog-feed' : 'blog-empty';
	const inner = posts.length
		? feedHtml(posts)
		: '<p class="blog-empty-text">New posts coming soon.</p>';
	const block =
		startMarker +
		'\n' +
		indent +
		'<div class="' +
		className +
		'" id="blog-feed">' +
		inner +
		'</div>\n' +
		indent +
		endMarker;
	return html.slice(0, startAt) + block + html.slice(endAt + endMarker.length);
}

async function writeHomepageFeed(posts) {
	const indexPath = join(root, 'index.html');
	const html = await readFile(indexPath, 'utf8');
	const next = injectHomepageFeed(html, posts);
	if (next !== html) {
		const temporary = `${indexPath}.tmp`;
		await writeFile(temporary, next);
		await rename(temporary, indexPath);
	}
	console.log('Updated index.html');
}

function toAbsoluteUrl(path) {
	if (!path) return `${SITE}${DEFAULT_IMAGE}`;
	if (/^https?:\/\//i.test(path)) return path;
	return SITE + (String(path).startsWith('/') ? path : `/${path}`);
}

function postPage(post) {
	const title = post.title;
	const description = post.description || 'Notes on software, design, and building products.';
	const canonical = `${SITE}/blog/${post.slug}/`;
	const image = toAbsoluteUrl(post.image);
	const dateLabel = formatDate(post.date);
	const tweet = `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(canonical)}`;

	return `<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<meta name="theme-color" content="#e6ebe8" />
		<meta name="color-scheme" content="light" />
		<title>${escapeHtml(title)} — Connor Barrett</title>
		<meta name="description" content="${escapeHtml(description)}" />
		<link rel="canonical" href="${escapeHtml(canonical)}" />
		<meta property="og:type" content="article" />
		<meta property="og:site_name" content="Connor Barrett" />
		<meta property="og:title" content="${escapeHtml(title)}" />
		<meta property="og:description" content="${escapeHtml(description)}" />
		<meta property="og:url" content="${escapeHtml(canonical)}" />
		<meta property="og:image" content="${escapeHtml(image)}" />
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="630" />
		<meta property="og:image:alt" content="${escapeHtml(title)}" />
		${post.date ? `<meta property="article:published_time" content="${escapeHtml(post.date)}" />` : ''}
		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:site" content="@bytesofconnor" />
		<meta name="twitter:creator" content="@bytesofconnor" />
		<meta name="twitter:title" content="${escapeHtml(title)}" />
		<meta name="twitter:description" content="${escapeHtml(description)}" />
		<meta name="twitter:image" content="${escapeHtml(image)}" />
		<link href="../../css/normalize.css" rel="stylesheet" type="text/css" />
		<link href="../../css/webflow.css" rel="stylesheet" type="text/css" />
		<link href="../../css/connor-freelance-portfolio-23-24.webflow.css" rel="stylesheet" type="text/css" />
		<link href="../../css/light-theme.css?v=quote-mobile" rel="stylesheet" type="text/css" />
		<link href="https://fonts.googleapis.com" rel="preconnect" />
		<link href="https://fonts.gstatic.com" rel="preconnect" crossorigin="anonymous" />
		<script src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js" type="text/javascript"></script>
		<script type="text/javascript">
			WebFont.load({
				google: { families: ['Manrope:200,300,400,500'] },
			});
		</script>
		<link href="../../images/favicon.png" rel="shortcut icon" type="image/png" />
		<link href="../../images/favicon.png" rel="apple-touch-icon" />
	</head>
	<body class="body">
		<div class="page-wrapper">
			<nav class="navigation">
				<div class="container navigation w-container">
					<a href="../../index.html#thoughts-section" class="bio-nav-back">← Blog</a>
					<a href="../../index.html" class="logo-link-block w-nav-brand" aria-label="Connor Barrett - Home">
						<img src="../../images/Logo.svg" loading="lazy" alt="Connor Barrett Logo" class="logo" />
					</a>
					<div class="nav-quote-wrapper" aria-live="polite">
						<blockquote id="nav-quote" class="nav-quote">
							<p id="nav-quote-text" class="nav-quote-text"></p>
							<cite id="nav-quote-author" class="nav-quote-author"></cite>
						</blockquote>
					</div>
				</div>
			</nav>

			<section class="work-section dyk-section blog-post-section">
				<div class="container work-grid home w-container">
					<div class="w-layout-grid about-1-2-grid">
						<div class="work-section-wrapper">
							<div class="work-content-wrapper">
								<h1 class="heading-2">Blog.</h1>
								<p class="paragraph-2">Notes on software, design, and building products.</p>
							</div>
						</div>
						<div class="work-wrapper">
							<article class="blog-post" id="blog-post">
								${dateLabel ? `<p class="blog-post-date">${escapeHtml(dateLabel)}</p>` : ''}
								<h1 class="blog-post-title">${escapeHtml(title)}</h1>
								<p class="blog-post-share">
									<button type="button" class="blog-share-copy" data-copy-post="${escapeHtml(canonical)}">Copy link</button>
									<span class="blog-share-sep" aria-hidden="true">·</span>
									<a class="blog-share-x" href="${escapeHtml(tweet)}" target="_blank" rel="noopener noreferrer">Share on X</a>
								</p>
								<div class="blog-prose">
									${post.html || ''}
								</div>
							</article>
						</div>
					</div>
				</div>
			</section>
		</div>
		<script src="../../js/quotes.js" type="text/javascript"></script>
		<script src="../../js/blog.js" type="text/javascript"></script>
		<script>
			SiteBlog.bindShare(document.getElementById('blog-post'));
		</script>
	</body>
</html>
`;
}

async function main() {
	await mkdir(postsDir, { recursive: true });
	await mkdir(join(root, 'data'), { recursive: true });
	await rm(blogDir, { recursive: true, force: true });
	await mkdir(blogDir, { recursive: true });

	const files = (await readdir(postsDir)).filter((name) => name.endsWith('.md'));
	const posts = [];

	for (const name of files) {
		const raw = await readFile(join(postsDir, name), 'utf8');
		const parsed = matter(raw);
		const data = parsed.data || {};
		if (data.draft === true) continue;

		const slug = name.replace(/\.md$/i, '');
		if (!slug || slug.includes('/') || slug.includes('..')) continue;

		const body = parsed.content.trim();
		const post = {
			slug,
			title: String(data.title || slug),
			date: toIsoDate(data.date),
			description: toExcerpt(data.description, body),
			image: data.image ? String(data.image) : DEFAULT_IMAGE,
			html: marked.parse(body),
		};
		posts.push(post);

		const postDir = join(blogDir, slug);
		await mkdir(postDir, { recursive: true });
		await writeFile(join(postDir, 'index.html'), postPage(post));
	}

	posts.sort((a, b) => String(b.date).localeCompare(String(a.date)) || a.title.localeCompare(b.title));

	await writeFile(outFile, `${JSON.stringify({ posts }, null, 2)}\n`);
	console.log(`Wrote ${posts.length} post(s) to data/blog.json and blog/<slug>/`);
	await writeHomepageFeed(posts);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
