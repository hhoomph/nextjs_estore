"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Grid3X3, Package, Search } from "lucide-react";
import { SectionHeading } from "@/components/features/layout/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Category {
  id: string;
  name: string;
  level: number;
  productCount: number;
}

function categorySlug(name: string) {
  return encodeURIComponent(name.toLowerCase().replace(/\s+/g, "-"));
}

function CategoryCard({ category }: { category: Category }) {
  const t = useTranslations("categories");
  const indent = category.level > 0 ? { marginLeft: `${category.level * 1.25}rem` } : undefined;

  return (
    <Card
      style={indent}
      className="group overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
    >
      <CardHeader className="pb-3">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition group-hover:scale-105">
          <Package className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl font-black text-foreground group-hover:text-primary">
          {category.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        <div className="flex items-center justify-between">
          <Badge className="rounded-full bg-primary/10 text-primary">
            {category.productCount}{" "}
            {category.productCount === 1
              ? t("product.singular")
              : t("product.plural")}
          </Badge>
          <Grid3X3 className="h-5 w-5 text-primary/70" />
        </div>
          <Button
            asChild={true}
            className="w-full rounded-full bg-primary text-primary-foreground font-bold hover:bg-primary/90"
          >
            <Link href={`/categories/${categorySlug(category.name)}`}>
              {t("category.browse")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
      </CardContent>
    </Card>
  );
}

export default function CategoriesPage() {
  const t = useTranslations("categories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchCategories = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/categories", {
          signal: controller.signal,
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || t("error.fetchFailed"));
        }

        setCategories(data.categories || []);
      } catch (err) {
        if (
          err instanceof Error &&
          (err.name === "AbortError" || err.message === "Failed to fetch")
        ) {
          return;
        }
        setError(err instanceof Error ? err.message : t("error.fetchFailed"));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void fetchCategories();

    return () => controller.abort();
  }, [t]);

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((category) =>
      category.name.toLowerCase().includes(query),
    );
  }, [categories, searchQuery]);

  const totalProducts = filteredCategories.reduce(
    (total, category) => total + category.productCount,
    0,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container flex min-h-[60vh] items-center justify-center px-4 py-20">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary" />
            <p className="font-semibold text-muted-foreground">{t("loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 py-20">
          <div className="mx-auto max-w-lg rounded-[2rem] border border-border/60 bg-card p-8 text-center shadow-xl shadow-primary/10">
            <Package className="mx-auto mb-4 h-14 w-14 text-primary" />
            <h1 className="mb-3 text-2xl font-black text-foreground">
              {t("error.title")}
            </h1>
            <p className="mb-6 text-muted-foreground">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {t("error.tryAgain")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/80 backdrop-blur">
        <div className="container px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/" className="font-semibold text-foreground">
              Home
            </Link>
            <span>/</span>
            <span className="font-bold text-foreground">{t("title")}</span>
          </nav>
        </div>
      </div>

      <div className="container px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <SectionHeading
          eyebrow={t("subtitle")}
          title={t("header.title")}
          description={t("header.subtitle")}
          className="mb-10"
        />

        <div className="mx-auto mb-10 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("search.placeholder")}
              className="rounded-full pl-12 pr-12 py-6 text-base"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full"
                onClick={() => setSearchQuery("")}
              >
                <span className="sr-only">Clear search</span>×
              </Button>
            )}
          </div>
        </div>

        <div className="mb-10 flex justify-center">
          <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-muted-foreground">
            <span className="rounded-full border border-border bg-card px-4 py-2 shadow-sm">
              <Grid3X3 className="mr-2 inline h-4 w-4 text-primary" />
              {filteredCategories.length} {t("stats.categories")}
            </span>
            <span className="rounded-full border border-border bg-card px-4 py-2 shadow-sm">
              <Package className="mr-2 inline h-4 w-4 text-primary" />
              {totalProducts} {t("stats.products")}
            </span>
          </div>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-[2rem] border border-border/60 bg-card p-10 text-center shadow-xl shadow-primary/10">
            <Package className="mx-auto mb-4 h-14 w-14 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-black text-foreground">
              {t("empty.title")}
            </h3>
            <p className="mb-6 text-muted-foreground">
              {searchQuery ? t("empty.searchMessage") : t("empty.noCategories")}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setSearchQuery("")}
              >
                {t("empty.clearSearch")}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filteredCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <div className="rounded-[2.5rem] border border-border/60 bg-card p-8 shadow-xl shadow-primary/10">
            <Package className="mx-auto mb-4 h-14 w-14 text-primary" />
            <h3 className="text-2xl font-black text-foreground">
              {t("cta.title")}
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
              {t("cta.subtitle")}
            </p>
              <Button asChild={true} size="lg" className="mt-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/products">
                  {t("cta.browseAll")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
