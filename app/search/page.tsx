/**
 * Module for page
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import Image from "next/image";
import { Suspense, useEffect, useState } from "react";

// Force dynamic rendering to avoid prerendering issues
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { Filter, Loader2, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/lib/stores/cart-store";

interface Product {
  id: string;
  name: string;
  desc: string;
  slug: string;
  price: number;
  discount_price?: number;
  quantity: number;
  category: { id: string; name: string };
  images: string[];
  inStock: boolean;
  createdAt: string;
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const { addItem } = useCartStore();

  // Popular search terms for suggestions
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

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/products?search=${encodeURIComponent(searchQuery)}&limit=20`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Search failed");
      }

      setResults(data.products || []);
      setSuggestions([]);

      // Update URL without triggering a page reload
      const newUrl = searchQuery
        ? `/search?q=${encodeURIComponent(searchQuery)}`
        : "/search";
      router.replace(newUrl, { scroll: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setSuggestions([]);
    router.replace("/search", { scroll: false });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      product_id: product.id,
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        discount_price: product.discount_price,
        slug: product.slug,
        product_pictures: product.images.map((url) => ({
          picture: { url },
        })),
      },
      quantity: 1,
    });
  };

  // Generate suggestions based on current query
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

  // Perform initial search if query exists
  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

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
            <span className="text-foreground">Search</span>
          </nav>
        </div>
      </div>

      <div className="container px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Search Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Search Products</h1>
            <p className="text-xl text-muted-foreground">
              Find exactly what you're looking for
            </p>
          </div>

          {/* Search Form */}
          <div className="mb-8">
            <form
              onSubmit={handleSubmit}
              className="relative max-w-2xl mx-auto"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for products, brands, categories&hellip;"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-12 pr-12 py-6 text-lg"
                  autoFocus={true}
                />
                {query && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-b-md shadow-lg z-10 max-w-2xl mx-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2"
                    >
                      <Search className="h-4 w-4 text-muted-foreground" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </form>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Searching...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => handleSearch(query)}>Try Again</Button>
            </div>
          )}

          {/* No Query State */}
          {!loading && !error && !query && results.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-4">Start Your Search</h2>
              <p className="text-muted-foreground mb-8">
                Enter a product name, category, or brand to find what you're
                looking for.
              </p>

              {/* Popular Searches */}
              <div>
                <h3 className="text-lg font-medium mb-4">Popular Searches</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {popularSearches.slice(0, 10).map((term) => (
                    <Button
                      key={term}
                      variant="outline"
                      onClick={() => handleSuggestionClick(term)}
                    >
                      {term}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Search Results */}
          {!loading && !error && query && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  Search Results for "{query}"
                </h2>
                <Badge variant="secondary">
                  {results.length} {results.length === 1 ? "result" : "results"}
                </Badge>
              </div>

              {results.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold mb-4">
                    No results found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    We couldn't find any products matching "{query}". Try
                    different keywords or check your spelling.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={handleClear}>Clear Search</Button>
                    <Button variant="outline" asChild={true}>
                      <Link href="/products">Browse All Products</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {results.map((product) => (
                    <Card
                      key={product.id}
                      className="group overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <CardHeader className="p-0">
                        <div className="aspect-square relative overflow-hidden bg-muted">
                          {product.images[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill={true}
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-linear-to-br from-muted to-muted-foreground/10 flex items-center justify-center">
                              <div className="text-6xl opacity-20">📦</div>
                            </div>
                          )}
                          {!product.inStock && (
                            <Badge className="absolute top-2 left-2 bg-destructive">
                              Out of Stock
                            </Badge>
                          )}
                          {product.discount_price && (
                            <Badge className="absolute top-2 right-2 bg-green-600">
                              Sale
                            </Badge>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">
                            {product.category?.name || "Uncategorized"}
                          </p>
                          <h3 className="font-semibold line-clamp-2 group-hover:style={{ color: 'rgb(59, 130, 246)' }} transition-colors">
                            <Link href={`/products/${product.slug}`}>
                              {product.name}
                            </Link>
                          </h3>

                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold">
                              $
                              {product.discount_price
                                ? product.discount_price.toFixed(2)
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
                        >
                          {product.inStock ? "Add to Cart" : "Out of Stock"}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
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
    <Suspense
      fallback={
        <div className="bg-background">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 style={{ borderBottomColor: 'rgb(59, 130, 246)' }}"></div>
            <span className="ml-2">Loading search...</span>
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
