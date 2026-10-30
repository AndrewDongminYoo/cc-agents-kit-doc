# Node 26 runtime alignment

## Problem

[Issue #8](https://github.com/AndrewDongminYoo/cc-agents-kit-doc/issues/8) requires the runtime to match Node 26 types before adopting them.
The existing manifest already uses `@types/node` 26 while CI selects Node 24.

## Scope

Use Node 26 for local development, CI, and future Vercel builds.
Keep the existing type dependency and all other dependency versions.
Declare the local version in `.node-version`, use it in CI, and set `engines.node` to `26.x` for Vercel.
[Vercel's supported-version documentation](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions) confirms Node 26 support and the package engine override.
This change does not edit remote project settings or verify an actual deployment.

## Acceptance

1. The selected Node runtime, version file, package engine, Node type major, and CI version source agree on Node 26.
2. The pinned pnpm frozen-lockfile installation and `pnpm check` pass under Node 26.
3. README and CLAUDE runtime instructions match the configuration.
4. No application behavior or visual output changes are intended.
