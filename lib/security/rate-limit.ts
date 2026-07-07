/**
 * Rate Limiting Utility
 *
 * Provides a simple in-memory sliding window rate limiter for API routes.
 * In production, consider using a distributed store like Redis.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import { NextResponse } from "next/server";

interface RateLimitEntry {
  /** Timestamps of requests within the current window */
  timestamps: number[];
  /** When this entry was last cleaned up */
  lastCleanup: number;
}

interface RateLimitConfig {
  /** Maximum number of requests allowed within the window */
  maxRequests: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 10_000, // 10 seconds
};

// In-memory store for rate limit entries
const store = new Map<string, RateLimitEntry>();

// Periodic cleanup to prevent memory leaks
const CLEANUP_INTERVAL = 60_000; // 1 minute
let lastGlobalCleanup = Date.now();

/**
 * Performs cleanup of expired entries to prevent memory leaks.
 */
function cleanup(): void {
  const now = Date.now();
  if (now - lastGlobalCleanup < CLEANUP_INTERVAL) return;

  lastGlobalCleanup = now;

  for (const [key, entry] of store.entries()) {
    // Remove entries where all timestamps are outside the window
    const validTimestamps = entry.timestamps.filter(
      (ts) => now - ts < DEFAULT_CONFIG.windowMs,
    );

    if (validTimestamps.length === 0) {
      store.delete(key);
    } else {
      store.set(key, {
        timestamps: validTimestamps,
        lastCleanup: entry.lastCleanup,
      });
    }
  }
}

/**
 * Checks if a request should be rate limited.
 *
 * @param identifier - Unique identifier for the client (e.g., IP address)
 * @param config - Rate limit configuration
 * @returns Object indicating if the request is allowed and remaining quota
 */
export function checkRateLimit(
  identifier: string,
  config: Partial<RateLimitConfig> = {},
): { allowed: boolean; remaining: number; resetInMs: number } {
  const { maxRequests, windowMs } = { ...DEFAULT_CONFIG, ...config };
  const now = Date.now();

  // Run periodic cleanup
  cleanup();

  // Get or create entry for this identifier
  let entry = store.get(identifier);
  if (!entry) {
    entry = { timestamps: [], lastCleanup: now };
    store.set(identifier, entry);
  }

  // Remove timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((ts) => now - ts < windowMs);

  // Check if limit exceeded
  if (entry.timestamps.length >= maxRequests) {
    const oldestTimestamp = entry.timestamps[0];
    const resetInMs = windowMs - (now - oldestTimestamp);

    return {
      allowed: false,
      remaining: 0,
      resetInMs: Math.max(0, resetInMs),
    };
  }

  // Add current request timestamp
  entry.timestamps.push(now);

  return {
    allowed: true,
    remaining: maxRequests - entry.timestamps.length,
    resetInMs: windowMs,
  };
}

/**
 * Higher-order function that wraps an API route handler with rate limiting.
 *
 * @param handler - The API route handler function
 * @param config - Rate limit configuration
 * @returns A wrapped handler that returns 429 on rate limit exceeded
 *
 * @example
 * ```ts
 * import { withRateLimit } from '@/lib/security/rate-limit';
 *
 * export const POST = withRateLimit(async (request) => {
 *   // Your handler logic
 *   return NextResponse.json({ success: true });
 * });
 * ```
 */
export function withRateLimit<T>(
  handler: (request: Request, ...args: any[]) => Promise<NextResponse<T>>,
  config: Partial<RateLimitConfig> = {},
): (request: Request, ...args: any[]) => Promise<NextResponse<T | { error: string; retryAfterMs: number }>> {
  return async (request: Request, ...args: any[]) => {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "anonymous";

    const result = checkRateLimit(ip, config);

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          retryAfterMs: result.resetInMs,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(result.resetInMs / 1000)),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Date.now() + result.resetInMs),
          },
        },
      );
    }

    return handler(request, ...args);
  };
}

/**
 * Resets the rate limit store (useful for testing).
 */
export function resetRateLimitStore(): void {
  store.clear();
  lastGlobalCleanup = Date.now();
}