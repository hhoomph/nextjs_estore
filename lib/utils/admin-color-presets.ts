/**
 * Admin color presets and associated color helpers.
 *
 * Provides a shared preset definition + applyColorPreset() so that both
 * the dashboard customize menu and the theme settings page use the same
 * token updates.
 */

export interface ColorPreset {
  id: string;
  label: string;
  primary: string;
  secondary: string;
  background: string;
  foreground: string;
  border: string;
  primarySoft: string;
  gradientEnd: string;
}

export const COLOR_PRESETS: readonly ColorPreset[] = [
  {
    id: "apex-blue",
    label: "Apex Blue",
    primary: "#2563eb",
    secondary: "#64748b",
    background: "#f8fafc",
    foreground: "#0f172a",
    border: "#e2e8f0",
    primarySoft: "#dbeafe",
    gradientEnd: "#7c3aed",
  },
  {
    id: "emerald",
    label: "Emerald",
    primary: "#059669",
    secondary: "#64748b",
    background: "#f8fafc",
    foreground: "#0f172a",
    border: "#e2e8f0",
    primarySoft: "#d1fae5",
    gradientEnd: "#0891b2",
  },
  {
    id: "violet",
    label: "Violet",
    primary: "#7c3aed",
    secondary: "#64748b",
    background: "#f8fafc",
    foreground: "#0f172a",
    border: "#e2e8f0",
    primarySoft: "#ede9fe",
    gradientEnd: "#2563eb",
  },
  {
    id: "rose",
    label: "Rose",
    primary: "#e11d48",
    secondary: "#64748b",
    background: "#f8fafc",
    foreground: "#0f172a",
    border: "#e2e8f0",
    primarySoft: "#ffe4e6",
    gradientEnd: "#f97316",
  },
  {
    id: "orange",
    label: "Orange",
    primary: "#ea580c",
    secondary: "#64748b",
    background: "#f8fafc",
    foreground: "#0f172a",
    border: "#e2e8f0",
    primarySoft: "#ffedd5",
    gradientEnd: "#d97706",
  },
];

export function hexToHslString(hex: string): string {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace("#", "");
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function componentToHex(value: number): string {
  const clamped = Math.max(0, Math.min(255, Math.round(value)));
  return clamped.toString(16).padStart(2, "0");
}

function darkenHex(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `#${componentToHex(r - amount)}${componentToHex(g - amount)}${componentToHex(b - amount)}`;
}

export function applyColorPreset(preset: ColorPreset) {
  const root = document.documentElement;

  // Core tokens
  root.style.setProperty("--primary", hexToHslString(preset.primary));
  root.style.setProperty("--secondary", hexToHslString(preset.secondary));
  root.style.setProperty("--background", hexToHslString(preset.background));
  root.style.setProperty("--foreground", hexToHslString(preset.foreground));
  root.style.setProperty("--border", hexToHslString(preset.border));

  const primaryHover = darkenHex(preset.primary, 20);
  const primaryActive = darkenHex(preset.primary, 35);

  root.style.setProperty("--primary-hover", hexToHslString(primaryHover));
  root.style.setProperty("--primary-active", hexToHslString(primaryActive));
  root.style.setProperty("--primary-foreground", "#ffffff");
  root.style.setProperty("--secondary-hover", hexToHslString(preset.background));
  root.style.setProperty("--muted-hover", hexToHslString(preset.border));
  root.style.setProperty("--accent-hover", hexToHslString(preset.background));
  root.style.setProperty("--border-hover", hexToHslString(preset.border));
  root.style.setProperty("--input-hover", hexToHslString(preset.background));
  root.style.setProperty("--ring-offset", hexToHslString(preset.background));
  root.style.setProperty("--secondary-active", hexToHslString(preset.border));
  root.style.setProperty("--muted-active", hexToHslString(preset.border));
  root.style.setProperty("--accent-active", hexToHslString(preset.border));

  // Apex dedicated tokens
  root.style.setProperty("--apex-primary", hexToHslString(preset.primary));
  root.style.setProperty("--apex-sidebar-active", preset.primary);
  root.style.setProperty("--apex-secondary", hexToHslString(preset.secondary));
  root.style.setProperty("--apex-bg", hexToHslString(preset.background));
  root.style.setProperty("--apex-foreground", hexToHslString(preset.foreground));
  root.style.setProperty("--apex-border", hexToHslString(preset.border));
  root.style.setProperty("--apex-border-soft", hexToHslString(preset.border));
  root.style.setProperty("--apex-primary-soft", hexToHslString(preset.primarySoft));
  root.style.setProperty(
    "--apex-gradient-primary",
    `linear-gradient(135deg, ${preset.primary} 0%, ${preset.gradientEnd} 100%)`
  );
  root.style.setProperty("--chart-1", hexToHslString(preset.primary));
}
