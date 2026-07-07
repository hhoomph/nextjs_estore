/**
 * Component test configuration for Vitest
 * Separate config for component tests using jsdom environment
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
    // Use happy-dom environment for component tests (easier to set up than jsdom)
    environment: "happy-dom",
    globals: true,
    setupFiles: [
      "./tests/setup/component-env.ts", // Component-specific setup - runs before environment
    ],
    include: [
      "tests/components/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "components/**/__tests__/**/*.{test,spec}.{ts,tsx}",
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
        "app/api/**", // API routes are tested separately
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
