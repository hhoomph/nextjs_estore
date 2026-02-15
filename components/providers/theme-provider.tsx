/**
 * Theme Provider with Hydration Fixes
 *
 * Provides theme context with hydration-safe rendering to prevent mismatches.
 * Uses custom implementation to avoid script injection issues.
 *
 * @author hh.oomph@gmail.com
 * @version 1.5.0
 * @since 2025-01-01
 */
"use client";

import type * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: Theme;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  actualTheme: "light",
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  attribute = "class",
  enableSystem = true,
  disableTransitionOnChange = true,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [actualTheme, setActualTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount (client-side only)
  useEffect(() => {
    let storedTheme: Theme | null = null;

    // Safely access localStorage only on client
    try {
      if (typeof window !== "undefined") {
        storedTheme = localStorage.getItem(storageKey) as Theme;
      }
    } catch (error) {
      console.warn("Failed to access localStorage:", error);
    }

    if (storedTheme) {
      setTheme(storedTheme);
    }

    // Initialize system theme preference
    if (typeof window !== "undefined") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      setActualTheme(systemTheme);
    }

    setMounted(true);
  }, [storageKey]);

  // Update actual theme based on theme preference
  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;

    let resolvedTheme: Theme;

    if (theme === "system" && enableSystem) {
      resolvedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } else {
      resolvedTheme = theme;
    }

    setActualTheme(resolvedTheme);

    // Apply theme to document (client-side only)
    try {
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(resolvedTheme);

      if (attribute === "class") {
        root.setAttribute("data-theme", resolvedTheme);
      }

      // Store theme preference
      localStorage.setItem(storageKey, theme);
    } catch (error) {
      console.warn("Failed to apply theme:", error);
    }
  }, [theme, mounted, enableSystem, storageKey, attribute]);

  // Listen for system theme changes
  useEffect(() => {
    if (!enableSystem || theme !== "system" || typeof window === "undefined")
      return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const newTheme = mediaQuery.matches ? "dark" : "light";
      setActualTheme(newTheme);

      try {
        const root = document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(newTheme);
      } catch (error) {
        console.warn("Failed to update system theme:", error);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, enableSystem]);

  const value = {
    theme,
    setTheme,
    actualTheme,
  };

  // Render children immediately on server, prevent hydration mismatch
  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
