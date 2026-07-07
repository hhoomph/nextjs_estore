/**
 * Cart Validation Schemas
 *
 * Zod schemas for cart-related input validation to prevent invalid data
 * from entering the cart system.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import { z } from "zod";
import { CART_CONSTANTS } from "@/lib/constants/cart";

/**
 * Validates that a quantity value is a positive integer within allowed range.
 */
export const QuantitySchema = z
  .number()
  .int({ message: "Quantity must be a whole number" })
  .positive({ message: "Quantity must be greater than 0" })
  .max(CART_CONSTANTS.MAX_QUANTITY, {
    message: `Quantity cannot exceed ${CART_CONSTANTS.MAX_QUANTITY}`,
  });

/**
 * Validates a cart item creation input.
 */
export const CartItemInputSchema = z.object({
  product_id: z.string().min(1, "Product ID is required"),
  product_options_id: z.string().optional(),
  product: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    price: z.number().nonnegative(),
    discount_price: z.number().nonnegative().optional().nullable(),
    slug: z.string().optional(),
  }),
  options: z
    .object({
      name: z.string(),
      value: z.string(),
      price_increment: z.number().optional(),
    })
    .optional(),
  quantity: QuantitySchema.optional().default(1),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
});

export type CartItemInput = z.infer<typeof CartItemInputSchema>;

/**
 * Validates a quantity value and returns a boolean result.
 */
export function validateQuantity(quantity: unknown): quantity is number {
  return QuantitySchema.safeParse(quantity).success;
}

/**
 * Returns validation error messages for a quantity value, or empty array if valid.
 */
export function getQuantityErrors(quantity: unknown): string[] {
  const result = QuantitySchema.safeParse(quantity);
  if (result.success) return [];
  return result.error.issues.map((issue) => issue.message);
}

/**
 * Validates a cart item input and returns error messages.
 */
export function validateCartItemInput(
  input: unknown,
): { valid: false; errors: string[] } | { valid: true; data: CartItemInput } {
  const result = CartItemInputSchema.safeParse(input);
  if (result.success) {
    return { valid: true, data: result.data };
  }
  return {
    valid: false,
    errors: result.error.issues.map((issue) => issue.message),
  };
}