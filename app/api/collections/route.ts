/**
 * API route for collections management
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import { type NextRequest, NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth/config";
import { prisma } from "@/lib/database";

async function requireAdmin(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!isAdmin(session)) {
    return NextResponse.json(
      { error: "Unauthorized - Admin access required" },
      { status: 403 },
    );
  }

  return null;
}

// GET /api/collections - Get all collections
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const isActive = searchParams.get("isActive");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: {
      OR?: Array<
        | { name: { contains: string; mode: "insensitive" } }
        | { description: { contains: string; mode: "insensitive" } }
      >;
      isActive?: boolean;
    } = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    // Get collections with product count
    const [collections, total] = await Promise.all([
      prisma.collection.findMany({
        where,
        include: {
          products: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  status: true,
                  quantity: true,
                },
              },
            },
            orderBy: { displayOrder: "asc" },
          },
          _count: {
            select: { products: true },
          },
        },
        orderBy: { sortOrder: "asc" },
        skip,
        take: limit,
      }),
      prisma.collection.count({ where }),
    ]);

    // Transform data to include product count
    const transformedCollections = collections.map((collection) => ({
      ...collection,
      productCount: collection._count.products,
      products: collection.products.map(
        (cp: {
          product: {
            id: string;
            name: string | null;
            price: any;
            status: number | null;
            quantity: number;
          };
        }) => cp.product,
      ),
    }));

    return NextResponse.json({
      collections: transformedCollections,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json(
      { error: "Failed to fetch collections" },
      { status: 500 },
    );
  }
}

// POST /api/collections - Create a new collection
export async function POST(request: NextRequest) {
  try {
    const adminError = await requireAdmin(request);
    if (adminError) return adminError;

    const body = await request.json();
    const { name, slug, description, image, isActive, isFeatured, sortOrder } =
      body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 },
      );
    }

    // Check if slug already exists
    const existingCollection = await prisma.collection.findUnique({
      where: { slug },
    });

    if (existingCollection) {
      return NextResponse.json(
        { error: "Collection with this slug already exists" },
        { status: 400 },
      );
    }

    const collection = await prisma.collection.create({
      data: {
        name,
        slug,
        description,
        image,
        isActive: isActive ?? true,
        isFeatured: isFeatured ?? false,
        sortOrder: sortOrder ?? 0,
      },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                status: true,
                quantity: true,
              },
            },
          },
          orderBy: { displayOrder: "asc" },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    const transformedCollection = {
      ...collection,
      productCount: collection._count.products,
      products: collection.products.map(
        (cp: {
          product: {
            id: string;
            name: string | null;
            price: any;
            status: number | null;
            quantity: number;
          };
        }) => cp.product,
      ),
    };

    return NextResponse.json(transformedCollection, { status: 201 });
  } catch (error) {
    console.error("Error creating collection:", error);
    return NextResponse.json(
      { error: "Failed to create collection" },
      { status: 500 },
    );
  }
}
