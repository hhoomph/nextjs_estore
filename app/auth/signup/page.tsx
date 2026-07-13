/**
 * User sign-up page
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useTranslations } from "next-intl";

const signUpSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpForm = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const t = useTranslations("auth.signup");

  const form = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSignUp = async (data: SignUpForm) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (result.error) {
        setError(result.error.message || t("errors.unexpectedError"));
      } else {
        setSuccess(true);
        // Redirect to sign-in after a short delay
        setTimeout(() => {
          router.push("/auth/signin");
        }, 2000);
      }
    } catch {
      setError(t("errors.unexpectedError"));
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-success" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{t("successTitle", { fallback: "Account Created!" })}</h2>
            <p className="text-muted-foreground mb-4">
              {t("successMessage", { fallback: "Your account has been created successfully. Redirecting to sign in..." })}
            </p>
            <Link href="/auth/signin" className="text-primary hover:underline">
              {t("successLink", { fallback: "Click here if you're not redirected" })}
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <form onSubmit={form.handleSubmit(handleSignUp)} className="space-y-4">
            {error && (
              <div className="flex items-center space-x-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">{t("name.label")}</Label>
              <Input
                id="name"
                type="text"
                placeholder={t("name.placeholder")}
                {...form.register("name")}
                className="focus:ring-primary"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("email.label")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("email.placeholder")}
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
              <Label htmlFor="password">{t("password.label")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("password.placeholder")}
                {...form.register("password")}
                className="focus:ring-primary"
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("confirmPassword.label")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t("confirmPassword.placeholder")}
                {...form.register("confirmPassword")}
                className="focus:ring-primary"
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t("loading") : t("submit")}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              {t("hasAccount")}{" "}
              <Link href="/auth/signin" className="text-primary hover:underline font-medium">
                {t("signIn")}
              </Link>
            </p>
          </div>

          <Separator className="my-6" />

          <div className="text-center text-xs text-muted-foreground">
            <p>
              {t("termsAgreement", { fallback: "By signing up, you agree to our" })}{" "}
              <Link href="/terms-condition" className="hover:underline">
                {t("terms", { fallback: "Terms" })}
              </Link>
              {" "}{t("and", { fallback: "and" })}{" "}
              <Link href="/privacy-policy" className="hover:underline">
                {t("privacy", { fallback: "Privacy Policy" })}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
