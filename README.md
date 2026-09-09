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
It also generates Markdown alternatives, `robots.txt`, `sitemap.xml`, and `llms.txt`.

The application retains React, Vite, and Tailwind with the Sera theme direction.
The Sera direction uses warm taupe surfaces, an ink text color, a restrained rust accent, thin rules, Playfair Display, and Noto Sans.
Knip checks project usage, and Oxlint runs as part of the lint checks.

## Deployment limits

No public deployment URL is configured yet.
The Vercel static configuration must use `pnpm build:release` so release metadata has a real public origin.

Local Markdown alternatives do not prove that a static host supports `Accept`-header content negotiation.
After deployment, test public redirects, 404 responses, cache behavior, crawler policies, and the external scan separately.

## References

- [Official website specification](docs/specs/official-website.md)
- [Design decisions](docs/notes/design-decisions.md)
- [Pinned `cc-agents-kit` source](https://github.com/AndrewDongminYoo/cc-agents-kit/tree/4a8947c3110459730e5c91eb75f7ecfe620be394)
