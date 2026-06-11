/**
 * Customer dashboard page.
 *
 * Renders an overview for signed-in non-admin users. Admins are redirected
 * to the admin panel. Guests are redirected to the homepage so they can
 * sign in.
 *
 * Fix from implementation_plan.md §[Files] §1.7: the previous version of
 * this component fetched data and then unconditionally `return null`ed
 * for non-admins, leaving the route permanently blank. The component now
 * renders a real overview (stats cards + recent orders + recent products)
 * wired to the same endpoints the previous skeleton already fetched.
 *
 * @author hh.oomph@gmail.com
 * @version 1.1.0
 * @since 2025-01-01
 */
"use client";

import {
  AlertCircle,
  CreditCard,
  Heart,
  Loader2,
  Package,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, Suspense, useEffect, useState } from "react";
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
import { useBrowserSession } from "@/lib/hooks/use-browser-session";

// Force dynamic rendering to avoid prerendering issues
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface DashboardStats {
  totalUsers?: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  recentOrders: number;
  lowStockProducts?: number;
}

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  items: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  status: number;
  category: { name: string };
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

const formatDate = (value: string) => {
  try {
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return value;
  }
};

const orderStatusVariant = (status: string) => {
  const normalized = status.toUpperCase();
  if (normalized === "DELIVERED" || normalized === "COMPLETED")
    return "default" as const;
  if (normalized === "CANCELLED" || normalized === "FAILED")
    return "destructive" as const;
  return "secondary" as const;
};

function DashboardSkeleton() {
  return (
    <div
      className="flex justify-center items-center py-20"
      data-testid="dashboard-skeleton"
    >
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <span className="ml-2">Loading dashboard...</span>
    </div>
  );
}

function DashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      className="container mx-auto px-4 py-12"
      data-testid="dashboard-error"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <CardTitle>Couldn&rsquo;t load your dashboard</CardTitle>
          </div>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardContent() {
  const { session: browserSession, isLoading: isSessionLoading } =
    useBrowserSession();
  const router = useRouter();

  // State hooks — all together at the top, before any conditional return,
  // so React's Rules of Hooks are satisfied regardless of which branch
  // renders below.
  const [activeTab] = useState<"overview">("overview");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const readJson = async <T,>(response: Response): Promise<T> => {
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsResponse, ordersResponse, productsResponse] = await Promise.all([
        fetch("/api/dashboard/stats", { credentials: "include" }),
        fetch("/api/orders?limit=5", { credentials: "include" }),
        fetch("/api/products?limit=5", { credentials: "include" }),
      ]);

      const [statsData, ordersData, productsData] = await Promise.all([
        readJson<{ stats?: DashboardStats | null }>(statsResponse),
        readJson<{ orders?: Order[] }>(ordersResponse),
        readJson<{ products?: Product[]; data?: Product[] }>(productsResponse),
      ]);

      setStats(statsData.stats ?? null);
      setOrders(Array.isArray(ordersData.orders) ? ordersData.orders : []);
      setProducts(
        Array.isArray(productsData.products)
          ? productsData.products
          : Array.isArray(productsData.data)
            ? productsData.data
            : [],
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while loading your dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect: handle auth + initial data load
  useEffect(() => {
    if (isSessionLoading) return;

    if (!browserSession?.user) {
      // Not signed in — bounce to homepage (which shows the sign-in CTA
      // for unauthenticated users).
      router.replace("/");
      return;
    }

    if (browserSession.user.role === "ADMIN") {
      // Admins live in the admin panel.
      router.replace("/admin");
      return;
    }

    void fetchDashboardData();
  }, [browserSession?.user, fetchDashboardData, isSessionLoading, router]);

  // Loading branch — hooks above MUST run first (they always do because
  // they sit above the first conditional return).
  if (isSessionLoading || loading) {
    return <DashboardSkeleton />;
  }

  // Error branch
  if (error) {
    return <DashboardError message={error} onRetry={fetchDashboardData} />;
  }

  // Auth gate (defensive — effect above should have redirected already)
  const user = browserSession?.user;
  if (!user || user.role === "ADMIN") {
    return <DashboardSkeleton />;
  }

  // Real overview
  return (
    <div
      className="container mx-auto px-4 py-8"
      data-testid="customer-dashboard"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome back{user.name ? `, ${user.name}` : ""}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&rsquo;s a snapshot of your store activity.
        </p>
      </div>

      {/* Stats cards */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        data-testid="dashboard-stats"
      >
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground ml-auto" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-orders">
              {stats?.totalOrders ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.recentOrders ?? 0} in the last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground ml-auto" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-revenue">
              {formatCurrency(stats?.totalRevenue ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground">Lifetime revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground ml-auto" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-products">
              {stats?.totalProducts ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.lowStockProducts ?? 0} low on stock
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two-column body */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <Card data-testid="dashboard-recent-orders">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your last {orders.length} orders</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingBag className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p>No orders yet.</p>
                <Button asChild={true} variant="outline" className="mt-4">
                  <Link href="/products">Start shopping</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order, index) => (
                  <div key={order.id}>
                    {index > 0 && <Separator className="my-2" />}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          Order #{order.id.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.created_at)} ·{" "}
                          {order.items ?? 0} item
                          {(order.items ?? 0) === 1 ? "" : "s"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(order.total)}
                        </p>
                        <Badge
                          variant={orderStatusVariant(order.status)}
                          className="mt-1"
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
                <Button asChild={true} variant="outline" className="w-full">
                  <Link href="/orders">View all orders</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent products */}
        <Card data-testid="dashboard-recent-products">
          <CardHeader>
            <CardTitle>Browse Products</CardTitle>
            <CardDescription>Fresh from the catalog</CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p>No products available right now.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product, index) => (
                  <div key={product.id}>
                    {index > 0 && <Separator className="my-2" />}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.category?.name ?? "Uncategorized"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(product.price)}
                        </p>
                        {product.quantity <= 5 && (
                          <Badge variant="outline" className="mt-1">
                            {product.quantity} left
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <Button asChild={true} variant="outline" className="w-full">
                  <Link href="/products">View all products</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <Button asChild={true} variant="outline" className="w-full">
          <Link href="/wishlist">
            <Heart className="h-4 w-4 mr-2" />
            My wishlist
          </Link>
        </Button>
        <Button asChild={true} variant="outline" className="w-full">
          <Link href="/orders">
            <Package className="h-4 w-4 mr-2" />
            Order history
          </Link>
        </Button>
        <Button asChild={true} variant="outline" className="w-full">
          <Link href="/settings">
            <CreditCard className="h-4 w-4 mr-2" />
            Account settings
          </Link>
        </Button>
      </div>

      {/* Suppress unused warnings for the placeholder tab state */}
      <span className="sr-only">{`tab:${activeTab}`}</span>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
