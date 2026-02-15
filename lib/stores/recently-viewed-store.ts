/**
 * Recently viewed products store using Zustand
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { randomUUID } from "@/lib/utils/crypto-ssr";
import {
  createStorageWithExpiration,
  SafeLocalStorage,
} from "@/lib/utils/storage-ssr";

export interface RecentlyViewedProduct {
  id: string;
  product_id: string;
  viewed_at: string;
  product: {
    id: string;
    name: string;
    price: number;
    discount_price: number | null;
    slug: string;
    product_pictures: { picture: { url: string } }[];
  };
}

interface RecentlyViewedStore {
  products: RecentlyViewedProduct[];
  isLoading: boolean;
  addProduct: (product: RecentlyViewedProduct["product"]) => void;
  removeProduct: (productId: string) => void;
  clearProducts: () => void;
  setLoading: (loading: boolean) => void;
  syncWithServer: (serverData: RecentlyViewedProduct[]) => void;
}

// Storage key
const STORAGE_KEY = "recently-viewed-products";

// Maximum number of products to store
const MAX_PRODUCTS = 50;

// Data expiration time (30 days in milliseconds)
const EXPIRATION_TIME = 30 * 24 * 60 * 60 * 1000;

/**
 * Custom storage with expiration and data validation (SSR-safe)
 */
const customStorage = createStorageWithExpiration({
  storage: SafeLocalStorage,
  expirationKey: "lastUpdated",
  defaultExpirationMs: EXPIRATION_TIME,
});

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set, get) => ({
      products: [],
      isLoading: false,

      /**
       * Add a product to recently viewed list
       */
      addProduct: (product: RecentlyViewedProduct["product"]) => {
        set((state) => {
          const now = new Date().toISOString();

          // Create new viewed product entry
          const newViewedProduct: RecentlyViewedProduct = {
            id: randomUUID(),
            product_id: product.id,
            viewed_at: now,
            product,
          };

          // Remove existing entry if it exists (to move it to top)
          const filteredProducts = state.products.filter(
            (p) => p.product_id !== product.id,
          );

          // Add new entry at the beginning
          const updatedProducts = [newViewedProduct, ...filteredProducts];

          // Limit to maximum products
          const limitedProducts = updatedProducts.slice(0, MAX_PRODUCTS);

          return {
            products: limitedProducts,
          };
        });
      },

      /**
       * Remove a product from recently viewed list
       */
      removeProduct: (productId: string) => {
        set((state) => ({
          products: state.products.filter((p) => p.product_id !== productId),
        }));
      },

      /**
       * Clear all recently viewed products
       */
      clearProducts: () => {
        set({ products: [] });
        // Also clear from localStorage
        customStorage.removeItem(STORAGE_KEY);
      },

      /**
       * Set loading state
       */
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      /**
       * Sync local data with server data
       */
      syncWithServer: (serverData: RecentlyViewedProduct[]) => {
        set((state) => {
          // Create a map of existing products for quick lookup
          const existingProducts = new Map(
            state.products.map((p) => [p.product_id, p]),
          );

          // Merge server data with local data
          const mergedProducts = [...serverData];

          // Add local products that aren't in server data
          for (const localProduct of state.products) {
            if (
              !mergedProducts.some(
                (p) => p.product_id === localProduct.product_id,
              )
            ) {
              mergedProducts.push(localProduct);
            }
          }

          // Sort by viewed_at (most recent first)
          mergedProducts.sort(
            (a, b) =>
              new Date(b.viewed_at).getTime() - new Date(a.viewed_at).getTime(),
          );

          // Limit to maximum products
          const limitedProducts = mergedProducts.slice(0, MAX_PRODUCTS);

          return {
            products: limitedProducts,
          };
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => customStorage),
    },
  ),
);

/**
 * Hook to get recently viewed products for current user
 * This would be used to sync with server data when user is logged in
 */
export const useRecentlyViewedProducts = () => {
  const { products, isLoading, addProduct, removeProduct, clearProducts } =
    useRecentlyViewedStore();

  return {
    products,
    isLoading,
    addProduct,
    removeProduct,
    clearProducts,
    hasProducts: products.length > 0,
    productCount: products.length,
  };
};

/**
 * Hook to check if a product is in recently viewed
 */
export const useIsRecentlyViewed = (productId: string) => {
  const { products } = useRecentlyViewedStore();

  return products.some((p) => p.product_id === productId);
};

/**
 * Hook to get recently viewed product IDs
 */
export const useRecentlyViewedIds = () => {
  const { products } = useRecentlyViewedStore();

  return products.map((p) => p.product_id);
};
