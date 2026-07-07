"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
/**
 * Client component for recently viewed products page
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CurrencyDisplay from "@/components/ui/currency-display";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface RecentlyViewedProduct {
  id: string;
  product_id: string;
  viewed_at: string;
  product: {
    id: string;
    name: string;
    price: number;
    discount_price: number | null;
    slug: string;
    product_pictures: {
      picture: {
        url: string;
      };
    }[];
  };
}

export function RecentlyViewedClient() {
  const t = useTranslations("Recently Viewed");
  const [products, setProducts] = useState<RecentlyViewedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentlyViewed();
  }, []);

  const fetchRecentlyViewed = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/recently-viewed");
      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
      } else {
        setError(data.error || "Failed to fetch recently viewed products");
      }
    } catch (err) {
      setError("Failed to fetch recently viewed products");
      console.error("Error fetching recently viewed:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearRecentlyViewed = () => {
    // This would typically call an API to clear from database
    // For now, just clear local state
    setProducts([]);
  };

  if (loading) {
    return <RecentlyViewedSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => fetchRecentlyViewed()}>Try Again</Button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          {t("noRecentlyViewed")}
        </h3>
        <p className="text-muted-foreground mb-6">
          You haven't viewed any products recently.
        </p>
        <Link href="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">
          {products.length} {t("recentlyViewedProducts").toLowerCase()}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={clearRecentlyViewed}
          className="text-destructive hover:text-destructive"
        >
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((item) => (
          <ProductCard key={item.id} product={item.product} />
        ))}
      </div>
    </div>
  );
}

function ProductCard({
  product,
}: {
  product: RecentlyViewedProduct["product"];
}) {
  const mainImage = product.product_pictures?.[0]?.picture?.url;

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <Link href={`/products/${product.slug}`}>
          <div className="aspect-square relative mb-4 overflow-hidden rounded-lg bg-muted">
            {mainImage ? (
              <OptimizedImage
                src={mainImage}
                alt={product.name || "Product"}
                fill={true}
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>
        </Link>

        <div className="space-y-2">
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>

          <div className="flex items-center space-x-2">
            <CurrencyDisplay
              amount={product.price}
              className="text-lg font-semibold text-foreground"
            />
            {product.discount_price &&
              product.discount_price < product.price && (
                <CurrencyDisplay
                  amount={product.discount_price}
                  className="text-sm text-success"
                />
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentlyViewedSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-card rounded-lg shadow-sm border p-4">
          <div className="aspect-square bg-muted rounded-lg mb-4 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
            <div className="h-6 bg-muted rounded w-1/2 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
