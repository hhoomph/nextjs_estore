/**
 * API route for individual collection operations
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";

// GET /api/collections/[id] - Get a single collection
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const collection = await prisma.collection.findUnique({
      where: { id },
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
                slug: true,
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

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 },
      );
    }

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
            slug: string | null;
          };
        }) => cp.product,
      ),
    };

    return NextResponse.json(transformedCollection);
  } catch (error) {
    console.error("Error fetching collection:", error);
    return NextResponse.json(
      { error: "Failed to fetch collection" },
      { status: 500 },
    );
  }
}

// PUT /api/collections/[id] - Update a collection
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
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

    // Check if slug already exists (excluding current collection)
    const existingCollection = await prisma.collection.findFirst({
      where: {
        slug,
        id: { not: id },
      },
    });

    if (existingCollection) {
      return NextResponse.json(
        { error: "Collection with this slug already exists" },
        { status: 400 },
      );
    }

    const collection = await prisma.collection.update({
      where: { id },
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
                slug: true,
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
            slug: string | null;
          };
        }) => cp.product,
      ),
    };

    return NextResponse.json(transformedCollection);
  } catch (error) {
    console.error("Error updating collection:", error);

    // Handle Prisma errors
    if (
      error instanceof Error &&
      error.message.includes("Record to update not found")
    ) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Failed to update collection" },
      { status: 500 },
    );
  }
}

// DELETE /api/collections/[id] - Delete a collection
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Check if collection exists
    const collection = await prisma.collection.findUnique({
      where: { id },
    });

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 },
      );
    }

    // Delete the collection (cascade will handle collection_product relationships)
    await prisma.collection.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Collection deleted successfully" });
  } catch (error) {
    console.error("Error deleting collection:", error);
    return NextResponse.json(
      { error: "Failed to delete collection" },
      { status: 500 },
    );
  }
}
