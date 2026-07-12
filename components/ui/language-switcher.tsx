/**
 * Language Switcher Component
 *
 * Switches language using cookies instead of URL prefixes.
 * Persian (fa) is default with RTL support.
 * Also handles currency switching based on locale.
 *
 * @author hh.oomph@gmail.com
 * @version 3.1.0
 * @since 2025-01-01
 */
"use client";

import { Check, Languages, CreditCard } from "lucide-react";
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
  const t = useTranslations("Navigation");
  const [isLoading, setIsLoading] = useState(false);

  const languages = [
    { code: "fa" as const, name: "فارسی", flag: "🇮🇷", currency: "toman-fa" },
    { code: "en" as const, name: "English", flag: "🇺🇸", currency: "usd" },
  ];

  const switchLanguage = async (newLocale: CookieLocale) => {
    if (newLocale === locale || isLoading) return;

    setIsLoading(true);
    try {
      const localeResponse = await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: newLocale }),
      });

      if (!localeResponse.ok) {
        console.error("Failed to switch language");
        setIsLoading(false);
        return;
      }

      // Fire-and-forget currency update (non-blocking, best-effort)
      const currency = languages.find((l) => l.code === newLocale)?.currency;
      fetch("/api/currency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency }),
      }).catch(() => {
        // Silently ignore currency update failures
      });

      // Reset loading state and reload to apply new locale
      setIsLoading(false);
      window.location.reload();
    } catch (error) {
      console.error("Error switching language:", error);
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
          aria-label={locale === "fa" ? "زبان و واحد پول - Language & Currency" : "Language & Currency"}
        >
          <Languages className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          <span className="sr-only">{t("language")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
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
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{lang.name}</span>
                {locale === lang.code && (
                  <Check className="ml-auto h-4 w-4 text-primary" />
                )}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <CreditCard className="h-3 w-3" />
                <span>{lang.code === "fa" ? "تومان" : "USD"}</span>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
