import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { EnhancedCartItem } from "@/types/cart";

interface ReviewStepProps {
  cartItems: EnhancedCartItem[];
  cartTotal: number;
  isSubmitting: boolean;
  onSubmit: () => void;
  onPrevious: () => void;
}

export function ReviewStep({
  cartItems,
  cartTotal,
  isSubmitting,
  onSubmit,
  onPrevious,
}: ReviewStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Review</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Order Items */}
        <div>
          <h3 className="font-semibold mb-4">Items</h3>
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{item.quantity}</Badge>
                  <span className="font-medium">{item.product.name}</span>
                </div>
                <span className="font-medium">
                  $
                  {(item.product.discount_price || item.product.price) *
                    item.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Order Totals */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>$5.99</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>${(cartTotal * 0.08).toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>${(cartTotal + 5.99 + cartTotal * 0.08).toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onPrevious}>
            Back to Payment
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Place Order"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
