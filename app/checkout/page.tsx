/**
 * Module for page
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  Check,
  ChevronLeft,
  CreditCard,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AdvancedErrorBoundary } from "@/components/errors/advanced-error-boundary";
import { AddressForm } from "@/components/features/addresses/AddressForm";
import { AddressSelector } from "@/components/features/addresses/AddressSelector";
import { GuestCheckoutFlow } from "@/components/features/checkout/guest-checkout-flow";
import { OrderSummary } from "@/components/features/checkout/order-summary";
import { SectionHeading } from "@/components/features/layout/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth-client";
import { SHIPPING_COST, TAX_RATE } from "@/lib/constants/checkout";
import { useCartStore } from "@/lib/stores/cart-store";
import { useGuestCartStore } from "@/lib/stores/guest-cart-store";
import type { EnhancedCartItem } from "@/types/cart";

const paymentSchema = z.object({
  cardNumber: z.string().min(16, "Card number must be 16 digits"),
  expiryDate: z
    .string()
    .regex(/^\d{2}\/\d{2}$/, "Expiry date must be MM/YY format"),
  cvv: z.string().min(3, "CVV must be at least 3 digits"),
  cardName: z.string().min(1, "Cardholder name is required"),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const userCartStore = useCartStore();
  const guestCartStore = useGuestCartStore();
  const [cartReady, setCartReady] = useState(false);
  const isGuest = !session?.user;
  const cartStore = isGuest ? guestCartStore : userCartStore;

  const { items: cartItems, getTotal, clearCart } = cartStore;

  useEffect(() => {
    let mounted = true;
    const waitForHydration = (store: { persist: { hasHydrated: () => boolean | Promise<boolean> } }) =>
      Promise.race([
        store.persist.hasHydrated(),
        new Promise((resolve) => setTimeout(resolve, 100)),
      ]);

    void Promise.all([
      waitForHydration(useCartStore),
      waitForHydration(useGuestCartStore),
    ]).then(() => {
      if (mounted) setCartReady(true);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const cartTotal = getTotal();

  // Loading state while checking authentication
  if (isPending || !cartReady) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <div className="container px-4 py-20">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            Add some items to your cart before checking out.
          </p>
          <Link href="/products">
            <Button>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AdvancedErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <div className="border-b">
          <div className="container px-4 py-3">
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
              <span>/</span>
              <Link href="/cart" className="hover:text-foreground">
                Cart
              </Link>
              <span>/</span>
              <span className="text-foreground">Checkout</span>
            </nav>
          </div>
        </div>

        <div className="container px-4 py-8">
          {/* Checkout Header */}
          <SectionHeading
            eyebrow={isGuest ? "Guest Checkout" : "Secure Checkout"}
            title="Checkout"
            description={
              isGuest
                ? "Complete your order as a guest or sign in to access your account features."
                : "Review your order details and complete your purchase."
            }
            className="mb-8"
          />

          {isGuest ? (
            /* Guest Checkout Flow */
            <GuestCheckoutFlow
              cartItems={cartItems}
              cartTotal={cartTotal}
              onSuccess={(orderId) => {
                clearCart();
                router.push(`/checkout/success?order=${orderId}`);
              }}
              onError={(error) => {
                console.error("Checkout error:", error);
                // Handle error (show toast, etc.)
              }}
            />
          ) : (
            /* Authenticated User Checkout Flow */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content - Authenticated User Flow */}
              <div className="lg:col-span-2">
                <AuthenticatedCheckoutFlow
                  cartItems={cartItems}
                  cartTotal={cartTotal}
                  onSuccess={(orderId) => {
                    clearCart();
                    router.push(`/checkout/success?order=${orderId}`);
                  }}
                  onError={(error) => {
                    console.error("Checkout error:", error);
                    // Handle error (show toast, etc.)
                  }}
                />
              </div>

              <div className="lg:col-span-1">
                <OrderSummary
                  items={cartItems.map((item) => ({
                    id: item.id,
                    name: item.product.name,
                    quantity: item.quantity,
                    image: item.product.product_pictures?.[0]?.picture.url ?? null,
                    price: item.product.price,
                    discountPrice: item.product.discount_price,
                  }))}
                  subtotal={cartTotal}
                  shippingCost={SHIPPING_COST}
                  taxRate={TAX_RATE}
                />
              </div>
            </div>
          )}

          {/* Sign in prompt for guests */}
          {isGuest && (
            <div className="mt-8 text-center border-t pt-8">
              <p className="text-sm text-muted-foreground mb-4">
                Already have an account?
              </p>
              <Link
                href="/auth/signin"
                className="text-primary hover:underline"
              >
                Sign in for faster checkout and order history
              </Link>
            </div>
          )}
        </div>
      </div>
    </AdvancedErrorBoundary>
  );
}

/**
 * Authenticated User Checkout Flow Component
 * Simplified version for logged-in users
 */
function AuthenticatedCheckoutFlow({
  cartItems,
  cartTotal,
  onSuccess,
  onError,
}: {
  cartItems: EnhancedCartItem[];
  cartTotal: number;
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
}) {
  const { selectedShippingAddress, setShippingAddress } = useCartStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);

  const paymentForm = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });

  const [shippingMethod] = useState("standard");

  const subtotal = cartTotal;
  const shippingCost = SHIPPING_COST;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shippingCost + tax;

  const handlePaymentSubmit = paymentForm.handleSubmit(async (data) => {
    setLoading(true);

    try {
      const orderData = {
        shippingAddress: selectedShippingAddress,
        payment: data,
        items: cartItems,
        shippingMethod,
        totals: { subtotal, shipping: shippingCost, tax, total },
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) throw new Error("Failed to create order");

      const result = await response.json();
      onSuccess(result.id);
    } catch (error) {
      onError(
        error instanceof Error ? error.message : "Failed to create order",
      );
    } finally {
      setLoading(false);
    }
  });

  return (
    <>
      {/* Progress Steps */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div
            className={`flex items-center space-x-2 ${currentStep >= 1 ? "text-primary" : "text-muted-foreground"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? "bg-primary text-primary-foreground" : "bg-muted"}`}
            >
              {currentStep > 1 ? <Check className="h-4 w-4" /> : "1"}
            </div>
            <span className="hidden sm:inline">Shipping</span>
          </div>
          <div
            className={`w-8 h-0.5 ${currentStep >= 2 ? "bg-primary" : "bg-muted"}`}
          />
          <div
            className={`flex items-center space-x-2 ${currentStep >= 2 ? "text-primary" : "text-muted-foreground"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"}`}
            >
              {currentStep > 2 ? <Check className="h-4 w-4" /> : "2"}
            </div>
            <span className="hidden sm:inline">Payment</span>
          </div>
          <div
            className={`w-8 h-0.5 ${currentStep >= 3 ? "bg-primary" : "bg-muted"}`}
          />
          <div
            className={`flex items-center space-x-2 ${currentStep >= 3 ? "text-primary" : "text-muted-foreground"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? "bg-primary text-primary-foreground" : "bg-muted"}`}
            >
              3
            </div>
            <span className="hidden sm:inline">Review</span>
          </div>
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <AddressSelector
            selectedAddressId={selectedShippingAddress?.id}
            onAddressSelect={(address) =>
              setShippingAddress(address || undefined)
            }
            onAddNew={() => setAddressDialogOpen(true)}
            title="Select Shipping Address"
            description="Choose the address where you want your order delivered"
          />

          <div className="flex justify-end">
            <Button
              onClick={() => selectedShippingAddress && setCurrentStep(2)}
              disabled={!selectedShippingAddress}
            >
              Continue to Payment
            </Button>
          </div>

          <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Address</DialogTitle>
                <DialogDescription>
                  Add a new shipping address for your order delivery.
                </DialogDescription>
              </DialogHeader>
              <AddressForm
                onSuccess={() => setAddressDialogOpen(false)}
                onCancel={() => setAddressDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      )}

      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  {...paymentForm.register("cardNumber")}
                />
                {paymentForm.formState.errors.cardNumber && (
                  <p className="text-sm text-destructive mt-1">
                    {paymentForm.formState.errors.cardNumber.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    {...paymentForm.register("expiryDate")}
                  />
                  {paymentForm.formState.errors.expiryDate && (
                    <p className="text-sm text-destructive mt-1">
                      {paymentForm.formState.errors.expiryDate.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    {...paymentForm.register("cvv")}
                  />
                  {paymentForm.formState.errors.cvv && (
                    <p className="text-sm text-destructive mt-1">
                      {paymentForm.formState.errors.cvv.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input
                  id="cardName"
                  placeholder="John Doe"
                  {...paymentForm.register("cardName")}
                />
                {paymentForm.formState.errors.cardName && (
                  <p className="text-sm text-destructive mt-1">
                    {paymentForm.formState.errors.cardName.message}
                  </p>
                )}
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                >
                  Back to Shipping
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Review Order"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Order Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Shipping Address</h3>
              <div className="text-sm text-muted-foreground">
                <p>{selectedShippingAddress?.addressLine1}</p>
                {selectedShippingAddress?.addressLine2 && (
                  <p>{selectedShippingAddress?.addressLine2}</p>
                )}
                <p>
                  {selectedShippingAddress?.city},{" "}
                  {selectedShippingAddress?.state}{" "}
                  {selectedShippingAddress?.postalCode}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Payment Method</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                <span>
                  **** **** ****{" "}
                  {paymentForm.getValues("cardNumber")?.slice(-4)}
                </span>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(2)}
              >
                Back to Payment
              </Button>
              <Button onClick={() => handlePaymentSubmit()} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  `Pay $${total.toFixed(2)}`
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
