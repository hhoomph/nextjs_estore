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

// Type for current settings (could be database result or defaults)
type CurrentSettings =
  | {
      language_mode?: string;
      default_language?: string;
      enable_product_suggestions?: boolean;
      suggestion_algorithm?: string;
      max_suggestions?: number;
      siteTitleEn?: string;
      siteTitleFa?: string;
      descriptionEn?: string;
      descriptionFa?: string;
      phoneEn?: string;
      phoneFa?: string;
      maintenanceMode?: boolean;
      allowRegistration?: boolean;
      defaultCurrency?: string;
      lowStockThreshold?: number;
    }
  | typeof DEFAULT_SETTINGS;

// Default settings for when no database record exists
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
  default_currency: "USD",
  low_stock_threshold: 10,
};

// GET /api/admin/settings - Get current settings (public - no auth required)
export async function GET(request: NextRequest) {
  try {
    // Site settings are public - no authentication required for reading
    // Only admin can write (PUT), but anyone can read (GET)

    // Fetch settings from database
    const result = await getSiteSettings();
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch settings" },
        { status: 500 },
      );
    }

    // Convert database format to frontend format
    let frontendSettings;

    if (result.settings) {
      // Database result (camelCase)
      const dbSettings = result.settings;
      frontendSettings = {
        siteName: dbSettings.siteTitleEn || "",
        siteDescription: dbSettings.descriptionEn || "",
        contactEmail: dbSettings.phoneEn || "",
        maintenanceMode: dbSettings.maintenanceMode ?? false,
        allowRegistration: dbSettings.allowRegistration ?? true,
        defaultCurrency: dbSettings.defaultCurrency || "USD",
        lowStockThreshold: dbSettings.lowStockThreshold || 10,
        siteTitleFa: dbSettings.siteTitleFa || "",
        phoneFa: dbSettings.phoneFa || "",
        descriptionFa: dbSettings.descriptionFa || "",
        defaultSeoTitle: dbSettings.defaultSeoTitle || "",
        defaultSeoDescription: dbSettings.defaultSeoDescription || "",
        defaultOgImage: dbSettings.defaultOgImage || "",
        googleAnalyticsId: dbSettings.googleAnalyticsId || "",
      };
    } else {
      // Default settings (snake_case)
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

// PUT /api/admin/settings - Update settings
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
    const {
      siteName,
      siteDescription,
      contactEmail,
      maintenanceMode,
      allowRegistration,
      defaultCurrency,
      lowStockThreshold,
      siteTitleFa,
      phoneFa,
      descriptionFa,
      defaultSeoTitle,
      defaultSeoDescription,
      defaultOgImage,
      googleAnalyticsId,
    } = body;

    // Validate input
    if (siteName && typeof siteName !== "string") {
      return NextResponse.json({ error: "Invalid site name" }, { status: 400 });
    }
    if (siteDescription && typeof siteDescription !== "string") {
      return NextResponse.json(
        { error: "Invalid site description" },
        { status: 400 },
      );
    }
    if (contactEmail && typeof contactEmail !== "string") {
      return NextResponse.json(
        { error: "Invalid contact email" },
        { status: 400 },
      );
    }
    if (maintenanceMode !== undefined && typeof maintenanceMode !== "boolean") {
      return NextResponse.json(
        { error: "Invalid maintenance mode" },
        { status: 400 },
      );
    }
    if (
      allowRegistration !== undefined &&
      typeof allowRegistration !== "boolean"
    ) {
      return NextResponse.json(
        { error: "Invalid registration setting" },
        { status: 400 },
      );
    }
    if (defaultCurrency && typeof defaultCurrency !== "string") {
      return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
    }
    if (
      lowStockThreshold !== undefined &&
      (typeof lowStockThreshold !== "number" || lowStockThreshold < 0)
    ) {
      return NextResponse.json(
        { error: "Invalid low stock threshold" },
        { status: 400 },
      );
    }

    // Prepare update data for database
    const updateData: SiteSettingsData = {
      site_title_en: siteName,
      site_title_fa: siteTitleFa,
      phone_en: contactEmail, // Using phone as contact for now
      phone_fa: phoneFa,
      description_en: siteDescription,
      description_fa: descriptionFa,
      // Language settings - use defaults (these properties not in current schema)
      language_mode: "multilingual",
      default_language: "fa",
      // Product suggestions - use defaults (these properties not in current schema)
      enable_product_suggestions: true,
      suggestion_algorithm: "hybrid",
      max_suggestions: 6,
      // SEO settings
      default_seo_title: defaultSeoTitle,
      default_seo_description: defaultSeoDescription,
      default_og_image: defaultOgImage,
      google_analytics_id: googleAnalyticsId,
      // Site configuration
      maintenance_mode: maintenanceMode,
      allow_registration: allowRegistration,
      default_currency: defaultCurrency,
      low_stock_threshold: lowStockThreshold,
    };

    // Update settings in database
    const result = await updateSiteSettings(updateData);
    if (!result.success || !result.settings) {
      return NextResponse.json(
        { error: result.error || "Failed to update settings" },
        { status: 500 },
      );
    }

    // Convert back to frontend format for response
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
