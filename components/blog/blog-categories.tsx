/**
 * Blog Categories Component
 *
 * Displays a list of blog categories with post counts.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import type { BlogCategoryWithCount } from "./types";

interface BlogCategoriesProps {
  categories: BlogCategoryWithCount[];
  activeCategory?: string;
}

export function BlogCategories({
  categories,
  activeCategory,
}: BlogCategoriesProps) {
  const t = useTranslations("Blog");

  // Locale is handled via cookies (localePrefix: "never")

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">{t("categories.title")}</h3>

      <div className="space-y-2">
        {/* All Categories Link */}
        <Link
          href="/blog"
          className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
            !activeCategory
              ? "bg-primary/10 text-primary border border-primary/20"
              : "hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <span className="font-medium">{t("categories.all")}</span>
          <Badge variant="secondary" className="text-xs">
            {categories.reduce((total, cat) => total + cat.posts.length, 0)}
          </Badge>
        </Link>

        {/* Individual Categories */}
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/blog?category=${category.slug}`}
            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
              activeCategory === category.slug
                ? "bg-primary/10 text-primary border border-primary/20"
                : "hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <div className="flex items-center space-x-2">
              {category.icon && (
                <span className="text-lg">{category.icon}</span>
              )}
              <span className="font-medium">{category.name}</span>
            </div>
            <Badge
              variant="secondary"
              className="text-xs"
              style={{
                backgroundColor: category.color
                  ? `${category.color}20`
                  : undefined,
                borderColor: category.color ? category.color : undefined,
                color: category.color || undefined,
              }}
            >
              {category.posts.length}
            </Badge>
          </Link>
        ))}
      </div>

      {/* Category Description */}
      {activeCategory &&
        categories.find((cat) => cat.slug === activeCategory)?.description && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {
                categories.find((cat) => cat.slug === activeCategory)
                  ?.description
              }
            </p>
          </div>
        )}
    </div>
  );
}
