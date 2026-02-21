/**
 * Clear Cart API Route
 * Removes all cart items for a user or session
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionId } = await request.json();

    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: "Either userId or sessionId is required" },
        { status: 400 },
      );
    }

    // Build where clause to match cart items for user or session
    const where: { userId?: string; sessionId?: string } = {};
    if (userId) where.userId = userId;
    if (sessionId) where.sessionId = sessionId;

    // Delete cart items
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
