/**
 * Admin Theme Overrides and Utilities
 *
 * Specialized theme utilities for admin panel components,
 * including enhanced contrast, accessibility features,
 * and admin-specific styling overrides.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { useTheme } from "next-themes";
/**
 * Admin-specific theme color overrides
 * Provides enhanced contrast and accessibility for admin interfaces
 */
export const adminThemeOverrides = {
  // Background colors
  background: {
    primary: "bg-slate-50 dark:bg-slate-900",
    secondary: "bg-white dark:bg-violet-300",
    accent: "bg-slate-100 dark:bg-slate-700",
    card: "bg-white dark:bg-slate-800",
  },
  // Text colors
  text: {
    primary: "text-slate-900 dark:text-slate-100",
    secondary: "text-slate-600 dark:text-slate-400",
    accent: "text-slate-500 dark:text-slate-300",
    muted: "text-slate-400 dark:text-slate-500",
  },
  // Border colors
  border: {
    primary: "border-slate-200 dark:border-slate-700",
    secondary: "border-slate-300 dark:border-slate-600",
    accent: "border-slate-400 dark:border-slate-500",
  },
  // Interactive elements
  interactive: {
    hover: "hover:bg-slate-100 dark:hover:bg-slate-700",
    focus: "focus:bg-slate-200 dark:focus:bg-slate-600",
    active: "active:bg-slate-200 dark:active:bg-slate-600",
  },
  // Status colors
  status: {
    success: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
    warning: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
    error: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
    info: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  },
} as const;
/**
 * Hook for admin theme management
 * Provides theme-aware styling with admin-specific overrides
 */
export function useAdminTheme() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const isLight = theme === "light";
  const isSystem = theme === "system";
  /**
   * Get admin-aware class names with proper theme support
   */
  const getAdminClass = (component: keyof typeof adminThemeOverrides) => {
    return adminThemeOverrides[component];
  };
  /**
   * Get theme-aware admin navbar classes
   */
  const getAdminNavbarClasses = () => ({
    background: "bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700",
    text: "text-slate-900 dark:text-slate-100",
    logo: "text-slate-800 dark:text-slate-200",
    menu: {
      item: "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700",
      active: "bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-slate-100",
    },
    avatar: {
      background: "bg-slate-200 dark:bg-slate-700",
      text: "text-slate-800 dark:text-slate-200",
    },
  });
  /**
   * Get theme-aware admin sidebar classes
   */
  const getAdminSidebarClasses = () => ({
    background: "bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700",
    text: "text-slate-900 dark:text-slate-100",
    menu: {
      item: "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700",
      active: "bg-slate-200 dark:bg-slate-600 text-slate-900 dark:text-slate-100 border-r-2 border-slate-900 dark:border-slate-100",
    },
    section: {
      title: "text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider",
    },
  });
  /**
   * Get theme-aware admin content area classes
   */
  const getAdminContentClasses = () => ({
    background: "bg-slate-50 dark:bg-slate-900",
    card: "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
    header: "bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700",
    text: {
      primary: "text-slate-900 dark:text-slate-100",
      secondary: "text-slate-600 dark:text-slate-400",
      muted: "text-slate-400 dark:text-slate-500",
    },
  });
  /**
   * Get theme-aware admin form classes
   */
  const getAdminFormClasses = () => ({
    input:
      "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400",
    label: "text-slate-700 dark:text-slate-300",
    error: "text-red-600 dark:text-red-400",
    success: "text-green-600 dark:text-green-400",
  });
  /**
   * Get theme-aware admin table classes
   */
  const getAdminTableClasses = () => ({
    header: "bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600",
    row: "border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50",
    cell: "text-slate-900 dark:text-slate-100",
    pagination: "bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700",
  });
  /**
   * Get theme-aware admin modal classes
   */
  const getAdminModalClasses = () => ({
    backdrop: "bg-black/50",
    content: "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
    header: "border-b border-slate-200 dark:border-slate-700",
    title: "text-slate-900 dark:text-slate-100",
    description: "text-slate-600 dark:text-slate-400",
  });
  /**
   * Toggle admin theme
   */
  const toggleAdminTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };
  return {
    // Theme state
    theme,
    isDark,
    isLight,
    isSystem,
    // Actions
    setTheme,
    toggleAdminTheme,
    // Theme utilities
    getAdminClass,
    getAdminNavbarClasses,
    getAdminSidebarClasses,
    getAdminContentClasses,
    getAdminFormClasses,
    getAdminTableClasses,
    getAdminModalClasses,
    // Legacy support - map to new structure
    adminThemeOverrides,
  };
}
/**
 * Admin theme provider utility
 * Returns theme context data for components
 */
export function getAdminThemeProviderData() {
  // This would be used in a React component to get theme data
  // For now, return a placeholder
  return {
    theme: "light" as const,
    isAdminContext: true,
  };
}
/**
 * Utility function to get admin theme CSS variables
 */
export function getAdminThemeCSSVariables() {
  return {
    // Admin-specific CSS variables
    "--admin-bg-primary": "hsl(var(--slate-50))",
    "--admin-bg-secondary": "hsl(var(--white))",
    "--admin-text-primary": "hsl(var(--slate-900))",
    "--admin-text-secondary": "hsl(var(--slate-600))",
    "--admin-border": "hsl(var(--slate-200))",
    // Dark mode overrides
    "--admin-bg-primary-dark": "hsl(var(--slate-900))",
    "--admin-bg-secondary-dark": "hsl(var(--slate-800))",
    "--admin-text-primary-dark": "hsl(var(--slate-100))",
    "--admin-text-secondary-dark": "hsl(var(--slate-400))",
    "--admin-border-dark": "hsl(var(--slate-700))",
  };
}
/**
 * Apply admin theme overrides to existing components
 */
export function applyAdminThemeOverrides(componentClasses: string): string {
  // This would be used to override component styles for admin context
  // For now, return the original classes
  return componentClasses;
}
export default useAdminTheme;