/**
 * Automated JSDoc Comment Addition Script
 *
 * This script automatically adds comprehensive JSDoc comments with @author attribution
 * to TypeScript files that lack proper documentation. It scans the codebase and
 * enhances code documentation for better maintainability and developer experience.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import * as fs from "fs";
import { glob } from "glob";
import * as path from "path";

/**
 * Configuration for JSDoc comment generation
 */
interface JSDocConfig {
  author: string;
  version: string;
  since: string;
  excludePatterns: string[];
  includePatterns: string[];
}

/**
 * Default configuration for the script
 */
const DEFAULT_CONFIG: JSDocConfig = {
  author: "hh.oomph@gmail.com",
  version: "1.0.0",
  since: "2025-01-01",
  excludePatterns: [
    "node_modules/**",
    "dist/**",
    "build/**",
    ".next/**",
    "generated/**",
    "coverage/**",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    "**/*.d.ts",
    "scripts/**", // Exclude this script itself
  ],
  includePatterns: ["**/*.ts", "**/*.tsx"],
};

/**
 * File processing statistics
 */
interface ProcessingStats {
  totalFiles: number;
  processedFiles: number;
  skippedFiles: number;
  errors: string[];
}

/**
 * Checks if a file already has a JSDoc comment at the top
 * @param content - File content to check
 * @returns True if file has JSDoc comment
 */
function hasJSDocComment(content: string): boolean {
  const lines = content.trimStart().split("\n");
  return lines.length > 0 && lines[0].startsWith("/**");
}

/**
 * Extracts the main description from file content
 * @param filePath - Path to the file
 * @param content - File content
 * @returns Description string
 */
function extractFileDescription(filePath: string, content: string): string {
  const relativePath = path.relative(process.cwd(), filePath);
  const fileName = path.basename(filePath, path.extname(filePath));

  // Extract from file content or generate based on path
  if (
    content.includes("export default") ||
    content.includes("export function") ||
    content.includes("export class")
  ) {
    if (relativePath.includes("/components/")) {
      return `React component for ${fileName}`;
    } else if (
      relativePath.includes("/lib/") ||
      relativePath.includes("/utils/")
    ) {
      return `Utility functions and helpers for ${fileName}`;
    } else if (relativePath.includes("/types/")) {
      return `TypeScript type definitions for ${fileName}`;
    } else if (relativePath.includes("/stores/")) {
      return `State management store for ${fileName}`;
    } else if (relativePath.includes("/hooks/")) {
      return `React custom hooks for ${fileName}`;
    } else if (relativePath.includes("/api/")) {
      return `API route handlers for ${fileName}`;
    } else if (
      relativePath.includes("/pages/") ||
      relativePath.includes("/app/")
    ) {
      return `Page component for ${fileName}`;
    }
  }

  return `Module for ${fileName}`;
}

/**
 * Generates a comprehensive JSDoc comment for a file
 * @param filePath - Path to the file
 * @param content - File content
 * @param config - JSDoc configuration
 * @returns Generated JSDoc comment
 */
function generateJSDocComment(
  filePath: string,
  content: string,
  config: JSDocConfig,
): string {
  const description = extractFileDescription(filePath, content);
  const relativePath = path.relative(process.cwd(), filePath);

  const jsdoc = [
    "/**",
    ` * ${description}`,
    " *",
    ` * @author ${config.author}`,
    ` * @version ${config.version}`,
    ` * @since ${config.since}`,
    " */",
    "",
  ];

  return jsdoc.join("\n");
}

/**
 * Adds JSDoc comment to a file if it doesn't already have one
 * @param filePath - Path to the file
 * @param config - JSDoc configuration
 * @returns True if file was modified
 */
function addJSDocToFile(filePath: string, config: JSDocConfig): boolean {
  try {
    const content = fs.readFileSync(filePath, "utf-8");

    // Skip if already has JSDoc comment
    if (hasJSDocComment(content)) {
      return false;
    }

    // Skip empty files or files that don't need documentation
    if (content.trim().length === 0) {
      return false;
    }

    // Generate and add JSDoc comment
    const jsdocComment = generateJSDocComment(filePath, content, config);
    const newContent = jsdocComment + content;

    fs.writeFileSync(filePath, newContent, "utf-8");
    return true;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

/**
 * Processes all TypeScript files in the project
 * @param config - JSDoc configuration
 * @returns Processing statistics
 */
async function processFiles(
  config: JSDocConfig = DEFAULT_CONFIG,
): Promise<ProcessingStats> {
  const stats: ProcessingStats = {
    totalFiles: 0,
    processedFiles: 0,
    skippedFiles: 0,
    errors: [],
  };

  try {
    // Find all TypeScript files
    const files = await glob(config.includePatterns, {
      ignore: config.excludePatterns,
      cwd: process.cwd(),
    });

    stats.totalFiles = files.length;

    for (const file of files) {
      const filePath = path.resolve(process.cwd(), file);

      try {
        if (addJSDocToFile(filePath, config)) {
          stats.processedFiles++;
          console.log(`✓ Added JSDoc to ${file}`);
        } else {
          stats.skippedFiles++;
          console.log(
            `- Skipped ${file} (already has JSDoc or not applicable)`,
          );
        }
      } catch (error) {
        stats.errors.push(`${file}: ${error}`);
        console.error(`✗ Error processing ${file}:`, error);
      }
    }
  } catch (error) {
    stats.errors.push(`Glob error: ${error}`);
    console.error("Error finding files:", error);
  }

  return stats;
}

/**
 * Main execution function
 */
async function main() {
  console.log("🚀 Starting automated JSDoc comment addition...\n");

  const config = DEFAULT_CONFIG;
  const stats = await processFiles(config);

  console.log("\n📊 Processing Summary:");
  console.log(`Total files found: ${stats.totalFiles}`);
  console.log(`Files processed: ${stats.processedFiles}`);
  console.log(`Files skipped: ${stats.skippedFiles}`);
  console.log(`Errors encountered: ${stats.errors.length}`);

  if (stats.errors.length > 0) {
    console.log("\n❌ Errors:");
    stats.errors.forEach((error) => console.log(`  - ${error}`));
  }

  console.log("\n✅ JSDoc comment addition completed!");
  console.log(`\nNext steps:`);
  console.log(`1. Review the added comments`);
  console.log(`2. Run 'npm run lint' to check JSDoc validation`);
  console.log(
    `3. Consider running 'npm run build' to ensure no compilation errors`,
  );
}

// Execute the script
if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

export { addJSDocToFile, generateJSDocComment, hasJSDocComment, processFiles };
export type { JSDocConfig, ProcessingStats };
