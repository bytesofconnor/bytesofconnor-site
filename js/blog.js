(function () {
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

	function formatDate(iso) {
		if (!iso) return '';
		const parts = String(iso).slice(0, 10).split('-');
		if (parts.length !== 3) return iso;
		const month = MONTHS[Number(parts[1]) - 1];
		if (!month) return iso;
		return `${month} ${Number(parts[2])}, ${parts[0]}`;
	}

	function postUrl(slug) {
		return 'blog/' + encodeURIComponent(slug) + '/';
	}

	async function loadPosts() {
		const response = await fetch('data/blog.json', { cache: 'no-cache' });
		if (!response.ok) return [];
		const payload = await response.json();
		return Array.isArray(payload.posts) ? payload.posts : [];
	}

	function currentSlug() {
		return new URLSearchParams(window.location.search).get('p') || '';
	}

	async function renderList(root) {
		if (!root) return;
		let posts = [];
		try {
			posts = await loadPosts();
		} catch (error) {
			posts = [];
		}

		if (!posts.length) {
			if (root.querySelector('.blog-item')) return;
			root.innerHTML = '<p class="blog-empty-text">New posts coming soon.</p>';
			root.classList.add('blog-empty');
			root.classList.remove('blog-feed');
			return;
		}

		root.classList.remove('blog-empty');
		root.classList.add('blog-feed');
		root.innerHTML = posts
			.map(function (post) {
				const date = formatDate(post.date);
				const excerpt = post.description ? '<p class="blog-item-excerpt">' + escapeHtml(post.description) + '</p>' : '';
				return (
					'<a class="blog-item" href="' +
					postUrl(post.slug) +
					'">' +
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

	async function renderPost(root) {
		if (!root) return;
		const slug = currentSlug();
		if (!slug) {
			root.innerHTML =
				'<p class="blog-empty-text">No post selected. <a class="link" href="index.html#thoughts-section">Back to Blog.</a></p>';
			return;
		}

		let posts = [];
		try {
			posts = await loadPosts();
		} catch (error) {
			posts = [];
		}

		const post = posts.find(function (entry) {
			return entry.slug === slug;
		});

		if (!post) {
			root.innerHTML =
				'<p class="blog-empty-text">This post isn’t published. <a class="link" href="index.html#thoughts-section">Back to Blog.</a></p>';
			return;
		}

		document.title = post.title + ' — Connor Barrett';
		const date = formatDate(post.date);
		const shareUrl = new URL(postUrl(post.slug), window.location.origin).href;
		const tweet =
			'https://x.com/intent/tweet?text=' +
			encodeURIComponent(post.title) +
			'&url=' +
			encodeURIComponent(shareUrl);
		root.innerHTML =
			'<p class="blog-post-date">' +
			escapeHtml(date) +
			'</p>' +
			'<h1 class="blog-post-title">' +
			escapeHtml(post.title) +
			'</h1>' +
			'<p class="blog-post-share">' +
			'<button type="button" class="blog-share-copy" data-copy-post="' +
			escapeHtml(shareUrl) +
			'">Copy link</button>' +
			'<span class="blog-share-sep" aria-hidden="true">·</span>' +
			'<a class="blog-share-x" href="' +
			escapeHtml(tweet) +
			'" target="_blank" rel="noopener noreferrer">Share on X</a>' +
			'</p>' +
			'<div class="blog-prose">' +
			(post.html || '') +
			'</div>';
		bindShare(root);
	}

	function bindShare(root) {
		if (!root) return;
		const url = window.location.href;
		const titleEl = root.querySelector('.blog-post-title');
		const title = titleEl ? titleEl.textContent.trim() : document.title;
		const xLink = root.querySelector('.blog-share-x');
		if (xLink) {
			xLink.href =
				'https://x.com/intent/tweet?text=' +
				encodeURIComponent(title) +
				'&url=' +
				encodeURIComponent(url);
		}
		const button = root.querySelector('[data-copy-post]');
		if (!button || button.dataset.bound === 'true') return;
		button.dataset.bound = 'true';
		button.addEventListener('click', function () {
			const original = button.textContent;
			navigator.clipboard.writeText(window.location.href).then(function () {
				button.textContent = 'Copied';
				window.setTimeout(function () {
					button.textContent = original;
				}, 2000);
			});
		});
	}

	function escapeHtml(value) {
		return String(value)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	}

	window.SiteBlog = {
		renderList: renderList,
		renderPost: renderPost,
		bindShare: bindShare,
	};
})();
