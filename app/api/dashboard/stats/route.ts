// app/api/dashboard/stats/route.ts
/**
 * Dashboard stats aggregation endpoint.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2026-06-26
 */

import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  console.log("[dashboard/stats] GET", request.url);
  try {
    const [
      totalProducts,
      totalOrders,
      totalUsers,
      revenueAggregate,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: "CANCELLED" } },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          total: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      }),
      prisma.product.findMany({
        where: { quantity: { lte: 5 } },
        orderBy: { quantity: "asc" },
        take: 5,
        select: { id: true, name: true, quantity: true },
      }),
    ]);

    const stats = {
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue: Number(revenueAggregate._sum.total ?? 0),
      recentOrders,
      lowStockProducts,
    };

    console.log("[dashboard/stats] response", {
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue: stats.totalRevenue,
      recentOrdersCount: recentOrders.length,
      lowStockProductsCount: lowStockProducts.length,
    });

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("[dashboard/stats] failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 },
    );
  }
}