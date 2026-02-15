/**
 * Module for common
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
// Common domain types used across multiple entities

// Wishlist types
export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  variantId?: string;
  addedAt: Date;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    discountPrice?: number;
    images: Array<{
      id: string;
      url: string;
      alt: string;
    }>;
    inStock: boolean;
  };
  variant?: {
    id: string;
    name: string;
    sku: string;
    price: number;
  };
}

// Review types
export interface Review {
  id: string;
  productId: string;
  userId: string;
  orderId?: string;
  rating: number; // 1-5 stars
  title?: string;
  content: string;
  images?: string[];
  verified: boolean; // Purchased the product
  helpful: number; // Number of helpful votes
  reported: number; // Number of reports
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  responses?: ReviewResponse[];
}

export type ReviewStatus = "pending" | "approved" | "rejected" | "hidden";

export interface ReviewResponse {
  id: string;
  reviewId: string;
  userId: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    role: string;
  };
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  expiresAt?: Date;
}

export type NotificationType =
  | "order_status"
  | "payment_success"
  | "payment_failed"
  | "product_back_in_stock"
  | "price_drop"
  | "review_response"
  | "promotion"
  | "account_security"
  | "system";

// Category types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: Category[];
  productCount: number;
  seo: CategorySEO;
  status: CategoryStatus;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CategoryStatus = "active" | "inactive" | "hidden";

export interface CategorySEO {
  title?: string;
  description?: string;
  keywords?: string[];
}

// Coupon/Discount types
export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: CouponType;
  value: number; // Percentage or fixed amount
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  userLimit?: number; // Per user limit
  validFrom: Date;
  validTo: Date;
  applicableCategories?: string[];
  applicableProducts?: string[];
  excludedCategories?: string[];
  excludedProducts?: string[];
  status: CouponStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type CouponType = "percentage" | "fixed_amount" | "free_shipping";

export type CouponStatus = "active" | "inactive" | "expired";

// Shipping types
export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  methods: ShippingMethod[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  type: ShippingType;
  cost: number;
  freeThreshold?: number; // Free shipping above this amount
  estimatedDays: {
    min: number;
    max: number;
  };
  status: "active" | "inactive";
}

export type ShippingType =
  | "flat_rate"
  | "percentage"
  | "weight_based"
  | "distance_based";

// Payment types
export interface PaymentProvider {
  id: string;
  name: string;
  type: PaymentProviderType;
  config: Record<string, unknown>;
  testMode: boolean;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentProviderType =
  | "stripe"
  | "paypal"
  | "payu"
  | "razorpay"
  | "custom";

// Analytics types
export interface AnalyticsEvent {
  id: string;
  userId?: string;
  sessionId: string;
  eventType: string;
  eventData: Record<string, unknown>;
  page: string;
  referrer?: string;
  userAgent: string;
  ipAddress?: string;
  timestamp: Date;
  device: {
    type: "desktop" | "mobile" | "tablet";
    os: string;
    browser: string;
  };
}

// File/Upload types
export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  folder: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// Settings types
export interface SiteSettings {
  general: {
    siteName: string;
    siteDescription: string;
    siteUrl: string;
    logo: string;
    favicon: string;
    currency: string;
    language: string;
    timezone: string;
  };
  eCommerce: {
    enableGuestCheckout: boolean;
    minimumOrderAmount: number;
    taxRate: number;
    enableCoupons: boolean;
    enableReviews: boolean;
    enableWishlist: boolean;
    lowStockThreshold: number;
  };
  shipping: {
    defaultShippingMethod: string;
    freeShippingThreshold?: number;
    allowInternationalShipping: boolean;
  };
  payment: {
    enabledProviders: string[];
    testMode: boolean;
    requireBillingAddress: boolean;
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    googleAnalyticsId?: string;
    facebookPixelId?: string;
  };
  email: {
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    fromEmail: string;
    fromName: string;
  };
}

// Audit/Log types
export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// Form validation types (generic)
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface FormState<T = unknown> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isValid: boolean;
  touched: Record<string, boolean>;
}

// API Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  field?: string;
}

// Generic response wrapper
export interface ApiResult<T = unknown, E = ApiError> {
  success: boolean;
  data?: T;
  error?: E;
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}
