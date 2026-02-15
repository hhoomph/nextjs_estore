/**
 * Product Comparison Store
 *
 * Zustand store for managing product comparison functionality
 * Supports adding/removing products from comparison, persisting to localStorage,
 * and providing comparison data to components.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { localStorageAdapter } from "@/lib/utils/storage-ssr";

export interface ComparisonProduct {
  id: string;
  name: string;
  price: number;
  discount_price?: number;
  slug: string;
  category: string;
  brand?: string;
  product_pictures: Array<{
    picture: { url: string };
  }>;
  specifications?: Record<string, any>;
  rating?: number;
  review_count?: number;
  in_stock: boolean;
  description?: string;
}

interface ComparisonState {
  items: ComparisonProduct[];
  maxItems: number;
  isOpen: boolean;
}

interface ComparisonActions {
  addItem: (product: ComparisonProduct) => void;
  removeItem: (productId: string) => void;
  clearAll: () => void;
  toggleComparison: () => void;
  setComparisonOpen: (open: boolean) => void;
  isInComparison: (productId: string) => boolean;
  canAddMore: () => boolean;
  getItemCount: () => number;
}

type ComparisonStore = ComparisonState & ComparisonActions;

/**
 * Maximum number of products that can be compared
 */
const MAX_COMPARISON_ITEMS = 4;

/**
 * Product comparison store with persistence
 */
export const useComparisonStore = create<ComparisonStore>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      maxItems: MAX_COMPARISON_ITEMS,
      isOpen: false,

      // Actions
      addItem: (product: ComparisonProduct) => {
        const { items, maxItems } = get();

        // Check if product is already in comparison
        if (items.some((item) => item.id === product.id)) {
          return; // Already in comparison
        }

        // Check if we can add more items
        if (items.length >= maxItems) {
          // Remove oldest item to make space for new one
          const newItems = [...items.slice(1), product];
          set({ items: newItems });
        } else {
          set({ items: [...items, product] });
        }
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },

      clearAll: () => {
        set({ items: [] });
      },

      toggleComparison: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      setComparisonOpen: (open: boolean) => {
        set({ isOpen: open });
      },

      isInComparison: (productId: string) => {
        return get().items.some((item) => item.id === productId);
      },

      canAddMore: () => {
        return get().items.length < get().maxItems;
      },

      getItemCount: () => {
        return get().items.length;
      },
    }),
    {
      name: "product-comparison",
      storage: createJSONStorage(() => localStorageAdapter),
      // Only persist items, not UI state
      partialize: (state) => ({
        items: state.items,
        maxItems: state.maxItems,
      }),
    },
  ),
);

/**
 * Hook for managing comparison actions
 */
export function useComparisonActions() {
  const store = useComparisonStore();

  return {
    addToComparison: store.addItem,
    removeFromComparison: store.removeItem,
    clearComparison: store.clearAll,
    toggleComparison: store.toggleComparison,
    setComparisonOpen: store.setComparisonOpen,
    isInComparison: store.isInComparison,
    canAddMore: store.canAddMore,
  };
}

/**
 * Hook for comparison state
 */
export function useComparisonState() {
  const store = useComparisonStore();

  return {
    comparisonItems: store.items,
    comparisonCount: store.getItemCount(),
    maxComparisonItems: store.maxItems,
    isComparisonOpen: store.isOpen,
    canAddMore: store.canAddMore(),
  };
}
