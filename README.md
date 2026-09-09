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
pnpm build
pnpm verify:site:negative
trunk check --no-fix
```

`pnpm typecheck` runs the TypeScript compiler.
`pnpm lint` runs ESLint and Oxlint.
`pnpm knip` checks for unused files and exports.
`pnpm build` generates the static site before site validation.
`pnpm verify:site:negative` exercises the site's negative validation fixtures.
`trunk check --no-fix` runs the repository's Trunk checks without applying fixes.

## Content and architecture

`src/content.ts` is the canonical source for the visible bilingual facts.
The build renders initial static HTML at `/en/` and `/ko/`.
It also generates Markdown alternatives with a frontmatter block, `robots.txt`, `sitemap.xml`, a navigation index at `llms.txt`, the full bilingual content at `llms-full.txt`, and an HTML and a Markdown 404 page.

The application retains React, Vite, and Tailwind with the Sera theme direction.
The Sera direction uses warm taupe surfaces, an ink text color, a restrained rust accent, thin rules, Playfair Display, and Noto Sans.
Knip checks project usage, and Oxlint runs as part of the lint checks.

## Deployment

The site is published at `https://skills.donminzzi.kr/` from Vercel, which runs `pnpm build:release` with `SITE_URL` set to that origin.
`vercel.json` also routes `/`, the locale roots, and the trust pages to their Markdown alternatives when a request names `text/markdown` in `Accept`, serves the Markdown 404 to such a request on an unknown path, adds `Vary: Accept` to every negotiated response, and marks hashed assets immutable.
Those rules live in `routes`, not `rewrites`, because Vercel resolves the filesystem before `rewrites` and the HTML file would win.

After a deployment, test public redirects, 404 responses, cache behavior, crawler policies, and the external scan separately; the local preview server proves the output, not the host.

## Trust pages

`src/site-pages.ts` holds the About, Contact, and Privacy pages in both languages.
The build renders them at `/en/<page>/` and `/ko/<page>/` as static HTML with a Markdown twin, adds them to the sitemap and `llms.txt`, and the validator requires at least 500 characters of content on each.

## References

- [Official website specification](docs/specs/official-website.md)
- [Design decisions](docs/notes/design-decisions.md)
- [Pinned `cc-agents-kit` source](https://github.com/AndrewDongminYoo/cc-agents-kit/tree/4a8947c3110459730e5c91eb75f7ecfe620be394)
