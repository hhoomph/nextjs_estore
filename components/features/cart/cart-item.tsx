/**
 * Lazy-loaded Cart Item Component
 * Optimized for bundle size reduction
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatAmount } from "@/lib/utils/currency";
import { useCurrencyStore } from "@/lib/stores/currency-store";
import type { EnhancedCartItem } from "@/types/cart";

interface CartItemProps {
  item: EnhancedCartItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

export const CartItem = memo(function CartItem({
  item,
  onUpdateQuantity,
  onRemoveItem,
}: CartItemProps) {
  const { currency } = useCurrencyStore();
  const price = item.product.discount_price || item.product.price;

  return (
    <div
      data-testid="cart-item"
      className="flex gap-4 py-4 border-b border-border/50 last:border-b-0 bg-card hover:bg-accent/5 rounded-lg p-3 transition-colors"
    >
      <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted shrink-0 border border-border">
        {item.product.product_pictures?.[0] ? (
          <Image
            src={item.product.product_pictures[0].picture.url}
            alt={item.product.name || "Product"}
            fill={true}
            className="object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-muted border border-border">
            <ShoppingBag className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate text-card-foreground">
          {item.product.name}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-medium text-primary">
            {formatAmount(price, currency)}
          </span>
          {item.product.discount_price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatAmount(item.product.price, currency)}
            </span>
          )}
          {item.options && (
            <Badge
              variant="outline"
              className="text-xs border-primary/20 text-primary"
            >
              {item.options.value}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 mt-3">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-border hover:bg-accent hover:text-accent-foreground"
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="text-sm font-medium w-8 text-center bg-muted rounded px-2 py-1 text-muted-foreground">
            {item.quantity}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-border hover:bg-accent hover:text-accent-foreground"
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-auto"
            onClick={() => onRemoveItem(item.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
});
