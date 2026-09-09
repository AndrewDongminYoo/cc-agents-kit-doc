import { isIP } from "node:net"

export function normalizeSiteUrl(value) {
  let parsed

  try {
    parsed = new URL(value)
  } catch {
    throw new Error("SITE_URL must be an absolute HTTP or HTTPS URL.")
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("SITE_URL must use HTTP or HTTPS.")
  }

  if (parsed.pathname !== "/" || parsed.search || parsed.hash) {
    throw new Error(
      "SITE_URL must be an origin without a path, query, or fragment."
    )
  }

  if (parsed.username || parsed.password) {
    throw new Error("SITE_URL must not include credentials.")
  }

  return parsed
}

export function isReleaseSiteUrl(siteUrl) {
  const hostname = siteUrl.hostname.toLowerCase().replace(/^\[|\]$/g, "")

  return (
    siteUrl.protocol === "https:" &&
    isIP(hostname) === 0 &&
    hostname !== "localhost" &&
    !hostname.endsWith(".localhost") &&
    !hostname.endsWith(".local")
  )
}

export function requireReleaseSiteUrl(value) {
  if (!value) {
    throw new Error("SITE_URL is required for a release build.")
  }

  const siteUrl = normalizeSiteUrl(value)

  if (!isReleaseSiteUrl(siteUrl)) {
    throw new Error(
      "SITE_URL must be a public HTTPS DNS origin for a release build."
    )
  }

  return siteUrl.origin
}
