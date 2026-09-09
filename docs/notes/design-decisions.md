# Website decisions

## Evidence

The public source revision is `4a8947c3110459730e5c91eb75f7ecfe620be394`.
The local product checkout contains unmerged work, so it is not the release content source.
The public GitHub profile lists `https://www.donminzzi.kr` as the owner's website.

The primary external references are the [product repository](https://github.com/AndrewDongminYoo/cc-agents-kit/tree/4a8947c3110459730e5c91eb75f7ecfe620be394), the [Is Agentic guide](https://is-agentic.com/), and its [methodology](https://is-agentic.com/methodology).
The implementation also uses the [Vite SSR guide](https://vite.dev/guide/ssr.html), [Knip configuration reference](https://knip.dev/overview/configuration), and [Oxlint configuration reference](https://oxc.rs/docs/guide/usage/linter/config.html).

## Oracle precedent

The personal Oracle completed its retrieval at provider revision `7049be0f6c7cefadb3d3d24a51ac74aa66e48824`.
Current wiki freshness is unverified.
The website project has no verified indexed identity, so retrieval used the verified product identity `cc-agents-kit`.
The exact queries found no match.
The permitted shorter queries returned ten of twenty-four candidates, all account-neutral pages.
This is partial retrieval, not an exhaustive claim.

| Precedent source                                  | Effect on this design                                                                          |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `wiki/concepts/agentic-infrastructure-rollout.md` | Keep tooling in this repository and introduce only the requested local checks.                 |
| `raw/sources/.claude/CLAUDE.md`                   | Preserve the existing stack and explain each additional dependency.                            |
| `wiki/concepts/source-verified-output.md`         | Pin released counts and versions to the public source and avoid unverified scores.             |
| `wiki/concepts/evidence-basis-discipline.md`      | Inspect generated HTML and rendered controls separately, and test negative validator fixtures. |
| `wiki/entities/codex-plugin.md`                   | Use an explicit read-only review prompt with an approval boundary for installation.            |
| `raw/sources/.claude/CLAUDE.md`                   | Keep shared facts in one content source and derive both HTML and Markdown from it.             |

The last precedent originally used Markdown as the durable source.
This site adapts its single-source principle to typed bilingual content because React needs structured plugin data for selection controls.
The Markdown representation must use the same content values.

No specific bilingual, SEO, Knip, or Oxc precedent was found in the returned scope.

## Product and visual direction

Keep the product name because it is also the marketplace identifier.
Explain its scope with a Claude Code subtitle.
Retain Sera's warm palette and type pairing rather than introducing another component system.
The new interface uses native buttons, links, and disclosure controls.
Remove the unused starter Button wrapper and its Base UI, class-variance-authority, and cn dependencies after checking their usage with Knip.
Retain dependencies that the stylesheet actually imports, and document those CSS imports in the Knip configuration.
Use the existing React and Vite support to generate static HTML for two language routes.
The site needs no authentication, database, paid service, or application API.
The social image source is `public/og-image.svg`.
The matching `public/og-image.png` is a 1200 by 630 pixel browser export of that source.
After changing the SVG, render and inspect a new PNG before release.

## Typography and diagram revision

The operator reported broken Korean wrapping, weak text hierarchy, excessive decorative styling, and overlapping diagram labels.
Keep the existing routes, product facts, controls, warm color tokens, and installed fonts.
Use the body sans-serif stack for Korean headings and preserve words at every viewport.
Use distinct size and weight tokens for the page title, section titles, item titles, body text, and labels.
Reduce heading sizes and remove paper texture, decorative letters, and illustration shadows.
Place diagram labels in normal document flow and reserve a separate gutter for branch connectors.
Stack the hero at narrow widths and let diagram rows grow with their labels.
Keep focus indicators and reduced-motion behavior.
Validate generated output with `pnpm check`, then inspect Korean mobile and desktop pages and the English hero in Chrome.

## Problem-based exploration

The operator requested a more useful installation argument and an interactive view of the included skills instead of navigation tabs, scroll targets, counts, and repeated rules.
The main page now starts with a problem selector that changes the plugin and tool details in place.
Each tool has a localized trigger, outcome, mechanism, and source link based on the pinned public revision.
Examples describe behavior; the website does not execute the demonstrated commands or skills.
The visible installation section follows the selected plugin.
Requirements and all FAQ answers remain visible.
The AI review prompt uses a native disclosure next to the plugin installation command.
The Markdown representation includes the same examples, and a no-JavaScript fallback lists all tools and plugin installation commands.
The page removes visible product versions and SHA labels.
The social image also omits the product version.
The SHA remains in source links and provenance records.
The marketplace command sits in the page header as a compact monospace pill with a copy control, following the Is Agentic header pattern; the command text stays in the initial HTML, and the note that marketplace registration and plugin installation are separate moves to the pill's title.
Scope limits and runtime requirements each keep their heading and related content in one layout container.
Installation copy distinguishes the bundle command from the need to assess individual skills and hooks.
The review prompt asks the reader's AI to verify supported setup methods before suggesting selective adoption.
No comparative superiority is claimed without evidence about another product.
The source review corrected the handoff example to describe chat output, and changed overlap advice to ask readers to compare rules, behavior, and dependencies.
The implementation reuses React state, native buttons and disclosures, existing typography and color tokens, and a reduced-motion-aware CSS transition.

## Check implementation

Add Knip because the existing compiler and linter do not check unused project files and dependencies.
Add Oxlint for its JavaScript and TypeScript diagnostics, and retain ESLint for the existing React-specific checks.
Retain Prettier instead of adding another formatter.
Trunk runs Actionlint and whitespace checks directly.
Its local Git hooks run the declared pnpm checks so project tools resolve from the installed dependencies.
The site validator inspects generated HTML, metadata, Markdown responses, and HTTP error behavior.
Its negative fixtures must fail before a clean run is accepted.

## Publication settings

The user has not supplied a public domain or website repository URL at this point.
Use build settings for both instead of publishing an invented destination.
Keep local preview pages out of search indexes.
Require a real HTTPS origin for the release build.
Publishing and a public Is Agentic scan remain separate actions after local delivery.
