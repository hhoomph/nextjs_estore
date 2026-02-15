/**
 * Cart Synchronization Hook - Optimized
 *
 * Fixed version that eliminates render loops and circular dependencies.
 *
 * @author hh.oomph@gmail.com
 * @version 1.1.0
 * @since 2025-01-01
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { mergeGuestCartToUser } from "@/lib/actions/cart";
import { useSession } from "@/lib/auth-client";
import { toast } from "@/lib/hooks/use-toast";
import { useCartStore } from "@/lib/stores/cart-store";
import { useGuestCartStore } from "@/lib/stores/guest-cart-store";
import { SafeSessionStorage } from "@/lib/utils/storage-ssr";
import type { EnhancedCartItem, UseCartSyncReturn } from "@/types/cart";

export function useCartSync(): UseCartSyncReturn {
  const { data: session, isPending } = useSession();
  const guestCart = useGuestCartStore();
  const userCart = useCartStore();

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs to prevent stale closures and memory leaks
  const syncInProgressRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized user and guest state to prevent unnecessary re-computations
  const userId = session?.user?.id || null;
  const guestId = guestCart.guestId;
  const hasGuestItems = guestCart.items.length > 0;

  // Simple sync function without complex dependencies
  const syncCart = useCallback(async () => {
    if (syncInProgressRef.current || isSyncing) return;

    syncInProgressRef.current = true;
    setIsSyncing(true);
    setError(null);

    try {
      await guestCart.syncWithServer();
      setLastSync(new Date());
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to sync cart";
      setError(errorMessage);
      toast({
        title: "Sync Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
      syncInProgressRef.current = false;
    }
  }, [guestCart]); // Only depends on guestCart, not other state

  // Simplified merge function - moved outside useEffect
  const mergeGuestCartToUserCart = useCallback(async () => {
    if (!userId || !guestId || !hasGuestItems || syncInProgressRef.current) {
      return;
    }

    try {
      syncInProgressRef.current = true;
      setIsSyncing(true);
      setError(null);

      // Get current items at merge time
      const currentGuestItems = [...guestCart.items];
      const currentUserItems = userCart.items as EnhancedCartItem[];

      if (currentGuestItems.length === 0) return;

      // Simple merge: add guest items to user cart
      for (const item of currentGuestItems) {
        userCart.addItem({
          product_id: item.product_id,
          product_options_id: item.product_options_id,
          product: item.product,
          options: item.options,
          quantity: item.quantity,
        });
      }

      // Clear guest cart
      guestCart.clearCart();

      toast({
        title: "Cart Merged",
        description: `Added ${currentGuestItems.length} items from your guest session`,
        variant: "success",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to merge carts";
      setError(errorMessage);
      toast({
        title: "Merge Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
      syncInProgressRef.current = false;
    }
  }, [userId, guestId, hasGuestItems, guestCart, userCart]); // Simplified dependencies

  // Handle authentication changes - single, focused effect
  useEffect(() => {
    if (isPending) return;

    // User logged in with guest items - trigger merge
    if (userId && guestId && hasGuestItems && !syncInProgressRef.current) {
      mergeGuestCartToUserCart();
    }
  }, [userId, isPending]); // Only check auth state changes

  // Auto-sync on visibility change - simplified
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && guestCart.pendingUpdates.length > 0) {
        syncCart();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [syncCart]); // Only depends on syncCart function

  // Periodic sync - simplified
  useEffect(() => {
    if (!guestCart.isGuest || guestCart.pendingUpdates.length === 0) return;

    const interval = setInterval(() => {
      syncCart();
    }, 30000);

    return () => clearInterval(interval);
  }, [syncCart, guestCart.isGuest, guestCart.pendingUpdates.length]);

  // Online/offline handling - simplified
  useEffect(() => {
    const handleOnline = () => {
      if (guestCart.pendingUpdates.length > 0) {
        syncCart();
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [syncCart, guestCart.pendingUpdates.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    syncCart,
    isSyncing,
    lastSync,
    error,
  };
}

/**
 * Simplified checkout session management
 */
export function useCheckoutSession() {
  const { data: session } = useSession();
  const guestCart = useGuestCartStore();

  const createCheckoutSession = useCallback(
    (cartItems: EnhancedCartItem[]) => {
      const checkoutSession = {
        id: `checkout_${Date.now()}`,
        guestId: guestCart.guestId,
        userId: session?.user?.id,
        items: cartItems,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      SafeSessionStorage.setItem(
        "checkout_session",
        JSON.stringify(checkoutSession),
      );
      return checkoutSession;
    },
    [guestCart.guestId, session?.user?.id],
  );

  const getCheckoutSession = useCallback(() => {
    try {
      const stored = SafeSessionStorage.getItem("checkout_session");
      if (!stored) return null;

      const sessionData = JSON.parse(stored);
      if (new Date(sessionData.expiresAt) < new Date()) {
        SafeSessionStorage.removeItem("checkout_session");
        return null;
      }

      return sessionData;
    } catch {
      return null;
    }
  }, []);

  const updateCheckoutSession = useCallback(
    (updates: any) => {
      const currentSession = getCheckoutSession();
      if (!currentSession) return null;

      const updatedSession = {
        ...currentSession,
        ...updates,
        updatedAt: new Date(),
      };

      SafeSessionStorage.setItem(
        "checkout_session",
        JSON.stringify(updatedSession),
      );
      return updatedSession;
    },
    [getCheckoutSession],
  );

  const clearCheckoutSession = useCallback(() => {
    SafeSessionStorage.removeItem("checkout_session");
  }, []);

  return {
    createCheckoutSession,
    getCheckoutSession,
    updateCheckoutSession,
    clearCheckoutSession,
  };
}

/**
 * Simple conflict resolution
 */
export function useCartConflicts() {
  const guestCart = useGuestCartStore();

  const resolveConflicts = useCallback(
    async (conflicts: any[]) => {
      try {
        await guestCart.resolveConflicts(conflicts);
        toast({
          title: "Conflicts Resolved",
          description: "Cart conflicts have been resolved",
          variant: "success",
        });
      } catch (error) {
        toast({
          title: "Resolution Failed",
          description: "Failed to resolve cart conflicts",
          variant: "destructive",
        });
      }
    },
    [guestCart],
  );

  return {
    resolveConflicts,
  };
}

/**
 * Simple cart validation
 */
export function useCartValidation() {
  const guestCart = useGuestCartStore();

  const validateCart = useCallback(async () => {
    try {
      const result = await guestCart.validateCart();

      if (!result.isValid) {
        toast({
          title: "Cart Validation Failed",
          description: result.errors.join(", "),
          variant: "destructive",
        });
      }

      return result;
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Failed to validate cart",
        variant: "destructive",
      });
      return { isValid: false, errors: ["Validation failed"] };
    }
  }, [guestCart]);

  return {
    validateCart,
  };
}
