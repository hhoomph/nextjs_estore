import {
  Headphones,
  Home,
  Laptop,
  Shirt,
  Smartphone,
  Trophy,
  Tv,
  Watch,
} from "lucide-react";
import Link from "next/link";

interface HomeCategory {
  id: string;
  name?: string | null;
  productCount: number;
}

const categoryIcons = [
  Laptop,
  Watch,
  Smartphone,
  Trophy,
  Home,
  Tv,
  Shirt,
  Headphones,
];

function categoryHref(category: HomeCategory) {
  const slug =
    category.name
      ?.toLowerCase()
      .replace(/\s+/g, "-") || category.id;

  return `/categories/${encodeURIComponent(slug)}`;
}

interface HomeCategoryGridProps {
  title: string;
  description: string;
  categories: HomeCategory[];
}

export function HomeCategoryGrid({
  title,
  description,
  categories,
}: HomeCategoryGridProps) {
  const visibleCategories = categories.length
    ? categories.slice(0, 8)
    : [
        { id: "electronics", name: "Electronics", productCount: 120 },
        { id: "fashion", name: "Fashion", productCount: 80 },
        { id: "home-garden", name: "Home & Garden", productCount: 60 },
        { id: "sports", name: "Sports & Outdoors", productCount: 40 },
      ];

  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 inline-flex rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-bold text-primary shadow-sm">
              Browse by Category
            </p>
            <h2 className="text-balance text-3xl font-black tracking-tight text-foreground sm:text-5xl">
              {title}
            </h2>
            {description && (
              <p className="mt-4 text-lg leading-8 text-muted-foreground">{description}</p>
            )}
          </div>
          <Link
            href="/categories"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/25 bg-background px-5 py-3 text-sm font-black text-primary transition hover:bg-primary/10"
          >
            View all categories
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {visibleCategories.map((category, index) => {
            const Icon = categoryIcons[index % categoryIcons.length];
            return (
              <Link
                key={category.id}
                href={categoryHref(category)}
                className="group overflow-hidden rounded-[2rem] border border-border/60 bg-card p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition duration-300 group-hover:scale-105">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-black text-foreground">{category.name}</h3>
                <p className="mt-2 text-sm font-bold text-muted-foreground">
                  {category.productCount} products
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
