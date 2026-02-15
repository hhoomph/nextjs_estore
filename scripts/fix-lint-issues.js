#!/usr/bin/env node

/**
 * Bulk fix script for ESLint issues
 * Focuses on removing unused variables and imports from test files
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Get all test files
function getTestFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && item !== "node_modules") {
      files.push(...getTestFiles(fullPath));
    } else if (
      stat.isFile() &&
      (item.endsWith(".test.ts") ||
        item.endsWith(".test.tsx") ||
        item.endsWith(".spec.ts") ||
        item.endsWith(".spec.tsx"))
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

// Remove unused imports and variables from test files
function fixTestFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    let modified = false;

    // Common unused imports in test files
    const unusedImports = [
      {
        pattern:
          /import\s*{\s*waitFor\s*}\s*from\s*['"]@testing-library\/react['"];?\s*\n/g,
        replacement: "",
      },
      {
        pattern:
          /import\s*{\s*act\s*}\s*from\s*['"]@testing-library\/react['"];?\s*\n/g,
        replacement: "",
      },
      {
        pattern:
          /import\s*{\s*renderHook\s*}\s*from\s*['"]@testing-library\/react['"];?\s*\n/g,
        replacement: "",
      },
      {
        pattern:
          /import\s*{\s*userEvent\s*}\s*from\s*['"]@testing-library\/user-event['"];?\s*\n/g,
        replacement: "",
      },
      {
        pattern: /import\s*{\s*afterEach\s*}\s*from\s*['"]vitest['"];?\s*\n/g,
        replacement: "",
      },
      {
        pattern: /import\s*{\s*beforeEach\s*}\s*from\s*['"]vitest['"];?\s*\n/g,
        replacement: "",
      },
      { pattern: /,\s*waitFor(?=\s*})/g, replacement: "" },
      { pattern: /,\s*act(?=\s*})/g, replacement: "" },
      { pattern: /,\s*renderHook(?=\s*})/g, replacement: "" },
      { pattern: /,\s*userEvent(?=\s*})/g, replacement: "" },
      { pattern: /,\s*afterEach(?=\s*})/g, replacement: "" },
      { pattern: /,\s*beforeEach(?=\s*})/g, replacement: "" },
    ];

    // Remove unused variables in test code (common patterns)
    const unusedVariables = [
      {
        pattern:
          /\s*const\s+(?:waitFor|act|renderHook|userEvent|afterEach|beforeEach)\s*=\s*[^;]+;\s*\n/g,
        replacement: "",
      },
      {
        pattern:
          /\s*let\s+(?:waitFor|act|renderHook|userEvent|afterEach|beforeEach)\s*=\s*[^;]+;\s*\n/g,
        replacement: "",
      },
      {
        pattern:
          /\s*const\s+(?:mockItem|existingProducts|expiredToken|same1|same2|currentPath|initialValue|container|capturedContext|outOfStockProduct|measureInteractionTime)\s*=\s*[^;]+;\s*\n/g,
        replacement: "",
      },
      {
        pattern:
          /\s*let\s+(?:mockItem|existingProducts|expiredToken|same1|same2|currentPath|initialValue|container|capturedContext|outOfStockProduct|measureInteractionTime)\s*=\s*[^;]+;\s*\n/g,
        replacement: "",
      },
      // Remove unused error variables
      { pattern: /\s*const\s+_\w*\s*=\s*[^;]+;\s*\n/g, replacement: "" },
      { pattern: /\s*let\s+_\w*\s*=\s*[^;]+;\s*\n/g, replacement: "" },
      // Remove unused parameters in catch blocks
      {
        pattern: /catch\s*\(\s*\w+\s*\)\s*{\s*}/g,
        replacement: "catch {\n      // Ignore error\n    }",
      },
    ];

    for (const { pattern, replacement } of unusedImports) {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
      }
    }

    for (const { pattern, replacement } of unusedVariables) {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
      }
    }

    // Clean up multiple consecutive empty lines
    content = content.replace(/\n\s*\n\s*\n/g, "\n\n");

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
function main() {
  const testFiles = getTestFiles("./tests");
  console.log(`Found ${testFiles.length} test files`);

  let fixedCount = 0;
  for (const file of testFiles) {
    if (fixTestFile(file)) {
      fixedCount++;
    }
  }

  console.log(`Fixed ${fixedCount} test files`);

  // Run lint again to check progress
  try {
    const result = execSync('bun run lint 2>&1 | grep -c "problems"', {
      encoding: "utf8",
    });
    const problemCount = parseInt(result.trim());
    console.log(`Remaining problems: ${problemCount}`);
  } catch (error) {
    console.log("Could not count remaining problems");
  }
}

if (require.main === module) {
  main();
}
