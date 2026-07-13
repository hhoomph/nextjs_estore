"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import type * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTheme } from "@/components/providers/theme-provider";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Palette, RotateCcw, Save } from "lucide-react";
import {
  applyColorPreset,
  COLOR_PRESETS,
  hexToHslString,
  type ColorPreset,
} from "@/lib/utils/admin-color-presets";

const THEME_STORAGE_KEY = "admin-theme-settings";

const themeSettingsSchema = z.object({
  mode: z.enum(["light", "dark", "system"]),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Enter a valid hex color"),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Enter a valid hex color"),
  backgroundColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Enter a valid hex color"),
  foregroundColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Enter a valid hex color"),
  borderColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Enter a valid hex color"),
});

type ThemeSettingsFormData = z.infer<typeof themeSettingsSchema>;

const DEFAULT_THEME: ThemeSettingsFormData = {
  mode: "system",
  primaryColor: "#2563eb",
  secondaryColor: "#64748b",
  backgroundColor: "#f8fafc",
  foregroundColor: "#0f172a",
  borderColor: "#e2e8f0",
};

export default function AdminThemeSettingsPage() {
  const t = useTranslations("Admin Theme Settings");
  const { theme, setTheme } = useTheme();
  const [saving, setSaving] = useState(false);

  const form = useForm<ThemeSettingsFormData>({
    resolver: zodResolver(themeSettingsSchema),
    defaultValues: DEFAULT_THEME,
  });

  const primaryColor = useMemo(() => form.watch("primaryColor"), [form]);
  const secondaryColor = useMemo(() => form.watch("secondaryColor"), [form]);
  const backgroundColor = useMemo(() => form.watch("backgroundColor"), [form]);
  const foregroundColor = useMemo(() => form.watch("foregroundColor"), [form]);
  const borderColor = useMemo(() => form.watch("borderColor"), [form]);

  const previewStyle = useMemo(
    () =>
      ({
        "--primary": hexToHslString(primaryColor),
        "--secondary": hexToHslString(secondaryColor),
        "--background": hexToHslString(backgroundColor),
        "--foreground": hexToHslString(foregroundColor),
        "--border": hexToHslString(borderColor),
        "--apex-primary": hexToHslString(primaryColor),
        "--apex-secondary": hexToHslString(secondaryColor),
        "--apex-bg": hexToHslString(backgroundColor),
        "--apex-foreground": hexToHslString(foregroundColor),
        "--apex-border": hexToHslString(borderColor),
        "--apex-border-soft": hexToHslString(borderColor),
      }) as React.CSSProperties,
    [primaryColor, secondaryColor, backgroundColor, foregroundColor, borderColor],
  );

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (!savedTheme) return;

    try {
      const parsed = JSON.parse(savedTheme) as ThemeSettingsFormData;
      const result = themeSettingsSchema.safeParse(parsed);

      if (result.success) {
        form.reset(result.data);
        applyThemeSettings(result.data);
      }
    } catch {
      window.localStorage.removeItem(THEME_STORAGE_KEY);
    }
  }, [form]);

  const onSubmit = (data: ThemeSettingsFormData) => {
    setSaving(true);

    try {
      setTheme(data.mode);
      applyThemeSettings(data);
      window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(data));
      toast.success(t("themeSettingsSaved"));
    } catch {
      toast.error("Failed to save theme settings");
    } finally {
      setSaving(false);
    }
  };

  const resetTheme = () => {
    form.reset(DEFAULT_THEME);
    setTheme("system");
    window.localStorage.removeItem(THEME_STORAGE_KEY);
    applyThemeSettings(DEFAULT_THEME);
    toast.success(t("themeSettingsReset"));
  };

  const handlePreset = (preset: ColorPreset) => {
    applyColorPreset(preset);
    form.reset({
      mode: form.getValues("mode"),
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      backgroundColor: preset.background,
      foregroundColor: preset.foreground,
      borderColor: preset.border,
    });
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {t("workspaceStyling")}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          {t("themeSettings")}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {t("themeSettingsDescription")}
        </p>
      </section>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card className="apex-stat-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground">
                <Palette className="h-5 w-5" />
                {t("themeMode")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mode">{t("activeMode")}</Label>
                  <Select
                    value={form.watch("mode")}
                    onValueChange={(value: "light" | "dark" | "system") =>
                      form.setValue("mode", value)
                    }
                  >
                    <SelectTrigger className="rounded-xl border-border bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">{t("light")}</SelectItem>
                      <SelectItem value="dark">{t("dark")}</SelectItem>
                      <SelectItem value="system">{t("system")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("currentTheme")}</Label>
                  <div className="rounded-2xl border border-border bg-muted p-3 text-sm text-muted-foreground">
                    {theme ?? t("system")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="apex-stat-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold tracking-tight text-foreground">
                {t("colorTokens")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("presets")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handlePreset(preset)}
                      className="flex items-center gap-2 rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-border"
                        style={{ backgroundColor: preset.primary }}
                      />
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <ColorField
                id="primaryColor"
                label={t("primary")}
                description={t("primaryDescription")}
                form={form}
              />
              <ColorField
                id="secondaryColor"
                label={t("secondary")}
                description={t("secondaryDescription")}
                form={form}
              />
              <div className="grid gap-4 md:grid-cols-3">
                <ColorField
                  id="backgroundColor"
                  label={t("background")}
                  description={t("backgroundDescription")}
                  form={form}
                />
                <ColorField
                  id="foregroundColor"
                  label={t("foreground")}
                  description={t("foregroundDescription")}
                  form={form}
                />
                <ColorField
                  id="borderColor"
                  label={t("border")}
                  description={t("borderDescription")}
                  form={form}
                />
              </div>
              {Object.entries(form.formState.errors).map(([key, error]) => (
                <p key={key} className="text-sm text-destructive">
                  {error?.message}
                </p>
              ))}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="apex-stat-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold tracking-tight text-foreground">
                {t("livePreview")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="space-y-4 rounded-3xl border border-border bg-background p-4 shadow-lg"
                style={previewStyle}
              >
                <div className="rounded-2xl bg-primary p-4 font-semibold text-primary-foreground">
                  {t("primaryAction")}
                </div>
                <div className="rounded-2xl bg-secondary p-4 text-sm text-secondary-foreground">
                  {t("secondarySurface")}
                </div>
                <div className="rounded-2xl bg-background p-4 text-foreground">
                  <p className="font-semibold">Card title</p>
                  <p className="text-sm opacity-70">
                    {t("previewText")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2 lg:justify-start">
            <Button type="submit" disabled={saving} className="rounded-xl">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("saving")}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {t("saveTheme")}
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={resetTheme} className="rounded-xl">
              <RotateCcw className="mr-2 h-4 w-4" />
              {t("reset")}
            </Button>
          </div>
        </aside>
      </form>
    </div>
  );
}

function ColorField({
  id,
  label,
  description,
  form,
}: {
  id: keyof ThemeSettingsFormData;
  label: string;
  description: string;
  form: ReturnType<typeof useForm<ThemeSettingsFormData>>;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          type="color"
          className="h-10 w-16 cursor-pointer rounded-xl border-border p-1"
          {...form.register(id)}
        />
        <Input
          type="text"
          aria-label={`${label} hex value`}
          className="rounded-xl"
          {...form.register(id)}
        />
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
      {form.formState.errors[id] && (
        <p className="text-sm text-destructive">
          {form.formState.errors[id]?.message}
        </p>
      )}
    </div>
  );
}

function darkenHex(hex: string, amount: number): string {
  const normalized = hex.replace("#", "");
  const r = Math.max(0, parseInt(normalized.slice(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(normalized.slice(2, 4), 16) - amount);
  const b = Math.max(0, parseInt(normalized.slice(4, 6), 16) - amount);

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function applyThemeSettings(data: ThemeSettingsFormData) {
  const root = document.documentElement;

  root.style.setProperty("--primary", hexToHslString(data.primaryColor));
  root.style.setProperty("--secondary", hexToHslString(data.secondaryColor));
  root.style.setProperty("--background", hexToHslString(data.backgroundColor));
  root.style.setProperty("--foreground", hexToHslString(data.foregroundColor));
  root.style.setProperty("--border", hexToHslString(data.borderColor));

  root.style.setProperty("--primary-hover", hexToHslString(darkenHex(data.primaryColor, 20)));
  root.style.setProperty("--primary-active", hexToHslString(darkenHex(data.primaryColor, 35)));
  root.style.setProperty("--primary-foreground", "#ffffff");
  root.style.setProperty("--secondary-hover", hexToHslString(data.backgroundColor));
  root.style.setProperty("--muted-hover", hexToHslString(data.borderColor));
  root.style.setProperty("--accent-hover", hexToHslString(data.backgroundColor));
  root.style.setProperty("--border-hover", hexToHslString(data.borderColor));
  root.style.setProperty("--input-hover", hexToHslString(data.backgroundColor));
  root.style.setProperty("--ring-offset", hexToHslString(data.backgroundColor));
  root.style.setProperty("--secondary-active", hexToHslString(data.borderColor));
  root.style.setProperty("--muted-active", hexToHslString(data.borderColor));
  root.style.setProperty("--accent-active", hexToHslString(data.borderColor));

  root.style.setProperty("--apex-primary", hexToHslString(data.primaryColor));
  root.style.setProperty("--apex-secondary", hexToHslString(data.secondaryColor));
  root.style.setProperty("--apex-bg", hexToHslString(data.backgroundColor));
  root.style.setProperty("--apex-foreground", hexToHslString(data.foregroundColor));
  root.style.setProperty("--apex-border", hexToHslString(data.borderColor));
  root.style.setProperty("--apex-border-soft", hexToHslString(data.borderColor));
  root.style.setProperty(
    "--apex-primary-soft",
    `color-mix(in srgb, ${data.primaryColor} 10%, white)`
  );
  root.style.setProperty(
    "--apex-gradient-primary",
    `linear-gradient(135deg, ${data.primaryColor} 0%, ${data.secondaryColor} 100%)`
  );
  root.style.setProperty("--apex-sidebar-active", data.primaryColor);
  root.style.setProperty("--chart-1", hexToHslString(data.primaryColor));
}
