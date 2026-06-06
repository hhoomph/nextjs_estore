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

// GET /api/dashboard/stats - Get dashboard statistics for admin
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 },
      );
    }

    // Get all statistics in parallel
    const [
      totalUsers,
      totalOrders,
      totalRevenue,
      totalProducts,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Total orders
      prisma.order.count(),

      // Total revenue
      prisma.order.aggregate({
        _sum: {
          total: true,
        },
      }),

      // Total products
      prisma.product.count({
        where: { status: 1 },
      }),

      // Recent orders (last 30 days) with details
      prisma.order.findMany({
        take: 5,
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),

      // Low stock products (less than 10 items) with details
      prisma.product.findMany({
        where: {
          status: 1,
          quantity: {
            lt: 10,
          },
        },
        select: {
          id: true,
          name: true,
          quantity: true,
        },
        take: 10,
      }),
    ]);

    const stats = {
      totalUsers,
      totalOrders,
      totalRevenue: Number(totalRevenue._sum.total || 0),
      totalProducts,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        total: Number(o.total),
        createdAt: o.createdAt.toISOString(),
        user: { name: o.user?.name ?? null },
      })),
      lowStockProducts,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 },
    );
  }
}
