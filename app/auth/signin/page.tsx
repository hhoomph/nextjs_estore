"use client";

// Force dynamic rendering to avoid prerendering issues
export const dynamic = "force-dynamic";

/**
 * User sign-in page
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { FormEvent } from "react";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, ArrowRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useTranslations } from "next-intl";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type SignInForm = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const t = useTranslations("auth.signin");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || t("errors.unexpectedError"));
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
        signal: AbortSignal.timeout(15_000),
      });
      const result = (await response.json()) as {
        error?: { message?: string } | null;
        user?: { role?: string } | null;
      } | null;

      if (!response.ok) {
        setError(result?.error?.message || t("errors.signInFailed"));
        return;
      }

      // Refresh the Better Auth session atom after the HttpOnly cookie is written.
      authClient.$store.notify("$sessionSignal");

      // Check if the user has ADMIN role — redirect to admin dashboard
      if (result?.user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/account");
      }
    } catch {
      setError(t("errors.unexpectedError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      {/* Back to home link */}
      <div className="absolute top-4 left-4">
        <Link
          href="/"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
          {t("backToHome", { fallback: "Back to home" })}
        </Link>
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">
            {t("title")}
          </CardTitle>
          <CardDescription>
            {t("subtitle")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center space-x-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t("email.label")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("email.placeholder")}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="focus:ring-primary"
              />
              {error.includes("email") && (
                <p className="text-sm text-destructive">
                  {t("errors.invalidEmail", { fallback: "Email is required." })}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("password.label")}</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder={t("password.placeholder")}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="focus:ring-primary"
              />
              {error.includes("Password") && (
                <p className="text-sm text-destructive">
                  {t("errors.invalidPassword", { fallback: "Password must be at least 6 characters." })}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            >
              {isLoading ? t("loading") : t("submit")}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              {t("noAccount")}{" "}
              <Link href="/auth/signup" className="text-primary hover:underline font-medium">
                {t("signUp")}
              </Link>
            </p>
          </div>

          <Separator className="my-6" />

          <div className="text-center text-xs text-muted-foreground">
            <p>
              <Link href="/help" className="hover:underline">
                {t("needHelp", { fallback: "Need help?" })}
              </Link>
              {" "}·{" "}
              <Link href="/contact" className="hover:underline">
                {t("contactUs", { fallback: "Contact us" })}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
