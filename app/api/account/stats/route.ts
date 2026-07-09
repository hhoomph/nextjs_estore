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

// GET /api/account/stats - Get account overview stats
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [orderCount, wishlistCount, spentAggregate] = await Promise.all([
      prisma.order.count({ where: { userId: session.user.id } }),
      prisma.wishlist.count({ where: { userId: session.user.id } }),
      prisma.order.aggregate({
        where: { userId: session.user.id },
        _sum: { total: true },
      }),
    ]);

    return NextResponse.json({
      totalOrders: orderCount,
      totalWishlist: wishlistCount,
      totalSpent: Number(spentAggregate._sum.total || 0),
    });
  } catch (error) {
    console.error("Error fetching account stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch account stats" },
      { status: 500 },
    );
  }
}
