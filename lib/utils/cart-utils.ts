/**
 * Cart Utilities
 *
 * Utility functions for cart management, synchronization, and operations.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import { toast } from "@/lib/hooks/use-toast";
import type { CartItem } from "@/lib/stores/cart-store";
import { randomUUID } from "./crypto-ssr";

/**
 * Synchronize items between guest cart and authenticated cart
 */
export function syncCartBetweenStores(
  guestItems: CartItem[],
  authItems: CartItem[],
  onSyncComplete: (syncedItems: CartItem[]) => void,
): CartItem[] {
  // Create a map of authenticated cart items for quick lookup
  const authItemMap = new Map<string, CartItem>();
  authItems.forEach((item) => {
    authItemMap.set(item.product_id, item);
  });

  // Merge guest cart items with authenticated cart
  const mergedItems: CartItem[] = [];

  // Add items from guest cart
  guestItems.forEach((guestItem) => {
    const existingAuthItem = authItemMap.get(guestItem.product_id);

    if (existingAuthItem) {
      // Item exists in both carts, merge quantities
      mergedItems.push({
        ...existingAuthItem,
        quantity: existingAuthItem.quantity + guestItem.quantity,
      });
      authItemMap.delete(guestItem.product_id); // Remove from map to avoid duplicate
    } else {
      // Item only in guest cart, add to merged
      mergedItems.push(guestItem);
    }
  });

  // Add remaining items from authenticated cart
  authItemMap.forEach((authItem) => {
    mergedItems.push(authItem);
  });

  // Call completion callback
  onSyncComplete(mergedItems);

  return mergedItems;
}

/**
 * Calculate total price with proper Persian currency handling
 */
export function calculateCartTotal(
  items: CartItem[],
  currency: "IRR" | "TOMAN" = "TOMAN",
): number {
  return items.reduce((total, item) => {
    const price = item.product.discount_price || item.product.price;
    const optionPrice = item.options?.price_increment || 0;

    // Convert from Rials to Tomans if needed
    const itemPrice =
      currency === "TOMAN" ? (price + optionPrice) / 10 : price + optionPrice;

    return total + itemPrice * item.quantity;
  }, 0);
}

/**
 * Format cart total for display with Persian support
 */
export function formatCartTotal(
  total: number,
  language: "fa" | "en" = "fa",
  currency: "IRR" | "TOMAN" = "TOMAN",
): string {
  if (language === "fa") {
    // Format with Persian numbers and Toman
    const formatted = Math.floor(total).toLocaleString("fa-IR");
    return currency === "TOMAN" ? `${formatted} تومان` : `${formatted} ریال`;
  } else {
    // Format with English numbers
    const formatted = Math.floor(total).toLocaleString("en-US");
    return currency === "TOMAN" ? `${formatted} Toman` : `${formatted} IRR`;
  }
}

/**
 * Validate cart item quantity
 */
export function validateCartItemQuantity(
  quantity: number,
  maxQuantity: number = 100,
): { valid: boolean; error?: string } {
  if (quantity <= 0) {
    return { valid: false, error: "Quantity must be greater than 0" };
  }

  if (quantity > maxQuantity) {
    return {
      valid: false,
      error: `Maximum quantity is ${maxQuantity}`,
    };
  }

  if (!Number.isInteger(quantity)) {
    return { valid: false, error: "Quantity must be a whole number" };
  }

  return { valid: true };
}

/**
 * Check if cart needs synchronization between guest and auth
 */
export function checkCartSyncNeeded(
  guestCartCount: number,
  authCartCount: number,
  isGuest: boolean,
): boolean {
  // Only sync if user was guest and now is authenticated
  // and guest cart has items
  return isGuest && guestCartCount > 0 && authCartCount === 0;
}

/**
 * Get cart synchronization status
 */
export function getCartSyncStatus(
  isSyncing: boolean,
  error: string | null,
  guestCount: number,
  authCount: number,
): {
  status: "idle" | "syncing" | "error" | "synced";
  message: string;
  needsAttention: boolean;
} {
  if (error) {
    return {
      status: "error",
      message: error,
      needsAttention: true,
    };
  }

  if (isSyncing) {
    return {
      status: "syncing",
      message: "Syncing cart...",
      needsAttention: false,
    };
  }

  if (guestCount > 0 && authCount > 0) {
    return {
      status: "synced",
      message: "Cart synchronized",
      needsAttention: false,
    };
  }

  return {
    status: "idle",
    message: "Cart ready",
    needsAttention: false,
  };
}

/**
 * Create cart item with proper validation
 */
export function createCartItem(
  productId: string,
  productData: {
    id: string;
    name: string;
    price: number;
    discount_price?: number;
    slug: string;
    product_pictures: Array<{ picture: { url: string } }>;
  },
  quantity: number = 1,
  options?: {
    name: string;
    value: string;
    price_increment?: number;
  },
): CartItem {
  return {
    id: randomUUID(),
    product_id: productId,
    product: {
      id: productData.id,
      name: productData.name,
      price: productData.price,
      discount_price: productData.discount_price,
      slug: productData.slug,
      product_pictures: productData.product_pictures,
    },
    quantity: Math.max(1, Math.min(quantity, 100)), // Ensure valid quantity
    options,
    addedAt: new Date(),
    updatedAt: new Date(),
    isPersisted: false,
  };
}

/**
 * Compare cart items for equality (ignoring ID)
 */
export function areCartItemsEqual(item1: CartItem, item2: CartItem): boolean {
  return (
    item1.product_id === item2.product_id &&
    item1.product_options_id === item2.product_options_id &&
    item1.quantity === item2.quantity &&
    JSON.stringify(item1.options) === JSON.stringify(item2.options)
  );
}

/**
 * Find cart item by product ID
 */
export function findCartItemByProductId(
  items: CartItem[],
  productId: string,
  optionsId?: string,
): CartItem | undefined {
  return items.find(
    (item) =>
      item.product_id === productId &&
      (optionsId ? item.product_options_id === optionsId : true),
  );
}

/**
 * Update cart item quantity with validation
 */
export function updateCartItemQuantity(
  items: CartItem[],
  itemId: string,
  newQuantity: number,
): CartItem[] {
  const validation = validateCartItemQuantity(newQuantity);
  if (!validation.valid) {
    toast({
      title: "Invalid Quantity",
      description: validation.error || "Please enter a valid quantity",
      variant: "destructive",
    });
    return items;
  }

  return items.map((item) =>
    item.id === itemId ? { ...item, quantity: newQuantity } : item,
  );
}

/**
 * Remove cart item by ID
 */
export function removeCartItem(items: CartItem[], itemId: string): CartItem[] {
  return items.filter((item) => item.id !== itemId);
}

/**
 * Clear cart completely
 */
export function clearCart(): CartItem[] {
  return [];
}

/**
 * Calculate item subtotal
 */
export function calculateItemSubtotal(
  item: CartItem,
  currency: "IRR" | "TOMAN" = "TOMAN",
): number {
  const price = item.product.discount_price || item.product.price;
  const optionPrice = item.options?.price_increment || 0;
  const itemPrice =
    currency === "TOMAN" ? (price + optionPrice) / 10 : price + optionPrice;
  return itemPrice * item.quantity;
}

/**
 * Get cart statistics
 */
export function getCartStatistics(items: CartItem[]): {
  itemCount: number;
  uniqueItemCount: number;
  totalQuantity: number;
  totalPrice: number;
  hasDiscounts: boolean;
} {
  const itemCount = items.length;
  const uniqueItemCount = new Set(items.map((item) => item.product_id)).size;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = calculateCartTotal(items);
  const hasDiscounts = items.some(
    (item) => item.product.discount_price !== undefined,
  );

  return {
    itemCount,
    uniqueItemCount,
    totalQuantity,
    totalPrice,
    hasDiscounts,
  };
}
