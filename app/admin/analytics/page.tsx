"use client";

import { useCallback, useEffect, useState } from "react";
import type * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Loader2,
} from "lucide-react";
import { useAdminSettingsStore } from "@/lib/stores/admin-settings-store";
import { formatAmount } from "@/lib/utils/currency";

interface AnalyticsData {
  salesData: Array<{ date: string; revenue: number; orders: number }>;
  userGrowth: Array<{ date: string; users: number }>;
  topProducts: Array<{ name: string; sales: number; revenue: number }>;
  categoryPerformance: Array<{
    name: string;
    sales: number;
    revenue: number;
    percentage: number;
  }>;
  totalStats: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    averageOrderValue: number;
  };
}

const COLORS = ["var(--primary)", "var(--success)", "var(--warning)", "var(--destructive)", "var(--secondary)"];

const EMPTY_STATS: AnalyticsData["totalStats"] = {
  totalRevenue: 0,
  totalOrders: 0,
  totalCustomers: 0,
  averageOrderValue: 0,
};

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("30");

  const defaultCurrency = useAdminSettingsStore((state) => state.defaultCurrency);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/analytics?period=${period}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch analytics");
      }

      setAnalytics(data.analytics || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[2rem] border border-border bg-card py-12 text-center shadow-lg">
        <p className="mb-4 text-destructive">{error}</p>
        <Button
          onClick={() => void fetchAnalytics()}
          className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Try Again
        </Button>
      </div>
    );
  }

  const salesData = analytics?.salesData ?? [];
  const userGrowth = analytics?.userGrowth ?? [];
  const topProducts = analytics?.topProducts ?? [];
  const categoryPerformance = analytics?.categoryPerformance ?? [];
  const totalStats = analytics?.totalStats ?? EMPTY_STATS;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Analytics workspace
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              Analytics
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Sales performance, customer growth, and category insights in a clean
              Apex-inspired layout.
            </p>
          </div>

          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-48 rounded-xl border-border bg-background">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={formatAmount(Number(totalStats.totalRevenue || 0), defaultCurrency)}
          description="for the selected period"
          icon={DollarSign}
        />
        <MetricCard
          title="Total Orders"
          value={String(totalStats.totalOrders ?? 0)}
          description="for the selected period"
          icon={ShoppingCart}
        />
        <MetricCard
          title="Total Customers"
          value={String(totalStats.totalCustomers ?? 0)}
          description="unique buyers"
          icon={Users}
        />
        <MetricCard
          title="Average Order Value"
          value={formatAmount(Number(totalStats.averageOrderValue || 0), defaultCurrency)}
          description="per order"
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Sales Trend">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <YAxis yAxisId="revenue" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
              <YAxis
                yAxisId="orders"
                orientation="right"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 16,
                  border: "1px solid var(--border)",
                  boxShadow: "0 18px 45px color-mix(in oklch, var(--foreground) 8%, transparent)",
                }}
                labelFormatter={(value) =>
                  new Date(value as string).toLocaleDateString()
                }
                formatter={(value, name) => [
                  name === "revenue" ? `$${Number(value).toFixed(2)}` : value,
                  name === "revenue" ? "Revenue" : "Orders",
                ]}
              />
              <Line
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                  stroke="var(--primary)"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                yAxisId="orders"
                type="monotone"
                dataKey="orders"
                  stroke="var(--success)"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="User Growth">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 16,
                  border: "1px solid var(--border)",
                  boxShadow: "0 18px 45px color-mix(in oklch, var(--foreground) 8%, transparent)",
                }}
                labelFormatter={(value) =>
                  new Date(value as string).toLocaleDateString()
                }
                formatter={(value) => [value, "New Users"]}
              />
                  <Bar dataKey="users" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="apex-stat-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold tracking-tight text-foreground">
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.length === 0 ? (
                <p className="text-center py-12 text-sm text-muted-foreground">
                  No sales data available
                </p>
              ) : (
                topProducts.slice(0, 5).map((product, index) => (
                  <div
                    key={`${product.name}-${index}`}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-muted/60 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-sm font-bold text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {product.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {product.sales} sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-success">
                        {formatAmount(Number(product.revenue), defaultCurrency)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="apex-stat-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold tracking-tight text-foreground">
              Category Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryPerformance.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No category data available
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryPerformance.slice(0, 5)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="var(--primary)"
                    dataKey="revenue"
                  >
                    {categoryPerformance.slice(0, 5).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      formatAmount(Number(value), defaultCurrency),
                      "Revenue",
                    ]}
                    contentStyle={{
                      borderRadius: 16,
                  border: "1px solid var(--border)",
                  boxShadow: "0 18px 45px color-mix(in oklch, var(--foreground) 8%, transparent)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="apex-stat-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {title}
        </CardTitle>
        <div className="apex-gradient-icon flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight text-foreground">
          {value}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="apex-stat-card">
      <CardHeader>
        <CardTitle className="text-base font-semibold tracking-tight text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
