import { renderToString } from "react-dom/server"

import App from "./App.tsx"
import {
  getMarkdown,
  release,
  siteMeta,
  sourceRepositoryUrl,
} from "./content.ts"

export type Locale = "en" | "ko"

export const site = {
  productName: "cc-agents-kit",
  ownerUrl: "https://www.donminzzi.kr",
  sourceUrl: `${sourceRepositoryUrl}/tree/${release.sha}`,
  sourceRevision: release.sha,
} as const

export { getMarkdown, release, siteMeta }

export function renderApp(locale: Locale) {
  return renderToString(<App locale={locale} />)
}
