/**
 * Categories Actions
 * Server actions for category management
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use server";

import { revalidateTag } from "next/cache";
import { cache } from "react";
import { prisma } from "@/lib/database";

/**
 * Category with product count
 */
export interface CategoryWithCount {
  id: string;
  parentId?: string | null;
  level?: number | null;
  name?: string | null;
  productCount: number;
  createdAt: Date;
  modifiedAt: Date;
}

/**
 * Get all categories with product count
 * Supports pagination and sorting
 */
export const getCategories = cache(
  async (options?: {
    page?: number;
    limit?: number;
    sortBy?: "name" | "createdAt" | "modifiedAt";
    sortOrder?: "asc" | "desc";
  }): Promise<{
    data: CategoryWithCount[];
    total: number;
    page: number;
    limit: number;
  }> => {
    try {
      const page = options?.page || 1;
      const limit = options?.limit || 20;
      const sortBy = options?.sortBy || "name";
      const sortOrder = options?.sortOrder || "asc";

      const skip = (page - 1) * limit;

      const [categories, total] = await Promise.all([
        prisma.category.findMany({
          include: {
            _count: {
              select: { products: true },
            },
          },
          orderBy: {
            [sortBy]: sortOrder,
          },
          skip,
          take: limit,
        }),
        prisma.category.count(),
      ]);

      const data = categories.map((category) => ({
        id: category.id,
        parentId: category.parentId,
        level: category.level,
        name: category.name,
        productCount: category._count.products,
        createdAt: category.createdAt,
        modifiedAt: category.modifiedAt,
      }));

      return { data, total, page, limit };
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw new Error("Failed to fetch categories");
    }
  },
);

/**
 * Get category by ID
 */
export const getCategoryById = cache(
  async (id: string): Promise<CategoryWithCount | null> => {
    try {
      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          _count: {
            select: { products: true },
          },
        },
      });

      if (!category) return null;

      return {
        id: category.id,
        parentId: category.parentId,
        level: category.level,
        name: category.name,
        productCount: category._count.products,
        createdAt: category.createdAt,
        modifiedAt: category.modifiedAt,
      };
    } catch (error) {
      console.error("Error fetching category by ID:", error);
      throw new Error("Failed to fetch category");
    }
  },
);

/**
 * Create a new category
 */
export const createCategory = async (data: {
  name?: string;
  parentId?: string;
  level?: number;
}): Promise<CategoryWithCount> => {
  try {
    // Create category without id (auto-generated)
    const categoryData = {
      ...data,
      modifiedAt: new Date(),
    };

    const category = await prisma.category.create({
      data: categoryData as any, // Using any to bypass type issues
    });

    // Fetch with count
    const categoryWithCount = await prisma.category.findUnique({
      where: { id: category.id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!categoryWithCount) {
      throw new Error("Failed to fetch created category");
    }

    return {
      id: categoryWithCount.id,
      parentId: categoryWithCount.parentId,
      level: categoryWithCount.level,
      name: categoryWithCount.name,
      productCount: categoryWithCount._count.products,
      createdAt: categoryWithCount.createdAt,
      modifiedAt: categoryWithCount.modifiedAt,
    };
  } catch (error) {
    console.error("Error creating category:", error);
    throw new Error("Failed to create category");
  }
};

/**
 * Update a category
 */
export const updateCategory = async (
  id: string,
  data: Partial<{
    name: string;
    parentId: string;
    level: number;
  }>,
): Promise<CategoryWithCount> => {
  try {
    const category = await prisma.category.update({
      where: { id },
      data: {
        ...data,
        modifiedAt: new Date(),
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return {
      id: category.id,
      parentId: category.parentId,
      level: category.level,
      name: category.name,
      productCount: category._count.products,
      createdAt: category.createdAt,
      modifiedAt: category.modifiedAt,
    };
  } catch (error) {
    console.error("Error updating category:", error);
    throw new Error("Failed to update category");
  }
};

/**
 * Delete a category
 */
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    await prisma.category.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    throw new Error("Failed to delete category");
  }
};

/**
 * Get category by slug
 */
export const getCategoryBySlug = cache(
  async (slug: string): Promise<CategoryWithCount | null> => {
    try {
      const category = await prisma.category.findFirst({
        where: {
          name: {
            equals: slug.replace(/-/g, " "),
            mode: "insensitive",
          },
        },
        include: {
          _count: {
            select: { products: true },
          },
        },
      });

      if (!category) return null;

      return {
        id: category.id,
        parentId: category.parentId,
        level: category.level,
        name: category.name,
        productCount: category._count.products,
        createdAt: category.createdAt,
        modifiedAt: category.modifiedAt,
      };
    } catch (error) {
      console.error("Error fetching category by slug:", error);
      throw new Error("Failed to fetch category");
    }
  },
);

/**
 * Get products by category ID
 */
export const getProductsByCategory = cache(
  async (
    categoryId: string,
    options?: {
      page?: number;
      limit?: number;
      sortBy?: "name" | "price" | "createdAt";
      sortOrder?: "asc" | "desc";
    },
  ): Promise<any[]> => {
    if (!categoryId) return [];

    try {
      const page = options?.page || 1;
      const limit = options?.limit || 20;
      const sortBy = options?.sortBy || "createdAt";
      const sortOrder = options?.sortOrder || "desc";

      const skip = (page - 1) * limit;

      const products = await prisma.product.findMany({
        where: {
          categoryId: categoryId,
        },
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      });

      return products;
    } catch (error) {
      console.error("Error fetching products by category:", error);
      throw new Error("Failed to fetch products");
    }
  },
);
