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

// GET /api/cart - Get user's cart items
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 },
      );
    }

    // For now, we'll use a simple cart implementation
    // In a real app, you'd want to store cart items in the database
    const cartItems: Array<{
      id: string;
      product_id: string;
      quantity: number;
      product: {
        id: string;
        name: string;
        price: number;
        discount_price: number | null;
      };
    }> = []; // This will be populated from Zustand store

    return NextResponse.json({
      items: cartItems,
      total: 0,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 },
    );
  }
}

// POST /api/cart - Add item to cart (for future database storage)
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { product_id, quantity } = body;

    // Validate required fields
    if (!product_id || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Product ID and valid quantity are required" },
        { status: 400 },
      );
    }

    // Check if product exists and is in stock
    const product = await prisma.product.findUnique({
      where: { id: product_id },
    });

    if (!product || product.status !== 1) {
      return NextResponse.json(
        { error: "Product not found or unavailable" },
        { status: 404 },
      );
    }

    if (product.quantity < quantity) {
      return NextResponse.json(
        { error: "Insufficient stock" },
        { status: 400 },
      );
    }

    // For now, just return success
    // In a real implementation, you'd store this in the database
    return NextResponse.json({
      success: true,
      message: "Item added to cart",
      item: {
        product_id,
        quantity,
        product: {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          discountPrice: product.discountPrice
            ? Number(product.discountPrice)
            : null,
        },
      },
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { error: "Failed to add item to cart" },
      { status: 500 },
    );
  }
}
