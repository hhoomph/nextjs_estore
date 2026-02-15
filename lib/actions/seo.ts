/**
 * Module for seo
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/database";
import type { SEOData, SiteSettingsData } from "@/lib/validations/schemas/seo";
import { seoSchema, siteSettingsSchema } from "@/lib/validations/schemas/seo";

export async function updateProductSEO(productId: string, data: SEOData) {
  try {
    const validatedData = seoSchema.parse(data);

    // Transform snake_case to camelCase for Prisma
    const prismaData = {
      seoTitle: validatedData.seo_title,
      seoDescription: validatedData.seo_description,
      seoKeywords: validatedData.seo_keywords,
      ogImage: validatedData.og_image,
      canonicalUrl: validatedData.canonical_url,
    };

    const product = await prisma.product.update({
      where: { id: productId },
      data: prismaData,
    });

    revalidatePath(`/products/${product.slug}`);
    revalidatePath("/admin/products");

    return { success: true, product };
  } catch (error) {
    console.error("Error updating product SEO:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update product SEO" };
  }
}

export async function getSiteSettings() {
  try {
    // Since we want only one settings record, get the first one or create default
    let settings = await prisma.siteSettings.findFirst();

    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.siteSettings.create({
        data: {
          siteTitleEn: "E-commerce Store",
          siteTitleFa: "فروشگاه آنلاین",
          maintenanceMode: false,
          allowRegistration: true,
          defaultCurrency: "USD",
          lowStockThreshold: 10,
        },
      });
    }

    return { success: true, settings };
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return { success: false, error: "Failed to fetch site settings" };
  }
}

export async function updateSiteSettings(data: SiteSettingsData) {
  try {
    const validatedData = siteSettingsSchema.parse(data);

    // Transform snake_case to camelCase for Prisma
    const prismaData = {
      siteTitleEn: validatedData.site_title_en,
      siteTitleFa: validatedData.site_title_fa,
      descriptionEn: validatedData.description_en,
      descriptionFa: validatedData.description_fa,
      maintenanceMode: validatedData.maintenance_mode,
      allowRegistration: validatedData.allow_registration,
      defaultCurrency: validatedData.default_currency,
      lowStockThreshold: validatedData.low_stock_threshold,
      defaultOgImage: validatedData.default_og_image,
    };

    // Update or create settings (ensure only one record exists)
    const settings = await prisma.siteSettings.upsert({
      where: { id: "default" }, // Using a fixed ID since we want only one record
      update: prismaData,
      create: { ...prismaData, id: "default" },
    });

    // Revalidate all pages that might use site settings
    revalidatePath("/");
    revalidatePath("/admin/settings");

    return { success: true, settings };
  } catch (error) {
    console.error("Error updating site settings:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update site settings" };
  }
}

export async function generateProductSEO(productId: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        productPictures: {
          include: { picture: true },
          orderBy: { displayOrder: "asc" },
          take: 1,
        },
      },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    // Generate SEO data based on product information
    const seoData = {
      seo_title:
        product.seoTitle || `${product.name} - ${product.category?.name}`,
      seo_description:
        product.seoDescription ||
        product.desc?.substring(0, 155) +
          (product.desc && product.desc.length > 155 ? "..." : ""),
      seo_keywords:
        product.seoKeywords || `${product.category?.name}, ${product.name}`,
      canonical_url:
        product.canonicalUrl ||
        `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}`,
      og_image: product.ogImage || product.productPictures?.[0]?.picture.url,
    };

    return { success: true, seoData };
  } catch (error) {
    console.error("Error generating product SEO:", error);
    return { success: false, error: "Failed to generate product SEO" };
  }
}

export async function generateSiteMetadata() {
  try {
    const settingsResult = await getSiteSettings();

    if (!settingsResult.success || !settingsResult.settings) {
      return {
        success: false,
        error: settingsResult.error || "Settings not found",
      };
    }

    const settings = settingsResult.settings;

    // Generate metadata based on current language (this would be enhanced with i18n)
    const metadata = {
      title: {
        default: settings.siteTitleEn,
        template: `%s | ${settings.siteTitleEn}`,
      },
      description:
        settings.descriptionEn || `Welcome to ${settings.siteTitleEn}`,
      keywords: ["ecommerce", "online shopping", "products"],
      authors: [{ name: settings.siteTitleEn }],
      openGraph: {
        title: settings.siteTitleEn,
        description:
          settings.descriptionEn || `Welcome to ${settings.siteTitleEn}`,
        url: process.env.NEXT_PUBLIC_APP_URL,
        siteName: settings.siteTitleEn,
        images: settings.defaultOgImage
          ? [{ url: settings.defaultOgImage }]
          : [],
        locale: "en_US",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: settings.siteTitleEn,
        description:
          settings.descriptionEn || `Welcome to ${settings.siteTitleEn}`,
        images: settings.defaultOgImage ? [settings.defaultOgImage] : [],
      },
      robots: {
        index: !settings.maintenanceMode,
        follow: !settings.maintenanceMode,
      },
      alternates: {
        canonical: process.env.NEXT_PUBLIC_APP_URL,
      },
    };

    return { success: true, metadata };
  } catch (error) {
    console.error("Error generating site metadata:", error);
    return { success: false, error: "Failed to generate site metadata" };
  }
}
