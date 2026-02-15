/**
 * Generic API response wrapper for consistent API responses
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  meta?: {
    pagination?: PaginationMeta;
    timestamp?: string;
  };
}

/**
 * Pagination metadata for list responses
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Error response structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Success response for operations that don't return data
 */
export interface SuccessResponse {
  success: true;
  message: string;
  timestamp: string;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    role?: string;
  };
  token?: string;
  expiresAt?: string;
}

/**
 * Product list response with pagination
 */
export interface ProductsResponse {
  products: Product[];
  meta: PaginationMeta;
}

/**
 * Cart response
 */
export interface CartResponse {
  items: CartItem[];
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
}

// Type-only imports for circular dependencies
import type { CartItem, Product } from "../database";
