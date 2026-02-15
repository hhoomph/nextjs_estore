/**
 * Cookie-based locale management utilities
 *
 * Provides functions for getting, setting, and managing locale preferences via cookies.
 * Persian (fa) is the default locale with RTL support.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import type { NextRequest, NextResponse } from "next/server";

export type CookieLocale = "en" | "fa";

export interface LocaleCookieConfig {
  name: string;
  maxAge: number;
  path: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "strict" | "lax" | "none";
}

export const LOCALE_COOKIE_NAME = "app-locale";
export const DEFAULT_LOCALE: CookieLocale = "fa";
export const SUPPORTED_LOCALES: CookieLocale[] = ["en", "fa"];

export const defaultCookieConfig: LocaleCookieConfig = {
  name: LOCALE_COOKIE_NAME,
  maxAge: 365 * 24 * 60 * 60, // 1 year in seconds
  path: "/",
  httpOnly: false, // Allow client-side access
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
};

/**
 * Validate if a locale is supported
 */
export function isValidLocale(locale: string): locale is CookieLocale {
  return SUPPORTED_LOCALES.includes(locale as CookieLocale);
}

/**
 * Get locale from cookie in middleware/request context
 */
export function getCookieLocale(request: NextRequest): CookieLocale {
  const cookieValue = request.cookies.get(LOCALE_COOKIE_NAME)?.value;

  if (cookieValue && isValidLocale(cookieValue)) {
    return cookieValue;
  }

  return DEFAULT_LOCALE;
}

/**
 * Set locale cookie on response
 */
export function setCookieLocale(
  locale: CookieLocale,
  response: NextResponse,
  config: Partial<LocaleCookieConfig> = {},
): void {
  const mergedConfig = { ...defaultCookieConfig, ...config };

  response.cookies.set({
    name: mergedConfig.name,
    value: locale,
    maxAge: mergedConfig.maxAge,
    path: mergedConfig.path,
    httpOnly: mergedConfig.httpOnly,
    secure: mergedConfig.secure,
    sameSite: mergedConfig.sameSite,
  });
}

/**
 * Check if locale is RTL
 */
export function isRTLLocale(locale: CookieLocale): boolean {
  return locale === "fa";
}

/**
 * Get HTML direction based on locale
 */
export function getLocaleDirection(locale: CookieLocale): "rtl" | "ltr" {
  return isRTLLocale(locale) ? "rtl" : "ltr";
}

/**
 * Get alternate locale (for language switching)
 */
export function getAlternateLocale(locale: CookieLocale): CookieLocale {
  return locale === "fa" ? "en" : "fa";
}
