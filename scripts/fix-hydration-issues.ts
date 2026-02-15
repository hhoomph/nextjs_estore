/**
 * Script to fix hydration mismatches caused by CSS variables
 * This script replaces Tailwind classes that use CSS variables with inline styles
 */

import fs from "fs";
import { glob } from "glob";
import path from "path";

// Files to process
const patterns = ["app/**/*.tsx", "components/**/*.tsx", "components/**/*.ts"];

// Replacements to make
const replacements = [
  // border-primary replacements
  {
    search: /border-primary/g,
    replace: (match: string, offset: number, fullString: string) => {
      // Check context to determine what kind of border this is
      if (
        fullString.includes("border-b-2") ||
        fullString.includes("border-bottom")
      ) {
        return "style={{ borderBottomColor: 'rgb(59, 130, 246)' }}";
      } else if (
        fullString.includes("border-t") ||
        fullString.includes("border-top")
      ) {
        return "style={{ borderTopColor: 'rgb(59, 130, 246)' }}";
      } else if (
        fullString.includes("border-r") ||
        fullString.includes("border-right")
      ) {
        return "style={{ borderRightColor: 'rgb(59, 130, 246, 0.4)' }}";
      } else if (
        fullString.includes("border-2") ||
        fullString.includes("border-4")
      ) {
        return "style={{ borderColor: 'rgb(59, 130, 246)' }}";
      } else {
        return "style={{ borderColor: 'rgb(59, 130, 246)' }}";
      }
    },
  },

  // border-primary/20 replacements
  {
    search: /border-primary\/20/g,
    replace: "style={{ borderColor: 'rgb(59, 130, 246, 0.2)' }}",
  },

  // border-primary/40 replacements
  {
    search: /border-primary\/40/g,
    replace: "style={{ borderColor: 'rgb(59, 130, 246, 0.4)' }}",
  },

  // text-primary replacements
  {
    search: /text-primary/g,
    replace: "style={{ color: 'rgb(59, 130, 246)' }}",
  },

  // bg-primary replacements
  {
    search: /bg-primary/g,
    replace: "style={{ backgroundColor: 'rgb(59, 130, 246)' }}",
  },

  // hover:border-primary replacements
  {
    search: /hover:border-primary/g,
    replace: "hover:style={{ borderColor: 'rgb(59, 130, 246)' }}",
  },
];

async function fixHydrationIssues() {
  console.log("🔍 Finding files to process...");

  const files = await glob(patterns, {
    ignore: ["node_modules/**", ".next/**", "dist/**", "build/**"],
  });

  console.log(`📝 Found ${files.length} files to process`);

  let totalReplacements = 0;

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, "utf-8");
      let newContent = content;
      let fileChanged = false;

      for (const { search, replace } of replacements) {
        if (search.test(newContent)) {
          // Handle function replacements differently
          if (typeof replace === "function") {
            newContent = newContent.replace(search, replace);
          } else {
            newContent = newContent.replace(search, replace);
          }
          fileChanged = true;
        }
      }

      if (fileChanged) {
        fs.writeFileSync(file, newContent);
        const replacementsInFile = (
          content.match(/border-primary|text-primary|bg-primary/g) || []
        ).length;
        totalReplacements += replacementsInFile;
        console.log(`✅ Fixed ${file} (${replacementsInFile} replacements)`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error);
    }
  }

  console.log(`\n🎉 Hydration fixes complete!`);
  console.log(`📊 Total replacements made: ${totalReplacements}`);
}

fixHydrationIssues().catch(console.error);
