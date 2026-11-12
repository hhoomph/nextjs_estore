import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import prisma from "@/lib/prisma";
import { normaliseOrderStatus } from "@/lib/utils/order-status";

// PATCH /api/admin/orders/[id] - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    // The database stores the OrderStatus enum in upper case, while clients may
    // send lower case (or the legacy "processing" value) - normalise first.
    const normalised = normaliseOrderStatus(status);
    if (!normalised) {
      return NextResponse.json(
        {
          error:
            "Invalid status. Must be one of: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED",
        },
        { status: 400 },
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: normalised },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 },
    );
  }
}
