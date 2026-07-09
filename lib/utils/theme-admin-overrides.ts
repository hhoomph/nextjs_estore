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
import { useTheme } from "@/components/providers/theme-provider";
/**
 * Admin-specific theme color overrides
 * Provides enhanced contrast and accessibility for admin interfaces
 */
export const adminThemeOverrides = {
  // Background colors
  background: {
    primary: "bg-background",
    secondary: "bg-secondary",
    accent: "bg-muted",
    card: "bg-card",
  },
  // Text colors
  text: {
    primary: "text-foreground",
    secondary: "text-muted-foreground",
    accent: "text-primary",
    muted: "text-muted-foreground",
  },
  // Border colors
  border: {
    primary: "border-border",
    secondary: "border-border",
    accent: "border-primary/20",
  },
  // Interactive elements
  interactive: {
    hover: "hover:bg-muted",
    focus: "focus:bg-muted",
    active: "active:bg-muted",
  },
  // Status colors
  status: {
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    error: "bg-destructive/10 text-destructive border-destructive/20",
    info: "bg-primary/10 text-primary border-primary/20",
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
    background: "apex-admin-topbar",
    text: "text-foreground",
    logo: "text-foreground",
    menu: {
      item: "text-muted-foreground hover:bg-muted hover:text-foreground",
      active: "bg-primary/10 text-primary",
    },
    avatar: {
      background: "bg-primary/10",
      text: "text-primary",
    },
  });
  /**
   * Get theme-aware admin sidebar classes
   */
  const getAdminSidebarClasses = () => ({
    background: "apex-admin-sidebar text-foreground border-r border-border",
    text: "text-foreground",
    menu: {
      item: "text-muted-foreground hover:bg-muted hover:text-foreground",
      active: "bg-primary/10 text-primary shadow-primary/20",
    },
    section: {
      title: "text-muted-foreground opacity-70 text-xs font-semibold uppercase tracking-[0.14em]",
    },
  });
  /**
   * Get theme-aware admin content area classes
   */
  const getAdminContentClasses = () => ({
    background: "apex-admin-shell text-foreground",
    card: "bg-card border border-border shadow-lg",
    header: "bg-card border-b border-border",
    text: {
      primary: "text-foreground",
      secondary: "text-muted-foreground",
      muted: "text-muted-foreground",
    },
  });
  /**
   * Get theme-aware admin form classes
   */
  const getAdminFormClasses = () => ({
    input:
      "bg-background border-input text-foreground placeholder:text-muted-foreground",
    label: "text-muted-foreground",
    error: "text-destructive",
    success: "text-success",
  });
  /**
   * Get theme-aware admin table classes
   */
  const getAdminTableClasses = () => ({
    header: "bg-muted/40 border-b border-border",
    row: "border-b border-border hover:bg-muted/50",
    cell: "text-foreground",
    pagination: "bg-card border-t border-border",
  });
  /**
   * Get theme-aware admin modal classes
   */
  const getAdminModalClasses = () => ({
    backdrop: "bg-background/80 backdrop-blur-xl",
    content: "bg-card border border-border shadow-xl",
    header: "border-b border-border",
    title: "text-foreground",
    description: "text-muted-foreground",
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
    "--admin-bg-primary": "var(--background)",
    "--admin-bg-secondary": "var(--secondary)",
    "--admin-text-primary": "var(--foreground)",
    "--admin-text-secondary": "var(--muted-foreground)",
    "--admin-border": "var(--border)",
    // Dark mode overrides
    "--admin-bg-primary-dark": "var(--background)",
    "--admin-bg-secondary-dark": "var(--secondary)",
    "--admin-text-primary-dark": "var(--foreground)",
    "--admin-text-secondary-dark": "var(--muted-foreground)",
    "--admin-border-dark": "var(--border)",
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