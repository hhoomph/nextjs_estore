/**
 * Module for index
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import type { NextConfig } from "next";

// Performance monitoring and optimization utilities
export interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
  fcp?: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== "undefined") {
      this.initObservers();
    }
  }

  private initObservers() {
    // Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.startTime;
        console.log("LCP:", this.metrics.lcp);
      });
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
      this.observers.push(lcpObserver);
    } catch (e) {
      console.warn("LCP observer not supported");
    }

    // First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const perfEntry = entry as PerformanceEventTiming;
          this.metrics.fid = perfEntry.processingStart - entry.startTime;
          console.log("FID:", this.metrics.fid);
        }
      });
      fidObserver.observe({ entryTypes: ["first-input"] });
      this.observers.push(fidObserver);
    } catch (e) {
      console.warn("FID observer not supported");
    }

    // Cumulative Layout Shift
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as any; // LayoutShift type not available
          if (!layoutShift.hadRecentInput) {
            clsValue += layoutShift.value;
          }
        }
        this.metrics.cls = clsValue;
        console.log("CLS:", this.metrics.cls);
      });
      clsObserver.observe({ entryTypes: ["layout-shift"] });
      this.observers.push(clsObserver);
    } catch (e) {
      console.warn("CLS observer not supported");
    }

    // Time to First Byte
    try {
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const navEntry = entry as PerformanceNavigationTiming;
          if (navEntry.responseStart) {
            this.metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
            console.log("TTFB:", this.metrics.ttfb);
          }
        }
      });
      navigationObserver.observe({ entryTypes: ["navigation"] });
      this.observers.push(navigationObserver);
    } catch (e) {
      console.warn("Navigation observer not supported");
    }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  destroy() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

// Image optimization utilities
export function getOptimizedImageUrl(
  src: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "webp" | "avif" | "jpg" | "png";
  } = {},
): string {
  const { width, height, quality = 80, format = "webp" } = options;

  // In a real implementation, this would use a CDN like Cloudinary, ImageKit, or Vercel
  // For now, we'll use Next.js built-in optimization
  const params = new URLSearchParams();
  if (width) params.set("w", width.toString());
  if (height) params.set("h", height.toString());
  if (quality) params.set("q", quality.toString());
  if (format) params.set("f", format);

  const separator = src.includes("?") ? "&" : "?";
  return `${src}${separator}${params.toString()}`;
}

// Font optimization
export function optimizeFonts() {
  // Preload critical fonts
  if (typeof document !== "undefined") {
    const fontLink = document.createElement("link");
    fontLink.rel = "preload";
    fontLink.href = "/fonts/inter-var.woff2";
    fontLink.as = "font";
    fontLink.type = "font/woff2";
    fontLink.crossOrigin = "anonymous";
    document.head.appendChild(fontLink);
  }
}

// Bundle analysis
export function logBundleAnalysis() {
  if (process.env.NODE_ENV === "development") {
    // In a real implementation, this would integrate with webpack-bundle-analyzer
    console.log("Bundle analysis enabled");
  }
}

// Memory usage monitoring
export function monitorMemoryUsage() {
  if (typeof performance !== "undefined" && "memory" in performance) {
    const perfWithMemory = performance as typeof performance & {
      memory: {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
      };
    };
    const memInfo = perfWithMemory.memory;
    console.log("Memory Usage:", {
      used: Math.round((memInfo.usedJSHeapSize / 1048576) * 100) / 100 + " MB",
      total:
        Math.round((memInfo.totalJSHeapSize / 1048576) * 100) / 100 + " MB",
      limit:
        Math.round((memInfo.jsHeapSizeLimit / 1048576) * 100) / 100 + " MB",
    });
  }
}

// Network monitoring
export function monitorNetworkRequests() {
  if (typeof window !== "undefined" && "PerformanceObserver" in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resourceEntry = entry as PerformanceResourceTiming;
          if (resourceEntry.transferSize > 0) {
            console.log("Network Request:", {
              url: entry.name,
              size: Math.round(resourceEntry.transferSize / 1024) + " KB",
              duration: Math.round(entry.duration) + "ms",
            });
          }
        }
      });
      observer.observe({ entryTypes: ["resource"] });
    } catch (e) {
      console.warn("Network monitoring not supported");
    }
  }
}

// Performance budget checking
export function checkPerformanceBudget(metrics: PerformanceMetrics) {
  const budgets = {
    lcp: 2500, // 2.5s
    fid: 100, // 100ms
    cls: 0.1, // 0.1
  };

  const violations = [];

  if (metrics.lcp && metrics.lcp > budgets.lcp) {
    violations.push(
      `LCP too high: ${metrics.lcp}ms (budget: ${budgets.lcp}ms)`,
    );
  }

  if (metrics.fid && metrics.fid > budgets.fid) {
    violations.push(
      `FID too high: ${metrics.fid}ms (budget: ${budgets.fid}ms)`,
    );
  }

  if (metrics.cls && metrics.cls > budgets.cls) {
    violations.push(`CLS too high: ${metrics.cls} (budget: ${budgets.cls})`);
  }

  if (violations.length > 0) {
    console.warn("Performance budget violations:", violations);
  }

  return violations;
}

// Next.js configuration for performance
export function createOptimizedNextConfig(
  baseConfig: NextConfig = {},
): NextConfig {
  return {
    ...baseConfig,

    // Image optimization
    images: {
      ...baseConfig.images,
      formats: ["image/webp", "image/avif"],
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
      minimumCacheTTL: 60,
    },

    // Compression
    compress: true,

    // Bundle analysis
    webpack: (config, options) => {
      const { dev, isServer } = options;

      // Bundle analyzer (only in development)
      if (!dev && !isServer) {
        // In a real implementation, this would add bundle analyzer
        console.log("Bundle analysis available in production build");
      }

      // Existing webpack config
      if (baseConfig.webpack) {
        return baseConfig.webpack(config, options);
      }

      return config;
    },

    // Headers for performance
    async headers() {
      return [
        {
          source: "/(.*)",
          headers: [
            {
              key: "X-Content-Type-Options",
              value: "nosniff",
            },
            {
              key: "X-Frame-Options",
              value: "DENY",
            },
            {
              key: "X-XSS-Protection",
              value: "1; mode=block",
            },
          ],
        },
        {
          source: "/api/(.*)",
          headers: [
            {
              key: "Cache-Control",
              value:
                "public, max-age=300, s-maxage=600, stale-while-revalidate=86400",
            },
          ],
        },
        {
          source: "/_next/static/(.*)",
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=31536000, immutable",
            },
          ],
        },
      ];
    },

    // Experimental features for performance
    experimental: {
      ...baseConfig.experimental,
      optimizeCss: true,
      scrollRestoration: true,
    },

    // Output optimization - respect the base config setting
    ...(baseConfig.output ? { output: baseConfig.output } : {}),
    poweredByHeader: false,
  };
}

// Hydration optimization
export function optimizeHydration() {
  // Defer non-critical JavaScript
  if (typeof document !== "undefined") {
    const scripts = document.querySelectorAll('script[data-hydrate="defer"]');
    scripts.forEach((script) => {
      const newScript = document.createElement("script");
      newScript.src = (script as HTMLScriptElement).src;
      newScript.defer = true;
      document.head.appendChild(newScript);
      script.remove();
    });
  }
}
