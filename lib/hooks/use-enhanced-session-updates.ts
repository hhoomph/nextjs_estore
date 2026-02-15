/**
 * Enhanced Hook for Real-Time Session Updates - Optimized
 *
 * Simplified version that eliminates render loops and complex state management.
 *
 * @author hh.oomph@gmail.com
 * @version 2.1.0
 * @since 2025-01-01
 */

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type Session, useSession } from "@/lib/auth-client";
import { useNavbarStore } from "@/lib/stores/navbar-store";

interface EnhancedSessionData {
  cartCount: number;
  wishlistCount: number;
  notifications: Array<{
    id: string;
    type: "cart" | "wishlist" | "order" | "admin";
    message: string;
    timestamp: Date;
  }>;
  adminPrivileges?: {
    canManageUsers: boolean;
    canManageProducts: boolean;
    canViewAnalytics: boolean;
    canManageOrders: boolean;
  };
  lastActivity?: Date;
}

export interface EnhancedSession extends Session {
  realTimeData?: EnhancedSessionData;
  isAdmin?: boolean;
  adminRole?: string | null | undefined;
}

type SyncStatus = "idle" | "syncing" | "synced" | "error";

export function useEnhancedSessionUpdates() {
  const { data: session, isPending } = useSession();
  const { setSessionLoading, setLastSessionUpdate, updateRealTimeData } =
    useNavbarStore();

  // Simplified state management
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Single ref for all timeout management
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized computed values to prevent unnecessary re-computations
  const sessionInfo = useMemo(() => {
    const user = session?.user || null;
    const isAuthenticated = !!user;
    const isAdmin = user?.role === "ADMIN";
    const adminRole = user?.role;

    return {
      user,
      isAuthenticated,
      isAdmin,
      adminRole,
      hasValidSession: !!session && !!session.user && !!session.session,
    };
  }, [session]);

  // Memoized real-time data calculation
  const realTimeData = useMemo((): EnhancedSessionData => {
    return {
      cartCount: 0, // Will be updated by external store subscriptions
      wishlistCount: 0, // Will be updated by external store subscriptions
      notifications: [],
      adminPrivileges: sessionInfo.isAdmin
        ? {
            canManageUsers: true,
            canManageProducts: true,
            canViewAnalytics: true,
            canManageOrders: true,
          }
        : undefined,
      lastActivity: new Date(),
    };
  }, [sessionInfo.isAdmin]);

  // Simplified session change detection
  const hasSessionChanged = useMemo(() => {
    // This is a simple change detector - in real implementation,
    // you'd use a more sophisticated comparison
    return session !== null && !isPending;
  }, [session, isPending]);

  // Simplified session monitoring - single effect
  useEffect(() => {
    if (isPending) {
      setSessionLoading(true);
      setSyncStatus("syncing");
      return;
    }

    setSessionLoading(false);

    if (hasSessionChanged) {
      setSyncStatus("syncing");
      setLastSessionUpdate(new Date());

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Debounced update
      timeoutRef.current = setTimeout(() => {
        try {
          updateRealTimeData(realTimeData);
          setSyncStatus("synced");

          // Auto-clear sync status
          timeoutRef.current = setTimeout(() => {
            setSyncStatus("idle");
          }, 2000);
        } catch (error) {
          console.error("Session update error:", error);
          setSyncStatus("error");
        }
      }, 150);
    }

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    hasSessionChanged,
    isPending,
    realTimeData,
    setSessionLoading,
    setLastSessionUpdate,
    updateRealTimeData,
  ]);

  // Simple refresh function
  const refreshSession = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    setSyncStatus("syncing");

    try {
      // In a real implementation, this would trigger a session refresh
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSyncStatus("synced");
    } catch (error) {
      console.error("Session refresh failed:", error);
      setSyncStatus("error");
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  // Simple clear function
  const clearSession = useCallback(() => {
    setSyncStatus("idle");
    setLastSessionUpdate(new Date());
    updateRealTimeData({
      cartCount: 0,
      wishlistCount: 0,
      notifications: [],
    });
  }, [setLastSessionUpdate, updateRealTimeData]);

  // Create enhanced session object
  const enhancedSession: EnhancedSession | null = session
    ? {
        ...session,
        realTimeData,
        isAdmin: sessionInfo.isAdmin,
        adminRole: sessionInfo.adminRole,
      }
    : null;

  return {
    // Session data
    session: enhancedSession,
    user: sessionInfo.user,
    isAuthenticated: sessionInfo.isAuthenticated,
    isLoading: isPending || isRefreshing,

    // Enhanced features
    syncStatus,
    isGuest: !sessionInfo.isAuthenticated,
    hasValidSession: sessionInfo.hasValidSession,
    isAdmin: sessionInfo.isAdmin,
    adminRole: sessionInfo.adminRole,

    // Actions
    refreshSession,
    clearSession,

    // Additional metadata
    lastUpdate: useNavbarStore.getState().lastSessionUpdate,
    sessionLoading: useNavbarStore.getState().isSessionLoading,
  };
}

// Simplified hook for store updates
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

  const addNotification = useCallback(
    (notification: EnhancedSessionData["notifications"][0]) => {
      updateRealTimeData((prev) => ({
        ...prev,
        notifications: [...(prev.notifications || []), notification],
      }));
    },
    [updateRealTimeData],
  );

  const clearNotifications = useCallback(() => {
    updateRealTimeData((prev) => ({
      ...prev,
      notifications: [],
    }));
  }, [updateRealTimeData]);

  return {
    updateCounts,
    addNotification,
    clearNotifications,
  };
}

// Simplified admin session monitoring
export function useAdminSessionMonitor() {
  const { session, isAdmin, adminRole, syncStatus, isLoading } =
    useEnhancedSessionUpdates();

  // Simple privilege checks
  const canManageUsers =
    isAdmin && (adminRole === "ADMIN" || adminRole === "SUPER_ADMIN");
  const canManageProducts =
    isAdmin && (adminRole === "ADMIN" || adminRole === "SUPER_ADMIN");
  const canViewAnalytics =
    isAdmin && (adminRole === "ADMIN" || adminRole === "SUPER_ADMIN");
  const canManageOrders =
    isAdmin && (adminRole === "ADMIN" || adminRole === "SUPER_ADMIN");

  // Simple session health check
  const isAdminSessionActive = isAdmin && session && !isLoading;
  const adminSessionHealth =
    syncStatus === "synced" && isAdminSessionActive ? "healthy" : "unhealthy";

  return {
    // Admin status
    isAdmin,
    adminRole,
    canManageUsers,
    canManageProducts,
    canViewAnalytics,
    canManageOrders,

    // Session monitoring
    isAdminSessionActive,
    adminSessionHealth,
    syncStatus,
    isLoading,

    // Admin privileges summary
    adminPrivileges: {
      canManageUsers,
      canManageProducts,
      canViewAnalytics,
      canManageOrders,
    },
  };
}
