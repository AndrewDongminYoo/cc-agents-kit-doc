import { createStaticServer } from "./static-server.mjs"

const port = Number(process.env.PORT ?? 4173)
const host = process.env.HOST ?? "127.0.0.1"
const server = await createStaticServer()

server.listen(port, host, () => {
  process.stdout.write(`Static preview: http://${host}:${port}\n`)
})
