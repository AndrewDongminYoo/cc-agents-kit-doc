# Node 26 runtime alignment plan

## Direction

Implement the runtime prerequisite from issue #8 before relying on the already installed Node 26 types.
Use the existing checkout and one scoped configuration commit.

## Steps

1. Compare the existing CI major and Node type major; observe the mismatch assertion fail.
2. Add `.node-version`, declare `engines.node`, and make CI read the version file.
3. Update README and CLAUDE setup and deployment claims.
4. Install with the project's pinned pnpm under Node 26 and a frozen lockfile; preserve the lockfile when resolution is unchanged.
5. Verify runtime/configuration agreement, run `pnpm check` and the scoped Trunk gate, and review the complete diff.
6. Commit, push, obtain current-head CI and hosted reviews, and merge under the explicit `pr-loop` authority.

## Limits

Do not upgrade other dependencies, alter Dependabot policy, or change remote Vercel settings.
An actual deployment and its runtime remain separate verification surfaces.
The change does not require visual approval because it changes runtime selection and documentation only.
