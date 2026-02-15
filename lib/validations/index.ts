/**
 * Module for index
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { z } from "zod";
import {
  sanitizeEmail,
  sanitizeHtml,
  sanitizePhoneNumber,
  sanitizeText,
  validatePasswordStrength,
} from "@/lib/security/sanitization";

// Enhanced auth schemas with security
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .max(254, "Email is too long")
    .email("Please enter a valid email address")
    .transform(sanitizeEmail),
  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password is too long"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name is too long")
      .regex(/^[a-zA-Z\s\-'.]+$/, "Name contains invalid characters")
      .transform(sanitizeText),
    email: z
      .string()
      .min(1, "Email is required")
      .max(254, "Email is too long")
      .email("Please enter a valid email address")
      .transform(sanitizeEmail),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long")
      .refine((password) => validatePasswordStrength(password).isValid, {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      }),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    phone_number: z
      .string()
      .optional()
      .refine(
        (phone) => !phone || phone.length >= 10,
        "Phone number is too short",
      )
      .refine(
        (phone) => !phone || phone.length <= 20,
        "Phone number is too long",
      )
      .transform((phone) => (phone ? sanitizePhoneNumber(phone) : phone)),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Enhanced product schemas with security
export const productSchema = z
  .object({
    name: z
      .string()
      .min(1, "Product name is required")
      .max(200, "Product name is too long")
      .transform(sanitizeText),
    desc: z
      .string()
      .optional()
      .refine((desc) => !desc || desc.length <= 5000, "Description is too long")
      .transform((desc) => (desc ? sanitizeHtml(desc) : desc)),
    slug: z
      .string()
      .min(1, "Product slug is required")
      .max(100, "Product slug is too long")
      .regex(
        /^[a-z0-9-]+$/,
        "Slug can only contain lowercase letters, numbers, and hyphens",
      ),
    category_id: z
      .string()
      .min(1, "Category is required")
      .uuid("Invalid category ID"),
    quantity: z
      .number()
      .min(0, "Quantity must be 0 or more")
      .max(999999, "Quantity is too large")
      .int("Quantity must be a whole number"),
    price: z
      .number()
      .min(0.01, "Price must be greater than 0")
      .max(999999.99, "Price is too high")
      .refine(
        (price) => Number(price.toFixed(2)) === price,
        "Price can only have 2 decimal places",
      ),
    discount_price: z
      .number()
      .optional()
      .refine(
        (val) => val === undefined || val > 0,
        "Discount price must be greater than 0",
      )
      .refine(
        (val) => val === undefined || val <= 999999.99,
        "Discount price is too high",
      ),
    status: z
      .number()
      .min(0, "Invalid status")
      .max(1, "Invalid status")
      .int("Status must be a whole number"),
  })
  .refine((data) => !data.discount_price || data.discount_price < data.price, {
    message: "Discount price must be less than regular price",
    path: ["discount_price"],
  });

// Enhanced category schemas with security
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name is too long")
    .transform(sanitizeText),
  parent_id: z
    .string()
    .optional()
    .refine(
      (id) =>
        !id ||
        id.match(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        ),
      "Invalid parent category ID",
    ),
});

// Enhanced address schemas with security
export const addressSchema = z.object({
  address_line1: z
    .string()
    .min(1, "Address line 1 is required")
    .max(255, "Address line 1 is too long")
    .transform(sanitizeText),
  address_line2: z
    .string()
    .optional()
    .refine((line) => !line || line.length <= 255, "Address line 2 is too long")
    .transform((line) => (line ? sanitizeText(line) : line)),
  city: z
    .string()
    .min(1, "City is required")
    .max(100, "City name is too long")
    .transform(sanitizeText),
  state: z
    .string()
    .min(1, "State is required")
    .max(100, "State name is too long")
    .transform(sanitizeText),
  postal_code: z
    .string()
    .min(1, "Postal code is required")
    .max(20, "Postal code is too long")
    .regex(/^[A-Z0-9\s-]+$/, "Invalid postal code format"),
  telephone: z
    .string()
    .optional()
    .refine(
      (phone) => !phone || phone.length >= 10,
      "Telephone number is too short",
    )
    .refine(
      (phone) => !phone || phone.length <= 20,
      "Telephone number is too long",
    )
    .transform((phone) => (phone ? sanitizePhoneNumber(phone) : phone)),
  mobile: z
    .string()
    .optional()
    .refine(
      (phone) => !phone || phone.length >= 10,
      "Mobile number is too short",
    )
    .refine(
      (phone) => !phone || phone.length <= 20,
      "Mobile number is too long",
    )
    .transform((phone) => (phone ? sanitizePhoneNumber(phone) : phone)),
});

// Enhanced review schemas with security
export const reviewSchema = z.object({
  rating: z
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5")
    .int("Rating must be a whole number"),
  title: z
    .string()
    .optional()
    .refine((title) => !title || title.length <= 200, "Title is too long")
    .transform((title) => (title ? sanitizeText(title) : title)),
  comment: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(2000, "Review is too long")
    .transform(sanitizeText),
});

// Enhanced order schemas with security
export const orderSchema = z.object({
  items: z
    .array(
      z.object({
        product_id: z.string().uuid("Invalid product ID"),
        quantity: z
          .number()
          .min(1, "Quantity must be at least 1")
          .max(99, "Quantity is too large")
          .int("Quantity must be a whole number"),
      }),
    )
    .min(1, "Order must have at least one item")
    .max(50, "Order cannot have more than 50 items"),
  address_id: z
    .string()
    .min(1, "Shipping address is required")
    .uuid("Invalid address ID"),
});

// Enhanced search and filter schemas with security
export const productFiltersSchema = z
  .object({
    category: z
      .string()
      .optional()
      .refine(
        (cat) =>
          !cat ||
          cat.match(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
          ),
        "Invalid category ID",
      ),
    minPrice: z
      .number()
      .optional()
      .refine(
        (price) => price === undefined || (price >= 0 && price <= 999999.99),
        "Invalid price range",
      ),
    maxPrice: z
      .number()
      .optional()
      .refine(
        (price) => price === undefined || (price >= 0 && price <= 999999.99),
        "Invalid price range",
      ),
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
    search: z
      .string()
      .optional()
      .refine(
        (search) => !search || search.length <= 100,
        "Search query is too long",
      )
      .transform((search) => (search ? sanitizeText(search) : search)),
  })
  .refine(
    (data) =>
      !data.minPrice || !data.maxPrice || data.minPrice <= data.maxPrice,
    {
      message: "Minimum price must be less than or equal to maximum price",
      path: ["minPrice"],
    },
  );

export const searchParamsSchema = z.object({
  q: z
    .string()
    .optional()
    .refine((q) => !q || q.length <= 100, "Search query is too long")
    .transform((q) => (q ? sanitizeText(q) : q)),
  category: z
    .string()
    .optional()
    .refine(
      (cat) =>
        !cat ||
        cat.match(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        ),
      "Invalid category ID",
    ),
  page: z
    .number()
    .min(1, "Page must be at least 1")
    .max(1000, "Page number is too large")
    .optional(),
  limit: z
    .number()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .optional(),
  sortBy: z
    .string()
    .optional()
    .refine(
      (sort) =>
        !sort ||
        [
          "price_asc",
          "price_desc",
          "name_asc",
          "name_desc",
          "newest",
          "oldest",
          "rating",
        ].includes(sort),
      "Invalid sort option",
    ),
});

// Enhanced user profile schemas with security
export const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long")
    .regex(/^[a-zA-Z\s\-'.]+$/, "Name contains invalid characters")
    .transform(sanitizeText),
  email: z
    .string()
    .min(1, "Email is required")
    .max(254, "Email is too long")
    .email("Please enter a valid email address")
    .transform(sanitizeEmail),
  phone_number: z
    .string()
    .optional()
    .refine(
      (phone) => !phone || phone.length >= 10,
      "Phone number is too short",
    )
    .refine((phone) => !phone || phone.length <= 20, "Phone number is too long")
    .transform((phone) => (phone ? sanitizePhoneNumber(phone) : phone)),
  username: z
    .string()
    .optional()
    .refine(
      (username) =>
        !username ||
        (username.length >= 3 &&
          username.length <= 30 &&
          /^[a-zA-Z0-9_-]+$/.test(username)),
      "Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens",
    ),
});

// Enhanced password change schemas with security
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required")
      .max(128, "Password is too long"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(128, "Password is too long")
      .refine((password) => validatePasswordStrength(password).isValid, {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      }),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

// Enhanced contact form schemas with security
export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long")
    .regex(/^[a-zA-Z\s\-'.]+$/, "Name contains invalid characters")
    .transform(sanitizeText),
  email: z
    .string()
    .min(1, "Email is required")
    .max(254, "Email is too long")
    .email("Please enter a valid email address")
    .transform(sanitizeEmail),
  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .max(200, "Subject is too long")
    .transform(sanitizeText),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message is too long")
    .transform(sanitizeText),
});

// Enhanced newsletter subscription schemas with security
export const newsletterSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .max(254, "Email is too long")
    .email("Please enter a valid email address")
    .transform(sanitizeEmail),
});

// Export types
export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
export type ProductForm = z.infer<typeof productSchema>;
export type CategoryForm = z.infer<typeof categorySchema>;
export type AddressForm = z.infer<typeof addressSchema>;
export type ReviewForm = z.infer<typeof reviewSchema>;
export type OrderForm = z.infer<typeof orderSchema>;
export type ProductFilters = z.infer<typeof productFiltersSchema>;
export type SearchParams = z.infer<typeof searchParamsSchema>;
export type ProfileForm = z.infer<typeof profileSchema>;
export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;
export type ContactForm = z.infer<typeof contactSchema>;
export type NewsletterForm = z.infer<typeof newsletterSchema>;
