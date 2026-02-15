/**
 * Cookie-based Language Switcher
 *
 * Switches language using cookies instead of URL prefixes.
 * Persian (fa) is default with RTL support.
 *
 * @author hh.oomph@gmail.com
 * @version 2.0.0
 * @since 2025-01-01
 */
"use client";

import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import type { CookieLocale } from "@/lib/i18n/cookie-locale";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("Navigation");
  const [isLoading, setIsLoading] = useState(false);

  const languages = [
    { code: "fa" as const, name: "فارسی", flag: "🇮🇷" },
    { code: "en" as const, name: "English", flag: "🇺🇸" },
  ];

  const currentLanguage = languages.find((lang) => lang.code === locale);

  const switchLanguage = async (newLocale: CookieLocale) => {
    if (newLocale === locale || isLoading) return;

    setIsLoading(true);
    try {
      // Call API to set locale cookie
      const response = await fetch("/api/locale", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ locale: newLocale }),
      });

      if (response.ok) {
        // Refresh to apply new locale (re-renders Server Components)
        router.refresh();
      } else {
        console.error("Failed to switch language");
      }
    } catch (error) {
      console.error("Error switching language:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild={true}>
        <Button
          variant="ghost"
          size="icon"
          className="relative cursor-pointer"
          disabled={isLoading}
          aria-label={locale === "fa" ? "زبان - Language" : "Language - زبان"}
        >
          <Languages className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          <span className="sr-only">{t("settings")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => switchLanguage(lang.code)}
            disabled={isLoading}
            className={`flex items-center gap-2 ${
              locale === lang.code ? "bg-accent" : ""
            } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span>{lang.name}</span>
            {locale === lang.code && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
