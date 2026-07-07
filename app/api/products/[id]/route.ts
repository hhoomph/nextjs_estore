/**
 * Module for route
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";

// GET /api/products/[id] - Get single product by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Try to find by ID first, then by slug
    let product = await prisma.product.findUnique({
      where: { id },
      include: {
        productPictures: {
          include: {
            picture: {
              select: {
                id: true,
                url: true,
              },
            },
          },
          orderBy: { displayOrder: "asc" },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // If not found by ID, try by slug
    if (!product) {
      product = await prisma.product.findFirst({
        where: { slug: id },
        include: {
          productPictures: {
            include: {
              picture: {
                select: {
                  id: true,
                  url: true,
                },
              },
            },
            orderBy: { displayOrder: "asc" },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if product is active
    if (product.status !== 1) {
      return NextResponse.json(
        { error: "Product not available" },
        { status: 404 },
      );
    }

    // Get related products from same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        status: 1,
      },
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
      take: 4,
      orderBy: { createdAt: "desc" },
    });

    const productImages = product.productPictures.length > 0
      ? product.productPictures.map((pp) => ({
          id: pp.picture.id,
          url: pp.picture.url,
          alt: product.name || "Product image",
        }))
      : product.ogImage
        ? [{ id: product.ogImage, url: product.ogImage, alt: product.name || "Product image" }]
        : [];

    // Transform product for frontend
    const transformedProduct = {
      id: product.id,
      name: product.name,
      desc: product.desc,
      slug: product.slug,
      price: Number(product.price),
      discountPrice: product.discountPrice
        ? Number(product.discountPrice)
        : null,
      quantity: product.quantity,
      category: product.category,
      images: productImages,
      inStock: product.quantity > 0,
      createdAt: product.createdAt,
      discountPercentage: product.discountPrice
        ? Math.round(
            ((Number(product.price) - Number(product.discountPrice)) /
              Number(product.price)) *
              100,
          )
        : 0,
    };
    // Transform related products
    const transformedRelated = relatedProducts.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
      images: p.productPictures.length > 0
        ? p.productPictures.map((pp) => pp.picture.url)
        : p.ogImage
          ? [p.ogImage]
          : [],
      inStock: p.quantity > 0,
    }));

    return NextResponse.json({
      product: transformedProduct,
      relatedProducts: transformedRelated,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}
