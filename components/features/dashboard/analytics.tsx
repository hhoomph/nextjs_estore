/**
 * Module for analytics
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

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

interface AnalyticsState {
  userGrowth: UserGrowthDatum[];
  orderStats: OrderStat[];
  revenueStats: RevenueStat[];
  popularProducts: PopularProduct[];
}

const analyticsInitialState: AnalyticsState = {
  userGrowth: [],
  orderStats: [],
  revenueStats: [],
  popularProducts: [],
};

export function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsState>(
    analyticsInitialState,
  );
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        setAnalytics({
          userGrowth: [
            { month: "Jan", users: 120 },
            { month: "Feb", users: 150 },
            { month: "Mar", users: 180 },
            { month: "Apr", users: 220 },
            { month: "May", users: 280 },
            { month: "Jun", users: 350 },
          ],
          orderStats: [
            { status: "Completed", count: 145, percentage: 65 },
            { status: "Pending", count: 45, percentage: 20 },
            { status: "Cancelled", count: 30, percentage: 15 },
          ],
          revenueStats: [
            { month: "Jan", revenue: 12000 },
            { month: "Feb", revenue: 15000 },
            { month: "Mar", revenue: 18000 },
            { month: "Apr", revenue: 22000 },
            { month: "May", revenue: 28000 },
            { month: "Jun", revenue: 35000 },
          ],
          popularProducts: [
            { name: "Wireless Headphones", sales: 245, revenue: 12250 },
            { name: "Smart Watch", sales: 189, revenue: 28350 },
            { name: "Laptop Stand", sales: 156, revenue: 3120 },
            { name: "USB Cable", sales: 134, revenue: 402 },
            { name: "Phone Case", sales: 98, revenue: 980 },
          ],
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching analytics:", error);
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
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

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
                  style={{ height: `${(data.users / 400) * 220}px` }}
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
                  style={{ height: `${(data.revenue / 40000) * 220}px` }}
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
            <ActivityItem
              color="success"
              title="John Doe placed an order for $299.99"
              time="2 hours ago"
            />
            <ActivityItem
              color="primary"
              title="Jane Smith registered as a new user"
              time="4 hours ago"
            />
            <ActivityItem
              color="warning"
              title="Order #1234 status changed to completed"
              time="6 hours ago"
            />
            <ActivityItem
              color="danger"
              title="Payment failed for order #1235"
              time="8 hours ago"
            />
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
