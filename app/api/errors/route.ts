/**
 * Error Reporting API Route
 *
 * Handles error reporting from client-side error boundaries
 * and logs errors for monitoring and debugging.
 *
 * @version 1.0.0
 * @since 2025-01-01
 */

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Error report schema
const errorReportSchema = z.object({
  message: z.string(),
  stack: z.string().optional(),
  componentStack: z.string().optional(),
  timestamp: z.string(),
  userAgent: z.string(),
  url: z.string(),
  retryCount: z.number().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  locale: z.string().optional(),
  additionalData: z.record(z.string(), z.any()).optional(),
});

type ErrorReport = z.infer<typeof errorReportSchema>;

/**
 * POST /api/errors - Report client-side errors
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the error report
    const validationResult = errorReportSchema.safeParse(body);

    if (!validationResult.success) {
      console.error("Invalid error report:", validationResult.error);
      return NextResponse.json(
        { error: "Invalid error report format" },
        { status: 400 },
      );
    }

    const errorReport: ErrorReport = validationResult.data;

    // Log the error with structured data
    console.error("Client Error Report:", {
      message: errorReport.message,
      stack: errorReport.stack,
      componentStack: errorReport.componentStack,
      timestamp: errorReport.timestamp,
      userAgent: errorReport.userAgent,
      url: errorReport.url,
      retryCount: errorReport.retryCount || 0,
      userId: errorReport.userId || "anonymous",
      sessionId: errorReport.sessionId || "unknown",
      locale: errorReport.locale || "unknown",
      additionalData: errorReport.additionalData,
    });

    // In a production environment, you would:
    // 1. Store errors in a database for analysis
    // 2. Send alerts for critical errors
    // 3. Aggregate error metrics
    // 4. Integrate with error monitoring services (Sentry, LogRocket, etc.)

    // Example: Store in database (uncomment when database is set up)
    /*
    try {
      await prisma.errorReport.create({
        data: {
          message: errorReport.message,
          stack: errorReport.stack,
          componentStack: errorReport.componentStack,
          timestamp: new Date(errorReport.timestamp),
          userAgent: errorReport.userAgent,
          url: errorReport.url,
          retryCount: errorReport.retryCount || 0,
          userId: errorReport.userId,
          sessionId: errorReport.sessionId,
          locale: errorReport.locale,
          additionalData: errorReport.additionalData,
        },
      });
    } catch (dbError) {
      console.error("Failed to store error report in database:", dbError);
    }
    */

    // Example: Send critical errors to monitoring service
    if (isCriticalError(errorReport)) {
      // Send alert to monitoring service
      console.error("🚨 CRITICAL ERROR DETECTED:", errorReport.message);
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Error report received",
        reportId: generateReportId(),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error processing error report:", error);
    return NextResponse.json(
      { error: "Failed to process error report" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/errors - Retrieve error reports (admin only)
 * This would typically require authentication and admin privileges
 */
export async function GET(request: NextRequest) {
  try {
    // In a real implementation, you would:
    // 1. Check authentication and admin privileges
    // 2. Query error reports from database
    // 3. Apply filtering and pagination

    // For now, return a placeholder response
    return NextResponse.json({
      errors: [],
      message:
        "Error reporting endpoint - authentication required for admin access",
    });
  } catch (error) {
    console.error("Error retrieving error reports:", error);
    return NextResponse.json(
      { error: "Failed to retrieve error reports" },
      { status: 500 },
    );
  }
}

/**
 * Determine if an error is critical and should trigger alerts
 */
function isCriticalError(errorReport: ErrorReport): boolean {
  const criticalPatterns = [
    /TypeError: Cannot read propert/i,
    /TypeError: Cannot set propert/i,
    /ReferenceError/i,
    /SyntaxError/i,
    /RangeError/i,
    /database connection/i,
    /authentication failed/i,
    /payment.*error/i,
  ];

  return criticalPatterns.some(
    (pattern) =>
      pattern.test(errorReport.message) ||
      (errorReport.stack && pattern.test(errorReport.stack)),
  );
}

/**
 * Generate a unique report ID for tracking
 */
function generateReportId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `err_${timestamp}_${random}`;
}

/**
 * Rate limiting for error reporting (basic implementation)
 * In production, use a more robust solution like Redis or Upstash
 */
const errorReports = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(
  identifier: string,
  maxRequests = 10,
  windowMs = 60000,
): boolean {
  const now = Date.now();
  const userLimit = errorReports.get(identifier);

  if (!userLimit || now > userLimit.resetTime) {
    errorReports.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
}
