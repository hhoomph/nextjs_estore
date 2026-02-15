/**
 * Navbar Store - Zustand State Management for Navbar State
 *
 * This store manages navbar-specific state including real-time updates,
 * animation states, and session monitoring.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface RealTimeData {
  cartCount: number;
  wishlistCount: number;
  notifications: Array<{
    id: string;
    type: "cart" | "wishlist" | "order" | "admin";
    message: string;
    timestamp: Date;
  }>;
}

interface NavbarState {
  // Session monitoring
  isSessionLoading: boolean;
  lastSessionUpdate: Date | null;
  realTimeData: RealTimeData;

  // Animation states
  animationStates: Record<string, boolean>;

  // Actions
  setSessionLoading: (loading: boolean) => void;
  setLastSessionUpdate: (timestamp: Date) => void;
  updateRealTimeData: (
    data: Partial<RealTimeData> | ((prev: RealTimeData) => RealTimeData),
  ) => void;
  setAnimationState: (key: string, state: boolean) => void;
  resetAnimationStates: () => void;
}

const initialRealTimeData: RealTimeData = {
  cartCount: 0,
  wishlistCount: 0,
  notifications: [],
};

export const useNavbarStore = create<NavbarState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    isSessionLoading: true,
    lastSessionUpdate: null,
    realTimeData: initialRealTimeData,
    animationStates: {},

    // Actions
    setSessionLoading: (loading: boolean) => set({ isSessionLoading: loading }),

    setLastSessionUpdate: (timestamp: Date) =>
      set({ lastSessionUpdate: timestamp }),

    updateRealTimeData: (data) =>
      set((state) => ({
        realTimeData:
          typeof data === "function"
            ? data(state.realTimeData)
            : { ...state.realTimeData, ...data },
      })),

    setAnimationState: (key: string, animationState: boolean) =>
      set((state) => ({
        animationStates: {
          ...state.animationStates,
          [key]: animationState,
        },
      })),

    resetAnimationStates: () => set({ animationStates: {} }),
  })),
);

// Selector hooks for better performance
export const useSessionLoading = () =>
  useNavbarStore((state) => state.isSessionLoading);
export const useLastSessionUpdate = () =>
  useNavbarStore((state) => state.lastSessionUpdate);
export const useRealTimeData = () =>
  useNavbarStore((state) => state.realTimeData);
export const useAnimationStates = () =>
  useNavbarStore((state) => state.animationStates);

// Subscribe to store changes for real-time updates
export const subscribeToNavbarUpdates = (
  callback: (state: NavbarState) => void,
) => {
  return useNavbarStore.subscribe(callback);
};
