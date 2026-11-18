import { cookies } from "next/headers";
import {
  LOCALE_COOKIE_NAME,
  isValidLocale,
  type CookieLocale,
} from "@/lib/i18n/cookie-locale";

/**
 * Resolves the active locale for a server component from the locale cookie
 * (the same cookie the language switcher writes). Defaults to Persian.
 */
export async function getRequestLocale(): Promise<CookieLocale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE_NAME)?.value;
  return value && isValidLocale(value) ? value : "fa";
}

export type CatalogLocale = "fa" | "en";
