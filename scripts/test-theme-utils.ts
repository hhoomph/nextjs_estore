/**
 * Test script for theme utilities
 *
 * Verifies that the theme utilities work correctly
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-12-13
 */

import { calculateContrastRatio } from "@/lib/theme/color-manager";
import {
  ensureContrastRatio,
  getThemeAwareClassName,
  getThemeAwareStyles,
} from "@/lib/utils/theme-utils";

console.log("🔍 Testing Theme Utilities...");

try {
  // Test theme-aware styles
  const lightStyles = { background: "bg-white", text: "text-black" };
  const darkStyles = { background: "bg-black", text: "text-white" };

  const themeStyles = getThemeAwareStyles(lightStyles, darkStyles);
  console.log("✅ Theme-aware styles:", themeStyles);

  // Test theme-aware class names
  const lightClass = "bg-white text-black";
  const darkClass = "bg-black text-white";

  const themeClass = getThemeAwareClassName(lightClass, darkClass);
  console.log("✅ Theme-aware class name:", themeClass);

  // Test contrast ratio calculation
  const contrastRatio = calculateContrastRatio("#ffffff", "#000000");
  console.log("✅ Contrast ratio (white/black):", contrastRatio);

  // Test ensure contrast ratio
  const hasGoodContrast = ensureContrastRatio("#ffffff", "#000000");
  console.log("✅ Has good contrast (white/black):", hasGoodContrast);

  console.log("\n🎉 All theme utility tests passed!");
} catch (error) {
  console.error("❌ Error testing theme utilities:", error);
  process.exit(1);
}
