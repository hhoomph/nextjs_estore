import { Suspense } from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingPage } from "@/components/ui/loading";
import { ProductPrice } from "@/components/ui/product-price";
import { SectionHeading } from "@/components/features/layout/section-heading";
import { HomeHero, type HomeHeroProduct } from "@/components/features/home/home-hero";
import { HomePromoGrid } from "@/components/features/home/home-promo-grid";
import { HomeCategoryGrid } from "@/components/features/home/home-category-grid";
import { HomeBenefitsSection } from "@/components/features/home/home-benefits-section";
import { HomeTestimonialsSection } from "@/components/features/home/home-testimonials-section";
import { HomeNewsletterSection } from "@/components/features/home/home-newsletter-section";
import { HomeProductGrid } from "@/components/features/home/home-product-grid";
import { getProducts } from "@/lib/actions/products";
import { getCategories } from "@/lib/actions/categories";

type ProductListItem = {
  id: string;
  name: string | null;
  slug: string | null;
  price: number;
  discount_price: number | null;
  category?: { name?: string | null } | null;
  images?: string[];
  inStock: boolean;
};

function toHomeProduct(product: ProductListItem): HomeHeroProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    discount_price: product.discount_price,
    category: product.category,
    images: product.images,
    inStock: product.inStock,
  };
}

async function fetchHomepageData(): Promise<{
  featuredProducts: ProductListItem[];
  bestSellers: ProductListItem[];
  categories: { id: string; name: string | null; productCount: number }[];
}> {
  try {
    // Fetch all homepage data in parallel
    const [featuredResult, bestSellersResult, categoriesResult] = await Promise.all([
      getProducts({
        page: 1,
        limit: 8,
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
      getProducts({
        page: 1,
        limit: 8,
        sortBy: "wishlistCount",
        sortOrder: "desc",
      }),
      getCategories({ limit: 8, sortBy: "name" }),
    ]);

    return {
      featuredProducts: featuredResult.data.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        discount_price: product.discount_price,
        category: product.category,
        images: product.images,
        inStock: product.inStock,
      })),
      bestSellers: bestSellersResult.data.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        discount_price: product.discount_price,
        category: product.category,
        images: product.images,
        inStock: product.inStock,
      })),
      categories: categoriesResult.data,
    };
  } catch (error) {
    console.error("Failed to load homepage data:", error);
    // Return empty data on error
    return {
      featuredProducts: [],
      bestSellers: [],
      categories: [],
    };
  }
}

function LoadingSection() {
  return (
    <div className="bg-muted py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-[2rem] border border-border bg-background p-4">
              <div className="aspect-square rounded-[1.5rem] bg-muted" />
              <div className="mt-4 h-4 w-3/4 rounded bg-muted" />
              <div className="mt-2 h-4 w-1/2 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

async function HeroSection({ products }: { products: ProductListItem[] }) {
  const t = await getTranslations("Home.hero");

  return <HomeHero badge={t("badge")} title={t("title")} subtitle={t("subtitle")} shopNow={t("shopNow")} browseCategories={t("browseCategories")} heroProduct={products[0]} />;
}

async function PromoSection({ products }: { products: ProductListItem[] }) {
  return <HomePromoGrid products={products.map(toHomeProduct)} />;
}

async function BenefitsSection() {
  const t = await getTranslations("Home.features");

  return (
    <HomeBenefitsSection
      title={t("title")}
      subtitle={t("subtitle")}
      freeShipping={{
        title: t("freeShipping.title"),
        description: t("freeShipping.description"),
      }}
      securePayment={{
        title: t("securePayment.title"),
        description: t("securePayment.description"),
      }}
      qualityProducts={{
        title: t("qualityProducts.title"),
        description: t("qualityProducts.description"),
      }}
      support247={{
        title: t("support247.title"),
        description: t("support247.description"),
      }}
    />
  );
}

async function FeaturedProductsSection({ products }: { products: ProductListItem[] }) {
  const tHome = await getTranslations("Home");

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="bg-muted py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="New Arrivals"
            title={tHome("featuredProducts.title")}
            description={tHome("featuredProducts.subtitle")}
            align="left"
            className="max-w-none"
          />
          <Button asChild={true} variant="outline" className="w-fit rounded-full">
            <Link href="/products">{tHome("featuredProducts.viewAll")}</Link>
          </Button>
        </div>

        <HomeProductGrid
          products={products.map(toHomeProduct)}
          unknownProductLabel="Unknown Product"
          outOfStockLabel="Out of Stock"
          saleLabel={tHome("product.sale")}
          addToCartLabel="Add to Cart"
          uncategorizedLabel="Uncategorized"
        />
      </div>
    </section>
  );
}

async function BestSellersSection({ products }: { products: ProductListItem[] }) {
  const tHome = await getTranslations("Home");

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="Best Selling Products"
            title="These top picks are flying off the shelves"
            description="Find out what everyone is loving right now."
            align="left"
            className="max-w-none"
          />
          <Button asChild={true} variant="outline" className="w-fit rounded-full">
            <Link href="/popular">View all best sellers</Link>
          </Button>
        </div>

        <HomeProductGrid
          products={products.map(toHomeProduct)}
          unknownProductLabel="Unknown Product"
          outOfStockLabel="Out of Stock"
          saleLabel={tHome("product.sale")}
          addToCartLabel="Add to Cart"
          uncategorizedLabel="Uncategorized"
        />
      </div>
    </section>
  );
}

async function CategoriesSection({ categories }: { categories: { id: string; name: string | null; productCount: number }[] }) {
  const t = await getTranslations("Home.categories");

  return (
    <HomeCategoryGrid
      title={t("title")}
      description={t("subtitle")}
      categories={categories}
    />
  );
}

export default async function HomePage() {
  const data = await fetchHomepageData();

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<LoadingPage text="Loading hero..." />}>
        <HeroSection products={data.featuredProducts} />
      </Suspense>
      <Suspense fallback={<LoadingSection />}>
        <PromoSection products={data.featuredProducts} />
      </Suspense>
      <Suspense fallback={<LoadingSection />}>
        <BenefitsSection />
      </Suspense>
      <Suspense fallback={<LoadingSection />}>
        <FeaturedProductsSection products={data.featuredProducts} />
      </Suspense>
      <Suspense fallback={<LoadingSection />}>
        <BestSellersSection products={data.bestSellers} />
      </Suspense>
      <Suspense fallback={<LoadingSection />}>
        <CategoriesSection categories={data.categories} />
      </Suspense>
      <HomeTestimonialsSection />
      <HomeNewsletterSection />
    </div>
  );
}
