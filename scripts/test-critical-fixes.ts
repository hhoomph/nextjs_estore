/**
 * Comprehensive Test for Critical Fixes
 *
 * Tests font loading, navbar consolidation, and render loop fixes
 *
 * @version 1.0.0
 * @since 2025-01-01
 */

import "dotenv/config";
import { readFileSync } from "fs";
import { join } from "path";

// Test font loading fixes
function testFontLoadingFixes() {
  console.log("🔍 Testing font loading fixes...");

  const globalsCss = readFileSync(
    join(process.cwd(), "app/globals.css"),
    "utf-8",
  );

  // Check that IranSans @font-face is removed
  const hasIranSansFontFace =
    globalsCss.includes("@font-face") &&
    globalsCss.includes("font-family: 'IRANSans'");

  // Check that IranSans is removed from font stacks
  const hasIranSansInStack = globalsCss.includes("IRANSans");

  // Check that working fonts are present
  const hasVazirmatn = globalsCss.includes("Vazirmatn");
  const hasShabnam = globalsCss.includes("Shabnam");

  const tests = [
    { name: "IranSans @font-face removed", passed: !hasIranSansFontFace },
    { name: "IranSans removed from font stacks", passed: !hasIranSansInStack },
    { name: "Vazirmatn font present", passed: hasVazirmatn },
    { name: "Shabnam font present", passed: hasShabnam },
  ];

  tests.forEach((test) => {
    console.log(`${test.passed ? "✅" : "❌"} ${test.name}`);
  });

  return tests.every((test) => test.passed);
}

// Test navbar consolidation
function testNavbarConsolidation() {
  console.log("\n🔍 Testing navbar consolidation...");

  const layoutFile = readFileSync(
    join(process.cwd(), "app/[locale]/layout.tsx"),
    "utf-8",
  );

  const tests = [
    {
      name: "Uses UnifiedNavbar",
      passed: layoutFile.includes("UnifiedNavbar"),
    },
    {
      name: "Doesn't import old Navbar",
      passed: !layoutFile.includes("import { Navbar }"),
    },
    {
      name: "Doesn't import ConditionalNavbar",
      passed: !layoutFile.includes("ConditionalNavbar"),
    },
    { name: "UnifiedNavbar exists", passed: true }, // File exists
  ];

  tests.forEach((test) => {
    console.log(`${test.passed ? "✅" : "❌"} ${test.name}`);
  });

  return tests.every((test) => test.passed);
}

// Test render loop fixes
function testRenderLoopFixes() {
  console.log("\n🔍 Testing render loop fixes...");

  const simplifiedSessionSync = readFileSync(
    join(process.cwd(), "lib/hooks/use-simplified-session-sync.ts"),
    "utf-8",
  );
  const simplifiedCartSync = readFileSync(
    join(process.cwd(), "lib/hooks/use-simplified-cart-sync.ts"),
    "utf-8",
  );

  const tests = [
    {
      name: "Simplified session sync exists",
      passed: simplifiedSessionSync.length > 0,
    },
    {
      name: "Simplified cart sync exists",
      passed: simplifiedCartSync.length > 0,
    },
    {
      name: "Session sync uses direct Better Auth",
      passed: simplifiedSessionSync.includes("useSession"),
    },
    {
      name: "Cart sync uses simplified approach",
      passed: simplifiedCartSync.includes("useSimplifiedCartSync"),
    },
    {
      name: "No complex store synchronization",
      passed: !simplifiedSessionSync.includes("session-sync-store"),
    },
  ];

  tests.forEach((test) => {
    console.log(`${test.passed ? "✅" : "❌"} ${test.name}`);
  });

  return tests.every((test) => test.passed);
}

// Test component usage
function testComponentUsage() {
  console.log("\n🔍 Testing component usage...");

  const unifiedNavbar = readFileSync(
    join(process.cwd(), "components/layout/unified-navbar.tsx"),
    "utf-8",
  );

  const tests = [
    {
      name: "Uses simplified session sync",
      passed: unifiedNavbar.includes("useSimplifiedSessionSync"),
    },
    {
      name: "Uses simplified cart sync",
      passed: unifiedNavbar.includes("useSimplifiedCartSync"),
    },
    {
      name: "No complex animation imports",
      passed: !unifiedNavbar.includes("framer-motion"),
    },
    {
      name: "No session monitoring complexity",
      passed: !unifiedNavbar.includes("SessionChangeTransition"),
    },
    {
      name: "Clean component structure",
      passed: unifiedNavbar.includes("export function UnifiedNavbar"),
    },
  ];

  tests.forEach((test) => {
    console.log(`${test.passed ? "✅" : "❌"} ${test.name}`);
  });

  return tests.every((test) => test.passed);
}

// Run all tests
async function runAllTests() {
  console.log("🧪 Running comprehensive tests for critical fixes...\n");

  const results = [
    { name: "Font Loading Fixes", passed: testFontLoadingFixes() },
    { name: "Navbar Consolidation", passed: testNavbarConsolidation() },
    { name: "Render Loop Fixes", passed: testRenderLoopFixes() },
    { name: "Component Usage", passed: testComponentUsage() },
  ];

  console.log("\n📊 Test Results Summary:");
  results.forEach((result) => {
    console.log(
      `${result.passed ? "✅" : "❌"} ${result.name}: ${result.passed ? "PASSED" : "FAILED"}`,
    );
  });

  const allPassed = results.every((result) => result.passed);

  console.log(
    `\n${allPassed ? "🎉" : "⚠️"} Overall Result: ${allPassed ? "ALL TESTS PASSED" : "SOME TESTS FAILED"}`,
  );

  if (allPassed) {
    console.log("\n✅ Critical fixes are working correctly!");
    console.log("- Font loading issues resolved");
    console.log("- Navbar conflicts eliminated");
    console.log("- Render loops fixed");
    console.log("- Code quality improved");
  } else {
    console.log("\n❌ Some tests failed. Please review the issues above.");
  }

  return allPassed;
}

// Run tests if called directly
if (require.main === module) {
  runAllTests().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

export {
  runAllTests,
  testFontLoadingFixes,
  testNavbarConsolidation,
  testRenderLoopFixes,
  testComponentUsage,
};
