import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { access, readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { isReleaseSiteUrl, normalizeSiteUrl } from "./site-url.mjs"
import { createStaticServer } from "./static-server.mjs"

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
)
const outputDirectory = path.join(projectRoot, "dist")
const localSiteUrl = "http://localhost:4173"
const normalizedSiteUrl = normalizeSiteUrl(process.env.SITE_URL ?? localSiteUrl)
const expectedOrigin = normalizedSiteUrl.origin
const release = isReleaseSiteUrl(normalizedSiteUrl)

function requireMatch(document, expression, message) {
  assert.match(document, expression, message)
}

function verifyDocument(locale, document) {
  const canonicalPath = `/${locale}/`
  const otherLocale = locale === "en" ? "ko" : "en"

  requireMatch(
    document,
    new RegExp(`<html lang="${locale}">`),
    `${locale} language is missing.`
  )
  requireMatch(
    document,
    /<div id="root">\s*<[^/]/,
    `${locale} has no initial application HTML.`
  )
  assert.ok(
    document.includes(
      `<link rel="canonical" href="${expectedOrigin}${canonicalPath}"`
    ),
    `${locale} canonical URL is missing.`
  )
  assert.ok(
    document.includes(
      `<link rel="alternate" hreflang="${otherLocale}" href="${expectedOrigin}/${otherLocale}/"`
    ),
    `${locale} alternate locale URL is missing.`
  )
  assert.ok(
    document.includes(
      `<link rel="alternate" type="text/markdown" href="${expectedOrigin}${canonicalPath}index.md"`
    ),
    `${locale} Markdown alternative is missing.`
  )
  requireMatch(
    document,
    /<meta property="og:locale" content="(?:en_US|ko_KR)"/,
    `${locale} Open Graph locale is missing.`
  )
  requireMatch(
    document,
    /<script type="application\/ld\+json">/,
    `${locale} structured data is missing.`
  )
  requireMatch(
    document,
    new RegExp(
      `<meta name="robots" content="${release ? "index,follow" : "noindex,nofollow"}"`
    ),
    `${locale} robots policy is incorrect.`
  )
  for (const pluginId of ["guard-hooks", "context-handoff", "repo-gate"]) {
    assert.ok(
      document.includes(pluginId),
      `${locale} is missing ${pluginId} from the initial HTML.`
    )
  }
  for (const modifier of [
    "section-intro--inverse",
    "copy-block--inverse",
    "copy-block--multiline",
  ]) {
    const base = modifier.split("--")[0]
    requireMatch(
      document,
      new RegExp(`class="${base} [^"]*${modifier}(?: |")`),
      `${locale} is missing separate CSS classes for ${modifier}.`
    )
  }
}

async function verifyStaticOutput() {
  const enHtml = await readFile(
    path.join(outputDirectory, "en", "index.html"),
    "utf8"
  )
  const koHtml = await readFile(
    path.join(outputDirectory, "ko", "index.html"),
    "utf8"
  )
  const rootHtml = await readFile(
    path.join(outputDirectory, "index.html"),
    "utf8"
  )
  const enMarkdown = await readFile(
    path.join(outputDirectory, "en", "index.md"),
    "utf8"
  )
  const koMarkdown = await readFile(
    path.join(outputDirectory, "ko", "index.md"),
    "utf8"
  )
  const robots = await readFile(
    path.join(outputDirectory, "robots.txt"),
    "utf8"
  )
  const sitemap = await readFile(
    path.join(outputDirectory, "sitemap.xml"),
    "utf8"
  )
  const llms = await readFile(path.join(outputDirectory, "llms.txt"), "utf8")
  const socialImage = enHtml.includes("/og-image.png")
    ? "og-image.png"
    : "og-image.svg"

  verifyDocument("en", enHtml)
  verifyDocument("ko", koHtml)
  assert.equal(rootHtml, enHtml, "The root document must be the English alias.")
  assert.ok(
    enHtml.includes(
      '<link rel="icon" type="image/svg+xml" href="/favicon.svg"'
    ),
    "The English document lacks the favicon link."
  )
  assert.ok(enMarkdown.trim(), "English Markdown must not be empty.")
  assert.ok(koMarkdown.trim(), "Korean Markdown must not be empty.")
  assert.match(
    robots,
    release ? /Allow: \// : /Disallow: \//,
    "robots.txt has the wrong policy."
  )
  assert.ok(
    sitemap.includes(`${expectedOrigin}/en/`),
    "sitemap.xml lacks the English URL."
  )
  assert.ok(
    sitemap.includes(`${expectedOrigin}/ko/`),
    "sitemap.xml lacks the Korean URL."
  )
  assert.ok(
    llms.includes(`${expectedOrigin}/en/`),
    "llms.txt lacks the English URL."
  )
  await access(path.join(outputDirectory, socialImage))
  await access(path.join(outputDirectory, "favicon.svg"))
  await verifyTrustPages(sitemap)
}

// Trust pages exist in both locales, carry the configured origin, and hold enough content to count as real pages.
async function verifyTrustPages(sitemap) {
  const minimumCharacters = 500

  for (const locale of ["en", "ko"]) {
    for (const pageId of ["about", "contact", "privacy"]) {
      const html = await readFile(
        path.join(outputDirectory, locale, pageId, "index.html"),
        "utf8"
      )
      const markdown = await readFile(
        path.join(outputDirectory, locale, pageId, "index.md"),
        "utf8"
      )
      const pagePath = `/${locale}/${pageId}/`

      requireMatch(
        html,
        new RegExp(`<html lang="${locale}">`),
        `${pagePath} language is missing.`
      )
      assert.ok(
        html.includes(
          `<link rel="canonical" href="${expectedOrigin}${pagePath}"`
        ),
        `${pagePath} canonical URL is missing.`
      )
      assert.ok(
        html.includes(
          `<link rel="alternate" type="text/markdown" href="${expectedOrigin}${pagePath}index.md"`
        ),
        `${pagePath} Markdown alternative is missing.`
      )
      assert.ok(
        html.replace(/<[^>]+>/g, "").length >= minimumCharacters,
        `${pagePath} has fewer than ${minimumCharacters} characters of content.`
      )
      assert.ok(
        markdown.length >= minimumCharacters,
        `${pagePath}index.md has fewer than ${minimumCharacters} characters.`
      )
      assert.ok(
        sitemap.includes(`${expectedOrigin}${pagePath}`),
        `sitemap.xml lacks ${pagePath}.`
      )
    }
  }
}

async function verifyPreviewBehavior() {
  const server = await createStaticServer()

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
  const address = server.address()

  if (typeof address === "string" || address === null) {
    throw new Error("The preview server did not provide a TCP address.")
  }

  const baseUrl = `http://127.0.0.1:${address.port}`

  try {
    const english = await fetch(`${baseUrl}/en/`)
    const markdown = await fetch(`${baseUrl}/ko/`, {
      headers: { accept: "text/markdown" },
    })
    const markdownPreferred = await fetch(`${baseUrl}/en/`, {
      headers: { accept: "text/markdown;q=1, text/html;q=0" },
    })
    const trustPage = await fetch(`${baseUrl}/ko/privacy/`)
    const trustMarkdown = await fetch(`${baseUrl}/en/about`, {
      headers: { accept: "text/markdown" },
    })
    const missing = await fetch(`${baseUrl}/not-a-route`)
    const missingHead = await fetch(`${baseUrl}/not-a-route`, {
      method: "HEAD",
    })
    const rejectedMethod = await fetch(`${baseUrl}/en/`, { method: "POST" })

    assert.equal(
      english.status,
      200,
      "The English static route must return HTTP 200."
    )
    assert.match(
      await english.text(),
      /<html lang="en">/,
      "The English route returned the wrong document."
    )
    assert.equal(
      markdown.status,
      200,
      "Markdown negotiation must return HTTP 200."
    )
    assert.match(
      markdown.headers.get("content-type") ?? "",
      /^text\/markdown/,
      "Markdown negotiation returned the wrong type."
    )
    assert.equal(
      markdown.headers.get("vary"),
      "Accept",
      "Markdown negotiation must vary by Accept."
    )
    assert.ok(
      (await markdown.text()).trim(),
      "Markdown negotiation returned an empty document."
    )
    assert.match(
      markdownPreferred.headers.get("content-type") ?? "",
      /^text\/markdown/,
      "Markdown must win when HTML is unacceptable."
    )
    assert.equal(
      trustPage.status,
      200,
      "Trust pages must be served from their directory route."
    )
    assert.match(
      await trustPage.text(),
      /<html lang="ko">/,
      "The Korean trust page returned the wrong document."
    )
    assert.match(
      trustMarkdown.headers.get("content-type") ?? "",
      /^text\/markdown/,
      "Trust pages must negotiate Markdown."
    )
    assert.equal(
      missing.status,
      404,
      "Unknown preview routes must return HTTP 404."
    )
    assert.equal(
      missingHead.status,
      404,
      "Unknown HEAD routes must return HTTP 404."
    )
    assert.equal(
      await missingHead.text(),
      "",
      "HEAD responses must not include a body."
    )
    assert.equal(
      rejectedMethod.status,
      405,
      "Preview must reject unsupported methods."
    )
    assert.equal(
      rejectedMethod.headers.get("allow"),
      "GET, HEAD",
      "Preview must declare supported methods."
    )
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))
    )
  }
}

async function verifyNegativeFixtures() {
  const document = await readFile(
    path.join(outputDirectory, "en", "index.html"),
    "utf8"
  )
  assert.throws(
    () =>
      verifyDocument(
        "en",
        document.replaceAll(
          "section-intro section-intro--inverse",
          "section-introsection-intro--inverse"
        )
      ),
    /missing separate CSS classes/,
    "The validator must reject merged CSS class names."
  )

  assert.throws(
    () => verifyDocument("en", document.replaceAll("guard-hooks", "")),
    /missing guard-hooks/,
    "The validator must reject missing product content."
  )
  assert.throws(
    () =>
      verifyDocument(
        "en",
        document.replace(
          /<div id="root">[\s\S]*?<\/div>/,
          '<div id="root"></div>'
        )
      ),
    /initial application HTML/,
    "The validator must reject missing initial HTML."
  )
  assert.throws(
    () =>
      verifyDocument("en", document.replace(/<link rel="canonical"[^>]+>/, "")),
    /canonical URL/,
    "The validator must reject a missing canonical URL."
  )
  assert.throws(
    () =>
      verifyDocument("en", document.replace('hreflang="ko"', 'hreflang="fr"')),
    /alternate locale URL/,
    "The validator must reject a missing alternate locale URL."
  )
}

function verifyReleaseUrlValidation() {
  const scriptPath = path.join(
    projectRoot,
    "scripts",
    "require-release-site-url.mjs"
  )
  const invalidValues = [
    undefined,
    "http://example.com",
    "https://localhost",
    "https://127.0.0.1",
    "https://user:pass@example.com",
    "https://example.com/path",
    "https://192.168.1.10",
    "https://[fc00::1]",
  ]

  for (const value of invalidValues) {
    const result = spawnSync(process.execPath, [scriptPath], {
      env: { ...process.env, SITE_URL: value },
      encoding: "utf8",
    })
    assert.notEqual(result.status, 0, `Release URL ${String(value)} must fail.`)
  }

  const valid = spawnSync(process.execPath, [scriptPath], {
    env: { ...process.env, SITE_URL: "https://example.com" },
    encoding: "utf8",
  })
  assert.equal(
    valid.status,
    0,
    "A public HTTPS origin must pass the release URL check."
  )

  const trailingSlash = spawnSync(process.execPath, [scriptPath], {
    env: { ...process.env, SITE_URL: "https://example.com/" },
    encoding: "utf8",
  })
  assert.equal(
    trailingSlash.status,
    0,
    "A public HTTPS origin with a trailing slash must pass the release URL check."
  )
}

await verifyStaticOutput()
await verifyPreviewBehavior()
verifyReleaseUrlValidation()

if (process.argv.includes("--self-test")) {
  await verifyNegativeFixtures()
  process.stdout.write(
    "Site validator negative fixtures rejected merged CSS classes and missing product content, HTML, canonical, and locale metadata.\n"
  )
}

process.stdout.write("Static site output and preview behavior verified.\n")
