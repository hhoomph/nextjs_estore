/**
 * Module for route
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/database";

const imageUrlSchema = z
  .string()
  .trim()
  .min(1, "Image URL is required")
  .refine(
    (value) => value.startsWith("/") || /^https?:\/\//.test(value),
    "Image URL must be an absolute URL or local path",
  );

const adminProductInputSchema = z.preprocess(
  (body) => {
    if (!body || typeof body !== "object") return body;

    const input = body as Record<string, unknown>;
    return {
      name: input.name,
      desc: input.desc,
      categoryId: input.categoryId ?? input.category_id,
      quantity: input.quantity,
      price: input.price,
      discountPrice: input.discountPrice ?? input.discount_price,
      status: input.status,
      images: input.images,
    };
  },
  z
    .object({
      name: z.string().trim().min(1, "Name is required").max(255),
      desc: z.string().trim().min(1, "Description is required").max(5000),
      categoryId: z.string().trim().min(1, "Category is required"),
      quantity: z.coerce.number().int().min(0).max(999999),
      price: z.coerce.number().min(0.01).max(999999.99),
      discountPrice: z
        .preprocess(
          (value) => (value === "" || value === null ? undefined : value),
          z.coerce.number().min(0.01).max(999999.99).optional(),
        )
        .optional(),
      status: z.coerce.number().int().min(0).max(1).default(1),
      images: z
      .array(imageUrlSchema)
      .min(1, "At least one product image is required")
      .transform((urls) => Array.from(new Set(urls))),
    })
    .refine(
      (data) => data.discountPrice === undefined || data.discountPrice < data.price,
      {
        message: "Discount price must be less than the regular price",
        path: ["discountPrice"],
      },
    ),
);

class CategoryNotFoundError extends Error {}

type ProductSlugQueryClient = {
  product: {
    findFirst: (args: {
      where: { slug: string; id?: { not: string } };
      select: { slug: true };
    }) => Promise<{ slug: string | null } | null>;
  };
};

function buildProductSlug(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || crypto.randomUUID()
  );
}

async function getUniqueProductSlug(
  tx: ProductSlugQueryClient,
  baseSlug: string,
  productId?: string,
) {
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const where: { slug: string; id?: { not: string } } = { slug };
    if (productId) where.id = { not: productId };

    const existing = await tx.product.findFirst({
      where,
      select: { slug: true },
    });

    if (!existing || !existing.slug) return slug;
    slug = `${baseSlug}-${suffix++}`;
  }
}

function parsePositiveInt(
  value: string | null,
  fallback: number,
  min: number,
  max: number,
) {
  const parsed = parseInt(value || String(fallback), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function parseSortOrder(value: string | null): "asc" | "desc" {
  return value === "asc" ? "asc" : "desc";
}

function badRequest(error: z.ZodError) {
  return NextResponse.json(
    {
      error: "Invalid product data",
      details: error.flatten(),
    },
    { status: 400 },
  );
}

// GET /api/admin/products - Get all products for admin with advanced filtering
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parsePositiveInt(searchParams.get("page"), 1, 1, 1000);
    const limit = parsePositiveInt(searchParams.get("limit"), 20, 1, 100);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = parseSortOrder(searchParams.get("sortOrder"));

    const skip = (page - 1) * limit;

    const where: {
      OR?: Array<{
        name?: { contains: string; mode: "insensitive" };
        desc?: { contains: string; mode: "insensitive" };
        slug?: { contains: string; mode: "insensitive" };
      }>;
      categoryId?: string;
      status?: number;
    } = {};

    if (search?.trim()) {
      const searchValue = search.trim();
      where.OR = [
        { name: { contains: searchValue, mode: "insensitive" } },
        { desc: { contains: searchValue, mode: "insensitive" } },
        { slug: { contains: searchValue, mode: "insensitive" } },
      ];
    }

    if (category && category !== "all") {
      where.categoryId = category;
    }

    if (status && status !== "all") {
      where.status = parseInt(status, 10);
    }

    const allowedSortFields = new Set([
      "createdAt",
      "modifiedAt",
      "categoryId",
      "discountPrice",
      "name",
      "price",
      "quantity",
      "status",
    ]);
    const prismaSortBy = allowedSortFields.has(sortBy) ? sortBy : "createdAt";
    const orderBy = {
      [prismaSortBy]: sortOrder,
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              orderItems: true,
              reviews: true,
              wishlists: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching admin products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

// POST /api/admin/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 },
      );
    }

    const result = adminProductInputSchema.safeParse(await request.json());
    if (!result.success) return badRequest(result.error);

    const data = result.data;

    const product = await prisma.$transaction(async (tx) => {
      const category = await tx.category.findUnique({
        where: { id: data.categoryId },
        select: { id: true },
      });

      if (!category) throw new CategoryNotFoundError();

      const slug = await getUniqueProductSlug(tx, buildProductSlug(data.name));

      return tx.product.create({
        data: {
          id: crypto.randomUUID(),
          name: data.name,
          desc: data.desc,
          slug,
          categoryId: data.categoryId,
          quantity: data.quantity,
          price: data.price,
          discountPrice: data.discountPrice ?? null,
          status: data.status,
          ogImage: data.images[0],
          productPictures: {
            create: data.images.map((imageUrl, index) => ({
              id: crypto.randomUUID(),
              displayOrder: index,
              picture: {
                create: {
                  id: crypto.randomUUID(),
                  url: imageUrl,
                  type: "product",
                  modifiedAt: new Date(),
                },
              },
            })),
          },
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          productPictures: {
            include: {
              picture: true,
            },
            orderBy: {
              displayOrder: "asc",
            },
          },
        },
      });
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return badRequest(error);
    if (error instanceof CategoryNotFoundError) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 400 },
      );
    }

    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}
