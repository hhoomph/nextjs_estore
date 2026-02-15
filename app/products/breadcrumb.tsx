/**
 * Client component for products breadcrumb with translations
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function ProductsBreadcrumb() {
  const t = useTranslations("products");

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
      <Link href="/" className="hover:text-foreground">
        {t("breadcrumb.home")}
      </Link>
      <span>/</span>
      <span className="text-foreground">{t("breadcrumb.products")}</span>
    </nav>
  );
}
