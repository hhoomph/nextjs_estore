/**
 * Module for analytics
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import type * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserGrowthDatum {
  month: string;
  users: number;
}

interface OrderStat {
  status: string;
  count: number;
  percentage: number;
}

interface RevenueStat {
  month: string;
  revenue: number;
}

interface PopularProduct {
  name: string;
  sales: number;
  revenue: number;
}

interface ActivityItemData {
  id: string;
  title: string;
  time: string;
  color: "primary" | "success" | "warning" | "danger";
}

interface AnalyticsState {
  userGrowth: UserGrowthDatum[];
  orderStats: OrderStat[];
  revenueStats: RevenueStat[];
  popularProducts: PopularProduct[];
  recentActivity: ActivityItemData[];
}

const analyticsInitialState: AnalyticsState = {
  userGrowth: [],
  orderStats: [],
  revenueStats: [],
  popularProducts: [],
  recentActivity: [],
};

export function Analytics() {
  const t = useTranslations("Admin Analytics");
  const [analytics, setAnalytics] = useState<AnalyticsState>(
    analyticsInitialState,
  );
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsResponse, ordersResponse] = await Promise.all([
        fetch("/api/admin/analytics?period=90", { credentials: "include" }),
        fetch("/api/admin/orders?limit=5", { credentials: "include" }),
      ]);

      if (!analyticsResponse.ok) {
        throw new Error("Failed to load analytics");
      }

      const payload = await analyticsResponse.json();
      const data = payload?.analytics ?? {};

      let recentActivity: ActivityItemData[] = [];
      if (ordersResponse.ok) {
        const ordersPayload = await ordersResponse.json();
        recentActivity = (ordersPayload?.orders ?? []).map((order: any) => ({
          id: order.id,
          title:
            (order.user?.name ?? "Guest") +
            " placed order #" +
            String(order.id).slice(0, 8) +
            " \u00b7 $" +
            Number(order.total).toFixed(2),
          time: formatRelativeTime(order.createdAt),
          color:
            order.status === "COMPLETED"
              ? "success"
              : order.status === "CANCELLED"
                ? "danger"
                : "primary",
        }));
      }

      setAnalytics({
        userGrowth: groupByMonth(data.userGrowth ?? [], "users").map((row) => ({
          month: row.month,
          users: row.value,
        })),
        revenueStats: groupByMonth(data.salesData ?? [], "revenue").map((row) => ({
          month: row.month,
          revenue: row.value,
        })),
        orderStats: (data.orderStatusBreakdown ?? []).map((stat: any) => ({
          status: stat.status,
          count: Number(stat.count),
          percentage: Number(stat.percentage),
        })),
        popularProducts: (data.topProducts ?? []).slice(0, 5).map((product: any) => ({
          name: product.name,
          sales: Number(product.sales),
          revenue: Number(product.revenue),
        })),
        recentActivity,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    );
  }

  const maxUserGrowth = Math.max(1, ...analytics.userGrowth.map((data) => data.users));
  const maxRevenue = Math.max(1, ...analytics.revenueStats.map((data) => data.revenue));
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Analytics workspace
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          Performance insights
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Apex-style cards keep growth, revenue, product demand, and customer
          activity visually separated without losing the shared design language.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MetricCard
          title="User Growth"
          description="Monthly visitor traffic trends"
          accent="primary"
        >
          <div className="flex h-64 items-end justify-between gap-3 pt-4">
            {analytics.userGrowth.map((data) => (
              <div key={data.month} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-2xl bg-primary transition-all duration-300 hover:bg-primary/90"
                  style={{ height: `${Math.max(4, (data.users / maxUserGrowth) * 200)}px` }}
                />
                <span className="text-xs font-medium text-muted-foreground">
                  {data.month}
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {data.users}
                </span>
              </div>
            ))}
          </div>
        </MetricCard>

        <MetricCard
          title="Order Status Distribution"
          description="Current order health"
          accent="success"
        >
          <div className="space-y-4 pt-4">
            {analytics.orderStats.map((stat) => (
              <div key={stat.status} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">
                    {stat.status}
                  </span>
                  <span className="font-semibold text-muted-foreground">
                    {stat.count} · {stat.percentage}%
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cnStatusClass(stat.status)}
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </MetricCard>

        <MetricCard
          title="Revenue Trend"
          description="Monthly revenue movement"
          accent="warning"
        >
          <div className="flex h-64 items-end justify-between gap-3 pt-4">
            {analytics.revenueStats.map((data) => (
              <div key={data.month} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-2xl bg-warning transition-all duration-300 hover:bg-primary"
                  style={{ height: `${Math.max(4, (data.revenue / maxRevenue) * 200)}px` }}
                />
                <span className="text-xs font-medium text-muted-foreground">
                  {data.month}
                </span>
                <span className="text-xs font-semibold text-foreground">
                  ${data.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </MetricCard>

        <MetricCard
          title="Popular Products"
          description="Best sellers by revenue"
          accent="primary"
        >
          <div className="space-y-4 pt-4">
            {analytics.popularProducts.slice(0, 5).map((product, index) => (
              <div
                key={product.name}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-muted/60 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-sm font-bold text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.sales} sales
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-success">
                  ${product.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </MetricCard>
      </div>

      <Card className="apex-stat-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold tracking-tight text-foreground">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recent orders yet.
              </p>
            ) : (
              analytics.recentActivity.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  color={activity.color}
                  title={activity.title}
                  time={activity.time}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  title,
  description,
  accent,
  children,
}: {
  title: string;
  description: string;
  accent: "primary" | "success" | "warning";
  children: React.ReactNode;
}) {
  return (
    <Card className="apex-stat-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base font-semibold tracking-tight text-foreground">
              {title}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {description}
            </p>
          </div>
          <Badge className={cnAccentBadge(accent)}>
            {accent === "primary"
              ? "Growth"
              : accent === "success"
                ? "Healthy"
                : "Revenue"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ActivityItem({
  color,
  title,
  time,
}: {
  color: "primary" | "success" | "warning" | "danger";
  title: string;
  time: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={cnActivityDot(color)} />
      <div className="flex-1">
        <p className="text-sm text-foreground">
          <span className="font-semibold">{title}</span>
        </p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  );
}

function cnStatusClass(status: string) {
  if (status === "Completed") {
    return "h-2.5 rounded-full bg-success";
  }

  if (status === "Pending") {
    return "h-2.5 rounded-full bg-warning";
  }

  return "h-2.5 rounded-full bg-destructive";
}

function cnAccentBadge(accent: "primary" | "success" | "warning") {
  if (accent === "success") {
    return "border-transparent bg-success/10 text-success";
  }

  if (accent === "warning") {
    return "border-transparent bg-warning/10 text-warning";
  }

  return "border-transparent bg-primary/10 text-primary";
}

function cnActivityDot(color: "primary" | "success" | "warning" | "danger") {
  const colorClass =
    color === "success"
      ? "bg-success"
      : color === "warning"
        ? "bg-warning"
        : color === "danger"
          ? "bg-destructive"
          : "bg-primary";

  return `h-2.5 w-2.5 rounded-full ${colorClass}`;
}


const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function groupByMonth(
  rows: Array<{ date: string } & Record<string, unknown>>,
  valueKey: "users" | "revenue",
): Array<{ month: string; value: number }> {
  const buckets = new Map<string, number>();

  for (const row of rows) {
    const date = new Date(row.date);
    if (Number.isNaN(date.getTime())) continue;
    const key = date.getFullYear() + "-" + date.getMonth();
    buckets.set(key, (buckets.get(key) ?? 0) + Number(row[valueKey] ?? 0));
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => {
      const monthIndex = Number(key.split("-")[1]);
      return { month: MONTH_LABELS[monthIndex] ?? key, value: Math.round(value) };
    });
}

function formatRelativeTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) {
    return minutes + (minutes === 1 ? " minute ago" : " minutes ago");
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return hours + (hours === 1 ? " hour ago" : " hours ago");
  }

  const days = Math.round(hours / 24);
  if (days < 30) {
    return days + (days === 1 ? " day ago" : " days ago");
  }

  const months = Math.round(days / 30);
  if (months < 12) {
    return months + (months === 1 ? " month ago" : " months ago");
  }

  const years = Math.round(months / 12);
  return years + (years === 1 ? " year ago" : " years ago");
}
