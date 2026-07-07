/**
 * Next.js Proxy for Cookie-based Internationalization
 *
 * Handles locale detection via cookies (Persian/fa default, RTL).
 * Auth is handled separately by API routes to avoid Edge Runtime issues.
 *
 * @author hh.oomph@gmail.com
 * @version 3.1.0
 * @since 2025-01-01
 */

import { type NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_LOCALE,
  getCookieLocale,
  LOCALE_COOKIE_NAME,
} from "./lib/i18n/cookie-locale";

/**
 * Proxy function
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip proxy for static files, API routes, and Next.js internals
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/static/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap") ||
    pathname.match(/\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|json)$/)
  ) {
    return NextResponse.next();
  }

  // Get locale from cookie or use default
  const locale = getCookieLocale(request);

  // Create response
  const response = NextResponse.next();

  // Set locale cookie if not present
  const existingCookie = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (!existingCookie) {
    response.cookies.set({
      name: LOCALE_COOKIE_NAME,
      value: DEFAULT_LOCALE,
      maxAge: 365 * 24 * 60 * 60, // 1 year
      path: "/",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  // Add locale header for server components
  response.headers.set("x-locale", locale);
  response.headers.set("x-dir", locale === "fa" ? "rtl" : "ltr");

  return response;
}

/**
 * Proxy configuration
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
