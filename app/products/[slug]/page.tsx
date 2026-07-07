/**
 * Product detail page
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { Suspense } from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { LoadingPage } from "@/components/ui/loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProductPrice } from "@/components/ui/product-price";
import { StockBadge } from "@/components/ui/stock-badge";
import { AddToCartSection } from "@/components/features/add-to-cart-section";
import { ImageSlider } from "@/components/ui/image-slider";
import Link from "next/link";
import { Star, ChevronLeft } from "lucide-react";
import { PLACEHOLDER_IMAGE } from "@/lib/utils/image-utils";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Fetch product by slug
async function getProduct(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        productPictures: {
          include: {
            picture: true,
          },
          orderBy: {
            displayOrder: "asc",
          },
        },
        reviews: {
          where: {
            status: "APPROVED",
          },
          take: 10,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return product;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  // Calculate average rating
  const productImages = product.productPictures.length > 0
    ? product.productPictures.map((pp) => pp.picture.url)
    : product.ogImage
      ? [product.ogImage]
      : [PLACEHOLDER_IMAGE];
  const avgRating = product.reviews.length > 0
    ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
    : 0;

  return (
    <div className="bg-background min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="container px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-foreground">Products</Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>
        </div>
      </div>

      <Suspense fallback={<LoadingPage text="Loading product..." />}>
        <div className="container px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              <ImageSlider
                images={productImages}
                alt={product.name || "Product"}
                className="rounded-[2rem] border border-border/60 bg-card p-3 shadow-xl shadow-primary/10"
              />
            </div>

            {/* Product Details */}
            <div className="rounded-[2.5rem] border border-border/60 bg-card/95 p-6 shadow-2xl shadow-primary/10 lg:p-8">
              <div className="space-y-6">
              {/* Category & Title */}
              <div>
                <Link
                  href={`/categories`}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  {product.category.name}
                </Link>
                <h1 className="text-3xl font-bold mt-1">{product.name}</h1>
                
                {/* Rating */}
                {product.reviews.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.round(avgRating)
                              ? "fill-warning text-warning"
                              : "text-muted-foreground/40"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({product.reviews.length} reviews)
                    </span>
                  </div>
                )}
              </div>

              {/* Price */}
              <ProductPrice
                price={Number(product.price)}
                discountPrice={product.discountPrice ? Number(product.discountPrice) : null}
                amountClassName="text-3xl"
              />

              {/* Description */}
              <div>
                <h2 className="font-semibold mb-2">Description</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {product.desc || "No description available."}
                </p>
              </div>

              {/* Stock Status */}
              <StockBadge
                inStock={product.quantity > 0}
                quantity={product.quantity}
              />

              <Separator />

              {/* Actions */}
              <AddToCartSection
                productId={product.id}
                productName={product.name || ""}
                productPrice={Number(product.price)}
                productDiscountPrice={product.discountPrice ? Number(product.discountPrice) : null}
                productSlug={product.slug || ""}
                quantity={1}
                isOutOfStock={product.quantity <= 0}
              />

              {/* Back to Products */}
              <div className="pt-4">
                <Link
                  href="/products"
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Products
                </Link>
              </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          {product.reviews.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
              <div className="space-y-4">
                {product.reviews.map((review) => (
                  <Card key={review.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {review.user.name || "Anonymous"}
                        </CardTitle>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-warning text-warning"
                                  : "text-muted-foreground/40"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {review.title && (
                        <p className="font-semibold mb-1">{review.title}</p>
                      )}
                      <p className="text-muted-foreground">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </Suspense>
    </div>
  );
}