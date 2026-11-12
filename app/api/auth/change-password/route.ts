import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 },
      );
    }

    try {
      // Delegate to Better Auth so the credential account is verified and
      // re-hashed with the same scrypt parameters used at sign-in.
      await auth.api.changePassword({
        headers: request.headers,
        body: {
          currentPassword,
          newPassword,
          revokeOtherSessions: false,
        },
      });
    } catch (error) {
      const apiError = error as { status?: string; statusCode?: number; message?: string };
      const status =
        typeof apiError?.statusCode === "number"
          ? apiError.statusCode
          : apiError?.status === "UNAUTHORIZED" || apiError?.status === "FORBIDDEN"
            ? 401
            : 400;

      return NextResponse.json(
        { error: apiError?.message ?? "Incorrect current password" },
        { status },
      );
    }

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 },
    );
  }
}
