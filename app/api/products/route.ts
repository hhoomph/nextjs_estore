/**
 * Products API Route with Security Enhancements
 *
 * Enhanced with comprehensive security middleware including:
 * - Rate limiting for API endpoints
 * - Security headers
 * - Request sanitization
 * - Input validation
 *
 * @author hh.oomph@gmail.com
 * @version 2.0.0
 * @since 2025-01-01
 */

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  cacheResponse,
  createPerformanceMiddleware,
} from "@/app/api/middleware/performance";
import {
  createSecureResponse,
  createSecurityMiddleware,
} from "@/app/api/middleware/security";
import prisma from "@/lib/prisma";

// Validation schemas
const getProductsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 12)),
  category: z.string().optional(),
  search: z.string().optional(),
  sort: z
    .enum(["newest", "price_asc", "price_desc", "name"])
    .optional()
    .default("newest"),
});

const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  desc: z.string().max(2000),
  slug: z.string().min(1).max(255),
  price: z.number().positive(),
  discountPrice: z.number().positive().optional(),
  quantity: z.number().int().min(0),
  categoryId: z.number().int().positive(),
});

// Create security middleware for products API
const securityMiddleware = createSecurityMiddleware({
  rateLimit: true,
  rateLimitType: "api",
  sanitization: true,
  securityHeaders: true,
  validation: {
    query: getProductsQuerySchema,
    body: createProductSchema, // For POST requests
  },
});

export async function GET(request: NextRequest) {
  try {
    // Apply security middleware
    const securityResult = await securityMiddleware(request);
    if (securityResult) {
      return securityResult;
    }

    // Get validated query parameters
    const validatedQuery = (request as any).validatedQuery || {};
    const {
      page = 1,
      limit = 12,
      category,
      search,
      sort = "newest",
    } = validatedQuery;

    // Build where clause
    const where: any = { status: 1 };

    if (category) {
      where.categoryId = category; // categoryId is a string in the database
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { desc: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build order clause
    let orderBy: any = { createdAt: "desc" };
    switch (sort) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "name":
        orderBy = { name: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch products with pagination
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          productPictures: {
            take: 1,
            orderBy: { displayOrder: "asc" },
            include: {
              picture: {
                select: { url: true },
              },
            },
          },
        },
        take: limit,
        skip,
        orderBy,
      }),
      prisma.product.count({ where }),
    ]);

    const transformedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      desc: product.desc,
      slug: product.slug,
      price: Number(product.price),
      discount_price: product.discountPrice
        ? Number(product.discountPrice)
        : null,
      quantity: product.quantity,
      images: product.productPictures.map((pp) => pp.picture.url),
      inStock: product.quantity > 0,
      createdAt: product.createdAt,
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return createSecureResponse({
      success: true,
      data: transformedProducts,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return createSecureResponse(
      {
        error: "Failed to fetch products",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// POST /api/products - Create new product (admin only)
export async function POST(request: NextRequest) {
  try {
    // Apply security middleware
    const securityResult = await securityMiddleware(request);
    if (securityResult) {
      return securityResult;
    }

    // Get validated body
    const validatedBody = (request as any).validatedBody;

    // Additional admin authorization check would go here
    // For now, we'll proceed with the validated data

    const newProduct = await prisma.product.create({
      data: {
        id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique ID
        name: validatedBody.name,
        desc: validatedBody.desc,
        slug: validatedBody.slug,
        price: validatedBody.price,
        discountPrice: validatedBody.discountPrice || null,
        quantity: validatedBody.quantity,
        categoryId: validatedBody.categoryId.toString(), // Convert to string as per schema
        status: 1, // Active by default
        modifiedAt: new Date(), // Required field
      },
    });

    // Serialize the product data for client consumption
    const serializedProduct = {
      ...newProduct,
      price: Number(newProduct.price),
      discountPrice: newProduct.discountPrice
        ? Number(newProduct.discountPrice)
        : null,
    };

    return createSecureResponse(
      {
        success: true,
        data: serializedProduct,
        message: "Product created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating product:", error);

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes("slug") && error.message.includes("unique")) {
        return createSecureResponse(
          { error: "Product slug must be unique" },
          { status: 409 },
        );
      }
    }

    return createSecureResponse(
      {
        error: "Failed to create product",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
