"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductGrid } from "@/components/features/products/product-grid";
import { SectionHeading } from "@/components/features/layout/section-heading";
import { type ProductCardProduct } from "@/components/features/products/product-card";
import { Input } from "@/components/ui/input";
import { useCartActions } from "@/lib/hooks/use-simplified-cart-sync";

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
  createdAt: string;
}

const popularSearches = [
  "laptop",
  "smartphone",
  "headphones",
  "watch",
  "camera",
  "tablet",
  "gaming",
  "wireless",
  "bluetooth",
  "charger",
];

function toProductCard(product: Product): ProductCardProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    price: product.price,
    discount_price: product.discount_price,
    images: product.images,
    inStock: product.quantity > 0,
  };
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("products");
  const initialQuery = searchParams.get("q") || "";
  const searchAbortRef = useRef<AbortController | null>(null);

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const { addToCart } = useCartActions();

  const handleSearch = useCallback(
    async (searchQuery: string) => {
      searchAbortRef.current?.abort();
      searchAbortRef.current = new AbortController();

      if (!searchQuery.trim()) {
        setResults([]);
        setSuggestions([]);
        router.replace("/search", { scroll: false });
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/products?search=${encodeURIComponent(searchQuery)}&limit=20`,
          { signal: searchAbortRef.current.signal },
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Search failed");
        }

        const products = Array.isArray(data.data) ? data.data : [];
        setResults(products);
        setSuggestions([]);

        router.replace(`/search?q=${encodeURIComponent(searchQuery)}`, {
          scroll: false,
        });
      } catch (err) {
        if (
          err instanceof Error &&
          (err.name === "AbortError" || err.message === "Failed to fetch")
        ) {
          return;
        }
        setError(err instanceof Error ? err.message : "Search failed");
        setResults([]);
      } finally {
        if (!searchAbortRef.current?.signal.aborted) {
          setLoading(false);
        }
      }
    },
    [router],
  );

  useEffect(() => {
    if (initialQuery) {
      void handleSearch(initialQuery);
    }
  }, [handleSearch, initialQuery]);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = popularSearches.filter(
        (term) =>
          term.toLowerCase().includes(query.toLowerCase()) &&
          term.toLowerCase() !== query.toLowerCase(),
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void handleSearch(query);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setSuggestions([]);
    router.replace("/search", { scroll: false });
  };

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setQuery(suggestion);
    void handleSearch(suggestion);
  }, [handleSearch]);

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
      console.error("Error adding search result to cart:", err);
    }
  };

  const suggestionNodes = useMemo(
    () =>
      suggestions.map((suggestion, index) => (
        <button
          key={`${suggestion}-${index}`}
          type="button"
          onClick={() => handleSuggestionClick(suggestion)}
          className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left font-semibold text-foreground transition hover:bg-primary/10 hover:text-primary"
        >
          <Search className="h-4 w-4 text-primary" />
          {suggestion}
        </button>
      )),
    [handleSuggestionClick, suggestions],
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/80 backdrop-blur">
        <div className="container px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/" className="font-semibold text-foreground">
              Home
            </Link>
            <span>/</span>
            <span className="font-bold text-foreground">Search</span>
          </nav>
        </div>
      </div>

      <div className="container px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-4xl">
          <SectionHeading
            eyebrow="Product Search"
            title="Find exactly what you need"
            description="Search products, brands, categories, and descriptions."
            className="mb-8"
          />

          <div className="mb-10">
            <form onSubmit={handleSubmit} className="relative mx-auto max-w-2xl">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t("search")}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="rounded-full pl-14 pr-14 py-6 text-lg"
                  autoFocus={true}
                />
                {query && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear search</span>
                  </Button>
                )}
              </div>

              {suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 mx-auto max-w-2xl overflow-hidden rounded-b-3xl border border-border bg-background/98 backdrop-blur-xl shadow-2xl shadow-primary/10">
                  {suggestionNodes}
                </div>
              )}
            </form>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="mr-3 h-8 w-8 animate-spin text-primary" />
              <span className="font-semibold text-muted-foreground">Searching...</span>
            </div>
          )}

          {error && (
            <div className="rounded-[2rem] border border-border/60 bg-card p-10 text-center shadow-xl shadow-primary/10">
              <p className="mb-5 font-bold text-destructive">{error}</p>
              <Button onClick={() => void handleSearch(query)} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                Try Again
              </Button>
            </div>
          )}

          {!loading && !error && !query && results.length === 0 && (
            <div className="rounded-[2.5rem] border border-border/60 bg-card p-10 text-center shadow-xl shadow-primary/10">
              <Search className="mx-auto mb-5 h-16 w-16 text-primary/60" />
              <h2 className="mb-3 text-2xl font-black text-foreground">
                Start Your Search
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
                Enter a product name, category, or brand to find what you are
                looking for.
              </p>

              <div>
                <h3 className="mb-4 text-lg font-black text-foreground">
                  Popular Searches
                </h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {popularSearches.slice(0, 10).map((term) => (
                    <Button
                      key={term}
                      variant="outline"
                      onClick={() => handleSuggestionClick(term)}
                      className="rounded-full"
                    >
                      {term}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!loading && !error && query && (
            <div>
              <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="text-2xl font-black text-foreground">
                  Search Results for "{query}"
                </h2>
                <Badge className="rounded-full bg-primary/10 text-primary">
                  {results.length} {results.length === 1 ? "result" : "results"}
                </Badge>
              </div>

              {results.length === 0 ? (
                <div className="rounded-[2rem] border border-border/60 bg-card p-10 text-center shadow-xl shadow-primary/10">
                  <Search className="mx-auto mb-4 h-14 w-14 text-muted-foreground" />
                  <h3 className="mb-2 text-2xl font-black text-foreground">
                    No results found
                  </h3>
                  <p className="mb-6 text-muted-foreground">
                    We could not find any products matching "{query}". Try
                    different keywords or check your spelling.
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button onClick={handleClear} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                      Clear Search
                    </Button>
                    <Button variant="outline" asChild={true} className="rounded-full">
                      <Link href="/products">Browse All Products</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <ProductGrid
                  products={results.map(toProductCard)}
                  onAddToCart={handleAddToCart}
                  unknownProductLabel={t("unknownProduct")}
                  outOfStockLabel={t("outOfStock")}
                  saleLabel={t("sale")}
                  addToCartLabel={t("addToCart")}
                  uncategorizedLabel={t("uncategorized")}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <SearchContent />
  );
}
