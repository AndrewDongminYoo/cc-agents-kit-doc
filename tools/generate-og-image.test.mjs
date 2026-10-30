import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import test from "node:test"

import {
  readInventory,
  renderSvg,
  verifyImageProvenance,
  verifyPngDimensions,
} from "./generate-og-image.mjs"

const template = await readFile(
  new URL("./og-image.svg.template", import.meta.url),
  "utf8"
)
const mark = await readFile(
  new URL("../public/favicon.svg", import.meta.url),
  "utf8"
)
const inventory = { hookCount: 4, modCount: 3, pluginCount: 7, skillCount: 17 }

test("OG inventory comes from inputs rather than stale labels in the layout", () => {
  const svg = renderSvg(template, mark, inventory)
  for (const label of ["07 PLUGINS", "17 SKILLS", "04 HOOKS", "03 MODS"]) {
    assert.ok(svg.includes(label), label)
  }
  assert.equal(
    svg,
    renderSvg(template, mark, inventory),
    "Identical inputs must reproduce the same SVG."
  )
})

test("font-dependent and missing brand outlines are rejected", () => {
  assert.throws(
    () =>
      renderSvg(
        template,
        mark.replace("</svg>", "<text>cc</text></svg>"),
        inventory
      ),
    /fixed outlines/
  )
  assert.throws(
    () =>
      renderSvg(
        template,
        '<svg><circle cx="32" cy="32" r="32" /></svg>',
        inventory
      ),
    /lettering is missing/
  )
})

test("unknown and unresolved template fields are rejected", () => {
  assert.throws(
    () => renderSvg("${unknown}", mark, inventory),
    /Unknown OG template field/
  )
  assert.throws(
    () => renderSvg("${UPPERCASE}", mark, inventory),
    /left unresolved/
  )
})

test("the committed SVG matches the current template, inventory, and mark", async () => {
  const actual = await readFile(
    new URL("../public/og-image.svg", import.meta.url),
    "utf8"
  )
  assert.ok(
    actual === renderSvg(template, mark, await readInventory()),
    "Run node tools/generate-og-image.mjs to refresh the social image."
  )
})

test("PNG dimension checks reject malformed and incorrectly sized exports", async () => {
  const png = await readFile(new URL("../public/og-image.png", import.meta.url))
  verifyPngDimensions(png)
  assert.throws(() => verifyPngDimensions(Buffer.alloc(0)), /incomplete/)
  const wrongSignature = Buffer.from(png)
  wrongSignature[0] = 0
  assert.throws(() => verifyPngDimensions(wrongSignature), /signature/)
  const wrongWidth = Buffer.from(png)
  wrongWidth.writeUInt32BE(2400, 16)
  assert.throws(() => verifyPngDimensions(wrongWidth), /width must be 1200/)
  const wrongHeight = Buffer.from(png)
  wrongHeight.writeUInt32BE(1260, 20)
  assert.throws(() => verifyPngDimensions(wrongHeight), /height must be 630/)
})

test("PNG provenance rejects SVG-only refreshes and replaced image bytes", async () => {
  const svg = await readFile(new URL("../public/og-image.svg", import.meta.url))
  const png = await readFile(new URL("../public/og-image.png", import.meta.url))
  const provenance = {
    pngSha256: createHash("sha256").update(png).digest("hex"),
    schemaVersion: 1,
    svgSha256: createHash("sha256").update(svg).digest("hex"),
  }
  verifyImageProvenance(svg, png, provenance)
  const changedSvg = `${svg}\n<!-- SVG-only change -->`
  verifyPngDimensions(png)
  assert.throws(
    () => verifyImageProvenance(changedSvg, png, provenance),
    /SVG changed after its PNG export/
  )
  const changedPng = Buffer.from(png)
  changedPng[changedPng.length - 1] ^= 1
  verifyPngDimensions(changedPng)
  assert.throws(
    () => verifyImageProvenance(svg, changedPng, provenance),
    /PNG does not match/
  )
})

test("the committed images match the provenance from the full export", async () => {
  const svg = await readFile(new URL("../public/og-image.svg", import.meta.url))
  const png = await readFile(new URL("../public/og-image.png", import.meta.url))
  const provenance = JSON.parse(
    await readFile(
      new URL("../public/og-image.provenance.json", import.meta.url),
      "utf8"
    )
  )
  verifyImageProvenance(svg, png, provenance)
})
