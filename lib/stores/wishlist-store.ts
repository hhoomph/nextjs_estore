/**
 * Module for wishlist-store
 *
 * @author hh.oomph@gmail.com
 * @version 2.0.0
 * @since 2025-01-01
 */
import { create } from "zustand";
import { devtools, persist, subscribeWithSelector } from "zustand/middleware";
import { toast } from "@/lib/hooks/use-toast";
import { CART_CONSTANTS } from "@/lib/constants/cart";
import { randomUUID } from "@/lib/utils/crypto-ssr";

export interface WishlistItem {
  id: string;
  product_id: string;
  product: {
    id: string;
    name: string;
    price: number;
    discount_price: number | null;
    slug: string;
    product_pictures: { picture: { url: string } }[];
  };
  addedAt: string;
}

interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: Omit<WishlistItem, "id" | "addedAt">) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  getItemCount: () => number;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  devtools(
    subscribeWithSelector(
      persist(
        (set, get) => ({
          items: [],

          addItem: (item) => {
            const { items, isInWishlist } = get();

            // Don't add if already in wishlist
            if (isInWishlist(item.product_id)) {
              return;
            }

            const newItem: WishlistItem = {
              ...item,
              id: randomUUID(),
              addedAt: new Date().toISOString(),
            };

            set({ items: [...items, newItem] });
            toast({
              title: "Added to Wishlist",
              description: `${item.product.name} has been added to your wishlist`,
              variant: "success",
            });
          },

          removeItem: (productId) => {
            const { items } = get();
            const itemToRemove = items.find(
              (item) => item.product_id === productId,
            );

            set({
              items: items.filter((item) => item.product_id !== productId),
            });

            if (itemToRemove) {
              toast({
                title: "Removed from Wishlist",
                description: `${itemToRemove.product.name} has been removed from your wishlist`,
                variant: "default",
              });
            }
          },

          isInWishlist: (productId) => {
            const { items } = get();
            return items.some((item) => item.product_id === productId);
          },

          getItemCount: () => {
            const { items } = get();
            const safeItems = items ?? [];
            return Math.max(0, safeItems.length);
          },

          clearWishlist: () => {
            set({ items: [] });
          },
        }),
        {
          name: "wishlist-storage",
          skipHydration: typeof window === "undefined",
        },
      ),
    ),
    { name: "wishlist-store" },
  ),
);

// Export a function to check if we're in SSR environment
export const isServerSide = () => typeof window === "undefined";