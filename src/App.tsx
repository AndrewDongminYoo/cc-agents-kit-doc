import { useState } from "react"
import { LucideProvider } from "lucide-react"

import {
  Faq,
  Hero,
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
    // Icons are sized in CSS, so a non-scaling stroke keeps their weight matched to the bold labels beside them.
    <LucideProvider nonScalingStroke strokeWidth={1.75}>
      <div className="site-shell">
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
    </LucideProvider>
  )
}

export default App
