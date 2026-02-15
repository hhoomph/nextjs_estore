/**
 * Blog Search Component
 *
 * Provides search functionality for blog posts.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function BlogSearch() {
  const t = useTranslations("Blog");
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      router.push(`/blog?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      // Clear search by going back to blog index
      router.push("/blog");
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    router.push("/blog");
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">{t("searchConfig.title")}</h3>

      <form onSubmit={handleSearch} className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder={t("searchConfig.placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
              onClick={clearSearch}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">{t("searchConfig.clear")}</span>
            </Button>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={!searchQuery.trim()}>
          <Search className="mr-2 h-4 w-4" />
          {t("searchConfig.button")}
        </Button>
      </form>

      {/* Search Tips */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p className="font-medium">{t("searchConfig.tips.title")}</p>
        <ul className="space-y-1 pl-4">
          <li>• {t("searchConfig.tips.title")}</li>
          <li>• {t("searchConfig.tips.excerpt")}</li>
          <li>• {t("searchConfig.tips.content")}</li>
          <li>• {t("searchConfig.tips.tags")}</li>
        </ul>
      </div>
    </div>
  );
}
