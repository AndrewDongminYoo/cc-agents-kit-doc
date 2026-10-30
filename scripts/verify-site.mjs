import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { access, readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { verifyImageProvenance } from "../tools/generate-og-image.mjs"
import { agentUserAgentPattern, agentUserAgents } from "./agent-user-agents.mjs"
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

function verifyBrandMark(svg) {
  assert.match(
    svg,
    /<path\b/,
    "The brand mark must contain fixed vector outlines."
  )
  assert.doesNotMatch(
    svg,
    /<text\b|font-family|@font-face|<foreignObject\b/,
    "The brand mark must be font-independent."
  )
}

function verifySocialCard(svg, markdown) {
  for (const [description, label] of [
    ["plugins", "PLUGINS"],
    ["workflow skills", "SKILLS"],
    ["defensive hooks", "HOOKS"],
    ["function-hook mods", "MODS"],
  ]) {
    const count = markdown.match(
      new RegExp(`^- (\\d+) ${description}$`, "m")
    )?.[1]
    assert.ok(
      count,
      `The English Markdown is missing its ${description} count.`
    )
    assert.match(
      svg,
      new RegExp(`>\\s*${count.padStart(2, "0")} ${label}\\s*</text>`),
      `OG inventory label ${label} is stale.`
    )
  }
}

function verifyReviewLinks(locale, document) {
  const links = [
    ...document.matchAll(
      /href="(https:\/\/(?:claude\.ai\/new\?|chatgpt\.com\/\?)[^"]+)"/g
    ),
  ].map((match) => new URL(match[1].replaceAll("&amp;", "&")))
  for (const host of ["claude.ai", "chatgpt.com"]) {
    assert.equal(
      links.filter((link) => link.hostname === host).length,
      1,
      `${locale} is missing a unique ${host} review link.`
    )
  }
  const prompts = links.map((link) => link.searchParams.get("q"))
  for (const prompt of prompts) {
    assert.match(
      prompt ?? "",
      /https:\/\/raw\.githubusercontent\.com\/AndrewDongminYoo\/cc-agents-kit\/v\d+\.\d+\.\d+\/README\.md/,
      `${locale} review prompt must name a tagged public README.`
    )
  }
  assert.equal(
    prompts[0],
    prompts[1],
    `${locale} review providers must receive the same prompt.`
  )
  return links
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
  for (const pluginId of [
    "guard-hooks",
    "context-handoff",
    "repo-gate",
    "context-meter",
    "quick-look",
    "markdownlint-triage",
    "security-review-findings",
  ]) {
    assert.ok(
      document.includes(pluginId),
      `${locale} is missing ${pluginId} from the initial HTML.`
    )
  }
  verifyReviewLinks(locale, document)
  requireMatch(
    document,
    /<aside class="page-tools" aria-label="[^"]+">/,
    `${locale} page tools are missing.`
  )
  requireMatch(
    document,
    new RegExp(`<a href="/${locale}/index.md">`),
    `${locale} page tools must link to the localized Markdown document.`
  )
  requireMatch(
    document,
    new RegExp(`aria-label="${locale === "en" ? "Copy page" : "페이지 복사"}"`),
    `${locale} page copy control is missing.`
  )
  const languageSwitch =
    document.match(/<nav class="language-switch"[^>]*>[\s\S]*?<\/nav>/)?.[0] ??
    ""
  assert.ok(languageSwitch, `${locale} language switch is missing.`)
  assert.ok(
    languageSwitch.includes('aria-current="page"'),
    `${locale} current language is not marked.`
  )
  assert.ok(
    languageSwitch.includes(`href="/${otherLocale}/"`),
    `${locale} alternate language link must use a clean locale URL.`
  )
  const brandImages = [
    ...document.matchAll(/<img[^>]*class="brand__mark"[^>]*>/g),
  ]
  assert.equal(
    brandImages.length,
    2,
    `${locale} must use fixed images for both brand marks.`
  )
  assert.ok(
    brandImages.every(([markup]) => markup.includes('src="/favicon.svg"')),
    `${locale} brand marks must share the favicon asset.`
  )
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
  verifyBrandMark(
    await readFile(path.join(outputDirectory, "favicon.svg"), "utf8")
  )
  verifySocialCard(
    await readFile(path.join(outputDirectory, "og-image.svg"), "utf8"),
    enMarkdown
  )
  assert.ok(enMarkdown.trim(), "English Markdown must not be empty.")
  assert.ok(koMarkdown.trim(), "Korean Markdown must not be empty.")
  for (const [locale, html, markdown] of [
    ["en", enHtml, enMarkdown],
    ["ko", koHtml, koMarkdown],
  ]) {
    for (const link of verifyReviewLinks(locale, html)) {
      assert.ok(
        markdown.includes(`](${link.href})`),
        `${locale} Markdown must contain the same review links as HTML.`
      )
    }
  }
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
  assert.match(
    llms,
    /^## When to use this$/m,
    "llms.txt lacks the agent when-to-use section."
  )
  assert.ok(
    llms.length <= 30000,
    "llms.txt must stay a navigation index under 30,000 characters."
  )
  const llmsFull = await readFile(
    path.join(outputDirectory, "llms-full.txt"),
    "utf8"
  )
  assert.ok(
    llmsFull.includes("## English") && llmsFull.includes("## Korean"),
    "llms-full.txt must carry both language bodies."
  )
  const rootMarkdown = await readFile(
    path.join(outputDirectory, "index.md"),
    "utf8"
  )
  assert.equal(
    rootMarkdown,
    enMarkdown,
    "The root Markdown must be the English alias."
  )
  assert.match(
    enMarkdown,
    /^---\ntitle: .+\ndescription: .+\ncanonical: .+\nlast_updated: \d{4}-\d{2}-\d{2}\n---\n/,
    "Served Markdown must open with a frontmatter block."
  )
  assert.match(
    sitemap,
    /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/,
    "sitemap.xml entries must carry lastmod."
  )
  assert.ok(
    enHtml.includes('"sameAs":["https://github.com/AndrewDongminYoo"]'),
    "Structured data must link the author to a second identity."
  )
  assert.match(
    enHtml,
    /"sameAs":\["https:\/\/github\.com\/AndrewDongminYoo\/cc-agents-kit\/tree\/[0-9a-f]{40}"\]/,
    "Structured data must link the product to its source repository."
  )
  assert.match(
    llms,
    /^- \[[^\]]+\]\(https?:\/\/[^)]+\)$/m,
    "llms.txt must use Markdown links for its index entries."
  )
  await access(path.join(outputDirectory, socialImage))
  if (socialImage === "og-image.png") {
    verifyImageProvenance(
      await readFile(path.join(outputDirectory, "og-image.svg")),
      await readFile(path.join(outputDirectory, "og-image.png")),
      JSON.parse(
        await readFile(
          path.join(outputDirectory, "og-image.provenance.json"),
          "utf8"
        )
      )
    )
  }
  await access(path.join(outputDirectory, "favicon.svg"))
  await verifyTrustPages(sitemap)
  await verifyNotFoundDocuments()
  await verifyAgentUserAgentPolicy(robots)
}

// The agent user-agent list is defined once; robots.txt and every user-agent route in vercel.json must use it verbatim.
async function verifyAgentUserAgentPolicy(robots) {
  const vercelConfig = JSON.parse(
    await readFile(path.join(projectRoot, "vercel.json"), "utf8")
  )
  const userAgentRoutes = vercelConfig.routes.filter((route) =>
    (route.has ?? []).some((condition) => condition.key === "user-agent")
  )

  assert.ok(
    userAgentRoutes.length >= 3,
    "vercel.json must route agent user agents to Markdown on the negotiable paths."
  )
  for (const route of userAgentRoutes) {
    const condition = route.has.find((entry) => entry.key === "user-agent")
    assert.equal(
      condition.value?.re,
      agentUserAgentPattern,
      `A user-agent route in vercel.json (${route.src}) does not use the shared agent list.`
    )
    assert.match(
      route.headers?.Vary ?? "",
      /User-Agent/,
      `The user-agent route ${route.src} must vary by User-Agent.`
    )
  }

  // With a filesystem handle in routes, Vercel ignores the top-level headers block, so headers must be routes too.
  assert.equal(
    vercelConfig.headers,
    undefined,
    "vercel.json must not use the top-level headers block; it is ignored once routes carry a filesystem handle."
  )
  const headerRoutes = vercelConfig.routes.filter(
    (route) => route.continue === true && route.headers
  )
  const matches = (route, pathname) => new RegExp(route.src).test(pathname)
  for (const pathname of ["/", "/en/", "/ko/about/", "/en/index.md"]) {
    assert.ok(
      headerRoutes.some(
        (route) =>
          matches(route, pathname) &&
          /User-Agent/.test(route.headers.Vary ?? "")
      ),
      `No continue route sets Vary for ${pathname}.`
    )
  }
  assert.ok(
    headerRoutes.some(
      (route) =>
        matches(route, "/assets/index-abc123.js") &&
        /immutable/.test(route.headers["Cache-Control"] ?? "")
    ),
    "No continue route marks hashed assets immutable."
  )

  if (release) {
    for (const userAgent of agentUserAgents) {
      assert.ok(
        robots.includes(`User-agent: ${userAgent}\n`),
        `robots.txt lacks the ${userAgent} group.`
      )
    }
  }
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

async function verifyNotFoundDocuments() {
  const html = await readFile(path.join(outputDirectory, "404.html"), "utf8")
  const markdown = await readFile(path.join(outputDirectory, "404.md"), "utf8")

  for (const href of ["/en/", "/ko/", "/sitemap.xml", "/llms.txt"]) {
    assert.ok(
      html.includes(`href="${href}"`),
      `404.html lacks the recovery link to ${href}.`
    )
    assert.ok(
      markdown.includes(`${expectedOrigin}${href}`),
      `404.md lacks the recovery link to ${href}.`
    )
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
    const agentRequest = await fetch(`${baseUrl}/ko/`, {
      headers: {
        accept: "text/html,*/*;q=0.8",
        "user-agent": "Mozilla/5.0 (compatible; GPTBot/1.0)",
      },
    })
    const missing = await fetch(`${baseUrl}/not-a-route`)
    const missingMarkdown = await fetch(`${baseUrl}/not-a-route`, {
      headers: { accept: "text/markdown" },
    })
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
    assert.match(
      markdown.headers.get("vary") ?? "",
      /\bAccept\b/,
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
    assert.match(
      agentRequest.headers.get("content-type") ?? "",
      /^text\/markdown/,
      "An agent user agent must receive Markdown without asking for it."
    )
    assert.match(
      agentRequest.headers.get("vary") ?? "",
      /User-Agent/,
      "Agent-selected responses must vary by User-Agent."
    )
    assert.equal(
      missing.status,
      404,
      "Unknown preview routes must return HTTP 404."
    )
    assert.match(
      await missing.text(),
      /href="\/llms\.txt"/,
      "The 404 body must link agents to llms.txt."
    )
    assert.equal(
      missingMarkdown.status,
      404,
      "A Markdown 404 must keep the 404 status."
    )
    assert.match(
      missingMarkdown.headers.get("content-type") ?? "",
      /^text\/markdown/,
      "A client preferring Markdown must receive the Markdown 404."
    )
    assert.match(
      await missingMarkdown.text(),
      /^# Not found/,
      "The Markdown 404 returned the wrong document."
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
  const socialSvg = await readFile(
    path.join(outputDirectory, "og-image.svg"),
    "utf8"
  )
  const markdown = await readFile(
    path.join(outputDirectory, "en/index.md"),
    "utf8"
  )
  const staleSocialSvg = socialSvg.replace(/\d+ PLUGINS/, "STALE PLUGINS")
  assert.notEqual(
    staleSocialSvg,
    socialSvg,
    "The stale OG fixture must change a label."
  )
  assert.throws(
    () => verifySocialCard(staleSocialSvg, markdown),
    /OG inventory label PLUGINS is stale/,
    "The validator must reject stale social-image inventory."
  )
  const brandMark = await readFile(
    path.join(outputDirectory, "favicon.svg"),
    "utf8"
  )
  assert.throws(
    () => verifyBrandMark(brandMark.replace("</svg>", "<text>cc</text></svg>")),
    /font-independent/,
    "The validator must reject font-dependent brand lettering."
  )
  const document = await readFile(
    path.join(outputDirectory, "en", "index.html"),
    "utf8"
  )
  assert.throws(
    () =>
      verifyDocument(
        "en",
        document.replace(
          'class="language-switch"',
          'class="missing-language-switch"'
        )
      ),
    /language switch is missing/,
    "The validator must reject a missing language switch."
  )
  assert.throws(
    () =>
      verifyDocument(
        "en",
        document.replace('aria-current="page"', 'aria-current="false"')
      ),
    /current language is not marked/,
    "The validator must reject a missing current-language indicator."
  )
  assert.throws(
    () =>
      verifyDocument(
        "en",
        document.replace('href="/ko/"', 'href="/ko/#review"')
      ),
    /alternate language link must use a clean locale URL/,
    "The validator must reject a stale fragment in the language link."
  )
  assert.throws(
    () =>
      verifyDocument(
        "en",
        document.replace('class="page-tools"', 'class="missing-tools"')
      ),
    /page tools are missing/,
    "The validator must reject missing page tools."
  )
  assert.throws(
    () =>
      verifyDocument(
        "en",
        document.replaceAll(
          "https://claude.ai/new?",
          "https://example.invalid/new?"
        )
      ),
    /missing a unique claude.ai review link/,
    "The validator must reject a missing review provider."
  )
  assert.throws(
    () =>
      verifyDocument(
        "en",
        document.replace(/(https:\/\/claude\.ai\/new\?q=)[^"]+/, "$1broken")
      ),
    /review prompt must name a tagged public README/,
    "The validator must reject a broken encoded review prompt."
  )
  assert.throws(
    () => verifyDocument("en", document.replaceAll("quick-look", "")),
    /missing quick-look/,
    "The validator must reject missing mod content."
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
