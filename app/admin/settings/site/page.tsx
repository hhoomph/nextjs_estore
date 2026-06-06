/**
 * Admin Site Settings Page
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Globe } from "lucide-react";

export default function AdminSiteSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Site Settings</h1>
          <p className="text-muted-foreground">
            Manage general site configuration
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Site Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Site Settings Coming Soon</h3>
          <p className="text-muted-foreground">
            Configure site name, description, logo, favicon, and general preferences.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
