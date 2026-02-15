/**
 * Module for seo
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { z } from "zod";

export const seoSchema = z.object({
  seo_title: z
    .string()
    .max(60, "SEO title should be 60 characters or less")
    .optional(),
  seo_description: z
    .string()
    .max(160, "SEO description should be 160 characters or less")
    .optional(),
  seo_keywords: z.string().optional(),
  og_image: z.string().url("Invalid image URL").optional().or(z.literal("")),
  canonical_url: z
    .string()
    .url("Invalid canonical URL")
    .optional()
    .or(z.literal("")),
});

export const siteSettingsSchema = z.object({
  // Multilingual site settings
  site_title_en: z.string().min(1, "English site title is required"),
  site_title_fa: z.string().min(1, "Persian site title is required"),
  phone_en: z.string().optional(),
  phone_fa: z.string().optional(),
  description_en: z.string().optional(),
  description_fa: z.string().optional(),
  // Language settings
  language_mode: z
    .enum(["multilingual", "single_fa", "single_en"])
    .default("multilingual"),
  default_language: z.enum(["fa", "en"]).default("fa"),
  // Product suggestions
  enable_product_suggestions: z.boolean().default(true),
  suggestion_algorithm: z
    .enum(["popularity", "similarity", "recent", "hybrid"])
    .default("hybrid"),
  max_suggestions: z.number().min(1).max(20).default(6),
  // SEO settings
  default_seo_title: z
    .string()
    .max(60, "SEO title should be 60 characters or less")
    .optional(),
  default_seo_description: z
    .string()
    .max(160, "SEO description should be 160 characters or less")
    .optional(),
  default_og_image: z
    .string()
    .url("Invalid image URL")
    .optional()
    .or(z.literal("")),
  google_analytics_id: z.string().optional(),
  // Site configuration
  maintenance_mode: z.boolean().default(false),
  allow_registration: z.boolean().default(true),
  default_currency: z.string().min(1, "Currency is required"),
  low_stock_threshold: z.number().min(0, "Threshold must be 0 or greater"),
});

export type SEOData = z.infer<typeof seoSchema>;
export type SiteSettingsData = z.infer<typeof siteSettingsSchema>;
