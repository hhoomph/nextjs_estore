/**
 * Translation utilities with fallback handling
 *
 * Provides safe translation functions that handle missing keys gracefully.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import { useTranslations as useNextIntlTranslations } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";

type GetTranslationsFn = typeof getTranslations;
type UseTranslationsFn = typeof useNextIntlTranslations;

/**
 * Server-side translation function with fallback handling
 * Handles missing translation keys gracefully with readable fallbacks
 */
export async function getTranslationsWithFallback(
  namespace?: Parameters<GetTranslationsFn>[0],
) {
  const t = await getTranslations(namespace);
  const locale = await getLocale();

  return (key: string, values?: Record<string, string | number | Date>) => {
    try {
      const result = t(key, values);
      // Check if the result indicates a missing translation
      if (
        result === key ||
        (typeof result === "string" && result?.includes?.("MISSING_MESSAGE"))
      ) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `Missing translation key: ${namespace ? `${namespace}.` : ""}${key} for locale: ${locale}`,
          );
        }
        // Return a readable fallback
        return key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
          .trim();
      }
      return result;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `Translation error for key: ${namespace ? `${namespace}.` : ""}${key}`,
          error,
        );
      }
      // Return a readable fallback
      return key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
    }
  };
}

/**
 * Client-side translation hook with fallback handling
 */
export function useTranslationsWithFallback(
  namespace?: Parameters<UseTranslationsFn>[0],
) {
  const t = useNextIntlTranslations(namespace);

  return (key: string, values?: Record<string, string | number | Date>) => {
    try {
      const result = t(key, values);
      // Check if the result indicates a missing translation
      if (
        result === key ||
        (typeof result === "string" && result?.includes?.("MISSING_MESSAGE"))
      ) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `Missing translation key: ${namespace ? `${namespace}.` : ""}${key}`,
          );
        }
        // Return a readable fallback
        return key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
          .trim();
      }
      return result;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `Translation error for key: ${namespace ? `${namespace}.` : ""}${key}`,
          error,
        );
      }
      // Return a readable fallback
      return key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
    }
  };
}

/**
 * Convert camelCase or PascalCase to readable text
 */
export function toReadableText(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}
