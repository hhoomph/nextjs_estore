/**
 * Module for route
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/database";

// DELETE /api/wishlist/[id] - Remove item from wishlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if the wishlist item belongs to the user
    const wishlistItem = await prisma.wishlist.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!wishlistItem) {
      return NextResponse.json(
        { error: "Wishlist item not found" },
        { status: 404 },
      );
    }

    // Delete the wishlist item
    await prisma.wishlist.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Item removed from wishlist",
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json(
      { error: "Failed to remove from wishlist" },
      { status: 500 },
    );
  }
}
