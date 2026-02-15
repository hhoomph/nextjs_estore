/**
 * Module for route
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { type NextRequest, NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth/config";
import { prisma } from "@/lib/database";

// GET /api/categories - Get all categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        level: 0, // Only get root categories
      },
      include: {
        products: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Transform for frontend
    const transformedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      productCount: category.products.length,
    }));

    return NextResponse.json({
      categories: transformedCategories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

// POST /api/categories - Create new category (admin only)
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, parentId } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 },
      );
    }

    // Determine level
    let level = 0;
    if (parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        return NextResponse.json(
          { error: "Parent category not found" },
          { status: 404 },
        );
      }
      level = (parent.level || 0) + 1;
    }

    const category = await prisma.category.create({
      data: {
        name,
        parentId,
        level,
        id: crypto.randomUUID(),
        modifiedAt: new Date(),
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 },
    );
  }
}
