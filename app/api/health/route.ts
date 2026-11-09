import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    await prisma.product.count({ take: 1 });
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: { database: "connected", api: "operational" },
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      { status: "unhealthy", timestamp: new Date().toISOString(), error: "Database connection failed" },
      { status: 503 },
    );
  }
}

export async function HEAD(request: NextRequest) {
  try {
    await prisma.product.count({ take: 1 });
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}
