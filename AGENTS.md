# Agent rules — flowconnor.dev

Personal site for Connor Barrett. Vanilla HTML, CSS, and JavaScript. Vercel project `my-webflow-portfolio` auto-deploys `main` to [www.bytesofconnor.online](https://www.bytesofconnor.online) and [flowconnor.dev](https://flowconnor.dev), and builds a preview for every PR.

Agents should work under /poteto-mode, and pstack model roles are set in `.cursor/rules/pstack-models.mdc` (Cursor first).

## Stack

- Static pages: `index.html`, `blog.html`, `biodiversity.html`, plus CSS in `css/` and JS in `js/`
- Posts: Markdown in `posts/` with YAML front matter
- Build: `scripts/build-posts.mjs` writes `data/blog.json` and `blog/<slug>/index.html` (both gitignored)
- CMS: [Sveltia CMS](https://flowconnor.dev/admin/) commits Markdown to `main`. That path must keep working. Do not require a pull request before merging, and do not add a ruleset that blocks Connor’s direct pushes to `main`.
- Hosting: Vercel (`vercel.json` output directory is `.`). An older GitHub Pages workflow still exists; leave it alone unless asked.
- Forms: Formspree. Scheduling: Cal.com embed on the homepage.

There is no TypeScript and no app framework. Do not add a typecheck script.

## Commands

```bash
npm ci
npm run lint          # syntax-check hand-written JS only (not webflow.js)
npm run build         # posts → data/blog.json and blog/<slug>/
python3 -m http.server 4173 --bind 127.0.0.1
npm run test:smoke    # Playwright: home + one post, 1280×800 and 390×844
```

CI job `checks` on pull requests runs install, lint, build, and the smoke test.

Every same-repo pull request enables squash auto-merge once the required `checks` job passes.
That includes `cursor/*` pull requests that change `.github/**`, `.cursor/rules/**`, or `AGENTS.md`, any other branch from this repo, and every Dependabot update.
Pull requests from forks do not auto-merge.

## How to verify

Run the commands above. For UI work, open `/` and `/blog/<slug>/` after `npm run build`, click the real controls, and check desktop (1280×800) and mobile (390×844). “It builds” is not enough for a visual change.

PR bodies must include **Verification** and **Blast Radius** (see `.github/pull_request_template.md`).

## Do

- Keep copy short and plain.
- Treat published posts as real writing. Fix typos in files you already touch; do not rewrite voice.
- Leave generated `data/blog.json` and `blog/` uncommitted.
- Leave Sveltia (`admin/config.yml`) pointed at `bytesofconnor/site` / `main` unless the task is to change the CMS.

## Do not

- Invent clients, employers, metrics, testimonials, or project results.
- Commit secrets, tokens, `.env` files, or CMS access tokens.
- Edit CI, Playwright tests, or lint to make a red check look green. Fix the product instead.
- Change `posts/*.md` unless the task is about a post. The CMS writes those files to `main`.
- Expand this into a framework, add analytics, or add packages the site does not need.
