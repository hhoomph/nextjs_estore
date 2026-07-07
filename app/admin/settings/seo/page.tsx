"use client";

export const dynamic = "force-dynamic";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Search } from "lucide-react";

const seoSettingsSchema = z.object({
  defaultSeoTitle: z.string().min(1, "Default SEO title is required"),
  defaultSeoDescription: z
    .string()
    .min(1, "Default SEO description is required"),
  defaultOgImage: z.string().url("Enter a valid image URL").optional(),
  googleAnalyticsId: z.string().optional(),
});

type SEOSettingsFormData = z.infer<typeof seoSettingsSchema>;

export default function AdminSEOSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<SEOSettingsFormData>({
    resolver: zodResolver(seoSettingsSchema),
    defaultValues: {
      defaultSeoTitle: "",
      defaultSeoDescription: "",
      defaultOgImage: "",
      googleAnalyticsId: "",
    },
  });

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/settings");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch SEO settings");
      }

      form.reset(data.settings);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load SEO settings");
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const onSubmit = async (data: SEOSettingsFormData) => {
    setSaving(true);

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
        throw new Error(result.error || "Failed to save SEO settings");
      }

      form.reset(result.settings);
      toast.success("SEO settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save SEO settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2 text-muted-foreground">Loading SEO settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SEO Settings</h1>
          <p className="text-muted-foreground">
            Configure default metadata, social preview, and analytics identifiers.
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Metadata
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultSeoTitle">Default SEO Title</Label>
              <Input id="defaultSeoTitle" {...form.register("defaultSeoTitle")} />
              {form.formState.errors.defaultSeoTitle && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.defaultSeoTitle.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultSeoDescription">
                Default SEO Description
              </Label>
              <Textarea
                id="defaultSeoDescription"
                {...form.register("defaultSeoDescription")}
                rows={4}
              />
              {form.formState.errors.defaultSeoDescription && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.defaultSeoDescription.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Social Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultOgImage">Default Open Graph Image URL</Label>
              <Input id="defaultOgImage" {...form.register("defaultOgImage")} />
              {form.formState.errors.defaultOgImage && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.defaultOgImage.message}
                </p>
              )}
            </div>

            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="mb-3">
                <p className="text-sm font-medium">Preview</p>
                <p className="text-sm text-muted-foreground">
                  This card mirrors the default metadata shape used by pages that do not
                  override their SEO values.
                </p>
              </div>
              <div className="space-y-2 rounded-md border bg-background p-4">
                <p className="font-semibold">
                  {form.watch("defaultSeoTitle") || "Untitled page"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {form.watch("defaultSeoDescription") ||
                    "Add a concise description for search results."}
                </p>
                {form.watch("defaultOgImage") ? (
                  <div className="overflow-hidden rounded-md border">
                    <img
                      src={form.watch("defaultOgImage")}
                      alt="Open graph preview"
                      className="h-32 w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-32 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                    Open graph image preview
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
              <Input
                id="googleAnalyticsId"
                placeholder="G-XXXXXXXXXX"
                {...form.register("googleAnalyticsId")}
              />
              <p className="text-sm text-muted-foreground">
                Leave blank if analytics are not enabled for this environment.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save SEO Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

