/**
 * Hook for real-time session updates monitoring
 *
 * This hook provides real-time monitoring of Better Auth session changes
 * and triggers navbar updates when session state changes occur.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

"use client";

import { useCallback, useEffect, useRef } from "react";
import { type Session, useSession } from "@/lib/auth-client";
import { useNavbarStore } from "@/lib/stores/navbar-store";

interface SessionUpdateData {
  cartCount: number;
  wishlistCount: number;
  notifications: Array<{
    id: string;
    type: "cart" | "wishlist" | "order" | "admin";
    message: string;
    timestamp: Date;
  }>;
}

export interface EnhancedSession extends Session {
  realTimeData?: SessionUpdateData;
}

export function useSessionUpdates() {
  const { data: session, isPending } = useSession();
  const { setSessionLoading, setLastSessionUpdate, updateRealTimeData } =
    useNavbarStore();
  const previousSessionRef = useRef<Session | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Monitor session changes and trigger updates
  useEffect(() => {
    if (isPending) {
      setSessionLoading(true);
      return;
    }

    setSessionLoading(false);

    // Optimized session change detection
    const hasSessionChanged = checkSessionChanged(
      previousSessionRef.current,
      session,
    );

    if (hasSessionChanged) {
      // Update last session update timestamp
      setLastSessionUpdate(new Date());

      // Clear any pending updates
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      // Debounce real-time data updates to prevent excessive re-renders
      updateTimeoutRef.current = setTimeout(() => {
        if (session?.user) {
          // Fetch or calculate real-time data
          const realTimeData: SessionUpdateData = {
            cartCount: 0, // Will be updated by cart store subscription
            wishlistCount: 0, // Will be updated by wishlist store subscription
            notifications: [],
          };
          updateRealTimeData(realTimeData);
        }
      }, 100);

      // Update previous session reference
      previousSessionRef.current = session;
    }

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [
    session,
    isPending,
    setSessionLoading,
    setLastSessionUpdate,
    updateRealTimeData,
  ]);

  // Helper function for optimized session comparison
  const checkSessionChanged = useCallback(
    (prev: Session | null, current: Session | null): boolean => {
      // Quick reference check first
      if (prev === current) return false;

      // If either is null, they're different
      if (!prev || !current) return true;

      // Check user reference first (most common change)
      if (prev.user !== current.user) return true;

      // Shallow comparison of key properties
      return (
        prev.user?.id !== current.user?.id ||
        prev.user?.email !== current.user?.email ||
        prev.user?.role !== current.user?.role ||
        prev.user?.name !== current.user?.name
      );
    },
    [],
  );

  // Return enhanced session data
  const enhancedSession: EnhancedSession | null = session
    ? {
        ...session,
        realTimeData: useNavbarStore.getState().realTimeData,
      }
    : null;

  return {
    session: enhancedSession,
    isPending,
    isSessionLoading: useNavbarStore((state) => state.isSessionLoading),
    lastSessionUpdate: useNavbarStore((state) => state.lastSessionUpdate),
  };
}

// Hook for monitoring cart and wishlist changes
export function useStoreUpdates() {
  const { updateRealTimeData } = useNavbarStore();

  const updateCounts = useCallback(
    (cartCount: number, wishlistCount: number) => {
      updateRealTimeData((prev) => ({
        ...prev,
        cartCount,
        wishlistCount,
      }));
    },
    [updateRealTimeData],
  );

  return { updateCounts };
}
