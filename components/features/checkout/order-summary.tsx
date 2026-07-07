import Image from "next/image";
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProductPrice } from "@/components/ui/product-price";
import { cn } from "@/lib/utils";

interface OrderSummaryItem {
  id: string;
  name: string;
  quantity: number;
  image?: string | null;
  price: number;
  discountPrice?: number | null;
}

interface OrderSummaryProps {
  items: OrderSummaryItem[];
  subtotal: number;
  shippingCost?: number;
  taxRate?: number;
  title?: string;
  className?: string;
  footer?: ReactNode;
}

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}

export function OrderSummary({
  items,
  subtotal,
  shippingCost = 0,
  taxRate = 0,
  title = "Order Summary",
  className,
  footer,
}: OrderSummaryProps) {
  const tax = subtotal * taxRate;
  const total = subtotal + shippingCost + tax;

  return (
    <Card className={cn("sticky top-20", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length > 0 && (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3">
                {item.image ? (
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted-foreground/10 text-xs opacity-50">
                    📦
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  <ProductPrice
                    price={item.price * item.quantity}
                    discountPrice={
                      item.discountPrice ? item.discountPrice * item.quantity : 0
                    }
                    amountClassName="text-sm font-medium"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <Separator />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{formatCurrency(shippingCost)}</span>
          </div>
          {taxRate > 0 && (
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{formatCurrency(tax)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        {footer}
      </CardContent>
    </Card>
  );
}
