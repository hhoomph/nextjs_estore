import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { routing } from "./routing";

/**
 * Request configuration for next-intl
 *
 * This file is used by next-intl to configure server-side request handling.
 * It provides the routing configuration and message loading logic.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

/**
 * Load messages for a specific locale
 *
 * @param locale - The locale code (e.g., 'en', 'fa')
 * @returns The messages object for the locale
 */
async function loadMessages(locale: string) {
  try {
    const messages = await import(`../messages/${locale}.json`);
    return messages.default;
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    // Fallback to English if the locale is not found
    const fallbackMessages = await import("../messages/en.json");
    return fallbackMessages.default;
  }
}

export default getRequestConfig(async () => {
  // Cookie-based locale detection (localePrefix: "never")
  // Read locale directly from cookies since next-intl doesn't provide it when localePrefix is "never"
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("app-locale")?.value;
  
  const validLocale = localeCookie === "en" || localeCookie === "fa"
    ? localeCookie
    : routing.defaultLocale;

  return {
    locale: validLocale as 'en' | 'fa',
    messages: await loadMessages(validLocale),
    
    // Optional: Add custom formatting for dates, numbers, etc.
    formats: {
      date: {
        short: {
          day: "numeric",
          month: "short",
          year: "numeric",
        },
        long: {
          day: "numeric",
          month: "long",
          year: "numeric",
        },
      },
      time: {
        short: {
          hour: "2-digit",
          minute: "2-digit",
        },
        long: {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        },
      },
      number: {
        currency: {
          style: "currency",
          currency: "USD",
        },
      },
    },
  };
});