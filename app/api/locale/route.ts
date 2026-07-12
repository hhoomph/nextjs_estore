import { NextResponse } from "next/server";
import type { CookieLocale } from "@/lib/i18n/cookie-locale";

export async function POST(request: Request) {
  try {
    const { locale } = await request.json();

    // Validate locale
    const validLocales: CookieLocale[] = ["en", "fa"];
    if (!validLocales.includes(locale as CookieLocale)) {
      return NextResponse.json(
        { error: "Invalid locale" },
        { status: 400 }
      );
    }

    // Set locale cookies
    // app-locale: custom cookie for app-level locale detection
    // NEXT_LOCALE: next-intl standard cookie for server-side getLocale()
    const response = NextResponse.json({ success: true });

    const cookieOptions = {
      path: "/",
      httpOnly: false,
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24 * 365, // 1 year
    };

    response.cookies.set("app-locale", locale, cookieOptions);
    response.cookies.set("NEXT_LOCALE", locale, cookieOptions);

    return response;
  } catch (error) {
    console.error("Error setting locale:", error);
    return NextResponse.json(
      { error: "Failed to set locale" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  // Get current locale from cookie using standard cookie name
  const cookieHeader = request.headers.get("cookie") || "";
  const cookieValue = cookieHeader.split("; ")
    .find((cookie) => cookie.startsWith("app-locale="))?.split("=")[1];

  return NextResponse.json({
    locale: cookieValue || "fa"
  });
}
