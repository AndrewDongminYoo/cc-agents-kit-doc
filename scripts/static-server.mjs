import { createReadStream } from "node:fs"
import { realpath, stat } from "node:fs/promises"
import http from "node:http"
import path from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
)
const outputDirectory = path.join(projectRoot, "dist")
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
}

function qualityFor(accept, mediaType) {
  const [type] = mediaType.split("/")
  const ranges = accept.split(",").map((value) => {
    const [range, ...parameters] = value.trim().toLowerCase().split(";")
    const quality = parameters.find((parameter) => parameter.startsWith("q="))
    const parsedQuality = quality ? Number.parseFloat(quality.slice(2)) : 1

    return {
      quality:
        Number.isFinite(parsedQuality) &&
        parsedQuality >= 0 &&
        parsedQuality <= 1
          ? parsedQuality
          : 0,
      range,
    }
  })
  const exact = ranges.filter(({ range }) => range === mediaType)

  if (exact.length > 0) {
    return Math.max(...exact.map(({ quality }) => quality))
  }

  const typeWildcard = ranges.filter(({ range }) => range === `${type}/*`)

  if (typeWildcard.length > 0) {
    return Math.max(...typeWildcard.map(({ quality }) => quality))
  }

  const wildcard = ranges.filter(({ range }) => range === "*/*")
  return wildcard.length > 0
    ? Math.max(...wildcard.map(({ quality }) => quality))
    : 0
}

function wantsMarkdown(accept = "") {
  const markdownQuality = qualityFor(accept, "text/markdown")
  const htmlQuality = qualityFor(accept, "text/html")

  return markdownQuality > 0 && markdownQuality > htmlQuality
}

function routeFor(pathname, markdown) {
  if (pathname === "/") {
    return markdown ? "en/index.md" : "index.html"
  }

  if (pathname === "/en" || pathname === "/en/") {
    return markdown ? "en/index.md" : "en/index.html"
  }

  if (pathname === "/ko" || pathname === "/ko/") {
    return markdown ? "ko/index.md" : "ko/index.html"
  }

  return pathname.slice(1)
}

function isNegotiableRoute(pathname) {
  return ["/", "/en", "/en/", "/ko", "/ko/"].includes(pathname)
}

async function sendNotFound(response, sendBody) {
  const fallback = path.join(outputDirectory, "404.html")

  response.writeHead(404, {
    "content-type": "text/html; charset=utf-8",
    "cache-control": "no-store",
  })

  if (!sendBody) {
    response.end()
    return
  }

  const stream = createReadStream(fallback)
  stream.on("error", () => response.end("Not found\n"))
  stream.pipe(response)
}

export async function createStaticServer() {
  const resolvedOutputDirectory = await realpath(outputDirectory)

  return http.createServer(async (request, response) => {
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, {
        allow: "GET, HEAD",
        "content-type": "text/plain; charset=utf-8",
      })
      response.end("Method not allowed\n")
      return
    }

    const origin = `http://${request.headers.host ?? "localhost"}`
    let pathname

    try {
      pathname = decodeURIComponent(
        new URL(request.url ?? "/", origin).pathname
      )
    } catch {
      response.writeHead(400, { "content-type": "text/plain; charset=utf-8" })
      response.end("Bad request\n")
      return
    }

    const relativePath = routeFor(
      pathname,
      wantsMarkdown(request.headers.accept)
    )
    const candidatePath = path.resolve(resolvedOutputDirectory, relativePath)

    if (
      !candidatePath.startsWith(`${resolvedOutputDirectory}${path.sep}`) ||
      !(await stat(candidatePath)
        .then((entry) => entry.isFile())
        .catch(() => false))
    ) {
      await sendNotFound(response, request.method === "GET")
      return
    }

    response.writeHead(200, {
      "cache-control": "no-store",
      "content-type":
        contentTypes[path.extname(candidatePath)] ?? "application/octet-stream",
      ...(isNegotiableRoute(pathname) ? { vary: "Accept" } : {}),
    })

    if (request.method === "HEAD") {
      response.end()
      return
    }

    const stream = createReadStream(candidatePath)
    stream.on("error", () => response.destroy())
    stream.pipe(response)
  })
}
