/**
 * Cart page component
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

"use client";

import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { AdvancedErrorBoundary } from "@/components/errors/advanced-error-boundary";
import { SectionHeading } from "@/components/features/layout/section-heading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  useCartActions,
  useSimplifiedCartSync,
} from "@/lib/hooks/use-simplified-cart-sync";

interface SiteSettings {
  defaultCurrency?: string;
}

function toHexTestId(value: string): string {
  const first = hashTestId(value, 0x811c9dc5);
  const second = hashTestId(value, 0x100001b3);

  return `${first}${second}`;
}

function hashTestId(value: string, seed: number): string {
  let hash = seed;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

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
  const { items } = useSimplifiedCartSync();
  const {
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCartActions();

  // 4. State hooks - all defined together at the top.
  // `mounted` is the only local UI state; `isLoading` was previously
  // declared but never flipped back to `true` after the initial mount,
  // so the dead `if (isLoading) return …` branch has been removed.
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
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

  const formatCurrency = (value: number) =>
    `${currencySymbol}${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    await updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeFromCart(itemId);
  };

  const handleClearCart = async () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Are you sure you want to clear your cart?")
    ) {
      return;
    }
    await clearCart();
  };

  const calculateTotal = () => {
    if (!items) return 0;
    return items.reduce((total, item) => {
      const price = item.product?.discount_price || item.product?.price || 0;
      return total + price * item.quantity;
    }, 0);
  };

  const cartItems = items || [];
  const total = calculateTotal();
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AdvancedErrorBoundary>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{tCheckout("continueShopping")}</span>
              </Button>
              <div className="flex-1">
                <SectionHeading
                  eyebrow={cartItems.length > 0 ? `${totalQuantity} ${tCart("cartItemCount")}` : undefined}
                  title={tNavigation("cart")}
                  align="left"
                  className="max-w-none"
                />
              </div>
            </div>

            {cartItems.length > 0 && (
              <Button
                variant="outline"
                onClick={handleClearCart}
                className="text-destructive hover:text-destructive"
                data-testid="cart-clear"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {tCart("clearCart")}
              </Button>
            )}
          </div>

          {/* Cart Content */}
          {cartItems.length === 0 ? (
            <Card className="text-center py-16" data-testid="cart-empty">
              <CardContent>
                <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-2">
                  {tCart("cartEmpty")}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {tCart("cartEmptyMessage")}
                </p>
                <Button
                  asChild={true}
                  data-testid="cart-empty-continue-shopping"
                >
                  <Link href="/products">{tCheckout("continueShopping")}</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4" data-testid="cart-items">
                {cartItems.map((item) => {
                  const product = item.product;
                  if (!product) return null;

                  const cartItemTestId = toHexTestId(item.id);
                  const price = product.discount_price || product.price;
                  const subtotal = price * item.quantity;

                  return (
                    <Card key={item.id} data-testid={`cart-item-${cartItemTestId}`}>
                      <CardContent className="p-6">
                        <div className="flex space-x-4">
                          {/* Product Image */}
                          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted">
                            {product.product_pictures?.[0]?.picture?.url ? (
                              <Image
                                src={product.product_pictures[0].picture.url}
                                alt={product.name || "Cart product"}
                                width={96}
                                height={96}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <ShoppingCart className="h-8 w-8 text-muted-foreground/50" />
                              </div>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">
                              {product.name}
                            </h3>
                            <p className="text-sm font-semibold text-muted-foreground">
                              Qty {item.quantity}
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
                                  data-testid={`cart-item-${cartItemTestId}-quantity-decrease`}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span
                                  className="w-12 text-center"
                                  data-testid={`cart-item-${cartItemTestId}-quantity`}
                                >
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
                                  data-testid={`cart-item-${cartItemTestId}-quantity-increase`}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>

                              <div className="text-right">
                                <p className="font-semibold">
{formatCurrency(subtotal)}
                                </p>
                                {product.discount_price && (
                                  <p className="text-sm text-muted-foreground line-through">
                                    {formatCurrency(product.price)}
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
                            data-testid={`cart-item-${cartItemTestId}-remove`}
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
                  <CardHeader data-testid="cart-summary-header">
                    <CardTitle>{tOrder("orderSummary")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div
                      className="flex justify-between"
                      data-testid="cart-subtotal"
                    >
                      <span>{tCart("cartSubtotal")}</span>
                      <span>
                        {formatCurrency(total)}
                      </span>
                    </div>

                    <div
                      className="flex justify-between"
                      data-testid="cart-shipping"
                    >
                      <span>{tCart("cartShipping")}</span>
                      <span className="text-success">Free</span>
                    </div>

                    <Separator />

                    <div
                      className="flex justify-between font-semibold text-lg"
                      data-testid="cart-total"
                    >
                      <span>{tCart("cartTotal")}</span>
                      <span>
                        {formatCurrency(total)}
                      </span>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      asChild={true}
                      data-testid="checkout-button"
                    >
                      <Link href="/checkout">
                        {tCheckout("proceedToCheckout")}
                      </Link>
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full"
                      asChild={true}
                      data-testid="cart-continue-shopping"
                    >
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
