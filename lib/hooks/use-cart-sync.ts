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

  // Use explicit per-field selectors instead of bare `useStore()` so the
  // hook stays resilient when the store is partially hydrated (e.g. items
  // is `undefined` on the very first render during SSR/rehydration).
  const guestItems = useGuestCartStore((s) => s.items ?? []);
  const guestIsOpen = useGuestCartStore((s) => s.isOpen);
  const guestIsLoading = useGuestCartStore((s) => s.isLoading);
  const guestError = useGuestCartStore((s) => s.error);
  const guestPendingUpdates = useGuestCartStore((s) => s.pendingUpdates ?? []);
  const guestId = useGuestCartStore((s) => s.guestId);
  const guestIsGuest = useGuestCartStore((s) => s.isGuest);

  const userItems = useCartStore((s) => s.items ?? []);
  const userIsOpen = useCartStore((s) => s.isOpen);
  const userIsLoading = false; // user cart has no loading flag

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs to prevent stale closures and memory leaks
  const syncInProgressRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized user and guest state to prevent unnecessary re-computations
  const userId = session?.user?.id || null;
  const hasGuestItems = guestItems.length > 0;

  // Simple sync function without complex dependencies
  const syncCart = useCallback(async () => {
    if (syncInProgressRef.current || isSyncing) return;

    syncInProgressRef.current = true;
    setIsSyncing(true);
    setError(null);

    try {
      await useGuestCartStore.getState().syncWithServer();
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
  }, [isSyncing]); // Only depends on isSyncing flag

  // Simplified merge function - moved outside useEffect
  const mergeGuestCartToUserCart = useCallback(async () => {
    if (!userId || !guestId || !hasGuestItems || syncInProgressRef.current) {
      return;
    }

    try {
      syncInProgressRef.current = true;
      setIsSyncing(true);
      setError(null);

      // Get current items at merge time (always read fresh, never cached)
      const currentGuestItems = useGuestCartStore.getState().items ?? [];
      if (currentGuestItems.length === 0) return;

      const userCartApi = useCartStore.getState();

      // Simple merge: add guest items to user cart
      for (const item of currentGuestItems) {
        userCartApi.addItem({
          product_id: item.product_id,
          product_options_id: item.product_options_id,
          product: item.product,
          options: item.options,
          quantity: item.quantity,
        });
      }

      // Clear guest cart
      useGuestCartStore.getState().clearCart();

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
  }, [userId, guestId, hasGuestItems]); // Simplified dependencies

  // Handle authentication changes - single, focused effect
  useEffect(() => {
    if (isPending) return;

    // User logged in with guest items - trigger merge
    if (userId && guestId && hasGuestItems && !syncInProgressRef.current) {
      mergeGuestCartToUserCart();
    }
  }, [userId, isPending, guestId, hasGuestItems, mergeGuestCartToUserCart]); // Only check auth state changes

  // Auto-sync on visibility change - simplified
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const pending = useGuestCartStore.getState().pendingUpdates ?? [];
        if (pending.length > 0) {
          syncCart();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [syncCart]); // Only depends on syncCart function

  // Periodic sync - simplified
  useEffect(() => {
    if (!guestIsGuest) return;
    const pending = useGuestCartStore.getState().pendingUpdates ?? [];
    if (pending.length === 0) return;

    const interval = setInterval(() => {
      syncCart();
    }, 30000);

    return () => clearInterval(interval);
  }, [syncCart, guestIsGuest, guestPendingUpdates.length]);

  // Online/offline handling - simplified
  useEffect(() => {
    const handleOnline = () => {
      const pending = useGuestCartStore.getState().pendingUpdates ?? [];
      if (pending.length > 0) {
        syncCart();
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [syncCart, guestPendingUpdates.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Suppress unused-variable warnings by reading these values so the
  // selector subscriptions stay active and the re-render triggers fire.
  void guestIsOpen;
  void userIsOpen;
  void guestIsLoading;
  void userIsLoading;
  void userItems;
  void guestError;
  void guestPendingUpdates;

  return {
    syncCart,
    isSyncing,
    lastSync,
    error,
  };
}

/**
 * Simplified checkout session management
 *
 * Uses an explicit per-field selector for `guestId` instead of a bare
 * `useGuestCartStore()` call, so the hook stays resilient when the store
 * is partially hydrated (e.g. during SSR/rehydration `items` may briefly
 * be `undefined`).
 */
export function useCheckoutSession() {
  const { data: session } = useSession();
  // Per-field selector — subscribe only to the slice we actually use so
  // re-renders stay narrow and the component does not depend on the
  // entire store reference.
  const guestId = useGuestCartStore((s) => s.guestId);

  const createCheckoutSession = useCallback(
    (cartItems: EnhancedCartItem[]) => {
      const checkoutSession = {
        id: `checkout_${Date.now()}`,
        guestId,
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
    [guestId, session?.user?.id],
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
 *
 * Uses a single per-field selector for `resolveConflicts` and reads the
 * latest function reference from `useGuestCartStore.getState()` inside
 * the callback. This avoids the bare-`useGuestCartStore()` hydration
 * hazard and keeps the dependency array stable.
 */
export function useCartConflicts() {
  const resolveConflicts = useGuestCartStore((s) => s.resolveConflicts);

  const handleResolveConflicts = useCallback(
    async (conflicts: any[]) => {
      try {
        // Always read the latest action from the store so we never close
        // over a stale reference if the store was swapped during HMR.
        await useGuestCartStore.getState().resolveConflicts(conflicts);
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
    [resolveConflicts],
  );

  return {
    resolveConflicts: handleResolveConflicts,
  };
}

/**
 * Simple cart validation
 *
 * Same per-field-selector + getState() pattern as `useCartConflicts`.
 */
export function useCartValidation() {
  const validateCartFn = useGuestCartStore((s) => s.validateCart);

  const validateCart = useCallback(async () => {
    try {
      const result = await useGuestCartStore.getState().validateCart();

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
  }, [validateCartFn]);

  return {
    validateCart,
  };
}
