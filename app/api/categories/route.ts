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

async function getCategoryDescendantIds(categoryId: string) {
  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    WITH RECURSIVE category_tree AS (
      SELECT id
      FROM "category"
      WHERE id = ${categoryId}

      UNION ALL

      SELECT child.id
      FROM "category" AS child
      INNER JOIN category_tree AS parent
        ON child."parentId" = parent.id
    )
    SELECT id
    FROM category_tree
  `;

  return rows.map((row) => row.id);
}

async function countActiveProductsInCategories(categoryIds: string[]) {
  if (categoryIds.length === 0) return 0;

  return prisma.product.count({
    where: {
      status: 1,
      categoryId: {
        in: categoryIds,
      },
    },
  });
}

// GET /api/categories - Get all categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        level: true,
      },
      orderBy: [
        { level: "asc" },
        { name: "asc" },
      ],
    });

    const transformedCategories = await Promise.all(
      categories.map(async (category) => {
        const categoryIds = await getCategoryDescendantIds(category.id);
        const productCount = await countActiveProductsInCategories(categoryIds);

        return {
          id: category.id,
          name: category.name ?? "Uncategorized",
          level: category.level ?? 0,
          productCount,
        };
      }),
    );

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
