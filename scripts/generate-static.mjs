import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

import { isReleaseSiteUrl, normalizeSiteUrl } from "./site-url.mjs"

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
)
const outputDirectory = path.join(projectRoot, "dist")
const serverOutputDirectory = path.join(projectRoot, "dist-ssr")
const localSiteUrl = "http://localhost:4173"
const locales = ["en", "ko"]

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[character]
  })
}

function urlFor(siteUrl, pathname) {
  return new URL(pathname, `${siteUrl}/`).href
}

async function readManifest() {
  const manifestPath = path.join(outputDirectory, ".vite", "manifest.json")
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"))
  const entry = manifest["index.html"]

  if (!entry?.file) {
    throw new Error("The client manifest does not contain index.html.")
  }

  return entry
}

function metadata({
  locale,
  meta,
  siteUrl,
  release,
  releaseVersion,
  imagePath,
}) {
  const localizedPath = `/${locale}/`
  const canonical = urlFor(siteUrl, localizedPath)
  const english = urlFor(siteUrl, "/en/")
  const korean = urlFor(siteUrl, "/ko/")
  const image = urlFor(siteUrl, imagePath)
  const robots = release ? "index,follow" : "noindex,nofollow"
  const ogLocale = locale === "ko" ? "ko_KR" : "en_US"
  const alternateOgLocale = locale === "ko" ? "en_US" : "ko_KR"
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "cc-agents-kit",
    applicationCategory: "DeveloperApplication",
    softwareRequirements: "Claude Code",
    isAccessibleForFree: true,
    license: "Apache-2.0, with adapted MIT-licensed parts",
    softwareVersion: releaseVersion,
    url: canonical,
    description: meta.description,
    author: {
      "@type": "Person",
      name: "Dongmin Yu",
      url: "https://www.donminzzi.kr",
    },
  }

  return `
    <meta name="description" content="${escapeHtml(meta.description)}" />
    <meta name="robots" content="${robots}" />
    <link rel="canonical" href="${canonical}" />
    <link rel="alternate" hreflang="en" href="${english}" />
    <link rel="alternate" hreflang="ko" href="${korean}" />
    <link rel="alternate" hreflang="x-default" href="${english}" />
    <link rel="alternate" type="text/markdown" href="${urlFor(siteUrl, `${localizedPath}index.md`)}" title="${escapeHtml(meta.title)} Markdown" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="cc-agents-kit" />
    <meta property="og:locale" content="${ogLocale}" />
    <meta property="og:locale:alternate" content="${alternateOgLocale}" />
    <meta property="og:title" content="${escapeHtml(meta.title)}" />
    <meta property="og:description" content="${escapeHtml(meta.description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeHtml(meta.title)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
    <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="twitter:image:alt" content="${escapeHtml(meta.title)}" />
    <script type="application/ld+json">${JSON.stringify(structuredData)}</script>`
}

function documentHtml({
  locale,
  appHtml,
  meta,
  siteUrl,
  release,
  releaseVersion,
  scripts,
  styles,
  imagePath,
}) {
  const headStyles = styles
    .map((stylesheet) => `    <link rel="stylesheet" href="/${stylesheet}" />`)
    .join("\n")
  const headScripts = scripts
    .map((script) => `    <script type="module" src="/${script}"></script>`)
    .join("\n")

  return `<!doctype html>
<html lang="${locale}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>${escapeHtml(meta.title)}</title>${metadata({ locale, meta, siteUrl, release, releaseVersion, imagePath })}
${headStyles}
  </head>
  <body>
    <div id="root">${appHtml}</div>
${headScripts}
  </body>
</html>
`
}

async function writeOutput(relativePath, contents) {
  const outputPath = path.join(outputDirectory, relativePath)
  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, contents)
}

async function exists(relativePath) {
  try {
    await access(path.join(outputDirectory, relativePath))
    return true
  } catch {
    return false
  }
}

async function main() {
  const normalizedSiteUrl = normalizeSiteUrl(
    process.env.SITE_URL ?? localSiteUrl
  )
  const siteUrl = normalizedSiteUrl.origin
  const release = isReleaseSiteUrl(normalizedSiteUrl)
  const manifestEntry = await readManifest()
  const serverEntry = path.join(serverOutputDirectory, "entry-server.js")

  const {
    getMarkdown,
    release: productRelease,
    renderApp,
    site,
    siteMeta,
  } = await import(pathToFileURL(serverEntry).href)
  const styles = manifestEntry.css ?? []
  const scripts = [manifestEntry.file]
  const imagePath = (await exists("og-image.png"))
    ? "/og-image.png"
    : "/og-image.svg"

  for (const locale of locales) {
    const meta = siteMeta[locale]
    const appHtml = renderApp(locale)
    const page = documentHtml({
      locale,
      appHtml,
      meta,
      siteUrl,
      release,
      releaseVersion: productRelease.version,
      scripts,
      styles,
      imagePath,
    })

    await writeOutput(`${locale}/index.html`, page)
    await writeOutput(`${locale}/index.md`, getMarkdown(locale))
  }

  const englishPage = await readFile(
    path.join(outputDirectory, "en", "index.html"),
    "utf8"
  )
  await writeOutput("index.html", englishPage)
  await writeOutput(
    "404.html",
    '<!doctype html><html lang="en"><head><meta charset="UTF-8" /><meta name="robots" content="noindex" /><title>Not found</title></head><body><main><h1>Not found</h1><p><a href="/en/">cc-agents-kit</a></p></main></body></html>\n'
  )
  await writeOutput(
    "robots.txt",
    release
      ? `User-agent: *\nAllow: /\nSitemap: ${urlFor(siteUrl, "/sitemap.xml")}\n`
      : "User-agent: *\nDisallow: /\n"
  )
  await writeOutput(
    "sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${urlFor(siteUrl, "/en/")}</loc></url>\n  <url><loc>${urlFor(siteUrl, "/ko/")}</loc></url>\n</urlset>\n`
  )
  await writeOutput(
    "llms.txt",
    `# ${site.productName}\n\n${siteMeta.en.description}\n\n- English: ${urlFor(siteUrl, "/en/")}\n- Korean: ${urlFor(siteUrl, "/ko/")}\n- Source: ${site.sourceUrl}\n- Owner: ${site.ownerUrl}\n\n## English\n\n${getMarkdown("en")}\n\n## Korean\n\n${getMarkdown("ko")}\n`
  )

  await rm(serverOutputDirectory, { recursive: true, force: true })
  process.stdout.write(`Generated static pages for ${siteUrl}.\n`)
}

await main()
