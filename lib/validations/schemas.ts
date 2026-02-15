/**
 * Module for schemas
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { z } from "zod";

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one lowercase letter, one uppercase letter, and one number",
      ),
    confirmPassword: z.string(),
    firstName: z
      .string()
      .min(1, "First name is required")
      .max(50, "First name too long"),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .max(50, "Last name too long"),
    phone: z.string().optional(),
    acceptTerms: z
      .boolean()
      .refine(
        (val) => val === true,
        "You must accept the terms and conditions",
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const passwordResetSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const passwordResetConfirmSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one lowercase letter, one uppercase letter, and one number",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one lowercase letter, one uppercase letter, and one number",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// User profile schemas
export const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50).optional(),
  lastName: z.string().min(1, "Last name is required").max(50).optional(),
  phone: z.string().optional(),
});

export const addressSchema = z.object({
  type: z.enum(["billing", "shipping", "home", "work"]),
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  company: z.string().optional(),
  addressLine1: z.string().min(1, "Address is required").max(100),
  addressLine2: z.string().max(100).optional(),
  city: z.string().min(1, "City is required").max(50),
  state: z.string().min(1, "State is required").max(50),
  postalCode: z.string().min(1, "Postal code is required").max(20),
  country: z.string().min(1, "Country is required").max(50),
  phone: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const userPreferencesSchema = z.object({
  language: z.string().min(2).max(5),
  currency: z.string().length(3),
  timezone: z.string(),
  notifications: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    push: z.boolean(),
    marketing: z.boolean(),
    orderUpdates: z.boolean(),
  }),
  privacy: z.object({
    profileVisibility: z.enum(["public", "private", "friends"]),
    showOnlineStatus: z.boolean(),
    allowMessages: z.boolean(),
  }),
});

// Product schemas
export const productSchema = z
  .object({
    name: z.string().min(1, "Product name is required").max(100),
    slug: z
      .string()
      .min(1, "Slug is required")
      .max(100)
      .regex(
        /^[a-z0-9-]+$/,
        "Slug must contain only lowercase letters, numbers, and hyphens",
      ),
    description: z.string().max(2000).optional(),
    price: z.number().positive("Price must be positive"),
    discountPrice: z.number().positive().optional(),
    quantity: z.number().int().min(0, "Quantity cannot be negative"),
    categoryId: z.string().min(1, "Category is required"),
    images: z
      .array(z.string().url())
      .max(10, "Maximum 10 images allowed")
      .optional(),
    tags: z
      .array(z.string().max(50))
      .max(20, "Maximum 20 tags allowed")
      .optional(),
    attributes: z
      .array(
        z.object({
          name: z.string().min(1).max(50),
          value: z.string().min(1).max(100),
          type: z.enum(["text", "number", "boolean", "color", "size"]),
        }),
      )
      .optional(),
    seo: z
      .object({
        title: z.string().max(60).optional(),
        description: z.string().max(160).optional(),
        keywords: z.array(z.string().max(50)).max(10).optional(),
      })
      .optional(),
  })
  .refine((data) => !data.discountPrice || data.discountPrice < data.price, {
    message: "Discount price must be less than regular price",
    path: ["discountPrice"],
  });

export const productFiltersSchema = z.object({
  category: z.string().optional(),
  priceMin: z.number().positive().optional(),
  priceMax: z.number().positive().optional(),
  status: z.enum(["active", "inactive", "draft", "archived"]).optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().max(100).optional(),
  sortBy: z
    .enum(["name", "price", "createdAt", "created_at", "rating"])
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

// Order schemas
export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product ID is required"),
        variantId: z.string().optional(),
        quantity: z.number().int().positive("Quantity must be positive"),
      }),
    )
    .min(1, "At least one item is required"),
  shippingAddressId: z.string().min(1, "Shipping address is required"),
  billingAddressId: z.string().min(1, "Billing address is required"),
  paymentMethod: z.enum([
    "credit_card",
    "debit_card",
    "paypal",
    "stripe",
    "bank_transfer",
    "cash_on_delivery",
    "digital_wallet",
  ]),
  notes: z.string().max(500).optional(),
  couponCode: z.string().max(20).optional(),
});

export const updateOrderSchema = z.object({
  status: z
    .enum([
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
      "returned",
    ])
    .optional(),
  trackingNumber: z.string().max(100).optional(),
  estimatedDelivery: z.date().optional(),
  notes: z.string().max(500).optional(),
});

export const orderFiltersSchema = z.object({
  status: z
    .enum([
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
      "returned",
    ])
    .optional(),
  paymentStatus: z
    .enum([
      "pending",
      "processing",
      "completed",
      "failed",
      "cancelled",
      "refunded",
      "partially_refunded",
    ])
    .optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  userId: z.string().optional(),
  search: z.string().max(100).optional(),
  sortBy: z.enum(["created_at", "total", "status"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

// Checkout schemas
export const checkoutSchema = z
  .object({
    shippingAddress: addressSchema,
    billingAddress: addressSchema,
    paymentMethod: z.enum([
      "credit_card",
      "debit_card",
      "paypal",
      "stripe",
      "bank_transfer",
      "cash_on_delivery",
      "digital_wallet",
    ]),
    cardNumber: z
      .string()
      .regex(/^\d{13,19}$/, "Invalid card number")
      .optional(),
    expiryDate: z
      .string()
      .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid expiry date (MM/YY)")
      .optional(),
    cvv: z
      .string()
      .regex(/^\d{3,4}$/, "Invalid CVV")
      .optional(),
    savePaymentMethod: z.boolean().optional(),
    notes: z.string().max(500).optional(),
    acceptTerms: z
      .boolean()
      .refine(
        (val) => val === true,
        "You must accept the terms and conditions",
      ),
  })
  .refine(
    (data) => {
      if (["credit_card", "debit_card"].includes(data.paymentMethod)) {
        return data.cardNumber && data.expiryDate && data.cvv;
      }
      return true;
    },
    {
      message: "Card details are required for card payments",
    },
  );

// Review schemas
export const reviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  title: z.string().max(100).optional(),
  content: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(1000, "Review too long"),
  images: z
    .array(z.string().url())
    .max(5, "Maximum 5 images allowed")
    .optional(),
});

export const reviewResponseSchema = z.object({
  content: z
    .string()
    .min(10, "Response must be at least 10 characters")
    .max(500, "Response too long"),
});

// Coupon schemas
export const couponSchema = z
  .object({
    code: z
      .string()
      .min(3, "Code must be at least 3 characters")
      .max(20, "Code too long")
      .regex(
        /^[A-Z0-9_-]+$/i,
        "Code can only contain letters, numbers, hyphens, and underscores",
      ),
    name: z.string().min(1, "Name is required").max(100),
    description: z.string().max(500).optional(),
    type: z.enum(["percentage", "fixed_amount", "free_shipping"]),
    value: z.number().positive("Value must be positive"),
    minPurchase: z.number().positive().optional(),
    maxDiscount: z.number().positive().optional(),
    usageLimit: z.number().int().positive().optional(),
    userLimit: z.number().int().positive().optional(),
    validFrom: z.date(),
    validTo: z.date(),
    applicableCategories: z.array(z.string()).optional(),
    applicableProducts: z.array(z.string()).optional(),
    excludedCategories: z.array(z.string()).optional(),
    excludedProducts: z.array(z.string()).optional(),
  })
  .refine((data) => data.validTo > data.validFrom, {
    message: "Valid to date must be after valid from date",
    path: ["validTo"],
  })
  .refine(
    (data) => {
      if (data.type === "percentage") {
        return data.value <= 100;
      }
      return true;
    },
    {
      message: "Percentage discount cannot exceed 100%",
      path: ["value"],
    },
  );

// Category schemas
export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),
  description: z.string().max(500).optional(),
  parentId: z.string().optional(),
  image: z.string().url().optional(),
  seo: z
    .object({
      title: z.string().max(60).optional(),
      description: z.string().max(160).optional(),
      keywords: z.array(z.string().max(50)).max(10).optional(),
    })
    .optional(),
});

// Search schemas
export const searchSchema = z.object({
  query: z.string().min(1, "Search query is required").max(100),
  category: z.string().optional(),
  priceMin: z.number().positive().optional(),
  priceMax: z.number().positive().optional(),
  sortBy: z.enum(["relevance", "price", "rating", "newest"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

// File upload schemas
export const fileUploadSchema = z
  .object({
    file: z
      .instanceof(File)
      .refine(
        (file) => file.size <= 5 * 1024 * 1024,
        "File size must be less than 5MB",
      ),
  })
  .refine(
    (file) => {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ];
      return allowedTypes.includes(file.file.type);
    },
    {
      message: "File must be a valid image (JPEG, PNG, WebP, GIF)",
    },
  );

// Pagination schemas
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(12),
});

// Generic validation helpers
export const emailSchema = z.string().email("Invalid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one lowercase letter, one uppercase letter, and one number",
  );

export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-()]+$/, "Invalid phone number");

export const urlSchema = z.string().url("Invalid URL");

// API validation helpers
export function validateApiInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError = error as z.ZodError;
      const firstError = zodError.issues[0];
      throw new Error(`${firstError.path.join(".")}: ${firstError.message}`);
    }
    throw error;
  }
}

export function validateFormData<T>(
  schema: z.ZodSchema<T>,
  formData: FormData,
): T {
  const data: Record<string, unknown> = {};

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      data[key] = value;
    } else {
      // Try to parse as JSON first, then fallback to string
      try {
        data[key] = JSON.parse(value as string);
      } catch {
        data[key] = value;
      }
    }
  }

  return validateApiInput(schema, data);
}
