/**
 * Session synchronization store using Zustand
 * Manages real-time session state between guest and authenticated users
 *
 * @author hh.oomph@gmail.com
 * @version 1.1.0
 * @since 2025-01-01
 */

import { useMemo } from "react";
import { create } from "zustand";
import { devtools, persist, subscribeWithSelector } from "zustand/middleware";

// Types for session synchronization
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

export interface SessionState {
  user: SessionUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastSync: Date | null;
  syncStatus: "idle" | "syncing" | "synced" | "error";
  error: string | null;
}

export interface SessionActions {
  setUser: (user: SessionUser | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  updateSyncStatus: (
    status: SessionState["syncStatus"],
    error?: string,
  ) => void;
  syncSession: (user: SessionUser | null) => Promise<void>;
  clearSession: () => void;
  refreshSession: () => Promise<void>;
}

export type SessionStore = SessionState & SessionActions;

// Session sync store with persistence
export const useSessionSyncStore = create<SessionStore>()(
  devtools(
    persist(
      subscribeWithSelector((set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        isLoading: false,
        lastSync: null,
        syncStatus: "idle",
        error: null,

        // Actions
        setUser: (user) => set({ user, lastSync: new Date() }),

        setAuthenticated: (authenticated) =>
          set({ isAuthenticated: authenticated, lastSync: new Date() }),

        setLoading: (loading) => set({ isLoading: loading }),

        updateSyncStatus: (syncStatus, error) =>
          set({ syncStatus, error: error || null, lastSync: new Date() }),

        syncSession: async (user) => {
          const { updateSyncStatus, setUser, setAuthenticated } = get();

          try {
            updateSyncStatus("syncing");

            // Simulate API call delay (replace with actual auth check)
            await new Promise((resolve) => setTimeout(resolve, 100));

            setUser(user);
            setAuthenticated(!!user);
            updateSyncStatus("synced");
          } catch (error) {
            updateSyncStatus(
              "error",
              error instanceof Error ? error.message : "Sync failed",
            );
          }
        },

        clearSession: () =>
          set({
            user: null,
            isAuthenticated: false,
            lastSync: new Date(),
            syncStatus: "idle",
            error: null,
          }),

        refreshSession: async () => {
          const { syncSession, user } = get();

          try {
            // In a real implementation, this would fetch current session from server
            await syncSession(user);
          } catch (error) {
            console.error("Failed to refresh session:", error);
          }
        },
      })),
      {
        name: "session-sync-storage",
        // Only persist certain fields
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          lastSync: state.lastSync,
        }),
      },
    ),
    {
      name: "session-sync-store",
    },
  ),
);

// Selectors for optimized re-renders
export const useSessionUser = () => useSessionSyncStore((state) => state.user);
export const useIsAuthenticated = () =>
  useSessionSyncStore((state) => state.isAuthenticated);
export const useSessionLoading = () =>
  useSessionSyncStore((state) => state.isLoading);
export const useSessionSyncStatus = () =>
  useSessionSyncStore((state) => state.syncStatus);
export const useSessionError = () =>
  useSessionSyncStore((state) => state.error);

// Individual action selectors - each returns a stable reference
export const useSetUser = () => useSessionSyncStore((state) => state.setUser);
export const useSetAuthenticated = () =>
  useSessionSyncStore((state) => state.setAuthenticated);
export const useSetSessionLoading = () =>
  useSessionSyncStore((state) => state.setLoading);
export const useUpdateSyncStatus = () =>
  useSessionSyncStore((state) => state.updateSyncStatus);
export const useSyncSession = () =>
  useSessionSyncStore((state) => state.syncSession);
export const useClearSession = () =>
  useSessionSyncStore((state) => state.clearSession);
export const useRefreshSession = () =>
  useSessionSyncStore((state) => state.refreshSession);

// Combined actions selector - now returns stable references
export const useSessionActions = () => ({
  setUser: useSetUser(),
  setAuthenticated: useSetAuthenticated(),
  setLoading: useSetSessionLoading(),
  updateSyncStatus: useUpdateSyncStatus(),
  syncSession: useSyncSession(),
  clearSession: useClearSession(),
  refreshSession: useRefreshSession(),
});

// State selector that returns the entire session state
export const useSessionState = () => useSessionSyncStore((state) => state);

export default useSessionSyncStore;
