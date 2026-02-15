/**
 * Translation keys validation test script
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import { readFileSync } from "fs";
import { join } from "path";

interface TranslationKeys {
  [key: string]: any;
}

function collectAllKeys(obj: any, prefix = ""): string[] {
  const keys: string[] = [];

  function traverse(current: any, path: string) {
    if (typeof current === "object" && current !== null) {
      for (const key in current) {
        const fullPath = path ? `${path}.${key}` : key;
        keys.push(fullPath);
        traverse(current[key], fullPath);
      }
    } else {
      // For primitive values, add the path if it's not empty
      if (path && typeof current === "string") {
        keys.push(path);
      }
    }
  }

  traverse(obj, prefix);
  return keys;
}

function validateTranslationKeys() {
  console.log("🔍 Validating translation keys...\n");

  try {
    // Read translation files
    const enTranslations: TranslationKeys = JSON.parse(
      readFileSync(join(process.cwd(), "messages/en.json"), "utf-8"),
    );

    const faTranslations: TranslationKeys = JSON.parse(
      readFileSync(join(process.cwd(), "messages/fa.json"), "utf-8"),
    );

    console.log("✅ Translation files loaded successfully");

    // Collect all keys from both files
    const enKeys = collectAllKeys(enTranslations);
    const faKeys = collectAllKeys(faTranslations);

    // Check for missing keys in Persian translation
    const missingKeys: string[] = [];
    const extraKeys: string[] = [];

    // Check that all English keys exist in Persian
    for (const key of enKeys) {
      if (!faKeys.includes(key)) {
        missingKeys.push(key);
      }
    }

    // Check for extra keys in Persian (optional - Persian can have extra keys)
    // We won't fail on extra keys since Persian might have additional content

    // Report results
    if (missingKeys.length === 0) {
      console.log("🎉 All translation keys are properly synchronized!");
      console.log(
        `✅ Found ${enKeys.length} keys in English, all present in Persian`,
      );
      return true;
    }

    if (missingKeys.length > 0) {
      console.log("❌ Missing keys in Persian translation:");
      missingKeys.slice(0, 10).forEach((key) => console.log(`   - ${key}`));
      if (missingKeys.length > 10) {
        console.log(`   ... and ${missingKeys.length - 10} more`);
      }
    }

    return missingKeys.length === 0;
  } catch (error) {
    console.error("❌ Error validating translation keys:", error);
    return false;
  }
}

// Critical missing keys mentioned in implementation plan
function checkCriticalKeys() {
  console.log(
    "\n🔍 Checking critical keys mentioned in implementation plan...\n",
  );

  const faTranslations: TranslationKeys = JSON.parse(
    readFileSync(join(process.cwd(), "messages/fa.json"), "utf-8"),
  );

  const criticalKeys = [
    "auth.signup.phone.label",
    "auth.signup.phone.placeholder",
    "auth.signup.hasAccount",
    "Product Related.quantity",
    "Social Sharing.share",
    "Social Sharing.linkCopied",
    "Social Sharing.copyLink",
  ];

  const missingCritical: string[] = [];

  criticalKeys.forEach((key) => {
    const parts = key.split(".");
    let current = faTranslations;

    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part];
      } else {
        missingCritical.push(key);
        break;
      }
    }
  });

  if (missingCritical.length === 0) {
    console.log("✅ All critical keys are present");
    return true;
  } else {
    console.log("❌ Missing critical keys:");
    missingCritical.forEach((key) => console.log(`   - ${key}`));
    return false;
  }
}

// Run validation
async function main() {
  console.log("🚀 Starting translation validation...\n");

  const keysValid = validateTranslationKeys();
  const criticalValid = checkCriticalKeys();

  console.log("\n📊 Validation Summary:");
  console.log(`   Keys synchronization: ${keysValid ? "✅ PASS" : "❌ FAIL"}`);
  console.log(
    `   Critical keys check: ${criticalValid ? "✅ PASS" : "❌ FAIL"}`,
  );

  if (keysValid && criticalValid) {
    console.log("\n🎉 Translation validation completed successfully!");
    process.exit(0);
  } else {
    console.log("\n❌ Translation validation failed!");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("💥 Unexpected error:", error);
  process.exit(1);
});
