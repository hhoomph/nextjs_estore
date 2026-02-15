/**
 * Theme Hooks
 *
 * Client-side React hooks for theme management.
 * These hooks require client-side rendering and should only be used in client components.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import type React from "react";
import { useEffect, useState } from "react";

/**
 * Hook to detect if component is hydrated (mounted on client)
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}

/**
 * Hook to safely get theme from localStorage or system preference
 */
export function useThemeDetection() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const hydrated = useHydrated();

  useEffect(() => {
    if (!hydrated) return;

    // Get stored theme or default to system
    const stored = localStorage.getItem("theme") as
      | "light"
      | "dark"
      | "system"
      | null;
    const initialTheme = stored || "system";
    setTheme(initialTheme);

    // Resolve system theme
    const updateResolvedTheme = () => {
      if (initialTheme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
        setResolvedTheme(systemTheme);
      } else {
        setResolvedTheme(initialTheme);
      }
    };

    updateResolvedTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (initialTheme === "system") {
        updateResolvedTheme();
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [hydrated]);

  return {
    theme,
    resolvedTheme,
    hydrated,
  };
}

/**
 * Theme hydration guard component
 * Prevents hydration mismatches by only rendering children on client
 */
export function ThemeHydrationGuard({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const hydrated = useHydrated();

  return hydrated ? <>{children}</> : <>{fallback}</>;
}
