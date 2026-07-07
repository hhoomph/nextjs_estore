/**
 * Module for route
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { type NextRequest, NextResponse } from "next/server";
import { getSiteSettings, updateSiteSettings } from "@/lib/actions/seo";
import { auth } from "@/lib/auth/config";
import type { SiteSettingsData } from "@/lib/validations/schemas/seo";

const DEFAULT_SETTINGS = {
  site_title_en: "My E-commerce Store",
  site_title_fa: "فروشگاه آنلاین من",
  phone_en: "+1 (555) 123-4567",
  phone_fa: "021-12345678",
  description_en: "A modern e-commerce platform",
  description_fa: "پلتفرم فروش آنلاین مدرن",
  default_seo_title: "My E-commerce Store - Online Shopping",
  default_seo_description:
    "Shop the best products online with fast shipping and great prices.",
  default_og_image: null,
  google_analytics_id: null,
  maintenance_mode: false,
  allow_registration: true,
  default_currency: "IRR",
  low_stock_threshold: 10,
};

const LANGUAGE_MODE_OPTIONS = ["multilingual", "single_fa", "single_en"] as const;
const LANGUAGE_OPTIONS = ["fa", "en"] as const;
const SUGGESTION_ALGORITHM_OPTIONS = ["popularity", "similarity", "recent", "hybrid"] as const;

function normalizeLanguageMode(value: unknown): SiteSettingsData["language_mode"] {
  if (LANGUAGE_MODE_OPTIONS.includes(value as SiteSettingsData["language_mode"])) {
    return value as SiteSettingsData["language_mode"];
  }
  return "multilingual";
}

function normalizeLanguage(value: unknown): SiteSettingsData["default_language"] {
  if (LANGUAGE_OPTIONS.includes(value as SiteSettingsData["default_language"])) {
    return value as SiteSettingsData["default_language"];
  }
  return "fa";
}

function normalizeSuggestionAlgorithm(value: unknown): SiteSettingsData["suggestion_algorithm"] {
  if (SUGGESTION_ALGORITHM_OPTIONS.includes(value as SiteSettingsData["suggestion_algorithm"])) {
    return value as SiteSettingsData["suggestion_algorithm"];
  }
  return "hybrid";
}

// GET /api/admin/settings - Get current settings
export async function GET(request: NextRequest) {
  try {
    const result = await getSiteSettings();
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch settings" },
        { status: 500 },
      );
    }

    let frontendSettings;

    if (result.settings) {
      const s = result.settings;
      frontendSettings = {
        siteName: s.siteTitleEn ?? "",
        siteDescription: s.descriptionEn ?? "",
        contactEmail: s.phoneEn ?? "",
        maintenanceMode: s.maintenanceMode ?? false,
        allowRegistration: s.allowRegistration ?? true,
        defaultCurrency: s.defaultCurrency || "IRR",
        lowStockThreshold: s.lowStockThreshold ?? 10,
        siteTitleFa: s.siteTitleFa || "",
        phoneFa: s.phoneFa || "",
        descriptionFa: s.descriptionFa || "",
        defaultSeoTitle: s.defaultSeoTitle || "",
        defaultSeoDescription: s.defaultSeoDescription || "",
        defaultOgImage: s.defaultOgImage || "",
        googleAnalyticsId: s.googleAnalyticsId || "",
      };
    } else {
      frontendSettings = {
        siteName: DEFAULT_SETTINGS.site_title_en,
        siteDescription: DEFAULT_SETTINGS.description_en,
        contactEmail: DEFAULT_SETTINGS.phone_en,
        maintenanceMode: DEFAULT_SETTINGS.maintenance_mode,
        allowRegistration: DEFAULT_SETTINGS.allow_registration,
        defaultCurrency: DEFAULT_SETTINGS.default_currency,
        lowStockThreshold: DEFAULT_SETTINGS.low_stock_threshold,
        siteTitleFa: DEFAULT_SETTINGS.site_title_fa,
        phoneFa: DEFAULT_SETTINGS.phone_fa,
        descriptionFa: DEFAULT_SETTINGS.description_fa,
        defaultSeoTitle: DEFAULT_SETTINGS.default_seo_title,
        defaultSeoDescription: DEFAULT_SETTINGS.default_seo_description,
        defaultOgImage: DEFAULT_SETTINGS.default_og_image,
        googleAnalyticsId: DEFAULT_SETTINGS.google_analytics_id,
      };
    }

    return NextResponse.json({ settings: frontendSettings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

// PUT /api/admin/settings - Update settings (supports partial updates)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const partial = body as Partial<{
      siteName: string;
      siteDescription: string;
      contactEmail: string;
      maintenanceMode: boolean;
      allowRegistration: boolean;
      defaultCurrency: string;
      lowStockThreshold: number;
      siteTitleFa: string;
      phoneFa: string;
      descriptionFa: string;
      defaultSeoTitle: string;
      defaultSeoDescription: string;
      defaultOgImage: string | null;
      googleAnalyticsId: string | null;
    }>;

    // Validate input
    if (partial.siteName !== undefined && typeof partial.siteName !== "string") {
      return NextResponse.json({ error: "Invalid site name" }, { status: 400 });
    }
    if (
      partial.siteDescription !== undefined &&
      typeof partial.siteDescription !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid site description" },
        { status: 400 },
      );
    }
    if (
      partial.contactEmail !== undefined &&
      typeof partial.contactEmail !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid contact email" },
        { status: 400 },
      );
    }
    if (
      partial.maintenanceMode !== undefined &&
      typeof partial.maintenanceMode !== "boolean"
    ) {
      return NextResponse.json(
        { error: "Invalid maintenance mode" },
        { status: 400 },
      );
    }
    if (
      partial.allowRegistration !== undefined &&
      typeof partial.allowRegistration !== "boolean"
    ) {
      return NextResponse.json(
        { error: "Invalid registration setting" },
        { status: 400 },
      );
    }
    if (
      partial.defaultCurrency !== undefined &&
      typeof partial.defaultCurrency !== "string"
    ) {
      return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
    }
    if (
      partial.lowStockThreshold !== undefined &&
      (typeof partial.lowStockThreshold !== "number" || partial.lowStockThreshold < 0)
    ) {
      return NextResponse.json(
        { error: "Invalid low stock threshold" },
        { status: 400 },
      );
    }

    // Fetch current settings and merge with partial update to avoid
    // sibling fields being reset when individual tabs save.
    const currentResult = await getSiteSettings();
    if (!currentResult.success || !currentResult.settings) {
      return NextResponse.json(
        { error: "Failed to load current settings" },
        { status: 500 },
      );
    }

    const current = currentResult.settings;
    const normalizeString = (value: unknown) => (typeof value === "string" ? value : "");
    const normalizeNullableString = (value: unknown) => (value === null || value === undefined ? null : normalizeString(value));

    const currentSite = current as Record<string, unknown>;

    const payload: SiteSettingsData = {
      site_title_en: normalizeString(partial.siteName ?? currentSite.site_title_en ?? currentSite.siteTitleEn),
      site_title_fa: normalizeString(partial.siteTitleFa ?? currentSite.site_title_fa ?? currentSite.siteTitleFa),
      phone_en: normalizeString(partial.contactEmail ?? currentSite.phone_en ?? currentSite.phoneEn),
      phone_fa: normalizeString(partial.phoneFa ?? currentSite.phone_fa ?? currentSite.phoneFa),
      description_en: normalizeString(partial.siteDescription ?? currentSite.description_en ?? currentSite.descriptionEn),
      description_fa: normalizeString(partial.descriptionFa ?? currentSite.description_fa ?? currentSite.descriptionFa),
      language_mode: normalizeLanguageMode(currentSite.language_mode ?? currentSite.languageMode ?? "multilingual"),
      default_language: normalizeLanguage(currentSite.default_language ?? currentSite.defaultLanguage ?? "fa"),
      enable_product_suggestions: (currentSite.enable_product_suggestions as boolean | undefined) ?? (currentSite.enableProductSuggestions as boolean | undefined) ?? true,
      suggestion_algorithm: normalizeSuggestionAlgorithm(currentSite.suggestion_algorithm ?? currentSite.suggestionAlgorithm ?? "hybrid"),
      max_suggestions: (currentSite.max_suggestions as number | undefined) ?? (currentSite.maxSuggestions as number | undefined) ?? 6,
      default_seo_title: normalizeNullableString(partial.defaultSeoTitle ?? currentSite.default_seo_title ?? currentSite.defaultSeoTitle) ?? "",
      default_seo_description: normalizeNullableString(partial.defaultSeoDescription ?? currentSite.default_seo_description ?? currentSite.defaultSeoDescription) ?? "",
      default_og_image: normalizeNullableString(partial.defaultOgImage ?? currentSite.default_og_image ?? currentSite.defaultOgImage) ?? "",
      google_analytics_id: normalizeNullableString(partial.googleAnalyticsId ?? currentSite.google_analytics_id ?? currentSite.googleAnalyticsId) ?? "",
      maintenance_mode: partial.maintenanceMode ?? (currentSite.maintenance_mode as boolean | undefined) ?? (currentSite.maintenanceMode as boolean | undefined) ?? false,
      allow_registration: partial.allowRegistration ?? (currentSite.allow_registration as boolean | undefined) ?? (currentSite.allowRegistration as boolean | undefined) ?? true,
      default_currency: partial.defaultCurrency ?? (currentSite.default_currency as string | undefined) ?? (currentSite.defaultCurrency as string | undefined) ?? "IRR",
      low_stock_threshold: partial.lowStockThreshold ?? (currentSite.low_stock_threshold as number | undefined) ?? (currentSite.lowStockThreshold as number | undefined) ?? 0,
    };

    const result = await updateSiteSettings(payload);
    if (!result.success || !result.settings) {
      return NextResponse.json(
        { error: result.error || "Failed to update settings" },
        { status: 500 },
      );
    }

    const settings = result.settings;
    const frontendSettings = {
      siteName: settings.siteTitleEn,
      siteDescription: settings.descriptionEn,
      contactEmail: settings.phoneEn,
      maintenanceMode: settings.maintenanceMode,
      allowRegistration: settings.allowRegistration,
      defaultCurrency: settings.defaultCurrency,
      lowStockThreshold: settings.lowStockThreshold,
      siteTitleFa: settings.siteTitleFa,
      phoneFa: settings.phoneFa,
      descriptionFa: settings.descriptionFa,
      defaultSeoTitle: settings.defaultSeoTitle,
      defaultSeoDescription: settings.defaultSeoDescription,
      defaultOgImage: settings.defaultOgImage,
      googleAnalyticsId: settings.googleAnalyticsId,
    };

    return NextResponse.json({
      message: "Settings updated successfully",
      settings: frontendSettings,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}