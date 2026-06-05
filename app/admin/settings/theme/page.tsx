/**
 * Admin Theme Settings Page
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

export const dynamic = 'force-dynamic';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Paintbrush } from "lucide-react";

export default function AdminThemeSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Theme Settings</h1>
          <p className="text-muted-foreground">
            Manage visual appearance and styling
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paintbrush className="h-5 w-5" />
            Theme Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <Palette className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Theme Settings Coming Soon</h3>
          <p className="text-muted-foreground">
            Customize colors, typography, layout options, and visual preferences.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
