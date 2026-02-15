/**
 * Module for security utilities
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { getRandomValues, randomUUID, subtleDigest } from "../utils/crypto-ssr";

// Rate limiting configuration
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitResult {
  success: boolean;
  limit?: number;
  remaining?: number;
  resetTime?: number;
  message?: string;
}

// In-memory rate limiting store (for production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Export for testing purposes
export { rateLimitStore };

/**
 * Rate limiting middleware
 */
export function createRateLimit(config: RateLimitConfig) {
  return async function rateLimitMiddleware(
    request: NextRequest,
    identifier?: string,
  ): Promise<RateLimitResult> {
    // Get client identifier (IP address or custom identifier)
    const clientId = identifier || getClientIP(request);

    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Get current rate limit data
    let clientData = rateLimitStore.get(clientId);

    // Clean up expired entries
    if (clientData && clientData.resetTime < now) {
      rateLimitStore.delete(clientId);
      clientData = undefined;
    }

    // Initialize if no data exists
    if (!clientData) {
      clientData = {
        count: 0,
        resetTime: now + config.windowMs,
      };
      rateLimitStore.set(clientId, clientData);
    }

    // Check if limit exceeded
    if (clientData.count >= config.maxRequests) {
      return {
        success: false,
        limit: config.maxRequests,
        remaining: 0,
        resetTime: clientData.resetTime,
        message: config.message || "Too many requests, please try again later.",
      };
    }

    // Increment counter
    clientData.count++;
    rateLimitStore.set(clientId, clientData);

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - clientData.count,
      resetTime: clientData.resetTime,
    };
  };
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: NextRequest): string {
  // Try different headers in order of preference
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const clientIP = request.headers.get("x-client-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");

  // Handle forwarded-for which might contain multiple IPs
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return realIP || clientIP || cfConnectingIP || "unknown";
}

/**
 * Input sanitization utilities
 */
export const sanitize = {
  /**
   * Sanitize string input by removing potentially dangerous characters
   */
  string: (
    input: string,
    options: { maxLength?: number; allowHTML?: boolean } = {},
  ): string => {
    if (typeof input !== "string") return "";

    let sanitized = input.trim();

    // Remove null bytes and other control characters
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

    // Apply length limit
    if (options.maxLength && sanitized.length > options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength);
    }

    // Remove HTML tags unless explicitly allowed
    if (!options.allowHTML) {
      sanitized = sanitized.replace(/<[^>]*>/g, "");
    }

    return sanitized;
  },

  /**
   * Sanitize email input
   */
  email: (input: string): string => {
    if (typeof input !== "string") return "";

    const sanitized = input.trim().toLowerCase();

    // Basic email validation and sanitization
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(sanitized)) {
      throw new Error("Invalid email format");
    }

    // Remove potentially dangerous characters
    return sanitized.replace(/[<>'"&]/g, "");
  },

  /**
   * Sanitize numeric input
   */
  number: (
    input: any,
    options: { min?: number; max?: number; default?: number } = {},
  ): number => {
    // Handle empty strings and invalid inputs
    if (input === "" || input === null || input === undefined) {
      return options.default ?? 0;
    }

    const num = Number(input);

    if (isNaN(num)) {
      return options.default ?? 0;
    }

    if (options.min !== undefined && num < options.min) {
      return options.min;
    }

    if (options.max !== undefined && num > options.max) {
      return options.max;
    }

    return num;
  },

  /**
   * Sanitize SQL-like input (remove SQL injection patterns)
   */
  sql: (input: string): string => {
    if (typeof input !== "string") return "";

    // Remove common SQL injection patterns
    return input
      .replace(/[';"\\]/g, "") // Remove quotes and semicolons
      .replace(
        /\b(union|select|insert|update|delete|drop|create|alter|table)\b/gi,
        "",
      ) // Remove SQL keywords
      .replace(/--|#|\/\*/g, "") // Remove SQL comments
      .trim();
  },

  /**
   * Sanitize HTML input (escape dangerous tags)
   */
  html: (input: string): string => {
    if (typeof input !== "string") return "";

    return input
      .replace(/&/g, "&")
      .replace(/</g, "<")
      .replace(/>/g, ">")
      .replace(/"/g, '"')
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  },
};

/**
 * CSRF protection utilities
 */
export const csrf = {
  /**
   * Generate CSRF token
   */
  generateToken: (): string => {
    return randomUUID();
  },

  /**
   * Verify CSRF token
   */
  verifyToken: (token: string, sessionToken: string): boolean => {
    if (!token || !sessionToken) return false;

    // Simple comparison (for production, use proper timing-safe comparison)
    return token === sessionToken;
  },
};

/**
 * Content Security Policy utilities
 */
export const csp = {
  /**
   * Generate CSP header
   */
  generateHeader: (
    options: {
      defaultSrc?: string[];
      scriptSrc?: string[];
      styleSrc?: string[];
      imgSrc?: string[];
      connectSrc?: string[];
      fontSrc?: string[];
      objectSrc?: string[];
      mediaSrc?: string[];
      frameSrc?: string[];
      reportUri?: string;
    } = {},
  ): string => {
    const directives = {
      "default-src": options.defaultSrc || ["'self'"],
      "script-src": options.scriptSrc || [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
      ],
      "style-src": options.styleSrc || ["'self'", "'unsafe-inline'"],
      "img-src": options.imgSrc || ["'self'", "data:", "https:"],
      "connect-src": options.connectSrc || ["'self'"],
      "font-src": options.fontSrc || ["'self'", "https:", "data:"],
      "object-src": options.objectSrc || ["'none'"],
      "media-src": options.mediaSrc || ["'self'"],
      "frame-src": options.frameSrc || ["'none'"],
    };

    const cspString = Object.entries(directives)
      .map(([key, values]) => `${key} ${values.join(" ")}`)
      .join("; ");

    if (options.reportUri) {
      return `${cspString}; report-uri ${options.reportUri}`;
    }

    return cspString;
  },
};

/**
 * Security headers middleware
 */
export function createSecurityHeaders(
  customHeaders: Record<string, string> = {},
) {
  const defaultHeaders = {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Cross-Origin-Embedder-Policy": "credentialless",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    ...customHeaders,
  };

  return defaultHeaders;
}

/**
 * Password security utilities using bcryptjs
 */
export const password = {
  /**
   * Hash a password using bcrypt
   */
  hash: async (password: string): Promise<string> => {
    const bcrypt = await import("bcryptjs");
    const saltRounds = 12; // Industry standard
    return bcrypt.hash(password, saltRounds);
  },

  /**
   * Verify a password against its hash
   */
  verify: async (password: string, hash: string): Promise<boolean> => {
    const bcrypt = await import("bcryptjs");
    return bcrypt.compare(password, hash);
  },

  /**
   * Validate password strength
   */
  validateStrength: (
    pwd: string,
  ): { isValid: boolean; score: number; feedback: string[] } => {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (pwd.length >= 8) score += 25;
    else feedback.push("Password should be at least 8 characters long");

    // Lowercase check
    if (/[a-z]/.test(pwd)) score += 25;
    else feedback.push("Password should contain lowercase letters");

    // Uppercase check
    if (/[A-Z]/.test(pwd)) score += 25;
    else feedback.push("Password should contain uppercase letters");

    // Number check
    if (/\d/.test(pwd)) score += 12.5;
    else feedback.push("Password should contain numbers");

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score += 12.5;
    else feedback.push("Password should contain special characters");

    return {
      isValid: score >= 75,
      score,
      feedback,
    };
  },

  /**
   * Generate secure password
   */
  generateSecure: (length: number = 12): string => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*";

    // Ensure at least one of each type
    let result = "";
    result += upper.charAt(Math.floor(Math.random() * upper.length));
    result += lower.charAt(Math.floor(Math.random() * lower.length));
    result += numbers.charAt(Math.floor(Math.random() * numbers.length));
    result += symbols.charAt(Math.floor(Math.random() * symbols.length));

    // Fill the rest randomly
    const charset = upper + lower + numbers + symbols;
    for (let i = result.length; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    // Shuffle the password
    return result
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  },
};

/**
 * Encryption utilities (basic - for production use proper encryption libraries)
 */
export const encryption = {
  /**
   * Simple hash function (for development only - use proper hashing in production)
   */
  hash: async (input: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await subtleDigest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  },

  /**
   * Generate secure random string
   */
  generateRandomString: (length: number = 32): string => {
    const array = new Uint8Array(length);
    getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  },
};

/**
 * API security middleware
 */
export function createAPISecurityMiddleware(options: {
  rateLimit?: RateLimitConfig;
  requireAuth?: boolean;
  allowedMethods?: string[];
  cors?: {
    origins: string[];
    methods: string[];
    headers: string[];
  };
}) {
  return async function apiSecurityMiddleware(
    request: NextRequest,
    context?: { params?: Record<string, string> },
  ): Promise<NextResponse | null> {
    // Rate limiting
    if (options.rateLimit) {
      const rateLimitResult = await createRateLimit(options.rateLimit)(request);

      if (!rateLimitResult.success) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            message: rateLimitResult.message,
            retryAfter: Math.ceil(
              (rateLimitResult.resetTime! - Date.now()) / 1000,
            ),
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": rateLimitResult.limit!.toString(),
              "X-RateLimit-Remaining": rateLimitResult.remaining!.toString(),
              "X-RateLimit-Reset": rateLimitResult.resetTime!.toString(),
              "Retry-After": Math.ceil(
                (rateLimitResult.resetTime! - Date.now()) / 1000,
              ).toString(),
            },
          },
        );
      }
    }

    // Method validation
    if (
      options.allowedMethods &&
      !options.allowedMethods.includes(request.method)
    ) {
      return NextResponse.json(
        { error: "Method not allowed" },
        { status: 405 },
      );
    }

    // CORS validation
    if (options.cors) {
      const origin = request.headers.get("origin");

      if (origin && !options.cors.origins.includes(origin)) {
        return NextResponse.json(
          { error: "CORS policy violation" },
          { status: 403 },
        );
      }
    }

    // Authentication check (basic - extend based on your auth system)
    if (options.requireAuth) {
      const authHeader = request.headers.get("authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 },
        );
      }
    }

    return null; // Continue to next middleware/route
  };
}
