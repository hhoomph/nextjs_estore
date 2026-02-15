/**
 * Module for api-responses
 *
 * Centralized API response type definitions for consistent typing across the application
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

// Base response structure
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
  timestamp?: string;
}

// Pagination metadata
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Paginated response
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

// Error response
export interface ErrorResponse extends ApiResponse<never> {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Success response
export interface SuccessResponse<T = unknown> extends ApiResponse<T> {
  success: true;
  data: T;
}

// Authentication responses
export interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface RegisterResponse {
  user: User;
  token: string;
  message: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// Product responses
export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  status: number;
  category: Category;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  displayOrder: number;
}

export interface ProductsListResponse
  extends PaginatedResponse<ProductResponse> {
  filters?: {
    categories: Category[];
    priceRange: { min: number; max: number };
    inStock: boolean;
  };
}

// Category responses
export interface CategoryResponse {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  level: number;
  image?: string;
  children?: CategoryResponse[];
  _count?: {
    products: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Order responses
export interface OrderResponse {
  id: string;
  userId: string;
  status: OrderStatus;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  currency: string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod?: PaymentMethod;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: ProductResponse;
  quantity: number;
  price: number;
  discount: number;
  total: number;
}

// User responses
export interface UserResponse {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLogin?: string;
  addresses: Address[];
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

// Address responses
export interface AddressResponse {
  id: string;
  userId: string;
  type: "billing" | "shipping";
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Cart responses
export interface CartResponse {
  id: string;
  userId?: string;
  sessionId?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: ProductResponse;
  quantity: number;
  price: number;
  discount: number;
  total: number;
  addedAt: string;
}

// Review responses
export interface ReviewResponse {
  id: string;
  userId: string;
  user: {
    id: string;
    name?: string;
    avatar?: string;
  };
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
  };
  rating: number;
  title: string;
  content: string;
  verified: boolean;
  helpful: number;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

// Search responses
export interface SearchResponse extends PaginatedResponse<ProductResponse> {
  query: string;
  suggestions: SearchSuggestion[];
  filters: SearchFilters;
  sortOptions: SortOption[];
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: "product" | "category" | "brand";
  count?: number;
}

export interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  brand?: string;
  sortBy?: string;
}

export interface SortOption {
  value: string;
  label: string;
}

// Analytics responses
export interface AnalyticsResponse {
  period: string;
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  conversionRate: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    sales: number;
    revenue: number;
  }>;
  salesByDay: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  categoryPerformance: Array<{
    categoryId: string;
    categoryName: string;
    sales: number;
    revenue: number;
  }>;
}

// Dashboard responses
export interface DashboardResponse {
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalUsers: number;
    totalRevenue: number;
    lowStockProducts: number;
    pendingOrders: number;
  };
  recentOrders: OrderResponse[];
  topProducts: ProductResponse[];
  salesChart: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  alerts: Array<{
    id: string;
    type: "warning" | "error" | "info";
    message: string;
    actionUrl?: string;
  }>;
}

// Upload responses
export interface UploadResponse {
  url: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  size: number;
}

// Validation responses
export interface ValidationResponse {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

// Generic data types referenced in responses
export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  emailVerified: boolean;
}

export interface Category {
  id: string;
  name: string;
  parentId?: string;
  level: number;
}

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface PaymentMethod {
  id: string;
  type: "credit_card" | "debit_card" | "paypal" | "bank_transfer";
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  brand?: string;
}

export interface UserPreferences {
  language: string;
  currency: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  privacy: {
    profileVisible: boolean;
    activityVisible: boolean;
  };
}

// Enums
export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";
export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

// HTTP Status codes for API responses
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Common API error codes
export const API_ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
} as const;
