/**
 * Clear Cart API Route
 * Removes all cart items for a user or session
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { userId, sessionId } = await request.json();

    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: "Either userId or sessionId is required" },
        { status: 400 },
      );
    }

    if (userId && session.user.id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    if (sessionId && session.user.id !== sessionId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const where: { userId?: string; sessionId?: string } = {};
    if (userId) where.userId = userId;
    if (sessionId) where.sessionId = sessionId;

    const deleteResult = await prisma.cartItem.deleteMany({
      where,
    });

    return NextResponse.json({
      success: true,
      deletedCount: deleteResult.count,
      message: `Cleared ${deleteResult.count} cart items`,
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return NextResponse.json(
      { error: "Failed to clear cart" },
      { status: 500 },
    );
  }
}
