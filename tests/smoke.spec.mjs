import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const THIRD_PARTY =
	/cal\.com|googleapis|gstatic|cloudfront|webfont|google-analytics|doubleclick|fonts\.google/i;

function collectPageFaults(page) {
	const errors = [];

	page.on('console', (msg) => {
		if (msg.type() !== 'error') return;
		const text = msg.text();
		const url = msg.location()?.url || '';
		if (THIRD_PARTY.test(text) || THIRD_PARTY.test(url)) return;
		errors.push(text);
	});

	page.on('pageerror', (error) => {
		const text = String(error?.message || error);
		const stack = String(error?.stack || '');
		if (THIRD_PARTY.test(text) || THIRD_PARTY.test(stack)) return;
		errors.push(text);
	});

	return errors;
}

function publishedPost() {
	const payload = JSON.parse(readFileSync('data/blog.json', 'utf8'));
	const posts = Array.isArray(payload.posts) ? payload.posts : [];
	if (!posts.length) {
		throw new Error('data/blog.json has no published posts; run npm run build');
	}
	return posts[0];
}

test('home page renders and lists a post', async ({ page }) => {
	const errors = collectPageFaults(page);
	const response = await page.goto('/', { waitUntil: 'domcontentloaded' });

	expect(response, 'expected a response for /').toBeTruthy();
	expect(response.status(), '/ HTTP status').toBe(200);
	await expect(page.getByRole('heading', { name: /Connor Barrett/i })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Blog.' })).toBeVisible();

	const post = publishedPost();
	await expect(page.locator('#blog-feed .blog-item').first()).toBeVisible();
	await expect(page.locator('#blog-feed .blog-item-title').first()).toHaveText(post.title);

	expect(errors, `console errors on /:\n${errors.join('\n')}`).toEqual([]);
});

test('blog post page renders', async ({ page }) => {
	const errors = collectPageFaults(page);
	const post = publishedPost();
	const path = `/blog/${post.slug}/`;
	const response = await page.goto(path, { waitUntil: 'domcontentloaded' });

	expect(response, `expected a response for ${path}`).toBeTruthy();
	expect(response.status(), `${path} HTTP status`).toBe(200);
	await expect(page.locator('.blog-post-title')).toHaveText(post.title);
	await expect(page.locator('.blog-prose')).not.toBeEmpty();

	expect(errors, `console errors on ${path}:\n${errors.join('\n')}`).toEqual([]);
});
