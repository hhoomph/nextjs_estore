/**
 * Homepage Component with Hero Section, Featured Products, and Categories
 *
 * Server Component with cookie-based internationalization support
 *
 * @author hh.oomph@gmail.com
 * @version 3.0.0
 * @since 2025-01-01
 */

import {
  ArrowRight,
  Package,
  Shield,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getProducts } from "@/lib/actions/products";

// Helper function to create URLs (no locale prefix needed)
function createUrl(path: string) {
  return path;
}

// Hero Section Component
async function HeroSection() {
  const t = await getTranslations("Home.hero");

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-cyan-600 to-teal-600 text-white">
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      </div>
      
      <div className="relative container mx-auto px-4 py-28 lg:py-40">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
            <span className="text-sm font-semibold text-white">✨ New Collection Available</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight text-balance">
            {t("title")}
          </h1>
          <p className="text-lg md:text-xl mb-10 text-cyan-50 leading-relaxed max-w-2xl">
            {t("subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={createUrl("/products")}
              className="group relative px-8 py-4 bg-white text-primary font-semibold rounded-lg hover:shadow-2xl transition-all duration-300 inline-flex items-center justify-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-teal-400 opacity-0 group-hover:opacity-20 transition-opacity" />
              <span className="relative">{t("shopNow")}</span>
              <ArrowRight className="ml-2 h-5 w-5 relative group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href={createUrl("/categories")}
              className="group px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-primary font-semibold rounded-lg transition-all duration-300 inline-flex items-center justify-center"
            >
              {t("browseCategories")}
            </Link>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background via-background/50 to-transparent" />
    </section>
  );
}

// Features Section Component
async function FeaturesSection() {
  const t = await getTranslations("Home.features");

  return (
    <section className="py-24 bg-gradient-to-b from-background to-neutral-100 dark:to-neutral-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">{t("title")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Truck, key: "freeShipping" },
            { icon: Shield, key: "securePayment" },
            { icon: Package, key: "qualityProducts" },
            { icon: Star, key: "support247" },
          ].map(({ icon: Icon, key }) => (
            <div key={key} className="group relative p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-accent text-white rounded-full mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold mb-3 text-foreground">
                  {t(`${key}.title`)}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t(`${key}.description`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Featured Products Component
async function FeaturedProducts() {
  const tHome = await getTranslations("Home");
  const tStatus = await getTranslations("Status Messages");

  let products: unknown[] = [];

  try {
    // Get featured products (latest 8 products)
    const result = await getProducts({
      page: 1,
      limit: 8,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

    if (result?.data && result.data.length > 0) {
      products = result.data.slice(0, 8);
    } else {
      // Return null gracefully if no products found
      return null;
    }
  } catch (error) {
    console.warn("[v0] Failed to load featured products:", error);
    // Return null instead of throwing to allow page to load
    return null;
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {tHome("featuredProducts.title")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {tHome("featuredProducts.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {products.map((product: any) => (
            <Card
              key={product.id}
              className="group overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-0">
                <Link
                  href={createUrl(`/products/${product.slug}`)}
                  className="block"
                >
                  <div className="aspect-square relative overflow-hidden bg-muted">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name || "Product"}
                        fill={true}
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-muted to-muted-foreground/10 flex items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground/40" />
                      </div>
                    )}
                    {!product.inStock && (
                      <Badge className="absolute top-2 left-2 bg-destructive">
                        {tStatus("outOfStock")}
                      </Badge>
                    )}
                    {product.discount_price && (
                      <Badge className="absolute top-2 right-2 bg-green-600">
                        {tHome("product.sale")}
                      </Badge>
                    )}
                  </div>
                </Link>

                <div className="p-4">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      {product.category?.name || "Uncategorized"}
                    </p>
                    <Link href={createUrl(`/products/${product.slug}`)}>
                      <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors cursor-pointer">
                        {product.name || "Unnamed Product"}
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

                    <Link
                      href={createUrl(`/products/${product.slug}`)}
                      className={`w-full px-4 py-2 rounded-md font-medium inline-flex items-center justify-center ${product.inStock ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"}`}
                    >
                      {product.inStock ? (
                        <>
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          View Details
                        </>
                      ) : (
                        "Out of Stock"
                      )}
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link
            href={createUrl("/products")}
            className="inline-flex items-center px-6 py-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md font-medium"
          >
            {tHome("featuredProducts.viewAll")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// Categories Preview Component
async function CategoriesPreview() {
  const t = await getTranslations("Home.categories");

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("title")}</h2>
          <p className="text-xl text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Link href={createUrl("/categories/electronics")}>
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  📱
                </div>
                <h3 className="font-semibold mb-2">{t("electronics.title")}</h3>
                <p className="text-sm text-muted-foreground">120+ Products</p>
              </CardContent>
            </Card>
          </Link>

          <Link href={createUrl("/categories/fashion")}>
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  👕
                </div>
                <h3 className="font-semibold mb-2">{t("fashion.title")}</h3>
                <p className="text-sm text-muted-foreground">80+ Products</p>
              </CardContent>
            </Card>
          </Link>

          <Link href={createUrl("/categories/home-garden")}>
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  🏠
                </div>
                <h3 className="font-semibold mb-2">{t("homeGarden.title")}</h3>
                <p className="text-sm text-muted-foreground">60+ Products</p>
              </CardContent>
            </Card>
          </Link>

          <Link href={createUrl("/categories/sports")}>
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  ⚽
                </div>
                <h3 className="font-semibold mb-2">Sports & Outdoors</h3>
                <p className="text-sm text-muted-foreground">40+ Products</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Loading Component
function LoadingSection() {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/3 mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-square bg-muted rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function HomePage() {
  // Get locale for translations (cookie-based)
  const locale = await getLocale();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Featured Products */}
      <Suspense fallback={<LoadingSection />}>
        <FeaturedProducts />
      </Suspense>

      {/* Categories Preview */}
      <CategoriesPreview />
    </div>
  );
}
