/**
 * Module for page
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Force dynamic rendering to avoid prerendering issues
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { ArrowRight, Grid3X3, Package, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Category {
  id: string;
  name: string;
  level: number | null;
  productCount: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/categories");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch categories");
        }

        setCategories(data.categories);
        setFilteredCategories(data.categories);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch categories",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter((category) =>
        category.name?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredCategories(filtered);
    }
  }, [searchQuery, categories]);

  if (loading) {
    return (
      <div className="bg-background">
        <div className="container px-4 py-20">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 style={{ borderBottomColor: 'rgb(59, 130, 246)' }}"></div>
            <span className="ml-2">Loading categories...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background">
        <div className="container px-4 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">
              Error Loading Categories
            </h1>
            <p className="text-muted-foreground mb-8">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="container px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground">Categories</span>
          </nav>
        </div>
      </div>

      <div className="container px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Shop by Category</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse our wide selection of products organized by category. Find
            exactly what you're looking for with ease.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              <span>{filteredCategories.length} categories</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span>
                {filteredCategories.reduce(
                  (total, cat) => total + cat.productCount,
                  0,
                )}{" "}
                products
              </span>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No categories found</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search terms."
                : "No categories are available at the moment."}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map((category) => (
              <Card
                key={category.id}
                className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader className="pb-3">
                  <div className="w-12 h-12 style={{ backgroundColor: 'rgb(59, 130, 246)' }}/10 rounded-lg flex items-center justify-center mb-3">
                    <Package className="h-6 w-6 style={{ color: 'rgb(59, 130, 246)' }}" />
                  </div>
                  <CardTitle className="text-lg group-hover:style={{ color: 'rgb(59, 130, 246)' }} transition-colors">
                    {category.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary" className="text-xs">
                      {category.productCount}{" "}
                      {category.productCount === 1 ? "product" : "products"}
                    </Badge>
                  </div>

                  <Link
                    href={`/categories/${encodeURIComponent(category.name.toLowerCase().replace(/\s+/g, "-"))}`}
                  >
                    <Button className="w-full group-hover:bg-blue-600 group-hover:text-blue-foreground transition-colors">
                      Browse Category
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Browse All Products CTA */}
        <div className="text-center mt-16">
          <div className="bg-muted/50 rounded-lg p-8">
            <Package className="h-12 w-12 style={{ color: 'rgb(59, 130, 246)' }} mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Can't find what you're looking for?
            </h3>
            <p className="text-muted-foreground mb-6">
              Browse all our products to discover more options.
            </p>
            <Link href="/products">
              <Button size="lg">
                Browse All Products
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
