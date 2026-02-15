/**
 * Theme Utilities
 *
 * Server-safe utilities for theme management.
 * Contains only server-safe functions that can be used in server components.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

// Re-export client hooks from separate file
export { useHydrated, useThemeDetection } from "./theme-hooks";

/**
 * Safe theme setter that handles SSR
 */
export function setThemeSafely(theme: "light" | "dark" | "system") {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("theme", theme);

    // Apply theme immediately
    const root = document.documentElement;
    const resolvedTheme =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;

    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
  } catch (error) {
    console.warn("Failed to set theme:", error);
  }
}

/**
 * Get current theme from storage with fallback
 */
export function getCurrentTheme(): "light" | "dark" | "system" {
  if (typeof window === "undefined") return "system";

  try {
    const stored = localStorage.getItem("theme") as
      | "light"
      | "dark"
      | "system"
      | null;
    return stored || "system";
  } catch {
    return "system";
  }
}

/**
 * Get resolved theme (actual light/dark value)
 */
export function getResolvedTheme(): "light" | "dark" {
  const theme = getCurrentTheme();

  if (theme === "system") {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  return theme;
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: "light" | "dark" | "system" = "system") {
  if (typeof window === "undefined") return;

  const resolvedTheme =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;

  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolvedTheme);
}

/**
 * Initialize theme on app start
 */
export function initializeTheme() {
  if (typeof window === "undefined") return;

  const theme = getCurrentTheme();
  applyTheme(theme);

  // Listen for system theme changes if using system theme
  if (theme === "system") {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme("system");
    mediaQuery.addEventListener("change", handleChange);

    // Return cleanup function
    return () => mediaQuery.removeEventListener("change", handleChange);
  }
}

/**
 * Theme change handler with animation support
 */
export function createThemeChangeHandler(
  options: {
    enableTransitions?: boolean;
    onThemeChange?: (theme: "light" | "dark") => void;
  } = {},
) {
  const { enableTransitions = true, onThemeChange } = options;

  return (newTheme: "light" | "dark" | "system") => {
    setThemeSafely(newTheme);
    const resolvedTheme = getResolvedTheme();

    if (enableTransitions) {
      // Add transition class
      document.documentElement.style.setProperty(
        "--theme-transition-duration",
        "300ms",
      );
    }

    applyTheme(newTheme);

    // Call callback after theme change
    setTimeout(() => {
      onThemeChange?.(resolvedTheme);

      if (enableTransitions) {
        // Remove transition after animation
        setTimeout(() => {
          document.documentElement.style.removeProperty(
            "--theme-transition-duration",
          );
        }, 300);
      }
    }, 0);
  };
}

/**
 * Check if theme is supported
 */
export function isThemeSupported(
  theme: string,
): theme is "light" | "dark" | "system" {
  return ["light", "dark", "system"].includes(theme);
}

/**
 * Theme validation utility
 */
export function validateTheme(theme: string): "light" | "dark" | "system" {
  if (isThemeSupported(theme)) {
    return theme;
  }

  console.warn(`Invalid theme "${theme}", falling back to "system"`);
  return "system";
}

/**
 * Get theme display name
 */
export function getThemeDisplayName(
  theme: "light" | "dark" | "system",
): string {
  switch (theme) {
    case "light":
      return "Light";
    case "dark":
      return "Dark";
    case "system":
      return "System";
    default:
      return "System";
  }
}

/**
 * Get opposite theme
 */
export function getOppositeTheme(theme: "light" | "dark"): "light" | "dark" {
  return theme === "light" ? "dark" : "light";
}
