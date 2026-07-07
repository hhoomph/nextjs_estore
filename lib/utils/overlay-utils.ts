/**
 * Overlay Utilities for Enhanced Modal/Sidebar/Dropdown Visibility
 *
 * Provides theme-aware overlay styling functions and utilities
 * for better contrast, backgrounds, and text visibility.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Enhanced overlay theme configuration
 */
export interface OverlayTheme {
  background: string;
  backdrop: string;
  border: string;
  text: string;
  shadow: string;
}

/**
 * Create theme-aware overlay styles
 */
export function createOverlayTheme(isDark: boolean = false): OverlayTheme {
  return {
    background: isDark
      ? "bg-background/95 backdrop-blur-xl border-border/50"
      : "bg-background/98 backdrop-blur-2xl border-border/30",
    backdrop: isDark
      ? "bg-background/70 backdrop-blur-xl"
      : "bg-background/60 backdrop-blur-xl",
    border: isDark
      ? "border-border/60 shadow-2xl"
      : "border-border/40 shadow-xl",
    text: isDark ? "text-foreground" : "text-foreground",
    shadow: isDark ? "shadow-black/30" : "shadow-black/10",
  };
}

/**
 * Enhanced overlay classes with improved visibility
 */
export function getEnhancedOverlayClasses(
  type: "modal" | "sidebar" | "dropdown" = "modal",
  isDark: boolean = false,
): ClassValue {
  const theme = createOverlayTheme(isDark);

  const baseClasses = [
    "fixed inset-0 z-50",
    "flex items-center justify-center",
    "p-4",
    theme.backdrop,
  ];

  const modalClasses = [
    ...baseClasses,
    "animate-in fade-in-0 zoom-in-95 duration-200",
    "animate-out fade-out-0 zoom-out-95 duration-150",
  ];

  const sidebarClasses = [
    "fixed inset-y-0 right-0 z-50",
    "flex flex-col",
    "w-full max-w-sm",
    theme.background,
    theme.border,
    "shadow-2xl",
    "animate-in slide-in-from-right-full duration-300",
    "animate-out slide-out-to-right-full duration-200",
  ];

  const dropdownClasses = [
    "absolute z-50 min-w-[8rem]",
    "overflow-hidden rounded-md border",
    theme.background,
    theme.border,
    "shadow-lg",
    "animate-in fade-in-0 zoom-in-95 duration-100",
    "animate-out fade-out-0 zoom-out-95 duration-75",
  ];

  switch (type) {
    case "modal":
      return clsx(modalClasses);
    case "sidebar":
      return clsx(sidebarClasses);
    case "dropdown":
      return clsx(dropdownClasses);
    default:
      return clsx(modalClasses);
  }
}

/**
 * Enhanced backdrop classes with better opacity and blur
 */
export function getEnhancedBackdropClasses(
  isDark: boolean = false,
): ClassValue {
  return clsx(
    "fixed inset-0 z-50",
    isDark ? "bg-background/70 backdrop-blur-xl" : "bg-background/60 backdrop-blur-xl",
    "animate-in fade-in-0 duration-200",
    "animate-out fade-out-0 duration-150",
  );
}

/**
 * Overlay content wrapper with improved theming
 */
export function getOverlayContentClasses(
  type: "modal" | "sidebar" | "dropdown" = "modal",
  isDark: boolean = false,
): ClassValue {
  const theme = createOverlayTheme(isDark);

  const baseClasses = [
    "relative",
    theme.background,
    theme.border,
    theme.shadow,
    "rounded-lg",
  ];

  switch (type) {
    case "modal":
      return clsx(
        ...baseClasses,
        "max-h-[90vh] w-full max-w-lg",
        "overflow-hidden",
        "shadow-2xl",
      );
    case "sidebar":
      return clsx("flex h-full flex-col", theme.background, "shadow-2xl");
    case "dropdown":
      return clsx(...baseClasses, "relative z-50 p-1", "shadow-lg");
    default:
      return clsx(baseClasses);
  }
}

/**
 * Utility function to merge overlay classes with custom classes
 */
export function cnOverlay(
  ...inputs: (ClassValue | OverlayTheme | undefined)[]
): string {
  return twMerge(clsx(inputs));
}

/**
 * Get theme-aware text classes for overlays
 */
export function getOverlayTextClasses(isDark: boolean = false): {
  primary: string;
  secondary: string;
  muted: string;
} {
  return {
    primary: isDark ? "text-foreground" : "text-foreground",
    secondary: isDark ? "text-muted-foreground" : "text-muted-foreground",
    muted: isDark ? "text-muted-foreground/80" : "text-muted-foreground/90",
  };
}

/**
 * Check if current theme is dark
 */
export function isDarkTheme(): boolean {
  if (typeof window === "undefined") return false;

  const theme = document.documentElement.getAttribute("data-theme");
  const classList = document.documentElement.classList;

  return theme === "dark" || classList.contains("dark");
}

/**
 * Enhanced focus trap classes for overlays
 */
export function getFocusTrapClasses(): ClassValue {
  return clsx(
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-ring",
    "focus-visible:ring-offset-2",
  );
}

/**
 * Animation classes for overlay transitions
 */
export function getOverlayAnimationClasses(
  type: "enter" | "exit" = "enter",
): ClassValue {
  const enterClasses = clsx(
    "animate-in fade-in-0 duration-200",
    "slide-in-from-bottom-2",
  );

  const exitClasses = clsx(
    "animate-out fade-out-0 duration-150",
    "slide-out-to-bottom-2",
  );

  return type === "enter" ? enterClasses : exitClasses;
}
