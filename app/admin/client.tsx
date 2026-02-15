"use client";

import {
  AlertTriangle,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders: Array<{
    id: string;
    total: number;
    created_at: string;
    user: { name: string };
  }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
}

export default function AdminDashboard() {
  const t = useTranslations("Admin Dashboard");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch dashboard stats");
      }

      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" />
          <p className="mt-2 text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <button
          onClick={() => fetchDashboardStats()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          {t("tryAgain")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.totalProducts")}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalProducts || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span>{" "}
              {t("stats.fromLastMonth")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.totalOrders")}
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span>{" "}
              {t("stats.fromLastMonth")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.totalUsers")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+15%</span>{" "}
              {t("stats.fromLastMonth")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.totalRevenue")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.totalRevenue?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+23%</span>{" "}
              {t("stats.fromLastMonth")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("recentOrders")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentOrders?.length ? (
                stats.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div>
                      <p className="font-medium">Order #{order.id.slice(-8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.user.name} •{" "}
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary">${order.total.toFixed(2)}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">{t("noRecentOrders")}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              {t("lowStockAlert")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.lowStockProducts?.length ? (
                stats.lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.quantity} {t("remaining")}
                      </p>
                    </div>
                    <Badge variant="destructive">Low Stock</Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">
                  {t("allProductsWellStocked")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("quickActions")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
              <Package className="h-8 w-8 mb-2 text-blue-600" />
              <h3 className="font-medium">{t("addNewProduct")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("createNewProductListing")}
              </p>
            </button>

            <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
              <Users className="h-8 w-8 mb-2 text-green-600" />
              <h3 className="font-medium">{t("manageUsers")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("viewManageUserAccounts")}
              </p>
            </button>

            <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
              <TrendingUp className="h-8 w-8 mb-2 text-purple-600" />
              <h3 className="font-medium">{t("viewAnalytics")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("checkSalesPerformance")}
              </p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
