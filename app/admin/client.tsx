"use client";

import {
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Package,
  Palette,
  ShoppingCart,
  TrendingUp,
  Users,
  Save,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
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
import { ChevronRight } from "lucide-react";

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

// Stat card component with fixed height
function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColorClass,
  iconBgClass,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColorClass?: string;
  iconBgClass?: string;
}) {
  return (
    <Card className="apex-stat-card min-h-[160px] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
        <div
          className={cn(
            "apex-gradient-icon flex h-11 w-11 items-center justify-center rounded-2xl shrink-0",
            iconBgClass,
          )}
        >
          <Icon className={cn("h-5 w-5", iconColorClass)} />
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="text-3xl font-bold tracking-tight text-foreground pb-4">
          {value}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

// Order item component
function OrderItem({
  order,
  currency,
}: {
  order: { id: string; total: number; createdAt: string; user: { name: string | null } };
  currency: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/50 p-4 hover:bg-muted/70 transition-colors">
      <div className="flex-1">
        <p className="font-semibold text-foreground">
          Order #{order.id.slice(-8)}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {order.user?.name ?? "Guest"} •{" "}
          {new Date(order.createdAt).toLocaleDateString()}
        </p>
      </div>
      <Badge className="border-transparent bg-primary/10 text-primary shrink-0">
        {formatAmount(Number(order.total), currency)}
      </Badge>
    </div>
  );
}

// Low stock product component
function LowStockItem({
  product,
}: {
  product: { id: string; name: string; quantity: number };
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/50 p-4 hover:bg-muted/70 transition-colors">
      <div className="flex-1">
        <p className="font-semibold text-foreground">
          {product.name}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {product.quantity} remaining
        </p>
      </div>
      <Badge
        variant="destructive"
        className="bg-destructive/10 text-destructive shrink-0"
      >
        Low Stock
      </Badge>
    </div>
  );
}

// Quick action card component
function QuickActionCard({
  title,
  description,
  icon: Icon,
  iconColorClass,
  iconBgClass,
  href,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColorClass?: string;
  iconBgClass?: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="apex-action-card block p-5 hover:translate-y-[-2px] transition-all duration-200"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0 transition-colors group-hover:bg-primary/20">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <div className="mt-4 flex items-center text-sm font-medium text-primary transition-colors group-hover:gap-3 gap-2">
        Go to page
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </a>
  );
}

// Improved color input component
function ColorInput({
  id,
  label,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}) {
  const [hexError, setHexError] = useState<string | null>(null);

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const color = event.target.value;
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      setHexError("Invalid hex color (must be #RRGGBB)");
      return;
    }
    setHexError(null);
    onChange(color);
  };

  const handleHexChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const hex = event.target.value;
    if (hex === "") {
      setHexError(null);
      return;
    }
    setHexError(!/^#[0-9A-Fa-f]{0,6}$/.test(hex) ? "Invalid hex format" : null);
    if (hexError === null && /^#[0-9A-Fa-f]{6}$/.test(hex)) {
      onChange(hex);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2 items-center">
        <div className="relative group">
          <Input
            id={id}
            type="color"
            className="h-10 w-16 cursor-pointer rounded-xl border-border p-1 overflow-hidden"
            value={value}
            onChange={handleColorChange}
            aria-label={`${label} color picker`}
          />
          <div className="absolute inset-0 ring-1 ring-inset ring-border group-hover:ring-primary/50 pointer-events-none rounded-xl transition-colors" />
        </div>
        <Input
          type="text"
          value={value}
          onChange={handleHexChange}
          className="rounded-xl flex-1"
          aria-label={`${label} hex color value`}
          placeholder="#000000"
        />
      </div>
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
      {hexError && (
        <p className="text-xs text-destructive" role="alert">
          {hexError}
        </p>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    defaultCurrency,
    fetchSettings,
    updateSettings,
    saving: settingsSaving,
    error: settingsError,
    lastSavedAt,
  } = useAdminSettingsStore();

  const { theme, setTheme } = useTheme();
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(DEFAULT_THEME_SETTINGS);
  const [savingTheme, setSavingTheme] = useState(false);

  // Clear message timeout on unmount
  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    void fetchDashboardStats();
    void fetchSettings();
  }, [fetchSettings]);

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
        recentOrders: Array.isArray(payload.recentOrders)
          ? payload.recentOrders
          : [],
        lowStockProducts: Array.isArray(payload.lowStockProducts)
          ? payload.lowStockProducts
          : [],
      });
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : "An unexpected error occurred while loading dashboard data";
      setError(errorMessage);
      console.error("Failed to fetch dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveStoreSettings = async () => {
    setMessage("");
    try {
      await updateSettings({
        siteName: "",
        siteDescription: "",
        contactEmail: "",
        maintenanceMode: false,
        allowRegistration: true,
        defaultCurrency,
        lowStockThreshold: 0,
      });
      setMessage("Settings saved successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    }
  };

  const saveTheme = () => {
    setSavingTheme(true);
    try {
      setTheme(themeSettings.mode);
      applyAdminThemeSettings(themeSettings);
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(themeSettings));
      setMessage("Theme settings saved for this browser");

      // Clear message after 3 seconds
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
      messageTimeoutRef.current = setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      console.error("Failed to save theme:", err);
    } finally {
      setSavingTheme(false);
    }
  };

  const resetTheme = () => {
    setThemeSettings((current: ThemeSettings) => ({ ...DEFAULT_THEME_SETTINGS }));
    setTheme(DEFAULT_THEME_SETTINGS.mode);
    applyAdminThemeSettings(DEFAULT_THEME_SETTINGS);
    localStorage.removeItem(THEME_STORAGE_KEY);
    setMessage("Theme settings reset");

    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    messageTimeoutRef.current = setTimeout(() => {
      setMessage("");
    }, 3000);
  };

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
            <div
              key={i}
              className="apex-stat-card min-h-[160px] p-6 animate-pulse"
            >
              <div className="flex h-6 w-1/3 animate-pulse rounded bg-muted" />
              <div className="mt-4 h-11 w-11 animate-pulse rounded-2xl bg-muted" />
              <div className="mt-4 h-9 w-3/4 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-5 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>

        {/* Admin controls skeleton */}
        <Card className="apex-stat-card min-h-[600px] p-6 animate-pulse">
          <div className="space-y-4">
            <div className="h-7 w-48 animate-pulse rounded bg-muted" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          </div>
        </Card>
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
          Try Again
        </Button>
      </div>
    );
  }

  const formatAdminAmount = (value: number, currency: string) => formatAmount(value, currency);

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <section className="mb-6 overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Store overview
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Dashboard
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground max-w-2xl">
              Track your store performance, workspace controls, and operational
              signals from one clean command center.
            </p>
          </div>
          <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground shrink-0">
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

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          description="active listings"
          icon={Package}
          iconColorClass="text-primary"
          iconBgClass="bg-primary/10"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          description="all time"
          icon={ShoppingCart}
          iconColorClass="text-success"
          iconBgClass="bg-success/10"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          description="registered accounts"
          icon={Users}
          iconColorClass="text-primary"
          iconBgClass="bg-primary/10"
        />
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue}
          description="lifetime earnings"
          icon={DollarSign}
          iconColorClass="text-warning"
          iconBgClass="bg-warning/10"
        />
      </div>

      {/* Admin Controls Panel */}
      <AdminControlsPanel
        saving={settingsSaving}
        error={settingsError}
        message={message}
        lastSavedAt={lastSavedAt}
        onSave={saveStoreSettings}
        themeSettings={themeSettings}
        setThemeSettings={setThemeSettings}
        saveTheme={saveTheme}
        resetTheme={resetTheme}
        savingTheme={savingTheme}
        theme={theme}
      />

      {/* Recent Orders */}
      <Card className="apex-stat-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold tracking-tight text-foreground">
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentOrders.length > 0 ? (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <OrderItem
                  key={order.id}
                  order={order}
                  currency={defaultCurrency}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground">No recent orders</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      <Card className="apex-stat-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Low Stock Alert
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.lowStockProducts.length > 0 ? (
            <div className="space-y-3">
              {stats.lowStockProducts.map((product) => (
                <LowStockItem key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-success/50 mb-4" />
              <p className="text-sm text-muted-foreground">
                All products are well stocked
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="apex-stat-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold tracking-tight text-foreground">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <QuickActionCard
              title="Add New Product"
              description="Create a new product listing"
              icon={Package}
              iconColorClass="text-primary"
              iconBgClass="bg-primary/10"
              href="/admin/products"
            />
            <QuickActionCard
              title="Manage Users"
              description="View and manage user accounts"
              icon={Users}
              iconColorClass="text-success"
              iconBgClass="bg-success/10"
              href="/admin/users"
            />
            <QuickActionCard
              title="View Analytics"
              description="Check sales performance"
              icon={TrendingUp}
              iconColorClass="text-warning"
              iconBgClass="bg-warning/10"
              href="/admin/analytics"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminControlsPanel({
  saving,
  error,
  message,
  lastSavedAt,
  onSave,
  themeSettings,
  setThemeSettings,
  saveTheme,
  resetTheme,
  savingTheme,
  theme,
}: {
  saving: boolean;
  error: string;
  message: string;
  lastSavedAt?: string;
  onSave: () => Promise<void>;
  themeSettings: ThemeSettings;
  setThemeSettings: (settings: ThemeSettings | ((prev: ThemeSettings) => ThemeSettings)) => void;
  saveTheme: () => void;
  resetTheme: () => void;
  savingTheme: boolean;
  theme: string;
}) {
  const {
    siteName,
    siteDescription,
    contactEmail,
    maintenanceMode,
    allowRegistration,
    defaultCurrency,
    lowStockThreshold,
  } = useAdminSettingsStore();

  // Generate preview style from theme settings
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

  const formatMessage = (msg: string) => (
    <div className="flex items-center gap-2 text-sm text-success">
      <Palette className="h-4 w-4" />
      {msg}
    </div>
  );

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
        {lastSavedAt && !saving && !error && !message && (
          <p className="mb-4 text-sm text-success">
            Saved {new Date(lastSavedAt).toLocaleString()}
          </p>
        )}
        {message && (
          <div className="mb-4">
            {formatMessage(message)}
          </div>
        )}

        <Tabs defaultValue="store" className="space-y-4">
          <TabsList className="grid w-full rounded-2xl bg-muted p-1 md:w-auto md:grid-cols-3">
            <TabsTrigger value="store" className="rounded-xl data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
              Store
            </TabsTrigger>
            <TabsTrigger value="theme" className="rounded-xl data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
              Theme
            </TabsTrigger>
            <TabsTrigger value="appearance" className="rounded-xl data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">
              Appearance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="store" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admin-site-name">Site Name</Label>
                <Input
                  id="admin-site-name"
                  value={siteName ?? ""}
                  onChange={(event) =>
                    onSave()
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-currency">Default Currency</Label>
                <Select
                  value={defaultCurrency ?? "IRR"}
                  onValueChange={(value) => onSave()}
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
                  onChange={(event) => onSave()}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-registration">User Registration</Label>
                <div className="flex h-10 items-center rounded-md border px-3">
                  <Switch
                    id="admin-registration"
                    checked={allowRegistration ?? true}
                    onCheckedChange={(checked) => onSave()}
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
                onCheckedChange={(checked) => onSave()}
              />
            </div>

            <Button
              onClick={onSave}
              disabled={saving}
              className="rounded-xl"
            >
              {saving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-primary" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Store Settings
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="theme" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
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

              <div className="grid grid-cols-1 gap-4">
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
                <Button
                  onClick={saveTheme}
                  disabled={savingTheme}
                  className="rounded-xl"
                >
                  {savingTheme ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-primary" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Theme
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={resetTheme}
                  disabled={savingTheme}
                  className="rounded-xl"
                >
                  Reset
                </Button>
              </div>
            </div>
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

            <div className="grid grid-cols-1 gap-3">
              {ADMIN_PRESETS.map((preset) => (
                <Button
                  key={preset.name}
                  type="button"
                  variant="outline"
                  onClick={() => setThemeSettings(preset.settings)}
                  className="rounded-xl"
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
