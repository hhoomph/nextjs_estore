/**
 * Module for change-password route
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/database";
import { password } from "@/lib/security";

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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.password) {
      // Should not happen for a user who is logged in with a password.
      // Could be a social login user trying to change password.
      return NextResponse.json(
        { error: "User not found or password not set" },
        { status: 400 },
      );
    }

    const isPasswordCorrect = await password.verify(
      currentPassword,
      user.password,
    );

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { error: "Incorrect current password" },
        { status: 400 },
      );
    }

    const hashedPassword = await password.hash(newPassword);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword, updatedAt: new Date() },
    });

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 },
    );
  }
}
