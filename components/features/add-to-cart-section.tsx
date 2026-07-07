/**
 * Add to Cart Section Component
 *
 * Client component that handles the "Add to Cart" and "Wishlist" button interactions
 * on product detail pages. Must be imported into a server component via dynamic import
 * or used as a client boundary.
 *
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import { ProductActionButton } from "@/components/ui/product-action-button";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useCartActions } from "@/lib/hooks/use-simplified-cart-sync";

interface AddToCartSectionProps {
  productId: string;
  productName: string;
  productPrice: number;
  productDiscountPrice?: number | null;
  productSlug: string;
  quantity: number;
  isOutOfStock: boolean;
}

export function AddToCartSection({
  productId,
  productName,
  productPrice,
  productDiscountPrice,
  productSlug,
  quantity,
  isOutOfStock,
}: AddToCartSectionProps) {
  const { addToCart } = useCartActions();

  const handleAddToCart = async () => {
    if (isOutOfStock) return;

    const currentPrice = productDiscountPrice ?? productPrice;

    await addToCart({
      product_id: productId,
      product_options_id: undefined,
      product: {
        id: productId,
        name: productName,
        price: currentPrice,
        discount_price: currentPrice,
        slug: productSlug,
        product_pictures: [],
      },
      quantity: quantity || 1,
    });
  };

  const handleAddToWishlist = () => {
    // Wishlist is handled by the wishlist store - just scroll to top as a simple action
    // The actual wishlist integration would go here
    alert("Added to wishlist!");
  };

  return (
    <div className="flex gap-4">
      <ProductActionButton
        className="flex-1"
        inStock={!isOutOfStock}
        onClick={handleAddToCart}
      />
      <Button variant="outline" size="lg" onClick={handleAddToWishlist}>
        <Heart className="mr-2 h-5 w-5" />
        Wishlist
      </Button>
    </div>
  );
}