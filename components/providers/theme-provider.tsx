"use client";

import type * as React from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "dark" | "light" | "system";
type ResolvedTheme = "dark" | "light";

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
  actualTheme: ResolvedTheme;
  mounted: boolean;
};

const VALID_THEMES = new Set<Theme>(["light", "dark", "system"]);

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  actualTheme: "light",
  mounted: false,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && VALID_THEMES.has(value as Theme);
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(theme: Theme, enableSystem: boolean): ResolvedTheme {
  if (theme === "system" && enableSystem) {
    return getSystemTheme();
  }

  return theme === "dark" ? "dark" : "light";
}

function applyThemeToDocument(
  resolvedTheme: ResolvedTheme,
  attribute: string,
  disableTransitionOnChange: boolean,
) {
  const root = document.documentElement;
  const previousTransition = root.style.transition;

  root.classList.remove("light", "dark");
  root.classList.add(resolvedTheme);
  root.setAttribute("data-theme", resolvedTheme);
  root.style.colorScheme = resolvedTheme;

  if (attribute !== "class") {
    root.setAttribute(attribute, resolvedTheme);
  }

  if (disableTransitionOnChange) {
    root.style.transition = "none";
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        root.style.transition = previousTransition;
      });
    });
  }
}

function readStoredTheme(storageKey: string): Theme | null {
  try {
    const storedTheme = window.localStorage.getItem(storageKey);
    return isTheme(storedTheme) ? storedTheme : null;
  } catch (error) {
    console.warn("Failed to read stored theme:", error);
    return null;
  }
}

function writeStoredTheme(storageKey: string, theme: Theme) {
  try {
    window.localStorage.setItem(storageKey, theme);
  } catch (error) {
    console.warn("Failed to store theme:", error);
  }
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  attribute = "class",
  enableSystem = true,
  disableTransitionOnChange = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [actualTheme, setActualTheme] = useState<ResolvedTheme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedTheme = readStoredTheme(storageKey);
    const resolvedTheme = resolveTheme(storedTheme ?? defaultTheme, enableSystem);

    setThemeState(storedTheme ?? defaultTheme);
    setActualTheme(resolvedTheme);
    setMounted(true);
    applyThemeToDocument(
      resolvedTheme,
      attribute,
      disableTransitionOnChange,
    );
  }, [attribute, defaultTheme, disableTransitionOnChange, enableSystem, storageKey]);

  useEffect(() => {
    if (!mounted) return;

    const resolvedTheme = resolveTheme(theme, enableSystem);

    setActualTheme(resolvedTheme);
    applyThemeToDocument(
      resolvedTheme,
      attribute,
      disableTransitionOnChange,
    );
    writeStoredTheme(storageKey, theme);
  }, [
    attribute,
    disableTransitionOnChange,
    enableSystem,
    mounted,
    storageKey,
    theme,
  ]);

  useEffect(() => {
    if (!mounted || !enableSystem || theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => {
      const resolvedTheme = mediaQuery.matches ? "dark" : "light";

      setActualTheme(resolvedTheme);
      applyThemeToDocument(
        resolvedTheme,
        attribute,
        disableTransitionOnChange,
      );
    };

    handleSystemThemeChange();
    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [attribute, disableTransitionOnChange, enableSystem, mounted, theme]);

  const setTheme = (nextTheme: Theme) => {
    if (!isTheme(nextTheme)) return;
    setThemeState(nextTheme);
  };

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      actualTheme,
      mounted,
    }),
    [actualTheme, mounted, theme],
  );

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
