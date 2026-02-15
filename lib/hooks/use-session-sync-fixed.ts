/**
 * Optimized session synchronization hook
 * Provides stable session state management without infinite loops
 *
 * @author hh.oomph@gmail.com
 * @version 2.0.0
 * @since 2025-01-01
 */

"use client";

import { useCallback, useMemo } from "react";
import { useSession } from "@/lib/auth-client";
import {
  type SessionUser,
  useClearSession,
  useIsAuthenticated,
  useSessionLoading,
  useSessionSyncStatus,
  useSessionUser,
  useSetSessionLoading,
  useSyncSession,
} from "@/lib/stores/session-sync-store";

/**
 * Optimized session synchronization with stable selectors
 * Prevents infinite loops by using individual selectors and proper memoization
 */
export function useOptimizedSessionSync() {
  // Use individual stable selectors instead of combined state
  const user = useSessionUser();
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useSessionLoading();
  const syncStatus = useSessionSyncStatus();
  const setLoading = useSetSessionLoading();
  const syncSession = useSyncSession();
  const clearSession = useClearSession();

  // Get Better Auth session
  const { data: session, isPending } = useSession();

  // Memoize computed values to prevent unnecessary re-computations
  const computedValues = useMemo(
    () => ({
      isGuest: !isAuthenticated,
      hasValidSession: isAuthenticated && user !== null,
      isPending: isPending || isLoading,
      sessionStatus: syncStatus,
    }),
    [isAuthenticated, user, isPending, isLoading, syncStatus],
  );

  // Convert Better Auth session to our SessionUser format with memoization
  const convertedUser = useMemo((): SessionUser | null => {
    if (!session?.user) return null;

    return {
      id: session.user.id,
      name: session.user.name || "",
      email: session.user.email,
      role: session.user.role || "user",
      active: true, // Better Auth handles active status internally
    };
  }, [
    session?.user?.id,
    session?.user?.name,
    session?.user?.email,
    session?.user?.role,
  ]);

  // Memoized sync function to prevent recreation on every render
  const syncSessionData = useCallback(
    async (sessionData: any) => {
      if (!convertedUser) {
        clearSession();
        return;
      }

      try {
        setLoading(true);
        await syncSession(convertedUser);
      } catch (error) {
        console.error("Failed to sync session data:", error);
        clearSession();
      } finally {
        setLoading(false);
      }
    },
    [convertedUser, setLoading, syncSession, clearSession],
  );

  // Refresh session function
  const refreshSession = useCallback(async () => {
    try {
      // Trigger a session refresh by calling the session hook again
      // This is a workaround since Better Auth doesn't expose a direct refresh method
      window.location.reload();
    } catch (error) {
      console.error("Failed to refresh session:", error);
    }
  }, []);

  // Return memoized object to prevent unnecessary re-renders
  return useMemo(
    () => ({
      // Current session state
      user: convertedUser,
      isAuthenticated,
      ...computedValues,
      session,

      // Actions
      refreshSession,
      syncSessionData,
      clearSession,

      // Raw values for debugging
      rawSession: session,
      rawUser: user,
    }),
    [
      convertedUser,
      isAuthenticated,
      computedValues,
      session,
      refreshSession,
      syncSessionData,
      clearSession,
      user,
    ],
  );
}

/**
 * Hook for session-dependent data fetching with proper memoization
 */
export function useSessionDependentData<T>(
  fetcher: () => Promise<T>,
  deps: any[] = [],
) {
  const { isAuthenticated, isPending } = useOptimizedSessionSync();
  const user = useSessionUser();

  // Memoize the fetcher function to prevent unnecessary re-executions
  const memoizedFetcher = useCallback(fetcher, deps);

  // Memoize the result to prevent unnecessary computations
  return useMemo(() => {
    if (!isAuthenticated || isPending) {
      return {
        data: null,
        isLoading: isPending,
        error: null,
        refetch: memoizedFetcher,
      };
    }

    // In a real implementation, this would trigger the fetch
    // For now, just return the memoized fetcher
    return {
      data: null,
      isLoading: false,
      error: null,
      refetch: memoizedFetcher,
    };
  }, [isAuthenticated, isPending, user?.id, memoizedFetcher]);
}

/**
 * Hook for admin session monitoring with memoized computations
 */
export function useAdminSessionMonitor() {
  const session = useOptimizedSessionSync();
  const { data: authSession } = useSession();

  // Memoize admin checks to prevent unnecessary re-computations
  const adminChecks = useMemo(() => {
    const isAdmin =
      session.user?.role === "ADMIN" || authSession?.user?.role === "ADMIN";
    const hasAdminPrivileges = session.isAuthenticated && isAdmin;

    return {
      isAdmin,
      hasAdminPrivileges,
      canManageUsers: hasAdminPrivileges,
      canAccessAdminPanel: hasAdminPrivileges,
    };
  }, [session.user?.role, session.isAuthenticated, authSession?.user?.role]);

  return useMemo(
    () => ({
      ...session,
      ...adminChecks,
      authSession,
    }),
    [session, adminChecks, authSession],
  );
}

/**
 * Hook for cart synchronization with session changes
 * Uses optimized session sync to prevent infinite loops
 */
export function useSessionCartSync() {
  const { isAuthenticated, user } = useOptimizedSessionSync();

  // Memoize cart sync logic
  return useMemo(
    () => ({
      shouldMergeCart: isAuthenticated && !!user,
      userId: user?.id || null,
      isReady: !useSessionLoading(),
    }),
    [isAuthenticated, user, useSessionLoading],
  );
}

// Type exports
export type OptimizedSessionState = ReturnType<typeof useOptimizedSessionSync>;
export type AdminSessionState = ReturnType<typeof useAdminSessionMonitor>;
