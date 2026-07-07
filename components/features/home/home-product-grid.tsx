"use client";

import { ProductGrid } from "@/components/features/products/product-grid";
import type { ProductCardProduct } from "@/components/features/products/product-card";
import { useCartActions } from "@/lib/hooks/use-simplified-cart-sync";

interface HomeProductGridProps {
  products: ProductCardProduct[];
  unknownProductLabel: string;
  outOfStockLabel: string;
  saleLabel: string;
  addToCartLabel: string;
  uncategorizedLabel: string;
}

export function HomeProductGrid({
  products,
  unknownProductLabel,
  outOfStockLabel,
  saleLabel,
  addToCartLabel,
  uncategorizedLabel,
}: HomeProductGridProps) {
  const { addToCart } = useCartActions();

  const handleAddToCart = async (product: ProductCardProduct) => {
    const currentPrice = product.discount_price ?? product.price;

    await addToCart({
      product_id: product.id,
      product: {
        id: product.id,
        name: product.name || unknownProductLabel,
        price: currentPrice,
        discount_price: currentPrice,
        slug: product.slug || "",
        product_pictures: (product.images ?? []).map((url) => ({
          picture: { url },
        })),
      },
      quantity: 1,
    });
  };

  return (
    <ProductGrid
      products={products}
      onAddToCart={handleAddToCart}
      unknownProductLabel={unknownProductLabel}
      outOfStockLabel={outOfStockLabel}
      saleLabel={saleLabel}
      addToCartLabel={addToCartLabel}
      uncategorizedLabel={uncategorizedLabel}
      addTestId="home-add-to-cart-btn"
    />
  );
}
