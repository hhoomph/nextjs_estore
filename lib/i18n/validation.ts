/**
 * Internationalization validation utilities
 *
 * This module provides utilities for validating locales and internationalization
 * setup throughout the application.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import { type AppLocale as Locale } from "../../i18n/types";

const locales = ["en", "fa"] as const;

/**
 * Validate if a locale string is supported
 * @param locale - Locale string to validate
 * @returns True if locale is valid and supported
 */
export function validateLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

/**
 * Validate locale from URL parameter
 * @param locale - Raw locale from URL params
 * @returns Validated locale or default locale
 */
export function validateLocaleFromParams(
  locale: string | string[] | undefined,
): Locale {
  if (typeof locale === "string" && validateLocale(locale)) {
    return locale;
  }

  // Handle array case (shouldn't happen with proper routing)
  if (Array.isArray(locale) && locale.length > 0 && validateLocale(locale[0])) {
    return locale[0];
  }

  // Return default locale for invalid cases
  return "en";
}

/**
 * Get fallback locale for unsupported locales
 * @param requestedLocale - The requested locale
 * @returns Supported fallback locale
 */
export function getFallbackLocale(requestedLocale: string): Locale {
  // If it's already valid, return it
  if (validateLocale(requestedLocale)) {
    return requestedLocale as Locale;
  }

  // Check for language matches (e.g., 'en-US' -> 'en')
  const languageCode = requestedLocale.split("-")[0];
  if (validateLocale(languageCode)) {
    return languageCode as Locale;
  }

  // Return default locale
  return "en";
}

/**
 * Check if a locale is the default locale
 * @param locale - Locale to check
 * @returns True if it's the default locale
 */
export function isDefaultLocale(locale: string): boolean {
  return locale === "en";
}

/**
 * Get locale display name
 * @param locale - Locale code
 * @returns Human-readable locale name
 */
export function getLocaleDisplayName(locale: Locale): string {
  const names: Record<Locale, string> = {
    en: "English",
    fa: "فارسی",
  };

  return names[locale] || locale.toUpperCase();
}

/**
 * Get locale direction (LTR/RTL)
 * @param locale - Locale code
 * @returns Text direction
 */
export function getLocaleDirection(locale: Locale): "ltr" | "rtl" {
  const rtlLocales: Locale[] = ["fa"];
  return rtlLocales.includes(locale) ? "rtl" : "ltr";
}

/**
 * Validate message keys exist in translations
 * @param locale - Locale to check
 * @param keys - Array of message keys to validate
 * @returns Object with validation results
 */
export async function validateMessageKeys(locale: Locale, keys: string[]) {
  try {
    const messages = (await import(`../../messages/${locale}.json`)).default;
    const missingKeys: string[] = [];
    const existingKeys: string[] = [];

    keys.forEach((key) => {
      if (hasNestedProperty(messages, key)) {
        existingKeys.push(key);
      } else {
        missingKeys.push(key);
      }
    });

    return {
      locale,
      totalKeys: keys.length,
      existingKeys,
      missingKeys,
      isValid: missingKeys.length === 0,
    };
  } catch (error) {
    return {
      locale,
      totalKeys: keys.length,
      existingKeys: [],
      missingKeys: keys,
      isValid: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check if nested property exists in object
 * @param obj - Object to check
 * @param path - Dot-separated path (e.g., 'nav.home')
 * @returns True if property exists
 */
function hasNestedProperty(obj: any, path: string): boolean {
  return (
    path.split(".").reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj) !== undefined
  );
}

/**
 * Validate all locales have required message keys
 * @param requiredKeys - Array of required message keys
 * @returns Validation results for all locales
 */
export async function validateAllLocales(requiredKeys: string[]) {
  const results = await Promise.all(
    locales.map((locale) => validateMessageKeys(locale, requiredKeys)),
  );

  const summary = {
    totalLocales: locales.length,
    validLocales: results.filter((r) => r.isValid).length,
    invalidLocales: results.filter((r) => !r.isValid).length,
    results,
  };

  return summary;
}

/**
 * Get locale from Accept-Language header
 * @param acceptLanguage - Accept-Language header value
 * @returns Best matching supported locale
 */
export function getLocaleFromAcceptLanguage(acceptLanguage: string): Locale {
  if (!acceptLanguage) return "en";

  // Parse Accept-Language header
  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      const [locale, quality = "1"] = lang.trim().split(";q=");
      return {
        locale: locale.split("-")[0], // Get language code
        quality: parseFloat(quality),
      };
    })
    .sort((a, b) => b.quality - a.quality);

  // Find first supported locale
  for (const { locale } of languages) {
    if (validateLocale(locale)) {
      return locale as Locale;
    }
  }

  // Return default if no match
  return "en";
}
