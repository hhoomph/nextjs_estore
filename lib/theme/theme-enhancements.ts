/**
 * Comprehensive Theme Enhancement System
 *
 * Modern design system with enhanced typography, colors, and spacing
 * for both Persian and English languages with accessibility support.
 *
 * @author hh.oomph@gmail.com
 * @version 2.0.0
 * @since 2025-01-01
 */

// Modern Color Palette with Enhanced Accessibility
export const modernColorPalette = {
  // Primary Brand Colors - Modern Blue Palette
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6", // Main primary
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
    950: "#172554",
  },

  // Secondary Colors - Warm Gray Palette
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

  // Accent Colors - Vibrant Options
  accent: {
    emerald: "#10b981",
    amber: "#f59e0b",
    rose: "#f43f5e",
    violet: "#8b5cf6",
    cyan: "#06b6d4",
    lime: "#84cc16",
  },

  // Status Colors with Better Contrast
  status: {
    success: {
      50: "#f0fdf4",
      500: "#22c55e",
      700: "#15803d",
    },
    warning: {
      50: "#fffbeb",
      500: "#f59e0b",
      700: "#b45309",
    },
    error: {
      50: "#fef2f2",
      500: "#ef4444",
      700: "#b91c1c",
    },
    info: {
      50: "#eff6ff",
      500: "#3b82f6",
      700: "#1d4ed8",
    },
  },

  // Neutral Grays - Improved Scale
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
};

// Enhanced Typography Scale with Persian Support
export const typographySystem = {
  // Font Families with Fallbacks
  fontFamily: {
    sans: [
      "Inter",
      "system-ui",
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "sans-serif",
    ],
    persian: [
      "Vazirmatn",
      "IranSans",
      "Shabnam",
      "Inter",
      "system-ui",
      "sans-serif",
    ],
    mono: [
      "JetBrains Mono",
      "Fira Code",
      "Monaco",
      "Cascadia Code",
      "Roboto Mono",
      "Consolas",
      "monospace",
    ],
    display: ["Cal Sans", "Inter", "system-ui", "sans-serif"],
  },

  // Enhanced Font Sizes with Better Scale
  fontSize: {
    xs: ["0.75rem", { lineHeight: "1rem" }],
    sm: ["0.875rem", { lineHeight: "1.25rem" }],
    base: ["1rem", { lineHeight: "1.5rem" }],
    lg: ["1.125rem", { lineHeight: "1.75rem" }],
    xl: ["1.25rem", { lineHeight: "1.75rem" }],
    "2xl": ["1.5rem", { lineHeight: "2rem" }],
    "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
    "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
    "5xl": ["3rem", { lineHeight: "1" }],
    "6xl": ["3.75rem", { lineHeight: "1" }],
    "7xl": ["4.5rem", { lineHeight: "1" }],
    "8xl": ["6rem", { lineHeight: "1" }],
    "9xl": ["8rem", { lineHeight: "1" }],
  },

  // Font Weights with Persian Support
  fontWeight: {
    thin: "100",
    extralight: "200",
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
  },

  // Letter Spacing for Better Readability
  letterSpacing: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0em",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },

  // Line Heights for Persian Text
  lineHeight: {
    none: "1",
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
    relaxed: "1.625",
    loose: "2",
    persian: "1.8", // Better for Persian text
  },

  // Persian-Specific Typography Rules
  persian: {
    fontSize: {
      small: "0.875rem",
      medium: "1rem",
      large: "1.125rem",
      xlarge: "1.25rem",
    },
    lineHeight: "1.8",
    letterSpacing: "0.01em",
    textAlign: "right" as const,
    direction: "rtl" as const,
  },
};

// Modern Spacing Scale
export const spacingScale = {
  px: "1px",
  0: "0",
  0.5: "0.125rem", // 2px
  1: "0.25rem", // 4px
  1.5: "0.375rem", // 6px
  2: "0.5rem", // 8px
  2.5: "0.625rem", // 10px
  3: "0.75rem", // 12px
  3.5: "0.875rem", // 14px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  7: "1.75rem", // 28px
  8: "2rem", // 32px
  9: "2.25rem", // 36px
  10: "2.5rem", // 40px
  11: "2.75rem", // 44px
  12: "3rem", // 48px
  14: "3.5rem", // 56px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
  28: "7rem", // 112px
  32: "8rem", // 128px
  36: "9rem", // 144px
  40: "10rem", // 160px
  44: "11rem", // 176px
  48: "12rem", // 192px
  52: "13rem", // 208px
  56: "14rem", // 224px
  60: "15rem", // 240px
  64: "16rem", // 256px
  72: "18rem", // 288px
  80: "20rem", // 320px
  96: "24rem", // 384px
};

// Enhanced Shadow System
export const shadowSystem = {
  none: "none",
  xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",

  // Colored shadows for interactive elements
  primary: "0 4px 14px 0 rgb(59 130 246 / 0.15)",
  secondary: "0 4px 14px 0 rgb(120 113 108 / 0.15)",
  success: "0 4px 14px 0 rgb(34 197 94 / 0.15)",
  warning: "0 4px 14px 0 rgb(245 158 11 / 0.15)",
  error: "0 4px 14px 0 rgb(239 68 68 / 0.15)",

  // Inner shadows for input elements
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  "inner-lg": "inset 0 2px 4px 0 rgb(0 0 0 / 0.1)",
};

// Border Radius System
export const borderRadiusSystem = {
  none: "0",
  xs: "0.125rem", // 2px
  sm: "0.25rem", // 4px
  md: "0.375rem", // 6px
  lg: "0.5rem", // 8px
  xl: "0.75rem", // 12px
  "2xl": "1rem", // 16px
  "3xl": "1.5rem", // 24px
  full: "9999px",
};

// Modern Animation System
export const animationSystem = {
  // Timing functions
  easing: {
    linear: "linear",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    "in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    elastic: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  },

  // Durations
  duration: {
    0: "0ms",
    75: "75ms",
    100: "100ms",
    150: "150ms",
    200: "200ms",
    300: "300ms",
    500: "500ms",
    700: "700ms",
    1000: "1000ms",
  },

  // Keyframe animations
  keyframes: {
    "fade-in": {
      "0%": { opacity: "0" },
      "100%": { opacity: "1" },
    },
    "fade-out": {
      "0%": { opacity: "1" },
      "100%": { opacity: "0" },
    },
    "slide-in-right": {
      "0%": { transform: "translateX(100%)", opacity: "0" },
      "100%": { transform: "translateX(0)", opacity: "1" },
    },
    "slide-in-left": {
      "0%": { transform: "translateX(-100%)", opacity: "0" },
      "100%": { transform: "translateX(0)", opacity: "1" },
    },
    "slide-in-up": {
      "0%": { transform: "translateY(100%)", opacity: "0" },
      "100%": { transform: "translateY(0)", opacity: "1" },
    },
    "slide-in-down": {
      "0%": { transform: "translateY(-100%)", opacity: "0" },
      "100%": { transform: "translateY(0)", opacity: "1" },
    },
    "scale-in": {
      "0%": { transform: "scale(0.95)", opacity: "0" },
      "100%": { transform: "scale(1)", opacity: "1" },
    },
    "scale-out": {
      "0%": { transform: "scale(1)", opacity: "1" },
      "100%": { transform: "scale(0.95)", opacity: "0" },
    },
    "bounce-in": {
      "0%": { transform: "scale(0.3)", opacity: "0" },
      "50%": { transform: "scale(1.05)" },
      "70%": { transform: "scale(0.9)" },
      "100%": { transform: "scale(1)", opacity: "1" },
    },
    pulse: {
      "0%, 100%": { opacity: "1" },
      "50%": { opacity: "0.5" },
    },
    ping: {
      "75%, 100%": { transform: "scale(2)", opacity: "0" },
    },
    spin: {
      "0%": { transform: "rotate(0deg)" },
      "100%": { transform: "rotate(360deg)" },
    },
  },
};

// Component-specific Design Tokens
export const componentDesignTokens = {
  button: {
    height: {
      xs: "1.5rem", // 24px
      sm: "2rem", // 32px
      md: "2.5rem", // 40px
      lg: "3rem", // 48px
      xl: "3.5rem", // 56px
    },
    padding: {
      xs: "0.5rem 0.75rem",
      sm: "0.5rem 1rem",
      md: "0.625rem 1.25rem",
      lg: "0.75rem 1.5rem",
      xl: "0.875rem 2rem",
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      md: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
    },
  },

  input: {
    height: {
      xs: "1.5rem",
      sm: "2rem",
      md: "2.5rem",
      lg: "3rem",
    },
    padding: {
      xs: "0.25rem 0.5rem",
      sm: "0.5rem 0.75rem",
      md: "0.625rem 1rem",
      lg: "0.75rem 1rem",
    },
  },

  card: {
    padding: {
      xs: "0.75rem",
      sm: "1rem",
      md: "1.5rem",
      lg: "2rem",
      xl: "2.5rem",
    },
    shadow: {
      none: "none",
      sm: shadowSystem.sm,
      md: shadowSystem.md,
      lg: shadowSystem.lg,
      xl: shadowSystem.xl,
    },
  },

  modal: {
    maxWidth: {
      xs: "20rem", // 320px
      sm: "24rem", // 384px
      md: "28rem", // 448px
      lg: "32rem", // 512px
      xl: "36rem", // 576px
      "2xl": "42rem", // 672px
      "3xl": "48rem", // 768px
      "4xl": "56rem", // 896px
      "5xl": "64rem", // 1024px
      "6xl": "72rem", // 1152px
      "7xl": "80rem", // 1280px
    },
  },
};

// Persian Typography Enhancements
export const persianTypographyEnhancements = {
  // Persian font stacks with better fallbacks
  fontFamily: {
    primary: [
      "Vazirmatn",
      "IRANSans",
      "Shabnam",
      "Inter",
      "system-ui",
      "sans-serif",
    ],
    secondary: [
      "IRANSans",
      "Vazirmatn",
      "Shabnam",
      "Inter",
      "system-ui",
      "sans-serif",
    ],
    mono: ["Vazirmatn Mono", "JetBrains Mono", "Fira Code", "monospace"],
  },

  // Persian-specific text styles
  textStyles: {
    heading: {
      fontFamily: "var(--font-persian)",
      fontWeight: "600",
      lineHeight: "1.3",
      letterSpacing: "-0.01em",
    },
    body: {
      fontFamily: "var(--font-persian)",
      fontWeight: "400",
      lineHeight: "1.8",
      letterSpacing: "0.01em",
    },
    caption: {
      fontFamily: "var(--font-persian)",
      fontWeight: "400",
      lineHeight: "1.6",
      letterSpacing: "0.02em",
    },
  },

  // RTL layout utilities
  rtlUtilities: {
    textAlign: "right",
    direction: "rtl",
    marginLeft: "auto",
    marginRight: "0",
  },
};

// Theme Configuration for Light and Dark Modes
export const themeConfigurations = {
  light: {
    colors: {
      background: modernColorPalette.neutral[50],
      foreground: modernColorPalette.neutral[900],
      card: modernColorPalette.neutral[50],
      "card-foreground": modernColorPalette.neutral[900],
      primary: modernColorPalette.primary[600],
      "primary-foreground": modernColorPalette.primary[50],
      secondary: modernColorPalette.secondary[100],
      "secondary-foreground": modernColorPalette.secondary[900],
      muted: modernColorPalette.secondary[100],
      "muted-foreground": modernColorPalette.secondary[600],
      accent: modernColorPalette.secondary[100],
      "accent-foreground": modernColorPalette.secondary[900],
      border: modernColorPalette.neutral[200],
      input: modernColorPalette.neutral[50],
      ring: modernColorPalette.primary[500],
    },
  },

  dark: {
    colors: {
      background: modernColorPalette.neutral[950],
      foreground: modernColorPalette.neutral[50],
      card: modernColorPalette.neutral[900],
      "card-foreground": modernColorPalette.neutral[50],
      primary: modernColorPalette.primary[500],
      "primary-foreground": modernColorPalette.primary[950],
      secondary: modernColorPalette.secondary[800],
      "secondary-foreground": modernColorPalette.secondary[50],
      muted: modernColorPalette.secondary[800],
      "muted-foreground": modernColorPalette.secondary[400],
      accent: modernColorPalette.secondary[800],
      "accent-foreground": modernColorPalette.secondary[50],
      border: modernColorPalette.neutral[800],
      input: modernColorPalette.neutral[900],
      ring: modernColorPalette.primary[400],
    },
  },
};

// Utility Functions
export const themeUtils = {
  // Get color value with theme awareness
  getColor: (color: string, theme: "light" | "dark" = "light"): string => {
    return (
      themeConfigurations[theme].colors[
        color as keyof typeof themeConfigurations.light.colors
      ] || color
    );
  },

  // Generate CSS custom properties
  generateCSSVariables: (
    theme: "light" | "dark" = "light",
  ): Record<string, string> => {
    const colors = themeConfigurations[theme].colors;
    const variables: Record<string, string> = {};

    Object.entries(colors).forEach(([key, value]) => {
      variables[`--${key}`] = value;
    });

    return variables;
  },

  // Create responsive typography
  createResponsiveTypography: (baseSize: number, scale: number = 1.2) => {
    return {
      xs: `${baseSize * scale ** -1}rem`,
      sm: `${baseSize * scale ** 0}rem`,
      md: `${baseSize * scale ** 1}rem`,
      lg: `${baseSize * scale ** 2}rem`,
      xl: `${baseSize * scale ** 3}rem`,
    };
  },

  // Persian text utilities
  isPersianText: (text: string): boolean => {
    const persianRegex =
      /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return persianRegex.test(text);
  },

  // Apply Persian-specific styles
  applyPersianStyles: (element: HTMLElement): void => {
    element.style.direction = "rtl";
    element.style.textAlign = "right";
    element.style.fontFamily = "var(--font-persian)";
  },
};

// Export everything as a cohesive design system
export const modernDesignSystem = {
  colors: modernColorPalette,
  typography: typographySystem,
  spacing: spacingScale,
  shadows: shadowSystem,
  borderRadius: borderRadiusSystem,
  animations: animationSystem,
  components: componentDesignTokens,
  persian: persianTypographyEnhancements,
  themes: themeConfigurations,
  utils: themeUtils,
};
