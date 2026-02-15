/**
 * API Routes Testing Configuration for Vitest
 *
 * Isolated testing for Next.js API routes without full server startup
 * Uses proper mocking for database, auth, and external services
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node", // Use Node environment for API routes
    globals: true,
    setupFiles: [
      "./tests/setup/api-env.ts", // API-specific setup
      "./tests/setup/globals.ts", // Additional global utilities
    ],
    include: [
      "tests/api-routes.test.ts",
      "tests/database-integration.test.ts",
      "tests/session-management.test.ts",
      "tests/translations.test.ts",
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
    ],
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
        "app/**", // Exclude app directory from API coverage
        "!app/api/**", // But include API routes
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
    testTimeout: 15000, // Longer timeout for API tests
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
