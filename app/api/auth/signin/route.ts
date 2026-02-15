/**
 * Sign-in API endpoint
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { type NextRequest, NextResponse } from "next/server";
import { authClient } from "@/lib/auth-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const result = await authClient.signIn.email({
      email,
      password,
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      user: result.data.user,
      token: result.data.token,
    });
  } catch (error) {
    console.error("Sign-in error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Sign-in endpoint" });
}
