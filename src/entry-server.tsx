import { renderToString } from "react-dom/server"

import App from "./App.tsx"
import {
  getContent,
  getMarkdown,
  release,
  siteMeta,
  sourceRepositoryUrl,
} from "./content.ts"
import { agentGuidance, getPageMarkdown, getPages } from "./site-pages.ts"

export type Locale = "en" | "ko"

export const site = {
  productName: "cc-agents-kit",
  ownerUrl: "https://www.donminzzi.kr",
  sourceUrl: `${sourceRepositoryUrl}/tree/${release.sha}`,
  sourceRevision: release.sha,
} as const

export { getMarkdown, getPageMarkdown, getPages, release, siteMeta }

export function renderApp(locale: Locale) {
  return renderToString(<App locale={locale} />)
}

// A Markdown section that tells agents which plugin fits which problem, built from the same content the page uses.
export function getAgentGuidance(locale: Locale): string {
  const content = getContent(locale)
  const guidance = agentGuidance[locale]
  const items = content.plugins
    .map((plugin) => {
      const problem = content.explorer.problems[plugin.id]
      return `- **${plugin.name}** — ${problem.title} ${problem.summary} ${content.catalogue.fitLabel}: ${plugin.idealFor}`
    })
    .join("\n")
  return `## ${guidance.heading}\n\n${guidance.intro}\n\n${items}\n\n${guidance.outro}`
}
