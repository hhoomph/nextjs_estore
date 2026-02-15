/**
 * Enhanced Cart Type Definitions
 *
 * This file contains comprehensive type definitions for the cart and checkout system,
 * including guest user support, server-side persistence, and synchronization features.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

// Base cart item interface
export interface CartItem {
  id: string;
  product_id: string;
  product_options_id?: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    discount_price?: number;
    slug: string;
    product_pictures: Array<{
      picture: {
        url: string;
      };
    }>;
  };
  options?: {
    name: string;
    value: string;
    price_increment?: number;
  };
}

// Enhanced cart item with additional metadata
export interface EnhancedCartItem extends CartItem {
  addedAt: Date;
  updatedAt: Date;
  sessionId?: string; // For guest cart items
  userId?: string; // For authenticated user cart items
  isPersisted: boolean; // Whether item is saved to server
}

// Cart state management types
export interface CartState {
  items: EnhancedCartItem[];
  guestId?: string;
  isGuest: boolean;
  lastSync: Date;
  pendingUpdates: CartUpdate[];
  isLoading: boolean;
  error?: string;
}

export interface CartUpdate {
  type: "add" | "remove" | "update";
  item: EnhancedCartItem;
  timestamp: Date;
  synced: boolean;
}

// Checkout session management
export interface CheckoutSession {
  id: string;
  guestId?: string;
  userId?: string;
  items: EnhancedCartItem[];
  shippingAddress?: Address;
  billingAddress?: Address;
  paymentMethod?: PaymentMethod;
  step: CheckoutStep;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type CheckoutStep =
  | "cart"
  | "shipping"
  | "payment"
  | "review"
  | "confirmation";

// Address types (consistent with existing address types)
export interface Address {
  id: string;
  user_id: string;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  telephone: string | null;
  mobile: string | null;
  location: string | null;
  is_default: boolean;
  created_at: Date;
  modified_at: Date;
}

// Payment method types
export interface PaymentMethod {
  id: string;
  type: "credit_card" | "debit_card" | "paypal" | "bank_transfer";
  provider: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  created_at: Date;
}

// Shipping method types
export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  cost: number;
  estimatedDays: number;
  isFree: boolean;
}

// Cart synchronization types
export interface CartSyncPayload {
  items: EnhancedCartItem[];
  updates: CartUpdate[];
  guestId?: string;
  userId?: string;
  lastSync: Date;
}

export interface CartSyncResponse {
  success: boolean;
  syncedItems: EnhancedCartItem[];
  conflicts: CartConflict[];
  error?: string;
}

export interface CartConflict {
  itemId: string;
  serverVersion: EnhancedCartItem;
  clientVersion: EnhancedCartItem;
  resolution: "server" | "client" | "merge";
}

// Theme and UI configuration types
export interface ThemeConfig {
  animations: AnimationConfig;
  colors: ColorScheme;
  typography: TypographyScale;
  spacing: SpacingScale;
}

export interface AnimationConfig {
  duration: Record<string, string>;
  easing: Record<string, string>;
  keyframes: Record<string, string>;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
  destructive: string;
}

export interface TypographyScale {
  fontFamily: string;
  fontSize: Record<string, string>;
  fontWeight: Record<string, string>;
  lineHeight: Record<string, string>;
}

export interface SpacingScale {
  space: Record<string, string>;
  margin: Record<string, string>;
  padding: Record<string, string>;
}

// API response types
export interface CartAPIResponse {
  items: EnhancedCartItem[];
  total: number;
  itemCount: number;
  lastSync: Date;
}

export interface CheckoutAPIResponse {
  sessionId: string;
  checkoutUrl: string;
  expiresAt: Date;
}

// Error types
export interface CartError {
  code: string;
  message: string;
  itemId?: string;
  field?: string;
}

// Validation types
export interface CartValidationResult {
  isValid: boolean;
  errors: CartError[];
  warnings: string[];
}

// Hook return types
export interface UseCartSyncReturn {
  syncCart: () => Promise<void>;
  isSyncing: boolean;
  lastSync: Date | null;
  error: string | null;
}

export interface UseCheckoutSessionReturn {
  session: CheckoutSession | null;
  createSession: (items: EnhancedCartItem[]) => Promise<CheckoutSession>;
  updateSession: (updates: Partial<CheckoutSession>) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// Component prop types
export interface CartSidebarProps {
  theme?: Partial<ThemeConfig>;
  animations?: boolean;
}

export interface CheckoutProgressProps {
  currentStep: CheckoutStep;
  steps: CheckoutStep[];
  onStepChange?: (step: CheckoutStep) => void;
}

export interface GuestCheckoutFormProps {
  onSubmit: (data: GuestCheckoutData) => Promise<void>;
  isLoading: boolean;
  errors: Record<string, string>;
}

export interface GuestCheckoutData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  shippingAddress: Omit<
    Address,
    "id" | "user_id" | "is_default" | "created_at" | "modified_at"
  >;
  billingAddress?: Omit<
    Address,
    "id" | "user_id" | "is_default" | "created_at" | "modified_at"
  >;
  createAccount: boolean;
}

// Utility types
export type CartItemMap = Map<string, EnhancedCartItem>;
export type CartUpdateQueue = CartUpdate[];

// Constants
export const CHECKOUT_STEPS: CheckoutStep[] = [
  "cart",
  "shipping",
  "payment",
  "review",
  "confirmation",
];

export const CART_STORAGE_KEYS = {
  GUEST_ID: "guest_cart_id",
  ITEMS: "guest_cart_items",
  LAST_SYNC: "cart_last_sync",
  SESSION_ID: "cart_session_id",
} as const;

export const CART_ERROR_CODES = {
  OUT_OF_STOCK: "OUT_OF_STOCK",
  INVALID_QUANTITY: "INVALID_QUANTITY",
  PRODUCT_NOT_FOUND: "PRODUCT_NOT_FOUND",
  SYNC_FAILED: "SYNC_FAILED",
  SESSION_EXPIRED: "SESSION_EXPIRED",
} as const;

// Type guards
export const isGuestCart = (
  state: CartState,
): state is CartState & { isGuest: true } => state.isGuest;
export const isAuthenticatedCart = (
  state: CartState,
): state is CartState & { isGuest: false } => !state.isGuest;

export const isCheckoutStep = (step: string): step is CheckoutStep =>
  CHECKOUT_STEPS.includes(step as CheckoutStep);

// Helper functions
export const createCartItemId = (
  productId: string,
  optionsId?: string,
): string => (optionsId ? `${productId}-${optionsId}` : productId);

export const parseCartItemId = (
  id: string,
): { productId: string; optionsId?: string } => {
  const parts = id.split("-");
  return {
    productId: parts[0],
    optionsId: parts.length > 1 ? parts.slice(1).join("-") : undefined,
  };
};
