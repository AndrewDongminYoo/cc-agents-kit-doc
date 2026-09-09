# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A bilingual (`/en/`, `/ko/`) static catalogue site for the released `cc-agents-kit` Claude Code plugins.
Stack: React 19, Vite 8, Tailwind 4, TypeScript 6, pnpm 12.
There is no test runner; the only automated behavioral check is the site validator described below.

Product facts on the site are pinned to one public revision of the product repository (`release.sha` in `src/content.ts`).
Read `docs/specs/official-website.md` (source and design contract) and `docs/notes/design-decisions.md` (why things are the way they are) before changing product claims, adding dependencies, or reworking the visual direction.
Do not add features from the local product checkout or unreleased branches until a public source update is verified.

## Commands

```bash
pnpm install --frozen-lockfile
pnpm dev                      # Vite dev server (client-only, no static metadata)
pnpm build                    # typecheck → client build → SSR build → scripts/generate-static.mjs
pnpm preview                  # serve dist/ on http://127.0.0.1:4173 with the custom static server
pnpm check                    # full gate: typecheck, lint, format:check, knip, build, verify:site:negative
```

Individual checks:

```bash
pnpm typecheck                # tsc -b
pnpm lint                     # eslint . && oxlint --deny-warnings .
pnpm format                   # prettier --write (format:check for CI mode)
pnpm knip                     # unused files/exports/deps; entry is src/entry-server.tsx
pnpm verify:site              # validate an existing dist/ (requires a prior pnpm build)
pnpm verify:site:negative     # same, plus negative fixtures that must fail
trunk check --no-fix          # actionlint + git-diff-check only
```

Release build (Vercel uses this via `vercel.json`):

```bash
SITE_URL=https://example.com pnpm build:release
```

`build:release` rejects a missing, non-HTTPS, localhost, IP, credentialed, or path-bearing `SITE_URL`.
Without `SITE_URL`, `pnpm build` targets `http://localhost:4173` and emits `noindex,nofollow` metadata plus a disallow-all `robots.txt`.
`VITE_SITE_REPO_URL` optionally supplies the website repository link; otherwise the footer shows it as pending.

Git hooks are managed by Trunk (`.trunk/trunk.yaml`): pre-commit runs `pnpm lint` + `pnpm format:check`, pre-push runs `pnpm check`.
CI (`.github/workflows/ci.yml`) runs `trunk check --no-fix` and `pnpm check` on Node 24.

## Architecture

### Single content source

`src/content.ts` is the canonical source of every visible fact: release inventory, plugin metadata, all English and Korean copy, and marketplace/install/upgrade command strings.
`src/tool-examples.ts` holds per-tool localized examples (trigger, result, mechanism) keyed by tool id, and is imported by `content.ts`.
Two consumers derive from it and must stay in sync automatically, not by hand:

- The React page (`src/App.tsx` → `src/components/site/site-sections.tsx`) via `getContent(locale)`.
- The Markdown alternative (`dist/<locale>/index.md` and `llms.txt`) via `getMarkdown(locale)`.

`toolSourceUrl(pluginId, toolId)` throws if a tool id is not listed in the plugin's `contents`, so adding a tool example means adding it to the plugin inventory too.
Hooks link to `plugins/<id>/hooks/<tool>.sh`, skills to `plugins/<id>/skills/<tool>/SKILL.md`, always at the pinned SHA.

### Build pipeline

`pnpm build` is three stages, and `scripts/generate-static.mjs` is where the static site actually comes from:

1. `vite build` produces the client bundle in `dist/` with `manifest: true`.
2. `vite build --ssr src/entry-server.tsx --outDir dist-ssr` produces a Node module exporting `renderApp`, `getMarkdown`, `siteMeta`, `release`, and `site`.
3. `generate-static.mjs` reads the client manifest, imports `dist-ssr/entry-server.js`, renders `/en/index.html` and `/ko/index.html` with full head metadata (canonical, hreflang, Open Graph, JSON-LD, Markdown alternate link), copies the English page to `dist/index.html`, and writes `404.html`, `robots.txt`, `sitemap.xml`, `llms.txt`, and both `index.md` files. It then deletes `dist-ssr/`.

`src/main.tsx` derives the locale from `window.location.pathname` and hydrates when `#root` already has server-rendered children, so `pnpm dev` (empty root) and the built site (pre-rendered root) share one entry.
`index.html` at the repo root is only the Vite dev shell; the generated documents do not use it as a template.

### SITE_URL gate

`scripts/site-url.mjs` owns URL validation.
`isReleaseSiteUrl` decides whether output is "release" (index,follow + sitemap in robots) or "local" (noindex + disallow-all).
`scripts/require-release-site-url.mjs` is the fail-fast pre-step of `build:release`.
Do not hardcode a public domain anywhere; the domain is a build setting by design.

### Static server and validator

`scripts/static-server.mjs` is a small Node HTTP server used by both `pnpm preview` and the validator.
It serves `dist/`, returns a real 404 with `404.html`, rejects non-GET/HEAD with 405, and performs `Accept`-header negotiation on `/`, `/en/`, `/ko/`: a client preferring `text/markdown` over `text/html` receives `index.md` with `Vary: Accept`.
This negotiation is a local demonstration only; the production host has not been verified to do the same.

`scripts/verify-site.mjs` asserts the generated HTML (language, initial app HTML, canonical, hreflang, Markdown alternate, OG locale), exercises the preview server's HTTP behavior, and runs `require-release-site-url.mjs` against a table of invalid and valid origins.
With `--self-test` it also mutates a good document and asserts that each check rejects the broken variant.
When adding a new metadata requirement, add both the positive assertion and a negative fixture.

### Styling

`src/index.css` imports Tailwind, `tw-animate-css`, `shadcn/tailwind.css`, and the two Fontsource variable fonts, then defines the theme as plain CSS custom properties (`--paper`, `--ink`, `--rust`, `--font-display`, `--text-hero`, …).
The `shadcn` and `tw-animate-css` packages exist only because the stylesheet imports them; `src/components/ui/`, `src/lib/`, and `src/assets/` are intentionally empty after the starter Button, `cn`, and Base UI dependencies were removed.
Do not reintroduce a component library; the site uses native buttons, links, and `<details>` disclosures.
Korean headings use the body sans stack, and word-preserving wrapping at 360px is a stated requirement.

`public/og-image.png` is a 1200×630 browser export of `public/og-image.svg`; regenerate and inspect the PNG after editing the SVG.
`generate-static.mjs` prefers the PNG when present and falls back to the SVG.

## Conventions

- Prettier formats everything (`.prettierrc`, with the Tailwind class-sorting plugin); do not hand-align.
- ESLint covers React hooks and Fast Refresh rules; Oxlint covers general JS/TS plus `react/jsx-key` and `jsx-a11y/alt-text` with warnings promoted to errors.
- `tsconfig.app.json` is strict with `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, and `erasableSyntaxOnly` (no enums, no parameter properties).
- Knip's `project` glob includes `src/**/*.css`, so a new CSS-only dependency must be imported from `src/index.css` to count as used.
- Product claims must not assert scan scores, endorsements, sandbox guarantees, or comparative superiority; see the spec's source contract.
