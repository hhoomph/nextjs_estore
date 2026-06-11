/**
 * Get session API endpoint
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";

export async function GET(request: NextRequest) {
  try {
    // Get session using the cookie-based auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    const user = {
      ...session.user,
      role: (session.user as any).role || "USER",
    };

    return NextResponse.json({
      success: true,
      session: session.session,
      user,
    });
  } catch (error) {
    console.error("Get session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
