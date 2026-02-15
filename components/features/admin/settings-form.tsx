/**
 * Module for settings-form
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Save,
  Settings as SettingsIcon,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";

const settingsSchema = z.object({
  siteName: z
    .string()
    .min(1, "Site name is required")
    .max(100, "Site name too long"),
  siteDescription: z
    .string()
    .min(1, "Site description is required")
    .max(500, "Description too long"),
  contactEmail: z.string().email("Invalid email address"),
  maintenanceMode: z.boolean(),
  allowRegistration: z.boolean(),
  defaultCurrency: z.string().min(1, "Currency is required"),
  lowStockThreshold: z
    .number()
    .min(0, "Threshold must be 0 or greater")
    .max(1000, "Threshold too high"),
  adminPassword: z.string().optional(),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  initialSettings?: Partial<SettingsFormData>;
  onSubmit: (data: SettingsFormData) => Promise<void>;
  loading?: boolean;
  error?: string;
  success?: string;
  showPasswordField?: boolean;
}

const CURRENCIES = [
  { value: "USD", label: "US Dollar ($)" },
  { value: "EUR", label: "Euro (€)" },
  { value: "GBP", label: "British Pound (£)" },
  { value: "CAD", label: "Canadian Dollar (CA$)" },
  { value: "AUD", label: "Australian Dollar (A$)" },
  { value: "JPY", label: "Japanese Yen (¥)" },
  { value: "CNY", label: "Chinese Yuan (¥)" },
  { value: "INR", label: "Indian Rupee (₹)" },
];

export function SettingsForm({
  initialSettings,
  onSubmit,
  loading = false,
  error,
  success,
  showPasswordField = false,
}: SettingsFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      siteName: initialSettings?.siteName || "",
      siteDescription: initialSettings?.siteDescription || "",
      contactEmail: initialSettings?.contactEmail || "",
      maintenanceMode: initialSettings?.maintenanceMode || false,
      allowRegistration: initialSettings?.allowRegistration !== false, // default true
      defaultCurrency: initialSettings?.defaultCurrency || "USD",
      lowStockThreshold: initialSettings?.lowStockThreshold || 10,
      adminPassword: "",
    },
  });

  const handleSubmit = async (data: SettingsFormData) => {
    try {
      await onSubmit(data);
    } catch (err) {
      // Error handling is done by parent component
    }
  };

  return (
    <div className="space-y-6">
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

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name *</Label>
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
                <Label htmlFor="contactEmail">Contact Email *</Label>
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
              <Label htmlFor="siteDescription">Site Description *</Label>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultCurrency">Default Currency *</Label>
                <Select
                  value={form.watch("defaultCurrency")}
                  onValueChange={(value) =>
                    form.setValue("defaultCurrency", value)
                  }
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
                  {...form.register("lowStockThreshold", {
                    valueAsNumber: true,
                  })}
                  placeholder="10"
                  min="0"
                  max="1000"
                />
                {form.formState.errors.lowStockThreshold && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.lowStockThreshold.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Alert when product quantity falls below this number
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Put the site in maintenance mode (customers cannot access the
                  store)
                </p>
              </div>
              <Switch
                id="maintenanceMode"
                checked={form.watch("maintenanceMode")}
                onCheckedChange={(checked) =>
                  form.setValue("maintenanceMode", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allowRegistration">
                  Allow User Registration
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow new customers to create accounts on your store
                </p>
              </div>
              <Switch
                id="allowRegistration"
                checked={form.watch("allowRegistration")}
                onCheckedChange={(checked) =>
                  form.setValue("allowRegistration", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Admin Settings */}
        {showPasswordField && (
          <Card>
            <CardHeader>
              <CardTitle>Admin Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminPassword">Change Admin Password</Label>
                <div className="relative">
                  <Input
                    id="adminPassword"
                    type={showPassword ? "text" : "password"}
                    {...form.register("adminPassword")}
                    placeholder="Leave empty to keep current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Leave empty to keep the current password unchanged
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? (
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
      </form>
    </div>
  );
}

// Quick settings component for common settings
interface QuickSettingsProps {
  settings: {
    maintenanceMode: boolean;
    allowRegistration: boolean;
  };
  onUpdate: (key: string, value: boolean) => Promise<void>;
  loading?: boolean;
}

export function QuickSettings({
  settings,
  onUpdate,
  loading,
}: QuickSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Maintenance Mode</Label>
            <p className="text-sm text-muted-foreground">
              Temporarily disable store access
            </p>
          </div>
          <Switch
            checked={settings.maintenanceMode}
            onCheckedChange={(checked) => onUpdate("maintenanceMode", checked)}
            disabled={loading}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>User Registration</Label>
            <p className="text-sm text-muted-foreground">
              Allow new user signups
            </p>
          </div>
          <Switch
            checked={settings.allowRegistration}
            onCheckedChange={(checked) =>
              onUpdate("allowRegistration", checked)
            }
            disabled={loading}
          />
        </div>
      </CardContent>
    </Card>
  );
}
