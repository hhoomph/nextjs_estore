import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for the smoke test suite.
 *
 * Runs only the `tests/e2e/smoke-*.spec.ts` files and is intentionally
 * minimal: one project using the system-installed browser, no parallel
 * projects, and a 30s timeout. The full E2E suite lives in
 * `playwright.config.ts`.
 *
 * Usage:
 *   bun run test:smoke          # headless
 *   bun run test:smoke:ui       # Playwright UI mode
 *   bun run test:smoke:report   # open the HTML report from the last run
 *
 * Note: Uses the system-installed Microsoft Edge (msedge) via the
 * `channel` option so that Playwright does not need to download its
 * own Chromium build. Fall back to `chrome` if Edge is not available.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /smoke-.*\.spec\.ts/,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  timeout: 45_000,
  use: {
    baseURL: process.env.SMOKE_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        channel: "msedge",
        launchOptions: {
          executablePath:
            "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
        },
      },
    },
  ],
  // No webServer block — the dev server is expected to be running
  // externally (e.g. `bun run dev` in another terminal). This keeps
  // test runs fast and avoids interfering with other dev tooling.
});
