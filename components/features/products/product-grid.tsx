"use client";

import { ProductCard, type ProductCardProduct } from "@/components/features/products/product-card";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: ProductCardProduct[];
  onAddToCart?: (product: ProductCardProduct) => void;
  unknownProductLabel: string;
  outOfStockLabel: string;
  saleLabel: string;
  addToCartLabel: string;
  uncategorizedLabel: string;
  className?: string;
  showAddToCart?: boolean;
  addTestId?: string;
}

export function ProductGrid({
  products,
  onAddToCart = () => undefined,
  unknownProductLabel,
  outOfStockLabel,
  saleLabel,
  addToCartLabel,
  uncategorizedLabel,
  className,
  showAddToCart = true,
  addTestId,
}: ProductGridProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className={cn("grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", className)}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          unknownProductLabel={unknownProductLabel}
          outOfStockLabel={outOfStockLabel}
          saleLabel={saleLabel}
          addToCartLabel={addToCartLabel}
          uncategorizedLabel={uncategorizedLabel}
          showAddToCart={showAddToCart}
          addTestId={addTestId}
        />
      ))}
    </div>
  );
}
