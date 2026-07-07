"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ProductActionButton } from "@/components/ui/product-action-button";
import { ProductPrice } from "@/components/ui/product-price";
import { cn } from "@/lib/utils";
import { PLACEHOLDER_IMAGE } from "@/lib/utils/image-utils";

export interface ProductCardProduct {
  id: string;
  name: string | null;
  slug?: string | null;
  category?: { name?: string | null } | null;
  price: number;
  discount_price?: number | null;
  images?: string[];
  inStock: boolean;
}

interface ProductCardProps {
  product: ProductCardProduct;
  onAddToCart: (product: ProductCardProduct) => void;
  unknownProductLabel: string;
  outOfStockLabel: string;
  saleLabel: string;
  addToCartLabel: string;
  uncategorizedLabel: string;
  addTestId?: string;
  className?: string;
  showAddToCart?: boolean;
}

export function ProductCard({
  product,
  onAddToCart,
  unknownProductLabel,
  outOfStockLabel,
  saleLabel,
  addToCartLabel,
  uncategorizedLabel,
  addTestId,
  className,
  showAddToCart = true,
}: ProductCardProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const productHref = product.slug ? `/products/${product.slug}` : "/products";
  const productName = product.name || unknownProductLabel;
  const categoryName = product.category?.name || uncategorizedLabel;
  const imageSrc = product.images?.[0];
  const discountPercentage =
    product.discount_price && product.price > product.discount_price
      ? Math.round(((product.price - product.discount_price) / product.price) * 100)
      : null;

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <Card
      className={cn(
        "group/card overflow-hidden rounded-[2rem] border border-border/60 bg-card/95 text-card-foreground shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl",
        className,
      )}
    >
      <CardHeader className="p-0">
        <Link href={productHref} className="block">
          <div className="group/image relative aspect-square overflow-hidden bg-muted">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={productName}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition duration-700 group-hover/image:scale-110"
              />
            ) : (
              <div className="relative h-full w-full bg-muted">
                <Image
                  src={PLACEHOLDER_IMAGE}
                  alt={productName}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover opacity-50"
                />
              </div>
            )}
            {!product.inStock && (
              <Badge className="absolute left-2 top-2 rounded-full bg-destructive px-3 py-1 text-xs font-bold text-destructive-foreground shadow-lg">
                {outOfStockLabel}
              </Badge>
            )}
            {product.discount_price ? (
              <Badge className="absolute right-2 top-2 rounded-full bg-primary px-3 py-1 text-xs font-black text-primary-foreground shadow-lg">
                {discountPercentage ? `${discountPercentage}% OFF` : saleLabel}
              </Badge>
            ) : null}
          </div>
        </Link>
      </CardHeader>

      <CardContent className="space-y-3 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          {categoryName}
        </p>
        <Link href={productHref}>
          <h3 className="line-clamp-2 cursor-pointer font-black leading-6 text-foreground transition group-hover:text-primary">
            {productName}
          </h3>
        </Link>
        <ProductPrice
          price={product.price}
          discountPrice={product.discount_price}
          amountClassName="text-xl font-black text-foreground"
          originalClassName="text-xs text-muted-foreground"
        />
      </CardContent>

      <CardFooter className="p-5 pt-0">
        {showAddToCart ? (
          <ProductActionButton
            inStock={product.inStock}
            label={addToCartLabel}
            outOfStockLabel={outOfStockLabel}
            disabled={!isHydrated}
            onClick={() => onAddToCart(product)}
            testId={addTestId}
          />
        ) : (
          <Button asChild={true} variant="outline" className="w-full rounded-full font-bold">
            <Link href={productHref}>View Details</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
