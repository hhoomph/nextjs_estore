/**
 * Module for schemas
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { z } from "zod";

/**
 * Validation schemas for forms and API inputs
 */

// User validation schemas
export const userSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().optional(),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100, "Name too long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Product validation schemas
export const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255, "Name too long"),
  desc: z.string().optional(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Invalid slug format"),
  category_id: z.string().min(1, "Category is required"),
  quantity: z.number().min(0, "Quantity cannot be negative"),
  price: z.number().min(0, "Price cannot be negative"),
  discount_price: z
    .number()
    .min(0, "Discount price cannot be negative")
    .optional(),
  status: z.number().min(0).max(1).default(1),
});

export const productFiltersSchema = z.object({
  category: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  inStock: z.boolean().optional(),
  sortBy: z
    .enum([
      "price_asc",
      "price_desc",
      "name_asc",
      "name_desc",
      "newest",
      "oldest",
    ])
    .optional(),
  search: z.string().optional(),
});

// Cart validation schemas
export const cartItemSchema = z.object({
  product_id: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().min(0, "Quantity cannot be negative"),
});

// Order validation schemas
export const orderSchema = z.object({
  user_id: z.string().optional(),
  total: z.number().min(0, "Total cannot be negative"),
  deliver_date: z.date().optional(),
});

export const orderItemSchema = z.object({
  order_id: z.string().min(1, "Order ID is required"),
  product_id: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

// Review validation schemas
export const reviewSchema = z.object({
  product_id: z.string().min(1, "Product ID is required"),
  rating: z
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot be more than 5"),
  title: z.string().max(255, "Title too long").optional(),
  comment: z.string().max(1000, "Comment too long").optional(),
});

// Address validation schemas
export const addressSchema = z.object({
  address_line1: z.string().min(1, "Address line 1 is required"),
  address_line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  telephone: z.string().optional(),
  mobile: z.string().optional(),
});

// API parameter validation schemas
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export const searchParamsSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  filters: productFiltersSchema.optional(),
});

// Form validation types
export type UserFormData = z.infer<typeof userSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type ProductFiltersData = z.infer<typeof productFiltersSchema>;
export type CartItemFormData = z.infer<typeof cartItemSchema>;
export type UpdateCartItemData = z.infer<typeof updateCartItemSchema>;
export type OrderFormData = z.infer<typeof orderSchema>;
export type OrderItemFormData = z.infer<typeof orderItemSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type PaginationParams = z.infer<typeof paginationSchema>;
export type SearchParamsData = z.infer<typeof searchParamsSchema>;
