/**
 * Module for helpers
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { type NextRequest, NextResponse } from "next/server";
import type { ZodIssue, ZodSchema } from "zod";
import { ZodError } from "zod";
import { auth, isAdmin } from "@/lib/auth/config";
import { API_CONSTANTS } from "@/lib/constants/api";
import { prisma } from "@/lib/database";
import { validateRequestSize } from "@/lib/security/sanitization";
import type { ApiResponse } from "@/types/api/responses";

// Type definitions for API helpers
interface ProductWhereClause {
  status?: number;
  OR?: Array<{
    name?: { contains: string; mode: string };
    desc?: { contains: string; mode: string };
  }>;
  categoryId?: string;
  price?: {
    gte?: number;
    lte?: number;
  };
  quantity?: { gt: number };
}

interface ProductWithPictures {
  id: string;
  name: string | null;
  desc: string | null;
  slug: string | null;
  price: number; // Prisma Decimal converted to number
  discountPrice: number | null; // Prisma Decimal converted to number
  quantity: number;
  categoryId: string | null;
  productPictures: Array<{
    picture: {
      url: string;
    };
  }>;
  createdAt: Date;
}

interface TransformedProduct {
  id: string;
  name: string | null;
  desc: string | null;
  slug: string | null;
  price: number;
  discount_price: number | null;
  quantity: number;
  category?: {
    id: string;
    name: string;
  };
  images: string[];
  inStock: boolean;
  createdAt: Date;
}

interface CachedResult {
  data: TransformedProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error response helper
export function createErrorResponse(
  message: string,
  status: number = 500,
  details?: Record<string, unknown>,
): NextResponse<ApiResponse> {
  const response: ApiResponse = {
    success: false,
    error: message,
  };

  if (details && process.env.NODE_ENV === "development") {
    response.message = JSON.stringify(details);
  }

  return NextResponse.json(response, { status });
}

// Success response helper
export function createSuccessResponse<T>(
  data: T,
  status: number = 200,
  pagination?: ApiResponse["pagination"],
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };

  if (pagination) {
    response.pagination = pagination;
  }

  return NextResponse.json(response, { status });
}

// Authentication helpers
export async function requireAuth(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    throw new Error(API_CONSTANTS.ERRORS.UNAUTHORIZED);
  }
  return session;
}

export async function requireAdmin(request: NextRequest) {
  const session = await requireAuth(request);
  if (!isAdmin(session)) {
    throw new Error(API_CONSTANTS.ERRORS.UNAUTHORIZED);
  }
  return session;
}

// Input validation helper
export async function validateInput<T>(
  request: NextRequest,
  schema: ZodSchema<T>,
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      const zodError = error as ZodError;
      throw new Error(
        `Validation failed: ${zodError.issues.map((e: ZodIssue) => e.message).join(", ")}`,
      );
    }
    throw error;
  }
}

// Pagination helpers
export function parsePaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(
    API_CONSTANTS.MIN_PAGE_SIZE,
    parseInt(searchParams.get("page") || "1", 10) || 1,
  );

  const limit = Math.min(
    API_CONSTANTS.MAX_PAGE_SIZE,
    Math.max(
      API_CONSTANTS.MIN_PAGE_SIZE,
      parseInt(
        searchParams.get("limit") || API_CONSTANTS.DEFAULT_PAGE_SIZE.toString(),
        10,
      ) || API_CONSTANTS.DEFAULT_PAGE_SIZE,
    ),
  );

  return { page, limit, skip: (page - 1) * limit };
}

export function createPaginationInfo(
  total: number,
  page: number,
  limit: number,
) {
  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };
}

// Sorting helpers
export function parseSortParams(searchParams: URLSearchParams) {
  const sortBy =
    searchParams.get("sortBy") || API_CONSTANTS.SORT_FIELDS.CREATED_AT;
  const sortOrder = (searchParams.get("sortOrder") ||
    API_CONSTANTS.SORT_ORDERS.DESC) as "asc" | "desc";

  return { sortBy, sortOrder };
}

export function createOrderBy(sortBy: string, sortOrder: "asc" | "desc") {
  // Map snake_case to camelCase for Prisma compatibility
  const fieldMapping: Record<string, string> = {
    created_at: "createdAt",
    updated_at: "updatedAt",
    category_id: "categoryId",
    product_id: "productId",
    user_id: "userId",
    order_id: "orderId",
    discount_price: "discountPrice",
    phone_number: "phoneNumber",
  };

  const mappedField = fieldMapping[sortBy] || sortBy;
  const orderBy: Record<string, "asc" | "desc"> = {};
  orderBy[mappedField] = sortOrder;
  return orderBy;
}

// Category validation helper
export async function validateCategoryExists(categoryId: string) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true, name: true },
  });

  if (!category) {
    throw new Error(API_CONSTANTS.ERRORS.INVALID_CATEGORY);
  }

  return category;
}

// Request size validation middleware
export function validateRequestSizeMiddleware(request: NextRequest) {
  const contentLength = request.headers.get("content-length");
  if (!validateRequestSize(contentLength)) {
    throw new Error("Request too large");
  }
}

// Generic API handler wrapper with error handling
export function withApiHandler(
  handler: (
    request: NextRequest,
    context?: { params?: Record<string, string> },
  ) => Promise<NextResponse>,
) {
  return async (
    request: NextRequest,
    context?: { params?: Record<string, string> },
  ) => {
    try {
      // Validate request size
      validateRequestSizeMiddleware(request);

      return await handler(request, context);
    } catch (error) {
      console.error("API Error:", error);

      if (error instanceof Error) {
        // Handle known error types
        if (error.message.includes("Validation failed")) {
          return createErrorResponse(error.message, 400);
        }
        if (error.message === API_CONSTANTS.ERRORS.UNAUTHORIZED) {
          return createErrorResponse(error.message, 403);
        }
        if (error.message === API_CONSTANTS.ERRORS.INVALID_CATEGORY) {
          return createErrorResponse(error.message, 400);
        }
        if (error.message === "Request too large") {
          return createErrorResponse("Request entity too large", 413);
        }

        // Generic server error
        return createErrorResponse(API_CONSTANTS.ERRORS.INTERNAL_ERROR, 500);
      }

      // Unknown error
      return createErrorResponse(API_CONSTANTS.ERRORS.INTERNAL_ERROR, 500);
    }
  };
}
