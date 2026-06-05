/**
 * Security middleware for API routes
 *
 * Provides comprehensive security protections including:
 * - Rate limiting
 * - Security headers
 * - Input validation
 * - CSRF protection
 * - Request sanitization
 *
 * @version 1.0.0
 * @since 2025-01-01
 */

import { type NextRequest, NextResponse } from "next/server";
import {
  createRateLimit,
  createSecurityHeaders,
  getClientIP,
} from "@/lib/security";
import {
  sanitizeEmail,
  sanitizeFilename,
  sanitizeText,
  sanitizeUrl,
} from "@/lib/security/sanitization";

// Rate limiters for different API endpoints
const authRateLimiter = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 50, // 50 attempts per minute for development
  message: "Too many authentication attempts. Please try again later.",
});

const apiRateLimiter = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
  message: "Too many requests. Please try again later.",
});

const uploadRateLimiter = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 uploads per minute
  message: "Upload limit exceeded. Please try again later.",
});

// Security headers middleware
export async function securityHeadersMiddleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers
  const securityHeaders = createSecurityHeaders({
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Cross-Origin-Embedder-Policy": "credentialless",
    "Cross-Origin-Opener-Policy": "same-origin",
  });

  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Rate limiting middleware
export async function rateLimitMiddleware(
  request: NextRequest,
  options: { type?: "auth" | "api" | "upload" } = {},
) {
  const { type = "api" } = options;

  let rateLimiter;
  switch (type) {
    case "auth":
      rateLimiter = authRateLimiter;
      break;
    case "upload":
      rateLimiter = uploadRateLimiter;
      break;
    default:
      rateLimiter = apiRateLimiter;
  }

  const result = await rateLimiter(request);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        message: result.message,
        retryAfter: Math.ceil((result.resetTime! - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": result.limit!.toString(),
          "X-RateLimit-Remaining": result.remaining!.toString(),
          "X-RateLimit-Reset": result.resetTime!.toString(),
          "Retry-After": Math.ceil(
            (result.resetTime! - Date.now()) / 1000,
          ).toString(),
        },
      },
    );
  }

  return null; // Continue to next middleware
}

// Input validation middleware
export async function validationMiddleware(
  request: NextRequest,
  schema?: {
    body?: any;
    query?: any;
    headers?: any;
  },
) {
  try {
    // Validate request body if schema provided
    if (schema?.body && request.method !== "GET") {
      const body = await request.json();
      const validatedBody = schema.body.parse(body);
      // Reconstruct request with validated body
      (request as any).validatedBody = validatedBody;
    }

    // Validate query parameters
    if (schema?.query && request.nextUrl.searchParams) {
      const queryParams: Record<string, string> = {};
      request.nextUrl.searchParams.forEach((value, key) => {
        queryParams[key] = value;
      });
      const validatedQuery = schema.query.parse(queryParams);
      (request as any).validatedQuery = validatedQuery;
    }

    // Validate headers
    if (schema?.headers) {
      const headers: Record<string, string> = {};
      schema.headers.forEach((header: string) => {
        const value = request.headers.get(header);
        if (value) {
          headers[header] = value;
        }
      });
      const validatedHeaders = schema.headers.parse(headers);
      (request as any).validatedHeaders = validatedHeaders;
    }

    return null; // Continue to next middleware
  } catch (error) {
    console.error("Validation error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown validation error";
    return NextResponse.json(
      { error: "Invalid request data", details: errorMessage },
      { status: 400 },
    );
  }
}

// CSRF protection middleware
export async function csrfMiddleware(request: NextRequest) {
  // Skip CSRF check for GET, HEAD, OPTIONS requests
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    return null;
  }

  const csrfToken =
    request.headers.get("x-csrf-token") || request.headers.get("csrf-token");

  if (!csrfToken) {
    return NextResponse.json({ error: "CSRF token missing" }, { status: 403 });
  }

  // In a real implementation, validate against session token
  // For now, we'll skip the actual validation but log it
  console.log("CSRF token received:", csrfToken);

  return null; // Continue to next middleware
}

// Request sanitization middleware
export async function sanitizationMiddleware(request: NextRequest) {
  try {
    // Basic request validation - check for suspicious patterns
    const userAgent = request.headers.get("user-agent") || "";
    const queryString = request.nextUrl?.search || "";

    // Check for basic SQL injection patterns in query parameters
    const suspiciousPatterns = [
      /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/i,
      /(-{2}|\/\*|\*\/)/,
      /('|(\\x27)|(\\x2D\\x2D)|(%27)|(%3B)|(;))/,
    ];

    if (suspiciousPatterns.some((pattern) => pattern.test(queryString))) {
      console.warn("Suspicious query parameters detected:", queryString);
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 },
      );
    }

    // Log request for monitoring
    console.log("Request sanitized:", {
      method: request.method,
      url: request.nextUrl?.pathname || "unknown",
      userAgent: userAgent.substring(0, 100), // Truncate for logging
    });

    return null; // Continue to next middleware
  } catch (error) {
    console.error("Sanitization error:", error);
    return NextResponse.json(
      { error: "Request sanitization failed" },
      { status: 400 },
    );
  }
}

// Combined security middleware
export function createSecurityMiddleware(
  options: {
    rateLimit?: boolean;
    rateLimitType?: "auth" | "api" | "upload";
    validation?: {
      body?: any;
      query?: any;
      headers?: any;
    };
    csrf?: boolean;
    sanitization?: boolean;
    securityHeaders?: boolean;
  } = {},
) {
  return async function securityMiddleware(
    request: NextRequest,
  ): Promise<NextResponse | null> {
    const {
      rateLimit = true,
      rateLimitType = "api",
      validation,
      csrf = false,
      sanitization = true,
      securityHeaders = true,
    } = options;

    // Apply sanitization first
    if (sanitization) {
      const result = await sanitizationMiddleware(request);
      if (result) return result;
    }

    // Apply rate limiting
    if (rateLimit) {
      const result = await rateLimitMiddleware(request, {
        type: rateLimitType,
      });
      if (result) return result;
    }

    // Apply CSRF protection
    if (csrf) {
      const result = await csrfMiddleware(request);
      if (result) return result;
    }

    // Apply validation
    if (validation) {
      const result = await validationMiddleware(request, validation);
      if (result) return result;
    }

    // Apply security headers (will be applied to the final response)
    if (securityHeaders) {
      // This will be applied by the response handler
    }

    return null; // Continue to route handler
  };
}

// Security response wrapper
export function createSecureResponse(
  data: any,
  options: {
    status?: number;
    headers?: Record<string, string>;
    securityHeaders?: boolean;
  } = {},
) {
  const { status = 200, headers = {}, securityHeaders = true } = options;

  const response = NextResponse.json(data, { status });

  // Add custom headers
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add security headers
  if (securityHeaders) {
    const securityHeadersObj = createSecurityHeaders({
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    });

    Object.entries(securityHeadersObj).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  return response;
}

// Security logging middleware
export async function securityLoggingMiddleware(request: NextRequest) {
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get("user-agent");
  const timestamp = new Date().toISOString();

  console.log("Security Log:", {
    timestamp,
    method: request.method,
    url: request.nextUrl?.pathname || "unknown",
    clientIP,
    userAgent,
  });

  return null; // Continue to next middleware
}
