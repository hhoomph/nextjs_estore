/**
 * Module for page
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { Suspense } from "react";
import { LoadingPage } from "@/components/ui/loading";
import { getProducts } from "@/lib/actions/products";
import { ProductsBreadcrumb } from "./breadcrumb";
import { ProductsPageClient } from "./client";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  // Server component - fetch initial data
  let initialData;
  try {
    initialData = await getProducts({
      page: 1,
      limit: 12,
      sortBy: "created_at",
      sortOrder: "desc",
    });
  } catch (error) {
    console.warn(
      "Failed to fetch products during build, will load client-side:",
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
          <ProductsBreadcrumb />
        </div>
      </div>

      <Suspense fallback={<LoadingPage text="Loading products..." />}>
        <ProductsPageClient initialData={initialData} />
      </Suspense>
    </div>
  );
}
