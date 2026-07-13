import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

/**
 * Load messages for a specific locale including namespaces
 */
async function loadMessages(locale: string) {
  try {
    const [rootMessages, authMessages] = await Promise.all([
      import(`../messages/${locale}.json`),
      import(`../messages/auth/${locale}.json`).catch(() => ({ default: {} })),
    ]);

    return {
      ...rootMessages.default,
      auth: authMessages.default,
    };
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    const fallbackMessages = await import("../messages/en.json");
    return fallbackMessages.default;
  }
}

export default getRequestConfig(async () => {
  // Dynamically import next/headers to avoid build-time resolution issues
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("app-locale")?.value;

  const validLocale = localeCookie === "en" || localeCookie === "fa"
    ? localeCookie
    : routing.defaultLocale;

  return {
    locale: validLocale as 'en' | 'fa',
    messages: await loadMessages(validLocale),
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