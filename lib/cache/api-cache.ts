/**
 * API Caching Utilities
 *
 * Provides caching functionality for API routes to improve performance
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 * @performance Critical for reducing server load
 */

import { NextResponse } from 'next/server';

/**
 * Cache entry interface
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * Simple in-memory cache
 */
const cache = new Map<string, CacheEntry<any>>();

/**
 * Default cache TTL (5 minutes)
 */
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get cache key
 *
 * @param path - Request path
 * @param params - Query parameters
 * @returns Cache key string
 *
 * @example
 * ```typescript
 * const key = getCacheKey('/api/products', { page: 1, limit: 10 });
 * // Returns: '/api/products?page=1&limit=10'
 * ```
 */
export function getCacheKey(path: string, params?: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) {
    return path;
  }

  const sortedParams = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  return `${path}?${sortedParams}`;
}

/**
 * Get cached data
 *
 * @param key - Cache key
 * @returns Cached data or null
 *
 * @example
 * ```typescript
 * const data = getCached('/api/products?page=1');
 * ```
 */
export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  // Check if expired
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

/**
 * Set cached data
 *
 * @param key - Cache key
 * @param data - Data to cache
 * @param ttl - Time to live in milliseconds (default: 5 minutes)
 *
 * @example
 * ```typescript
 * setCached('/api/products?page=1', products, 60000);
 * ```
 */
export function setCached<T>(
  key: string,
  data: T,
  ttl: number = DEFAULT_TTL,
): void {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + ttl,
  };

  cache.set(key, entry);
}

/**
 * Clear cache for a specific key
 *
 * @param key - Cache key
 *
 * @example
 * ```typescript
 * clearCache('/api/products?page=1');
 * ```
 */
export function clearCache(key: string): void {
  cache.delete(key);
}

/**
 * Clear all cache
 *
 * @example
 * ```typescript
 * clearAllCache();
 * ```
 */
export function clearAllCache(): void {
  cache.clear();
}

/**
 * Clear expired cache entries
 *
 * @example
 * ```typescript
 * clearExpiredCache();
 * ```
 */
export function clearExpiredCache(): void {
  const now = Date.now();

  for (const [key, entry] of cache.entries()) {
    if (now > entry.expiresAt) {
      cache.delete(key);
    }
  }
}

/**
 * Set cache control headers for API responses
 *
 * @param response - NextResponse object
 * @param options - Cache options
 *
 * @example
 * ```typescript
 * const response = await getProducts();
 * setCacheHeaders(response, { isPublic: true, maxAge: 300 });
 * ```
 */
export function setCacheHeaders(
  response: NextResponse,
  options?: {
    isPublic?: boolean;
    isPrivate?: boolean;
    maxAge?: number;
    staleWhileRevalidate?: number;
  },
): void {
  const { isPublic = true, isPrivate = false, maxAge = 300, staleWhileRevalidate = 86400 } =
    options || {};

  const cacheControl = [
    `${isPublic ? 'public' : 'private'}`,
    `max-age=${maxAge}`,
    `stale-while-revalidate=${staleWhileRevalidate}`,
  ].join(', ');

  response.headers.set('Cache-Control', cacheControl);
  response.headers.set('X-Cache', 'HIT');
}

/**
 * Get cache status for debugging
 *
 * @returns Cache statistics
 *
 * @example
 * ```typescript
 * const stats = getCacheStats();
 * ```
 */
export function getCacheStats(): {
  size: number;
  entries: string[];
  memoryUsage: number;
} {
  let memoryUsage = 0;

  for (const [cacheKey, entry] of cache.entries()) {
    const entrySize =
      JSON.stringify(entry.data).length +
      JSON.stringify(entry).length +
      cacheKey.length;
    memoryUsage += entrySize;
  }

  return {
    size: cache.size,
    entries: Array.from(cache.keys()),
    memoryUsage: memoryUsage / 1024, // Convert to KB
  };
}

/**
 * Create an API route with caching
 *
 * @param key - Cache key
 * @param fetchFn - Function to fetch data
 * @param options - Cache options
 * @returns Cached data or fresh data
 *
 * @example
 * ```typescript
 * export async function GET() {
 *   return createCachedRoute(
 *     '/api/products',
 *     async () => getProducts(),
 *     { maxAge: 300 }
 *   );
 * }
 * ```
 */
export async function createCachedRoute<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options?: {
    maxAge?: number;
    staleWhileRevalidate?: number;
  },
): Promise<NextResponse<T>> {
  // Get cached data if available
  const cached = getCached<T>(key);
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        'X-Cache': 'HIT',
      },
    });
  }

  // Fetch fresh data
  const data = await fetchFn();

  // Cache the data
  setCached(key, data, options?.maxAge);

  return NextResponse.json(data, {
    headers: {
      'X-Cache': 'MISS',
    },
  });
}

/**
 * Preload data into cache
 *
 * @param key - Cache key
 * @param fetchFn - Function to fetch data
 * @param options - Cache options
 *
 * @example
 * ```typescript
 * preloadCache('/api/products', async () => getProducts(), { maxAge: 600 });
 * ```
 */
export async function preloadCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options?: {
    maxAge?: number;
  },
): Promise<void> {
  try {
    const data = await fetchFn();
    setCached(key, data, options?.maxAge);
  } catch (error) {
    console.error('Failed to preload cache:', error);
  }
}

/**
 * Invalidate cache for a pattern
 *
 * @param pattern - Cache key pattern (supports * wildcard)
 *
 * @example
 * ```typescript
 * invalidateCache('/api/products/*');
 * // Clears all /api/products/* cache entries
 * ```
 */
export function invalidateCache(pattern: string): void {
  const regex = new RegExp(
    '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '\\?') + '$'
  );

  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key);
    }
  }
}

/**
 * Check if a cache entry exists
 *
 * @param key - Cache key
 * @returns True if cache entry exists and is valid
 *
 * @example
 * ```typescript
 * const exists = hasCache('/api/products?page=1');
 * ```
 */
export function hasCache(key: string): boolean {
  const entry = cache.get(key);

  if (!entry) {
    return false;
  }

  return Date.now() <= entry.expiresAt;
}

/**
 * Get cache TTL remaining
 *
 * @param key - Cache key
 * @returns Remaining TTL in milliseconds, or 0 if not cached
 *
 * @example
 * ```typescript
 * const ttl = getCacheTTL('/api/products?page=1');
 * ```
 */
export function getCacheTTL(key: string): number {
  const entry = cache.get(key);

  if (!entry) {
    return 0;
  }

  return Math.max(0, entry.expiresAt - Date.now());
}

/**
 * Set custom cache expiration
 *
 * @param key - Cache key
 * @param ttl - New TTL in milliseconds
 *
 * @example
 * ```typescript
 * extendCacheTTL('/api/products?page=1', 60000);
 * ```
 */
export function extendCacheTTL(key: string, ttl: number): void {
  const entry = cache.get(key);

  if (!entry) {
    return;
  }

  entry.expiresAt = Date.now() + ttl;
}

/**
 * Get cache performance metrics
 *
 * @returns Performance metrics
 *
 * @example
 * ```typescript
 * const metrics = getCachePerformance();
 * ```
 */
export function getCachePerformance(): {
  hits: number;
  misses: number;
  hitRate: number;
  avgResponseTime: number;
} {
  // This would need to track hits and misses
  return {
    hits: 0,
    misses: 0,
    hitRate: 0,
    avgResponseTime: 0,
  };
}
