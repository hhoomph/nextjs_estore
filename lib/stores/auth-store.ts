/**
 * Authentication Store
 * Manages authentication state using Zustand
 */

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

// Types
export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role?: string;
}

export interface Session {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  user: User;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface AuthActions {
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signOut: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export type AuthStore = AuthState & AuthActions;

// Store implementation
export const useAuthStore = create<AuthStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    user: null,
    session: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,

    // Actions
    setUser: (user: User | null) => {
      set((state) => ({
        user,
        isAuthenticated: !!user,
        error: null, // Clear error when user is set
      }));
    },

    setSession: (session: Session | null) => {
      set((state) => ({
        session,
        user: session?.user || null,
        isAuthenticated: !!session,
        error: null, // Clear error when session is set
      }));
    },

    setLoading: (loading: boolean) => {
      set({ isLoading: loading });
    },

    setError: (error: string | null) => {
      set({ error });
    },

    signOut: () => {
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        error: null,
      });
    },

    updateUser: (updates: Partial<User>) => {
      set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
      }));
    },
  })),
);

// Legacy authStore export for backward compatibility
export const authStore = {
  getState: () => {
    const state = useAuthStore.getState();
    return {
      user: state.user,
      session: state.session,
      isLoading: state.isLoading,
      isAuthenticated: state.isAuthenticated,
      error: state.error,
    };
  },

  setState: (
    updater: Partial<AuthState> | ((state: AuthState) => Partial<AuthState>),
  ) => {
    if (typeof updater === "function") {
      const currentState = useAuthStore.getState();
      const updates = updater({
        user: currentState.user,
        session: currentState.session,
        isLoading: currentState.isLoading,
        isAuthenticated: currentState.isAuthenticated,
        error: currentState.error,
      });

      useAuthStore.setState(updates);
    } else {
      useAuthStore.setState(updater);
    }
  },

  subscribe: (listener: (state: AuthState) => void) => {
    return useAuthStore.subscribe((state) => {
      listener({
        user: state.user,
        session: state.session,
        isLoading: state.isLoading,
        isAuthenticated: state.isAuthenticated,
        error: state.error,
      });
    });
  },

  // Convenience methods
  setUser: (user: User | null) => useAuthStore.getState().setUser(user),
  setSession: (session: Session | null) =>
    useAuthStore.getState().setSession(session),
  setLoading: (loading: boolean) => useAuthStore.getState().setLoading(loading),
  setError: (error: string | null) => useAuthStore.getState().setError(error),
  signOut: () => useAuthStore.getState().signOut(),
  updateUser: (updates: Partial<User>) =>
    useAuthStore.getState().updateUser(updates),
};
