/**
 * Validation Schemas
 *
 * Centralized Zod schemas for input validation across the application.
 * All user inputs are validated before processing to ensure type safety
 * and prevent security vulnerabilities.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import { z } from "zod";

// ============================================================================
// Product Validation
// ============================================================================

export const ProductCreateSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200, "Product name too long"),
  slug: z.string().min(1, "Slug is required").max(200, "Slug too long"),
  desc: z.string().max(1000, "Description too long").optional(),
  price: z.number().positive("Price must be positive"),
  discountPrice: z.number().nonnegative().optional(),
  quantity: z.number().int().min(0, "Quantity cannot be negative"),
  categoryId: z.string().min(1, "Category is required"),
  status: z.number().int().min(0).max(1).optional(),
});

export const ProductUpdateSchema = ProductCreateSchema.partial().extend({
  id: z.string().min(1),
});

export const ProductQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sortBy: z.enum(["createdAt", "price", "name", "wishlistCount"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  search: z.string().max(200).optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  inStock: z.coerce.boolean().optional(),
});

// ============================================================================
// Category Validation
// ============================================================================

export const CategoryCreateSchema = z.object({
  name: z.string().min(1, "Category name is required").max(100, "Category name too long"),
  slug: z.string().min(1, "Slug is required").max(200, "Slug too long"),
  parentId: z.string().optional(),
  level: z.number().int().optional(),
  description: z.string().max(500).optional(),
});

export const CategoryUpdateSchema = CategoryCreateSchema.partial().extend({
  id: z.string().min(1),
});

// ============================================================================
// Cart Validation
// ============================================================================

export const CartItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").max(100, "Quantity too high"),
});

export const CartSchema = z.object({
  items: z.array(CartItemSchema).min(1, "Cart must have at least one item"),
});

// ============================================================================
// Authentication Validation
// ============================================================================

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// ============================================================================
// Newsletter Validation
// ============================================================================

export const NewsletterSubscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required").max(100, "Name too long").optional(),
});

export const NewsletterUnsubscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
  token: z.string().min(1, "Unsubscribe token is required"),
});

// ============================================================================
// Search Validation
// ============================================================================

export const SearchSchema = z.object({
  query: z.string().min(1, "Search query is required").max(500, "Search query too long"),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

// ============================================================================
// Review Validation
// ============================================================================

export const ReviewCreateSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
  comment: z.string().min(10, "Review must be at least 10 characters").max(1000, "Review too long").optional(),
});

// ============================================================================
// Wishlist Validation
// ============================================================================

export const WishlistAddSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
});

export const WishlistRemoveSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
});

// ============================================================================
// Common Validation Helpers
// ============================================================================

/**
 * Validate and transform input
 * @param schema Zod schema to validate against
 * @param data Input data to validate
 * @returns Validated and transformed data, or throws error
 */
export function validate<T extends z.ZodType>(
  schema: T,
  data: unknown
): z.infer<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Validation failed: ${error.issues
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", ")}`
      );
    }
    throw error;
  }
}

/**
 * Safe parse with custom error handler
 * @param schema Zod schema to validate against
 * @param data Input data to validate
 * @param onError Custom error handler
 * @returns Validated data or null if validation fails
 */
export function safeParse<T extends z.ZodType>(
  schema: T,
  data: unknown,
  onError?: (error: z.ZodError) => void
): z.infer<T> | null {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      onError?.(error);
      return null;
    }
    return null;
  }
}

/**
 * Get first validation error message
 * @param error Zod error object
 * @returns First error message or null
 */
export function getFirstError(error: z.ZodError): string | null {
  if (error.issues.length > 0) {
    return error.issues[0].message;
  }
  return null;
}
