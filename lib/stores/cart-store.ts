/**
 * Cart Store - Zustand State Management for Shopping Cart
 *
 * This store manages the application's shopping cart state including:
 * - Cart items with product details and quantities
 * - Cart operations (add, remove, update)
 * - Address management for shipping/billing
 * - Persistent storage with localStorage
 * - Toast notifications for user feedback
 *
 * @author hh.oomph@gmail.com
 * @version 2.0.0
 * @since 2025-01-01
 */

import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import { toast } from "@/lib/hooks/use-toast";
import type { Address } from "@/types/address";
import type { EnhancedCartItem } from "@/types/cart";

// Re-export EnhancedCartItem as CartItem for backward compatibility
export type CartItem = EnhancedCartItem;

interface CartStore {
  items: EnhancedCartItem[];
  isOpen: boolean;
  selectedShippingAddress?: Address;
  selectedBillingAddress?: Address;
  billingSameAsShipping: boolean;
  guestCart: EnhancedCartItem[]; // Store guest cart separately
  cartMergeInProgress: boolean;
  addItem: (
    item: Omit<
      EnhancedCartItem,
      "id" | "addedAt" | "updatedAt" | "sessionId" | "isPersisted" | "quantity"
    > & { quantity?: number },
  ) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  setShippingAddress: (address: Address | undefined) => void;
  setBillingAddress: (address: Address | undefined) => void;
  setBillingSameAsShipping: (same: boolean) => void;
  getTotal: () => number;
  getItemCount: () => number;
  mergeGuestCartWithUser: (userId: string) => Promise<void>;
  syncWithDatabase: (userId: string) => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        items: [],
        isOpen: false, // Ensure cart starts closed
        billingSameAsShipping: true,
        guestCart: [], // Initialize guest cart
        cartMergeInProgress: false, // Initialize merge progress flag

        addItem: (newItem) => {
          const safeItems = get().items ?? [];
          const existingItemIndex = safeItems.findIndex(
            (item) =>
              item.product_id === newItem.product_id &&
              item.product_options_id === newItem.product_options_id,
          );

          if (existingItemIndex >= 0) {
            // Update quantity of existing item
            const updatedItems = [...safeItems];
            updatedItems[existingItemIndex].quantity += newItem.quantity || 1;
            updatedItems[existingItemIndex].updatedAt = new Date();
            set({ items: updatedItems }); // Removed auto-opening of cart sidebar
            toast({
              title: "Cart Updated",
              description: `Quantity updated for ${newItem.product.name}`,
              variant: "success",
            });
          } else {
            // Add new item with all EnhancedCartItem properties
            const cartItem: EnhancedCartItem = {
              ...newItem,
              id: `${newItem.product_id}-${newItem.product_options_id || "default"}-${Date.now()}`,
              quantity: newItem.quantity || 1,
              addedAt: new Date(),
              updatedAt: new Date(),
              isPersisted: false,
            };
            set({
              items: [...safeItems, cartItem],
              // Removed isOpen: true to prevent auto-opening of cart sidebar
            });
            toast({
              title: "Added to Cart",
              description: `${newItem.product.name} has been added to your cart`,
              variant: "success",
            });
          }
        },

        removeItem: (id) => {
          set((state) => ({
            items: (state.items ?? []).filter((item) => item.id !== id),
          }));
        },

        updateQuantity: (id, quantity) => {
          if (quantity <= 0) {
            get().removeItem(id);
            return;
          }

          set((state) => ({
            items: (state.items ?? []).map((item) =>
              item.id === id ? { ...item, quantity } : item,
            ),
          }));
        },

        clearCart: () => set({ items: [] }),

        toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

        setCartOpen: (open) => set({ isOpen: open }),

        setShippingAddress: (address) =>
          set({ selectedShippingAddress: address }),

        setBillingAddress: (address) =>
          set({ selectedBillingAddress: address }),

        setBillingSameAsShipping: (same) =>
          set({ billingSameAsShipping: same }),

        getTotal: () => {
          const items = get().items ?? [];
          return Math.max(
            0,
            items.reduce((total, item) => {
              const price = item.product.discount_price || item.product.price;
              const optionPrice = item.options?.price_increment || 0;
              return total + (price + optionPrice) * item.quantity;
            }, 0),
          );
        },

        getItemCount: () => {
          const items = get().items ?? [];
          return Math.max(
            0,
            items.reduce((count, item) => count + item.quantity, 0),
          );
        },

        mergeGuestCartWithUser: async (userId) => {
          const { guestCart } = get();
          const items = get().items ?? [];
          const safeGuestCart = guestCart ?? [];

          if (safeGuestCart.length === 0) return;

          try {
            // Merge guest cart with user cart
            const mergedItems = [...items];

            safeGuestCart.forEach((guestItem) => {
              const existingIndex = mergedItems.findIndex(
                (item) =>
                  item.product_id === guestItem.product_id &&
                  item.product_options_id === guestItem.product_options_id,
              );

              if (existingIndex >= 0) {
                // Update quantity if item exists
                mergedItems[existingIndex].quantity += guestItem.quantity;
              } else {
                // Add new item
                mergedItems.push(guestItem);
              }
            });

            // Update the cart with merged items
            set({ items: mergedItems, guestCart: [] });

            // Sync with database
            await get().syncWithDatabase(userId);

            toast({
              title: "Cart Merged",
              description: "Your guest cart has been merged with your account",
              variant: "success",
            });
          } catch (error) {
            console.error("Failed to merge guest cart:", error);
            toast({
              title: "Merge Failed",
              description: "Could not merge your cart. Please try again.",
              variant: "destructive",
            });
          }
        },

        syncWithDatabase: async (userId) => {
          try {
            const items = get().items ?? [];

            // Get current session
            const sessionResponse = await fetch("/api/auth/session");
            const session = await sessionResponse.json();

            if (!session?.session?.id) {
              throw new Error("No active session found");
            }

            const sessionId = session.session.id;

            // Clear existing cart items for this user/session
            const clearResponse = await fetch("/api/cart/clear", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId, sessionId }),
            });
            if (!clearResponse.ok) {
              // Surface the failure instead of silently swallowing it: the
              // local cart is about to be re-synced from scratch, so an
              // unsuccessful clear will leave the user with duplicated
              // server-side items. Warn loudly but do not abort the merge
              // — the subsequent /api/cart/sync will still write the
              // intended set, and the user is told their cart may be out
              // of sync so they can re-trigger sync manually.
              console.warn(
                "[cart] /api/cart/clear returned",
                clearResponse.status,
                clearResponse.statusText,
                "— server-side cart may have stale items after sync.",
              );
            }

            // Add current items to database
            if (items.length > 0) {
              const cartItems = items.map((item) => ({
                productId: item.product_id,
                productOptionsId: item.product_options_id,
                quantity: item.quantity,
                userId: item.userId || userId,
                sessionId: item.sessionId || sessionId,
              }));

              const response = await fetch("/api/cart/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: cartItems }),
              });

              if (!response.ok) {
                throw new Error("Failed to sync cart items");
              }
            }

            // Mark items as persisted
            set((state) => ({
              items: (state.items ?? []).map((item) => ({
                ...item,
                isPersisted: true,
                userId: userId,
                sessionId: sessionId,
              })),
            }));
          } catch (error) {
            console.error("Failed to sync cart with database:", error);
            throw error;
          }
        },
      }),
      {
        name: "cart-storage",
        partialize: (state) => ({ items: state.items ?? [] }),
        // Skip hydration on server side
        skipHydration: typeof window === "undefined",
      },
    ),
  ),
);

// Export a function to check if we're in SSR environment
export const isServerSide = () => typeof window === "undefined";
