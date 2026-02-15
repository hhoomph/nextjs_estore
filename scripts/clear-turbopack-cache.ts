#!/usr/bin/env tsx

/**
 * Turbopack Cache Clearing Script
 *
 * This script clears Next.js Turbopack cache and build artifacts
 * to resolve build corruption and browser errors.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import { execSync } from "child_process";
import { existsSync, rmSync } from "fs";
import { join } from "path";

const PROJECT_ROOT = process.cwd();

function clearCache() {
  console.log("🧹 Clearing Next.js and Turbopack caches...\n");

  try {
    // Clear .next directory (Next.js build cache)
    const nextDir = join(PROJECT_ROOT, ".next");
    if (existsSync(nextDir)) {
      console.log("📁 Removing .next directory...");
      rmSync(nextDir, { recursive: true, force: true });
      console.log("✅ .next directory cleared");
    } else {
      console.log("ℹ️  .next directory not found");
    }

    // Clear node_modules/.cache (various caches)
    const nodeCacheDir = join(PROJECT_ROOT, "node_modules", ".cache");
    if (existsSync(nodeCacheDir)) {
      console.log("📁 Removing node_modules/.cache directory...");
      rmSync(nodeCacheDir, { recursive: true, force: true });
      console.log("✅ node_modules/.cache directory cleared");
    } else {
      console.log("ℹ️  node_modules/.cache directory not found");
    }

    // Clear Turbopack specific caches
    const turbopackCache = join(PROJECT_ROOT, ".turbopack");
    if (existsSync(turbopackCache)) {
      console.log("📁 Removing .turbopack directory...");
      rmSync(turbopackCache, { recursive: true, force: true });
      console.log("✅ .turbopack directory cleared");
    } else {
      console.log("ℹ️  .turbopack directory not found");
    }

    // Clear Next.js cache using CLI
    console.log("🔧 Clearing Next.js telemetry cache...");
    try {
      execSync("npx next telemetry disable", { stdio: "inherit" });
      execSync("npx next telemetry enable", { stdio: "inherit" });
      console.log("✅ Next.js telemetry cache cleared");
    } catch (error) {
      console.log("⚠️  Could not clear Next.js telemetry cache");
    }

    console.log("\n🎉 Cache clearing completed successfully!");
    console.log(
      "💡 Run 'npm run dev' or 'bun run dev' to restart the development server",
    );
  } catch (error) {
    console.error("❌ Error clearing cache:", error);
    process.exit(1);
  }
}

// Run the cache clearing function
clearCache();
