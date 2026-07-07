import { ArrowLeft, Grid3X3, Package } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/features/products/product-grid";
import { SectionHeading } from "@/components/features/layout/section-heading";
import { type ProductCardProduct } from "@/components/features/products/product-card";
import prisma from "@/lib/prisma";

interface CategoryDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

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

async function getCategoryBySlug(slug: string) {
  const decodedSlug = decodeURIComponent(slug);
  const decodedName = decodedSlug.replaceAll("-", " ");

  const category = await prisma.category.findFirst({
    where: {
      name: {
        equals: decodedName,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      name: true,
      level: true,
    },
  });

  if (!category) {
    return null;
  }

  const categoryIds = await getCategoryDescendantIds(category.id);
  const products = await prisma.product.findMany({
    where: {
      status: 1,
      categoryId: {
        in: categoryIds,
      },
    },
    include: {
      category: {
        select: {
          name: true,
        },
      },
      productPictures: {
        take: 1,
        orderBy: { displayOrder: "asc" },
        include: {
          picture: { select: { url: true } },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    ...category,
    products: products.map((product) => {
      const images = product.productPictures.length > 0
        ? product.productPictures.map((picture) => picture.picture.url)
        : product.ogImage
          ? [product.ogImage]
          : [];

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(product.price),
        discount_price: product.discountPrice ? Number(product.discountPrice) : null,
        images,
        inStock: product.quantity > 0,
        category: { name: product.category?.name ?? category.name },
      };
    }),
  };
}

function HeroPlaceholder() {
  return (
    <div className="flex aspect-square items-center justify-center rounded-[2rem] bg-muted">
      <Package className="h-24 w-24 text-muted-foreground/50" />
    </div>
  );
}

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const products: ProductCardProduct[] = category.products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: { name: category.name },
    price: product.price,
    discount_price: product.discount_price,
    images: product.images,
    inStock: product.inStock,
  }));

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b bg-background/80 backdrop-blur">
        <div className="container px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/" className="font-semibold text-foreground">
              Home
            </Link>
            <span>/</span>
            <Link href="/categories" className="font-semibold text-foreground">
              Categories
            </Link>
            <span>/</span>
            <span className="font-bold text-foreground">{category.name}</span>
          </nav>
        </div>
      </div>

      <section className="overflow-hidden bg-background">
        <div className="container grid gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-16">
          <div>
            <Badge className="mb-4 rounded-full bg-primary/10 text-primary shadow-sm">
              <Grid3X3 className="mr-2 h-4 w-4" />
              {products.length} products
            </Badge>
            <SectionHeading
              title={category.name || "Category"}
              description="Explore every product in this collection with a consistent shopping experience."
              align="left"
              className="max-w-none"
            />
            <div className="mt-8">
              <Button asChild={true} variant="outline" className="rounded-full">
                <Link href="/categories">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Categories
                </Link>
              </Button>
            </div>
          </div>
          <HeroPlaceholder />
        </div>
      </section>

      <section className="container px-4 py-12 sm:px-6 lg:px-8">
        {products.length === 0 ? (
          <div className="rounded-[2rem] border border-border/60 bg-card p-10 text-center shadow-xl shadow-primary/10">
            <Package className="mx-auto mb-4 h-14 w-14 text-muted-foreground" />
            <h2 className="text-2xl font-black text-foreground">
              No products yet
            </h2>
            <p className="mt-2 text-muted-foreground">
              This category does not have active products right now.
            </p>
          </div>
        ) : (
          <ProductGrid
            products={products}
            unknownProductLabel="Unknown Product"
            outOfStockLabel="Out of Stock"
            saleLabel="Sale"
            addToCartLabel="Add to Cart"
            uncategorizedLabel={category.name || "Uncategorized"}
            showAddToCart={false}
          />
        )}
      </section>
    </main>
  );
}
