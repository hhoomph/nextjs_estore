/**
 * Server-side locale utilities for Next.js App Router
 *
 * Provides functions to access and manage locale in Server Components.
 * Uses cookies for persistence with Persian (fa) as default.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import { cookies } from "next/headers";
import {
  type CookieLocale,
  DEFAULT_LOCALE,
  isValidLocale,
  LOCALE_COOKIE_NAME,
} from "./cookie-locale";

/**
 * Get the current locale from cookies in a Server Component
 */
export async function getLocaleFromCookie(): Promise<CookieLocale> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

  if (cookieValue && isValidLocale(cookieValue)) {
    return cookieValue;
  }

  return DEFAULT_LOCALE;
}

/**
 * Set the locale cookie from a Server Component or Server Action
 */
export async function setLocaleCookie(locale: CookieLocale): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set({
    name: LOCALE_COOKIE_NAME,
    value: locale,
    maxAge: 365 * 24 * 60 * 60, // 1 year
    path: "/",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
}

/**
 * Get HTML lang attribute value for current locale
 */
export async function getHtmlLang(): Promise<CookieLocale> {
  return getLocaleFromCookie();
}

/**
 * Get HTML dir attribute value for current locale
 */
export async function getHtmlDir(): Promise<"rtl" | "ltr"> {
  const locale = await getLocaleFromCookie();
  return locale === "fa" ? "rtl" : "ltr";
}
