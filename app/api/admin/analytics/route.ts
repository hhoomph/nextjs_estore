/**
 * Module for route
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import {
  eachDayOfInterval,
  endOfDay,
  format,
  startOfDay,
  subDays,
} from "date-fns";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/database";

// GET /api/admin/analytics - Get analytics data for admin
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30"; // days
    const days = parseInt(period);

    // Calculate date range
    const endDate = endOfDay(new Date());
    const startDate = startOfDay(subDays(endDate, days));

    // Get all analytics data in parallel
    const [
      salesData,
      userGrowth,
      topProducts,
      categoryPerformance,
      totalStats,
    ] = await Promise.all([
      // Sales data (revenue and orders by day)
      getSalesData(startDate, endDate),

      // User growth (new users by day)
      getUserGrowthData(startDate, endDate),

      // Top products by sales
      getTopProducts(),

      // Category performance
      getCategoryPerformance(),

      // Total statistics
      getTotalStats(days),
    ]);

    const analytics = {
      salesData,
      userGrowth,
      topProducts,
      categoryPerformance,
      totalStats,
    };

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 },
    );
  }
}

async function getSalesData(startDate: Date, endDate: Date) {
  const salesByDay = await prisma.$queryRaw<
    Array<{ date: string; revenue: number; orders: number }>
  >`
    SELECT
      DATE(o."createdAt") as date,
      COALESCE(SUM(o."total"), 0) as revenue,
      COUNT(o.id) as orders
    FROM "order" o
    WHERE o."createdAt" >= ${startDate} AND o."createdAt" <= ${endDate}
    GROUP BY DATE(o."createdAt")
    ORDER BY date
  `;

  // Fill in missing dates with zero values
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
  const salesMap = new Map(salesByDay.map((item) => [item.date, item]));

  return dateRange.map((date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const data = salesMap.get(dateStr);
    return {
      date: dateStr,
      revenue: Number(data?.revenue || 0),
      orders: Number(data?.orders || 0),
    };
  });
}

async function getUserGrowthData(startDate: Date, endDate: Date) {
  const usersByDay = await prisma.$queryRaw<
    Array<{ date: string; users: number }>
  >`
    SELECT
      DATE("createdAt") as date,
      COUNT(id) as users
    FROM "user"
    WHERE "createdAt" >= ${startDate} AND "createdAt" <= ${endDate}
    GROUP BY DATE("createdAt")
    ORDER BY date
  `;

  // Fill in missing dates with zero values
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
  const usersMap = new Map(usersByDay.map((item) => [item.date, item]));

  return dateRange.map((date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const data = usersMap.get(dateStr);
    return {
      date: dateStr,
      users: Number(data?.users || 0),
    };
  });
}

async function getTopProducts() {
  const topProducts = await prisma.$queryRaw<
    Array<{ name: string; sales: number; revenue: number }>
  >`
    SELECT
      p.name,
      COALESCE(SUM(oi."quantity"), 0) as sales,
      COALESCE(SUM(oi."quantity" * p."price"), 0) as revenue
    FROM product p
    LEFT JOIN order_items oi ON p.id = oi."productId"
    LEFT JOIN "order" o ON oi."orderId" = o.id
    WHERE p."status" = 1
    GROUP BY p.id, p.name
    ORDER BY revenue DESC
    LIMIT 10
  `;

  return topProducts.map((product) => ({
    name: product.name || "Unknown Product",
    sales: Number(product.sales),
    revenue: Number(product.revenue),
  }));
}

async function getCategoryPerformance() {
  const categoryData = await prisma.$queryRaw<
    Array<{ name: string; sales: number; revenue: number }>
  >`
    SELECT
      c.name,
      COALESCE(SUM(oi."quantity"), 0) as sales,
      COALESCE(SUM(oi."quantity" * p."price"), 0) as revenue
    FROM category c
    LEFT JOIN product p ON c.id = p."categoryId"
    LEFT JOIN order_items oi ON p.id = oi."productId"
    LEFT JOIN "order" o ON oi."orderId" = o.id
    GROUP BY c.id, c.name
    ORDER BY revenue DESC
  `;

  const totalRevenue = categoryData.reduce(
    (sum, cat) => sum + Number(cat.revenue),
    0,
  );

  return categoryData.map((category) => ({
    name: category.name || "Uncategorized",
    sales: Number(category.sales),
    revenue: Number(category.revenue),
    percentage:
      totalRevenue > 0 ? (Number(category.revenue) / totalRevenue) * 100 : 0,
  }));
}

async function getTotalStats(days: number) {
  const startDate = subDays(new Date(), days);

  const [totalRevenue, totalOrders, totalCustomers, averageOrderValue] =
    await Promise.all([
      // Total revenue
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        _sum: {
          total: true,
        },
      }),

      // Total orders
      prisma.order.count({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
      }),

      // Total customers (unique users who made orders)
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        select: {
          userId: true,
        },
        distinct: ["userId"],
      }),

      // Average order value
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        _avg: {
          total: true,
        },
      }),
    ]);

  return {
    totalRevenue: Number(totalRevenue._sum.total || 0),
    totalOrders,
    totalCustomers: totalCustomers.length,
    averageOrderValue: Number(averageOrderValue._avg.total || 0),
  };
}
