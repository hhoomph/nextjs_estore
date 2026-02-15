/**
 * Module for route
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/database";

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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: {
      OR?: Array<{
        name?: { contains: string; mode: "insensitive" };
        desc?: { contains: string; mode: "insensitive" };
        slug?: { contains: string; mode: "insensitive" };
      }>;
      categoryId?: string;
      status?: number;
    } = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { desc: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category && category !== "all") {
      where.categoryId = category;
    }

    if (status && status !== "all") {
      where.status = parseInt(status);
    }

    // Build order by
    const orderBy: Record<string, "asc" | "desc"> = {};
    orderBy[sortBy] = sortOrder as "asc" | "desc";

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

    const body = await request.json();
    const {
      name,
      desc,
      categoryId,
      quantity,
      price,
      discountPrice,
      status,
      images,
    } = body;

    // Validation
    if (!name || !desc || !categoryId) {
      return NextResponse.json(
        { error: "Name, description, and category are required" },
        { status: 400 },
      );
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        id: crypto.randomUUID(),
        name,
        desc,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        categoryId,
        quantity: quantity || 0,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        status: status !== undefined ? parseInt(status) : 1,
        createdAt: new Date(),
        modifiedAt: new Date(),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Handle images if provided
    if (images && Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const imageUrl = images[i];
        const pictureId = crypto.randomUUID();

        // Create picture record
        await prisma.picture.create({
          data: {
            id: pictureId,
            url: imageUrl,
            type: "product",
            modifiedAt: new Date(),
          },
        });

        // Associate with product
        await prisma.productPicture.create({
          data: {
            id: crypto.randomUUID(),
            pictureId: pictureId,
            productId: product.id,
            displayOrder: i,
          },
        });
      }
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}
