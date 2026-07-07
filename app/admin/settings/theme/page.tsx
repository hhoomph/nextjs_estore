"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import type * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTheme } from "@/components/providers/theme-provider";
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
  const { theme, setTheme } = useTheme();
  const [saving, setSaving] = useState(false);

  const form = useForm<ThemeSettingsFormData>({
    resolver: zodResolver(themeSettingsSchema),
    defaultValues: DEFAULT_THEME,
  });

  const previewStyle = useMemo(
    () =>
      ({
        "--primary": hexToHsl(form.watch("primaryColor")),
        "--secondary": hexToHsl(form.watch("secondaryColor")),
        "--background": hexToHsl(form.watch("backgroundColor")),
        "--foreground": hexToHsl(form.watch("foregroundColor")),
        "--border": hexToHsl(form.watch("borderColor")),
        "--apex-primary": hexToHsl(form.watch("primaryColor")),
        "--apex-secondary": hexToHsl(form.watch("secondaryColor")),
        "--apex-bg": hexToHsl(form.watch("backgroundColor")),
        "--apex-foreground": hexToHsl(form.watch("foregroundColor")),
        "--apex-border": hexToHsl(form.watch("borderColor")),
        "--apex-border-soft": hexToHsl(form.watch("borderColor")),
      }) as React.CSSProperties,
    [form],
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
      toast.success("Theme settings saved for this browser");
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
    toast.success("Theme settings reset");
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Workspace styling
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          Theme Settings
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Preview and persist local theme colors for the admin workspace.
        </p>
      </section>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card className="apex-stat-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground">
                <Palette className="h-5 w-5" />
                Theme Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mode">Active Mode</Label>
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
            </CardContent>
          </Card>

          <Card className="apex-stat-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold tracking-tight text-foreground">
                Color Tokens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ColorField
                id="primaryColor"
                label="Primary"
                description="Buttons, focus rings, and primary actions."
                form={form}
              />
              <ColorField
                id="secondaryColor"
                label="Secondary"
                description="Supporting surfaces and muted actions."
                form={form}
              />
              <div className="grid gap-4 md:grid-cols-3">
                <ColorField
                  id="backgroundColor"
                  label="Background"
                  description="Page background."
                  form={form}
                />
                <ColorField
                  id="foregroundColor"
                  label="Foreground"
                  description="Primary text."
                  form={form}
                />
                <ColorField
                  id="borderColor"
                  label="Border"
                  description="Cards, inputs, and dividers."
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
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="space-y-4 rounded-3xl border border-border bg-background p-4 shadow-lg"
                style={previewStyle}
              >
                <div className="rounded-2xl bg-primary p-4 font-semibold text-primary-foreground">
                  Primary action
                </div>
                <div className="rounded-2xl bg-secondary p-4 text-sm text-secondary-foreground">
                  Secondary surface
                </div>
                <div className="rounded-2xl bg-background p-4 text-foreground">
                  <p className="font-semibold">Card title</p>
                  <p className="text-sm opacity-70">
                    Preview text uses the selected foreground color.
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
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Theme
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={resetTheme} className="rounded-xl">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
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

function applyThemeSettings(data: ThemeSettingsFormData) {
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
  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

