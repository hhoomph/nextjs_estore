import { type NextRequest } from "next/server";
import { z } from "zod";
import {
  createSecureResponse,
  createSecurityMiddleware,
} from "@/app/api/middleware/security";
import prisma from "@/lib/prisma";

const getProductsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((value) => {
      const page = Number.parseInt(value || "1", 10);
      return Number.isFinite(page) && page > 0 ? page : 1;
    }),
  limit: z
    .string()
    .optional()
    .transform((value) => {
      const limit = Number.parseInt(value || "12", 10);
      return Number.isFinite(limit) && limit > 0 ? Math.min(limit, 48) : 12;
    }),
  category: z.string().optional(),
  search: z.string().optional(),
  sortBy: z
    .enum(["createdAt", "created_at", "price", "price-high", "name", "wishlistCount"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  minPrice: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      const price = Number(value);
      return Number.isFinite(price) ? price : undefined;
    }),
  maxPrice: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      const price = Number(value);
      return Number.isFinite(price) ? price : undefined;
    }),
  inStock: z
    .string()
    .optional()
    .transform((value) => value === "true"),
  onSale: z
    .string()
    .optional()
    .transform((value) => value === "true"),
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

const securityMiddleware = createSecurityMiddleware({
  rateLimit: true,
  rateLimitType: "api",
  sanitization: true,
  securityHeaders: true,
  validation: {
    query: getProductsQuerySchema,
    body: createProductSchema,
  },
});

async function resolveCategoryId(category: string | undefined) {
  if (!category) return undefined;

  const exactCategory = await prisma.category.findUnique({
    where: { id: category },
    select: { id: true },
  });

  if (exactCategory) return exactCategory.id;

  const nameCategory = await prisma.category.findFirst({
    where: {
      name: {
        equals: category.replaceAll("-", " "),
        mode: "insensitive",
      },
    },
    select: { id: true },
  });

  return nameCategory?.id;
}

export async function GET(request: NextRequest) {
  try {
    const securityResult = await securityMiddleware(request);
    if (securityResult) {
      return securityResult;
    }

    const validatedQuery = (request as unknown as { validatedQuery: z.infer<typeof getProductsQuerySchema> }).validatedQuery;
    const {
      page = 1,
      limit = 12,
      category,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      minPrice,
      maxPrice,
      inStock,
      onSale,
    } = validatedQuery;

    const where: Record<string, unknown> = { status: 1 };

    if (category) {
      const resolvedCategoryId = await resolveCategoryId(category);
      if (resolvedCategoryId) {
        where.categoryId = resolvedCategoryId;
      }
    }

    if (search?.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { desc: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        (where.price as Record<string, number>).gte = minPrice;
      }
      if (maxPrice !== undefined) {
        (where.price as Record<string, number>).lte = maxPrice;
      }
    }

    if (inStock) {
      where.quantity = { gt: 0 };
    }

    if (onSale) {
      where.discountPrice = { not: null };
    }

    const orderBy: Record<string, unknown> =
      sortBy === "name"
        ? { name: sortOrder }
        : sortBy === "price"
          ? { price: sortOrder }
          : sortBy === "price-high"
            ? { price: "desc" }
            : sortBy === "wishlistCount"
              ? { wishlists: { _count: sortOrder } }
              : sortBy === "created_at"
                ? { createdAt: sortOrder }
                : { createdAt: sortOrder };

    const skip = (page - 1) * limit;

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
          _count: {
            select: { wishlists: true },
          },
        },
        take: limit,
        skip,
        orderBy,
      }),
      prisma.product.count({ where }),
    ]);

    const transformedProducts = products.map((product) => {
      const images = product.productPictures.length > 0
        ? product.productPictures.map((picture) => picture.picture.url)
        : product.ogImage
          ? [product.ogImage]
          : [];

      return {
        id: product.id,
        name: product.name,
        desc: product.desc,
        slug: product.slug,
        price: Number(product.price),
        discount_price: product.discountPrice
          ? Number(product.discountPrice)
          : null,
        quantity: product.quantity,
        images,
        inStock: product.quantity > 0,
        createdAt: product.createdAt,
        wishlistCount: product._count.wishlists,
      };
    });

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

export async function POST(request: NextRequest) {
  try {
    const securityResult = await securityMiddleware(request);
    if (securityResult) {
      return securityResult;
    }

    const validatedBody = (request as unknown as { validatedBody: z.infer<typeof createProductSchema> }).validatedBody;

    const newProduct = await prisma.product.create({
      data: {
        id: `prod_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        name: validatedBody.name,
        desc: validatedBody.desc,
        slug: validatedBody.slug,
        price: validatedBody.price,
        discountPrice: validatedBody.discountPrice || null,
        quantity: validatedBody.quantity,
        categoryId: validatedBody.categoryId.toString(),
        status: 1,
        modifiedAt: new Date(),
      },
    });

    return createSecureResponse(
      {
        success: true,
        data: newProduct,
        message: "Product created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating product:", error);

    if (error instanceof Error && error.message.includes("unique")) {
      return createSecureResponse(
        { error: "Product slug must be unique" },
        { status: 409 },
      );
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
