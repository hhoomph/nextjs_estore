"use client";

import {
  AlertCircle,
  Filter,
  Grid3X3,
  List,
  Package,
  RefreshCw,
  Search,
  Star,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { type ProductCardProduct } from "@/components/features/products/product-card";
import { ProductGrid } from "@/components/features/products/product-grid";
import { SectionHeading } from "@/components/features/layout/section-heading";
import { useCartActions } from "@/lib/hooks/use-simplified-cart-sync";
import { useDebounce } from "@/lib/hooks/use-debounce";

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

interface CategoryOption {
  id: string;
  name: string;
  productCount: number;
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

const sortOptions = [
  { value: "createdAt", labelKey: "sortOptions.newest" as const },
  { value: "price", labelKey: "sortOptions.priceLowHigh" as const },
  { value: "price-high", labelKey: "sortOptions.priceHighLow" as const },
  { value: "name", labelKey: "sortOptions.name" as const },
];

function ProductSkeleton() {
  return (
    <Card className="overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-sm">
      <CardHeader className="p-0">
        <div className="aspect-square bg-muted animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        <div className="h-3 w-1/3 rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="h-11 rounded-full bg-muted" />
      </CardFooter>
    </Card>
  );
}

function ErrorDisplay({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  const t = useTranslations("products");

  return (
    <div className="rounded-[2rem] border border-border/60 bg-card p-10 text-center shadow-xl shadow-primary/10">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="h-7 w-7" />
      </div>
      <h3 className="mb-2 text-xl font-black text-foreground">{error}</h3>
      <p className="mb-6 text-muted-foreground">{t("somethingWentWrong")}</p>
      <Button onClick={onRetry} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
        <RefreshCw className="mr-2 h-4 w-4" />
        {t("tryAgain")}
      </Button>
    </div>
  );
}

function FilterContent({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  inStockOnly,
  setInStockOnly,
  categoryOptions,
}: {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  priceRange: number[];
  setPriceRange: (value: number[]) => void;
  inStockOnly: boolean;
  setInStockOnly: (value: boolean) => void;
  categoryOptions: Array<{ key: string; label: string }>;
}) {
  const t = useTranslations("products");

  return (
    <div className="space-y-7">
      <div>
        <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-muted-foreground">
          {t("filters.search")}
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("search")}
            className="rounded-full pl-10"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-muted-foreground">
          {t("filters.categories")}
        </h3>
        <div className="space-y-2">
          {categoryOptions.map((category) => (
            <button
              key={category.key}
              type="button"
              onClick={() => setSelectedCategory(category.key)}
              className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-bold transition ${
                selectedCategory === category.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            >
              <span>{category.label}</span>
              {selectedCategory === category.key && <span aria-hidden="true">•</span>}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-muted-foreground">
          {t("filters.priceRange")}
        </h3>
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={1000}
            step={10}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm font-bold text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-muted-foreground">
          {t("filters.rating")}
        </h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          {[4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-2 rounded-2xl px-3 py-2 hover:bg-primary/10">
              <Checkbox id={`rating-${rating}`} disabled />
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`h-3.5 w-3.5 ${
                      index < rating
                        ? "fill-warning text-warning"
                        : "text-muted-foreground/40"
                    }`}
                  />
                ))}
                <span>{t("filters.andUp")}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-muted-foreground">
          {t("filters.availability")}
        </h3>
        <div className="space-y-3">
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2 text-sm font-bold text-foreground hover:bg-primary/10">
            <Checkbox
              id="in-stock"
              checked={inStockOnly}
              onCheckedChange={(checked) => setInStockOnly(Boolean(checked))}
            />
            {t("filters.inStockOnly")}
          </label>
        </div>
      </div>
    </div>
  );
}

function toProductCard(product: Product): ProductCardProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    price: product.price,
    discount_price: product.discount_price,
    images: product.images,
    inStock: product.inStock,
  };
}

export function ProductsPageClient({ initialData }: ProductsPageClientProps) {
  const t = useTranslations("products");
  const [availableCategories, setAvailableCategories] = useState<CategoryOption[]>([]);
  const [products, setProducts] = useState<Product[]>(initialData.data);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder] = useState("desc");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialData.pagination.page);
  const [totalPages, setTotalPages] = useState(initialData.pagination.pages);
  const [totalProducts, setTotalProducts] = useState(initialData.pagination.total);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { addToCart } = useCartActions();

  const categoryOptions = useMemo(
    () => [
      { key: "all", label: t("categories.All") },
      ...availableCategories.map((category) => ({
        key: category.id,
        label: category.name,
      })),
    ],
    [availableCategories, t],
  );

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

      if (selectedCategory !== "all") params.set("category", selectedCategory);
      if (debouncedSearchQuery) params.set("search", debouncedSearchQuery);
      if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString());
      if (priceRange[1] < 1000) params.set("maxPrice", priceRange[1].toString());
      if (inStockOnly) params.set("inStock", "true");

      const response = await fetch(`/api/products?${params}`);
      const data: ProductResult = await response.json();

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      setProducts(data.data);
      setTotalPages(data.pagination.pages);
      setTotalProducts(data.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    debouncedSearchQuery,
    inStockOnly,
    priceRange,
    selectedCategory,
    sortBy,
    sortOrder,
    t,
  ]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories", {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data = await response.json();
        setAvailableCategories(data.categories || []);
      } catch (err) {
        if (
          err instanceof Error &&
          (err.name === "AbortError" || err.message === "Failed to fetch")
        ) {
          return;
        }
      }
    };

    void fetchCategories();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, inStockOnly, priceRange, selectedCategory, sortBy]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const handleAddToCart = async (product: ProductCardProduct) => {
    try {
      const currentPrice = product.discount_price ?? product.price;

      await addToCart({
        product_id: product.id,
        product: {
          id: product.id,
          name: product.name || t("unknownProduct"),
          price: currentPrice,
          discount_price: currentPrice,
          slug: product.slug || "",
          product_pictures: (product.images ?? []).map((url) => ({
            picture: { url },
          })),
        },
        quantity: 1,
      });
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const gridClass =
    viewMode === "grid"
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      : "grid-cols-1";

  return (
    <div className="container px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-[2rem] border border-border/60 bg-card/95 p-5 shadow-xl shadow-primary/10 backdrop-blur">
            <div className="mb-6 flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              <h2 className="font-black text-foreground">{t("filtersText")}</h2>
            </div>
            <FilterContent
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              inStockOnly={inStockOnly}
              setInStockOnly={setInStockOnly}
              categoryOptions={categoryOptions}
            />
          </div>
        </aside>

        <main>
          <div className="mb-6 flex flex-col justify-between gap-4 rounded-[2rem] border border-border/60 bg-card/95 p-5 shadow-xl shadow-primary/10 md:flex-row md:items-end">
            <SectionHeading
              eyebrow={t("title")}
              title={t("subtitle")}
              align="left"
              className="max-w-none"
            />

            <div className="flex flex-wrap items-center gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 rounded-full">
                  <SelectValue placeholder={t("sortBy")} />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex rounded-full border border-border bg-background p-1">
                <Button
                  type="button"
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  aria-pressed={viewMode === "grid"}
                  onClick={() => setViewMode("grid")}
                  className={
                    viewMode === "grid"
                      ? "rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                      : "rounded-full text-muted-foreground"
                  }
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  aria-pressed={viewMode === "list"}
                  onClick={() => setViewMode("list")}
                  className={
                    viewMode === "list"
                      ? "rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                      : "rounded-full text-muted-foreground"
                  }
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {loading && (
            <div className={`grid gap-5 ${gridClass}`}>
              {Array.from({ length: 8 }).map((_, index) => (
                <ProductSkeleton key={index} />
              ))}
            </div>
          )}

          {error && (
            <ErrorDisplay error={error} onRetry={fetchProducts} />
          )}

          {!loading && !error && (
            <>
              <div className="mb-6 flex items-center justify-between gap-4">
                <p className="text-sm font-bold text-muted-foreground">
                  {t("showing")} {products.length} {t("of")} {totalProducts}{" "}
                  {t("products")}
                </p>

                <div className="lg:hidden">
                  <Sheet>
                    <SheetTrigger asChild={true}>
                      <Button variant="outline" size="sm" className="rounded-full">
                        <Filter className="mr-2 h-4 w-4" />
                        {t("filtersText")}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[min(88vw,22rem)] overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>{t("filtersText")}</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FilterContent
                          searchQuery={searchQuery}
                          setSearchQuery={setSearchQuery}
                          selectedCategory={selectedCategory}
                          setSelectedCategory={setSelectedCategory}
                          priceRange={priceRange}
                          setPriceRange={setPriceRange}
                          inStockOnly={inStockOnly}
                          setInStockOnly={setInStockOnly}
                          categoryOptions={categoryOptions}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>

              {products.length === 0 ? (
                <div className="rounded-[2rem] border border-border/60 bg-card p-10 text-center shadow-xl shadow-primary/10">
                  <Package className="mx-auto mb-4 h-14 w-14 text-muted-foreground" />
                  <h3 className="text-xl font-black text-foreground">{t("noProducts")}</h3>
                </div>
              ) : (
                <ProductGrid
                  products={products.map(toProductCard)}
                  onAddToCart={handleAddToCart}
                  unknownProductLabel={t("unknownProduct")}
                  outOfStockLabel={t("outOfStock")}
                  saleLabel={t("sale")}
                  addToCartLabel={t("addToCart")}
                  uncategorizedLabel={t("uncategorized")}
                  addTestId="add-to-cart-btn"
                />
              )}

              {totalPages > 1 && (
                <div className="mt-12 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="rounded-full"
                  >
                    {t("previous")}
                  </Button>

                  {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => setCurrentPage(page)}
                        className={
                          currentPage === page
                            ? "rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                            : "rounded-full"
                        }
                      >
                        {page}
                      </Button>
                    ),
                  )}

                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="rounded-full"
                  >
                    {t("next")}
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
