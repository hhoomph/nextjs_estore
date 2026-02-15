/**
 * Module for playwright.config
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./test-results",
  snapshotDir: "./tests/e2e/snapshots",

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI.
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ["html", { outputFolder: "./playwright-report" }],
    ["json", { outputFile: "./test-results/results.json" }],
    ["junit", { outputFile: "./test-results/junit.xml" }],
  ],

  // Shared settings for all the projects below.
  use: {
    // Base URL to use in actions like `await page.goto('/')`.
    baseURL: "http://localhost:3002",

    // Collect trace when retrying the failed test.
    trace: "on-first-retry",

    // Take screenshot on failure
    screenshot: "only-on-failure",

    // Record video on failure
    video: "retain-on-failure",

    // Handle localStorage/sessionStorage access issues
    bypassCSP: true,

    // Additional browser context options
    contextOptions: {
      // Bypass CORS and CSP for testing
      bypassCSP: true,
      // Set proper origin for storage access
      ignoreHTTPSErrors: true,
    },
  },

  // Configure projects for major browsers
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        permissions: ["clipboard-read", "clipboard-write"],
        contextOptions: {
          bypassCSP: true,
          ignoreHTTPSErrors: true,
          permissions: ["clipboard-read", "clipboard-write"],
        },
      },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    // Test against mobile viewports.
    {
      name: "Mobile Chrome",
      use: {
        ...devices["Pixel 5"],
        permissions: ["clipboard-read", "clipboard-write"],
        contextOptions: {
          bypassCSP: true,
          ignoreHTTPSErrors: true,
          permissions: ["clipboard-read", "clipboard-write"],
        },
      },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },

    // Accessibility testing
    {
      name: "accessibility",
      testMatch: "**/accessibility.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        permissions: ["clipboard-read", "clipboard-write"],
        contextOptions: {
          bypassCSP: true,
          ignoreHTTPSErrors: true,
          permissions: ["clipboard-read", "clipboard-write"],
        },
      },
    },

    // Performance testing
    {
      name: "performance",
      testMatch: "**/performance.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        permissions: ["clipboard-read", "clipboard-write"],
        contextOptions: {
          bypassCSP: true,
          ignoreHTTPSErrors: true,
          permissions: ["clipboard-read", "clipboard-write"],
        },
      },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    // Use production `next start` to avoid debug/inspect flags from dev script
    command: "npm run start -- -p 3002",
    url: "http://localhost:3002",
    reuseExistingServer: false,
    timeout: 180000,
    cwd: process.cwd(),
  },

  // Global setup and teardown - commented out as files don't exist
  // globalSetup: require.resolve('./tests/e2e/global-setup'),
  // globalTeardown: require.resolve('./tests/e2e/global-teardown'),
});
