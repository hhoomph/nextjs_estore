import { defineRouting } from "next-intl/routing";

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
    "/auth/signin": "/auth/signin",
    "/auth/signup": "/auth/signup",
    "/auth/forgot-password": "/auth/forgot-password",
    "/contact": "/contact",
    "/help": "/help",
    "/privacy-policy": "/privacy-policy",
    "/terms-condition": "/terms-condition",
    "/admin/signin": "/admin/signin",


    // Dynamic routes
    "/products/[slug]": "/products/[slug]",
    "/categories/[slug]": "/categories/[slug]",
    "/orders/[id]": "/orders/[id]",
  },
});
export const routeMatcherGroups = [
  // Public routes
  { pattern: '/', locale: false },
  { pattern: '/products', locale: false },
  { pattern: '/products/:path*', locale: false },
  { pattern: '/categories', locale: false },
  { pattern: '/categories/:path*', locale: false },
  { pattern: '/cart', locale: false },
  { pattern: '/checkout', locale: false },
  { pattern: '/checkout/success', locale: false },
  { pattern: '/search', locale: false },
  { pattern: '/wishlist', locale: false },
  { pattern: '/compare', locale: false },
  { pattern: '/deals', locale: false },
  { pattern: '/popular', locale: false },
  { pattern: '/recently-viewed', locale: false },
  { pattern: '/blog', locale: false },
  { pattern: '/blog/:path*', locale: false },
  { pattern: '/contact', locale: false },
  { pattern: '/help', locale: false },
  { pattern: '/privacy-policy', locale: false },
  { pattern: '/terms-condition', locale: false },
  // Auth routes
  { pattern: '/auth/signin', locale: false },
  { pattern: '/auth/signup', locale: false },
  { pattern: '/auth/forgot-password', locale: false },
  // Account routes
  { pattern: '/account', locale: false },
  { pattern: '/account/:path*', locale: false },
  { pattern: '/orders', locale: false },
  { pattern: '/orders/:path*', locale: false },
  { pattern: '/settings', locale: false },
  { pattern: '/settings/:path*', locale: false },
  { pattern: '/dashboard', locale: false },
  // Admin routes
  { pattern: '/admin', locale: false },
  { pattern: '/admin/signin', locale: false },
  { pattern: '/admin/:path*', locale: false },
];

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




