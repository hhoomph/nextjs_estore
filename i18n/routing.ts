import { defineRouting } from "next-intl/routing";
import { getCookieLocale } from "@/lib/i18n/cookie-locale";

/**
 * Routing configuration for cookie-based i18n (no locale prefix)
 *
 * Persian (fa) is the default locale with RTL support.
 * English (en) is available as secondary language.
 */
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en", "fa"],

  // Persian is the default locale
  defaultLocale: "fa",

  // No locale prefix in URLs - using cookie-based detection
  localePrefix: "never",

  // Pathnames configuration for localized routes
  pathnames: {
    // Static routes
    "/": "/",
    "/products": "/products",
    "/categories": "/categories",
    "/cart": "/cart",
    "/checkout": "/checkout",
    "/checkout/success": "/checkout/success",
    "/account": "/account",
    "/account/orders": "/account/orders",
    "/account/settings": "/account/settings",
    "/account/addresses": "/account/addresses",
    "/orders": "/orders",
    "/wishlist": "/wishlist",
    "/search": "/search",
    "/compare": "/compare",
    "/deals": "/deals",
    "/dashboard": "/dashboard",
    "/admin": "/admin",
    "/admin/analytics": "/admin/analytics",
    "/admin/users": "/admin/users",
    "/admin/products": "/admin/products",
    "/admin/categories": "/admin/categories",
    "/admin/orders": "/admin/orders",
    "/admin/settings": "/admin/settings",
    "/settings": "/settings",
    "/settings/addresses": "/settings/addresses",
    "/recently-viewed": "/recently-viewed",
    "/test": "/test",
    "/blog": "/blog",
    "/blog/[slug]": "/blog/[slug]",

    // Dynamic routes
    "/products/[slug]": "/products/[slug]",
    "/categories/[slug]": "/categories/[slug]",
    "/orders/[id]": "/orders/[id]",
  },
});

/**
 * Helper function to extract locale from cookie header string
 */
function getCookieLocaleFromHeader(cookieHeader: string): "en" | "fa" {
  try {
    const cookies = cookieHeader.split("; ");
    const localeCookie = cookies.find((cookie) => cookie.startsWith("app-locale="));
    const localeValue = localeCookie?.split("=")[1];

    if (localeValue === "en" || localeValue === "fa") {
      return localeValue;
    }
  } catch (error) {
    console.error("[i18n] Error parsing locale cookie:", error);
  }

  return "fa";
}
