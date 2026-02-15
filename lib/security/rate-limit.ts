/**
 * Module for rate-limit
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { type NextRequest, NextResponse } from "next/server";

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean; // Skip rate limiting for successful requests
  skipFailedRequests?: boolean; // Skip rate limiting for failed requests
}

export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  async check(request: NextRequest): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    headers: Record<string, string>;
  }> {
    const ip = this.getClientIP(request);
    const key = `${request.method}:${request.nextUrl.pathname}:${ip}`;
    const now = Date.now();

    const record = rateLimitStore.get(key);

    // Clean up expired records
    if (record && now > record.resetTime) {
      rateLimitStore.delete(key);
    }

    const currentRecord = rateLimitStore.get(key) || {
      count: 0,
      resetTime: now + this.config.windowMs,
    };

    const remaining = Math.max(
      0,
      this.config.maxRequests - currentRecord.count,
    );
    const allowed = currentRecord.count < this.config.maxRequests;

    const headers = {
      "X-RateLimit-Limit": this.config.maxRequests.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": new Date(currentRecord.resetTime).toISOString(),
      "Retry-After": allowed
        ? "0"
        : Math.ceil((currentRecord.resetTime - now) / 1000).toString(),
    };

    if (allowed) {
      // Increment counter
      rateLimitStore.set(key, {
        count: currentRecord.count + 1,
        resetTime: currentRecord.resetTime,
      });
    }

    return {
      allowed,
      remaining,
      resetTime: currentRecord.resetTime,
      headers,
    };
  }

  private getClientIP(request: NextRequest): string {
    // Try different headers to get the real IP
    const forwarded = request.headers.get("x-forwarded-for");
    const realIP = request.headers.get("x-real-ip");
    const clientIP = request.headers.get("x-client-ip");

    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }
    if (realIP) {
      return realIP;
    }
    if (clientIP) {
      return clientIP;
    }

    // Fallback to a default for localhost/development
    return "127.0.0.1";
  }
}

// Pre-configured rate limiters for different endpoints
export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes for auth endpoints
});

export const apiRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute for general API
});

export const searchRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 searches per minute
});

export const uploadRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 uploads per minute
});

// Middleware function for API routes
export async function withRateLimit(
  request: NextRequest,
  rateLimiter: RateLimiter,
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  const result = await rateLimiter.check(request);

  if (!result.allowed) {
    return NextResponse.json(
      {
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later.",
      },
      {
        status: 429,
        headers: result.headers,
      },
    );
  }

  const response = await handler();

  // Add rate limit headers to successful responses
  Object.entries(result.headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}
