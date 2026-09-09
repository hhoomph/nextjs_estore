"use client";

import { Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/features/products/product-grid";
import { SectionHeading } from "@/components/features/layout/section-heading";
import { type ProductCardProduct } from "@/components/features/products/product-card";
import { ProductPrice } from "@/components/ui/product-price";
import { useCartActions } from "@/lib/hooks/use-simplified-cart-sync";
import { useWishlistStore, type WishlistItem } from "@/lib/stores/wishlist-store";

function toProductCard(item: WishlistItem): ProductCardProduct {
  return {
    id: item.product_id,
    name: item.product.name,
    slug: item.product.slug,
    price: item.product.price,
    discount_price: item.product.discount_price,
    images: item.product.product_pictures?.map((picture) => picture.picture.url),
    inStock: true,
  };
}

export default function WishlistPage() {
  const t = useTranslations("Wishlist");
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addToCart } = useCartActions();

  const handleAddToCart = async (product: ProductCardProduct) => {
    const currentPrice = product.discount_price ?? product.price;

    await addToCart({
      product_id: product.id,
      product: {
        id: product.id,
        name: product.name,
        price: currentPrice,
        discount_price: currentPrice,
        slug: product.slug ?? "",
        product_pictures: (product.images ?? []).map((url) => ({ picture: { url } })),
      },
      quantity: 1,
    });
  };

  const handleRemoveItem = (productId: string) => {
    removeItem(productId);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b bg-background/80 backdrop-blur">
        <div className="container px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/" className="font-semibold text-foreground">
              {t("home")}
            </Link>
            <span>/</span>
            <span className="font-bold text-foreground">{t("title")}</span>
          </nav>
        </div>
      </div>

      <section className="overflow-hidden bg-background">
        <div className="container px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={t("title")}
            description={t("description")}
          />
        </div>
      </section>

      <div className="container px-4 py-12 sm:px-6 lg:px-8">
        {items.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-[2.5rem] border border-border/60 bg-card p-10 text-center shadow-xl shadow-primary/10">
            <Heart className="mx-auto mb-5 h-16 w-16 text-primary/70" />
            <h1 className="text-2xl font-black text-foreground">{t("empty.title")}</h1>
            <p className="mt-3 text-muted-foreground">{t("empty.description")}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild={true} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/products">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  {t("empty.browseProducts")}
                </Link>
              </Button>
              <Button asChild={true} variant="outline" className="rounded-full">
                <Link href="/deals">{t("empty.viewDeals")}</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-black text-foreground">{t("savedProducts")}</h2>
                <p className="mt-1 text-muted-foreground">{t("itemsSaved", { count: items.length })}</p>
              </div>
              <Button variant="outline" className="rounded-full" onClick={() => clearWishlist()}>
                {t("clearWishlist")}
              </Button>
            </div>

            <ProductGrid
              products={items.map(toProductCard)}
              onAddToCart={handleAddToCart}
              unknownProductLabel={t("unknownProduct")}
              outOfStockLabel={t("outOfStock")}
              saleLabel={t("sale")}
              addToCartLabel={t("addToCart")}
              uncategorizedLabel={t("title")}
            />

            <div className="mt-8 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-border/60 bg-card p-4 shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-foreground">{item.product.name}</p>
                    <ProductPrice
                      price={item.product.price}
                      discountPrice={item.product.discount_price}
                      amountClassName="text-sm"
                    />
                  </div>
                  <Button variant="ghost" className="rounded-full text-destructive" onClick={() => handleRemoveItem(item.product_id)}>
                    {t("remove")}
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
