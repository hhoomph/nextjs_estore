/**
 * Unified Vitest Configuration
 * Runs all tests (unit, component, integration) with proper environment setup
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom environment for all tests
    environment: "jsdom",
    globals: true,

    // Base environment setup
    setupFiles: ["./tests/setup/vitest-env.ts", "./tests/setup/jsdom-env.ts"],

    // Include ALL test files except E2E (which use Playwright)
    include: [
      "tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "lib/**/*.test.ts",
    ],

    // Only exclude E2E tests and build artifacts
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/e2e/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
      "tests/e2e/**",
      "playwright.config.ts",
    ],

    env: {
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      DATABASE_URL: "postgresql://test:test@localhost:5432/test",
      NEXTAUTH_SECRET: "test-secret",
      NEXTAUTH_URL: "http://localhost:3000",
    },

    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "tests/",
        "cypress/",
        "playwright/",
        "**/*.d.ts",
        "coverage/",
        "dist/",
        "**/*.config.*",
        "app/api/**",
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },

    testTimeout: 10000,
    hookTimeout: 10000,
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
