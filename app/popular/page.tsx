/**
 * Module for popular products page
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { Suspense } from "react";
import { LoadingPage } from "@/components/ui/loading";
import { getProducts } from "@/lib/actions/products";
import { PopularBreadcrumb } from "./breadcrumb";
import { ProductsPageClient } from "./client";

export const dynamic = "force-dynamic";

export default async function PopularProductsPage() {
  // Server component - fetch initial data sorted by wishlist count (popularity)
  let initialData;
  try {
    initialData = await getProducts({
      page: 1,
      limit: 12,
      sortBy: "wishlistCount",
      sortOrder: "desc",
    });
  } catch (error) {
    console.warn(
      "Failed to fetch popular products during build, will load client-side:",
      error,
    );
    initialData = {
      data: [],
      pagination: {
        page: 1,
        limit: 12,
        total: 0,
        pages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  }

  return (
    <div className="bg-background">
      {/* Breadcrumb - This needs to be a client component for translations */}
      <div className="border-b">
        <div className="container px-4 py-3">
          <PopularBreadcrumb />
        </div>
      </div>

      <Suspense fallback={<LoadingPage text="Loading popular products..." />}>
        <ProductsPageClient initialData={initialData} />
      </Suspense>
    </div>
  );
}