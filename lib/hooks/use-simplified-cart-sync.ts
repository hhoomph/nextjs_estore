/**
 * Simplified Cart Sync Hook
 *
 * Eliminates render loops and complex synchronization by using
 * direct store access with minimal dependencies.
 *
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useSession } from "@/lib/auth-client";
import { useCartStore } from "@/lib/stores/cart-store";
import { useGuestCartStore } from "@/lib/stores/guest-cart-store";

/**
 * Simplified cart synchronization that eliminates render loops
 */
export function useSimplifiedCartSync() {
  const { data: session } = useSession();

  // Use selectors to get specific state values instead of entire store objects
  const userCartItems = useCartStore((state) => state.items);
  const userCartItemCount = useCartStore((state) => state.getItemCount());
  const guestCartItems = useGuestCartStore((state) => state.items);
  const guestCartItemCount = useGuestCartStore((state) => state.getItemCount());

  // Full store references (needed for performing actions)
  const userCart = useCartStore();
  const guestCart = useGuestCartStore();

  // Simple state computation without complex dependencies
  const cartState = useMemo(() => {
    const isAuthenticated = !!session?.user;
    const userId = session?.user?.id || null;

    // Choose cart data based on authentication status
    const items = isAuthenticated ? userCartItems : guestCartItems;
    const itemCount = isAuthenticated ? userCartItemCount : guestCartItemCount;

    return {
      isAuthenticated,
      userId,
      items,
      itemCount,
      isUsingUserCart: isAuthenticated,
      isUsingGuestCart: !isAuthenticated,
    };
  }, [
    session?.user?.id,
    userCartItems,
    userCartItemCount,
    guestCartItems,
    guestCartItemCount,
  ]);

  // Simple merge function without circular dependencies
  const mergeGuestToUser = useCallback(async () => {
    const userCart = useCartStore();
    const guestCart = useGuestCartStore();

    if (!cartState.isAuthenticated || !cartState.userId) return;

    const guestItems = guestCart.items;
    if (guestItems.length === 0) return;

    // Simple merge logic
    try {
      for (const item of guestItems) {
        // Convert guest cart item to user cart format
        userCart.addItem({
          product_id: item.product_id,
          product_options_id: item.product_options_id,
          product: item.product,
          options: item.options,
          quantity: item.quantity,
        });
      }

      // Clear guest cart after successful merge
      guestCart.clearCart();

      console.log(`Merged ${guestItems.length} guest cart items to user cart`);
    } catch (error) {
      console.error("Failed to merge guest cart:", error);
    }
  }, [cartState.isAuthenticated, cartState.userId]);

  // Trigger merge when user logs in
  useEffect(() => {
    const guestCart = useGuestCartStore.getState();
    if (cartState.isAuthenticated && guestCart.items.length > 0) {
      mergeGuestToUser();
    }
  }, [cartState.isAuthenticated, mergeGuestToUser]);

  return {
    ...cartState,
    mergeGuestToUser,
    currentCart: cartState.isAuthenticated ? userCart : guestCart,
  };
}

/**
 * Hook for cart actions with simplified error handling.
 *
 * Uses store getState() directly inside callbacks to avoid
 * stale closure issues and unnecessary re-renders caused by
 * changing store object references.
 */
export function useCartActions() {
  const { isAuthenticated } = useSimplifiedCartSync();

  const addToCart = useCallback(
    async (item: any) => {
      try {
        const cart = isAuthenticated ? useCartStore.getState() : useGuestCartStore.getState();
        cart.addItem(item);
      } catch (error) {
        console.error("Failed to add item to cart:", error);
      }
    },
    [isAuthenticated],
  );

  const removeFromCart = useCallback(
    async (itemId: string) => {
      try {
        const cart = isAuthenticated ? useCartStore.getState() : useGuestCartStore.getState();
        cart.removeItem(itemId);
      } catch (error) {
        console.error("Failed to remove item from cart:", error);
      }
    },
    [isAuthenticated],
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      try {
        const cart = isAuthenticated ? useCartStore.getState() : useGuestCartStore.getState();
        cart.updateQuantity(itemId, quantity);
      } catch (error) {
        console.error("Failed to update item quantity:", error);
      }
    },
    [isAuthenticated],
  );

  const clearCart = useCallback(async () => {
    try {
      const cart = isAuthenticated ? useCartStore.getState() : useGuestCartStore.getState();
      cart.clearCart();
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  }, [isAuthenticated]);

  return {
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isUsingUserCart: isAuthenticated,
  };
}

/**
 * Hook for cart validation with minimal complexity
 */
export function useCartValidation() {
  const { items } = useSimplifiedCartSync();

  const validateCart = useCallback(() => {
    const errors: string[] = [];

    for (const item of items) {
      if (!item.product?.id || !item.product?.name || item.quantity <= 0) {
        errors.push(`Invalid item: ${item.product?.name || "Unknown"}`);
      }
      const price = item.product?.discount_price || item.product?.price || 0;
      if (price <= 0) {
        errors.push(`Invalid price for item: ${item.product?.name}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [items]);

  return { validateCart };
}

/**
 * Hook for cart totals with memoized calculations
 */
export function useCartTotals() {
  const { items } = useSimplifiedCartSync();

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      const price = item.product?.discount_price || item.product?.price || 0;
      const optionPrice = item.options?.price_increment || 0;
      return sum + (price + optionPrice) * item.quantity;
    }, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      subtotal,
      itemCount,
      totalItems: items.length,
    };
  }, [items]);

  return totals;
}
