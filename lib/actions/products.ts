/**
 * Module for products
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { unstable_cache as cache } from "next/cache";
import { prisma } from "@/lib/database";

interface GetProductsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

type ProductWhereClause = Record<string, any>; // Prisma where clause type

interface ProductWithPictures {
  id: string;
  name: string | null;
  desc: string | null;
  slug: string | null;
  price: any; // Prisma Decimal
  discountPrice: any | null; // Prisma Decimal
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

interface ProductResult {
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

// Internal function that does the actual work
async function fetchProducts(
  params: GetProductsParams = {},
): Promise<ProductResult> {
  try {
    const {
      page = 1,
      limit = 12,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
      category,
      minPrice,
      maxPrice,
      inStock,
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: 1, // Active products only
    };

    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { desc: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    if (category && category !== "All") {
      where.categoryId = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (inStock === true) {
      where.quantity = { gt: 0 };
    }

    // Build order by
    type ProductOrderBy = {
      createdAt?: "asc" | "desc";
      price?: "asc" | "desc";
      name?: "asc" | "desc";
    };

    let orderBy: ProductOrderBy = { createdAt: "desc" };
    if (sortBy === "price") {
      orderBy = { price: sortOrder === "desc" ? "desc" : "asc" };
    } else if (sortBy === "price-high") {
      orderBy = { price: "desc" };
    } else if (sortBy === "name") {
      orderBy = { name: sortOrder === "desc" ? "desc" : "asc" };
    }

    // Fetch products with pagination
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          productPictures: {
            take: 1,
            orderBy: { displayOrder: "asc" },
            include: {
              picture: {
                select: {
                  id: true,
                  url: true,
                },
              },
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Get category info
    const categoryIds = [
      ...new Set((products as ProductWithPictures[]).map((p) => p.categoryId)),
    ].filter((id): id is string => typeof id === "string");
    const categoryMap = new Map<string, { id: string; name: string }>();

    if (categoryIds.length > 0) {
      const categories = await prisma.category.findMany({
        where: { id: { in: categoryIds } },
        select: { id: true, name: true },
      });

      categories.forEach((cat: { id: string; name: string | null }) => {
        categoryMap.set(cat.id, { id: cat.id, name: cat.name || "Unknown" });
      });
    }

    // Transform products
    const transformedProducts = (products as ProductWithPictures[]).map(
      (product) => ({
        id: product.id,
        name: product.name,
        desc: product.desc,
        slug: product.slug,
        price: Number(product.price),
        discount_price: product.discountPrice
          ? Number(product.discountPrice)
          : null,
        quantity: product.quantity,
        category: categoryMap.get(product.categoryId || ""),
        images: product.productPictures.map((pp) => pp.picture.url),
        inStock: product.quantity > 0,
        createdAt: product.createdAt,
      }),
    );

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };

    const result: ProductResult = {
      data: transformedProducts,
      pagination,
    };

    return result;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}

// Server action for fetching products with caching
export const getProducts = cache(
  fetchProducts,
  ["products"],
  { revalidate: 300 }, // Cache for 5 minutes
);
