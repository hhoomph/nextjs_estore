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

  // Use stable, primitive selectors so the hook only re-renders
  // when the actual data changes (not when the store object reference changes).
  const userCartItems = useCartStore((state) => state.items ?? []);
  const guestCartItems = useGuestCartStore((state) => state.items ?? []);

  // Read counts via getState() inside a memo so the value is always derived
  // from the latest store snapshot without subscribing to a function reference.
  // We import the stores at module top, so calling getState() is safe.

  // Simple state computation without complex dependencies
  const cartState = useMemo(() => {
    const isAuthenticated = !!session?.user;
    const userId = session?.user?.id || null;

    // Choose cart data based on authentication status
    const items = isAuthenticated ? userCartItems : guestCartItems;
    const itemCount = (items ?? []).reduce(
      (count: number, item: { quantity: number }) =>
        count + (item.quantity || 0),
      0,
    );

    return {
      isAuthenticated,
      userId,
      items: items ?? [],
      itemCount,
      isUsingUserCart: isAuthenticated,
      isUsingGuestCart: !isAuthenticated,
    };
  }, [session?.user?.id, userCartItems, guestCartItems]);

  // Simple merge function without circular dependencies
  const mergeGuestToUser = useCallback(async () => {
    if (!cartState.isAuthenticated || !cartState.userId) return;

    const guestItems = useGuestCartStore.getState().items ?? [];
    if (guestItems.length === 0) return;

    // Simple merge logic
    try {
      const userCart = useCartStore.getState();

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
      useGuestCartStore.getState().clearCart();

      console.log(`Merged ${guestItems.length} guest cart items to user cart`);
    } catch (error) {
      console.error("Failed to merge guest cart:", error);
    }
  }, [cartState.isAuthenticated, cartState.userId]);

  // Trigger merge when user logs in
  useEffect(() => {
    if (cartState.isAuthenticated) {
      const guestItems = useGuestCartStore.getState().items ?? [];
      if (guestItems.length > 0) {
        mergeGuestToUser();
      }
    }
  }, [cartState.isAuthenticated, mergeGuestToUser]);

  return {
    ...cartState,
    mergeGuestToUser,
    currentCart: cartState.isAuthenticated
      ? useCartStore.getState()
      : useGuestCartStore.getState(),
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
