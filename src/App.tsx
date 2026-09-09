import { useState } from "react"

import {
  Faq,
  Hero,
  MarketplaceInstall,
  Installation,
  PluginCatalogue,
  Requirements,
  SiteFooter,
  SiteHeader,
} from "@/components/site/site-sections"
import { getContent, type Locale, type PluginId } from "@/content"

function App({ locale }: { locale: Locale }) {
  const content = getContent(locale)
  const [selectedPlugin, setSelectedPlugin] = useState<PluginId>("guard-hooks")

  return (
    <div className="site-shell">
      <MarketplaceInstall content={content} />
      <SiteHeader content={content} locale={locale} />
      <main id="main-content">
        <Hero content={content} />
        <PluginCatalogue
          content={content}
          locale={locale}
          selectedPlugin={selectedPlugin}
          onSelect={setSelectedPlugin}
        />
        <div className="install-drawer">
          <Installation content={content} selectedPlugin={selectedPlugin} />
        </div>
        <Requirements content={content} />
        <Faq content={content} />
      </main>
      <SiteFooter content={content} />
    </div>
  )
}

export default App
