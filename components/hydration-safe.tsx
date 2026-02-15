/**
 * Hydration Safe Wrapper Component
 *
 * Prevents hydration mismatches by ensuring server and client render the same content initially
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

"use client";

import { type ReactNode, useEffect, useState } from "react";

interface HydrationSafeProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

/**
 * Wrapper component that prevents hydration mismatches
 * Renders fallback on server, actual content after hydration
 */
export function HydrationSafe({
  children,
  fallback = null,
  className,
}: HydrationSafeProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return fallback ? <div className={className}>{fallback}</div> : null;
  }

  return <div className={className}>{children}</div>;
}

/**
 * Hook for components that need hydration awareness
 */
export function useHydrationSafe() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

/**
 * Higher-order component for hydration safety
 */
export function withHydrationSafe<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
) {
  const HydrationSafeComponent = (props: P) => (
    <HydrationSafe fallback={fallback}>
      <Component {...props} />
    </HydrationSafe>
  );

  HydrationSafeComponent.displayName = `HydrationSafe(${Component.displayName || Component.name})`;

  return HydrationSafeComponent;
}
