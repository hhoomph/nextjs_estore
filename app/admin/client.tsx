/**
 * Module for admin client
 *
 * @author hh.oomph@gmail.com
 * @version 4.0.0
 * @since 2025-01-01
 */
"use client";
import { AlertTriangle, ChevronUp, ChevronDown, DollarSign, Package, PackagePlus, Settings, ShoppingCart, TrendingUp, Users, UserCheck } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import type * as React from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAdminSettingsStore } from "@/lib/stores/admin-settings-store";
import { formatAmount } from "@/lib/utils/currency";
// Type definitions
interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders: Array<{
    id: string;
    total: number;
    createdAt: string;
    user: { name: string | null };
  }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
}
interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ComponentType<{ className?: string }>;
  iconBgClass?: string;
  iconColorClass?: string;
}
function MetricCard({ title, value, description, trend, icon: Icon, iconBgClass = "bg-primary/10", iconColorClass = "text-white" }: MetricCardProps) {
  return (
    <Card className="apex-stat-card min-h-[160px] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
        <div className={cn("apex-gradient-icon flex h-11 w-11 items-center justify-center rounded-2xl shrink-0", iconBgClass)}>
          <Icon className={cn("h-5 w-5", iconColorClass)} />
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="text-3xl font-bold tracking-tight text-foreground pt-1">{value}</div>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-sm text-muted-foreground">{description}</p>
          {trend && (
            <span className={cn("inline-flex items-center text-xs font-medium", trend.isPositive ? "text-success" : "text-destructive")}>
              {trend.isPositive ?
                <ChevronUp className="mr-0.5 h-3 w-3" />
              : <ChevronDown className="mr-0.5 h-3 w-3" />}
              {Math.abs(trend.value)}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
function OrderItem({ order, currency }: { order: { id: string; total: number; createdAt: string; user: { name: string | null } }; currency: string }) {
  const t = useTranslations("Admin Dashboard");
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/50 p-4 hover:bg-muted/70 transition-colors">
      <div className="flex-1">
        <p className="font-semibold text-foreground">{t("orderPrefix")}{order.id.slice(-8)}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {order.user?.name ?? t("guest")} • {new Date(order.createdAt).toLocaleDateString()}
        </p>
      </div>
      <Badge className="border-transparent bg-primary/10 text-primary shrink-0">{formatAmount(Number(order.total), currency)}</Badge>
    </div>
  );
}
function LowStockItem({ product }: { product: { id: string; name: string; quantity: number } }) {
  const t = useTranslations("Admin Dashboard");
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/50 p-4 hover:bg-muted/70 transition-colors">
      <div className="flex-1">
        <p className="font-semibold text-foreground">{product.name}</p>
        <p className="text-sm text-muted-foreground mt-1">{product.quantity} {t("remaining")}</p>
      </div>
      <Badge variant="destructive" className="bg-destructive/10 text-destructive shrink-0">
        {t("lowStock")}
      </Badge>
    </div>
  );
}
function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}) {
  const t = useTranslations("Admin Dashboard");
  return (
    <a href={href} className="apex-action-card block p-5 hover:translate-y-[-2px] transition-all duration-200">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0 transition-colors">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      <div className="mt-4 flex items-center text-sm font-medium text-primary">{t("goToPage")}</div>
    </a>
  );
}
const EMPTY_STATS: DashboardStats = {
  totalProducts: 0,
  totalOrders: 0,
  totalUsers: 0,
  totalRevenue: 0,
  recentOrders: [],
  lowStockProducts: [],
};
export default function AdminDashboard() {
  const t = useTranslations("Admin Dashboard");
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const { defaultCurrency } = useAdminSettingsStore();
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Clear message timeout on unmount
  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);
  const fetchDashboardStats = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/dashboard/stats");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch dashboard stats");
      }
      const payload = data?.stats ?? data ?? {};
      setStats({
        totalProducts: Number(payload.totalProducts ?? 0),
        totalOrders: Number(payload.totalOrders ?? 0),
        totalUsers: Number(payload.totalUsers ?? 0),
        totalRevenue: Number(payload.totalRevenue ?? 0),
        recentOrders: Array.isArray(payload.recentOrders) ? payload.recentOrders : [],
        lowStockProducts: Array.isArray(payload.lowStockProducts) ? payload.lowStockProducts : [],
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred while loading dashboard data";
      setError(errorMessage);
      console.error("Failed to fetch dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void fetchDashboardStats();
  }, []);
  if (loading) {
    return (
      <div className="space-y-6 pb-8">
        {/* Section skeleton */}
        <section className="mb-6 overflow-hidden rounded-[2rem] border border-border bg-card p-6 animate-pulse">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
              <div className="h-9 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
            </div>
            <div className="flex h-12 w-48 rounded-2xl bg-muted animate-pulse" />
          </div>
        </section>
        {/* Stat cards skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="apex-stat-card min-h-[160px] p-6 animate-pulse">
              <div className="flex h-6 w-1/3 animate-pulse rounded bg-muted" />
              <div className="mt-4 h-11 w-11 animate-pulse rounded-2xl bg-muted" />
              <div className="mt-4 h-9 w-3/4 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-5 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-[2rem] border border-border bg-card py-12 text-center shadow-lg">
        <p className="mb-4 text-destructive">{error}</p>
        <Button
          onClick={() => {
            setLoading(true);
            setError("");
            void fetchDashboardStats();
          }}
          variant="default"
          className="rounded-xl"
        >
          {t("tryAgain")}
        </Button>
      </div>
    );
  }
  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <section className="mb-6 overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">{t("welcomeBack")}</p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("dashboard")}</h1>
            <p className="text-sm leading-relaxed text-muted-foreground max-w-2xl">{t("dashboardDescription")}</p>
          </div>
          <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground shrink-0">
            <p className="font-medium text-foreground">
              {new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }).format(new Date())}
            </p>
            <p>{t("apexWorkspaceTheme")}</p>
          </div>
        </div>
      </section>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title={t("stats.totalRevenue")}
          value={formatAmount(stats.totalRevenue, defaultCurrency)}
          description={t("stats.fromLastMonth")}
          trend={{ value: 12.5, isPositive: true }}
          icon={DollarSign}
          iconColorClass="text-white"
          iconBgClass="bg-primary/10"
        />
        <MetricCard
          title={t("activeUsers")}
          value={stats.totalUsers}
          description={t("currentlyEngaged")}
          trend={{ value: 8.2, isPositive: true }}
          icon={UserCheck}
          iconColorClass="text-warning"
          iconBgClass="bg-success/10"
        />
        <MetricCard
          title={t("stats.totalOrders")}
          value={stats.totalOrders}
          description={t("allTime")}
          trend={{ value: 3.1, isPositive: false }}
          icon={ShoppingCart}
          iconColorClass="text-white"
          iconBgClass="bg-warning/10"
        />
        <MetricCard
          title={t("products")}
          value={stats.totalProducts}
          description={t("activeListings")}
          icon={Package}
          iconColorClass="text-warning"
          iconBgClass="bg-primary/10"
        />
      </div>
      {/* Recent Orders */}
      <Card className="apex-stat-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold tracking-tight text-foreground">{t("recentOrders")}</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentOrders.length > 0 ?
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <OrderItem key={order.id} order={order} currency={defaultCurrency} />
              ))}
            </div>
          : <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground">{t("noRecentOrders")}</p>
            </div>
          }
        </CardContent>
      </Card>
      {/* Low Stock Alert */}
      <Card className="apex-stat-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground">
            <AlertTriangle className="h-5 w-5 text-warning" />
            {t("lowStockAlert")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.lowStockProducts.length > 0 ?
            <div className="space-y-3">
              {stats.lowStockProducts.map((product) => (
                <LowStockItem key={product.id} product={product} />
              ))}
            </div>
          : <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
              <Package className="mx-auto h-12 w-12 text-success/50 mb-4" />
              <p className="text-sm text-muted-foreground">{t("allProductsWellStocked")}</p>
            </div>
          }
        </CardContent>
      </Card>
      {/* Quick Actions */}
      <Card className="apex-stat-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold tracking-tight text-foreground">{t("quickActions")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <QuickActionCard title={t("addNewProduct")} description={t("createNewProductListing")} icon={PackagePlus} href="/admin/products" />
            <QuickActionCard title={t("manageUsers")} description={t("viewManageUserAccounts")} icon={Users} href="/admin/users" />
            <QuickActionCard title={t("settings")} description={t("configureStorePreferences")} icon={Settings} href="/admin/settings" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}