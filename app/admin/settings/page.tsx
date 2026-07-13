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
import { useTranslations } from "next-intl";
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
  const t = useTranslations("Admin Settings");
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
          <p className="mt-2 text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("settings")}</h1>
          <p className="text-muted-foreground">{t("settingsDescription")}</p>
        </div>
        {lastSavedAt && (
          <p className="text-xs text-muted-foreground">{t("lastSaved", { date: new Date(lastSavedAt).toLocaleString() })}</p>
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
              {t("generalSettings")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">{t("siteName")}</Label>
                <Input id="siteName" value={siteName ?? ""} onChange={updateStringField("siteName")} placeholder={t("siteNamePlaceholder")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">{t("contactEmail")}</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail ?? ""}
                  onChange={updateStringField("contactEmail")}
                  placeholder={t("contactEmailPlaceholder")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteDescription">{t("siteDescription")}</Label>
              <Textarea
                id="siteDescription"
                value={siteDescription ?? ""}
                onChange={updateStringField("siteDescription")}
                placeholder={t("siteDescriptionPlaceholder")}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("storeSettings")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultCurrency">{t("defaultCurrency")}</Label>
                <Select value={defaultCurrency ?? "IRR"} onValueChange={(value) => updateSettings({ defaultCurrency: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectCurrency")} />
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
                <Label htmlFor="lowStockThreshold">{t("lowStockThreshold")}</Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  value={lowStockThreshold ?? 0}
                  onChange={updateNumberField("lowStockThreshold")}
                  placeholder={t("lowStockPlaceholder")}
                  min="0"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="maintenanceMode">{t("maintenanceMode")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("maintenanceDescription")}
                </p>
              </div>
              <Switch id="maintenanceMode" checked={maintenanceMode ?? false} onCheckedChange={(checked) => updateSettings({ maintenanceMode: checked })} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allowRegistration">{t("allowRegistration")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("registrationDescription")}
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
              {t("multilingualSettings")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteTitleFa">{t("siteTitleFa")}</Label>
              <Input id="siteTitleFa" value={siteTitleFa ?? ""} onChange={updateStringField("siteTitleFa")} placeholder={t("siteTitleFaPlaceholder")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneFa">{t("phoneFa")}</Label>
              <Input id="phoneFa" value={phoneFa ?? ""} onChange={updateStringField("phoneFa")} placeholder={t("phoneFaPlaceholder")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descriptionFa">{t("descriptionFa")}</Label>
              <Textarea
                id="descriptionFa"
                value={descriptionFa ?? ""}
                onChange={updateStringField("descriptionFa")}
                placeholder={t("descriptionFaPlaceholder")}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              {t("seoSettings")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultSeoTitle">{t("defaultSeoTitle")}</Label>
              <Input
                id="defaultSeoTitle"
                value={defaultSeoTitle ?? ""}
                onChange={updateStringField("defaultSeoTitle")}
                placeholder={t("seoTitlePlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultSeoDescription">{t("defaultSeoDescription")}</Label>
              <Textarea
                id="defaultSeoDescription"
                value={defaultSeoDescription ?? ""}
                onChange={updateStringField("defaultSeoDescription")}
                placeholder={t("seoDescriptionPlaceholder")}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultOgImage">{t("defaultOgImage")}</Label>
              <Input
                id="defaultOgImage"
                value={defaultOgImage ?? ""}
                onChange={updateStringField("defaultOgImage")}
                placeholder={t("ogImagePlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="googleAnalyticsId">{t("googleAnalyticsId")}</Label>
              <Input
                id="googleAnalyticsId"
                value={googleAnalyticsId ?? ""}
                onChange={updateStringField("googleAnalyticsId")}
                placeholder={t("gaPlaceholder")}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("saving")}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t("saveSettings")}
              </>
            )}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("themeCustomization")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{t("customizeThemeColors")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("themeCustomizationDescription")}
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/admin/settings/theme">{t("goToThemeSettings")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}