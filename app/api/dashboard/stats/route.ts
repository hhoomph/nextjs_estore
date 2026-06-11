/**
 * Module for route
 *
 * @author hh.oomph@gmail.com
 * @version 1.1.0
 * @since 2025-01-01
 */
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/database";

// GET /api/dashboard/stats - Get dashboard statistics for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 },
      );
    }

    const isAdmin = session.user.role === "ADMIN";
    const userWhere = isAdmin ? undefined : { userId: session.user.id };

    // Get all statistics in parallel. Non-admin users only receive their own
    // scoped order data, while admins receive platform-wide analytics.
    const [
      totalUsers,
      totalOrders,
      totalRevenue,
      totalProducts,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      // Total users is admin-only data.
      isAdmin ? prisma.user.count() : Promise.resolve(0),

      // Total orders is scoped to the signed-in customer for non-admins.
      prisma.order.count({ where: userWhere }),

      // Total revenue is scoped to the signed-in customer for non-admins.
      prisma.order.aggregate({
        _sum: {
          total: true,
        },
        where: userWhere,
      }),

      // Active products are safe to expose as catalog context for customers.
      prisma.product.count({
        where: { status: 1 },
      }),

      // Recent orders (last 5) with details.
      prisma.order.findMany({
        take: 5,
        where: userWhere,
        include: {
          ...(isAdmin
            ? {
                user: {
                  select: {
                    name: true,
                  },
                },
              }
            : {}),
          orderItems: {
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),

      // Low stock products are admin-only operational data.
      isAdmin
        ? prisma.product.findMany({
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
          })
        : Promise.resolve([]),
    ]);

    const stats = {
      totalUsers,
      totalOrders,
      totalRevenue: Number(totalRevenue._sum.total || 0),
      totalProducts,
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        total: Number(order.total),
        createdAt: order.createdAt.toISOString(),
        items: order.orderItems.length,
        user: isAdmin ? { name: order.user?.name ?? null } : undefined,
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
