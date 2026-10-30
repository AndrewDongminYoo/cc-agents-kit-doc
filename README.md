# cc-agents-kit documentation site

This project builds a bilingual static catalogue that helps developers evaluate the released `cc-agents-kit` plugins for Claude Code.

## Quick start

Install the pinned dependencies and start the Vite development server.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

## Build and preview

Build the client, server-rendered pages, and static output.

```bash
pnpm build
```

Preview the generated site locally.

```bash
pnpm preview
```

The local preview uses `http://localhost:4173` by default.
Local output uses `noindex,nofollow` metadata and a disallow-all `robots.txt`.

## Release configuration

Set `SITE_URL` to the real public HTTPS origin before a release build.
`pnpm build:release` rejects missing, local, credentialed, path-based, or non-HTTPS values.

```bash
SITE_URL=https://example.com pnpm build:release
```

`VITE_SITE_REPO_URL` is optional and supplies the website repository link when it is configured.
Do not treat the example origin as the project's public domain.

## Checks

Run the declared project checks when validating a change.

```bash
pnpm typecheck
pnpm lint
pnpm format:check
pnpm knip
pnpm test:unit
pnpm build
pnpm verify:site:negative
pnpm test:browser
trunk check --all --no-fix
```

`pnpm typecheck` runs the TypeScript compiler.
`pnpm lint` runs ESLint and Oxlint.
`pnpm knip` checks for unused files and exports.
`pnpm build` generates the static site before site validation.
`pnpm verify:site:negative` exercises the site's negative validation fixtures.
`pnpm test:unit` checks OG inventory interpolation, shared logo outlines, template errors, generated-file freshness, and PNG dimensions with Node's built-in test runner.
`pnpm test:browser` uses Playwright to check language switching after opening the review prompt, clipboard success and failure, responsive prompt layout, and stable enlarged logo rendering in both languages.
Install Chromium once with `pnpm exec playwright install chromium`.
`pnpm check` includes both test suites, and CI installs Chromium before running that command.
The browser suite uses one worker and owns port 4183, leaving the normal preview on port 4173 available.
`trunk check --all --no-fix` runs the repository's Trunk checks on every file, including an unchanged dependency lockfile, without applying fixes.

## Content and architecture

`src/content.ts` is the canonical source for the visible bilingual facts.
Product facts are pinned to public release `v0.8.4`, including the two function-hook mods.
The page tools provide page copying, a localized Markdown link, and Claude and ChatGPT links with a prefilled review prompt.
They sit beside a centered content column on wide screens and above it on narrow screens.
The existing AI review section retains the full prompt and manual copy fallback.
The review prompt uses the readable release tag in its RAW README URL and expands across the installation section without nested scrolling.
Both the HTML and Markdown alternatives derive those links from the same localized prompt.
The build renders initial static HTML at `/en/` and `/ko/`.
It also generates Markdown alternatives with a frontmatter block, `robots.txt`, `sitemap.xml`, a navigation index at `llms.txt`, the full bilingual content at `llms-full.txt`, and an HTML and a Markdown 404 page.

The application retains React, Vite, and Tailwind with the Sera theme direction.
The header, footer, and favicon share a fixed SVG mark whose lettering is outlined, so it does not change with the page language or loaded fonts.
The Sera direction uses warm taupe surfaces, an ink text color, a restrained rust accent, thin rules, Playfair Display, and Noto Sans.
Knip checks project usage, and Oxlint runs as part of the lint checks.

## Social image

Regenerate the shared SVG and PNG after changing the released inventory, brand mark, or social-card layout.

```bash
node tools/generate-og-image.mjs
```

The generator reads `src/content.ts`, `public/favicon.svg`, and `tools/og-image.svg.template`.
It uses the project's installed TypeScript compiler and the installed `agent-browser` CLI to export a 1200×630 PNG.
PNG rendering uses the browser and fonts available on the machine.
Use `--svg-only` to regenerate the SVG without launching a browser.
Run the full export before delivery when the SVG changes; `og-image.provenance.json` records the SVG and PNG hashes together, and validation rejects an SVG-only refresh paired with an older PNG.
Edit the template rather than the generated files in `public/`.
The site validator compares the SVG's inventory labels with the generated Markdown counts.

## Deployment

The site is published at `https://skills.donminzzi.kr/` from Vercel, which runs `pnpm build:release` with `SITE_URL` set to that origin.
`vercel.json` also routes `/`, the locale roots, and the trust pages to their Markdown alternatives when a request names `text/markdown` in `Accept` or comes from one of the AI crawlers and agents listed in `scripts/agent-user-agents.mjs`, serves the Markdown 404 to such requests on an unknown path, adds `Vary: Accept, User-Agent` to every negotiated response, and marks hashed assets immutable.
The same user-agent list is written into `robots.txt` as an explicitly allowed group, and the validator fails if a user-agent route in `vercel.json` drifts from it.
Those rules live in `routes`, not `rewrites`, because Vercel resolves the filesystem before `rewrites` and the HTML file would win.
Response headers are `continue` routes for the same reason: once `routes` carries a filesystem handle, Vercel ignores the top-level `headers` block, and the validator fails if that block reappears.

After a deployment, test public redirects, 404 responses, cache behavior, crawler policies, and the external scan separately; the local preview server proves the output, not the host.

## Trust pages

`src/site-pages.ts` holds the About, Contact, and Privacy pages in both languages.
The build renders them at `/en/<page>/` and `/ko/<page>/` as static HTML with a Markdown twin, adds them to the sitemap and `llms.txt`, and the validator requires at least 500 characters of content on each.

## References

- [Official website specification](docs/specs/official-website.md)
- [Design decisions](docs/notes/design-decisions.md)
- [Pinned `cc-agents-kit` source](https://github.com/AndrewDongminYoo/cc-agents-kit/tree/2a934ed849c25a559439e96d952f0f18a67e8c97)
