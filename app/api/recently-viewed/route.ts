/**
 * API route for recently viewed products
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/database";
import { ErrorResponse, SuccessResponse } from "@/lib/types/api-responses";

// Force Node.js runtime for Prisma compatibility
export const runtime = "nodejs";

// Validation schema for adding recently viewed item
const addRecentlyViewedSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
});

// Type definitions for recently viewed data
interface RecentlyViewedWithProduct {
  id: string;
  userId: string;
  productId: string;
  viewedAt: Date;
  product: {
    id: string;
    name: string | null;
    price: number; // Prisma Decimal converted to number
    discountPrice: number | null; // Prisma Decimal converted to number
    slug: string | null;
    productPictures: Array<{
      id: string;
      displayOrder: number;
      picture: {
        id: string;
        url: string;
        type: string | null;
        createdAt: Date;
        modifiedAt: Date;
      };
    }>;
  };
}

interface RecentlyViewedResponseItem {
  id: string;
  productId: string;
  viewedAt: Date;
  product: {
    id: string;
    name: string | null;
    price: number;
    discountPrice: number | null;
    slug: string | null;
    productPictures: Array<{
      id: string;
      displayOrder: number;
      picture: {
        id: string;
        url: string;
      };
    }>;
  };
}

/**
 * GET /api/recently-viewed
 * Get recently viewed products for the authenticated user or session
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50); // Max 50 items

    let recentlyViewed: RecentlyViewedWithProduct[] = [];

    if (session?.user?.id) {
      // Authenticated user - get from database
      const rawRecentlyViewed = await prisma.recentlyViewed.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          product: {
            include: {
              productPictures: {
                include: {
                  picture: true,
                },
                orderBy: {
                  displayOrder: "asc",
                },
              },
            },
          },
        },
        orderBy: {
          viewedAt: "desc",
        },
        take: limit,
      });

      // Convert Prisma Decimal to number
      recentlyViewed = rawRecentlyViewed.map((item) => ({
        ...item,
        product: {
          ...item.product,
          price: Number(item.product.price),
          discountPrice: item.product.discountPrice
            ? Number(item.product.discountPrice)
            : null,
        },
      })) as RecentlyViewedWithProduct[];
    } else {
      // Anonymous user - would need session tracking (not implemented in this basic version)
      // For now, return empty array for anonymous users
      recentlyViewed = [];
    }

    return NextResponse.json({
      success: true,
      data: recentlyViewed.map((item) => ({
        id: item.id,
        productId: item.productId,
        viewedAt: item.viewedAt,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          discountPrice: item.product.discountPrice,
          slug: item.product.slug,
          productPictures: item.product.productPictures,
        },
      })),
    });
  } catch (error) {
    console.error("Error fetching recently viewed products:", error);
    return NextResponse.json(
      { error: "Failed to fetch recently viewed products" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/recently-viewed
 * Add a product to recently viewed list
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const body = await request.json();

    // Validate input
    const { productId } = addRecentlyViewedSchema.parse(body);

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (session?.user?.id) {
      // Authenticated user - save to database
      // First, check if this product is already in recently viewed
      const existingItem = await prisma.recentlyViewed.findFirst({
        where: {
          userId: session.user.id,
          productId: productId,
        },
      });

      if (existingItem) {
        // Update the viewedAt timestamp
        await prisma.recentlyViewed.update({
          where: { id: existingItem.id },
          data: { viewedAt: new Date() },
        });
      } else {
        // Create new entry
        await prisma.recentlyViewed.create({
          data: {
            userId: session.user.id,
            productId: productId,
          },
        });

        // Keep only the most recent 50 items for this user
        const userItems = await prisma.recentlyViewed.findMany({
          where: { userId: session.user.id },
          orderBy: { viewedAt: "desc" },
          select: { id: true },
          skip: 50, // Skip the first 50 (most recent)
        });

        // Delete older items beyond the limit
        if (userItems.length > 0) {
          await prisma.recentlyViewed.deleteMany({
            where: {
              id: { in: userItems.map((item) => item.id) },
            },
          });
        }
      }
    }
    // For anonymous users, we could use session tracking, but that's not implemented here

    return NextResponse.json({
      success: true,
      message: "Product added to recently viewed",
    });
  } catch (error) {
    console.error("Error adding product to recently viewed:", error);
    return NextResponse.json(
      { error: "Failed to add product to recently viewed" },
      { status: 500 },
    );
  }
}
