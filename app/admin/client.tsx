"use client";

import {
  AlertTriangle,
  DollarSign,
  Package,
  Palette,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/components/providers/theme-provider";
import { useAdminSettingsStore } from "@/lib/stores/admin-settings-store";
import { formatAmount } from "@/lib/utils/currency";

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

const EMPTY_STATS: DashboardStats = {
  totalProducts: 0,
  totalOrders: 0,
  totalUsers: 0,
  totalRevenue: 0,
  recentOrders: [],
  lowStockProducts: [],
};

const CURRENCIES = [
  { value: "IRR", label: "Iranian Rial (ریال)" },
  { value: "TOMAN", label: "Iranian Toman (تومان)" },
  { value: "USD", label: "US Dollar ($)" },
  { value: "EUR", label: "Euro (€)" },
  { value: "GBP", label: "British Pound (£)" },
  { value: "CAD", label: "Canadian Dollar (CA$)" },
  { value: "AUD", label: "Australian Dollar (A$)" },
  { value: "JPY", label: "Japanese Yen (¥)" },
  { value: "CNY", label: "Chinese Yuan (¥)" },
  { value: "INR", label: "Indian Rupee (₹)" },
];

type ThemeMode = "light" | "dark" | "system";

type ThemeSettings = {
  mode: ThemeMode;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  foregroundColor: string;
  borderColor: string;
};

const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  mode: "system",
  primaryColor: "#2563eb",
  secondaryColor: "#64748b",
  backgroundColor: "#f8fafc",
  foregroundColor: "#0f172a",
  borderColor: "#e2e8f0",
};

const THEME_STORAGE_KEY = "admin-theme-settings";

const ADMIN_PRESETS: Array<{ name: string; settings: ThemeSettings }> = [
  {
    name: "Apex Dashboard",
    settings: DEFAULT_THEME_SETTINGS,
  },
  {
    name: "Orange Commerce",
    settings: {
      ...DEFAULT_THEME_SETTINGS,
      primaryColor: "#ea580c",
      secondaryColor: "#fb923c",
      borderColor: "#fed7aa",
    },
  },
  {
    name: "Deep Violet",
    settings: {
      ...DEFAULT_THEME_SETTINGS,
      primaryColor: "#7c3aed",
      secondaryColor: "#a78bfa",
      borderColor: "#ddd6fe",
    },
  },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const {
    defaultCurrency,
    fetchSettings,
    updateSettings,
    saving: settingsSaving,
    error: settingsError,
    lastSavedAt,
  } = useAdminSettingsStore();

  useEffect(() => {
    void fetchDashboardStats();
    void fetchSettings();
  }, [fetchSettings]);

  const fetchDashboardStats = async () => {
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
        recentOrders: Array.isArray(payload.recentOrders)
          ? payload.recentOrders
          : [],
        lowStockProducts: Array.isArray(payload.lowStockProducts)
          ? payload.lowStockProducts
          : [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[2rem] border border-border bg-card py-12 text-center shadow-lg">
        <p className="mb-4 text-destructive">{error}</p>
        <button
          onClick={() => {
            setLoading(true);
            setError("");
            void fetchDashboardStats();
          }}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  const formatAdminAmount = (value: number, currency: string) => formatAmount(value, currency);

  return (
    <div className="space-y-6 pb-8">
      <section className="mb-6 overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Store overview
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Track your store performance, workspace controls, and operational
              signals from one clean command center.
            </p>
          </div>
          <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">
              {new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }).format(new Date())}
            </p>
            <p>Apex workspace theme</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Card className="apex-stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Total Products
            </CardTitle>
            <div className="apex-gradient-icon flex h-11 w-11 items-center justify-center rounded-2xl">
              <Package className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {stats.totalProducts}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">active listings</p>
          </CardContent>
        </Card>

        <Card className="apex-stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Total Orders
            </CardTitle>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-success/10 text-success">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {stats.totalOrders}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">all time</p>
          </CardContent>
        </Card>

        <Card className="apex-stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Total Users
            </CardTitle>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {stats.totalUsers}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">registered accounts</p>
          </CardContent>
        </Card>

        <Card className="apex-stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Total Revenue
            </CardTitle>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-warning/10 text-warning">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {formatAdminAmount(stats.totalRevenue, defaultCurrency)}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">lifetime earnings</p>
          </CardContent>
        </Card>
      </div>

      <AdminControlsPanel
        saving={settingsSaving}
        error={settingsError}
        lastSavedAt={lastSavedAt}
        onSave={updateSettings}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="apex-stat-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold tracking-tight text-foreground">
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-2xl border border-border bg-muted/50 p-4"
                  >
                    <div>
                      <p className="font-semibold text-foreground">
                        Order #{order.id.slice(-8)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.user?.name ?? "Guest"} •{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className="border-transparent bg-primary/10 text-primary">
                      {formatAdminAmount(Number(order.total), defaultCurrency)}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent orders</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="apex-stat-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.lowStockProducts.length > 0 ? (
                stats.lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-2xl border border-border bg-muted/50 p-4"
                  >
                    <div>
                      <p className="font-semibold text-foreground">
                        {product.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {product.quantity} remaining
                      </p>
                    </div>
                    <Badge variant="destructive" className="bg-destructive/10 text-destructive">
                      Low Stock
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  All products are well stocked
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="apex-stat-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold tracking-tight text-foreground">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <a
              href="/admin/products"
              className="apex-action-card block p-5"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Package className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground">
                Add New Product
              </h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Create a new product listing
              </p>
            </a>

            <a
              href="/admin/users"
              className="apex-action-card block p-5"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground">
                Manage Users
              </h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                View and manage user accounts
              </p>
            </a>

            <a
              href="/admin/analytics"
              className="apex-action-card block p-5"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-warning/10 text-warning">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground">
                View Analytics
              </h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Check sales performance
              </p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminControlsPanel({
  saving,
  error,
  lastSavedAt,
  onSave,
}: {
  saving: boolean;
  error: string;
  lastSavedAt?: string;
  onSave: (partial: Partial<{ siteName: string; siteDescription: string; contactEmail: string; maintenanceMode: boolean; allowRegistration: boolean; defaultCurrency: string; lowStockThreshold: number }>) => Promise<void>;
}) {
  const { theme, setTheme } = useTheme();
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(DEFAULT_THEME_SETTINGS);
  const [savingTheme, setSavingTheme] = useState(false);
  const [themeMessage, setThemeMessage] = useState("");

  const {
    siteName,
    siteDescription,
    contactEmail,
    maintenanceMode,
    allowRegistration,
    defaultCurrency,
    lowStockThreshold,
  } = useAdminSettingsStore();

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) {
        setThemeSettings(JSON.parse(savedTheme) as ThemeSettings);
      }
    } catch {
      localStorage.removeItem(THEME_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    setTheme(themeSettings.mode);
    applyAdminThemeSettings(themeSettings);
  }, [setTheme, themeSettings]);

  const saveStoreSettings = async () => {
    await onSave({
      siteName,
      siteDescription,
      contactEmail,
      maintenanceMode,
      allowRegistration,
      defaultCurrency,
      lowStockThreshold,
    });
  };

  const saveTheme = () => {
    setSavingTheme(true);
    setTheme(themeSettings.mode);
    applyAdminThemeSettings(themeSettings);
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(themeSettings));
    setThemeMessage("Theme settings saved for this browser");
    setSavingTheme(false);
  };

  const resetTheme = () => {
    setThemeSettings(DEFAULT_THEME_SETTINGS);
    setTheme(DEFAULT_THEME_SETTINGS.mode);
    applyAdminThemeSettings(DEFAULT_THEME_SETTINGS);
    localStorage.removeItem(THEME_STORAGE_KEY);
    setThemeMessage("Theme settings reset");
  };

  const previewStyle = {
    "--primary": hexToHsl(themeSettings.primaryColor),
    "--secondary": hexToHsl(themeSettings.secondaryColor),
    "--background": hexToHsl(themeSettings.backgroundColor),
    "--foreground": hexToHsl(themeSettings.foregroundColor),
    "--border": hexToHsl(themeSettings.borderColor),
    "--apex-primary": hexToHsl(themeSettings.primaryColor),
    "--apex-secondary": hexToHsl(themeSettings.secondaryColor),
    "--apex-bg": hexToHsl(themeSettings.backgroundColor),
    "--apex-foreground": hexToHsl(themeSettings.foregroundColor),
    "--apex-border": hexToHsl(themeSettings.borderColor),
    "--apex-border-soft": hexToHsl(themeSettings.borderColor),
  } as { [key: string]: string };

  return (
    <Card className="apex-stat-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground">
          <Palette className="h-5 w-5 text-primary" />
          Administrative Controls
        </CardTitle>
      </CardHeader>
      <CardContent>
        {(saving || error) && (
          <p className={`mb-4 text-sm ${saving ? "text-muted-foreground" : "text-destructive"}`}>
            {saving ? "Saving settings..." : error}
          </p>
        )}
        {lastSavedAt && !saving && !error && (
          <p className="mb-4 text-sm text-success">Saved {new Date(lastSavedAt).toLocaleString()}</p>
        )}

        <Tabs defaultValue="store" className="space-y-4">
          <TabsList className="grid w-full rounded-2xl bg-muted p-1 md:w-auto md:grid-cols-3">
            <TabsTrigger value="store" className="rounded-xl data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">Store</TabsTrigger>
            <TabsTrigger value="theme" className="rounded-xl data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">Theme</TabsTrigger>
            <TabsTrigger value="appearance" className="rounded-xl data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="store" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admin-site-name">Site Name</Label>
                <Input
                  id="admin-site-name"
                  value={siteName ?? ""}
                  onChange={(event) =>
                    onSave({ siteName: event.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-currency">Default Currency</Label>
                <Select
                  value={defaultCurrency ?? "IRR"}
                  onValueChange={(value) => onSave({ defaultCurrency: value })}
                >
                  <SelectTrigger className="rounded-xl border-border bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-stock-threshold">Low Stock Threshold</Label>
                <Input
                  id="admin-stock-threshold"
                  type="number"
                  min="0"
                  value={lowStockThreshold ?? 0}
                  onChange={(event) =>
                    onSave({
                      lowStockThreshold: Number(event.target.value),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-registration">User Registration</Label>
                <div className="flex h-10 items-center rounded-md border px-3">
                  <Switch
                    id="admin-registration"
                    checked={allowRegistration ?? true}
                    onCheckedChange={(checked) =>
                      onSave({ allowRegistration: checked })
                    }
                  />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Allow new customer accounts
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="font-medium">Maintenance Mode</p>
                <p className="text-sm text-muted-foreground">
                  Temporarily block customer access to the store.
                </p>
              </div>
              <Switch
                checked={maintenanceMode ?? false}
                onCheckedChange={(checked) =>
                  onSave({ maintenanceMode: checked })
                }
              />
            </div>

            <Button onClick={saveStoreSettings} disabled={saving} className="rounded-xl">
              {saving ? "Saving..." : "Save Store Settings"}
            </Button>
          </TabsContent>

          <TabsContent value="theme" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admin-theme-mode">Theme Mode</Label>
                <Select
                  value={themeSettings.mode}
                  onValueChange={(value: "light" | "dark" | "system") =>
                    setThemeSettings((current) => ({
                      ...current,
                      mode: value,
                    }))
                  }
                >
                  <SelectTrigger className="rounded-xl border-border bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Current Theme</Label>
                <div className="rounded-2xl border border-border bg-muted p-3 text-sm text-muted-foreground">
                  {theme ?? "system"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ColorInput
                id="admin-primary"
                label="Primary"
                value={themeSettings.primaryColor}
                onChange={(value) =>
                  setThemeSettings((current) => ({
                    ...current,
                    primaryColor: value,
                  }))
                }
              />
              <ColorInput
                id="admin-secondary"
                label="Secondary"
                value={themeSettings.secondaryColor}
                onChange={(value) =>
                  setThemeSettings((current) => ({
                    ...current,
                    secondaryColor: value,
                  }))
                }
              />
              <ColorInput
                id="admin-background"
                label="Background"
                value={themeSettings.backgroundColor}
                onChange={(value) =>
                  setThemeSettings((current) => ({
                    ...current,
                    backgroundColor: value,
                  }))
                }
              />
              <ColorInput
                id="admin-foreground"
                label="Foreground"
                value={themeSettings.foregroundColor}
                onChange={(value) =>
                  setThemeSettings((current) => ({
                    ...current,
                    foregroundColor: value,
                  }))
                }
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={saveTheme} disabled={savingTheme} className="rounded-xl">
                {savingTheme ? "Saving..." : "Save Theme"}
              </Button>
              <Button variant="outline" onClick={resetTheme}>
                Reset
              </Button>
            </div>

            {themeMessage && (
              <p className="text-sm text-success">
                {themeMessage}
              </p>
            )}
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <div className="rounded-3xl border border-border bg-background p-4 shadow-lg" style={previewStyle}>
              <div className="rounded-2xl bg-primary p-4 font-semibold text-primary-foreground">
                Primary action
              </div>
              <div className="mt-3 rounded-2xl bg-secondary p-4 text-sm text-secondary-foreground">
                Secondary surface
              </div>
              <div className="mt-3 rounded-2xl bg-background p-4 text-foreground">
                <p className="font-semibold">Admin preview</p>
                <p className="text-sm opacity-70">
                  Selected colors update the admin workspace immediately.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {ADMIN_PRESETS.map((preset) => (
                <Button
                  key={preset.name}
                  type="button"
                  variant="outline"
                  onClick={() => setThemeSettings(preset.settings)}
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function ColorInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          type="color"
          className="h-10 w-16 cursor-pointer rounded-xl border-border p-1"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <Input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="rounded-xl"
        />
      </div>
    </div>
  );
}

function formatAdminAmount(value: number, currency: string) {
  if (currency === "TOMAN") {
    return new Intl.NumberFormat("fa-IR", {
      style: "currency",
      currency: "IRR",
      maximumFractionDigits: 0,
    }).format(value / 10);
  }

  if (currency === "IRR") {
    return new Intl.NumberFormat("fa-IR", {
      style: "currency",
      currency: "IRR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);
}

function applyAdminThemeSettings(data: ThemeSettings) {
  const root = document.documentElement;

  root.style.setProperty("--primary", hexToHsl(data.primaryColor));
  root.style.setProperty("--secondary", hexToHsl(data.secondaryColor));
  root.style.setProperty("--background", hexToHsl(data.backgroundColor));
  root.style.setProperty("--foreground", hexToHsl(data.foregroundColor));
  root.style.setProperty("--border", hexToHsl(data.borderColor));

  root.style.setProperty("--apex-primary", hexToHsl(data.primaryColor));
  root.style.setProperty("--apex-secondary", hexToHsl(data.secondaryColor));
  root.style.setProperty("--apex-bg", hexToHsl(data.backgroundColor));
  root.style.setProperty("--apex-foreground", hexToHsl(data.foregroundColor));
  root.style.setProperty("--apex-border", hexToHsl(data.borderColor));
  root.style.setProperty("--apex-border-soft", hexToHsl(data.borderColor));
}

function hexToHsl(hex: string) {
  const normalized = hex.replace("#", "");
  const red = parseInt(normalized.slice(0, 2), 16) / 255;
  const green = parseInt(normalized.slice(2, 4), 16) / 255;
  const blue = parseInt(normalized.slice(4, 6), 16) / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  let hue = 0;
  let saturation = 0;
  const lightness = (max + min) / 2;

  if (max !== min) {
    const delta = max - min;
    saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case red:
        hue = (green - blue) / delta + (green < blue ? 6 : 0);
        break;
      case green:
        hue = (blue - red) / delta + 2;
        break;
      default:
        hue = (red - green) / delta + 4;
        break;
    }

    hue /= 6;
  }

  return `${Math.round(hue * 360)} ${Math.round(saturation * 100)}% ${Math.round(lightness * 100)}%`;
}