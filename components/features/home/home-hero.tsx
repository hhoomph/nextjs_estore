import { ArrowRight, Package, Sparkles, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductPrice } from "@/components/ui/product-price";

export type HomeHeroProduct = {
  id: string;
  name: string | null;
  slug: string | null;
  price: number;
  discount_price: number | null;
  category?: { name?: string | null } | null;
  images?: string[];
  inStock: boolean;
};

interface HomeHeroProps {
  badge: string;
  title: string;
  subtitle: string;
  shopNow: string;
  browseCategories: string;
  heroProduct?: HomeHeroProduct;
}

function createProductHref(slug: string | null | undefined) {
  return slug ? `/products/${slug}` : "/products";
}

export function HomeHero({
  badge,
  title,
  subtitle,
  shopNow,
  browseCategories,
  heroProduct,
}: HomeHeroProps) {
  const heroImage = heroProduct?.images?.[0];
  const productName = heroProduct?.name || "Featured Product";
  const categoryName = heroProduct?.category?.name || "Curated collection";

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-28 left-8 h-80 w-80 rounded-full bg-secondary/30 blur-3xl" />
      <div className="container relative mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-3xl">
            <Badge className="mb-5 border-primary/25 bg-background/85 px-4 py-2 text-sm font-bold text-primary shadow-sm backdrop-blur">
              <Sparkles className="mr-2 h-4 w-4" />
              {badge}
            </Badge>
            <h1 className="max-w-4xl text-balance text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-7xl">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              {subtitle}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild={true} size="lg" className="rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/25 hover:bg-primary/90">
                <Link href="/products">
                  {shopNow}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild={true} variant="outline" size="lg" className="rounded-full border-border bg-background/80 hover:bg-accent">
                <Link href="/categories">{browseCategories}</Link>
              </Button>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              <div className="rounded-2xl border border-border bg-background/70 p-4 text-center backdrop-blur">
                <p className="text-2xl font-black text-primary">30%</p>
                <p className="text-xs font-bold text-muted-foreground">Top deals</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/70 p-4 text-center backdrop-blur">
                <p className="text-2xl font-black text-primary">$80</p>
                <p className="text-xs font-bold text-muted-foreground">Free ship</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/70 p-4 text-center backdrop-blur">
                <p className="text-2xl font-black text-primary">24/7</p>
                <p className="text-xs font-bold text-muted-foreground">Support</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-[2.5rem] border border-border bg-background/70 p-4 shadow-2xl shadow-primary/10 backdrop-blur">
              <div className="overflow-hidden rounded-[2rem] bg-muted">
                {heroImage ? (
                  <Image
                    src={heroImage}
                    alt={productName}
                    width={900}
                    height={900}
                    className="aspect-square object-cover"
                    priority
                  />
                ) : (
                  <div className="flex aspect-square items-center justify-center bg-muted">
                    <Package className="h-28 w-28 text-muted-foreground/50" />
                  </div>
                )}
              </div>
              <div className="absolute left-6 top-6">
                <Badge className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-lg">
                  {heroProduct?.discount_price ? "Limited Offer" : "Featured"}
                </Badge>
              </div>
              <div className="absolute bottom-6 left-6 right-6 rounded-3xl border border-border bg-background/90 p-5 shadow-xl backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-primary">{categoryName}</p>
                    <h2 className="mt-1 text-xl font-black text-foreground">{productName}</h2>
                  </div>
                  {heroProduct?.images?.[0] && (
                    <Link href={createProductHref(heroProduct.slug)} className="shrink-0">
                      <Image
                        src={heroProduct.images[0]}
                        alt=""
                        width={56}
                        height={56}
                        className="rounded-2xl object-cover"
                      />
                    </Link>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  {heroProduct ? (
                    <ProductPrice
                      price={heroProduct.price}
                      discountPrice={heroProduct.discount_price}
                      amountClassName="text-2xl font-black"
                    />
                  ) : (
                    <span className="text-2xl font-black text-foreground">$0</span>
                  )}
                  <div className="flex items-center text-sm font-bold text-warning">
                    <Star className="mr-1 h-4 w-4 fill-current" />
                    4.9
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
