import { requireReleaseSiteUrl } from "./site-url.mjs"

const siteUrl = requireReleaseSiteUrl(process.env.SITE_URL)
process.stdout.write(`Release SITE_URL accepted: ${siteUrl}\n`)
