/**
 * Module for page
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

// Force dynamic rendering to avoid prerendering issues
export const dynamic = "force-dynamic";

import { CheckCircle, Download, Home, Package, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SafeSessionStorage } from "@/lib/utils/storage-ssr";

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  transactionCode?: string;
  items: Array<{
    id: string;
    product: {
      id: string;
      name: string;
      slug: string;
      price: number;
      discountPrice: number | null;
      image: string | null;
    };
    quantity: number;
  }>;
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order");

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) {
      router.push("/");
      return;
    }

    const getCheckoutSessionId = () => {
      try {
        const stored = SafeSessionStorage.getItem("checkout_session");
        if (!stored) return null;

        const parsed = JSON.parse(stored) as { id?: unknown };
        return typeof parsed.id === "string" ? parsed.id : null;
      } catch {
        return null;
      }
    };

    const loadOrder = async () => {
      const checkoutSessionId = getCheckoutSessionId();
      const headers: HeadersInit = checkoutSessionId
        ? { "x-checkout-session-id": checkoutSessionId }
        : {};

      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
          headers,
        });
        const data = (await response.json()) as
          | OrderDetails
          | { error?: string };

        if (!response.ok) {
          throw new Error(
            "error" in data && data.error ? data.error : "Order not found",
          );
        }

        setOrder(data as OrderDetails);
        SafeSessionStorage.removeItem("checkout_session");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Order not found");
      } finally {
        setLoading(false);
      }
    };

    void loadOrder();
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading order details...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container px-4 py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-muted-foreground mb-8">{error}</p>
          <Link href="/">
            <Button>
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="container px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <span>/</span>
            <Link href="/checkout" className="hover:text-foreground">
              Checkout
            </Link>
            <span>/</span>
            <span className="text-foreground">Success</span>
          </nav>
        </div>
      </div>

      <div className="container px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Order Confirmed!</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Thank you for your purchase. Your order has been successfully placed
            and is being processed.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Order Number</h3>
                    <p className="text-lg font-mono">{order.orderNumber}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Order Date</h3>
                    <p className="text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Order Status</h3>
                    <Badge
                      variant="default"
                      className="bg-success/10 text-success"
                    >
                      {order.status}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Transaction ID</h3>
                    <p className="text-sm font-mono text-muted-foreground">
                      {order.transactionCode}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Order Summary */}
                <div>
                  <h3 className="font-semibold mb-4">Order Summary</h3>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${(order.total * 0.88).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>$5.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${(order.total * 0.08).toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Purchased Items</h3>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 border rounded-lg p-3"
                      >
                        {item.product.image ? (
                          <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              fill={true}
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
                            No image
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Qty {item.quantity} · $
                            {(item.product.discountPrice ?? item.product.price).toFixed(2)}
                          </p>
                        </div>
                        <p className="text-sm font-semibold">
                          ${(item.product.discountPrice ?? item.product.price) * item.quantity}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Steps */}
                <div>
                  <h3 className="font-semibold mb-4">What's Next?</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-primary">
                          1
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium">Order Processing</h4>
                        <p className="text-sm text-muted-foreground">
                          We're preparing your order for shipment. This usually
                          takes 1-2 business days.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-primary">
                          2
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium">Shipping</h4>
                        <p className="text-sm text-muted-foreground">
                          Once shipped, you'll receive a tracking number via
                          email.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-primary">
                          3
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium">Delivery</h4>
                        <p className="text-sm text-muted-foreground">
                          Standard delivery takes 3-5 business days. Express
                          delivery is 1-2 days.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/orders" className="w-full">
                  <Button className="w-full" variant="outline">
                    <Package className="h-4 w-4 mr-2" />
                    View All Orders
                  </Button>
                </Link>
                <Link href="/products" className="w-full">
                  <Button className="w-full" variant="outline">
                    Continue Shopping
                  </Button>
                </Link>
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Receipt
                </Button>
              </CardContent>
            </Card>

            {/* Shipping Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    <strong>Estimated Delivery:</strong>
                    <br />
                    3-5 business days
                  </p>
                  <p>
                    <strong>Shipping Method:</strong>
                    <br />
                    Standard Shipping
                  </p>
                  <p>
                    <strong>Tracking:</strong>
                    <br />
                    Available once shipped
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Need Help */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <p>Questions about your order?</p>
                  <p className="text-muted-foreground">
                    Contact our support team at{" "}
                    <a
                      href="mailto:support@estore.com"
                      className="text-primary hover:underline"
                    >
                      support@estore.com
                    </a>
                  </p>
                  <p className="text-muted-foreground">
                    Or call us at{" "}
                    <a
                      href="tel:1-800-123-4567"
                      className="text-primary hover:underline"
                    >
                      1-800-123-4567
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Continue Shopping CTA */}
        <div className="text-center mt-12">
          <div className="bg-muted/50 rounded-lg p-8 max-w-2xl mx-auto">
            <Package className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Love Shopping With Us?
            </h3>
            <p className="text-muted-foreground mb-6">
              Discover more amazing products and enjoy exclusive deals on your
              next purchase.
            </p>
            <Link href="/products">
              <Button size="lg">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading...</span>
          </div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}

