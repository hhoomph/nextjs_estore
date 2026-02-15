/**
 * Locale API Route
 *
 * Handles setting the locale cookie from client-side interactions.
 * Used by the language switcher and other client components.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import { type NextRequest, NextResponse } from "next/server";
import {
  type CookieLocale,
  defaultCookieConfig,
  isValidLocale,
  LOCALE_COOKIE_NAME,
} from "@/lib/i18n/cookie-locale";

/**
 * POST /api/locale
 * Set the locale cookie
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locale } = body;

    if (!locale || !isValidLocale(locale)) {
      return NextResponse.json(
        { error: "Invalid locale. Supported: en, fa" },
        { status: 400 },
      );
    }

    const response = NextResponse.json({
      success: true,
      locale: locale as CookieLocale,
    });

    // Set the locale cookie
    response.cookies.set({
      name: LOCALE_COOKIE_NAME,
      value: locale,
      maxAge: defaultCookieConfig.maxAge,
      path: defaultCookieConfig.path,
      httpOnly: defaultCookieConfig.httpOnly,
      secure: defaultCookieConfig.secure,
      sameSite: defaultCookieConfig.sameSite,
    });

    return response;
  } catch (error) {
    console.error("Error setting locale:", error);
    return NextResponse.json(
      { error: "Failed to set locale" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/locale
 * Get the current locale from cookie
 */
export async function GET(request: NextRequest) {
  try {
    const locale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;

    if (locale && isValidLocale(locale)) {
      return NextResponse.json({ locale: locale as CookieLocale });
    }

    // Return default locale if not set
    return NextResponse.json({ locale: "fa" as CookieLocale });
  } catch (error) {
    console.error("Error getting locale:", error);
    return NextResponse.json(
      { error: "Failed to get locale" },
      { status: 500 },
    );
  }
}
