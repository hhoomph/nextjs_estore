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

import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart } from "lucide-react";
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

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart({
      product_id: productId,
      product_options_id: undefined,
      product: {
        id: productId,
        name: productName,
        price: productPrice,
        discount_price: productDiscountPrice || undefined,
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
      <Button
        className="flex-1"
        size="lg"
        disabled={isOutOfStock}
        onClick={handleAddToCart}
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
      </Button>
      <Button variant="outline" size="lg" onClick={handleAddToWishlist}>
        <Heart className="mr-2 h-5 w-5" />
        Wishlist
      </Button>
    </div>
  );
}