"use client";

/**
 * Applies the persisted admin theme colors on every page load so the storefront
 * (and every other page) reflects the admin theme configuration, not only the
 * theme settings screen. Re-applies when another tab saves a new theme.
 */
import { useEffect } from "react";
import {
  ADMIN_THEME_UPDATED_EVENT,
  applyStoredAdminTheme,
} from "@/lib/theme/admin-theme";

export function AdminThemeBootstrap() {
  useEffect(() => {
    applyStoredAdminTheme();

    const handleUpdate = () => applyStoredAdminTheme();
    window.addEventListener(ADMIN_THEME_UPDATED_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(ADMIN_THEME_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return null;
}
