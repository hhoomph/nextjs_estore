"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Clock, Percent, Tag } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/features/products/product-grid";
import { SectionHeading } from "@/components/features/layout/section-heading";
import { type ProductCardProduct } from "@/components/features/products/product-card";
import { useCartActions } from "@/lib/hooks/use-simplified-cart-sync";

interface Product {
  id: string;
  name: string | null;
  slug: string | null;
  price: number;
  discount_price?: number | null;
  category?: { id: string; name: string } | null;
  images: string[];
  inStock: boolean;
}

interface ProductResult {
  data: Product[];
  pagination: {
    total: number;
  };
}

function toProductCard(product: Product): ProductCardProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    price: product.price,
    discount_price: product.discount_price,
    images: product.images,
    inStock: product.inStock,
  };
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart } = useCartActions();

  useEffect(() => {
    const controller = new AbortController();

    const fetchDeals = async () => {
      try {
        const response = await fetch("/api/products?limit=12&onSale=true", {
          signal: controller.signal,
        });
        const data: ProductResult = await response.json();

        if (!response.ok) {
          throw new Error("Failed to fetch deals");
        }

        setDeals(data.data);
      } catch (err) {
        if (
          err instanceof Error &&
          (err.name === "AbortError" || err.message === "Failed to fetch")
        ) {
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to fetch deals");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void fetchDeals();

    return () => controller.abort();
  }, []);

  const handleAddToCart = async (product: ProductCardProduct) => {
    try {
      const currentPrice = product.discount_price ?? product.price;

      await addToCart({
        product_id: product.id,
        product: {
          id: product.id,
          name: product.name || "Unknown Product",
          price: currentPrice,
          discount_price: currentPrice,
          slug: product.slug || "",
          product_pictures: (product.images ?? []).map((url) => ({
            picture: { url },
          })),
        },
        quantity: 1,
      });
    } catch (err) {
      console.error("Error adding deal to cart:", err);
    }
  };

  const featuredDeal = deals[0];

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b bg-background/80 backdrop-blur">
        <div className="container px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/" className="font-semibold text-foreground">
              Home
            </Link>
            <span>/</span>
            <span className="font-bold text-foreground">Deals</span>
          </nav>
        </div>
      </div>

      <section className="overflow-hidden bg-background">
        <div className="container px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <SectionHeading
            eyebrow="Limited Time Offers"
            title="Special Deals & Offers"
            description="Save big on discounted products before these offers expire."
            className="mb-0"
          />
        </div>
      </section>

      <section className="container px-4 py-12 sm:px-6 lg:px-8">
        {loading ? (
          <div className="rounded-[2rem] border border-border/60 bg-card p-10 text-center shadow-xl shadow-primary/10">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary" />
            <p className="font-semibold text-muted-foreground">Loading deals...</p>
          </div>
        ) : error ? (
          <div className="rounded-[2rem] border border-border/60 bg-card p-10 text-center shadow-xl shadow-primary/10">
            <p className="mb-5 font-bold text-destructive">{error}</p>
            <Button onClick={() => window.location.reload()} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
              Try Again
            </Button>
          </div>
        ) : deals.length === 0 ? (
          <div className="rounded-[2rem] border border-border/60 bg-card p-10 text-center shadow-xl shadow-primary/10">
            <Tag className="mx-auto mb-4 h-14 w-14 text-muted-foreground" />
            <h2 className="text-2xl font-black text-foreground">No active deals</h2>
            <p className="mt-2 text-muted-foreground">Check back soon for new offers.</p>
          </div>
        ) : (
          <>
            {featuredDeal && (
              <div className="mb-12 overflow-hidden rounded-[2.5rem] border border-border/60 bg-card shadow-2xl shadow-primary/10">
                <div className="grid gap-8 p-6 md:grid-cols-[1fr_auto] md:p-10">
                  <div>
                    <Badge className="mb-4 rounded-full bg-destructive text-destructive-foreground">
                      Hot Deal
                    </Badge>
                    <h2 className="text-3xl font-black text-foreground">
                      {featuredDeal.name}
                    </h2>
                    <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                      Featured discount from our current product catalog.
                    </p>
                    <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-bold text-muted-foreground">
                      <span className="rounded-full border border-primary/25 bg-primary/10 px-4 py-2">
                        <Clock className="mr-2 inline h-4 w-4 text-primary" />
                        Limited stock
                      </span>
                      <span className="rounded-full border border-primary/25 bg-primary/10 px-4 py-2">
                        Save today
                      </span>
                    </div>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <Button asChild={true} size="lg" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                        <Link href={`/products/${featuredDeal.slug}`}>
                          Shop This Deal
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="lg" className="rounded-full" onClick={() => void handleAddToCart(toProductCard(featuredDeal))}>
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                  <div className="flex h-72 items-center justify-center rounded-[2rem] bg-muted md:h-80 md:w-80">
                    <Percent className="h-32 w-32 text-muted-foreground/50" />
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-black text-foreground">
                All Current Deals
              </h2>
              <Button asChild={true} variant="outline" className="rounded-full">
                <Link href="/products?onSale=true">View All Deals</Link>
              </Button>
            </div>

            <ProductGrid
              products={deals.map(toProductCard)}
              onAddToCart={handleAddToCart}
              unknownProductLabel="Unknown Product"
              outOfStockLabel="Out of Stock"
              saleLabel="Sale"
              addToCartLabel="Add to Cart"
              uncategorizedLabel="Uncategorized"
            />
          </>
        )}
      </section>
    </main>
  );
}
