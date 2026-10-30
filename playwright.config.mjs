import { defineConfig } from "@playwright/test"

export default defineConfig({
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: false,
  globalTimeout: 180000,
  projects: [
    { name: "desktop", use: { viewport: { height: 1000, width: 1440 } } },
    { name: "mobile", use: { viewport: { height: 780, width: 360 } } },
  ],
  reporter: "list",
  retries: 0,
  testDir: "./tests/browser",
  use: {
    baseURL: "http://127.0.0.1:4183",
    browserName: "chromium",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node scripts/preview.mjs",
    env: { PORT: "4183" },
    gracefulShutdown: { signal: "SIGTERM", timeout: 5000 },
    reuseExistingServer: false,
    url: "http://127.0.0.1:4183/en/",
  },
  workers: 1,
})
