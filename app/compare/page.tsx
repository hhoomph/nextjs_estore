"use client";

/**
 * Product Comparison Page
 *
 * Comprehensive product comparison interface allowing users to compare up to 4 products
 * side-by-side with detailed specifications, pricing, and features.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import {
  GitCompare,
  Heart,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { IranSansLoader } from "@/components/features/persian-font-loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CurrencyDisplay from "@/components/ui/currency-display";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductActionButton } from "@/components/ui/product-action-button";
import { StockBadge } from "@/components/ui/stock-badge";
import { useToast } from "@/lib/hooks/use-toast";
import { useCartActions } from "@/lib/hooks/use-simplified-cart-sync";
import {
  type ComparisonProduct,
  useComparisonStore,
} from "@/lib/stores/comparison-store";
import { useWishlistStore } from "@/lib/stores/wishlist-store";

export default function ComparePage() {
  const { items: comparisonItems, removeItem, clearAll } = useComparisonStore();
  const { addToCart } = useCartActions();
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    items: wishlistItems,
  } = useWishlistStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  const handleAddToCart = async (product: ComparisonProduct) => {
    const currentPrice = product.discount_price ?? product.price;

    await addToCart({
      product_id: product.id,
      product: {
        id: product.id,
        name: product.name,
        price: currentPrice,
        discount_price: currentPrice,
        slug: product.slug,
        product_pictures: product.product_pictures,
      },
      quantity: 1,
    });

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleWishlistToggle = (product: ComparisonProduct) => {
    const isInWishlist = wishlistItems.some(
      (item) => item.product_id === product.id,
    );

    if (isInWishlist) {
      removeFromWishlist(product.id);
      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed from your wishlist.`,
      });
    } else {
      addToWishlist({
        product_id: product.id,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          discount_price: product.discount_price ?? null,
          slug: product.slug,
          product_pictures: product.product_pictures,
        },
      });
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist.`,
      });
    }
  };

  const renderProductImage = (product: ComparisonProduct, index: number) => (
    <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
      <Image
        src={
          product.product_pictures?.[0]?.picture?.url ||
          "/placeholder-product.svg"
        }
        alt={product.name}
        fill={true}
        className="object-cover"
      />
      <div className="absolute top-2 left-2 flex gap-1">
        {product.discount_price && <Badge className="bg-success text-success-foreground">Sale</Badge>}
        <Badge variant="secondary">#{index + 1}</Badge>
      </div>
    </div>
  );

  const renderProductActions = (product: ComparisonProduct) => {
    const isInWishlist = wishlistItems.some(
      (item) => item.product_id === product.id,
    );

    return (
      <div className="flex gap-2 mt-4">
        <ProductActionButton
          className="flex-1"
          inStock={product.in_stock}
          label="Add to Cart"
          outOfStockLabel="Out of Stock"
          onClick={() => void handleAddToCart(product)}
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleWishlistToggle(product)}
        >
          <Heart
            className={`h-4 w-4 ${isInWishlist ? "fill-current text-destructive" : ""}`}
          />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => removeItem(product.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  if (comparisonItems.length === 0) {
    return (
      <IranSansLoader>
        <div className="container px-4 py-16">
          <div className="text-center">
            <GitCompare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4 font-persian">
              مقایسه محصولات
            </h1>
            <p className="text-muted-foreground mb-8 font-persian max-w-md mx-auto">
              هیچ محصولی برای مقایسه انتخاب نشده است. محصولاتی را که می‌خواهید
              مقایسه کنید انتخاب کنید.
            </p>
            <Link href="/products">
              <Button size="lg">
                <Plus className="h-4 w-4 mr-2" />
                انتخاب محصولات
              </Button>
            </Link>
          </div>
        </div>
      </IranSansLoader>
    );
  }

  return (
    <IranSansLoader>
      <div className="container px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2 font-persian">
              <GitCompare className="h-8 w-8 text-primary" />
              مقایسه محصولات
            </h1>
            <p className="text-muted-foreground font-persian">
              مقایسه {comparisonItems.length} محصول انتخاب شده
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearAll}>
              <Trash2 className="h-4 w-4 mr-2" />
              پاک کردن همه
            </Button>
            <Link href="/products">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                افزودن محصول
              </Button>
            </Link>
          </div>
        </div>

        {/* Comparison Table */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="font-persian">
              نمای کلی
            </TabsTrigger>
            <TabsTrigger value="specifications" className="font-persian">
              مشخصات
            </TabsTrigger>
            <TabsTrigger value="reviews" className="font-persian">
              نظرات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Product Cards Grid */}
            <div
              className={`grid gap-6 ${
                comparisonItems.length === 1
                  ? "grid-cols-1"
                  : comparisonItems.length === 2
                    ? "grid-cols-2"
                    : comparisonItems.length === 3
                      ? "grid-cols-3"
                      : "grid-cols-4"
              }`}
            >
              {comparisonItems.map((product, index) => (
                <Card key={product.id} className="overflow-hidden">
                  <CardHeader className="p-0">
                    {renderProductImage(product, index)}
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors font-persian">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-2">
                        {product.rating && (
                          <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-warning text-warning" />
                            <span className="text-sm">{product.rating}</span>
                            {product.review_count && (
                              <span className="text-xs text-muted-foreground">
                                ({product.review_count})
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <CurrencyDisplay
                          amount={product.discount_price || product.price}
                          currency="IRR"
                          size="lg"
                          className="font-bold"
                        />
                        {product.discount_price && (
                          <CurrencyDisplay
                            amount={product.price}
                            currency="IRR"
                            size="sm"
                            className="text-muted-foreground line-through"
                          />
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <StockBadge
                          inStock={product.in_stock}
                          inStockLabel="موجود"
                          outOfStockLabel="ناموجود"
                          showQuantity={false}
                          className="px-2 py-1 text-xs"
                        />
                        {product.brand && (
                          <span className="text-muted-foreground">
                            {product.brand}
                          </span>
                        )}
                      </div>

                      {renderProductActions(product)}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add Product Placeholder */}
              {comparisonItems.length < 4 && (
                <Card className="border-dashed border-2 hover:border-primary transition-colors">
                  <CardContent className="p-8 text-center">
                    <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground font-persian mb-4">
                      محصول دیگری اضافه کنید
                    </p>
                    <Link href="/products">
                      <Button variant="outline">انتخاب محصول</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="specifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-persian">مشخصات فنی</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {/* Basic Info Row */}
                    <div className="grid grid-cols-5 gap-4 p-4 bg-muted rounded-lg">
                      <div className="font-semibold font-persian">مشخصات</div>
                      {comparisonItems.map((product) => (
                        <div key={product.id} className="text-center">
                          <div className="font-semibold font-persian">
                            {product.name}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Price Comparison */}
                    <div className="grid grid-cols-5 gap-4 p-4 border rounded-lg">
                      <div className="font-semibold font-persian">قیمت</div>
                      {comparisonItems.map((product) => (
                        <div key={product.id} className="text-center">
                          <CurrencyDisplay
                            amount={product.discount_price || product.price}
                            currency="IRR"
                          />
                          {product.discount_price && (
                            <div className="text-xs text-muted-foreground mt-1">
                              <CurrencyDisplay
                                amount={product.price}
                                currency="IRR"
                                className="line-through"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Stock Status */}
                    <div className="grid grid-cols-5 gap-4 p-4 border rounded-lg">
                      <div className="font-semibold font-persian">
                        وضعیت موجودی
                      </div>
                      {comparisonItems.map((product) => (
                        <div key={product.id} className="text-center">
                          <StockBadge
                            inStock={product.in_stock}
                            inStockLabel="موجود"
                            outOfStockLabel="ناموجود"
                            showQuantity={false}
                            className="px-2 py-1 text-xs"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Brand */}
                    <div className="grid grid-cols-5 gap-4 p-4 border rounded-lg">
                      <div className="font-semibold font-persian">برند</div>
                      {comparisonItems.map((product) => (
                        <div
                          key={product.id}
                          className="text-center font-persian"
                        >
                          {product.brand || "-"}
                        </div>
                      ))}
                    </div>

                    {/* Rating */}
                    <div className="grid grid-cols-5 gap-4 p-4 border rounded-lg">
                      <div className="font-semibold font-persian">امتیاز</div>
                      {comparisonItems.map((product) => (
                        <div key={product.id} className="text-center">
                          {product.rating ? (
                            <div className="flex items-center justify-center gap-1">
                            <Star className="h-4 w-4 fill-warning text-warning" />
                              <span>{product.rating}</span>
                            </div>
                          ) : (
                            "-"
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div
              className={`grid gap-6 ${
                comparisonItems.length === 1
                  ? "grid-cols-1"
                  : comparisonItems.length === 2
                    ? "grid-cols-2"
                    : comparisonItems.length === 3
                      ? "grid-cols-3"
                      : "grid-cols-4"
              }`}
            >
              {comparisonItems.map((product) => (
                <Card key={product.id}>
                  <CardHeader>
                    <CardTitle className="text-lg font-persian">
                      {product.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {product.rating && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(product.rating!)
                                    ? "fill-warning text-warning"
                                    : "text-muted-foreground/40"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-persian">
                            {product.rating} از ۵
                          </span>
                        </div>
                      )}

                      {product.review_count ? (
                        <p className="text-sm text-muted-foreground font-persian">
                          {product.review_count} نظر
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground font-persian">
                          بدون نظر
                        </p>
                      )}

                      <Link href={`/products/${product.slug}#reviews`}>
                        <Button
                          variant="outline"
                          className="w-full font-persian"
                        >
                          مشاهده نظرات
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </IranSansLoader>
  );
}
