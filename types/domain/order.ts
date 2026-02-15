/**
 * Module for order
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
// Domain types for Order entity
export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user: Pick<User, "id" | "email" | "firstName" | "lastName">;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  events: OrderEvent[];
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "returned";

export type PaymentMethod =
  | "credit_card"
  | "debit_card"
  | "paypal"
  | "stripe"
  | "bank_transfer"
  | "cash_on_delivery"
  | "digital_wallet";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "refunded"
  | "partially_refunded";

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
  product: Pick<Product, "id" | "name" | "slug" | "images">;
  variant?: Pick<ProductVariant, "id" | "name" | "sku">;
}

export interface OrderAddress {
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface OrderEvent {
  id: string;
  type: OrderEventType;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  createdBy?: string;
}

export type OrderEventType =
  | "created"
  | "confirmed"
  | "payment_received"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "returned"
  | "note_added"
  | "status_changed";

// API types for Order operations
export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
  }>;
  shippingAddressId: string;
  billingAddressId: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  couponCode?: string;
}

export interface UpdateOrderRequest {
  id: string;
  status?: OrderStatus;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  notes?: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  dateFrom?: Date;
  dateTo?: Date;
  userId?: string;
  search?: string;
  sortBy?: "created_at" | "total" | "status";
  sortOrder?: "asc" | "desc";
}

export interface OrderListResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: OrderFilters;
  summary: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: Record<OrderStatus, number>;
  };
}

// Checkout types
export interface CheckoutData {
  items: CartItem[];
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  notes?: string;
}

export interface CheckoutSummary {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  estimatedDelivery?: Date;
  availableShippingMethods: ShippingMethod[];
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: number;
  isDefault: boolean;
}

// Payment types
export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  metadata: Record<string, unknown>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  errorMessage?: string;
  redirectUrl?: string;
}

// Refund types
export interface RefundRequest {
  orderId: string;
  amount: number;
  reason: RefundReason;
  notes?: string;
}

export type RefundReason =
  | "customer_request"
  | "defective_product"
  | "wrong_item"
  | "late_delivery"
  | "duplicate_order"
  | "other";

// Form validation types
export interface CheckoutFormData {
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  paymentMethod: PaymentMethod;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  savePaymentMethod?: boolean;
  notes?: string;
  acceptTerms: boolean;
}

import type { CartItem, Product, ProductVariant } from "./product";
// Import types that are referenced
import type { User } from "./user";
