/**
 * Theme Color Management System
 *
 * Dynamic theme color management with database persistence
 * and real-time application across light/dark modes.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import { getSiteSettings, updateSiteSettings } from "@/lib/actions/seo";

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
}

export interface ThemeColorSettings {
  light: ThemeColors;
  dark: ThemeColors;
}

export interface ColorValidationResult {
  isValid: boolean;
  errors: string[];
}

// Default theme colors
export const defaultThemeColors: ThemeColorSettings = {
  light: {
    primary: "#3b82f6",
    secondary: "#78716c",
    accent: "#10b981",
    background: "#ffffff",
    foreground: "#171717",
  },
  dark: {
    primary: "#60a5fa",
    secondary: "#a8a29e",
    accent: "#10b981",
    background: "#0a0a0a",
    foreground: "#fafafa",
  },
};

// Hex color validation regex
const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

/**
 * Validates a hex color string
 */
export function validateHexColor(color: string): boolean {
  return hexColorRegex.test(color);
}

/**
 * Validates theme color settings
 */
export function validateThemeColors(
  colors: ThemeColorSettings,
): ColorValidationResult {
  const errors: string[] = [];

  // Validate light mode colors
  Object.entries(colors.light).forEach(([key, value]) => {
    if (!validateHexColor(value)) {
      errors.push(`Invalid light mode ${key} color: ${value}`);
    }
  });

  // Validate dark mode colors
  Object.entries(colors.dark).forEach(([key, value]) => {
    if (!validateHexColor(value)) {
      errors.push(`Invalid dark mode ${key} color: ${value}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Calculates color contrast ratio for accessibility
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  // Convert hex colors to RGB
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 4.5;

  // Calculate relative luminance
  const luminance1 = calculateRelativeLuminance(rgb1);
  const luminance2 = calculateRelativeLuminance(rgb2);

  // Calculate contrast ratio
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  hex = hex.replace(/^#/, "");

  // Parse hex values
  let r, g, b;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substr(0, 2), 16);
    g = parseInt(hex.substr(2, 2), 16);
    b = parseInt(hex.substr(4, 2), 16);
  } else {
    return null;
  }

  return { r, g, b };
}

/**
 * Calculate relative luminance
 */
function calculateRelativeLuminance(rgb: {
  r: number;
  g: number;
  b: number;
}): number {
  // Convert RGB values to sRGB
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  // Apply gamma correction
  const rLinear = r <= 0.03928 ? r / 12.92 : ((r + 0.055) / 1.055) ** 2.4;
  const gLinear = g <= 0.03928 ? g / 12.92 : ((g + 0.055) / 1.055) ** 2.4;
  const bLinear = b <= 0.03928 ? b / 12.92 : ((b + 0.055) / 1.055) ** 2.4;

  // Calculate relative luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Generates CSS custom properties from theme colors
 */
export function generateThemeCSS(
  colors: ThemeColorSettings,
  mode: "light" | "dark" = "light",
): Record<string, string> {
  const themeColors = colors[mode];

  return {
    "--color-primary": themeColors.primary,
    "--color-secondary": themeColors.secondary,
    "--color-accent": themeColors.accent,
    "--color-background": themeColors.background,
    "--color-foreground": themeColors.foreground,
    // Additional semantic colors
    "--color-primary-hover": adjustColorBrightness(themeColors.primary, -10),
    "--color-primary-active": adjustColorBrightness(themeColors.primary, -20),
    "--color-secondary-hover": adjustColorBrightness(themeColors.secondary, 5),
    "--color-secondary-active": adjustColorBrightness(
      themeColors.secondary,
      10,
    ),
  };
}

/**
 * Adjusts color brightness by percentage
 */
function adjustColorBrightness(hex: string, percent: number): string {
  // Remove # if present
  hex = hex.replace(/^#/, "");

  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Adjust brightness
  const adjust = (color: number) => {
    const adjusted = color + (color * percent) / 100;
    return Math.min(255, Math.max(0, Math.round(adjusted)));
  };

  const newR = adjust(r);
  const newG = adjust(g);
  const newB = adjust(b);

  // Convert back to hex
  return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
}

/**
 * Applies theme colors to CSS variables
 */
export function applyThemeColors(
  colors: ThemeColorSettings,
  mode: "light" | "dark" = "light",
): void {
  if (typeof document === "undefined") return;

  const cssVariables = generateThemeCSS(colors, mode);

  Object.entries(cssVariables).forEach(([property, value]) => {
    document.documentElement.style.setProperty(property, value);
  });
}

/**
 * Loads theme colors from database
 */
export async function loadThemeColors(): Promise<ThemeColorSettings> {
  try {
    const result = await getSiteSettings();

    if (result.success && result.settings) {
      const settings = result.settings;

      return {
        light: {
          primary:
            settings.primaryColorLight || defaultThemeColors.light.primary,
          secondary:
            settings.secondaryColorLight || defaultThemeColors.light.secondary,
          accent: settings.accentColorLight || defaultThemeColors.light.accent,
          background:
            settings.backgroundColorLight ||
            defaultThemeColors.light.background,
          foreground:
            settings.foregroundColorLight ||
            defaultThemeColors.light.foreground,
        },
        dark: {
          primary: settings.primaryColorDark || defaultThemeColors.dark.primary,
          secondary:
            settings.secondaryColorDark || defaultThemeColors.dark.secondary,
          accent: settings.accentColorDark || defaultThemeColors.dark.accent,
          background:
            settings.backgroundColorDark || defaultThemeColors.dark.background,
          foreground:
            settings.foregroundColorDark || defaultThemeColors.dark.foreground,
        },
      };
    }
  } catch (error) {
    console.error("Failed to load theme colors from database:", error);
  }

  return defaultThemeColors;
}

/**
 * Saves theme colors to database
 */
export async function saveThemeColors(
  colors: ThemeColorSettings,
): Promise<boolean> {
  try {
    // Validate colors before saving
    const validation = validateThemeColors(colors);
    if (!validation.isValid) {
      console.error("Invalid theme colors:", validation.errors);
      return false;
    }

    // Get current settings to merge with theme colors
    const currentResult = await getSiteSettings();
    if (!currentResult.success || !currentResult.settings) {
      console.error("Failed to fetch current site settings");
      return false;
    }

    const currentSettings = currentResult.settings;

    // Prepare complete data for database update (merge current settings with theme colors)
    const updateData = {
      site_title_en: currentSettings.siteTitleEn || "E-commerce Store",
      site_title_fa: currentSettings.siteTitleFa || "فروشگاه آنلاین",
      phone_en: currentSettings.phoneEn || undefined,
      phone_fa: currentSettings.phoneFa || undefined,
      description_en: currentSettings.descriptionEn || undefined,
      description_fa: currentSettings.descriptionFa || undefined,
      language_mode: (currentSettings.languageMode as any) || "multilingual",
      default_language: (currentSettings.defaultLanguage as any) || "fa",
      enable_product_suggestions:
        currentSettings.enableProductSuggestions ?? true,
      suggestion_algorithm:
        (currentSettings.suggestionAlgorithm as any) || "hybrid",
      max_suggestions: currentSettings.maxSuggestions || 6,
      default_seo_title: currentSettings.defaultSeoTitle || undefined,
      default_seo_description:
        currentSettings.defaultSeoDescription || undefined,
      default_og_image: currentSettings.defaultOgImage || undefined,
      google_analytics_id: currentSettings.googleAnalyticsId || undefined,
      maintenance_mode: currentSettings.maintenanceMode ?? false,
      allow_registration: currentSettings.allowRegistration ?? true,
      default_currency: currentSettings.defaultCurrency || "USD",
      low_stock_threshold: currentSettings.lowStockThreshold || 10,
      // Theme colors
      primary_color_light: colors.light.primary,
      secondary_color_light: colors.light.secondary,
      accent_color_light: colors.light.accent,
      background_color_light: colors.light.background,
      foreground_color_light: colors.light.foreground,
      primary_color_dark: colors.dark.primary,
      secondary_color_dark: colors.dark.secondary,
      accent_color_dark: colors.dark.accent,
      background_color_dark: colors.dark.background,
      foreground_color_dark: colors.dark.foreground,
    };

    const result = await updateSiteSettings(updateData);
    return result.success;
  } catch (error) {
    console.error("Failed to save theme colors:", error);
    return false;
  }
}

/**
 * Resets theme colors to defaults
 */
export async function resetThemeColors(): Promise<boolean> {
  return await saveThemeColors(defaultThemeColors);
}

/**
 * Gets the current theme mode from next-themes
 */
export function getCurrentThemeMode(): "light" | "dark" {
  if (typeof window === "undefined") return "light";

  // Check for next-themes class on html element
  const htmlElement = document.documentElement;
  if (htmlElement.classList.contains("dark")) {
    return "dark";
  }

  return "light";
}

/**
 * Initializes theme color system
 */
export async function initializeThemeColors(): Promise<void> {
  try {
    const colors = await loadThemeColors();
    const currentMode = getCurrentThemeMode();
    applyThemeColors(colors, currentMode);
  } catch (error) {
    console.error("Failed to initialize theme colors:", error);
    // Apply defaults as fallback
    applyThemeColors(defaultThemeColors, "light");
  }
}

/**
 * Theme color manager class for advanced use cases
 */
export class ThemeColorManager {
  private colors: ThemeColorSettings;
  private currentMode: "light" | "dark";

  constructor(initialColors?: ThemeColorSettings) {
    this.colors = initialColors || defaultThemeColors;
    this.currentMode = "light";
  }

  /**
   * Sets the theme colors
   */
  setColors(colors: ThemeColorSettings): void {
    const validation = validateThemeColors(colors);
    if (!validation.isValid) {
      throw new Error(`Invalid theme colors: ${validation.errors.join(", ")}`);
    }

    this.colors = colors;
    this.applyCurrentMode();
  }

  /**
   * Gets the current theme colors
   */
  getColors(): ThemeColorSettings {
    return { ...this.colors };
  }

  /**
   * Sets the current theme mode
   */
  setMode(mode: "light" | "dark"): void {
    this.currentMode = mode;
    this.applyCurrentMode();
  }

  /**
   * Gets the current theme mode
   */
  getMode(): "light" | "dark" {
    return this.currentMode;
  }

  /**
   * Updates a specific color
   */
  updateColor(
    mode: "light" | "dark",
    colorKey: keyof ThemeColors,
    value: string,
  ): void {
    if (!validateHexColor(value)) {
      throw new Error(`Invalid hex color: ${value}`);
    }

    this.colors[mode][colorKey] = value;
    if (this.currentMode === mode) {
      this.applyCurrentMode();
    }
  }

  /**
   * Applies the current mode colors
   */
  private applyCurrentMode(): void {
    applyThemeColors(this.colors, this.currentMode);
  }

  /**
   * Resets to default colors
   */
  resetToDefaults(): void {
    this.colors = { ...defaultThemeColors };
    this.applyCurrentMode();
  }

  /**
   * Loads colors from database
   */
  async loadFromDatabase(): Promise<void> {
    this.colors = await loadThemeColors();
    this.applyCurrentMode();
  }

  /**
   * Saves colors to database
   */
  async saveToDatabase(): Promise<boolean> {
    return await saveThemeColors(this.colors);
  }
}
