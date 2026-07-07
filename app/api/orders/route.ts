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

// POST /api/orders - Create new order
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
    const { shippingAddress, shipping, payment, items, totals } = body;
    const selectedShippingAddress = shippingAddress ?? shipping;

    // Validate required fields
    if (!selectedShippingAddress || !payment || !items || !totals) {
      return NextResponse.json(
        { error: "Missing required order data" },
        { status: 400 },
      );
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.order.create({
        data: {
          id: crypto.randomUUID(),
          userId: session.user.id,
          total: totals.total,
          deliverDate: null, // Will be set when shipped
          discountId: null, // For future discount system
          paymentId: null, // Will be set when payment is processed
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
      });

      // Create order items
      for (const item of items) {
        await tx.orderItem.create({
          data: {
            id: crypto.randomUUID(),
            orderId: order.id,
            productId: item.product_id,
            quantity: item.quantity,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
        });

        // Update product quantity (decrease stock)
        await tx.product.update({
          where: { id: item.product_id },
          data: {
            quantity: {
              decrement: item.quantity,
            },
            modifiedAt: new Date(),
          },
        });
      }

      // Create payment record (simulated)
      const paymentRecord = await tx.payment.create({
        data: {
          id: crypto.randomUUID(),
          userId: session.user.id,
          orderId: order.id,
          amount: totals.total,
          provider: "stripe", // Simulated
          status: "completed",
          transactionCode: `txn_${crypto.randomUUID().slice(0, 8)}`,
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
      });

      // Update order with payment ID
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentId: paymentRecord.id,
        },
      });

      return { order, paymentRecord };
    });

    return NextResponse.json(
      {
        id: result.order.id,
        orderNumber: result.order.id.slice(0, 8).toUpperCase(),
        status: "confirmed",
        total: totals.total,
        createdAt: result.order.createdAt,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}

// GET /api/orders - Get user's orders
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: session.user.id },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  price: true,
                  discountPrice: true,
                  productPictures: {
                    take: 1,
                    include: {
                      picture: {
                        select: {
                          url: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          payment: {
            select: {
              status: true,
              transactionCode: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({
        where: { userId: session.user.id },
      }),
    ]);

    // Transform orders for frontend
    const transformedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.id.slice(0, 8).toUpperCase(),
      total: Number(order.total),
      status: order.payment?.[0]?.status || "pending",
      transactionCode: order.payment?.[0]?.transactionCode,
      createdAt: order.createdAt,
      items: order.orderItems.map((item) => ({
        id: item.id,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          price: Number(item.product.price),
          discountPrice: item.product.discountPrice
            ? Number(item.product.discountPrice)
            : null,
          image: item.product.productPictures?.[0]?.picture.url,
        },
        quantity: item.quantity,
      })),
    }));

    return NextResponse.json({
      orders: transformedOrders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
