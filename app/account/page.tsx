"use client";

/**
 * Module for page
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import { useEffect, useRef, useState } from "react";

// Force Node.js runtime for account features
export const dynamic = "force-dynamic";

import {
  Bell,
  CreditCard,
  Edit,
  Heart,
  LogOut,
  MapPin,
  Package,
  Settings,
  ShoppingBag,
  User,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatAmount } from "@/lib/utils/currency";
import { useCurrencyStore } from "@/lib/stores/currency-store";
import { signOut, useSession } from "@/lib/auth-client";
import { useTranslations } from "next-intl";

export default function AccountPage() {
  const t = useTranslations("Account");
  const { data: session, isPending, refetch } = useSession();
  const { currency } = useCurrencyStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [browserSession, setBrowserSession] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [stats, setStats] = useState<{
    totalOrders: number;
    totalWishlist: number;
    totalSpent: number;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);
  const didRefetchSession = useRef(false);

  useEffect(() => {
    if (isPending || session?.user || didRefetchSession.current) return;

    didRefetchSession.current = true;
    void refetch();

    const timeoutId = window.setTimeout(() => {
      void refetch();
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [session, isPending, refetch]);

  useEffect(() => {
    const effectiveUser = isClient && (session?.user || browserSession?.user);
    if (!effectiveUser?.id) return;

    let cancelled = false;
    const loadStats = async () => {
      try {
        const res = await fetch("/api/account/stats", {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setStats({
            totalOrders: data.totalOrders ?? 0,
            totalWishlist: data.totalWishlist ?? 0,
            totalSpent: Number(data.totalSpent || 0),
          });
        }
      } catch {
        // Keep placeholder stats on failure
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    };

    void loadStats();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, browserSession?.user?.id, isClient]);

  useEffect(() => {
    if (session?.user) {
      setBrowserSession(null);
      return;
    }

    let cancelled = false;
    const loadBrowserSession = async () => {
      try {
        const response = await fetch("/api/auth/get-session", {
          credentials: "include",
        });
        if (!response.ok) return;
        const data = await response.json();
        const browserSession = data?.session?.user
          ? data.session
          : data?.session && data?.user
            ? { ...data.session, user: data.user }
            : null;

        if (!cancelled && browserSession?.user) {
          setBrowserSession(browserSession);
        }
      } catch {
        // Keep the existing guard UI if the manual session fetch fails.
      }
    };

    void loadBrowserSession();
    const timeoutId = window.setTimeout(loadBrowserSession, 500);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [session?.user?.id]);

  const effectiveSession = isClient && (session?.user ? session : browserSession);

  if (!effectiveSession?.user) {
    return (
      <div className="container px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">{t("pleaseSignIn")}</h1>
          <p className="text-muted-foreground mb-6">
            {t("signInRequired")}
          </p>
          <div className="space-x-4">
            <Button asChild={true}>
              <Link href="/auth/signin?redirect=/account">{t("signIn")}</Link>
            </Button>
            <Button variant="outline" asChild={true}>
              <Link href="/auth/signup?redirect=/account">{t("signUp")}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/";
        },
      },
    });
  };

  return (
    <div className="bg-background">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="container px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              {t("home")}
            </Link>
            <span>/</span>
            <span className="text-foreground">{t("account")}</span>
          </nav>
        </div>
      </div>

      <div className="container px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={effectiveSession.user.image || ""}
                alt={effectiveSession.user.name || ""}
              />
              <AvatarFallback className="text-xl">
                {effectiveSession.user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-bold">
                        {effectiveSession.user.name || t("user")}
                      </h1>
                      <p className="text-muted-foreground">
                        {effectiveSession.user.email}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">
                          {effectiveSession.user.role === "ADMIN"
                            ? t("administrator")
                            : t("customer")}
                        </Badge>
                        <Badge variant="outline">{t("verified")}</Badge>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Link href="/settings">
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          {t("settings")}
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSignOut()}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {t("signOut")}
                      </Button>
                    </div>
                  </div>
            </div>
          </div>

          {/* Account Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
            <TabsTrigger value="orders">{t("orders")}</TabsTrigger>
            <TabsTrigger value="wishlist">{t("wishlist")}</TabsTrigger>
            <TabsTrigger value="addresses">{t("addresses")}</TabsTrigger>
          </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t("totalOrders")}
                    </CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground ml-auto" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {statsLoading ? "…" : stats?.totalOrders ?? "—"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats?.totalOrders ? t("lifetimeOrders") : t("noOrdersYet")}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t("wishlistItems")}
                    </CardTitle>
                    <Heart className="h-4 w-4 text-muted-foreground ml-auto" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {statsLoading ? "…" : stats?.totalWishlist ?? "—"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats?.totalWishlist ? t("savedForLater") : t("wishlistEmpty")}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t("totalSpent")}
                    </CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground ml-auto" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {statsLoading ? "…" : formatAmount(stats?.totalSpent ?? 0, currency)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats?.totalSpent ? t("lifetimePurchases") : t("noPurchasesYet")}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("recentOrders")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Order #12345</p>
                          <p className="text-sm text-muted-foreground">
                            2 days ago
                          </p>
                        </div>
                        <Badge>Shipped</Badge>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Order #12344</p>
                          <p className="text-sm text-muted-foreground">
                            1 week ago
                          </p>
                        </div>
                        <Badge variant="outline">Delivered</Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      asChild={true}
                    >
                      <Link href="/orders">{t("viewAllOrders")}</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t("accountActions")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      asChild={true}
                    >
                      <Link href="/settings">
                        <Settings className="h-4 w-4 mr-2" />
                        {t("accountSettings")}
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      asChild={true}
                    >
                      <Link href="/orders">
                        <Package className="h-4 w-4 mr-2" />
                        {t("orderHistoryLink")}
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      asChild={true}
                    >
                      <Link href="/wishlist">
                        <Heart className="h-4 w-4 mr-2" />
                        {t("myWishlistLink")}
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Bell className="h-4 w-4 mr-2" />
                      {t("notifications")}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("orderHistory")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {t("noOrdersYet")}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {t("noOrdersYetDescription")}
                    </p>
                    <Button asChild={true}>
                      <Link href="/products">{t("startShopping")}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Wishlist Tab */}
            <TabsContent value="wishlist" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("myWishlist")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {t("wishlistEmpty")}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {t("wishlistEmptyDescription")}
                    </p>
                    <Button asChild={true}>
                      <Link href="/products">{t("browseProducts")}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("savedAddresses")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {t("noAddressesSaved")}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {t("addressesDescription")}
                    </p>
                    <Button>
                      <Edit className="h-4 w-4 mr-2" />
                      {t("addAddress")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

