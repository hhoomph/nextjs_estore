/**
 * Module for enhanced-schemas
 *
 * Extended Zod schemas with comprehensive business logic validation
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { z } from "zod";

// Enhanced business logic validators
import {
  validateAddressCompleteness,
  validateApiRateLimits,
  validateArrayConstraints,
  validateBulkOperationLimits,
  validateBusinessHours,
  validateCouponCode,
  validateCreditCard,
  validateDateRangeLogic,
  validateDiscountRules,
  validateEmailDomain,
  validateFileUploadSecurity,
  validateHtmlContent,
  validateInventoryAvailability,
  validateIranianNationalId,
  validateIranianPostalCode,
  validateNumericRanges,
  validateObjectStructure,
  validateOrderTotal,
  validatePasswordStrength,
  validatePaymentMethodCompatibility,
  validatePhoneNumber,
  validateProductSlug,
  validateReviewContent,
  validateShippingEligibility,
  validateStringPatterns,
  validateTaxCalculation,
  validateUrlSafety,
  validateUserAgeRestriction,
} from "./custom-validators";

// Enhanced Auth Schemas with Business Logic
export const enhancedLoginSchema = z
  .object({
    email: z
      .string()
      .email("Invalid email address format")
      .refine(validateEmailDomain, "Email domain not allowed")
      .transform((email) => email.toLowerCase().trim()),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .refine(
        validatePasswordStrength,
        "Password does not meet security requirements",
      ),
    rememberMe: z.boolean().optional(),
    captchaToken: z.string().optional(), // For rate limiting
    deviceFingerprint: z.string().optional(), // For security tracking
  })
  .refine(
    (data) => {
      // Business rule: Prevent common password reuse
      return !["password", "123456", "admin"].includes(
        data.password.toLowerCase(),
      );
    },
    {
      message: "This password is too common and insecure",
      path: ["password"],
    },
  );

export const enhancedRegisterSchema = z
  .object({
    email: z
      .string()
      .email("Invalid email address format")
      .refine(validateEmailDomain, "Email domain not allowed")
      .transform((email) => email.toLowerCase().trim()),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .refine(
        validatePasswordStrength,
        "Password does not meet security requirements",
      ),
    confirmPassword: z.string(),
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name cannot exceed 50 characters")
      .regex(
        /^[a-zA-Z\s\u0600-\u06FF]+$/,
        "First name can only contain letters and spaces",
      ),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name cannot exceed 50 characters")
      .regex(
        /^[a-zA-Z\s\u0600-\u06FF]+$/,
        "Last name can only contain letters and spaces",
      ),
    phone: z
      .string()
      .optional()
      .refine(
        (phone) => !phone || validatePhoneNumber(phone),
        "Invalid phone number format",
      ),
    nationalId: z
      .string()
      .optional()
      .refine(
        (nationalId) => !nationalId || validateIranianNationalId(nationalId),
        "Invalid national ID format",
      ),
    dateOfBirth: z
      .string()
      .optional()
      .refine(
        (date) => !date || validateUserAgeRestriction(new Date(date)),
        "Must be at least 13 years old",
      ),
    acceptTerms: z
      .boolean()
      .refine(
        (val) => val === true,
        "You must accept the terms and conditions",
      ),
    acceptMarketing: z.boolean().optional(),
    referralCode: z
      .string()
      .max(20, "Referral code too long")
      .regex(/^[A-Z0-9]+$/i, "Invalid referral code format")
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      // Business rule: Full name uniqueness check (would be validated against database)
      const fullName = `${data.firstName} ${data.lastName}`.toLowerCase();
      return !["admin admin", "test user", "demo user"].includes(fullName);
    },
    {
      message: "This name combination is not allowed",
      path: ["firstName"],
    },
  );

// Enhanced Product Schema with Comprehensive Business Logic
export const enhancedProductSchema = z
  .object({
    name: z
      .string()
      .min(3, "Product name must be at least 3 characters")
      .max(100, "Product name cannot exceed 100 characters")
      .refine(
        (name) => !/[<>]/.test(name),
        "Product name cannot contain HTML tags",
      )
      .refine(
        (name) => name.length > 0 && name.trim().length === name.length,
        "Product name cannot have leading/trailing spaces",
      ),
    slug: z
      .string()
      .min(3, "Slug must be at least 3 characters")
      .max(100, "Slug cannot exceed 100 characters")
      .refine(validateProductSlug, "Invalid slug format"),
    description: z
      .string()
      .max(2000, "Description cannot exceed 2000 characters")
      .refine(validateHtmlContent, "Description contains unsafe HTML content")
      .optional(),
    shortDescription: z
      .string()
      .max(300, "Short description cannot exceed 300 characters")
      .optional(),
    price: z
      .number()
      .positive("Price must be positive")
      .max(999999.99, "Price cannot exceed maximum allowed value")
      .refine(
        (price) => Number(price.toFixed(2)) === price,
        "Price can only have up to 2 decimal places",
      ),
    discountPrice: z
      .number()
      .positive("Discount price must be positive")
      .optional(),
    costPrice: z.number().positive("Cost price must be positive").optional(),
    quantity: z
      .number()
      .int("Quantity must be a whole number")
      .min(0, "Quantity cannot be negative")
      .max(99999, "Quantity cannot exceed maximum stock limit"),
    lowStockThreshold: z.number().int().min(0).max(1000).optional(),
    categoryId: z
      .string()
      .min(1, "Category is required")
      .uuid("Invalid category ID format"),
    brandId: z.string().uuid("Invalid brand ID format").optional(),
    images: z
      .array(
        z
          .string()
          .url("Invalid image URL")
          .refine(validateUrlSafety, "Image URL is not safe"),
      )
      .max(10, "Maximum 10 images allowed")
      .min(1, "At least one image is required")
      .optional(),
    tags: z
      .array(
        z
          .string()
          .max(50, "Tag cannot exceed 50 characters")
          .regex(/^[a-zA-Z0-9\s\-_]+$/, "Tag contains invalid characters"),
      )
      .max(20, "Maximum 20 tags allowed")
      .optional(),
    attributes: z
      .array(
        z.object({
          name: z
            .string()
            .min(1, "Attribute name is required")
            .max(50, "Attribute name too long"),
          value: z
            .string()
            .min(1, "Attribute value is required")
            .max(100, "Attribute value too long"),
          type: z.enum([
            "text",
            "number",
            "boolean",
            "color",
            "size",
            "material",
          ]),
          unit: z.string().max(10).optional(),
          isFilterable: z.boolean().optional(),
          displayOrder: z.number().int().min(0).optional(),
        }),
      )
      .max(50, "Too many attributes")
      .optional(),
    variants: z
      .array(
        z.object({
          name: z.string().min(1).max(100),
          sku: z
            .string()
            .min(1)
            .max(50)
            .regex(/^[A-Z0-9\-_]+$/, "Invalid SKU format"),
          price: z.number().positive().optional(),
          quantity: z.number().int().min(0).optional(),
          attributes: z.record(z.string(), z.string()),
        }),
      )
      .max(100, "Too many variants")
      .optional(),
    seo: z
      .object({
        title: z
          .string()
          .max(60, "SEO title too long")
          .refine(
            (title) => title.length === 0 || title.length >= 10,
            "SEO title should be descriptive",
          )
          .optional(),
        description: z
          .string()
          .max(160, "SEO description too long")
          .refine(
            (desc) => desc.length === 0 || desc.length >= 50,
            "SEO description should be descriptive",
          )
          .optional(),
        keywords: z
          .array(
            z
              .string()
              .max(50, "Keyword too long")
              .regex(
                /^[a-zA-Z0-9\s\-_]+$/,
                "Keyword contains invalid characters",
              ),
          )
          .max(10, "Too many keywords")
          .optional(),
        canonicalUrl: z.string().url("Invalid canonical URL").optional(),
      })
      .optional(),
    shipping: z
      .object({
        weight: z.number().positive().max(50, "Weight too high").optional(),
        dimensions: z
          .object({
            length: z.number().positive().max(200).optional(),
            width: z.number().positive().max(200).optional(),
            height: z.number().positive().max(200).optional(),
            unit: z.enum(["cm", "inch"]).optional(),
          })
          .optional(),
        requiresShipping: z.boolean().default(true),
        freeShipping: z.boolean().optional(),
      })
      .optional(),
    inventory: z
      .object({
        trackInventory: z.boolean().default(true),
        allowBackorders: z.boolean().optional(),
        backorderMessage: z.string().max(200).optional(),
      })
      .optional(),
  })
  .refine((data) => !data.discountPrice || data.discountPrice < data.price, {
    message: "Discount price must be less than regular price",
    path: ["discountPrice"],
  })
  .refine((data) => !data.costPrice || data.costPrice < data.price, {
    message: "Cost price should be less than selling price for profitability",
    path: ["costPrice"],
  })
  .refine(
    (data) => !data.lowStockThreshold || data.quantity > data.lowStockThreshold,
    {
      message: "Current quantity should be above low stock threshold",
      path: ["quantity"],
    },
  )
  .refine(validateInventoryAvailability, {
    message: "Product inventory constraints violated",
  })
  .refine(
    (data) => {
      // Business rule: Product name uniqueness (would be validated against database)
      const forbiddenNames = ["test product", "demo item", "sample product"];
      return !forbiddenNames.includes(data.name.toLowerCase());
    },
    {
      message: "This product name is not allowed",
      path: ["name"],
    },
  );

// Enhanced Order Schema with Business Logic
export const enhancedCreateOrderSchema = z
  .object({
    items: z
      .array(
        z.object({
          productId: z
            .string()
            .min(1, "Product ID is required")
            .uuid("Invalid product ID format"),
          variantId: z.string().uuid("Invalid variant ID format").optional(),
          quantity: z
            .number()
            .int("Quantity must be a whole number")
            .positive("Quantity must be positive")
            .max(99, "Maximum 99 items per product"),
          unitPrice: z
            .number()
            .positive("Unit price must be positive")
            .optional(), // Will be validated against product price
        }),
      )
      .min(1, "At least one item is required")
      .max(50, "Maximum 50 different items per order"),
    shippingAddressId: z
      .string()
      .min(1, "Shipping address is required")
      .uuid("Invalid shipping address ID format"),
    billingAddressId: z
      .string()
      .min(1, "Billing address is required")
      .uuid("Invalid billing address ID format"),
    paymentMethod: z.enum([
      "credit_card",
      "debit_card",
      "paypal",
      "stripe",
      "bank_transfer",
      "cash_on_delivery",
      "digital_wallet",
      "installments",
      "buy_now_pay_later",
    ]),
    paymentDetails: z
      .object({
        cardNumber: z.string().optional(),
        expiryDate: z.string().optional(),
        cvv: z.string().optional(),
        cardholderName: z.string().optional(),
        savePaymentMethod: z.boolean().optional(),
        installments: z.number().int().min(1).max(12).optional(),
      })
      .optional(),
    shippingMethod: z
      .enum(["standard", "express", "overnight", "free"])
      .default("standard"),
    couponCode: z
      .string()
      .max(20, "Coupon code too long")
      .refine(validateCouponCode, "Invalid coupon code format")
      .optional(),
    notes: z
      .string()
      .max(500, "Order notes too long")
      .refine(validateHtmlContent, "Order notes contain unsafe content")
      .optional(),
    giftMessage: z.string().max(200, "Gift message too long").optional(),
    deliveryInstructions: z
      .string()
      .max(300, "Delivery instructions too long")
      .optional(),
    taxExempt: z.boolean().optional(),
    businessPurchase: z.boolean().optional(),
  })
  .refine(validateOrderTotal, {
    message: "Order total validation failed",
  })
  .refine(validateShippingEligibility, {
    message: "Shipping method not eligible for this order",
  })
  .refine(validatePaymentMethodCompatibility, {
    message: "Payment method not compatible with order",
  })
  .refine(validateDiscountRules, {
    message: "Coupon validation failed",
  })
  .refine(
    (data) => {
      // Business rule: Maximum order value
      const estimatedTotal = data.items.reduce(
        (sum, item) => sum + (item.unitPrice || 0) * item.quantity,
        0,
      );
      return estimatedTotal <= 50000; // $50,000 limit
    },
    {
      message: "Order total exceeds maximum allowed amount",
    },
  );

// Enhanced Checkout Schema
export const enhancedCheckoutSchema = z
  .object({
    shippingAddress: z
      .object({
        type: z.enum(["billing", "shipping", "home", "work"]),
        firstName: z
          .string()
          .min(2)
          .max(50)
          .regex(/^[a-zA-Z\s\u0600-\u06FF]+$/),
        lastName: z
          .string()
          .min(2)
          .max(50)
          .regex(/^[a-zA-Z\s\u0600-\u06FF]+$/),
        company: z.string().max(100).optional(),
        addressLine1: z.string().min(5).max(100),
        addressLine2: z.string().max(100).optional(),
        city: z.string().min(2).max(50),
        state: z.string().min(2).max(50),
        postalCode: z
          .string()
          .refine(validateIranianPostalCode, "Invalid postal code"),
        country: z.string().min(2).max(50),
        phone: z.string().refine(validatePhoneNumber),
        isDefault: z.boolean().optional(),
      })
      .refine(validateAddressCompleteness, {
        message: "Shipping address is incomplete",
      }),
    billingAddress: z
      .object({
        type: z.enum(["billing", "shipping", "home", "work"]),
        firstName: z
          .string()
          .min(2)
          .max(50)
          .regex(/^[a-zA-Z\s\u0600-\u06FF]+$/),
        lastName: z
          .string()
          .min(2)
          .max(50)
          .regex(/^[a-zA-Z\s\u0600-\u06FF]+$/),
        company: z.string().max(100).optional(),
        addressLine1: z.string().min(5).max(100),
        addressLine2: z.string().max(100).optional(),
        city: z.string().min(2).max(50),
        state: z.string().min(2).max(50),
        postalCode: z
          .string()
          .refine(validateIranianPostalCode, "Invalid postal code"),
        country: z.string().min(2).max(50),
        phone: z.string().refine(validatePhoneNumber),
        isDefault: z.boolean().optional(),
      })
      .refine(validateAddressCompleteness, {
        message: "Billing address is incomplete",
      }),
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
      .refine(validateCreditCard, "Invalid credit card")
      .optional(),
    expiryDate: z
      .string()
      .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid expiry date (MM/YY)")
      .refine((date) => {
        const [month, year] = date.split("/").map(Number);
        const now = new Date();
        const expiry = new Date(2000 + year, month - 1);
        return expiry > now;
      }, "Card has expired")
      .optional(),
    cvv: z
      .string()
      .regex(/^\d{3,4}$/, "Invalid CVV")
      .optional(),
    cardholderName: z
      .string()
      .min(2, "Cardholder name required")
      .regex(/^[a-zA-Z\s\u0600-\u06FF]+$/, "Invalid cardholder name")
      .optional(),
    savePaymentMethod: z.boolean().optional(),
    notes: z.string().max(500).optional(),
    acceptTerms: z
      .boolean()
      .refine(
        (val) => val === true,
        "You must accept the terms and conditions",
      ),
    subscribeNewsletter: z.boolean().optional(),
    createAccount: z.boolean().optional(),
    accountDetails: z
      .object({
        email: z.string().email().optional(),
        password: z.string().refine(validatePasswordStrength).optional(),
      })
      .optional(),
  })
  .refine(
    (data) => {
      // Payment method validation
      if (["credit_card", "debit_card"].includes(data.paymentMethod)) {
        return (
          data.cardNumber && data.expiryDate && data.cvv && data.cardholderName
        );
      }
      return true;
    },
    {
      message: "Card details are required for card payments",
      path: ["cardNumber"],
    },
  )
  .refine(
    (data) => {
      // Account creation validation
      if (data.createAccount) {
        return data.accountDetails?.email && data.accountDetails?.password;
      }
      return true;
    },
    {
      message: "Email and password required for account creation",
      path: ["accountDetails"],
    },
  );

// Enhanced Review Schema
export const enhancedReviewSchema = z
  .object({
    productId: z
      .string()
      .min(1, "Product ID is required")
      .uuid("Invalid product ID format"),
    orderId: z.string().uuid("Invalid order ID format").optional(),
    rating: z
      .number()
      .int("Rating must be a whole number")
      .min(1, "Rating must be at least 1")
      .max(5, "Rating cannot exceed 5"),
    title: z
      .string()
      .min(5, "Review title must be at least 5 characters")
      .max(100, "Review title too long")
      .refine(
        (title) => title.trim().length === title.length,
        "Title cannot have leading/trailing spaces",
      ),
    content: z
      .string()
      .min(20, "Review must be at least 20 characters")
      .max(1000, "Review too long")
      .refine(validateReviewContent, "Review content violates guidelines"),
    pros: z
      .array(
        z.string().max(100, "Pro point too long").min(3, "Pro point too short"),
      )
      .max(5, "Maximum 5 pro points")
      .optional(),
    cons: z
      .array(
        z.string().max(100, "Con point too long").min(3, "Con point too short"),
      )
      .max(5, "Maximum 5 con points")
      .optional(),
    images: z
      .array(
        z
          .string()
          .url("Invalid image URL")
          .refine(validateUrlSafety, "Image URL is not safe"),
      )
      .max(5, "Maximum 5 images allowed")
      .optional(),
    recommendToFriend: z.boolean().optional(),
    verifiedPurchase: z.boolean().default(false), // Would be set by system
    helpful: z.number().int().min(0).default(0), // Would be updated by other users
  })
  .refine(
    (data) => {
      // Business rule: Prevent spam reviews
      const spamIndicators = [
        "http://",
        "https://",
        "www.",
        "@gmail.com",
        "@yahoo.com",
      ];
      const hasSpam = spamIndicators.some(
        (indicator) =>
          data.content.toLowerCase().includes(indicator) ||
          data.title.toLowerCase().includes(indicator),
      );
      return !hasSpam;
    },
    {
      message: "Review appears to contain spam content",
      path: ["content"],
    },
  );

// Enhanced Coupon Schema
export const enhancedCouponSchema = z
  .object({
    code: z
      .string()
      .min(3, "Code must be at least 3 characters")
      .max(20, "Code too long")
      .regex(
        /^[A-Z0-9_-]+$/i,
        "Code can only contain letters, numbers, hyphens, and underscores",
      )
      .refine(
        (code) =>
          !code.includes("TEST") || process.env.NODE_ENV === "development",
        "Test codes not allowed in production",
      ),
    name: z.string().min(1, "Name is required").max(100, "Name too long"),
    description: z.string().max(500, "Description too long").optional(),
    type: z.enum([
      "percentage",
      "fixed_amount",
      "free_shipping",
      "buy_x_get_y",
    ]),
    value: z
      .number()
      .positive("Value must be positive")
      .max(100000, "Value too high"),
    conditions: z
      .object({
        minPurchase: z.number().positive().optional(),
        maxDiscount: z.number().positive().optional(),
        applicableCategories: z.array(z.string().uuid()).max(50).optional(),
        applicableProducts: z.array(z.string().uuid()).max(100).optional(),
        excludedCategories: z.array(z.string().uuid()).max(50).optional(),
        excludedProducts: z.array(z.string().uuid()).max(100).optional(),
        userGroups: z
          .array(z.enum(["new_customer", "loyal_customer", "vip", "wholesale"]))
          .optional(),
        firstTimeOnly: z.boolean().optional(),
      })
      .optional(),
    usage: z
      .object({
        totalLimit: z.number().int().positive().max(10000).optional(),
        userLimit: z.number().int().positive().max(10).optional(),
        totalUsed: z.number().int().min(0).default(0),
      })
      .optional(),
    validity: z.object({
      validFrom: z.date(),
      validTo: z.date(),
      validDays: z
        .array(
          z.enum([
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ]),
        )
        .optional(),
      validHours: z
        .object({
          start: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
          end: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        })
        .optional(),
    }),
    metadata: z
      .object({
        createdBy: z.string().uuid(),
        isActive: z.boolean().default(true),
        autoApply: z.boolean().optional(),
        stackable: z.boolean().optional(),
        priority: z.number().int().min(0).max(100).optional(),
      })
      .optional(),
  })
  .refine((data) => data.validity.validTo > data.validity.validFrom, {
    message: "Valid to date must be after valid from date",
    path: ["validity", "validTo"],
  })
  .refine(
    (data) => {
      if (data.type === "percentage") {
        return data.value <= 100;
      }
      if (data.type === "buy_x_get_y") {
        return data.value >= 1 && data.value <= 10;
      }
      return true;
    },
    {
      message: "Invalid value for coupon type",
      path: ["value"],
    },
  )
  .refine((data) => validateDateRangeLogic(data.validity), {
    message: "Invalid date range configuration",
    path: ["validity"],
  });

// Enhanced File Upload Schema
export const enhancedFileUploadSchema = z
  .object({
    file: z
      .instanceof(File)
      .refine(
        (file) => file.size <= 10 * 1024 * 1024,
        "File size must be less than 10MB",
      )
      .refine((file) => file.size >= 1024, "File size must be at least 1KB"),
  })
  .refine(
    (data) => {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/svg+xml",
        "application/pdf",
        "text/csv",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      return allowedTypes.includes(data.file.type);
    },
    {
      message: "File type not allowed",
    },
  )
  .refine((data) => validateFileUploadSecurity(data.file), {
    message: "File failed security validation",
  });

// Enhanced Search Schema
export const enhancedSearchSchema = z
  .object({
    query: z
      .string()
      .min(1, "Search query is required")
      .max(100, "Search query too long")
      .refine((query) => query.trim().length >= 2, "Search query too short")
      .refine(
        (query) => !/[<>"'%;()]/.test(query),
        "Search query contains invalid characters",
      ),
    category: z.string().uuid().optional(),
    filters: z
      .object({
        priceMin: z.number().positive().max(100000).optional(),
        priceMax: z.number().positive().max(100000).optional(),
        brand: z.array(z.string().uuid()).max(10).optional(),
        rating: z.number().min(1).max(5).optional(),
        inStock: z.boolean().optional(),
        onSale: z.boolean().optional(),
        attributes: z.record(z.string(), z.array(z.string())).optional(),
      })
      .optional(),
    sortBy: z
      .enum(["relevance", "price", "rating", "newest", "popularity", "name"])
      .optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    pagination: z
      .object({
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(100).default(20),
      })
      .optional(),
  })
  .refine(
    (data) => {
      // Business rule: Price range validation
      if (data.filters?.priceMin && data.filters?.priceMax) {
        return data.filters.priceMax >= data.filters.priceMin;
      }
      return true;
    },
    {
      message: "Maximum price must be greater than minimum price",
      path: ["filters", "priceMax"],
    },
  )
  .refine(validateNumericRanges, {
    message: "Invalid numeric range configuration",
  });

// Enhanced User Preferences Schema
export const enhancedUserPreferencesSchema = z
  .object({
    language: z
      .string()
      .min(2, "Language code too short")
      .max(5, "Language code too long")
      .regex(/^[a-z]{2}(-[A-Z]{2})?$/, "Invalid language code format"),
    currency: z
      .string()
      .length(3, "Currency code must be 3 characters")
      .regex(/^[A-Z]{3}$/, "Invalid currency code format"),
    timezone: z.string().refine((tz) => {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: tz });
        return true;
      } catch {
        return false;
      }
    }, "Invalid timezone"),
    notifications: z.object({
      email: z.object({
        orderUpdates: z.boolean(),
        promotions: z.boolean(),
        newsletter: z.boolean(),
        security: z.boolean(),
        marketing: z.boolean(),
      }),
      sms: z.object({
        orderUpdates: z.boolean(),
        security: z.boolean(),
        delivery: z.boolean(),
      }),
      push: z.object({
        orderUpdates: z.boolean(),
        promotions: z.boolean(),
        newFeatures: z.boolean(),
      }),
      frequency: z.enum(["immediate", "daily", "weekly", "never"]),
    }),
    privacy: z.object({
      profileVisibility: z.enum(["public", "friends", "private"]),
      showOnlineStatus: z.boolean(),
      allowMessages: z.boolean(),
      dataSharing: z.boolean(),
      analytics: z.boolean(),
    }),
    accessibility: z
      .object({
        fontSize: z.enum(["small", "medium", "large"]),
        highContrast: z.boolean(),
        reduceMotion: z.boolean(),
        screenReader: z.boolean(),
      })
      .optional(),
  })
  .refine(
    (data) => {
      // Business rule: Privacy settings validation
      if (
        data.privacy.profileVisibility === "private" &&
        data.privacy.allowMessages
      ) {
        return false; // Private profiles shouldn't allow messages
      }
      return true;
    },
    {
      message: "Private profiles cannot allow direct messages",
      path: ["privacy"],
    },
  );

// Enhanced Bulk Operations Schema
export const enhancedBulkOperationSchema = z
  .object({
    operation: z.enum(["update", "delete", "export", "import", "duplicate"]),
    resource: z.enum(["products", "orders", "users", "categories", "reviews"]),
    ids: z
      .array(z.string().uuid())
      .min(1, "At least one item required")
      .max(1000, "Maximum 1000 items per operation"),
    data: z.record(z.string(), z.any()).optional(), // For update operations
    options: z
      .object({
        skipValidation: z.boolean().optional(),
        ignoreErrors: z.boolean().optional(),
        batchSize: z.number().int().positive().max(100).optional(),
        dryRun: z.boolean().optional(),
      })
      .optional(),
  })
  .refine(validateBulkOperationLimits, {
    message: "Bulk operation exceeds limits",
  });

// Export enhanced schemas
export const enhancedSchemas = {
  login: enhancedLoginSchema,
  register: enhancedRegisterSchema,
  product: enhancedProductSchema,
  order: enhancedCreateOrderSchema,
  checkout: enhancedCheckoutSchema,
  review: enhancedReviewSchema,
  coupon: enhancedCouponSchema,
  fileUpload: enhancedFileUploadSchema,
  search: enhancedSearchSchema,
  userPreferences: enhancedUserPreferencesSchema,
  bulkOperation: enhancedBulkOperationSchema,
};
