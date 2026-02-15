"use client";

/**
 * Module for AdvancedSearch
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import {
  Clock,
  DollarSign,
  Filter,
  Search,
  Star,
  TrendingUp,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  convertPersianToEnglish,
  formatIranianCurrency,
} from "@/lib/utils/persian";
import { SafeLocalStorage } from "@/lib/utils/storage-ssr";

interface SearchFilters {
  query: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  onSale?: boolean;
  freeShipping?: boolean;
  brand?: string;
  sortBy?:
    | "relevance"
    | "price_asc"
    | "price_desc"
    | "rating"
    | "newest"
    | "popular";
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: "product" | "category" | "brand";
  count?: number;
}

interface TrendingSearch {
  query: string;
  count: number;
  trend: "up" | "down" | "stable";
}

interface AdvancedSearchProps {
  onSearch?: (filters: SearchFilters) => void;
  placeholder?: string;
  showFilters?: boolean;
  compact?: boolean;
}

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
];

const PRICE_RANGES = [
  { label: "Under 100,000 تومان", min: 0, max: 100000 },
  { label: "100,000 - 500,000 تومان", min: 100000, max: 500000 },
  { label: "500,000 - 1,000,000 تومان", min: 500000, max: 1000000 },
  { label: "1,000,000 - 5,000,000 تومان", min: 1000000, max: 5000000 },
  { label: "Over 5,000,000 تومان", min: 5000000, max: Infinity },
];

export function AdvancedSearch({
  onSearch,
  placeholder = "Search for products...",
  showFilters = true,
  compact = false,
}: AdvancedSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search state
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get("q") || "",
    category: searchParams.get("category") || undefined,
    minPrice: searchParams.get("minPrice")
      ? parseInt(searchParams.get("minPrice")!)
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? parseInt(searchParams.get("maxPrice")!)
      : undefined,
    rating: searchParams.get("rating")
      ? parseInt(searchParams.get("rating")!)
      : undefined,
    inStock: searchParams.get("inStock") === "true",
    onSale: searchParams.get("onSale") === "true",
    freeShipping: searchParams.get("freeShipping") === "true",
    brand: searchParams.get("brand") || undefined,
    sortBy:
      (searchParams.get("sortBy") as SearchFilters["sortBy"]) || "relevance",
  });

  // UI state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<TrendingSearch[]>(
    [],
  );
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice || 0,
    filters.maxPrice || 10000000,
  ]);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = SafeLocalStorage.getItem("recentSearches");
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to parse recent searches:", error);
    }
  }, []);

  // Enhanced search suggestions with caching and debouncing
  const searchCache = useRef<Map<string, SearchSuggestion[]>>(new Map());
  const abortController = useRef<AbortController | null>(null);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    // Check cache first
    const cacheKey = searchQuery.toLowerCase();
    if (searchCache.current.has(cacheKey)) {
      setSuggestions(searchCache.current.get(cacheKey)!);
      return;
    }

    // Cancel previous request
    if (abortController.current) {
      abortController.current.abort();
    }

    // Create new abort controller
    abortController.current = new AbortController();

    try {
      const response = await fetch(
        `/api/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=8&includeAnalytics=true`,
        {
          signal: abortController.current.signal,
          headers: {
            "Cache-Control": "max-age=300", // Cache for 5 minutes
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        const suggestions = data.suggestions || [];

        // Cache the results
        searchCache.current.set(cacheKey, suggestions);

        // Limit cache size
        if (searchCache.current.size > 50) {
          const firstKey = searchCache.current.keys().next().value;
          if (firstKey) {
            searchCache.current.delete(firstKey);
          }
        }

        setSuggestions(suggestions);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Failed to fetch search suggestions:", error);
        setSuggestions([]);
      }
    }
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, fetchSuggestions]);

  // Fetch trending searches
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await fetch("/api/search/trending");
        if (response.ok) {
          const data = await response.json();
          setTrendingSearches(data.trending || []);
        }
      } catch (error) {
        console.error("Failed to fetch trending searches:", error);
      }
    };

    fetchTrending();
  }, []);

  // Handle search submission
  const handleSearch = useCallback(() => {
    const searchFilters: SearchFilters = {
      ...filters,
      query: convertPersianToEnglish(query),
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < 10000000 ? priceRange[1] : undefined,
    };

    // Save to recent searches
    if (query.trim()) {
      const updated = [
        query,
        ...recentSearches.filter((s) => s !== query),
      ].slice(0, 10);
      setRecentSearches(updated);
      SafeLocalStorage.setItem("recentSearches", JSON.stringify(updated));
    }

    // Update URL
    const params = new URLSearchParams();
    Object.entries(searchFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
    });

    const url = params.toString()
      ? `/search?${params.toString()}`
      : "/products";
    router.push(url);

    // Call onSearch callback
    onSearch?.(searchFilters);

    setShowSuggestions(false);
  }, [query, filters, priceRange, recentSearches, router, onSearch]);

  // Handle filter changes
  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      query: "",
      sortBy: "relevance",
    });
    setPriceRange([0, 10000000]);
    setQuery("");
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    handleSearch();
  };

  // Handle recent search click
  const handleRecentSearchClick = (search: string) => {
    setQuery(search);
    setShowSuggestions(false);
    handleSearch();
  };

  const activeFiltersCount = Object.values(filters).filter(
    (value) =>
      value !== undefined && value !== null && value !== "" && value !== false,
  ).length;

  if (compact) {
    return (
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            className="pl-10 pr-4"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              className="pl-10 pr-4"
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>

          {showFilters && (
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          )}
        </div>

        {/* Search Suggestions Dropdown */}
        {showSuggestions &&
          (suggestions.length > 0 || recentSearches.length > 0) && (
            <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto">
              <CardContent className="p-0">
                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="p-2">
                    <div className="text-xs font-medium text-muted-foreground mb-2">
                      Suggestions
                    </div>
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-3 py-2 hover:bg-accent rounded-md flex items-center justify-between"
                      >
                        <span>{suggestion.text}</span>
                        {suggestion.count && (
                          <Badge variant="outline" className="text-xs">
                            {suggestion.count}
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <>
                    {suggestions.length > 0 && <Separator />}
                    <div className="p-2">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-medium text-muted-foreground">
                          Recent Searches
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setRecentSearches([]);
                            SafeLocalStorage.removeItem("recentSearches");
                          }}
                          className="text-xs h-6"
                        >
                          Clear
                        </Button>
                      </div>
                      {recentSearches.slice(0, 5).map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleRecentSearchClick(search)}
                          className="w-full text-left px-3 py-2 hover:bg-accent rounded-md flex items-center gap-2"
                        >
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>{search}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
      </div>

      {/* Advanced Filters */}
      {showFilters && showAdvancedFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Advanced Filters
              </span>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Price Range */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Price Range
              </Label>
              <div className="px-3">
                <Slider
                  value={priceRange}
                  onValueChange={(value) => setPriceRange([value[0], value[1]])}
                  max={10000000}
                  min={0}
                  step={50000}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>{formatIranianCurrency(priceRange[0])}</span>
                  <span>
                    {priceRange[1] >= 10000000
                      ? "Unlimited"
                      : formatIranianCurrency(priceRange[1])}
                  </span>
                </div>
              </div>

              {/* Quick Price Ranges */}
              <div className="grid grid-cols-2 gap-2">
                {PRICE_RANGES.map((range) => (
                  <Button
                    key={range.label}
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPriceRange([
                        range.min,
                        range.max === Infinity ? 10000000 : range.max,
                      ])
                    }
                    className="text-xs"
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Rating Filter */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Minimum Rating
              </Label>
              <Select
                value={filters.rating?.toString() || ""}
                onValueChange={(value) =>
                  updateFilter("rating", value ? parseInt(value) : undefined)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any rating</SelectItem>
                  <SelectItem value="4">4+ stars</SelectItem>
                  <SelectItem value="3">3+ stars</SelectItem>
                  <SelectItem value="2">2+ stars</SelectItem>
                  <SelectItem value="1">1+ star</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Additional Filters */}
            <div className="space-y-3">
              <Label>Additional Filters</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inStock"
                    checked={filters.inStock || false}
                    onCheckedChange={(checked) =>
                      updateFilter("inStock", checked)
                    }
                  />
                  <Label htmlFor="inStock" className="text-sm">
                    In Stock Only
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="onSale"
                    checked={filters.onSale || false}
                    onCheckedChange={(checked) =>
                      updateFilter("onSale", checked)
                    }
                  />
                  <Label htmlFor="onSale" className="text-sm">
                    On Sale
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="freeShipping"
                    checked={filters.freeShipping || false}
                    onCheckedChange={(checked) =>
                      updateFilter("freeShipping", checked)
                    }
                  />
                  <Label htmlFor="freeShipping" className="text-sm">
                    Free Shipping
                  </Label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Sort Options */}
            <div className="space-y-3">
              <Label>Sort By</Label>
              <Select
                value={filters.sortBy || "relevance"}
                onValueChange={(value) => updateFilter("sortBy", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trending Searches */}
      {trendingSearches.length > 0 && !query && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Trending Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.slice(0, 8).map((trend) => (
                <Button
                  key={trend.query}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQuery(trend.query);
                    handleSearch();
                  }}
                  className="flex items-center gap-1"
                >
                  <span>{trend.query}</span>
                  <Badge variant="secondary" className="text-xs">
                    {trend.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
