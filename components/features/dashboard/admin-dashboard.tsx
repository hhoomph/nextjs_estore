/**
 * Module for admin-dashboard
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import type * as React from "react";
import { authClient } from "@/lib/auth-client";
import {
  AlertTriangle,
  DollarSign,
  Package,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Analytics } from "./analytics";
import { UserManagement } from "./user-management";

type Session = typeof authClient.$Infer.Session;

interface AdminDashboardProps {
  session: Session;
}

type TabType = "overview" | "users" | "analytics" | "settings";

export function AdminDashboard({ session }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  const fetchStats = useCallback(async () => {
    try {
      const usersResponse = await fetch("/api/users?page=1&limit=1");
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setStats((current) => ({
          ...current,
          totalUsers: usersData.pagination.total,
          activeUsers: usersData.users.filter(
            (user: { active: boolean }) => user.active,
          ).length,
        }));
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="apex-admin-sidebar fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border text-foreground">
          <div className="flex h-16 items-center border-b border-border px-5">
            <div className="flex mr-3 h-9 w-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Package className="h-5 w-5" />
            </div>
            <h1 className="text-base font-bold tracking-tight">Admin Panel</h1>
          </div>

          <div className="px-4 py-5">
            <div className="rounded-3xl border border-border bg-muted p-4">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground">
                {session?.user?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <p className="font-semibold text-foreground">
                {session?.user?.name}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Administrator
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-2">
            <NavItem
              active={activeTab === "overview"}
              icon={Package}
              label="Overview"
              onClick={() => setActiveTab("overview")}
            />
            <NavItem
              active={activeTab === "users"}
              icon={Users}
              label="User Management"
              onClick={() => setActiveTab("users")}
            />
            <NavItem
              active={activeTab === "analytics"}
              icon={TrendingUp}
              label="Analytics"
              onClick={() => setActiveTab("analytics")}
            />
            <NavItem
              active={activeTab === "settings"}
              icon={Settings}
              label="Settings"
              onClick={() => setActiveTab("settings")}
            />
          </nav>

          <div className="border-t border-border p-4">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start rounded-xl px-3 py-2.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <AlertTriangle className="mr-3 h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </aside>

        <main className="min-h-screen flex-1 space-y-6 pl-72 p-6">
          <header className="overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Apex workspace
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              {activeTab === "overview"
                ? "Dashboard"
                : activeTab === "users"
                  ? "User Management"
                  : activeTab === "analytics"
                    ? "Analytics"
                    : "Settings"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              A clean, modern admin surface with crisp cards, subtle borders, and
              focused action colors.
            </p>
          </header>

          {activeTab === "overview" && (
            <>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  title="Total Users"
                  value={stats.totalUsers}
                  description="registered accounts"
                  icon={Users}
                  accent="primary"
                />
                <MetricCard
                  title="Active Users"
                  value={stats.activeUsers}
                  description="currently engaged"
                  icon={UserCheck}
                  accent="success"
                />
                <MetricCard
                  title="Total Orders"
                  value={stats.totalOrders}
                  description="all time orders"
                  icon={ShoppingCart}
                  accent="warning"
                />
                <MetricCard
                  title="Revenue"
                  value={stats.totalRevenue}
                  description="lifetime earnings"
                  icon={DollarSign}
                  accent="primary"
                  prefix="$"
                />
              </div>
            </>
          )}

          {activeTab === "users" && <UserManagement />}
          {activeTab === "analytics" && <Analytics />}
          {activeTab === "settings" && (
            <Card className="apex-stat-card">
              <CardHeader>
                <CardTitle className="text-base font-semibold tracking-tight text-foreground">
                  Admin Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">
                  Settings panel coming soon.
                </p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}

function NavItem({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cnAdminNavItem(active)}
    >
      <Icon className="mr-3 h-5 w-5 shrink-0" />
      <span>{label}</span>
    </button>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  accent,
  prefix,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: "primary" | "success" | "warning";
  prefix?: string;
}) {
  return (
    <Card className="apex-stat-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cnMetricIcon(accent)}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight text-foreground">
          {prefix}
          {value}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function cnAdminNavItem(active: boolean) {
  if (active) {
    return "mb-1 flex w-full items-center rounded-xl bg-primary/10 px-3 py-2.5 text-sm font-semibold text-primary shadow-primary/20 transition";
  }

  return "mb-1 flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground";
}

function cnMetricIcon(accent: "primary" | "success" | "warning") {
  if (accent === "success") {
    return "flex h-11 w-11 items-center justify-center rounded-2xl bg-success/10 text-success";
  }

  if (accent === "warning") {
    return "flex h-11 w-11 items-center justify-center rounded-2xl bg-warning/10 text-warning";
  }

  return "apex-gradient-icon flex h-11 w-11 items-center justify-center rounded-2xl";
}
