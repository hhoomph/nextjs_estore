/**
 * Guest Order API Route
 *
 * Handles order creation for guest users without authentication.
 * Includes validation, inventory management, and order processing.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { type NextRequest, NextResponse } from "next/server";
import { type ZodIssue, z } from "zod";
import { prisma } from "@/lib/database";

// Type definitions for guest orders
interface GuestOrderItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    discountPrice?: number;
    discount_price?: number;
    current_price?: number;
  };
}

interface GuestOrderData {
  guestInfo: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    createAccount?: boolean;
    password?: string;
  };
  shippingAddress: {
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  billingAddress: {
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  items: GuestOrderItem[];
  sessionId?: string;
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
}

type ValidationError = ZodIssue;

// Validation schema for guest orders
const guestOrderSchema = z.object({
  guestInfo: z.object({
    email: z.string().email("Invalid email address"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phone: z.string().min(10, "Valid phone number is required"),
    createAccount: z.boolean().default(false),
    password: z.string().optional(),
  }),
  shippingAddress: z.object({
    address_line1: z.string().min(1, "Address is required"),
    address_line2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postal_code: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
  }),
  billingAddress: z.object({
    address_line1: z.string().min(1, "Address is required"),
    address_line2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postal_code: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
  }),
  items: z
    .array(
      z.object({
        id: z.string(),
        product_id: z.string(),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        product: z.object({
          id: z.string(),
          name: z.string(),
          price: z.number(),
          discountPrice: z.number().optional(),
          discount_price: z.number().optional(),
        }),
      }),
    )
    .min(1, "At least one item is required"),
  sessionId: z.string().optional(),
  totals: z.object({
    subtotal: z.number(),
    shipping: z.number(),
    tax: z.number(),
    total: z.number(),
  }),
});

// POST /api/orders/guest - Create guest order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request data
    const validationResult = guestOrderSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues.map(
            (err: ValidationError) => ({
              field: err.path.join("."),
              message: err.message,
            }),
          ),
        },
        { status: 400 },
      );
    }

    const {
      guestInfo,
      shippingAddress,
      billingAddress,
      items,
      sessionId,
      totals,
    } = validationResult.data;

    // Validate products and inventory
    const validatedItems = await validateProductsAndInventory(items);
    if (!validatedItems.valid) {
      return NextResponse.json(
        {
          error: "Some items are no longer available",
          details: validatedItems.errors,
        },
        { status: 400 },
      );
    }

    // Create guest order
    const orderId = await createGuestOrder({
      guestInfo,
      shippingAddress,
      billingAddress,
      items: validatedItems.items,
      sessionId,
      totals,
    });

    return NextResponse.json(
      {
        success: true,
        orderId,
        message: "Order created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Guest order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order", success: false },
      { status: 500 },
    );
  }
}

// Validate products and inventory
async function validateProductsAndInventory(items: GuestOrderItem[]) {
  const errors: string[] = [];
  const validatedItems: GuestOrderItem[] = [];

  for (const item of items) {
    try {
      // Check if product exists and is available
      const product = await prisma.product.findUnique({
        where: { id: item.product_id },
        select: {
          id: true,
          name: true,
          status: true,
          quantity: true,
          price: true,
          discountPrice: true,
        },
      });

      if (!product) {
        errors.push(`Product "${item.product.name}" not found`);
        continue;
      }

      if (product.status !== 1) {
        errors.push(`Product "${product.name}" is not available`);
        continue;
      }

      if (product.quantity < item.quantity) {
        errors.push(
          `Insufficient stock for "${product.name}". Available: ${product.quantity}`,
        );
        continue;
      }

      // Validate price matches current price
      const expectedPrice = Number(product.discountPrice || product.price);
      if (Math.abs(expectedPrice - Number(item.product.price)) > 0.01) {
        errors.push(
          `Price mismatch for "${product.name}". Please refresh and try again.`,
        );
        continue;
      }

      validatedItems.push({
        ...item,
        product: {
          ...item.product,
          current_price: expectedPrice,
        },
      });
    } catch (error) {
      errors.push(
        `Error validating "${item.product.name}": ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  return {
    valid: errors.length === 0,
    items: validatedItems,
    errors,
  };
}

// Create guest order in database
async function createGuestOrder(orderData: GuestOrderData) {
  const {
    guestInfo,
    shippingAddress,
    billingAddress,
    items,
    sessionId,
    totals,
  } = orderData;

  return await prisma.$transaction(async (tx) => {
    // Generate order ID
    const orderId = `ORD-GUEST-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order record
    const order = await tx.order.create({
      data: {
        id: orderId,
        userId: null, // Guest order
        sessionId: sessionId,
        total: totals.total,
        status: "pending",
        deliverDate: null,
        discountId: null,
        paymentId: null,
        createdAt: new Date(),
        modifiedAt: new Date(),
      },
    });

    // Create order items
    for (const item of items) {
      await tx.orderItem.create({
        data: {
          id: crypto.randomUUID(),
          orderId: orderId,
          productId: item.product_id,
          quantity: item.quantity,
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
      });

      // Update product inventory
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

    // Create payment record (simulated for demo)
    const payment = await tx.payment.create({
      data: {
        id: crypto.randomUUID(),
        userId: null, // Guest payment
        orderId: orderId,
        amount: totals.total,
        provider: "demo_payment_processor",
        status: "completed",
        transactionCode: `TXN-GUEST-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        createdAt: new Date(),
        modifiedAt: new Date(),
      },
    });

    // Update order with payment ID
    await tx.order.update({
      where: { id: orderId },
      data: {
        paymentId: payment.id,
        status: "confirmed",
      },
    });

    // Store guest information (in a real app, you'd hash passwords and create user account if requested)
    if (guestInfo.createAccount && guestInfo.password) {
      // For demo purposes, we'll just log this
      console.log(`Guest account creation requested for ${guestInfo.email}`);
      // In production, you'd create a user account here
    }

    // Log order details for guest
    console.log(`Guest order created: ${orderId} for ${guestInfo.email}`);

    return orderId;
  });
}

