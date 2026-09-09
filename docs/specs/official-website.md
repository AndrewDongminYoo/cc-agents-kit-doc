# Official website

## Purpose

Help developers evaluate the released cc-agents-kit plugins for Claude Code.
Make each plugin's purpose, installation command, requirements, and limits easy to inspect.
Provide the same content in English and Korean, including an independent AI review prompt.

## Source contract

- Product source: [cc-agents-kit](https://github.com/AndrewDongminYoo/cc-agents-kit/tree/4a8947c3110459730e5c91eb75f7ecfe620be394).
- Released inventory: three plugins, eleven skills, and eight hooks.
- `guard-hooks` version `0.2.7`: eight hooks, including five blocking guards, two warnings, and one output mask.
- `context-handoff` version `0.1.4`: six skills.
- `repo-gate` version `0.1.6`: five skills.
- Do not include features from the local `feat/markdownlint-triage` branch until a public source update is verified.
- Keep `cc-agents-kit` as the product and marketplace name.
- Owner links: [personal website](https://www.donminzzi.kr) and [GitHub](https://github.com/AndrewDongminYoo).

Read the pinned README and plugin manifests before changing product claims.
Explain that guards protect against accidental mistakes and do not provide a sandbox.
State that `jq` is required and missing prerequisites can disable checks.
Do not claim a scan score, endorsement, or complete security coverage.

## Design contract

The site is an editorial catalogue of developer tools.
It should feel deliberate, approachable, and precise.
The existing Sera theme, warm taupe palette, Playfair display font, and Noto body font establish the direction.

- Use warm paper surfaces, ink text, a restrained rust accent, and thin dividing rules.
- Use an asymmetric hero, a large display headline, and an original schematic that explains the tools.
- Use a consistent spacing scale and readable content widths.
- Give installation commands clear copy controls and feedback.
- Keep every section usable at a viewport width of 360 pixels.
- Use semantic landmarks, visible keyboard focus, and descriptive accessible names.
- Honor reduced motion.
- Keep product information available without JavaScript.
- Keep the GitHub product link in the header.
- Show the website repository as pending until its URL is configured.

## Architecture

Retain React, Vite, Tailwind, and the Sera theme direction.
Use native HTML controls for the site's simple interactions.
Render English and Korean HTML during the build.
Use explicit `/en/` and `/ko/` URLs and ordinary links for navigation.
Use a shared content module for the visible page and Markdown alternatives.
Keep client state limited to useful interactions such as plugin selection and copy feedback.

The final public domain is not yet supplied.
Make it a build setting, require a valid public HTTPS origin for a release build, and prevent local preview metadata from being indexed.
Generate canonical links, language alternatives, social metadata, structured data, a sitemap, crawler instructions, and machine-readable text from the configured source.
Unknown routes must return a real 404 response on the supplied preview server.

The [Is Agentic guide](https://is-agentic.com/) prioritizes readable initial HTML, document structure, usable controls, and correct HTTP behavior.
Its [methodology](https://is-agentic.com/methodology) excludes interfaces that the product does not offer.
This website does not need invented API, OAuth, MCP, or payment endpoints.
Public-host behavior and an external score require a deployed URL and are separate acceptance checks.

## AI review prompt

Ask the visitor's AI to inspect the public README, manifests, hooks, and skills.
Require source-backed findings about prerequisites, permissions, existing overlap, limitations, and project suitability.
Ask for the smallest useful selection of plugins.
Require explicit approval before installation or configuration changes.
Provide both languages and a manual copy fallback.

## Acceptance checks

1. Product claims match the pinned public revision: compare the content module with the README and manifests.
2. Both languages are in the initial HTML: build the site and inspect the generated documents without running JavaScript.
3. Metadata identifies the correct language and configured origin: run the site validator, including negative fixtures.
4. Navigation and copy controls work: inspect the rendered site in desktop and mobile browser viewports.
5. Unknown pages return 404: request an unknown route from the supplied preview server.
6. Type checks, ESLint, Oxlint, Knip, formatting checks, and Trunk execute successfully: run the project's declared commands.

## Delivery boundary

Implement and verify the website locally.
Do not create a remote repository, commit, push, publish, or submit a public scan without the corresponding request.
Record any unverified hosting behavior and the delegation model counts in the final delivery note.
