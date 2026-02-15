/**
 * Overlay Provider Component
 *
 * Initializes the overlay management system for the entire application.
 * Ensures proper z-index stacking and theme-aware overlay behavior.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

"use client";

import { useEffect } from "react";
import { initializeOverlaySystem } from "@/lib/hooks/use-overlay-manager";

/**
 * Overlay Provider Component
 *
 * This component initializes the overlay management system when the app mounts.
 * It should be placed high in the component tree, typically inside the theme provider.
 */
export function OverlayProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize the overlay system
    const cleanup = initializeOverlaySystem();

    // Cleanup on unmount
    return cleanup;
  }, []);

  return <>{children}</>;
}

export default OverlayProvider;
