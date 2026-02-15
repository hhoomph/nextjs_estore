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

// GET /api/admin/products/[id] - Get single product for admin
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 },
      );
    }

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
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
        productOptions: {
          include: {
            options: {
              include: {
                optionGroup: true,
              },
            },
          },
        },
        _count: {
          select: {
            orderItems: true,
            reviews: true,
            wishlists: true,
            cartItems: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

// PUT /api/admin/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 },
      );
    }

    const { id } = await params;
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

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        desc,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        categoryId,
        quantity: quantity || 0,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        status: status !== undefined ? parseInt(status) : 1,
        modifiedAt: new Date(),
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
        },
      },
    });

    // Handle images if provided
    if (images && Array.isArray(images)) {
      // Get current images
      const currentImages = product.productPictures.map((pp) => pp.picture.url);

      // Find images to add
      const imagesToAdd = images.filter((img) => !currentImages.includes(img));

      // Find images to remove
      const imagesToRemove = currentImages.filter(
        (img) => !images.includes(img),
      );

      // Remove old images
      if (imagesToRemove.length > 0) {
        for (const imageUrl of imagesToRemove) {
          const productPicture = product.productPictures.find(
            (pp) => pp.picture.url === imageUrl,
          );
          if (productPicture) {
            // Remove productPictures record
            await prisma.productPicture.delete({
              where: { id: productPicture.id },
            });

            // Check if picture is used by other products
            const otherUsages = await prisma.productPicture.count({
              where: { pictureId: productPicture.pictureId },
            });

            // If not used elsewhere, delete the picture record
            if (otherUsages === 0) {
              await prisma.picture.delete({
                where: { id: productPicture.pictureId },
              });
            }
          }
        }
      }

      // Add new images
      if (imagesToAdd.length > 0) {
        for (let i = 0; i < imagesToAdd.length; i++) {
          const imageUrl = imagesToAdd[i];
          const displayOrder = images.findIndex((img) => img === imageUrl);
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
              displayOrder: displayOrder,
            },
          });
        }
      }

      // Update display order for all images
      for (let i = 0; i < images.length; i++) {
        const imageUrl = images[i];
        const productPicture = product.productPictures.find(
          (pp) => pp.picture.url === imageUrl,
        );
        if (productPicture && productPicture.displayOrder !== i) {
          await prisma.productPicture.update({
            where: { id: productPicture.id },
            data: { displayOrder: i },
          });
        }
      }
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error updating product:", error);

    if (
      error instanceof Error &&
      error.message.includes("Record to update not found")
    ) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 },
      );
    }

    const { id } = await params;

    // Check if product exists and get related counts
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            orderItems: true,
            cartItems: true,
            wishlists: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if product is in active orders
    if (product._count.orderItems > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete product that has been ordered. Consider deactivating it instead.",
          orderCount: product._count.orderItems,
        },
        { status: 400 },
      );
    }

    // Delete product (this will cascade delete related records)
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Product deleted successfully",
      deletedProductId: id,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
