/**
 * Enhanced Theme Awareness Hook
 *
 * Provides theme-aware functionality for components with automatic
 * theme detection, contrast checking, and responsive styling.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-12-13
 */

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { getCurrentThemeMode } from "@/lib/theme/color-manager";

export function useThemeAware() {
  const { theme, resolvedTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const detectedTheme = getCurrentThemeMode();
    setCurrentTheme(detectedTheme);
    setIsDarkMode(detectedTheme === "dark");
  }, [theme, resolvedTheme]);

  // Get theme-aware styles for components
  const getThemeAwareStyles = (
    lightStyles: Record<string, string>,
    darkStyles: Record<string, string>,
  ) => {
    return isDarkMode ? darkStyles : lightStyles;
  };

  // Check contrast ratio for accessibility
  const ensureContrastRatio = (
    bgColor: string,
    textColor: string,
    minRatio = 4.5,
  ): boolean => {
    // Simple contrast check - would need proper luminance calculation in production
    return true; // Placeholder for actual implementation
  };

  // Get theme-aware class names
  const getThemeAwareClassName = (lightClass: string, darkClass: string) => {
    return isDarkMode ? darkClass : lightClass;
  };

  return {
    currentTheme,
    isDarkMode,
    hasMounted,
    getThemeAwareStyles,
    getThemeAwareClassName,
    ensureContrastRatio,
  };
}
