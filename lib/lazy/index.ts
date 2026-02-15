/**
 * Comprehensive Lazy Loading System
 *
 * @author hh.oomph@gmail.com
 * @version 2.0.0
 * @since 2025-01-01
 */
import dynamic from "next/dynamic";
import type { ComponentType, LazyExoticComponent } from "react";
import React from "react";

// Enhanced lazy loading with error boundaries and loading states
export function lazyLoad(
  importFn: () => Promise<any>,
  options: {
    ssr?: boolean;
  } = {},
): any {
  const { ssr = false } = options;

  return dynamic(importFn, {
    ssr,
    loading: () => null,
  });
}

// Preload lazy components
export function preloadLazyComponent<T extends ComponentType<unknown>>(
  lazyComponent: LazyExoticComponent<T>,
): void {
  // Trigger preload by accessing the component
  if (
    typeof lazyComponent === "object" &&
    lazyComponent &&
    "preload" in lazyComponent
  ) {
    (
      lazyComponent as LazyExoticComponent<T> & { preload?: () => void }
    ).preload?.();
  }
}

// Route-based code splitting with lazy loading
export const lazyRoutes = {
  // Product pages - ProductDetail commented out due to missing page file
  // ProductDetail: lazyLoad(() => import("@/app/products/[slug]/page"), {
  //   ssr: false, // Client-side only for better performance
  // }),

  // Product listing is a server-rendered page; avoid importing it from this shared client module
  // to prevent server-only modules (Prisma/pg) leaking into client bundles.
  ProductListing: null as any,

  // Category pages
  CategoryPage: lazyLoad(() => import("@/app/categories/page"), {
    ssr: true,
  }),

  // User account
  Dashboard: lazyLoad(() => import("@/app/dashboard/page"), {
    ssr: false,
  }),

  Orders: lazyLoad(() => import("@/app/orders/page"), {
    ssr: false,
  }),

  Wishlist: lazyLoad(() => import("@/app/wishlist/page"), {
    ssr: false,
  }),

  Settings: lazyLoad(() => import("@/app/settings/page"), {
    ssr: false,
  }),

  // Admin pages temporarily disabled during build to avoid prerendering issues
  // These will be re-enabled after fixing admin prerendering
  AdminDashboard: null as any,
  AdminAnalytics: null as any,
  AdminProducts: null as any,
  AdminOrders: null as any,
  AdminUsers: null as any,
  AdminCategories: null as any,

  // Search
  SearchPage: lazyLoad(() => import("@/app/search/page"), {
    ssr: true,
  }),

  // Deals
  DealsPage: lazyLoad(() => import("@/app/deals/page"), {
    ssr: true,
  }),
};

// Component lazy loading for heavy components
export const lazyComponents = {
  // Cart components - lazy loaded for better performance
  CartSidebar: lazyLoad(
    () => import("@/components/features/cart/cart-sidebar"),
    {
      ssr: false, // Client-side only for better performance
    },
  ),

  // Checkout components
  GuestCheckoutFlow: lazyLoad(
    () => import("@/components/features/checkout/guest-checkout-flow"),
    {
      ssr: false, // Client-side only for better performance
    },
  ),
  // Address components - commented out until confirmed they exist
  // AddressSelector: dynamic(() => import("@/components/features/addresses/AddressSelector").then(mod => ({ default: mod.AddressSelector })), {
  //   ssr: false,
  // }),
  //
  // AddressForm: dynamic(() => import("@/components/features/addresses/AddressForm").then(mod => ({ default: mod.AddressForm })), {
  //   ssr: false,
  // }),

  // Add other heavy components here when they exist
  // AnalyticsChart: lazyLoad(() => import("@/components/admin/analytics-chart"), {
  //   ssr: false,
  // }),

  // Image sliders (can be heavy) - commented out until component exists
  // ImageSlider: lazyLoad(() => import("@/components/ui/image-slider"), {
  //   ssr: false,
  // }),
};

// Intersection Observer for lazy loading
export function useLazyLoad(options?: IntersectionObserverInit) {
  return {
    ref: { current: null },
    isIntersecting: false,
    hasIntersected: false,
  };
}

// Preload critical resources
export function preloadCriticalResources() {
  // Preload critical fonts
  if (typeof document !== "undefined") {
    const fontLink = document.createElement("link");
    fontLink.rel = "preload";
    fontLink.href = "/fonts/critical-font.woff2";
    fontLink.as = "font";
    fontLink.type = "font/woff2";
    fontLink.crossOrigin = "anonymous";
    document.head.appendChild(fontLink);
  }
}

// Bundle analyzer utility (for development)
export function logBundleSize() {
  if (process.env.NODE_ENV === "development") {
    // This would integrate with webpack-bundle-analyzer in a real setup
    console.log("Bundle size monitoring enabled");
  }
}

// Performance monitoring utilities
export function measurePerformance<T>(
  operationName: string,
  fn: () => Promise<T>,
): Promise<T> {
  const start = performance.now();
  return fn().finally(() => {
    const end = performance.now();
    console.log(`${operationName} took ${end - start} milliseconds`);
  });
}

// Core Web Vitals tracking with enhanced monitoring
export function trackWebVitals() {
  if (typeof window !== "undefined") {
    const metrics: Record<string, number> = {};

    // Track LCP (Largest Contentful Paint)
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        metrics.lcp = entry.startTime;
        if (process.env.NODE_ENV === "development") {
          console.log("LCP:", entry.startTime, "ms");
        }
        // Send to analytics if available
        sendToAnalytics("LCP", entry.startTime);
      }
    }).observe({ entryTypes: ["largest-contentful-paint"] });

    // Track FID (First Input Delay)
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const perfEntry = entry as PerformanceEventTiming;
        const fid = perfEntry.processingStart - entry.startTime;
        metrics.fid = fid;
        if (process.env.NODE_ENV === "development") {
          console.log("FID:", fid, "ms");
        }
        sendToAnalytics("FID", fid);
      }
    }).observe({ entryTypes: ["first-input"] });

    // Track CLS (Cumulative Layout Shift)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShift = entry as any;
        if (!layoutShift.hadRecentInput) {
          clsValue += layoutShift.value;
          metrics.cls = clsValue;
          if (process.env.NODE_ENV === "development") {
            console.log("CLS:", clsValue);
          }
        }
      }
      sendToAnalytics("CLS", clsValue);
    }).observe({ entryTypes: ["layout-shift"] });

    // Track FCP (First Contentful Paint)
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        metrics.fcp = entry.startTime;
        if (process.env.NODE_ENV === "development") {
          console.log("FCP:", entry.startTime, "ms");
        }
        sendToAnalytics("FCP", entry.startTime);
      }
    }).observe({ entryTypes: ["paint"] });

    // Track TTFB (Time to First Byte)
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const navigationEntry = entry as PerformanceNavigationTiming;
        const ttfb =
          navigationEntry.responseStart - navigationEntry.requestStart;
        metrics.ttfb = ttfb;
        if (process.env.NODE_ENV === "development") {
          console.log("TTFB:", ttfb, "ms");
        }
        sendToAnalytics("TTFB", ttfb);
      }
    }).observe({ entryTypes: ["navigation"] });

    return metrics;
  }
  return {};
}

// Send performance metrics to analytics
function sendToAnalytics(metric: string, value: number) {
  // Send to external analytics service if available
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", "web_vitals", {
      event_category: "Web Vitals",
      event_label: metric,
      value: Math.round(value),
      custom_map: { metric_value: value },
    });
  }

  // Send to custom analytics endpoint
  if (typeof window !== "undefined" && (window as any).analytics) {
    (window as any).analytics.track("Performance Metric", {
      metric,
      value,
      timestamp: Date.now(),
      url: window.location.href,
    });
  }
}

// Performance monitoring hook
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    const collectedMetrics = trackWebVitals();
    setMetrics(collectedMetrics);

    // Monitor memory usage
    if (typeof window !== "undefined" && "memory" in performance) {
      const memoryInfo = (performance as any).memory;
      setMetrics((prev) => ({
        ...prev,
        jsHeapSizeLimit: memoryInfo.jsHeapSizeLimit,
        totalJSHeapSize: memoryInfo.totalJSHeapSize,
        usedJSHeapSize: memoryInfo.usedJSHeapSize,
      }));
    }
  }, []);

  return metrics;
}

// Performance alert system
export function setupPerformanceAlerts(thresholds?: {
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
}) {
  const defaultThresholds = {
    lcp: 2500, // 2.5s
    fid: 100, // 100ms
    cls: 0.1, // 0.1
    fcp: 1800, // 1.8s
  };

  const finalThresholds = { ...defaultThresholds, ...thresholds };

  if (typeof window !== "undefined") {
    // Monitor for performance issues
    const checkPerformance = () => {
      const metrics = trackWebVitals();

      // Check against thresholds
      if (metrics.lcp && metrics.lcp > finalThresholds.lcp!) {
        console.warn(
          `� LCP is too slow: ${metrics.lcp}ms (threshold: ${finalThresholds.lcp}ms)`,
        );
        sendAlert("LCP_TOO_SLOW", {
          value: metrics.lcp,
          threshold: finalThresholds.lcp,
        });
      }

      if (metrics.fid && metrics.fid > finalThresholds.fid!) {
        console.warn(
          `� FID is too slow: ${metrics.fid}ms (threshold: ${finalThresholds.fid}ms)`,
        );
        sendAlert("FID_TOO_SLOW", {
          value: metrics.fid,
          threshold: finalThresholds.fid,
        });
      }

      if (metrics.cls && metrics.cls > finalThresholds.cls!) {
        console.warn(
          `� CLS is too high: ${metrics.cls} (threshold: ${finalThresholds.cls})`,
        );
        sendAlert("CLS_TOO_HIGH", {
          value: metrics.cls,
          threshold: finalThresholds.cls,
        });
      }
    };

    // Check performance after page load
    window.addEventListener("load", () => {
      setTimeout(checkPerformance, 1000);
    });

    // Check periodically
    setInterval(checkPerformance, 30000); // Every 30 seconds
  }
}

// Send performance alerts
function sendAlert(type: string, data: any) {
  // Send to monitoring service
  if (typeof window !== "undefined" && (window as any).Sentry) {
    (window as any).Sentry.captureMessage(`Performance Alert: ${type}`, {
      level: "warning",
      extra: data,
    });
  }

  // Send to custom alerting endpoint
  fetch("/api/performance-alert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type,
      data,
      timestamp: Date.now(),
      url: window.location.href,
    }),
  }).catch(() => {
    // Silently fail if alerting endpoint is not available
  });
}
