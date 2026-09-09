"use client";

import { useTranslations } from "next-intl";

export function PopularBreadcrumb() {
  const t = useTranslations("Navigation");

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
      <span>/</span>
      <span className="text-foreground">{t("popular")}</span>
    </nav>
  );
}
