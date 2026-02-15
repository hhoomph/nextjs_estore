/**
 * Blog filters component for filtering blog posts by category, tag, and search
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

"use client";

import { Filter, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  icon: string | null;
  _count: {
    posts: number;
  };
}

interface BlogTag {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  _count: {
    posts: number;
  };
}

interface BlogFiltersProps {
  categories: BlogCategory[];
  tags: BlogTag[];
  currentCategory?: string;
  currentTag?: string;
  searchQuery?: string;
  locale: string;
}

export function BlogFilters({
  categories,
  tags,
  currentCategory,
  currentTag,
  searchQuery,
  locale,
}: BlogFiltersProps) {
  const t = (useTranslations as any)("blog");
  const router = useRouter();
  const pathname = usePathname();
  const [searchValue, setSearchValue] = useState(searchQuery || "");

  const updateFilters = (updates: {
    category?: string;
    tag?: string;
    search?: string;
  }) => {
    const params = new URLSearchParams();

    const category =
      updates.category !== undefined ? updates.category : currentCategory;
    const tag = updates.tag !== undefined ? updates.tag : currentTag;
    const search = updates.search !== undefined ? updates.search : searchValue;

    if (category && category !== "all") params.set("category", category);
    if (tag && tag !== "all") params.set("tag", tag);
    if (search) params.set("search", search);

    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
  };

  const clearFilters = () => {
    setSearchValue("");
    router.push(pathname);
  };

  const hasActiveFilters = currentCategory || currentTag || searchQuery;

  return (
    <div className="bg-card border rounded-lg p-4 mb-8">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateFilters({ search: searchValue });
              }
            }}
            className="pl-9"
          />
        </div>

        {/* Category Filter */}
        <Select
          value={currentCategory || "all"}
          onValueChange={(value) => updateFilters({ category: value })}
        >
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder={t("allCategories")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allCategories")}</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.slug}>
                <div className="flex items-center gap-2">
                  {category.icon && <span>{category.icon}</span>}
                  <span>{category.name}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {category._count.posts}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tag Filter */}
        <Select
          value={currentTag || "all"}
          onValueChange={(value) => updateFilters({ tag: value })}
        >
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder={t("allTags")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allTags")}</SelectItem>
            {tags.map((tag) => (
              <SelectItem key={tag.id} value={tag.slug}>
                <div className="flex items-center gap-2">
                  <span>{tag.name}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {tag._count.posts}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search Button */}
        <Button
          onClick={() => updateFilters({ search: searchValue })}
          disabled={!searchValue.trim()}
        >
          <Search className="w-4 h-4 mr-2" />
          {t("search")}
        </Button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters}>
            <X className="w-4 h-4 mr-2" />
            {t("clearFilters")}
          </Button>
        )}

        {/* Mobile Filters */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild={true}>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                {t("filters")}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto">
              <SheetHeader>
                <SheetTitle>{t("filters")}</SheetTitle>
                <SheetDescription>{t("filterDescription")}</SheetDescription>
              </SheetHeader>

              <div className="space-y-4 mt-6">
                {/* Mobile Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder={t("searchPlaceholder")}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Mobile Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("category")}</label>
                  <Select
                    value={currentCategory || "all"}
                    onValueChange={(value) =>
                      updateFilters({ category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("allCategories")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("allCategories")}</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.slug}>
                          <div className="flex items-center gap-2">
                            {category.icon && <span>{category.icon}</span>}
                            <span>{category.name}</span>
                            <Badge
                              variant="secondary"
                              className="ml-auto text-xs"
                            >
                              {category._count.posts}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Mobile Tag Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("tag")}</label>
                  <Select
                    value={currentTag || "all"}
                    onValueChange={(value) => updateFilters({ tag: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("allTags")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("allTags")}</SelectItem>
                      {tags.map((tag) => (
                        <SelectItem key={tag.id} value={tag.slug}>
                          <div className="flex items-center gap-2">
                            <span>{tag.name}</span>
                            <Badge
                              variant="secondary"
                              className="ml-auto text-xs"
                            >
                              {tag._count.posts}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Mobile Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => updateFilters({ search: searchValue })}
                    disabled={!searchValue.trim()}
                    className="flex-1"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {t("search")}
                  </Button>

                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-2" />
                      {t("clearFilters")}
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
          <span className="text-sm text-muted-foreground mr-2">
            {t("activeFilters")}:
          </span>

          {currentCategory && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {t("category")}:{" "}
              {categories.find((c) => c.slug === currentCategory)?.name}
              <button
                onClick={() => updateFilters({ category: undefined })}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {currentTag && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {t("tag")}: {tags.find((t) => t.slug === currentTag)?.name}
              <button
                onClick={() => updateFilters({ tag: undefined })}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {t("search")}: "{searchQuery}"
              <button
                onClick={() => {
                  setSearchValue("");
                  updateFilters({ search: "" });
                }}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
