/**
 * Module for index
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { type NextRequest, NextResponse } from "next/server";

// In-memory cache for development/demo purposes
// In production, use Redis or similar
interface CacheEntry<T = unknown> {
  data: T;
  expiresAt: number;
  createdAt: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();

  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, {
      data,
      expiresAt,
      createdAt: Date.now(),
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // Invalidate entries by pattern
  invalidatePattern(pattern: string): void {
    const keysToDelete: string[] = [];
    for (const [key] of this.cache.entries()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => this.cache.delete(key));
  }
}

// Global cache instance
export const cache = new MemoryCache();

// Cache utilities
export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  key?: string; // Custom cache key
  enabled?: boolean; // Whether caching is enabled
}

// Cache wrapper for API responses
export function withCache<T>(
  handler: (
    request: NextRequest,
    context?: { params?: Record<string, string> },
  ) => Promise<NextResponse<T>>,
  options: CacheOptions = {},
) {
  return async (
    request: NextRequest,
    context?: { params?: Record<string, string> },
  ): Promise<NextResponse<T>> => {
    const {
      ttl = 300, // 5 minutes default
      enabled = true,
      key,
    } = options;

    if (!enabled || request.method !== "GET") {
      return handler(request, context);
    }

    const cacheKey =
      key ||
      generateCacheKey(
        request.url,
        Object.fromEntries(new URL(request.url).searchParams),
        request,
      );

    // Check cache first
    const cachedData = cache.get<T>(cacheKey);
    if (cachedData !== null) {
      console.log(`Cache hit for: ${cacheKey}`);
      return NextResponse.json(cachedData);
    }

    // Execute handler and cache result
    const response = await handler(request, context);

    if (response.ok) {
      try {
        const data = await response.json();
        cache.set(cacheKey, data, ttl);
        console.log(`Cache set for: ${cacheKey}`);

        // Return new response with same data
        return NextResponse.json(data, {
          status: response.status,
          headers: response.headers,
        });
      } catch (error) {
        // If we can't parse the response, just return it
        console.warn("Could not cache response:", error);
      }
    }

    return response;
  };
}

export function generateCacheKey(
  prefix: string,
  params: Record<string, unknown> = {},
  request?: NextRequest,
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce(
      (result, key) => {
        result[key] = params[key];
        return result;
      },
      {} as Record<string, unknown>,
    );

  const paramString = JSON.stringify(sortedParams);
  const userId = request ? getUserIdFromRequest(request) : null;

  return `${prefix}:${userId || "anonymous"}:${btoa(paramString).replace(/[^a-zA-Z0-9]/g, "")}`;
}

function getUserIdFromRequest(request: NextRequest): string | null {
  // Extract user ID from session/auth headers
  // This would need to be implemented based on your auth system
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    // Decode JWT or use session ID
    return "user_" + authHeader.slice(7, 15); // Simplified for demo
  }
  return null;
}

// Database query caching
export class QueryCache {
  private cache = new Map<string, { result: unknown; expiresAt: number }>();

  async cachedQuery<T>(
    key: string,
    queryFn: () => Promise<T>,
    ttlSeconds: number = 300,
  ): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expiresAt) {
      console.log(`Query cache hit: ${key}`);
      return cached.result as T;
    }

    console.log(`Query cache miss: ${key}`);
    const result = await queryFn();
    this.cache.set(key, {
      result,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });

    return result;
  }

  clear(): void {
    this.cache.clear();
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

export const queryCache = new QueryCache();

// Periodic cleanup with proper cleanup
let cleanupInterval: NodeJS.Timeout | null = null;

if (typeof globalThis !== "undefined") {
  cleanupInterval = setInterval(() => {
    cache.cleanup();
  }, 60000); // Clean every minute

  // Cleanup on process exit
  process.on("exit", () => {
    if (cleanupInterval) {
      clearInterval(cleanupInterval);
      cleanupInterval = null;
    }
  });

  process.on("SIGINT", () => {
    if (cleanupInterval) {
      clearInterval(cleanupInterval);
      cleanupInterval = null;
    }
    process.exit();
  });

  process.on("SIGTERM", () => {
    if (cleanupInterval) {
      clearInterval(cleanupInterval);
      cleanupInterval = null;
    }
    process.exit();
  });
}

// Cache invalidation helpers
export function invalidateCache(pattern: string): void {
  // Invalidate memory cache by pattern
  cache.invalidatePattern(pattern);

  // Invalidate query cache
  queryCache.invalidate(pattern);

  console.log(`Cache invalidated for pattern: ${pattern}`);
}

export function invalidateProductCache(productId?: string): void {
  if (productId) {
    invalidateCache(`product:${productId}`);
  } else {
    invalidateCache("products");
    invalidateCache("categories");
  }
}

export function invalidateUserCache(userId?: string): void {
  if (userId) {
    invalidateCache(`user:${userId}`);
  } else {
    invalidateCache("users");
  }
}
