import { expect, test } from "@playwright/test"

for (const locale of ["en", "ko"] as const) {
  const otherLocale = locale === "en" ? "ko" : "en"
  const pageCopyLabel = locale === "en" ? "Copy page" : "페이지 복사"

  test(`${locale}: header language change ignores a stale review fragment`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/`)
    await page.locator('.page-tools a[href="#review"]').click()
    await expect(page.locator("#review")).toHaveAttribute("open", "")
    await expect(page).toHaveURL(new RegExp(`/${locale}/#review$`))
    await page.evaluate(() => window.scrollTo({ behavior: "instant", top: 0 }))
    await page.locator(".language-switch a").click()
    await expect(page).toHaveURL(`/${otherLocale}/`)
    await expect(page.locator("html")).toHaveAttribute("lang", otherLocale)
    await expect(
      page.locator('.language-switch [aria-current="page"]')
    ).toHaveText(otherLocale === "en" ? "English" : "한국어")
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  })

  test(`${locale}: page copying handles clipboard success and failure`, async ({
    page,
    request,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (text: string) => {
            Reflect.set(window, "copiedPage", text)
          },
        },
      })
    })
    await page.goto(`/${locale}/`)
    const copyButton = page.getByRole("button", {
      exact: true,
      name: pageCopyLabel,
    })
    await copyButton.click()
    await expect
      .poll(() => page.evaluate(() => Reflect.get(window, "copiedPage")))
      .toContain("# cc-agents-kit")
    const copied = await page.evaluate(
      () => Reflect.get(window, "copiedPage") as string
    )
    const markdown = await (await request.get(`/${locale}/index.md`)).text()
    expect(markdown).toContain(copied)

    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async () => {
            throw new Error("Synthetic clipboard denial")
          },
        },
      })
    })
    await copyButton.click()
    const fallback = page.locator(".page-tools textarea")
    await expect(fallback).toBeVisible()
    await expect(fallback).toBeFocused()
    await expect(fallback).toHaveValue(copied)
    expect(
      await fallback.evaluate((element) => {
        const node = element as HTMLTextAreaElement
        return { end: node.selectionEnd, start: node.selectionStart }
      })
    ).toEqual({ end: copied.length, start: 0 })
  })

  test(`${locale}: the expanded prompt has reading space without nested scrolling`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/`)
    await page.locator('.page-tools a[href="#review"]').click()
    await expect(page.locator("#review")).toHaveAttribute("open", "")
    await page.evaluate(() => document.fonts.ready)
    const metrics = await page.locator("#review pre").evaluate((node) => {
      const main = document.querySelector("main")!.getBoundingClientRect()
      return {
        centered: Math.abs((main.left + main.right) / 2 - innerWidth / 2),
        height: node.clientHeight,
        pageWidth: document.documentElement.scrollWidth,
        scrollHeight: node.scrollHeight,
        scrollWidth: node.scrollWidth,
        viewport: innerWidth,
        width: node.clientWidth,
      }
    })
    expect(metrics.centered).toBeLessThan(1)
    expect(metrics.pageWidth).toBe(metrics.viewport)
    expect(metrics.scrollHeight).toBeLessThanOrEqual(metrics.height + 1)
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.width + 1)
    if (metrics.viewport >= 1440) expect(metrics.width).toBeGreaterThan(600)
  })
}

test("the enlarged outlined mark stays identical across languages", async ({
  page,
}) => {
  await page.goto("/en/")
  const readMark = () =>
    page.locator("header img.brand__mark").evaluate(async (element) => {
      const node = element as HTMLImageElement
      await node.decode()
      const canvas = document.createElement("canvas")
      canvas.width = canvas.height = 64
      const context = canvas.getContext("2d")!
      context.drawImage(node, 0, 0, 64, 64)
      const pixels = context.getImageData(0, 0, 64, 64).data
      const letters = []
      for (let y = 0; y < 64; y++) {
        for (let x = 0; x < 64; x++) {
          const offset = (y * 64 + x) * 4
          if (
            pixels[offset] > 230 &&
            pixels[offset + 1] > 220 &&
            pixels[offset + 2] > 210 &&
            pixels[offset + 3] > 0
          )
            letters.push({ x, y })
        }
      }
      const bounds = node.getBoundingClientRect()
      return {
        height: bounds.height,
        letterHeight:
          Math.max(...letters.map((point) => point.y)) -
          Math.min(...letters.map((point) => point.y)) +
          1,
        letterWidth:
          Math.max(...letters.map((point) => point.x)) -
          Math.min(...letters.map((point) => point.x)) +
          1,
        pixels: canvas.toDataURL(),
        width: bounds.width,
      }
    })
  const before = await readMark()
  expect(before.letterWidth).toBeGreaterThanOrEqual(32)
  expect(before.letterHeight).toBeGreaterThanOrEqual(18)
  await expect(page.locator("img.brand__mark")).toHaveCount(2)
  await page.locator(".language-switch a").click()
  await expect(page).toHaveURL("/ko/")
  expect(await readMark()).toEqual(before)
})
