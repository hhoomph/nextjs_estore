import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { EnhancedCartItem } from "@/types/cart";

interface ReviewStepProps {
  cartItems: EnhancedCartItem[];
  cartTotal: number;
  shippingCost: number;
  tax: number;
  isSubmitting: boolean;
  onSubmit: () => void;
  onPrevious: () => void;
}

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}

export function ReviewStep({
  cartItems,
  cartTotal,
  shippingCost,
  tax,
  isSubmitting,
  onSubmit,
  onPrevious,
}: ReviewStepProps) {
  const total = cartTotal + shippingCost + tax;

  return (
    <Card className="rounded-[2rem] border border-primary/20 shadow-xl shadow-primary/10">
      <CardHeader>
        <CardTitle className="text-xl font-black text-foreground">
          Order Review
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={onSubmit}>
          <div>
            <h3 className="mb-4 font-black text-foreground">Items</h3>
            <div className="space-y-3">
              {cartItems.map((item) => {
                const image = item.product.product_pictures?.[0]?.picture?.url;
                return (
                  <div key={item.id} className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      {image ? (
                        <Image
                          src={image}
                          alt={item.product.name || "Cart product"}
                          width={56}
                          height={56}
                          className="h-14 w-14 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                          <Badge variant="secondary">{item.quantity}</Badge>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-bold text-foreground">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-muted-foreground">Qty {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-black text-foreground">
                      {formatCurrency(
                        (item.product.discount_price || item.product.price) *
                          item.quantity,
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          <div className="space-y-2 rounded-3xl bg-muted p-4">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>{formatCurrency(shippingCost)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-black text-foreground">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="flex justify-between gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              className="rounded-full"
            >
              Back to Payment
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? "Processing..." : "Place Order"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
