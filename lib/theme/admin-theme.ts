/**
 * Shared admin theme helpers.
 *
 * Persists and applies custom store colors (CSS custom properties) so the
 * admin theme configuration survives refreshes and applies across every page,
 * not only the theme settings screen.
 */
import { hexToHslString } from "@/lib/utils/admin-color-presets";

export const ADMIN_THEME_STORAGE_KEY = "admin-theme-settings";
export const ADMIN_THEME_UPDATED_EVENT = "admin-theme-updated";

export interface AdminThemeSettings {
  mode: "light" | "dark" | "system";
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  foregroundColor: string;
  borderColor: string;
}

export const DEFAULT_ADMIN_THEME: AdminThemeSettings = {
  mode: "system",
  primaryColor: "#2563eb",
  secondaryColor: "#64748b",
  backgroundColor: "#f8fafc",
  foregroundColor: "#0f172a",
  borderColor: "#e2e8f0",
};

const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;

export function isAdminThemeSettings(value: unknown): value is AdminThemeSettings {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    (v.mode === "light" || v.mode === "dark" || v.mode === "system") &&
    typeof v.primaryColor === "string" &&
    HEX_COLOR_RE.test(v.primaryColor) &&
    typeof v.secondaryColor === "string" &&
    HEX_COLOR_RE.test(v.secondaryColor) &&
    typeof v.backgroundColor === "string" &&
    HEX_COLOR_RE.test(v.backgroundColor) &&
    typeof v.foregroundColor === "string" &&
    HEX_COLOR_RE.test(v.foregroundColor) &&
    typeof v.borderColor === "string" &&
    HEX_COLOR_RE.test(v.borderColor)
  );
}

function darkenHex(hex: string, amount: number): string {
  const normalized = hex.replace("#", "");
  const r = Math.max(0, parseInt(normalized.slice(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(normalized.slice(2, 4), 16) - amount);
  const b = Math.max(0, parseInt(normalized.slice(4, 6), 16) - amount);

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/**
 * Applies a set of theme colors to the document as CSS custom properties.
 */
export function applyAdminTheme(data: AdminThemeSettings): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  root.style.setProperty("--primary", hexToHslString(data.primaryColor));
  root.style.setProperty("--secondary", hexToHslString(data.secondaryColor));
  root.style.setProperty("--background", hexToHslString(data.backgroundColor));
  root.style.setProperty("--foreground", hexToHslString(data.foregroundColor));
  root.style.setProperty("--border", hexToHslString(data.borderColor));

  root.style.setProperty("--primary-hover", hexToHslString(darkenHex(data.primaryColor, 20)));
  root.style.setProperty("--primary-active", hexToHslString(darkenHex(data.primaryColor, 35)));
  root.style.setProperty("--primary-foreground", "#ffffff");
  root.style.setProperty("--secondary-hover", hexToHslString(data.backgroundColor));
  root.style.setProperty("--muted-hover", hexToHslString(data.borderColor));
  root.style.setProperty("--accent-hover", hexToHslString(data.backgroundColor));
  root.style.setProperty("--border-hover", hexToHslString(data.borderColor));
  root.style.setProperty("--input-hover", hexToHslString(data.backgroundColor));
  root.style.setProperty("--ring-offset", hexToHslString(data.backgroundColor));
  root.style.setProperty("--secondary-active", hexToHslString(data.borderColor));
  root.style.setProperty("--muted-active", hexToHslString(data.borderColor));
  root.style.setProperty("--accent-active", hexToHslString(data.borderColor));

  root.style.setProperty("--apex-primary", hexToHslString(data.primaryColor));
  root.style.setProperty("--apex-secondary", hexToHslString(data.secondaryColor));
  root.style.setProperty("--apex-bg", hexToHslString(data.backgroundColor));
  root.style.setProperty("--apex-foreground", hexToHslString(data.foregroundColor));
  root.style.setProperty("--apex-border", hexToHslString(data.borderColor));
  root.style.setProperty("--apex-border-soft", hexToHslString(data.borderColor));
  root.style.setProperty(
    "--apex-primary-soft",
    `color-mix(in srgb, ${data.primaryColor} 10%, white)`,
  );
  root.style.setProperty(
    "--apex-gradient-primary",
    `linear-gradient(135deg, ${data.primaryColor} 0%, ${data.secondaryColor} 100%)`,
  );
  root.style.setProperty("--apex-sidebar-active", data.primaryColor);
  root.style.setProperty("--chart-1", hexToHslString(data.primaryColor));
}

/**
 * Reads the persisted admin theme from localStorage (or null).
 */
export function loadStoredAdminTheme(): AdminThemeSettings | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(ADMIN_THEME_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isAdminThemeSettings(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Reads the persisted admin theme and applies it. No-op when nothing saved.
 */
export function applyStoredAdminTheme(): void {
  const stored = loadStoredAdminTheme();
  if (stored) {
    applyAdminTheme(stored);
  }
}
