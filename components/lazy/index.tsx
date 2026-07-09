/**
 * Lazy-Loaded Component Wrappers
 *
 * Provides dynamic imports for heavy components to optimize initial bundle size.
 * Components are loaded on-demand when they enter the viewport or when needed.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/**
 * Generic factory for creating lazy-loaded components with consistent loading states.
 *
 * @param importFn - Dynamic import function
 * @param loadingText - Text to show while loading
 * @param disableSSR - Whether to disable server-side rendering
 * @returns A lazy-loaded component
 *
 * @example
 * ```tsx
 * const LazyChart = createLazyComponent(
 *   () => import('@/components/charts/revenue-chart'),
 *   'Loading chart...'
 * );
 * ```
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  loadingText = "Loading...",
  disableSSR = false,
): ComponentType<React.ComponentProps<T>> {
  return dynamic(importFn, {
    loading: () => (
      <div className="flex items-center justify-center h-32 bg-muted rounded-lg animate-pulse">
        <span className="text-muted-foreground">{loadingText}</span>
      </div>
    ),
    ssr: !disableSSR,
  });
}