/**
 * Currency API Route
 *
 * Handles currency preference based on locale.
 * Persian (fa) uses Toman, English (en) uses USD.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import { NextResponse } from "next/server";

const LOCALE_CURRENCY_MAP: Record<string, string> = {
  fa: "toman-fa",
  en: "usd",
};

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const localeCookie = cookieHeader
    .split("; ")
    .find((c) => c.startsWith("app-locale="))
    ?.split("=")[1];

  const currency = localeCookie
    ? LOCALE_CURRENCY_MAP[localeCookie] || "usd"
    : "toman-fa";

  return NextResponse.json({ currency });
}

export async function POST(request: Request) {
  try {
    const { currency } = await request.json();

    const validCurrencies = ["toman-fa", "usd"];
    if (!validCurrencies.includes(currency)) {
      return NextResponse.json(
        { error: "Invalid currency" },
        { status: 400 },
      );
    }

    const response = NextResponse.json({ success: true, currency });
    response.cookies.set("app-currency", currency, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return response;
  } catch (error) {
    console.error("Error setting currency:", error);
    return NextResponse.json(
      { error: "Failed to set currency" },
      { status: 500 },
    );
  }
}