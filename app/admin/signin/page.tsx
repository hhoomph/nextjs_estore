/**
 * Module for page
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import { useState } from "react";

// Force dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Shield, ArrowLeft } from "lucide-react";

const adminSignInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type AdminSignInForm = z.infer<typeof adminSignInSchema>;

export default function AdminSignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const t = useTranslations("Admin Signin");

  const form = useForm<AdminSignInForm>({
    resolver: zodResolver(adminSignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSignIn = async (data: AdminSignInForm) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        setError(result.error.message || "Sign in failed");
      } else {
        // Always verify admin role via session after sign-in
        // Better Auth may not include additional fields (like role) in the sign-in response
        const sessionResult = await authClient.getSession();
        const sessionUser = sessionResult.data?.user as any;
        
        if (sessionUser?.role === "ADMIN") {
          router.push("/admin");
          router.refresh();
        } else {
          setError("Access denied. Admin privileges required.");
          // Sign out the user since they don't have admin access
          await authClient.signOut();
        }
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      {/* {t("backToSite")} link */}
      <div className="absolute top-4 left-4">
        <Link
          href="/"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("backToSite")}
        </Link>
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            {t("title")}
          </CardTitle>
          <CardDescription>
            {t("subtitle")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(handleSignIn)} className="space-y-4">
            {error && (
              <div className="flex items-center space-x-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                data-testid="admin-email"
                type="email"
                placeholder="admin@example.com"
                {...form.register("email")}
                className="focus:ring-primary"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                data-testid="admin-password"
                type="password"
                placeholder="Enter your admin password"
                {...form.register("password")}
                className="focus:ring-primary"
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Access Admin Panel"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p className="mb-2">{t("restricted")}</p>
            <p>
              {t("notAdmin")}{" "}
              <Link href="/auth/signin" className="text-primary hover:underline">
                {t("signInAsUser")}
              </Link>
            </p>
          </div>

          <Separator className="my-6" />

          <div className="text-center text-xs text-muted-foreground">
            <p className="mb-2">{t("needHelp")}</p>
            <p>{t("contactAdmin")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
