import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/database";

type OrderDetailRouteParams = {
  id: string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<OrderDetailRouteParams> },
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: request.headers });
    const checkoutSessionId = request.headers.get("x-checkout-session-id");

    const order = await prisma.order.findUnique({
      where: { id },
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
          take: 1,
          select: {
            status: true,
            transactionCode: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId) {
      if (session?.user?.id !== order.userId) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
    } else if (!checkoutSessionId || checkoutSessionId !== order.sessionId) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const payment = order.payment[0];

    return NextResponse.json({
      id: order.id,
      orderNumber: order.id.slice(0, 8).toUpperCase(),
      status: order.status,
      total: Number(order.total),
      createdAt: order.createdAt,
      transactionCode: payment?.transactionCode,
      items: order.orderItems.map((item) => ({
        id: item.id,
        product: {
          id: item.product.id,
          name: item.product.name ?? "Unknown product",
          slug: item.product.slug ?? "",
          price: Number(item.product.price),
          discountPrice: item.product.discountPrice
            ? Number(item.product.discountPrice)
            : null,
          image: item.product.productPictures?.[0]?.picture.url ?? null,
        },
        quantity: item.quantity,
      })),
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    return NextResponse.json(
      { error: "Failed to fetch order details" },
      { status: 500 },
    );
  }
}
