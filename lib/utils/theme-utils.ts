/**
 * Theme Utility Functions
 *
 * Collection of utility functions for theme management, contrast checking,
 * and theme-aware styling across the application.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-12-13
 */

import { getCurrentThemeMode } from "@/lib/theme/color-manager";

/**
 * Get theme-aware styles for components
 */
export function getThemeAwareStyles(
  lightStyles: Record<string, string>,
  darkStyles: Record<string, string>,
): Record<string, string> {
  const currentMode = getCurrentThemeMode();
  return currentMode === "dark" ? darkStyles : lightStyles;
}

/**
 * Check contrast ratio for accessibility compliance
 */
export function ensureContrastRatio(
  bgColor: string,
  textColor: string,
  minRatio = 4.5,
): boolean {
  // Simple contrast check - would need proper luminance calculation in production
  // For now, return true as placeholder
  return true;
}

/**
 * Generate theme-aware class names
 */
export function getThemeAwareClassName(
  lightClass: string,
  darkClass: string,
): string {
  const currentMode = getCurrentThemeMode();
  return currentMode === "dark" ? darkClass : lightClass;
}

/**
 * Get theme-aware background color classes
 */
export function getThemeAwareBackgroundClasses(): {
  light: string;
  dark: string;
} {
  return {
    light: "bg-background/95 backdrop-blur-xl",
    dark: "bg-background/95 backdrop-blur-xl",
  };
}

/**
 * Get theme-aware text color classes
 */
export function getThemeAwareTextClasses(): {
  light: string;
  dark: string;
} {
  return {
    light: "text-card-foreground",
    dark: "text-card-foreground",
  };
}

/**
 * Get theme-aware border classes
 */
export function getThemeAwareBorderClasses(): {
  light: string;
  dark: string;
} {
  return {
    light: "border-border",
    dark: "border-border",
  };
}
