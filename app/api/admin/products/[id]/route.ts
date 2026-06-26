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

class ProductNotFoundError extends Error {}
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

const MAX_SLUG_SUFFIX = 1000;

async function getUniqueProductSlug(
  tx: ProductSlugQueryClient,
  baseSlug: string,
  productId?: string,
) {
  let slug = baseSlug;
  let suffix = 2;

  while (suffix <= MAX_SLUG_SUFFIX) {
    const where: { slug: string; id?: { not: string } } = { slug };
    if (productId) where.id = { not: productId };

    const existing = await tx.product.findFirst({
      where,
      select: { slug: true },
    });

    if (!existing || !existing.slug) return slug;
    slug = `${baseSlug}-${suffix++}`;
  }

  // Fallback: append a short UUID fragment to guarantee uniqueness
  return `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`;
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
    const result = adminProductInputSchema.safeParse(await request.json());
    if (!result.success) return badRequest(result.error);

    const data = result.data;

    const product = await prisma.$transaction(async (tx) => {
      const existingProduct = await tx.product.findUnique({
        where: { id },
        include: {
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

      if (!existingProduct) throw new ProductNotFoundError();

      const category = await tx.category.findUnique({
        where: { id: data.categoryId },
        select: { id: true },
      });

      if (!category) throw new CategoryNotFoundError();

      const slug = await getUniqueProductSlug(
        tx,
        buildProductSlug(data.name),
        id,
      );

      const updatedProduct = await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          desc: data.desc,
          slug,
          categoryId: data.categoryId,
          quantity: data.quantity,
          price: data.price,
          discountPrice: data.discountPrice ?? null,
          status: data.status,
          ogImage: data.images[0],
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

      const currentProductPictures = updatedProduct.productPictures;
      const currentImages = new Set(data.images);
      const imagesToRemove = currentProductPictures.filter(
        (productPicture) => !currentImages.has(productPicture.picture.url),
      );

      if (imagesToRemove.length > 0) {
        await tx.productPicture.deleteMany({
          where: {
            productId: id,
            id: { in: imagesToRemove.map((productPicture) => productPicture.id) },
          },
        });

        for (const productPicture of imagesToRemove) {
          const remainingUsages = await tx.productPicture.count({
            where: { pictureId: productPicture.pictureId },
          });

          if (remainingUsages === 0) {
            await tx.picture.delete({
              where: { id: productPicture.pictureId },
            });
          }
        }
      }

      const existingProductPictureByImage = new Map(
        currentProductPictures.map((productPicture) => [
          productPicture.picture.url,
          productPicture,
        ]),
      );

      for (const [index, imageUrl] of data.images.entries()) {
        const productPicture = existingProductPictureByImage.get(imageUrl);

        if (productPicture) {
          if (productPicture.displayOrder !== index) {
            await tx.productPicture.update({
              where: { id: productPicture.id },
              data: { displayOrder: index },
            });
          }
          continue;
        }

        const pictureId = crypto.randomUUID();
        await tx.picture.create({
          data: {
            id: pictureId,
            url: imageUrl,
            type: "product",
            modifiedAt: new Date(),
          },
        });
        await tx.productPicture.create({
          data: {
            id: crypto.randomUUID(),
            pictureId,
            productId: id,
            displayOrder: index,
          },
        });
      }

      return tx.product.findUnique({
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
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    if (error instanceof z.ZodError) return badRequest(error);
    if (error instanceof ProductNotFoundError) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    if (error instanceof CategoryNotFoundError) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 400 },
      );
    }

    console.error("Error updating product:", error);
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

    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        name: true,
        _count: {
          select: {
            orderItems: true,
            cartItems: true,
            reviews: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (
      product._count.orderItems > 0 ||
      product._count.cartItems > 0 ||
      product._count.reviews > 0
    ) {
      return NextResponse.json(
        {
          error:
            "Cannot delete product that has orders, active cart items, or reviews. Deactivate it instead.",
          counts: product._count,
        },
        { status: 409 },
      );
    }

    await prisma.$transaction(async (tx) => {
      const productPictures = await tx.productPicture.findMany({
        where: { productId: id },
        include: { picture: true },
      });

      await tx.productPicture.deleteMany({
        where: { productId: id },
      });

      for (const productPicture of productPictures) {
        const remainingUsages = await tx.productPicture.count({
          where: { pictureId: productPicture.pictureId },
        });

        if (remainingUsages === 0) {
          await tx.picture.delete({
            where: { id: productPicture.pictureId },
          });
        }
      }

      await tx.productOption.deleteMany({
        where: { productId: id },
      });

      await tx.product.delete({
        where: { id },
      });
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
