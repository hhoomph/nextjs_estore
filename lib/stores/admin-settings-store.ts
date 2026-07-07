// lib/stores/admin-settings-store.ts
/**
 * Admin Settings Store - Zustand State Management for Admin Settings
 *
 * Centralized store for admin settings to prevent overlapping writes and
 * enable partial (PATCH-style) saves across the settings UI.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2026-06-26
 */

import { create } from "zustand";

export interface AdminSettingsState {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  defaultCurrency: string;
  lowStockThreshold: number;
  siteTitleFa?: string;
  phoneFa?: string;
  descriptionFa?: string;
  defaultSeoTitle?: string;
  defaultSeoDescription?: string;
  defaultOgImage?: string;
  googleAnalyticsId?: string;
}

interface AdminSettingsStore extends AdminSettingsState {
  loading: boolean;
  saving: boolean;
  error: string;
  lastSavedAt?: string;
  fetchSettings: () => Promise<void>;
  updateSettings: (partial: Partial<AdminSettingsState>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

const DEFAULT_SETTINGS: AdminSettingsState = {
  siteName: "Apex Store",
  siteDescription: "Default store description",
  contactEmail: "support@apexstore.test",
  maintenanceMode: false,
  allowRegistration: true,
  defaultCurrency: "IRR",
  lowStockThreshold: 5,
  siteTitleFa: "",
  phoneFa: "",
  descriptionFa: "",
  defaultSeoTitle: "",
  defaultSeoDescription: "",
  defaultOgImage: "",
  googleAnalyticsId: "",
};

export const useAdminSettingsStore = create<AdminSettingsStore>((set, get) => ({
  ...DEFAULT_SETTINGS,
  loading: false,
  saving: false,
  error: "",

  fetchSettings: async () => {
    set({ loading: true, error: "" });

    try {
      const response = await fetch("/api/admin/settings");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch settings");
      }

      const settings = data.settings ?? {};
      set({
        ...DEFAULT_SETTINGS,
        ...settings,
        loading: false,
        lastSavedAt: new Date().toISOString(),
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch settings",
        loading: false,
      });
    }
  },

  updateSettings: async (partial) => {
    const current = get();
    set({ saving: true, error: "" });

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(partial),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update settings");
      }

      set({
        ...current,
        ...result.settings,
        saving: false,
        lastSavedAt: new Date().toISOString(),
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to save settings",
        saving: false,
      });
    }
  },

  resetToDefaults: async () => {
    set({ saving: true, error: "" });

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(DEFAULT_SETTINGS),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to reset settings");
      }

      set({
        ...DEFAULT_SETTINGS,
        ...result.settings,
        saving: false,
        lastSavedAt: new Date().toISOString(),
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to reset settings",
        saving: false,
      });
    }
  },
}));