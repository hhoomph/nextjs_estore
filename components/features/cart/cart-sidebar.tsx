/**
 * Enhanced Cart Sidebar with WCAG 2.1 AA Compliance and Animations
 *
 * @author hh.oomph@gmail.com
 * @version 2.1.0
 * @since 2025-01-01
 */
"use client";

import { Minus, Plus, RefreshCw, ShoppingBag, User, X } from "lucide-react";
// Lazy load cart item component for bundle optimization
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FocusTrap, LiveRegion } from "@/components/ui/enhanced-accessibility";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";
import { useCartSync } from "@/lib/hooks/use-cart-sync";
import { useCartStore } from "@/lib/stores/cart-store";
import { useGuestCartStore } from "@/lib/stores/guest-cart-store";
import {
  getEnhancedBackdropClasses,
  getEnhancedOverlayClasses,
  getOverlayTextClasses,
  isDarkTheme,
} from "@/lib/utils/overlay-utils";
import {
  getThemeAwareBackgroundClasses,
  getThemeAwareBorderClasses,
  getThemeAwareTextClasses,
} from "@/lib/utils/theme-utils";
import { type CartSidebarProps, EnhancedCartItem } from "@/types/cart";

const CartItem = dynamic(
  () => import("./cart-item").then((mod) => ({ default: mod.CartItem })),
  {
    loading: () => (
      <div className="flex gap-4 py-4 border-b border-border/50 last:border-b-0 bg-card rounded-lg p-3">
        <div className="h-16 w-16 rounded-md bg-muted animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted animate-pulse rounded" />
          <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-muted animate-pulse rounded" />
            <div className="h-8 w-8 bg-muted animate-pulse rounded" />
            <div className="h-8 w-8 bg-muted animate-pulse rounded ml-auto" />
          </div>
        </div>
      </div>
    ),
  },
);

export function CartSidebar({
  theme,
  animations = true,
}: CartSidebarProps = {}) {
  const t = useTranslations("Cart Sidebar");
  const { data: session } = useSession();
  const { isSyncing, error } = useCartSync();

  // Always call hooks at the top level - never conditionally
  const authenticatedCart = useCartStore();
  const guestCart = useGuestCartStore();

  const isGuest = !session?.user;
  const cartData = isGuest ? guestCart : authenticatedCart;
  const { isOpen, setCartOpen } = cartData; // Use the same cart store for both items and open state

  const { items, removeItem, updateQuantity, getTotal, getItemCount } =
    cartData;

  // Only guest cart has isLoading
  const isLoading = isGuest ? guestCart.isLoading : false;

  const total = getTotal();
  const itemCount = getItemCount();

  // Get theme-aware classes
  const bgClasses = getThemeAwareBackgroundClasses();
  const textClasses = getThemeAwareTextClasses();
  const borderClasses = getThemeAwareBorderClasses();

  return (
    <Sheet open={isOpen} onOpenChange={setCartOpen}>
      <SheetContent
        side="right"
        className={`w-full sm:max-w-lg flex flex-col bg-background text-foreground border-border`}
        data-testid="cart-sidebar"
        aria-labelledby="cart-sidebar-title"
        aria-describedby="cart-sidebar-description"
      >
        <FocusTrap onEscape={() => setCartOpen(false)}>
          <SheetHeader
            className={`shrink-0 ${borderClasses.light} ${borderClasses.dark} pb-4 bg-card/50 relative`}
          >
            <div className="absolute left-4 top-4 z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCartOpen(false)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label={t("closeButton")}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">{t("closeButton")}</span>
              </Button>
            </div>
            <SheetTitle
              id="cart-sidebar-title"
              className="flex items-center justify-center pt-2"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag
                  className="h-5 w-5 text-primary"
                  aria-hidden="true"
                />
                <span
                  className={`${textClasses.light} ${textClasses.dark} font-semibold`}
                >
                  {t("title")}
                </span>
                {itemCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2"
                    aria-label={`${itemCount} ${t("itemsCount")}`}
                  >
                    {itemCount}
                  </Badge>
                )}
              </div>
              {isGuest && (
                <div
                  className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full border border-border/50 ml-4"
                  role="status"
                  aria-live="polite"
                >
                  <User className="h-3 w-3" aria-hidden="true" />
                  <span>{t("guestLabel")}</span>
                  {isSyncing && (
                    <RefreshCw
                      className="h-3 w-3 animate-spin text-primary"
                      data-testid="sync-indicator"
                      aria-label={t("syncing")}
                    />
                  )}
                </div>
              )}
            </SheetTitle>
            <SheetDescription id="cart-sidebar-description" className="sr-only">
              {isGuest ? t("guestDescription") : t("authenticatedDescription")}
            </SheetDescription>
            {error && (
              <div
                className="text-sm text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-md mt-2"
                role="alert"
                aria-live="assertive"
              >
                {t("errorMessage")}: {error}
              </div>
            )}
          </SheetHeader>

          {/* Live region for cart updates */}
          <LiveRegion priority="polite" className="sr-only">
            {t("cartStatus", {
              count: itemCount,
              total: total.toLocaleString("fa-IR"),
            })}
          </LiveRegion>
        </FocusTrap>

        {isLoading ? (
          <div
            className="flex-1 flex items-center justify-center"
            aria-live="polite"
          >
            <div className="space-y-4 w-full max-w-sm">
              <Skeleton className="h-4 w-3/4" aria-hidden="true" />
              <Skeleton className="h-16 w-full" aria-hidden="true" />
              <Skeleton className="h-16 w-full" aria-hidden="true" />
              <Skeleton className="h-12 w-full" aria-hidden="true" />
            </div>
          </div>
        ) : items.length === 0 ? (
          <div
            className="flex-1 flex flex-col items-center justify-center text-center py-12 bg-card rounded-lg mx-2 my-4 border border-border"
            role="status"
            aria-live="polite"
          >
            <div
              className="bg-muted/50 rounded-full p-4 mb-4"
              aria-hidden="true"
            >
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-card-foreground">
              {t("emptyTitle")}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-xs text-sm">
              {t("emptyMessage")}
            </p>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              asChild={true}
              onClick={() => setCartOpen(false)}
              aria-label={t("continueShopping")}
            >
              <Link href="/products">{t("continueShopping")}</Link>
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-1 pr-6">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemoveItem={removeItem}
                  />
                ))}
              </div>
            </ScrollArea>

            <div
              className="border-t border-border pt-4 space-y-4 shrink-0 bg-card/50 -mx-6 px-6 pb-6"
              role="region"
              aria-labelledby="cart-total-section"
            >
              <div
                className={`flex justify-between items-center text-lg font-semibold ${textClasses.light} ${textClasses.dark}`}
                id="cart-total-section"
              >
                <span aria-label={t("totalLabel")}>{t("totalText")}:</span>
                <span
                  className="text-primary font-bold"
                  aria-label={`${t("totalAmount", { amount: total.toLocaleString("fa-IR") })}`}
                >
                  {total.toLocaleString("fa-IR")} {t("currency")}
                </span>
              </div>

              {isGuest && (
                <div
                  className="text-xs text-muted-foreground bg-muted/70 border border-border/50 p-3 rounded-md"
                  role="note"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-3 w-3" aria-hidden="true" />
                    <span className="font-medium text-card-foreground">
                      {t("guestCheckoutTitle")}
                    </span>
                  </div>
                  <p>{t("guestCheckoutMessage")}</p>
                </div>
              )}

              <div
                className="space-y-2"
                role="group"
                aria-label={t("checkoutActions")}
              >
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl dark:shadow-primary/25 dark:hover:shadow-2xl"
                  size="lg"
                  asChild={true}
                  onClick={() => setCartOpen(false)}
                  aria-label={t("proceedToCheckout")}
                >
                  <Link href="/checkout">{t("checkoutButton")}</Link>
                </Button>
                <Button
                  variant="outline"
                  className={`w-full ${borderClasses.light} ${borderClasses.dark} hover:bg-accent hover:text-accent-foreground`}
                  asChild={true}
                  onClick={() => setCartOpen(false)}
                  aria-label={t("viewFullCart")}
                >
                  <Link href="/cart">{t("viewCartButton")}</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
