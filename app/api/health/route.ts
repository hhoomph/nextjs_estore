/**
 * Health Check API Route
 *
 * Provides system health status and connectivity testing for error boundaries.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Test database connectivity
    await prisma.product.count({
      take: 1,
    });

    // Return health status
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "connected",
        api: "operational",
      },
    });
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Database connection failed",
      },
      { status: 503 },
    );
  }
}

export async function HEAD(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse(null, { status: 401 });
    }

    await prisma.product.count({
      take: 1,
    });

    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}