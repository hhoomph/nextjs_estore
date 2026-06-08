/**
 * Guest Cart Store - Enhanced Zustand State Management for Guest Shopping Cart
 *
 * This store manages guest user cart state with localStorage/sessionStorage persistence,
 * synchronization capabilities, and seamless integration with authenticated cart store.
 *
 * Features:
 * - Guest cart persistence across browser sessions
 * - Automatic synchronization with user account upon login
 * - Conflict resolution for cart items
 * - Debounced updates and batch operations
 * - Enhanced error handling and validation
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import { toast } from "@/lib/hooks/use-toast";
import { randomUUID } from "@/lib/utils/crypto-ssr";
import {
  CART_ERROR_CODES,
  CART_STORAGE_KEYS,
  type CartState,
  type CartUpdate,
  createCartItemId,
  type EnhancedCartItem,
  isGuestCart,
} from "@/types/cart";

// Re-export EnhancedCartItem for use in other modules
export type { EnhancedCartItem } from "@/types/cart";

// Storage data interfaces
interface StoredCartItem {
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
    product_pictures?: Array<{
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
  addedAt: string; // ISO string
  updatedAt: string; // ISO string
  sessionId?: string;
  isPersisted: boolean;
}

interface StoredCartUpdate {
  type: "add" | "remove" | "update";
  item: StoredCartItem;
  timestamp: string; // ISO string
  synced: boolean;
}

interface StoredCartState {
  items: StoredCartItem[];
  guestId?: string;
  lastSync: string; // ISO string
  pendingUpdates: StoredCartUpdate[];
}

interface ConflictResolution {
  itemId: string;
  serverVersion: EnhancedCartItem;
}

// Storage utilities
class CartStorage {
  private static generateGuestId(): string {
    return `guest_${randomUUID()}`;
  }

  static getGuestId(): string {
    // Check if we're on the client side
    if (typeof window === "undefined") return CartStorage.generateGuestId();

    try {
      const stored = localStorage.getItem(CART_STORAGE_KEYS.GUEST_ID);
      if (stored) return stored;

      const newId = CartStorage.generateGuestId();
      localStorage.setItem(CART_STORAGE_KEYS.GUEST_ID, newId);
      return newId;
    } catch (error) {
      console.error("Failed to access localStorage for guest ID:", error);
      return CartStorage.generateGuestId();
    }
  }

  static saveCartState(state: CartState): void {
    // Check if we're on the client side
    if (typeof window === "undefined") return;

    try {
      const safeItems = state.items ?? [];
      const safePendingUpdates = state.pendingUpdates ?? [];
      const dataToStore = {
        items: safeItems.map((item) => ({
          ...item,
          addedAt: item.addedAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        })),
        guestId: state.guestId,
        lastSync: state.lastSync.toISOString(),
        pendingUpdates: safePendingUpdates.map((update) => ({
          ...update,
          timestamp: update.timestamp.toISOString(),
        })),
      };

      sessionStorage.setItem(
        CART_STORAGE_KEYS.ITEMS,
        JSON.stringify(dataToStore),
      );
      localStorage.setItem(
        CART_STORAGE_KEYS.LAST_SYNC,
        state.lastSync.toISOString(),
      );
    } catch (error) {
      console.error("Failed to save cart state to storage:", error);
    }
  }

  static loadCartState(): Partial<CartState> | null {
    // Check if we're on the client side
    if (typeof window === "undefined") return null;

    try {
      const stored = sessionStorage.getItem(CART_STORAGE_KEYS.ITEMS);
      if (!stored) return null;

      const parsed = JSON.parse(stored) as StoredCartState;
      return {
        ...parsed,
        items: parsed.items.map((item) => ({
          ...item,
          product: {
            ...item.product,
            product_pictures: item.product.product_pictures || [],
          },
          addedAt: new Date(item.addedAt),
          updatedAt: new Date(item.updatedAt),
        })) as EnhancedCartItem[],
        lastSync: new Date(parsed.lastSync),
        pendingUpdates: parsed.pendingUpdates.map((update) => ({
          ...update,
          item: {
            ...update.item,
            product: {
              ...update.item.product,
              product_pictures: update.item.product.product_pictures || [],
            },
            addedAt: new Date(update.item.addedAt),
            updatedAt: new Date(update.item.updatedAt),
          } as EnhancedCartItem,
          timestamp: new Date(update.timestamp),
        })),
      };
    } catch (error) {
      console.error("Failed to load cart state from storage:", error);
      return null;
    }
  }

  static clearStorage(): void {
    // Check if we're on the client side
    if (typeof window === "undefined") return;

    try {
      sessionStorage.removeItem(CART_STORAGE_KEYS.ITEMS);
      localStorage.removeItem(CART_STORAGE_KEYS.LAST_SYNC);
      // Keep guest ID for potential future use
    } catch (error) {
      console.error("Failed to clear cart storage:", error);
    }
  }
}

// Cart validation utilities
class CartValidator {
  static validateQuantity(quantity: number): boolean {
    return Number.isInteger(quantity) && quantity > 0 && quantity <= 999;
  }

  static validateCartItem(item: Partial<EnhancedCartItem>): string[] {
    const errors: string[] = [];

    if (!item.product_id) errors.push("Product ID is required");
    if (!item.product?.id) errors.push("Product data is required");
    if (!CartValidator.validateQuantity(item.quantity || 0))
      errors.push("Invalid quantity");

    return errors;
  }

  static validateStock(
    item: EnhancedCartItem,
    availableStock: number,
  ): boolean {
    return item.quantity <= availableStock;
  }
}

// Main guest cart store
interface GuestCartStore extends CartState {
  // Cart sidebar state management
  isOpen: boolean;
  setCartOpen: (open: boolean) => void;

  // Core cart operations
  addItem: (
    item: Omit<
      EnhancedCartItem,
      "id" | "addedAt" | "updatedAt" | "sessionId" | "isPersisted"
    >,
  ) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;

  // Synchronization operations
  syncWithServer: () => Promise<void>;
  mergeWithUserCart: (
    userCartItems: EnhancedCartItem[],
  ) => Promise<EnhancedCartItem[]>;
  resolveConflicts: (conflicts: ConflictResolution[]) => Promise<void>;

  // Utility operations
  getItemCount: () => number;
  getTotal: () => number;
  validateCart: () => Promise<{ isValid: boolean; errors: string[] }>;
  exportCart: () => CartState;

  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | undefined) => void;
  retryFailedUpdates: () => Promise<void>;
}

export const useGuestCartStore = create<GuestCartStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        items: [],
        isOpen: false, // Cart sidebar starts closed
        guestId: undefined,
        isGuest: true,
        lastSync: new Date(),
        pendingUpdates: [],
        isLoading: false,
        error: undefined,

        // Core cart operations
        addItem: (newItem) => {
          const state = get();
          if (!isGuestCart(state)) return;

          // Validate item
          const validationErrors = CartValidator.validateCartItem(newItem);
          if (validationErrors.length > 0) {
            toast({
              title: "Invalid Item",
              description: validationErrors.join(", "),
              variant: "destructive",
            });
            return;
          }

          const itemId = createCartItemId(
            newItem.product_id,
            newItem.product_options_id,
          );
          const existingItemIndex = state.items.findIndex(
            (item) => item.id === itemId,
          );

          const now = new Date();
          const update: CartUpdate = {
            type: "add",
            item: {
              ...newItem,
              id: itemId,
              addedAt: now,
              updatedAt: now,
              sessionId: state.guestId || undefined,
              isPersisted: false,
            },
            timestamp: now,
            synced: false,
          };

          if (existingItemIndex >= 0) {
            // Update existing item quantity
            const updatedItems = [...state.items];
            const existingItem = updatedItems[existingItemIndex];
            const newQuantity = existingItem.quantity + (newItem.quantity || 1);

            if (!CartValidator.validateQuantity(newQuantity)) {
              toast({
                title: "Invalid Quantity",
                description: "Cannot add more items to cart",
                variant: "destructive",
              });
              return;
            }

            updatedItems[existingItemIndex] = {
              ...existingItem,
              quantity: newQuantity,
              updatedAt: now,
            };

            set({
              items: updatedItems,
              isOpen: true, // Open cart sidebar
              pendingUpdates: [
                ...state.pendingUpdates,
                { ...update, type: "update" },
              ],
            });

            toast({
              title: "Cart Updated",
              description: `Quantity updated for ${newItem.product.name}`,
              variant: "success",
            });
          } else {
            // Add new item
            const cartItem: EnhancedCartItem = {
              ...newItem,
              id: itemId,
              quantity: newItem.quantity || 1,
              addedAt: now,
              updatedAt: now,
              sessionId: state.guestId || undefined,
              isPersisted: false,
            };

            set({
              items: [...state.items, cartItem],
              isOpen: true, // Open cart sidebar when adding new item
              pendingUpdates: [...state.pendingUpdates, update],
            });

            toast({
              title: "Added to Cart",
              description: `${newItem.product.name} has been added to your cart`,
              variant: "success",
            });
          }
        },

        removeItem: (id) => {
          const state = get();
          const itemToRemove = state.items.find((item) => item.id === id);

          if (!itemToRemove) return;

          const update: CartUpdate = {
            type: "remove",
            item: itemToRemove,
            timestamp: new Date(),
            synced: false,
          };

          set((state) => ({
            items: state.items.filter((item) => item.id !== id),
            pendingUpdates: [...state.pendingUpdates, update],
          }));

          toast({
            title: "Removed from Cart",
            description: `${itemToRemove.product.name} has been removed from your cart`,
            variant: "success",
          });
        },

        updateQuantity: (id, quantity) => {
          const state = get();

          if (quantity <= 0) {
            get().removeItem(id);
            return;
          }

          if (!CartValidator.validateQuantity(quantity)) {
            toast({
              title: "Invalid Quantity",
              description: "Please enter a valid quantity",
              variant: "destructive",
            });
            return;
          }

          const itemToUpdate = state.items.find((item) => item.id === id);
          if (!itemToUpdate) return;

          const update: CartUpdate = {
            type: "update",
            item: { ...itemToUpdate, quantity },
            timestamp: new Date(),
            synced: false,
          };

          set((state) => ({
            items: state.items.map((item) =>
              item.id === id
                ? { ...item, quantity, updatedAt: new Date() }
                : item,
            ),
            pendingUpdates: [...state.pendingUpdates, update],
          }));
        },

        clearCart: () => {
          set({
            items: [],
            pendingUpdates: [],
            error: undefined,
          });

          CartStorage.clearStorage();

          toast({
            title: "Cart Cleared",
            description: "All items have been removed from your cart",
            variant: "success",
          });
        },

        // Synchronization operations
        syncWithServer: async () => {
          const state = get();
          if (!isGuestCart(state) || state.pendingUpdates.length === 0) return;

          set({ isLoading: true, error: undefined });

          try {
            // Ensure guest ID exists
            const guestId = state.guestId || CartStorage.getGuestId();
            if (!state.guestId) {
              set({ guestId });
            }

            // Send pending updates to server
            const response = await fetch("/api/cart/sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                guestId,
                updates: state.pendingUpdates,
                items: state.items,
              }),
            });

            if (!response.ok) {
              throw new Error("Failed to sync cart");
            }

            const result = await response.json();

            // Update local state with server response
            set({
              items: result.items,
              pendingUpdates: [],
              lastSync: new Date(),
              isLoading: false,
            });
          } catch (error) {
            console.error("Cart sync failed:", error);
            set({
              error: "Failed to sync cart with server",
              isLoading: false,
            });

            toast({
              title: "Sync Failed",
              description: "Cart changes may not be saved. Please try again.",
              variant: "destructive",
            });
          }
        },

        mergeWithUserCart: async (userCartItems) => {
          const state = get();
          if (!isGuestCart(state)) return userCartItems;

          // Simple merge strategy: prefer user cart items, add guest items if they don't exist
          const mergedItems = [...userCartItems];
          const userItemIds = new Set(userCartItems.map((item) => item.id));

          for (const guestItem of state.items) {
            if (!userItemIds.has(guestItem.id)) {
              // Add guest item to user cart
              mergedItems.push({
                ...guestItem,
                sessionId: undefined, // Remove guest session ID
                isPersisted: true,
              });
            }
          }

          // Clear guest cart after merge
          set({
            items: [],
            pendingUpdates: [],
          });

          CartStorage.clearStorage();

          return mergedItems;
        },

        resolveConflicts: async (conflicts) => {
          // Basic conflict resolution: prefer server version
          const state = get();
          const resolvedItems = [...state.items];

          for (const conflict of conflicts) {
            const index = resolvedItems.findIndex(
              (item) => item.id === conflict.itemId,
            );
            if (index >= 0) {
              resolvedItems[index] = conflict.serverVersion;
            }
          }

          set({ items: resolvedItems });
        },

        // Utility operations
        getItemCount: () => {
          const { items } = get();
          const safeItems = items ?? [];
          return safeItems.reduce((count, item) => count + item.quantity, 0);
        },

        getTotal: () => {
          const { items } = get();
          const safeItems = items ?? [];
          return safeItems.reduce((total, item) => {
            const price = item.product.discount_price || item.product.price;
            const optionPrice = item.options?.price_increment || 0;
            return total + (price + optionPrice) * item.quantity;
          }, 0);
        },

        validateCart: async () => {
          const { items } = get();
          const errors: string[] = [];

          for (const item of items) {
            // Basic validation
            if (!CartValidator.validateQuantity(item.quantity)) {
              errors.push(`${item.product.name}: Invalid quantity`);
            }

            // Check stock (this would need to be implemented with server call)
            // if (!await checkStockAvailability(item)) {
            //   errors.push(`${item.product.name}: Out of stock`);
            // }
          }

          return {
            isValid: errors.length === 0,
            errors,
          };
        },

        exportCart: () => {
          return get();
        },

        // Cart sidebar state management
        setCartOpen: (open) => set({ isOpen: open }),

        // State management
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),

        retryFailedUpdates: async () => {
          await get().syncWithServer();
        },
      }),
      {
        name: "guest-cart-storage",
        storage: {
          getItem: (name) => {
            // Check if we're on the client side
            if (typeof window === "undefined") {
              return {
                state: {
                  items: [],
                  guestId: CartStorage.getGuestId(), // This will generate a guest ID without storage
                  isGuest: true,
                  lastSync: new Date(),
                  pendingUpdates: [],
                  isLoading: false,
                  error: undefined,
                },
                version: 0,
              };
            }

            const stored = CartStorage.loadCartState();
            if (stored) {
              return {
                state: {
                  items: stored.items ?? [],
                  guestId: stored.guestId || CartStorage.getGuestId(),
                  isGuest: true,
                  lastSync: stored.lastSync || new Date(),
                  pendingUpdates: stored.pendingUpdates ?? [],
                  isLoading: false,
                  error: undefined,
                },
                version: 0,
              };
            }
            return null;
          },
          setItem: (name, value) => {
            // Only save if we're on the client side
            if (typeof window !== "undefined") {
              CartStorage.saveCartState(value.state);
            }
          },
          removeItem: (name) => {
            // Only clear if we're on the client side
            if (typeof window !== "undefined") {
              CartStorage.clearStorage();
            }
          },
        },
      },
    ),
  ),
);

// Auto-sync setup (client-side only)
if (typeof window !== "undefined") {
  // Initialize guest ID on first load
  useGuestCartStore.setState((state) => ({
    guestId: state.guestId || CartStorage.getGuestId(),
  }));

  // Auto-sync on visibility change (when user returns to tab)
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      const store = useGuestCartStore.getState();
      if (store.pendingUpdates.length > 0) {
        store.syncWithServer();
      }
    }
  });

  // Periodic sync (every 30 seconds if there are pending updates)
  setInterval(() => {
    const store = useGuestCartStore.getState();
    if (store.pendingUpdates.length > 0 && !store.isLoading) {
      store.syncWithServer();
    }
  }, 30000);
}

// Server-side initialization is handled by the persist middleware

// Export utilities
export { CartStorage, CartValidator }; // Added missing closing export

// Export a function to check if we're in SSR environment
export const isServerSide = () => typeof window === "undefined";
