/**
 * Module for page
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminSettingsStore } from "@/lib/stores/admin-settings-store";
import {
  Settings as SettingsIcon,
  Save,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Globe,
  Search,
} from "lucide-react";

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

export default function AdminSettingsPage() {
  const {
    siteName,
    siteDescription,
    contactEmail,
    maintenanceMode,
    allowRegistration,
    defaultCurrency,
    lowStockThreshold,
    siteTitleFa,
    phoneFa,
    descriptionFa,
    defaultSeoTitle,
    defaultSeoDescription,
    defaultOgImage,
    googleAnalyticsId,
    loading,
    saving,
    error,
    lastSavedAt,
    fetchSettings,
    updateSettings,
  } = useAdminSettingsStore();

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await updateSettings({
      siteName,
      siteDescription,
      contactEmail,
      maintenanceMode,
      allowRegistration,
      defaultCurrency,
      lowStockThreshold,
      siteTitleFa,
      phoneFa,
      descriptionFa,
      defaultSeoTitle,
      defaultSeoDescription,
      defaultOgImage,
      googleAnalyticsId,
    });
  };

  const updateStringField =
    (field: "siteName" | "siteDescription" | "contactEmail" | "siteTitleFa" | "phoneFa" | "descriptionFa" | "defaultSeoTitle" | "defaultSeoDescription" | "defaultOgImage" | "googleAnalyticsId") =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      updateSettings({ [field]: event.target.value } as never);
    };

  const updateNumberField =
    (field: "lowStockThreshold") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateSettings({ [field]: Number(event.target.value) } as never);
    };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2 text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure your store settings and preferences</p>
        </div>
        {lastSavedAt && (
          <p className="text-xs text-muted-foreground">Last saved {new Date(lastSavedAt).toLocaleString()}</p>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <p className="text-destructive">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input id="siteName" value={siteName ?? ""} onChange={updateStringField("siteName")} placeholder="My E-commerce Store" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail ?? ""}
                  onChange={updateStringField("contactEmail")}
                  placeholder="contact@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={siteDescription ?? ""}
                onChange={updateStringField("siteDescription")}
                placeholder="A modern e-commerce platform"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Store Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultCurrency">Default Currency</Label>
                <Select value={defaultCurrency ?? "IRR"} onValueChange={(value) => updateSettings({ defaultCurrency: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
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
                <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  value={lowStockThreshold ?? 0}
                  onChange={updateNumberField("lowStockThreshold")}
                  placeholder="10"
                  min="0"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Put the site in maintenance mode (customers cannot access the store)
                </p>
              </div>
              <Switch id="maintenanceMode" checked={maintenanceMode ?? false} onCheckedChange={(checked) => updateSettings({ maintenanceMode: checked })} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allowRegistration">Allow User Registration</Label>
                <p className="text-sm text-muted-foreground">
                  Allow new customers to create accounts on your store
                </p>
              </div>
              <Switch id="allowRegistration" checked={allowRegistration ?? true} onCheckedChange={(checked) => updateSettings({ allowRegistration: checked })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Multilingual Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteTitleFa">Site Title (Persian/Farsi)</Label>
              <Input id="siteTitleFa" value={siteTitleFa ?? ""} onChange={updateStringField("siteTitleFa")} placeholder="فروشگاه آنلاین من" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneFa">Phone (Persian/Farsi)</Label>
              <Input id="phoneFa" value={phoneFa ?? ""} onChange={updateStringField("phoneFa")} placeholder="021-12345678" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descriptionFa">Description (Persian/Farsi)</Label>
              <Textarea
                id="descriptionFa"
                value={descriptionFa ?? ""}
                onChange={updateStringField("descriptionFa")}
                placeholder="پلتفرم فروش آنلاین مدرن"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              SEO Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultSeoTitle">Default SEO Title</Label>
              <Input
                id="defaultSeoTitle"
                value={defaultSeoTitle ?? ""}
                onChange={updateStringField("defaultSeoTitle")}
                placeholder="My E-commerce Store - Online Shopping"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultSeoDescription">Default SEO Description</Label>
              <Textarea
                id="defaultSeoDescription"
                value={defaultSeoDescription ?? ""}
                onChange={updateStringField("defaultSeoDescription")}
                placeholder="Shop the best products online with fast shipping and great prices."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultOgImage">Default OG Image URL</Label>
              <Input
                id="defaultOgImage"
                value={defaultOgImage ?? ""}
                onChange={updateStringField("defaultOgImage")}
                placeholder="https://example.com/images/og-default.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
              <Input
                id="googleAnalyticsId"
                value={googleAnalyticsId ?? ""}
                onChange={updateStringField("googleAnalyticsId")}
                placeholder="GA-XXXXXXXXXX"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Theme Customization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Customize Theme Colors</h3>
                <p className="text-sm text-muted-foreground">
                  Configure light/dark mode colors, primary/secondary colors, and more
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/admin/settings/theme">Go to Theme Settings</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}