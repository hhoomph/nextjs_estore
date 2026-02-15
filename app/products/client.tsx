/**
 * Module for client
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import {
  AlertCircle,
  Filter,
  Grid3X3,
  List,
  Loader2,
  RefreshCw,
  Search,
  Star,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { useCartStore } from "@/lib/stores/cart-store";

interface Product {
  id: string;
  name: string | null;
  desc: string | null;
  slug: string | null;
  price: number;
  discount_price?: number | null;
  quantity: number;
  category?: { id: string; name: string } | null;
  images: string[];
  inStock: boolean;
  createdAt: Date | string;
}

interface ProductResult {
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface ProductsPageClientProps {
  initialData: ProductResult;
}

// Use translations for categories and sort options
const getCategories = (t: any) => [
  { key: "All", label: t("categories.All") },
  { key: "Electronics", label: t("categories.Electronics") },
  { key: "Fashion", label: t("categories.Fashion") },
  { key: "Home & Garden", label: t("categories.Home & Garden") },
  { key: "Sports", label: t("categories.Sports") },
  { key: "Books", label: t("categories.Books") },
];

const getSortOptions = (t: any) => [
  { value: "created_at", label: t("sortOptions.newest") },
  { value: "price", label: t("sortOptions.priceLowHigh") },
  { value: "price-high", label: t("sortOptions.priceHighLow") },
  { value: "name", label: t("sortOptions.name") },
];

// Skeleton Loading Component
function ProductSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="aspect-square bg-muted animate-pulse" />
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="h-3 bg-muted animate-pulse rounded" />
          <div className="h-4 bg-muted animate-pulse rounded" />
          <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="h-9 bg-muted animate-pulse rounded w-full" />
      </CardFooter>
    </Card>
  );
}

// Error Component
function ErrorDisplay({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="text-center py-12">
      <div className="flex flex-col items-center space-y-4">
        <div className="p-3 rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{error}</h3>
          <p className="text-muted-foreground max-w-md">{error}</p>
        </div>
        <Button onClick={onRetry} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    </div>
  );
}

// Filter Content Component
function FilterContent({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  inStockOnly,
  setInStockOnly,
  categories,
}: {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  priceRange: number[];
  setPriceRange: (value: number[]) => void;
  inStockOnly: boolean;
  setInStockOnly: (value: boolean) => void;
  categories: Array<{ key: string; label: string }>;
}) {
  const t = useTranslations("products");

  return (
    <>
      {/* Search */}
      <div>
        <h3 className="font-semibold mb-3">{t("filters.search")}</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("search")}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3">{t("filters.categories")}</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.key} className="flex items-center space-x-2">
              <Checkbox
                id={category.key}
                checked={selectedCategory === category.key}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedCategory(category.key);
                  } else {
                    setSelectedCategory("");
                  }
                }}
              />
              <label
                htmlFor={category.key}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {category.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">{t("filters.priceRange")}</h3>
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={1000}
            step={10}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="font-semibold mb-3">{t("filters.rating")}</h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox id={`rating-${rating}`} />
              <label
                htmlFor={`rating-${rating}`}
                className="flex items-center space-x-1 text-sm"
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
                <span>{t("filters.andUp")}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="font-semibold mb-3">{t("filters.availability")}</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in-stock"
              checked={inStockOnly}
              onCheckedChange={setInStockOnly}
            />
            <label htmlFor="in-stock" className="text-sm">
              {t("filters.inStockOnly")}
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="on-sale" />
            <label htmlFor="on-sale" className="text-sm">
              {t("filters.onSale")}
            </label>
          </div>
        </div>
      </div>
    </>
  );
}

// Debounce hook for search input
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function ProductsPageClient({ initialData }: ProductsPageClientProps) {
  const t = useTranslations("products");
  const categories = getCategories(t);
  const sortOptions = getSortOptions(t);
  const [products, setProducts] = useState<Product[]>(initialData.data);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialData.pagination.page);
  const [totalPages, setTotalPages] = useState(initialData.pagination.pages);
  const [totalProducts, setTotalProducts] = useState(
    initialData.pagination.total,
  );

  const { addItem } = useCartStore();

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
        sortBy,
        sortOrder,
      });

      if (debouncedSearchQuery) params.set("search", debouncedSearchQuery);
      if (selectedCategory && selectedCategory !== "All")
        params.set("category", selectedCategory);
      if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString());
      if (priceRange[1] < 1000)
        params.set("maxPrice", priceRange[1].toString());
      if (inStockOnly) params.set("inStock", "true");

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch products");
      }

      setProducts(data.data);
      setTotalPages(data.pagination.pages);
      setTotalProducts(data.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    sortBy,
    sortOrder,
    selectedCategory,
    debouncedSearchQuery,
    priceRange,
    inStockOnly,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [
    currentPage,
    sortBy,
    sortOrder,
    selectedCategory,
    debouncedSearchQuery,
    priceRange[0],
    priceRange[1],
    inStockOnly,
  ]);

  const handleAddToCart = async (product: Product) => {
    try {
      // Add item to cart store (client-side cart management)
      addItem({
        product_id: product.id,
        product: {
          id: product.id,
          name: product.name || t("unknownProduct"),
          price: product.price,
          discount_price: product.discount_price || undefined,
          slug: product.slug || "",
          product_pictures: product.images.map((url) => ({
            picture: { url },
          })),
        },
        quantity: 1,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  return (
    <div className="container px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar - Hidden on mobile, visible on large screens */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-20 space-y-6">
            <FilterContent
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              inStockOnly={inStockOnly}
              setInStockOnly={setInStockOnly}
              categories={categories}
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">{t("title")}</h1>
              <p className="text-muted-foreground">{t("subtitle")}</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t("sortBy")} />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex border rounded-md">
                <Button variant="ghost" size="sm" className="rounded-r-none">
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-l-none border-l"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Loading/Error States */}
          {loading && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            </div>
          )}

          {error && (
            <ErrorDisplay
              error={t("somethingWentWrong")}
              onRetry={fetchProducts}
            />
          )}

          {!loading && !error && (
            <>
              {/* Results Summary */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  {t("showing")} {products.length} {t("of")} {totalProducts}{" "}
                  {t("products")}
                </p>

                {/* Mobile Filter Button */}
                <div className="lg:hidden">
                  <Sheet>
                    <SheetTrigger asChild={true}>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        {t("filtersText")}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80">
                      <SheetHeader>
                        <SheetTitle>{t("filtersText")}</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6 space-y-6">
                        <FilterContent
                          searchQuery={searchQuery}
                          setSearchQuery={setSearchQuery}
                          selectedCategory={selectedCategory}
                          setSelectedCategory={setSelectedCategory}
                          priceRange={priceRange}
                          setPriceRange={setPriceRange}
                          inStockOnly={inStockOnly}
                          setInStockOnly={setInStockOnly}
                          categories={categories}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

                {/* Desktop Filter Button - Hidden on mobile */}
                <div className="hidden lg:block">
                  <Button variant="outline" size="sm" disabled={true}>
                    <Filter className="h-4 w-4 mr-2" />
                    {t("filtersText")}
                  </Button>
                </div>
              </div>

              {/* Products Grid */}
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">{t("noProducts")}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <Card
                      key={product.id}
                      className="group overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <CardHeader className="p-0">
                        <Link
                          href={`/products/${product.slug}`}
                          className="block"
                        >
                          <div className="aspect-square relative overflow-hidden bg-muted">
                            {product.images[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name || t("unknownProduct")}
                                fill={true}
                                className="object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full bg-linear-to-br from-muted to-muted-foreground/10 flex items-center justify-center">
                                <div className="text-6xl opacity-20">📦</div>
                              </div>
                            )}
                            {!product.inStock && (
                              <Badge className="absolute top-2 left-2 bg-destructive">
                                {t("outOfStock")}
                              </Badge>
                            )}
                            {product.discount_price && (
                              <Badge className="absolute top-2 right-2 bg-green-600">
                                {t("sale")}
                              </Badge>
                            )}
                          </div>
                        </Link>
                      </CardHeader>

                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">
                            {product.category?.name || t("uncategorized")}
                          </p>
                          <Link href={`/products/${product.slug}`}>
                            <h3 className="font-semibold line-clamp-2 group-hover:style={{ color: 'rgb(59, 130, 246)' }} transition-colors cursor-pointer">
                              {product.name || t("unknownProduct")}
                            </h3>
                          </Link>

                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold">
                              $
                              {product.discount_price
                                ? Number(product.discount_price).toFixed(2)
                                : product.price.toFixed(2)}
                            </span>
                            {product.discount_price && (
                              <span className="text-sm text-muted-foreground line-through">
                                ${product.price.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="p-4 pt-0">
                        <Button
                          className="w-full"
                          disabled={!product.inStock}
                          onClick={() => handleAddToCart(product)}
                          data-testid="add-to-cart-btn"
                        >
                          {product.inStock ? t("addToCart") : t("outOfStock")}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      {t("previous")}
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      ),
                    )}

                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      {t("next")}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
