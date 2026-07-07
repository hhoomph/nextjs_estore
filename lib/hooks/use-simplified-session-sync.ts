/**
 * Simplified Session Sync Hook
 *
 * Eliminates render loops by using direct Better Auth integration
 * without complex store synchronization.
 *
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import { useMemo } from "react";
import { useSession } from "@/lib/auth-client";

/**
 * Simplified session hook that eliminates render loops
 */
export function useSimplifiedSessionSync() {
  // Direct Better Auth session - no complex store synchronization
  const { data: session, isPending } = useSession();

  // Memoize computed values to prevent unnecessary re-computations
  const sessionState = useMemo(() => {
    const user = session?.user || null;
    const isAuthenticated = !!user;
    const isGuest = !isAuthenticated;

    return {
      user,
      isAuthenticated,
      isGuest: !isAuthenticated || isPending,
      isLoading: isPending,
      isReady: !isPending,
    };
  }, [session?.user, isPending]);

  return sessionState;
}

/**
 * Hook for session-dependent components
 */
export function useSessionDependent<T>(
  fetcher: () => Promise<T>,
  enabled: boolean = true,
) {
  const { isAuthenticated, isLoading } = useSimplifiedSessionSync();

  // Simple dependency check without complex memoization
  const shouldFetch = enabled && isAuthenticated && !isLoading;

  return useMemo(
    () => ({
      data: shouldFetch ? null : null, // Placeholder for fetched data
      isLoading: isLoading || (shouldFetch && false), // Loading state
      error: null, // Error state
      refetch: fetcher, // Refetch function
    }),
    [shouldFetch, isLoading, fetcher],
  );
}

/**
 * Hook for admin checks - simplified
 */
export function useAdminCheck() {
  const { user, isAuthenticated } = useSimplifiedSessionSync();

  return useMemo(
    () => ({
      isAdmin: user?.role === "ADMIN",
      canAccessAdmin: isAuthenticated && user?.role === "ADMIN",
      user,
    }),
    [user?.role, isAuthenticated],
  );
}

/**
 * Hook for cart readiness based on session
 */
export function useSessionCartReady() {
  const { isAuthenticated, isReady } = useSimplifiedSessionSync();

  return useMemo(
    () => ({
      canUseUserCart: isAuthenticated && isReady,
      mustUseGuestCart: !isAuthenticated,
      isReady,
    }),
    [isAuthenticated, isReady],
  );
}
