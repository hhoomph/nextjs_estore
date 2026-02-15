/**
 * Next-intl configuration for cookie-based internationalization
 *
 * Loads messages based on cookie locale without URL prefix.
 * Persian (fa) is default, English (en) is secondary.
 *
 * @author hh.oomph@gmail.com
 * @version 2.0.0
 * @since 2025-01-01
 */

import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./i18n/routing";
import {
  type CookieLocale,
  DEFAULT_LOCALE,
  isValidLocale,
  LOCALE_COOKIE_NAME,
} from "./lib/i18n/cookie-locale";

export const locales = routing.locales;
export type Locale = (typeof locales)[number];

// Cache for loaded messages to avoid repeated imports
const messagesCache = new Map<string, unknown>();

/**
 * Get locale from cookie in server context
 */
async function getLocaleFromCookie(): Promise<CookieLocale> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

  if (cookieValue && isValidLocale(cookieValue)) {
    return cookieValue;
  }

  return DEFAULT_LOCALE;
}

/**
 * Lazy load messages with caching and code splitting
 */
async function loadMessages(locale: string) {
  const cacheKey = `messages_${locale}`;

  if (messagesCache.has(cacheKey)) {
    return messagesCache.get(cacheKey);
  }

  try {
    // Load messages dynamically with better code splitting
    // Load cart messages eagerly as they're used across pages
    const cartMessagesPromise = import("./messages/cart.json");

    // Load main messages and auth messages based on current locale
    const [mainMessages, cartMessages] = await Promise.all([
      import(`./messages/${locale}.json`).catch(
        () => import("./messages/fa.json"),
      ),
      cartMessagesPromise,
    ]);

    // Load auth messages only when needed (lazy)
    const authMessagesPromise = import(`./messages/auth/${locale}.json`).catch(
      () => ({}),
    );

    // Start loading auth messages but don't wait for them
    const authMessages = await authMessagesPromise;

    const messages = {
      ...mainMessages.default,
      ...cartMessages.default,
      auth: authMessages.default || {},
    };

    // Cache the loaded messages
    messagesCache.set(cacheKey, messages);

    return messages;
  } catch (error) {
    // Only log in development
    if (process.env.NODE_ENV === "development") {
      console.error(`Failed to load messages for locale ${locale}:`, error);
    }
    // Fallback to Persian messages
    return loadMessages("fa");
  }
}

/**
 * Preload critical messages for better UX
 */
export async function preloadCriticalMessages(locale: string) {
  try {
    // Preload only essential messages for initial page load
    await Promise.all([
      import(`./messages/${locale}.json`).catch(
        () => import("./messages/fa.json"),
      ),
      import("./messages/cart.json"),
    ]);
  } catch (error) {
    // Only log in development
    if (process.env.NODE_ENV === "development") {
      console.warn("Failed to preload critical messages:", error);
    }
  }
}

/**
 * Next-intl request configuration
 */
export default getRequestConfig(async () => {
  // Get locale from cookie instead of URL
  const locale = await getLocaleFromCookie();

  // Validate that the locale is supported
  if (!locale || !routing.locales.includes(locale as any)) {
    return {
      locale: DEFAULT_LOCALE,
      messages: await loadMessages(DEFAULT_LOCALE),
    };
  }

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
