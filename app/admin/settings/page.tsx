/**
 * Module for page
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Settings as SettingsIcon,
  Save,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Globe,
  Search,
} from "lucide-react";

const settingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  siteDescription: z.string().min(1, "Site description is required"),
  contactEmail: z.string().email("Invalid email address"),
  maintenanceMode: z.boolean(),
  allowRegistration: z.boolean(),
  defaultCurrency: z.string().min(1, "Currency is required"),
  lowStockThreshold: z.number().min(0, "Threshold must be 0 or greater"),
  // Multilingual fields
  siteTitleFa: z.string().optional(),
  phoneFa: z.string().optional(),
  descriptionFa: z.string().optional(),
  // SEO fields
  defaultSeoTitle: z.string().optional(),
  defaultSeoDescription: z.string().optional(),
  defaultOgImage: z.string().optional(),
  googleAnalyticsId: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface SettingsData {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  defaultCurrency: string;
  lowStockThreshold: number;
}

const CURRENCIES = [
  { value: "USD", label: "US Dollar ($)" },
  { value: "EUR", label: "Euro (€)" },
  { value: "GBP", label: "British Pound (£)" },
  { value: "CAD", label: "Canadian Dollar (CA$)" },
  { value: "AUD", label: "Australian Dollar (A$)" },
];

export default function AdminSettingsPage() {
  const [, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      siteName: "",
      siteDescription: "",
      contactEmail: "",
      maintenanceMode: false,
      allowRegistration: true,
      defaultCurrency: "USD",
      lowStockThreshold: 10,
    },
  });

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/settings");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch settings");
      }

      setSettings(data.settings);
      form.reset(data.settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const onSubmit = async (data: SettingsFormData) => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update settings");
      }

      setSettings(result.settings);
      setSuccess("Settings updated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update settings");
    } finally {
      setSaving(false);
    }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure your store settings and preferences</p>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <p className="text-destructive">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-green-800">{success}</p>
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* General Settings */}
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
                <Input
                  id="siteName"
                  {...form.register("siteName")}
                  placeholder="My E-commerce Store"
                />
                {form.formState.errors.siteName && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.siteName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  {...form.register("contactEmail")}
                  placeholder="contact@example.com"
                />
                {form.formState.errors.contactEmail && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.contactEmail.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                {...form.register("siteDescription")}
                placeholder="A modern e-commerce platform"
                rows={3}
              />
              {form.formState.errors.siteDescription && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.siteDescription.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Store Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Store Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultCurrency">Default Currency</Label>
                <Select
                  value={form.watch("defaultCurrency")}
                  onValueChange={(value) => form.setValue("defaultCurrency", value)}
                >
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
                {form.formState.errors.defaultCurrency && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.defaultCurrency.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  {...form.register("lowStockThreshold", { valueAsNumber: true })}
                  placeholder="10"
                  min="0"
                />
                {form.formState.errors.lowStockThreshold && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.lowStockThreshold.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Put the site in maintenance mode (customers cannot access the store)
                </p>
              </div>
              <Switch
                id="maintenanceMode"
                checked={form.watch("maintenanceMode")}
                onCheckedChange={(checked) => form.setValue("maintenanceMode", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allowRegistration">Allow User Registration</Label>
                <p className="text-sm text-muted-foreground">
                  Allow new customers to create accounts on your store
                </p>
              </div>
              <Switch
                id="allowRegistration"
                checked={form.watch("allowRegistration")}
                onCheckedChange={(checked) => form.setValue("allowRegistration", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Multilingual Settings */}
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
              <Input
                id="siteTitleFa"
                {...form.register("siteTitleFa")}
                placeholder="فروشگاه آنلاین من"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneFa">Phone (Persian/Farsi)</Label>
              <Input
                id="phoneFa"
                {...form.register("phoneFa")}
                placeholder="021-12345678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descriptionFa">Description (Persian/Farsi)</Label>
              <Textarea
                id="descriptionFa"
                {...form.register("descriptionFa")}
                placeholder="پلتفرم فروش آنلاین مدرن"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* SEO Settings */}
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
                {...form.register("defaultSeoTitle")}
                placeholder="My E-commerce Store - Online Shopping"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultSeoDescription">Default SEO Description</Label>
              <Textarea
                id="defaultSeoDescription"
                {...form.register("defaultSeoDescription")}
                placeholder="Shop the best products online with fast shipping and great prices."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultOgImage">Default OG Image URL</Label>
              <Input
                id="defaultOgImage"
                {...form.register("defaultOgImage")}
                placeholder="https://example.com/images/og-default.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
              <Input
                id="googleAnalyticsId"
                {...form.register("googleAnalyticsId")}
                placeholder="GA-XXXXXXXXXX"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
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

        {/* Theme Settings Link */}
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
                <Link href="/admin/settings/theme">
                  Go to Theme Settings
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
