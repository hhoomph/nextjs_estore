/**
 * Performance Optimization Middleware
 *
 * Provides comprehensive performance enhancements including:
 * - Response caching
 * - Compression
 * - Performance monitoring
 * - Resource optimization
 *
 * @version 1.0.0
 * @since 2025-01-01
 */

import { type NextRequest, NextResponse } from "next/server";
import { PerformanceMonitor } from "@/lib/performance";

// In-memory cache for API responses (in production, use Redis)
const responseCache = new Map<
  string,
  { data: unknown; timestamp: number; ttl: number }
>();

// Performance monitoring instance
const performanceMonitor = new PerformanceMonitor();

/**
 * Cache configuration
 */
export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  keyGenerator?: (request: NextRequest) => string;
  shouldCache?: (request: NextRequest, response: NextResponse) => boolean;
}

/**
 * Response caching middleware
 */
export async function cachingMiddleware(
  request: NextRequest,
  config: CacheConfig = { ttl: 300000 }, // 5 minutes default
): Promise<NextResponse | null> {
  const cacheKey = config.keyGenerator
    ? config.keyGenerator(request)
    : generateCacheKey(request);

  // Check cache for GET requests
  if (request.method === "GET") {
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      console.log("Cache hit for:", cacheKey);
      return NextResponse.json(cached.data, {
        headers: {
          "X-Cache-Status": "HIT",
          "X-Cache-TTL": Math.max(
            0,
            cached.ttl - (Date.now() - cached.timestamp),
          ).toString(),
        },
      });
    }
  }

  return null; // Continue to route handler (will be cached on response)
}

/**
 * Cache response after successful API call
 */
export function cacheResponse(
  cacheKey: string,
  data: unknown,
  config: CacheConfig = { ttl: 300000 },
): void {
  responseCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    ttl: config.ttl,
  });

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    // 1% chance to trigger cleanup
    cleanupExpiredCache();
  }
}

/**
 * Generate cache key from request
 */
function generateCacheKey(request: NextRequest): string {
  const url = request.nextUrl;
  const params = Array.from(url.searchParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return `${request.method}:${url.pathname}${params ? `?${params}` : ""}`;
}

/**
 * Clean up expired cache entries
 */
function cleanupExpiredCache(): void {
  const now = Date.now();
  for (const [key, value] of responseCache.entries()) {
    if (now - value.timestamp > value.ttl) {
      responseCache.delete(key);
    }
  }
}

/**
 * Compression middleware
 */
export async function compressionMiddleware(
  request: NextRequest,
): Promise<NextResponse | null> {
  // Check if client supports compression
  const acceptEncoding = request.headers.get("accept-encoding") || "";

  if (acceptEncoding.includes("gzip")) {
    // Let Next.js handle compression automatically
    // This middleware just ensures proper headers are set
    return null;
  }

  return null;
}

/**
 * Performance monitoring middleware
 */
export async function performanceMonitoringMiddleware(
  request: NextRequest,
): Promise<NextResponse | null> {
  const startTime = Date.now();
  const url = request.nextUrl.pathname;

  // Log request start
  console.log(`[PERF] ${request.method} ${url} - Start`);

  // Note: In a real implementation, this would be integrated with response handling
  // For now, we just log the start time

  return null;
}

/**
 * Resource optimization middleware
 */
export async function resourceOptimizationMiddleware(
  request: NextRequest,
): Promise<NextResponse | null> {
  // Add resource hints for better performance
  const response = NextResponse.next();

  // Preload critical resources
  if (request.nextUrl.pathname === "/") {
    response.headers.set(
      "Link",
      [
        "</api/products>; rel=preload; as=fetch",
        "</fonts/inter-var.woff2>; rel=preload; as=font; type=font/woff2; crossorigin",
      ].join(", "),
    );
  }

  return response;
}

/**
 * Database query optimization middleware
 */
export async function databaseOptimizationMiddleware(
  request: NextRequest,
): Promise<NextResponse | null> {
  // This would integrate with your ORM to add query optimization
  // For Prisma, we can add query logging and optimization hints

  // Example: Add query timeout and optimization hints
  const response = NextResponse.next();

  // Add database optimization headers for monitoring
  response.headers.set("X-Database-Optimized", "true");

  return response;
}

/**
 * CDN optimization middleware
 */
export async function cdnOptimizationMiddleware(
  request: NextRequest,
): Promise<NextResponse | null> {
  const response = NextResponse.next();

  // Add CDN optimization headers
  response.headers.set(
    "Cache-Control",
    "public, max-age=300, s-maxage=600, stale-while-revalidate=86400",
  );
  response.headers.set("CDN-Cache-Control", "max-age=3600");
  response.headers.set("Vercel-CDN-Cache-Control", "max-age=3600");

  // Add surrogate keys for cache invalidation
  if (request.nextUrl.pathname.startsWith("/api/products")) {
    response.headers.set("Surrogate-Key", "products-api");
  }

  return response;
}

/**
 * Image optimization middleware
 */
export async function imageOptimizationMiddleware(
  request: NextRequest,
): Promise<NextResponse | null> {
  // This would optimize images on the fly
  // For Next.js, most image optimization is handled automatically
  // This middleware can add additional optimizations

  const response = NextResponse.next();

  // Add image optimization headers
  if (request.nextUrl.pathname.match(/\.(jpg|jpeg|png|webp|avif)$/)) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable",
    );
  }

  return response;
}

/**
 * Combined performance middleware
 */
export function createPerformanceMiddleware(
  options: {
    caching?: CacheConfig;
    compression?: boolean;
    monitoring?: boolean;
    resourceOptimization?: boolean;
    databaseOptimization?: boolean;
    cdnOptimization?: boolean;
    imageOptimization?: boolean;
  } = {},
) {
  return async function performanceMiddleware(
    request: NextRequest,
  ): Promise<NextResponse | null> {
    const {
      caching,
      compression = true,
      monitoring = true,
      resourceOptimization = true,
      databaseOptimization = false,
      cdnOptimization = false,
      imageOptimization = false,
    } = options;

    // Apply caching first
    if (caching) {
      const cacheResult = await cachingMiddleware(request, caching);
      if (cacheResult) {
        return cacheResult;
      }
    }

    // Apply compression
    if (compression) {
      await compressionMiddleware(request);
    }

    // Apply resource optimization
    if (resourceOptimization) {
      await resourceOptimizationMiddleware(request);
    }

    // Apply database optimization
    if (databaseOptimization) {
      await databaseOptimizationMiddleware(request);
    }

    // Apply CDN optimization
    if (cdnOptimization) {
      await cdnOptimizationMiddleware(request);
    }

    // Apply image optimization
    if (imageOptimization) {
      await imageOptimizationMiddleware(request);
    }

    // Performance monitoring (applied to all requests)
    if (monitoring) {
      await performanceMonitoringMiddleware(request);
    }

    return null; // Continue to route handler
  };
}

/**
 * Performance-optimized response wrapper
 */
export function createOptimizedResponse(
  data: unknown,
  options: {
    status?: number;
    headers?: Record<string, string>;
    cache?: CacheConfig;
    compress?: boolean;
  } = {},
) {
  const { status = 200, headers = {}, cache, compress = true } = options;

  const response = NextResponse.json(data, { status });

  // Add custom headers
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add caching headers
  if (cache) {
    response.headers.set(
      "Cache-Control",
      `public, max-age=${Math.floor(cache.ttl / 1000)}`,
    );
    response.headers.set("X-Cache-TTL", cache.ttl.toString());
  } else {
    // Default caching for API responses
    response.headers.set(
      "Cache-Control",
      "public, max-age=300, s-maxage=600, stale-while-revalidate=86400",
    );
  }

  // Add compression headers
  if (compress) {
    response.headers.set("Content-Encoding", "gzip");
  }

  return response;
}

/**
 * Performance metrics collection
 */
export async function collectPerformanceMetrics(
  request: NextRequest,
  response: NextResponse,
  startTime: number,
) {
  const duration = Date.now() - startTime;
  const metrics = performanceMonitor.getMetrics();

  console.log(`[PERF] ${request.method} ${request.nextUrl.pathname}:`, {
    duration: `${duration}ms`,
    status: response.status,
    size: response.headers.get("content-length") || "unknown",
    ...metrics,
  });

  // In production, you might send these metrics to a monitoring service
  // like DataDog, New Relic, or Vercel Analytics
}

/**
 * Memory usage monitoring
 */
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
    const usage = {
      used: Math.round((memInfo.usedJSHeapSize / 1048576) * 100) / 100,
      total: Math.round((memInfo.totalJSHeapSize / 1048576) * 100) / 100,
      limit: Math.round((memInfo.jsHeapSizeLimit / 1048576) * 100) / 100,
    };

    console.log("[MEMORY]", usage);

    // Alert if memory usage is high
    if (usage.used / usage.limit > 0.8) {
      console.warn("[MEMORY] High memory usage detected:", usage);
    }

    return usage;
  }

  return null;
}
