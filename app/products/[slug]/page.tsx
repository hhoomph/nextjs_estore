/**
 * Product detail page
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/database";
import { LoadingPage } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, Heart, ChevronLeft } from "lucide-react";

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

  // Calculate discount percentage
  const discountPercent = product.discountPrice
    ? Math.round((1 - Number(product.discountPrice) / Number(product.price)) * 100)
    : 0;

  // Calculate average rating
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
              <div className="aspect-square relative overflow-hidden rounded-lg border bg-muted">
                {product.productPictures[0]?.picture.url ? (
                  <Image
                    src={product.productPictures[0].picture.url}
                    alt={product.name || "Product"}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No image available
                  </div>
                )}
                {discountPercent > 0 && (
                  <Badge className="absolute top-4 right-4 bg-red-500">
                    {discountPercent}% OFF
                  </Badge>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              {product.productPictures.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.productPictures.map((pp, index) => (
                    <div
                      key={pp.picture.id}
                      className="relative w-20 h-20 rounded-md overflow-hidden border-2 border-transparent hover:border-primary cursor-pointer"
                    >
                      <Image
                        src={pp.picture.url}
                        alt={`${product.name} - ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
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
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted"
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
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold">
                  ${product.discountPrice
                    ? Number(product.discountPrice).toFixed(2)
                    : Number(product.price).toFixed(2)}
                </span>
                {product.discountPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    ${Number(product.price).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Description */}
              <div>
                <h2 className="font-semibold mb-2">Description</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {product.desc || "No description available."}
                </p>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                <span className="text-sm">Availability:</span>
                {product.quantity > 0 ? (
                  <Badge variant="outline" className="text-green-500 border-green-500">
                    In Stock ({product.quantity} available)
                  </Badge>
                ) : (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex gap-4">
                <Button className="flex-1" size="lg" disabled={product.quantity <= 0}>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="lg">
                  <Heart className="mr-2 h-5 w-5" />
                  Wishlist
                </Button>
              </div>

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
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted"
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
