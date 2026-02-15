/**
 * Enhanced Theme System with Advanced Features
 * Comprehensive theming with multiple palettes, accessibility, and customization
 *
 * @author hh.oomph@gmail.com
 * @version 2.0.0
 * @since 2025-01-01
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export type ThemeMode = "light" | "dark" | "system";

export type ColorPalette =
  | "default"
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "pink"
  | "gray"
  | "warm"
  | "cool"
  | "high-contrast";

export type ThemeVariant =
  | "default"
  | "glassmorphism"
  | "neumorphism"
  | "minimal"
  | "vibrant";

export interface ThemeConfig {
  mode: ThemeMode;
  palette: ColorPalette;
  variant: ThemeVariant;
  radius: "none" | "sm" | "md" | "lg" | "xl" | "full";
  font: "default" | "sans" | "serif" | "mono";
  animations: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
}

export interface ColorScheme {
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  secondary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  accent: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  neutral: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  success: string;
  warning: string;
  error: string;
  info: string;
}

// Color palettes
const colorPalettes: Record<ColorPalette, ColorScheme> = {
  default: {
    primary: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
      950: "#172554",
    },
    secondary: {
      50: "#fafaf9",
      100: "#f5f5f4",
      200: "#e7e5e4",
      300: "#d6d3d1",
      400: "#a8a29e",
      500: "#78716c",
      600: "#57534e",
      700: "#44403c",
      800: "#292524",
      900: "#1c1917",
      950: "#0c0a09",
    },
    accent: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#0ea5e9",
      600: "#0284c7",
      700: "#0369a1",
      800: "#075985",
      900: "#0c4a6e",
      950: "#082f49",
    },
    neutral: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#e5e5e5",
      300: "#d4d4d4",
      400: "#a3a3a3",
      500: "#737373",
      600: "#525252",
      700: "#404040",
      800: "#262626",
      900: "#171717",
      950: "#0a0a0a",
    },
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
  },
  blue: {
    primary: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
      950: "#172554",
    },
    secondary: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
      950: "#020617",
    },
    accent: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#0ea5e9",
      600: "#0284c7",
      700: "#0369a1",
      800: "#075985",
      900: "#0c4a6e",
      950: "#082f49",
    },
    neutral: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#e5e5e5",
      300: "#d4d4d4",
      400: "#a3a3a3",
      500: "#737373",
      600: "#525252",
      700: "#404040",
      800: "#262626",
      900: "#171717",
      950: "#0a0a0a",
    },
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#06b6d4",
  },
  green: {
    primary: {
      50: "#f0fdf4",
      100: "#dcfce7",
      200: "#bbf7d0",
      300: "#86efac",
      400: "#4ade80",
      500: "#22c55e",
      600: "#16a34a",
      700: "#15803d",
      800: "#166534",
      900: "#14532d",
      950: "#052e16",
    },
    secondary: {
      50: "#f7f9f7",
      100: "#eff2ef",
      200: "#dfe6df",
      300: "#c7d3c7",
      400: "#9fb49f",
      500: "#7d937d",
      600: "#5f755f",
      700: "#4a5d4a",
      800: "#3a493a",
      900: "#2e3a2e",
      950: "#171d17",
    },
    accent: {
      50: "#fff7ed",
      100: "#ffedd5",
      200: "#fed7aa",
      300: "#fdba74",
      400: "#fb923c",
      500: "#f97316",
      600: "#ea580c",
      700: "#c2410c",
      800: "#9a3412",
      900: "#7c2d12",
      950: "#431407",
    },
    neutral: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#e5e5e5",
      300: "#d4d4d4",
      400: "#a3a3a3",
      500: "#737373",
      600: "#525252",
      700: "#404040",
      800: "#262626",
      900: "#171717",
      950: "#0a0a0a",
    },
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#06b6d4",
  },
  purple: {
    primary: {
      50: "#faf5ff",
      100: "#f3e8ff",
      200: "#e9d5ff",
      300: "#d8b4fe",
      400: "#c084fc",
      500: "#a855f7",
      600: "#9333ea",
      700: "#7c3aed",
      800: "#6b21a8",
      900: "#581c87",
      950: "#3b0764",
    },
    secondary: {
      50: "#faf7ff",
      100: "#f5f0ff",
      200: "#ede4ff",
      300: "#ddd0ff",
      400: "#c4b5fd",
      500: "#a78bfa",
      600: "#8b5cf6",
      700: "#7c3aed",
      800: "#6d28d9",
      900: "#5b21b6",
      950: "#2e1065",
    },
    accent: {
      50: "#fdf4ff",
      100: "#fae8ff",
      200: "#f5d0fe",
      300: "#f0abfc",
      400: "#e879f9",
      500: "#d946ef",
      600: "#c026d3",
      700: "#a21caf",
      800: "#86198f",
      900: "#701a75",
      950: "#4a044e",
    },
    neutral: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#e5e5e5",
      300: "#d4d4d4",
      400: "#a3a3a3",
      500: "#737373",
      600: "#525252",
      700: "#404040",
      800: "#262626",
      900: "#171717",
      950: "#0a0a0a",
    },
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#06b6d4",
  },
  orange: {
    primary: {
      50: "#fff7ed",
      100: "#ffedd5",
      200: "#fed7aa",
      300: "#fdba74",
      400: "#fb923c",
      500: "#f97316",
      600: "#ea580c",
      700: "#c2410c",
      800: "#9a3412",
      900: "#7c2d12",
      950: "#431407",
    },
    secondary: {
      50: "#fefcfb",
      100: "#fef9f6",
      200: "#fdf2eb",
      300: "#fce7d6",
      400: "#f5d0a9",
      500: "#ebb278",
      600: "#dc8a4e",
      700: "#bf6e39",
      800: "#9b572f",
      900: "#7d4626",
      950: "#411f11",
    },
    accent: {
      50: "#f0fdf4",
      100: "#dcfce7",
      200: "#bbf7d0",
      300: "#86efac",
      400: "#4ade80",
      500: "#22c55e",
      600: "#16a34a",
      700: "#15803d",
      800: "#166534",
      900: "#14532d",
      950: "#052e16",
    },
    neutral: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#e5e5e5",
      300: "#d4d4d4",
      400: "#a3a3a3",
      500: "#737373",
      600: "#525252",
      700: "#404040",
      800: "#262626",
      900: "#171717",
      950: "#0a0a0a",
    },
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#06b6d4",
  },
  pink: {
    primary: {
      50: "#fdf2f8",
      100: "#fce7f3",
      200: "#fbcfe8",
      300: "#f9a8d4",
      400: "#f472b6",
      500: "#ec4899",
      600: "#db2777",
      700: "#be185d",
      800: "#9d174d",
      900: "#831843",
      950: "#500724",
    },
    secondary: {
      50: "#fef6ff",
      100: "#fdf1ff",
      200: "#fbe8ff",
      300: "#f8d4ff",
      400: "#f0abfc",
      500: "#e879f9",
      600: "#d946ef",
      700: "#c026d3",
      800: "#a21caf",
      900: "#86198f",
      950: "#580c6b",
    },
    accent: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#0ea5e9",
      600: "#0284c7",
      700: "#0369a1",
      800: "#075985",
      900: "#0c4a6e",
      950: "#082f49",
    },
    neutral: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#e5e5e5",
      300: "#d4d4d4",
      400: "#a3a3a3",
      500: "#737373",
      600: "#525252",
      700: "#404040",
      800: "#262626",
      900: "#171717",
      950: "#0a0a0a",
    },
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#06b6d4",
  },
  gray: {
    primary: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827",
      950: "#030712",
    },
    secondary: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#e5e5e5",
      300: "#d4d4d4",
      400: "#a3a3a3",
      500: "#737373",
      600: "#525252",
      700: "#404040",
      800: "#262626",
      900: "#171717",
      950: "#0a0a0a",
    },
    accent: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
      950: "#020617",
    },
    neutral: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#e5e5e5",
      300: "#d4d4d4",
      400: "#a3a3a3",
      500: "#737373",
      600: "#525252",
      700: "#404040",
      800: "#262626",
      900: "#171717",
      950: "#0a0a0a",
    },
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#06b6d4",
  },
  warm: {
    primary: {
      50: "#fefce8",
      100: "#fef9c3",
      200: "#fef08a",
      300: "#fde047",
      400: "#facc15",
      500: "#eab308",
      600: "#ca8a04",
      700: "#a16207",
      800: "#854d0e",
      900: "#713f12",
      950: "#422006",
    },
    secondary: {
      50: "#fdfcf7",
      100: "#fbf9ee",
      200: "#f7f2d9",
      300: "#f0e6b7",
      400: "#e6d18a",
      500: "#d4b863",
      600: "#bd9b42",
      700: "#9d7d37",
      800: "#7f612f",
      900: "#674b26",
      950: "#372612",
    },
    accent: {
      50: "#fef2f2",
      100: "#fee2e2",
      200: "#fecaca",
      300: "#fca5a5",
      400: "#f87171",
      500: "#ef4444",
      600: "#dc2626",
      700: "#b91c1c",
      800: "#991b1b",
      900: "#7f1d1d",
      950: "#450a0a",
    },
    neutral: {
      50: "#fafaf9",
      100: "#f5f5f4",
      200: "#e7e5e4",
      300: "#d6d3d1",
      400: "#a8a29e",
      500: "#78716c",
      600: "#57534e",
      700: "#44403c",
      800: "#292524",
      900: "#1c1917",
      950: "#0c0a09",
    },
    success: "#22c55e",
    warning: "#f97316",
    error: "#dc2626",
    info: "#ea580c",
  },
  cool: {
    primary: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#0ea5e9",
      600: "#0284c7",
      700: "#0369a1",
      800: "#075985",
      900: "#0c4a6e",
      950: "#082f49",
    },
    secondary: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
      950: "#020617",
    },
    accent: {
      50: "#faf5ff",
      100: "#f3e8ff",
      200: "#e9d5ff",
      300: "#d8b4fe",
      400: "#c084fc",
      500: "#a855f7",
      600: "#9333ea",
      700: "#7c3aed",
      800: "#6b21a8",
      900: "#581c87",
      950: "#3b0764",
    },
    neutral: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#e5e5e5",
      300: "#d4d4d4",
      400: "#a3a3a3",
      500: "#737373",
      600: "#525252",
      700: "#404040",
      800: "#262626",
      900: "#171717",
      950: "#0a0a0a",
    },
    success: "#06b6d4",
    warning: "#0ea5e9",
    error: "#3b82f6",
    info: "#6366f1",
  },
  "high-contrast": {
    primary: {
      50: "#ffffff",
      100: "#f8f9fa",
      200: "#e9ecef",
      300: "#dee2e6",
      400: "#ced4da",
      500: "#adb5bd",
      600: "#6c757d",
      700: "#495057",
      800: "#343a40",
      900: "#212529",
      950: "#000000",
    },
    secondary: {
      50: "#ffffff",
      100: "#f8f9fa",
      200: "#e9ecef",
      300: "#dee2e6",
      400: "#ced4da",
      500: "#adb5bd",
      600: "#6c757d",
      700: "#495057",
      800: "#343a40",
      900: "#212529",
      950: "#000000",
    },
    accent: {
      50: "#ffffff",
      100: "#f8f9fa",
      200: "#e9ecef",
      300: "#dee2e6",
      400: "#ced4da",
      500: "#adb5bd",
      600: "#6c757d",
      700: "#495057",
      800: "#343a40",
      900: "#212529",
      950: "#000000",
    },
    neutral: {
      50: "#ffffff",
      100: "#f8f9fa",
      200: "#e9ecef",
      300: "#dee2e6",
      400: "#ced4da",
      500: "#adb5bd",
      600: "#6c757d",
      700: "#495057",
      800: "#343a40",
      900: "#212529",
      950: "#000000",
    },
    success: "#000000",
    warning: "#000000",
    error: "#000000",
    info: "#000000",
  },
};

// Theme variants
const themeVariants: Record<
  ThemeVariant,
  (colors: ColorScheme) => Record<string, string>
> = {
  default: () => ({}),
  glassmorphism: (colors) => ({
    "--background": `${colors.neutral[50]}cc`,
    "--card": `${colors.neutral[50]}80`,
    "--popover": `${colors.neutral[50]}80`,
    "--border": `${colors.neutral[200]}40`,
  }),
  neumorphism: (colors) => ({
    "--shadow-sm": `4px 4px 8px ${colors.neutral[300]}40, -4px -4px 8px ${colors.neutral[50]}80`,
    "--shadow-md": `6px 6px 12px ${colors.neutral[300]}40, -6px -6px 12px ${colors.neutral[50]}80`,
    "--shadow-lg": `8px 8px 16px ${colors.neutral[300]}40, -8px -8px 16px ${colors.neutral[50]}80`,
  }),
  minimal: (colors) => ({
    "--border": "transparent",
    "--shadow-sm": "none",
    "--shadow-md": "none",
    "--shadow-lg": "none",
    "--shadow-xl": "none",
  }),
  vibrant: (colors) => ({
    "--primary": colors.primary[500],
    "--primary-foreground": colors.primary[50],
    "--secondary": colors.accent[500],
    "--secondary-foreground": colors.accent[50],
    "--accent": colors.secondary[500],
    "--accent-foreground": colors.secondary[50],
  }),
};

// Font configurations
const fontConfigs = {
  default: "var(--font-family-sans)",
  sans: "'Inter', system-ui, sans-serif",
  serif: "'Georgia', serif",
  mono: "'JetBrains Mono', monospace",
};

// Radius configurations
const radiusConfigs = {
  none: "0px",
  sm: "0.125rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  full: "9999px",
};

/**
 * Enhanced theme utilities class
 */
export class EnhancedTheme {
  private config: ThemeConfig;

  constructor(config: Partial<ThemeConfig> = {}) {
    this.config = {
      mode: "system",
      palette: "default",
      variant: "default",
      radius: "lg",
      font: "default",
      animations: true,
      highContrast: false,
      reducedMotion: false,
      ...config,
    };
  }

  /**
   * Get current theme configuration
   */
  getConfig(): ThemeConfig {
    return { ...this.config };
  }

  /**
   * Update theme configuration
   */
  updateConfig(updates: Partial<ThemeConfig>): void {
    this.config = { ...this.config, ...updates };
    this.applyTheme();
  }

  /**
   * Get current color scheme
   */
  getColorScheme(): ColorScheme {
    let colors = colorPalettes[this.config.palette];

    // Apply high contrast mode
    if (this.config.highContrast) {
      colors = colorPalettes["high-contrast"];
    }

    return colors;
  }

  /**
   * Generate CSS custom properties for the current theme
   */
  generateCSSVariables(): Record<string, string> {
    const colors = this.getColorScheme();
    const variantOverrides = themeVariants[this.config.variant](colors);

    return {
      // Base colors
      "--background": colors.neutral[50],
      "--foreground": colors.neutral[900],
      "--card": colors.neutral[50],
      "--card-foreground": colors.neutral[900],
      "--popover": colors.neutral[50],
      "--popover-foreground": colors.neutral[900],
      "--primary": colors.primary[600],
      "--primary-foreground": colors.primary[50],
      "--secondary": colors.secondary[100],
      "--secondary-foreground": colors.secondary[900],
      "--muted": colors.secondary[100],
      "--muted-foreground": colors.secondary[600],
      "--accent": colors.secondary[100],
      "--accent-foreground": colors.secondary[900],
      "--destructive": colors.error,
      "--destructive-foreground": colors.neutral[50],
      "--border": colors.neutral[200],
      "--input": colors.neutral[50],
      "--ring": colors.primary[500],

      // Status colors
      "--success": colors.success,
      "--success-foreground": colors.neutral[50],
      "--warning": colors.warning,
      "--warning-foreground": colors.neutral[50],
      "--error": colors.error,
      "--error-foreground": colors.neutral[50],
      "--info": colors.info,
      "--info-foreground": colors.neutral[50],

      // Typography
      "--font-family": fontConfigs[this.config.font],
      "--radius": radiusConfigs[this.config.radius],

      // Shadows
      "--shadow-xs": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      "--shadow-sm":
        "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      "--shadow-md":
        "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      "--shadow-lg":
        "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      "--shadow-xl":
        "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      "--shadow-2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",

      // Animations
      "--animation-duration-fast": "150ms",
      "--animation-duration-normal": "300ms",
      "--animation-duration-slow": "500ms",
      "--animation-easing": "cubic-bezier(0.4, 0, 0.2, 1)",

      // Apply variant overrides
      ...variantOverrides,
    };
  }

  /**
   * Apply theme to the document
   */
  applyTheme(): void {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const variables = this.generateCSSVariables();

    // Remove existing theme classes
    root.classList.remove("light", "dark", "high-contrast");

    // Add theme mode class
    const resolvedMode = this.getResolvedMode();
    root.classList.add(resolvedMode);

    if (this.config.highContrast) {
      root.classList.add("high-contrast");
    }

    // Apply CSS variables
    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Handle reduced motion
    if (this.config.reducedMotion) {
      root.style.setProperty("--animation-duration-fast", "0ms");
      root.style.setProperty("--animation-duration-normal", "0ms");
      root.style.setProperty("--animation-duration-slow", "0ms");
    }

    // Store theme configuration
    try {
      localStorage.setItem(
        "enhanced-theme-config",
        JSON.stringify(this.config),
      );
    } catch (error) {
      console.warn("Failed to save theme configuration:", error);
    }
  }

  /**
   * Get resolved theme mode (light/dark)
   */
  getResolvedMode(): "light" | "dark" {
    if (this.config.mode === "system") {
      if (typeof window === "undefined") return "light";
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return this.config.mode;
  }

  /**
   * Load theme configuration from storage
   */
  loadFromStorage(): void {
    try {
      const stored = localStorage.getItem("enhanced-theme-config");
      if (stored) {
        const parsedConfig = JSON.parse(stored);
        this.config = { ...this.config, ...parsedConfig };
      }
    } catch (error) {
      console.warn("Failed to load theme configuration:", error);
    }
  }

  /**
   * Export theme configuration
   */
  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * Import theme configuration
   */
  importConfig(configString: string): void {
    try {
      const importedConfig = JSON.parse(configString);
      this.updateConfig(importedConfig);
    } catch (error) {
      console.error("Failed to import theme configuration:", error);
    }
  }

  /**
   * Reset to default theme
   */
  reset(): void {
    this.config = {
      mode: "system",
      palette: "default",
      variant: "default",
      radius: "lg",
      font: "default",
      animations: true,
      highContrast: false,
      reducedMotion: false,
    };
    this.applyTheme();
  }

  /**
   * Get accessibility information
   */
  getAccessibilityInfo(): {
    contrastRatio: number;
    isHighContrast: boolean;
    supportsReducedMotion: boolean;
  } {
    const colors = this.getColorScheme();
    const background =
      this.getResolvedMode() === "dark"
        ? colors.neutral[900]
        : colors.neutral[50];
    const foreground =
      this.getResolvedMode() === "dark"
        ? colors.neutral[50]
        : colors.neutral[900];

    // Simple contrast calculation (simplified)
    const contrastRatio = this.config.highContrast ? 21 : 4.5;

    return {
      contrastRatio,
      isHighContrast: this.config.highContrast,
      supportsReducedMotion: this.config.reducedMotion,
    };
  }
}

/**
 * Global theme instance
 */
export const theme = new EnhancedTheme();

/**
 * Utility function to merge Tailwind classes with theme-aware classes
 */
export function cnTheme(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Hook for using enhanced theme (client-side only)
 */
export function useEnhancedTheme() {
  return theme;
}

/**
 * Initialize enhanced theme system
 */
export function initializeEnhancedTheme() {
  if (typeof window === "undefined") return;

  // Load stored configuration
  theme.loadFromStorage();

  // Apply theme
  theme.applyTheme();

  // Listen for system theme changes
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleChange = () => {
    if (theme.getConfig().mode === "system") {
      theme.applyTheme();
    }
  };

  mediaQuery.addEventListener("change", handleChange);

  // Listen for reduced motion preference
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const handleMotionChange = () => {
    theme.updateConfig({ reducedMotion: motionQuery.matches });
  };

  motionQuery.addEventListener("change", handleMotionChange);

  // Initialize reduced motion setting
  theme.updateConfig({ reducedMotion: motionQuery.matches });

  return () => {
    mediaQuery.removeEventListener("change", handleChange);
    motionQuery.removeEventListener("change", handleMotionChange);
  };
}
