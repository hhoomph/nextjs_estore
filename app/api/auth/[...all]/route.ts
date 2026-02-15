/**
 * Authentication API Route with Security Enhancements
 *
 * Enhanced with comprehensive security middleware including:
 * - Rate limiting for auth endpoints
 * - Security headers
 * - Request sanitization
 * - CSRF protection
 *
 * @author hh.oomph@gmail.com
 * @version 2.0.0
 * @since 2025-01-01
 */

import { toNextJsHandler } from "better-auth/next-js";
import { type NextRequest, NextResponse } from "next/server";
import {
  createSecureResponse,
  createSecurityMiddleware,
} from "@/app/api/middleware/security";
import { auth } from "@/lib/auth/config";

const { POST: originalPOST, GET: originalGET } = toNextJsHandler(auth);

// Create security middleware for auth endpoints
const applySecurityMiddleware = createSecurityMiddleware({
  rateLimit: true,
  rateLimitType: "auth",
  sanitization: true,
  securityHeaders: true,
  csrf: true, // Enable CSRF for sensitive auth operations
});

// Enhanced POST handler with security
export async function POST(request: NextRequest) {
  try {
    // Apply security middleware
    const securityResult = await applySecurityMiddleware(request);
    if (securityResult) {
      return securityResult;
    }

    // Proceed with original auth handler
    const response = await originalPOST(request);

    // The response from Better Auth is already properly formatted
    // We need to preserve the original response but add security headers
    const responseData = response.clone();
    const data = await responseData.json().catch(() => null);

    return createSecureResponse(data, {
      status: response.status,
      securityHeaders: true,
    });
  } catch (error) {
    console.error("Auth POST error:", error);
    return createSecureResponse(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}

// Enhanced GET handler with security
export async function GET(request: NextRequest) {
  try {
    // Apply security middleware (less strict for GET requests)
    const securityResult = await applySecurityMiddleware(request);
    if (securityResult) {
      return securityResult;
    }

    // Proceed with original auth handler
    const response = await originalGET(request);

    // The response from Better Auth is already properly formatted
    // We need to preserve the original response but add security headers
    const responseData = response.clone();
    const data = await responseData.json().catch(() => null);

    return createSecureResponse(data, {
      status: response.status,
      securityHeaders: true,
    });
  } catch (error) {
    console.error("Auth GET error:", error);
    return createSecureResponse(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}

// Enhanced OPTIONS handler with security headers
export async function OPTIONS(request: NextRequest) {
  const response = new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin":
        process.env.NODE_ENV === "production"
          ? process.env.ALLOWED_ORIGINS || "https://yourdomain.com"
          : "http://localhost:3000",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-CSRF-Token",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "86400", // 24 hours
    },
  });

  // Add additional security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}
