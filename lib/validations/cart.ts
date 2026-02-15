/**
 * Cart Validation Schemas and Error Handling
 *
 * Comprehensive validation for cart operations, checkout flows,
 * and error handling with user-friendly messages.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import { z } from "zod";
import {
  CART_ERROR_CODES,
  type CartError,
  type CartValidationResult,
  type EnhancedCartItem,
} from "@/types/cart";

// Enhanced cart item validation schema
export const enhancedCartItemSchema = z.object({
  id: z.string().min(1, "Cart item ID is required"),
  product_id: z.string().min(1, "Product ID is required"),
  product_options_id: z.string().optional(),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(999, "Quantity cannot exceed 999"),
  product: z.object({
    id: z.string().min(1, "Product ID is required"),
    name: z.string().min(1, "Product name is required"),
    price: z.number().min(0, "Price must be non-negative"),
    discount_price: z
      .number()
      .min(0, "Discount price must be non-negative")
      .optional(),
    slug: z.string().min(1, "Product slug is required"),
    product_pictures: z
      .array(
        z.object({
          picture: z.object({
            url: z.string().url("Invalid image URL"),
          }),
        }),
      )
      .optional(),
  }),
  options: z
    .object({
      name: z.string().min(1, "Option name is required"),
      value: z.string().min(1, "Option value is required"),
      price_increment: z
        .number()
        .min(0, "Price increment must be non-negative")
        .optional(),
    })
    .optional(),
  addedAt: z.date(),
  updatedAt: z.date(),
  sessionId: z.string().optional(),
  isPersisted: z.boolean(),
});

// Cart update validation schema
export const cartUpdateSchema = z.object({
  type: z.enum(["add", "remove", "update"]),
  item: enhancedCartItemSchema,
  timestamp: z.date(),
  synced: z.boolean(),
});

// Bulk cart update validation schema
export const bulkCartUpdateSchema = z.object({
  updates: z
    .array(cartUpdateSchema)
    .max(50, "Too many updates in a single request"),
  guestId: z.string().optional(),
  userId: z.string().optional(),
});

// Checkout validation schemas
export const shippingAddressSchema = z.object({
  address_line1: z.string().min(1, "Address line 1 is required").max(255),
  address_line2: z.string().max(255).optional(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State/Province is required").max(100),
  postal_code: z.string().min(1, "Postal code is required").max(20),
  country: z.string().min(1, "Country is required").max(100),
});

export const billingAddressSchema = shippingAddressSchema.extend({
  sameAsShipping: z.boolean().optional(),
});

export const paymentMethodSchema = z.object({
  type: z.enum(["credit_card", "debit_card", "paypal", "bank_transfer"]),
  provider: z.string().min(1, "Payment provider is required"),
  last4: z
    .string()
    .regex(/^\d{4}$/, "Last 4 digits must be 4 numbers")
    .optional(),
  expiryMonth: z.number().min(1).max(12).optional(),
  expiryYear: z.number().min(new Date().getFullYear()).optional(),
  isDefault: z.boolean().default(false),
});

export const checkoutSessionSchema = z.object({
  id: z.string().min(1, "Session ID is required"),
  guestId: z.string().optional(),
  userId: z.string().optional(),
  items: z
    .array(enhancedCartItemSchema)
    .min(1, "At least one item is required"),
  shippingAddress: shippingAddressSchema.optional(),
  billingAddress: billingAddressSchema.optional(),
  paymentMethod: paymentMethodSchema.optional(),
  step: z.enum(["cart", "shipping", "payment", "review", "confirmation"]),
  expiresAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Guest order validation schema
export const guestOrderSchema = z
  .object({
    guestInfo: z.object({
      email: z.string().email("Invalid email address"),
      firstName: z.string().min(1, "First name is required").max(100),
      lastName: z.string().min(1, "Last name is required").max(100),
      phone: z
        .string()
        .min(10, "Phone number must be at least 10 digits")
        .max(20),
      createAccount: z.boolean().default(false),
      password: z.string().optional(),
    }),
    shippingAddress: shippingAddressSchema,
    billingAddress: billingAddressSchema.optional(),
    items: z
      .array(enhancedCartItemSchema)
      .min(1, "At least one item is required"),
    sessionId: z.string().min(1, "Session ID is required"),
    totals: z.object({
      subtotal: z.number().min(0),
      shipping: z.number().min(0),
      tax: z.number().min(0),
      total: z.number().min(0),
    }),
  })
  .refine(
    (data) => {
      // If creating account, password is required and must be strong enough
      if (data.guestInfo.createAccount) {
        if (!data.guestInfo.password || data.guestInfo.password.length < 8) {
          return false;
        }
      }
      return true;
    },
    {
      message:
        "Password must be at least 8 characters when creating an account",
      path: ["guestInfo", "password"],
    },
  )
  .refine(
    (data) => {
      // Validate total calculation
      const calculatedTotal =
        data.totals.subtotal + data.totals.shipping + data.totals.tax;
      return Math.abs(calculatedTotal - data.totals.total) < 0.01;
    },
    {
      message: "Order total calculation is incorrect",
      path: ["totals", "total"],
    },
  );

// Error handling utilities
export class CartValidationError extends Error {
  public readonly code: string;
  public readonly field?: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    field?: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "CartValidationError";
    this.code = code;
    this.field = field;
    this.details = details;
  }
}

export class CartOperationError extends Error {
  public readonly operation: string;
  public readonly itemId?: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    operation: string,
    message: string,
    itemId?: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "CartOperationError";
    this.operation = operation;
    this.itemId = itemId;
    this.details = details;
  }
}

// Validation functions
export function validateCartItem(
  item: Partial<EnhancedCartItem>,
): CartValidationResult {
  const errors: CartError[] = [];

  try {
    enhancedCartItemSchema.parse(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(
        ...error.issues.map((err) => ({
          code: CART_ERROR_CODES.INVALID_QUANTITY, // Generic error code
          message: err.message,
          field: err.path.join("."),
        })),
      );
    }
  }

  // Additional business logic validation
  if (item.quantity && item.quantity <= 0) {
    errors.push({
      code: CART_ERROR_CODES.INVALID_QUANTITY,
      message: "Quantity must be greater than 0",
      field: "quantity",
    });
  }

  if (item.product?.price && item.product.price < 0) {
    errors.push({
      code: CART_ERROR_CODES.INVALID_QUANTITY, // Using generic code
      message: "Product price cannot be negative",
      field: "product.price",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: [],
  };
}

export function validateCartUpdate(
  update: Partial<CartUpdateInput>,
): CartValidationResult {
  const errors: CartError[] = [];

  try {
    cartUpdateSchema.parse(update);
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(
        ...error.issues.map((err) => ({
          code: CART_ERROR_CODES.INVALID_QUANTITY,
          message: err.message,
          field: err.path.join("."),
        })),
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: [],
  };
}

export function validateCheckoutSession(
  session: Partial<CheckoutSessionInput>,
): CartValidationResult {
  const errors: CartError[] = [];

  try {
    checkoutSessionSchema.parse(session);
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(
        ...error.issues.map((err) => ({
          code: CART_ERROR_CODES.INVALID_QUANTITY,
          message: err.message,
          field: err.path.join("."),
        })),
      );
    }
  }

  // Additional validation for expiration
  if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
    errors.push({
      code: CART_ERROR_CODES.SESSION_EXPIRED,
      message: "Checkout session has expired",
      field: "expiresAt",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: [],
  };
}

export function validateGuestOrder(
  order: Partial<GuestOrderInput>,
): CartValidationResult {
  const errors: CartError[] = [];

  try {
    guestOrderSchema.parse(order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(
        ...error.issues.map((err) => ({
          code: CART_ERROR_CODES.INVALID_QUANTITY,
          message: err.message,
          field: err.path.join("."),
        })),
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: [],
  };
}

// Stock validation function
export async function validateStockAvailability(
  productId: string,
  requestedQuantity: number,
): Promise<{ available: boolean; availableQuantity: number; error?: string }> {
  try {
    // In a real implementation, this would query the database
    // For now, we'll simulate stock checking
    const availableQuantity = 100; // Mock data

    if (requestedQuantity > availableQuantity) {
      return {
        available: false,
        availableQuantity,
        error: `Only ${availableQuantity} items available`,
      };
    }

    return {
      available: true,
      availableQuantity,
    };
  } catch (error) {
    return {
      available: false,
      availableQuantity: 0,
      error: "Failed to check stock availability",
    };
  }
}

// Price validation function
export async function validatePricing(
  items: EnhancedCartItem[],
): Promise<{ valid: boolean; errors: CartError[] }> {
  const errors: CartError[] = [];

  for (const item of items) {
    try {
      // In a real implementation, this would verify current prices from database
      const currentPrice = item.product.price; // Mock current price
      const itemPrice = item.product.discount_price || item.product.price;

      if (Math.abs(currentPrice - itemPrice) > 0.01) {
        errors.push({
          code: CART_ERROR_CODES.INVALID_QUANTITY, // Using generic code
          message: `Price for ${item.product.name} has changed`,
          field: `items.${item.id}.product.price`,
        });
      }
    } catch (error) {
      errors.push({
        code: CART_ERROR_CODES.PRODUCT_NOT_FOUND,
        message: `Failed to validate price for ${item.product.name}`,
        field: `items.${item.id}`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Error message utilities
export function getErrorMessage(error: CartError): string {
  switch (error.code) {
    case CART_ERROR_CODES.OUT_OF_STOCK:
      return `Item is out of stock: ${error.message}`;
    case CART_ERROR_CODES.INVALID_QUANTITY:
      return `Invalid quantity: ${error.message}`;
    case CART_ERROR_CODES.PRODUCT_NOT_FOUND:
      return `Product not found: ${error.message}`;
    case CART_ERROR_CODES.SYNC_FAILED:
      return `Sync failed: ${error.message}`;
    case CART_ERROR_CODES.SESSION_EXPIRED:
      return `Session expired: ${error.message}`;
    default:
      return error.message || "An unknown error occurred";
  }
}

export function getFieldErrorMessage(
  field: string,
  errors: CartError[],
): string | undefined {
  const fieldError = errors.find((error) => error.field === field);
  return fieldError ? getErrorMessage(fieldError) : undefined;
}

// Type exports
export type EnhancedCartItemInput = z.infer<typeof enhancedCartItemSchema>;
export type CartUpdateInput = z.infer<typeof cartUpdateSchema>;
export type BulkCartUpdateInput = z.infer<typeof bulkCartUpdateSchema>;
export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
export type BillingAddressInput = z.infer<typeof billingAddressSchema>;
export type PaymentMethodInput = z.infer<typeof paymentMethodSchema>;
export type CheckoutSessionInput = z.infer<typeof checkoutSessionSchema>;
export type GuestOrderInput = z.infer<typeof guestOrderSchema>;
