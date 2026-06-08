/**
 * Category Dropdown Component
 *
 * Client component that fetches categories with active products
 * and renders a hover dropdown menu for the navbar Categories link.
 *
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

interface CategoryItem {
  id: string;
  name: string;
  productCount: number;
}

export function CategoryDropdown() {
  const t = useTranslations("Navigation");
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        // Filter to only categories that have active products
        const activeCategories = (data.categories || []).filter(
          (cat: CategoryItem) => cat.productCount > 0,
        );
        setCategories(activeCategories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent hover:bg-transparent text-sm font-medium hover:text-blue-600 transition-colors px-0">
            {t("categories")}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {isLoading ? (
                <li className="col-span-full text-sm text-muted-foreground text-center py-4">
                  Loading categories...
                </li>
              ) : categories.length === 0 ? (
                <li className="col-span-full text-sm text-muted-foreground text-center py-4">
                  No categories available
                </li>
              ) : (
                categories.map((category) => (
                  <li key={category.id}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={`/categories/${category.id}`}
                        className={cn(
                          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
                          "focus:bg-accent focus:text-accent-foreground",
                        )}
                      >
                        <div className="text-sm font-medium leading-none">
                          {category.name}
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1">
                          {category.productCount}{" "}
                          {category.productCount === 1 ? "product" : "products"}
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                ))
              )}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}