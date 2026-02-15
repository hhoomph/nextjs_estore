/**
 * Core application types and interfaces
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

// ========== AUTH TYPES ==========

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: UserRole;
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";

export interface AuthSession {
  user: AuthUser;
  expires: string;
}

// ========== API RESPONSE TYPES ==========

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
  statusCode: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ========== PRODUCT TYPES ==========

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  discount_price?: number;
  quantity: number;
  sku?: string;
  status: ProductStatus;
  category_id: string;
  category: Category;
  product_pictures: ProductPicture[];
  reviews: Review[];
  createdAt: Date;
  updatedAt: Date;
}

export type ProductStatus = "ACTIVE" | "INACTIVE" | "DRAFT" | "ARCHIVED";

export interface ProductPicture {
  id: string;
  picture: {
    url: string;
    alt?: string;
  };
  is_primary: boolean;
  order: number;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: ProductStatus;
  search?: string;
  sortBy?: "name" | "price" | "createdAt" | "rating";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// ========== CATEGORY TYPES ==========

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  parent_id?: string;
  children?: Category[];
  products?: Product[];
  createdAt: Date;
  updatedAt: Date;
}

// ========== CART TYPES ==========

export interface CartItem {
  id: string;
  product_id: string;
  product: Product;
  quantity: number;
  price: number; // Price at time of adding to cart
  createdAt: Date;
  updatedAt: Date;
}

export interface Cart {
  id: string;
  user_id?: string;
  session_id?: string;
  items: CartItem[];
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

// ========== ORDER TYPES ==========

export interface Order {
  id: string;
  user_id: string;
  user?: AuthUser;
  status: OrderStatus;
  total: number;
  shipping_address: Address;
  billing_address?: Address;
  items: OrderItem[];
  payment_method?: PaymentMethod;
  tracking_number?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product: Product;
  quantity: number;
  price: number; // Price at time of order
  createdAt: Date;
}

// ========== ADDRESS TYPES ==========

export interface Address {
  id: string;
  user_id: string;
  type: AddressType;
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type AddressType = "SHIPPING" | "BILLING";

// ========== PAYMENT TYPES ==========

export interface PaymentMethod {
  id: string;
  type: PaymentType;
  provider: PaymentProvider;
  last4?: string;
  expiry_month?: number;
  expiry_year?: number;
  is_default: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentType =
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "PAYPAL"
  | "BANK_TRANSFER";
export type PaymentProvider = "STRIPE" | "PAYPAL" | "BANK";

// ========== REVIEW TYPES ==========

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user: AuthUser;
  rating: number; // 1-5
  title?: string;
  comment?: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  createdAt: Date;
  updatedAt: Date;
}

// ========== WISHLIST TYPES ==========

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  product: Product;
  addedAt: Date;
}

// ========== DASHBOARD TYPES ==========

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  recentOrders: number;
  lowStockProducts: number;
}

// ========== SEARCH TYPES ==========

export interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "relevance" | "price_asc" | "price_desc" | "newest" | "rating";
  page?: number;
  limit?: number;
}

export interface SearchResult {
  products: Product[];
  total: number;
  facets: {
    categories: Array<{ id: string; name: string; count: number }>;
    priceRanges: Array<{ min: number; max: number; count: number }>;
  };
}

// ========== FORM TYPES ==========

export interface FormState<T = unknown> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
}

// ========== UI STATE TYPES ==========

export type LoadingState = "idle" | "loading" | "success" | "error";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// ========== DISCRIMINATED UNIONS ==========

export type ApiState<T> =
  | { status: "idle"; data: null; error: null }
  | { status: "loading"; data: null; error: null }
  | { status: "success"; data: T; error: null }
  | { status: "error"; data: null; error: string };

export type AuthState =
  | { status: "unauthenticated" }
  | { status: "loading" }
  | { status: "authenticated"; user: AuthUser };

export type CartAction =
  | { type: "ADD_ITEM"; payload: { product: Product; quantity: number } }
  | { type: "REMOVE_ITEM"; payload: { itemId: string } }
  | { type: "UPDATE_QUANTITY"; payload: { itemId: string; quantity: number } }
  | { type: "CLEAR_CART" };

// ========== UTILITY TYPES ==========

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export type ValueOf<T> = T[keyof T];

// ========== VALIDATION TYPES ==========

export interface ValidationRule<T = unknown> {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: T) => boolean | string;
}

export type ValidationErrors<T> = {
  [K in keyof T]?: string;
};

// ========== THEME TYPES ==========

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
  };
  fonts: {
    sans: string;
    serif: string;
    mono: string;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
}

// ========== NOTIFICATION TYPES ==========

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}
