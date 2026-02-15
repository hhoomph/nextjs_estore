/**
 * Cart page component
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

// Force dynamic rendering to avoid prerendering issues
export const dynamic = "force-dynamic";

// Disable static optimization completely
export const runtime = "nodejs";

import {
  AlertTriangle,
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import Link from "next/link";
// Use client API route to fetch site settings instead of importing server actions
import { AdvancedErrorBoundary } from "@/components/errors/advanced-error-boundary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  useCartActions,
  useSimplifiedCartSync,
} from "@/lib/hooks/use-simplified-cart-sync";

export default function CartPage() {
  // ALL hooks must be called at the top level, BEFORE any conditional returns
  // This is critical for React's Rules of Hooks

  // 1. Router hook
  const router = useRouter();

  // 2. Translation hooks
  const tNavigation = useTranslations("Navigation");
  const tCart = useTranslations("Cart Operations");
  const tCheckout = useTranslations("Checkout & Cart");
  const tOrder = useTranslations("Order Review");

  // 3. Cart sync hooks
  const { items, itemCount } = useSimplifiedCartSync();
  const {
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isUsingUserCart,
  } = useCartActions();

  // 4. State hooks - all defined together at the top
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 5. Effect hooks - all defined together at the top
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (!res.ok) return;
        const result = await res.json();
        if (result?.settings) setSiteSettings(result.settings);
      } catch (error) {
        console.error("Failed to fetch site settings:", error);
      }
    };
    fetchSettings();
  }, []);

  // Only render cart content after mounting on client
  // This check happens AFTER all hooks are called
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currency = siteSettings?.defaultCurrency || "USD";
  const currencySymbol =
    currency === "IRR" ? "تومان" : currency === "USD" ? "$" : currency;

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    await updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeFromCart(itemId);
  };

  const handleClearCart = async () => {
    await clearCart();
  };

  const calculateTotal = () => {
    if (!items) return 0;
    return items.reduce((total, item) => {
      const price = item.product?.discount_price || item.product?.price || 0;
      return total + price * item.quantity;
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const cartItems = items || [];
  const total = calculateTotal();

  return (
    <AdvancedErrorBoundary>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{tCheckout("continueShopping")}</span>
              </Button>
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-6 w-6" />
                <h1 className="text-3xl font-bold">{tNavigation("cart")}</h1>
                {cartItems.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {cartItems.length} {tCart("cartItemCount")}
                  </Badge>
                )}
              </div>
            </div>

            {cartItems.length > 0 && (
              <Button
                variant="outline"
                onClick={handleClearCart}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {tCart("clearCart")}
              </Button>
            )}
          </div>

          {/* Cart Content */}
          {cartItems.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-2">
                  {tCart("cartEmpty")}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {tCart("cartEmptyMessage")}
                </p>
                <Button asChild={true}>
                  <Link href="/products">{tCheckout("continueShopping")}</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => {
                  const product = item.product;
                  if (!product) return null;

                  const price = product.discount_price || product.price;
                  const subtotal = price * item.quantity;

                  return (
                    <Card key={item.id}>
                      <CardContent className="p-6">
                        <div className="flex space-x-4">
                          {/* Product Image */}
                          <div className="w-20 h-20 bg-muted rounded-md flex-shrink-0">
                            {/* Placeholder for product image */}
                            <div className="w-full h-full bg-muted-foreground/10 rounded-md flex items-center justify-center">
                              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                            </div>
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">
                              {product.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Product ID: {product.id}
                            </p>

                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.id,
                                      item.quantity - 1,
                                    )
                                  }
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-12 text-center">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.id,
                                      item.quantity + 1,
                                    )
                                  }
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>

                              <div className="text-right">
                                <p className="font-semibold">
                                  {currencySymbol}
                                  {subtotal.toLocaleString()}
                                </p>
                                {product.discount_price && (
                                  <p className="text-sm text-muted-foreground line-through">
                                    {currencySymbol}
                                    {product.price.toLocaleString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Remove Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>{tOrder("orderSummary")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>{tCart("cartSubtotal")}</span>
                      <span>
                        {currencySymbol}
                        {total.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>{tCart("cartShipping")}</span>
                      <span className="text-green-600">Free</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between font-semibold text-lg">
                      <span>{tCart("cartTotal")}</span>
                      <span>
                        {currencySymbol}
                        {total.toLocaleString()}
                      </span>
                    </div>

                    <Button className="w-full" size="lg" asChild={true}>
                      <Link href="/checkout">
                        {tCheckout("proceedToCheckout")}
                      </Link>
                    </Button>

                    <Button variant="outline" className="w-full" asChild={true}>
                      <Link href="/products">
                        {tCheckout("continueShopping")}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdvancedErrorBoundary>
  );
}
