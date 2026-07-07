/**
 * Enhanced Overlay Manager Hook
 *
 * Manages modal, sheet, and dialog overlays with proper z-index stacking,
 * theme awareness, and accessibility features. Prevents overlay conflicts
 * and ensures proper theme transitions.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

"use client";

import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Overlay types supported by the manager
 */
export type OverlayType = "modal" | "sheet" | "drawer" | "tooltip" | "popover";

/**
 * Overlay configuration
 */
export interface OverlayConfig {
  type: OverlayType;
  id: string;
  zIndex?: number;
  themeAware?: boolean;
  backdropBlur?: boolean;
  preventScroll?: boolean;
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
}

/**
 * Overlay state
 */
export interface OverlayState {
  id: string;
  type: OverlayType;
  isOpen: boolean;
  zIndex: number;
  config: OverlayConfig;
}

/**
 * Overlay manager hook return type
 */
export interface OverlayManager {
  // State
  overlays: OverlayState[];
  activeOverlay: OverlayState | null;
  hasOpenOverlays: boolean;

  // Actions
  openOverlay: (config: OverlayConfig) => string;
  closeOverlay: (id: string) => void;
  closeAllOverlays: () => void;
  updateOverlayConfig: (id: string, config: Partial<OverlayConfig>) => void;

  // Theme-aware utilities
  getOverlayClasses: (
    type: OverlayType,
    theme?: "light" | "dark",
  ) => {
    overlay: string;
    content: string;
    backdrop: string;
  };

  // Accessibility
  getAriaAttributes: (id: string) => Record<string, string>;
}

/**
 * Z-index ranges for different overlay types
 */
const Z_INDEX_RANGES = {
  tooltip: { min: 1000, max: 1100 },
  popover: { min: 1100, max: 1200 },
  modal: { min: 1200, max: 1300 },
  sheet: { min: 1300, max: 1400 },
  drawer: { min: 1400, max: 1500 },
} as const;

/**
 * Base z-index for overlays
 */
const BASE_Z_INDEX = 1000;

/**
 * Enhanced Overlay Manager Hook
 */
export function useOverlayManager(): OverlayManager {
  const { theme, resolvedTheme } = useTheme();
  const [overlays, setOverlays] = useState<OverlayState[]>([]);
  const [overlayCounter, setOverlayCounter] = useState(0);
  const bodyScrollLockRef = useRef(false);

  /**
   * Get the current theme
   */
  const currentTheme = (resolvedTheme || theme || "light") as "light" | "dark";

  /**
   * Calculate z-index for overlay type
   */
  const calculateZIndex = useCallback(
    (type: OverlayType, customZIndex?: number): number => {
      if (customZIndex !== undefined) {
        return customZIndex;
      }

      const range = Z_INDEX_RANGES[type];
      if (!range) return BASE_Z_INDEX;

      // Find existing overlays of same type to stack them
      const sameTypeOverlays = overlays.filter(
        (o) => o.type === type && o.isOpen,
      );
      return range.min + sameTypeOverlays.length;
    },
    [overlays],
  );

  /**
   * Manage body scroll lock
   */
  const manageBodyScroll = useCallback(
    (shouldLock: boolean) => {
      if (typeof window === "undefined") return;

      const hasOpenOverlays = overlays.some(
        (o) => o.isOpen && o.config.preventScroll !== false,
      );

      if (shouldLock && hasOpenOverlays && !bodyScrollLockRef.current) {
        document.body.style.overflow = "hidden";
        bodyScrollLockRef.current = true;
      } else if (!shouldLock && !hasOpenOverlays && bodyScrollLockRef.current) {
        document.body.style.overflow = "";
        bodyScrollLockRef.current = false;
      }
    },
    [overlays],
  );

  /**
   * Open a new overlay
   */
  const openOverlay = useCallback(
    (config: OverlayConfig): string => {
      const id = config.id || `overlay-${Date.now()}-${overlayCounter}`;
      const zIndex = calculateZIndex(config.type, config.zIndex);

      const overlayState: OverlayState = {
        id,
        type: config.type,
        isOpen: true,
        zIndex,
        config: {
          themeAware: true,
          backdropBlur: true,
          preventScroll: config.type === "modal" || config.type === "sheet",
          closeOnEscape: true,
          closeOnBackdrop: config.type !== "tooltip",
          ...config,
        },
      };

      setOverlays((prev) => {
        // Close any existing overlays that should be closed when this one opens
        const updated = prev.map((o) => ({
          ...o,
          isOpen:
            o.config.type === "tooltip" || o.config.type === "popover"
              ? o.isOpen
              : false,
        }));

        return [...updated, overlayState];
      });

      setOverlayCounter((prev) => prev + 1);
      manageBodyScroll(true);

      return id;
    },
    [overlayCounter, calculateZIndex, manageBodyScroll],
  );

  /**
   * Close an overlay
   */
  const closeOverlay = useCallback(
    (id: string) => {
      setOverlays((prev) =>
        prev.map((overlay) =>
          overlay.id === id ? { ...overlay, isOpen: false } : overlay,
        ),
      );

      // Remove closed overlay after animation
      setTimeout(() => {
        setOverlays((prev) => prev.filter((overlay) => overlay.id !== id));
      }, 300); // Match animation duration

      manageBodyScroll(false);
    },
    [manageBodyScroll],
  );

  /**
   * Close all overlays
   */
  const closeAllOverlays = useCallback(() => {
    setOverlays((prev) =>
      prev.map((overlay) => ({ ...overlay, isOpen: false })),
    );

    setTimeout(() => {
      setOverlays([]);
    }, 300);

    manageBodyScroll(false);
  }, [manageBodyScroll]);

  /**
   * Update overlay configuration
   */
  const updateOverlayConfig = useCallback(
    (id: string, config: Partial<OverlayConfig>) => {
      setOverlays((prev) =>
        prev.map((overlay) =>
          overlay.id === id
            ? {
                ...overlay,
                config: { ...overlay.config, ...config },
                zIndex:
                  config.zIndex !== undefined ? config.zIndex : overlay.zIndex,
              }
            : overlay,
        ),
      );
    },
    [],
  );

  /**
   * Get theme-aware CSS classes for overlays
   */
  const getOverlayClasses = useCallback(
    (type: OverlayType, theme?: "light" | "dark") => {
      const activeTheme = theme || currentTheme;

      const baseClasses = {
        overlay: "fixed inset-0 z-50",
        content: "relative z-50",
        backdrop: "absolute inset-0",
      };

      // Theme-specific classes
      const themeClasses = {
        light: {
          overlay: "bg-background/40",
          content: "bg-card text-card-foreground border border-border shadow-xl",
          backdrop: "bg-background/60 backdrop-blur-md",
        },
        dark: {
          overlay: "bg-background/60",
          content: "bg-card text-card-foreground border border-border shadow-2xl",
          backdrop: "bg-background/80 backdrop-blur-md",
        },
      };

      // Type-specific customizations
      const typeCustomizations = {
        modal: {
          overlay: "flex items-center justify-center p-4",
          content: "max-w-md w-full rounded-lg",
        },
        sheet: {
          overlay: "",
          content: "h-full",
        },
        drawer: {
          overlay: "",
          content: "h-full",
        },
        tooltip: {
          overlay: "p-2",
          content: "rounded-md text-sm max-w-xs",
        },
        popover: {
          overlay: "p-2",
          content: "rounded-md shadow-lg",
        },
      };

      const themeSpecific = themeClasses[activeTheme];
      const typeSpecific = typeCustomizations[type];

      return {
        overlay: `${baseClasses.overlay} ${themeSpecific.overlay} ${typeSpecific.overlay}`,
        content: `${baseClasses.content} ${themeSpecific.content} ${typeSpecific.content}`,
        backdrop: `${baseClasses.backdrop} ${themeSpecific.backdrop}`,
      };
    },
    [currentTheme],
  );

  /**
   * Get ARIA attributes for accessibility
   */
  const getAriaAttributes = useCallback(
    (id: string): Record<string, string> => {
      const overlay = overlays.find((o) => o.id === id);
      if (!overlay) return {};

      return {
        "aria-modal": "true",
        "aria-labelledby": `${id}-title`,
        "aria-describedby": `${id}-description`,
        role: overlay.type === "modal" ? "dialog" : "region",
      };
    },
    [overlays],
  );

  /**
   * Handle escape key
   */
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        const openOverlays = overlays.filter(
          (o) => o.isOpen && o.config.closeOnEscape !== false,
        );
        if (openOverlays.length > 0) {
          // Close the topmost overlay
          const topOverlay = openOverlays.sort(
            (a, b) => b.zIndex - a.zIndex,
          )[0];
          closeOverlay(topOverlay.id);
        }
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [overlays, closeOverlay]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (bodyScrollLockRef.current && typeof window !== "undefined") {
        document.body.style.overflow = "";
      }
    };
  }, []);

  // Computed values
  const activeOverlay =
    overlays.filter((o) => o.isOpen).sort((a, b) => b.zIndex - a.zIndex)[0] ||
    null;

  const hasOpenOverlays = overlays.some((o) => o.isOpen);

  return {
    overlays,
    activeOverlay,
    hasOpenOverlays,
    openOverlay,
    closeOverlay,
    closeAllOverlays,
    updateOverlayConfig,
    getOverlayClasses,
    getAriaAttributes,
  };
}

/**
 * Hook for managing cart sidebar specifically
 */
export function useCartOverlay() {
  const overlayManager = useOverlayManager();

  const openCartSidebar = useCallback(() => {
    return overlayManager.openOverlay({
      type: "sheet",
      id: "cart-sidebar",
      themeAware: true,
      backdropBlur: true,
      preventScroll: true,
      closeOnEscape: true,
      closeOnBackdrop: true,
    });
  }, [overlayManager]);

  const closeCartSidebar = useCallback(() => {
    overlayManager.closeOverlay("cart-sidebar");
  }, [overlayManager]);

  const isCartOpen = overlayManager.overlays.some(
    (o) => o.id === "cart-sidebar" && o.isOpen,
  );

  return {
    ...overlayManager,
    openCartSidebar,
    closeCartSidebar,
    isCartOpen,
  };
}

/**
 * Hook for modal overlays
 */
export function useModalOverlay() {
  const overlayManager = useOverlayManager();

  const openModal = useCallback(
    (id: string, config?: Partial<OverlayConfig>) => {
      return overlayManager.openOverlay({
        type: "modal",
        id,
        themeAware: true,
        backdropBlur: true,
        preventScroll: true,
        closeOnEscape: true,
        closeOnBackdrop: true,
        ...config,
      });
    },
    [overlayManager],
  );

  return {
    ...overlayManager,
    openModal,
  };
}

/**
 * Utility function to ensure proper z-index stacking
 */
export function ensureProperZIndex() {
  if (typeof window === "undefined") return;

  // Ensure modal roots have proper z-index
  const modalRoots = document.querySelectorAll("[data-radix-portal]");
  modalRoots.forEach((root, index) => {
    const element = root as HTMLElement;
    const baseZIndex = BASE_Z_INDEX + index * 100;
    element.style.zIndex = baseZIndex.toString();
  });
}

/**
 * Initialize overlay system on app start
 */
export function initializeOverlaySystem() {
  if (typeof window === "undefined") return;

  // Ensure proper z-index on mount
  ensureProperZIndex();

  // Listen for theme changes to update overlays
  const observer = new MutationObserver(ensureProperZIndex);
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"],
    subtree: false,
  });

  return () => observer.disconnect();
}

export default useOverlayManager;
