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

// Served Markdown opens with a frontmatter block so agents get title, canonical, and freshness without parsing the body.
function withFrontmatter({ title, description, canonical, lastUpdated }, body) {
  return `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\ncanonical: ${canonical}\nlast_updated: ${lastUpdated}\n---\n\n${body}`
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
  sourceUrl,
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
    sameAs: [sourceUrl],
    author: {
      "@type": "Person",
      name: "Dongmin Yu",
      url: "https://www.donminzzi.kr",
      sameAs: ["https://github.com/AndrewDongminYoo"],
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
  sourceUrl,
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
    <title>${escapeHtml(meta.title)}</title>${metadata({ locale, meta, siteUrl, sourceUrl, release, releaseVersion, imagePath })}
${headStyles}
  </head>
  <body>
    <div id="root">${appHtml}</div>
${headScripts}
  </body>
</html>
`
}

// Trust pages share the site stylesheet but not the React bundle; their content is static prose.
function trustPageHtml({ locale, page, siteUrl, release, styles, imagePath }) {
  const pagePath = `/${locale}/${page.id}/`
  const otherLocale = locale === "en" ? "ko" : "en"
  const robots = release ? "index,follow" : "noindex,nofollow"
  const headStyles = styles
    .map((stylesheet) => `    <link rel="stylesheet" href="/${stylesheet}" />`)
    .join("\n")
  const sections = page.sections
    .map(
      (section) =>
        `      <section>\n        <h2>${escapeHtml(section.heading)}</h2>\n${section.paragraphs
          .map((paragraph) => `        <p>${escapeHtml(paragraph)}</p>`)
          .join("\n")}\n      </section>`
    )
    .join("\n")

  return `<!doctype html>
<html lang="${locale}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>${escapeHtml(page.title)} · cc-agents-kit</title>
    <meta name="description" content="${escapeHtml(page.description)}" />
    <meta name="robots" content="${robots}" />
    <link rel="canonical" href="${urlFor(siteUrl, pagePath)}" />
    <link rel="alternate" hreflang="en" href="${urlFor(siteUrl, `/en/${page.id}/`)}" />
    <link rel="alternate" hreflang="ko" href="${urlFor(siteUrl, `/ko/${page.id}/`)}" />
    <link rel="alternate" hreflang="x-default" href="${urlFor(siteUrl, `/en/${page.id}/`)}" />
    <link rel="alternate" type="text/markdown" href="${urlFor(siteUrl, `${pagePath}index.md`)}" title="${escapeHtml(page.title)} Markdown" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="cc-agents-kit" />
    <meta property="og:title" content="${escapeHtml(page.title)}" />
    <meta property="og:description" content="${escapeHtml(page.description)}" />
    <meta property="og:url" content="${urlFor(siteUrl, pagePath)}" />
    <meta property="og:image" content="${urlFor(siteUrl, imagePath)}" />
${headStyles}
  </head>
  <body>
    <div class="site-shell">
      <main id="main-content" class="prose-page">
        <p class="eyebrow"><a href="/${locale}/">cc-agents-kit</a></p>
        <h1>${escapeHtml(page.title)}</h1>
        <p class="prose-page__lead">${escapeHtml(page.description)}</p>
${sections}
        <p class="prose-page__alternate"><a href="/${otherLocale}/${page.id}/" hreflang="${otherLocale}">${otherLocale === "ko" ? "한국어" : "English"}</a></p>
      </main>
    </div>
  </body>
</html>
`
}

function notFoundHtml(siteUrl) {
  const links = [
    ["/en/", "English"],
    ["/ko/", "한국어"],
    ["/sitemap.xml", "sitemap.xml"],
    ["/llms.txt", "llms.txt"],
  ]
    .map(([href, label]) => `<li><a href="${href}">${label}</a></li>`)
    .join("")
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><meta name="robots" content="noindex" /><title>Not found · cc-agents-kit</title></head><body><main><h1>Not found</h1><p>There is no page at this address on ${escapeHtml(siteUrl)}. The site has two language roots and machine-readable indexes:</p><ul>${links}</ul></main></body></html>\n`
}

function notFoundMarkdown(siteUrl) {
  return `# Not found\n\nThere is no page at this address on ${siteUrl}.\n\n- English: ${urlFor(siteUrl, "/en/")}\n- Korean: ${urlFor(siteUrl, "/ko/")}\n- Sitemap: ${urlFor(siteUrl, "/sitemap.xml")}\n- Agent index: ${urlFor(siteUrl, "/llms.txt")}\n`
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
    getAgentGuidance,
    getMarkdown,
    getPageMarkdown,
    getPages,
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
  const buildDate = new Date().toISOString().slice(0, 10)

  for (const locale of locales) {
    const meta = siteMeta[locale]
    const appHtml = renderApp(locale)
    const page = documentHtml({
      locale,
      appHtml,
      meta,
      siteUrl,
      sourceUrl: site.sourceUrl,
      release,
      releaseVersion: productRelease.version,
      scripts,
      styles,
      imagePath,
    })

    await writeOutput(`${locale}/index.html`, page)
    await writeOutput(
      `${locale}/index.md`,
      withFrontmatter(
        {
          title: meta.title,
          description: meta.description,
          canonical: urlFor(siteUrl, `/${locale}/`),
          lastUpdated: buildDate,
        },
        getMarkdown(locale)
      )
    )

    for (const trustPage of getPages(locale)) {
      await writeOutput(
        `${locale}/${trustPage.id}/index.html`,
        trustPageHtml({
          locale,
          page: trustPage,
          siteUrl,
          release,
          styles,
          imagePath,
        })
      )
      await writeOutput(
        `${locale}/${trustPage.id}/index.md`,
        withFrontmatter(
          {
            title: trustPage.title,
            description: trustPage.description,
            canonical: urlFor(siteUrl, `/${locale}/${trustPage.id}/`),
            lastUpdated: buildDate,
          },
          getPageMarkdown(trustPage)
        )
      )
    }
  }

  const englishPage = await readFile(
    path.join(outputDirectory, "en", "index.html"),
    "utf8"
  )
  const englishMarkdown = await readFile(
    path.join(outputDirectory, "en", "index.md"),
    "utf8"
  )
  await writeOutput("index.html", englishPage)
  await writeOutput("index.md", englishMarkdown)
  await writeOutput("404.html", notFoundHtml(siteUrl))
  await writeOutput("404.md", notFoundMarkdown(siteUrl))
  await writeOutput(
    "robots.txt",
    release
      ? `User-agent: *\nAllow: /\nSitemap: ${urlFor(siteUrl, "/sitemap.xml")}\n`
      : "User-agent: *\nDisallow: /\n"
  )
  const sitemapPaths = locales.flatMap((locale) => [
    `/${locale}/`,
    ...getPages(locale).map((trustPage) => `/${locale}/${trustPage.id}/`),
  ])
  await writeOutput(
    "sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapPaths
      .map(
        (pathname) =>
          `  <url><loc>${urlFor(siteUrl, pathname)}</loc><lastmod>${buildDate}</lastmod></url>`
      )
      .join("\n")}\n</urlset>\n`
  )
  const trustLinks = locales
    .flatMap((locale) =>
      getPages(locale).map(
        (trustPage) =>
          `- [${trustPage.title}](${urlFor(siteUrl, `/${locale}/${trustPage.id}/`)})`
      )
    )
    .join("\n")
  // llms.txt stays a navigation index under the 30,000-character guideline; the full content lives in llms-full.txt.
  const llmsIndex = `# ${site.productName}\n\n${siteMeta.en.description}\n\n- [English](${urlFor(siteUrl, "/en/")})\n- [Korean](${urlFor(siteUrl, "/ko/")})\n- [English Markdown](${urlFor(siteUrl, "/en/index.md")})\n- [Korean Markdown](${urlFor(siteUrl, "/ko/index.md")})\n- [Full content in both languages](${urlFor(siteUrl, "/llms-full.txt")})\n- [Source at the pinned revision](${site.sourceUrl})\n- [Owner](${site.ownerUrl})\n${trustLinks}\n\n${getAgentGuidance("en")}\n\n${getAgentGuidance("ko")}\n`
  await writeOutput("llms.txt", llmsIndex)
  await writeOutput(
    "llms-full.txt",
    `${llmsIndex}\n## English\n\n${getMarkdown("en")}\n\n## Korean\n\n${getMarkdown("ko")}\n`
  )

  await rm(serverOutputDirectory, { recursive: true, force: true })
  process.stdout.write(`Generated static pages for ${siteUrl}.\n`)
}

await main()
