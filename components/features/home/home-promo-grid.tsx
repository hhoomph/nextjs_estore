import { useTranslations } from "next-intl";
import type { HomeHeroProduct } from "@/components/features/home/home-hero";
import { HomePromoCard } from "@/components/features/home/home-promo-card";

interface HomePromoGridProps {
  products: HomeHeroProduct[];
}

export function HomePromoGrid({ products }: HomePromoGridProps) {
  const t = useTranslations("Home");
  const featured = products.slice(0, 3);

  if (featured.length === 0) {
    return null;
  }

  const promoCopy = [
    { eyebrow: t("promo.hero.eyebrow"), title: t("promo.hero.title"), description: t("promo.hero.description") },
    { eyebrow: t("promo.fitness.eyebrow"), title: t("promo.fitness.title"), description: t("promo.fitness.description") },
    { eyebrow: t("promo.wearable.eyebrow"), title: t("promo.wearable.title"), description: t("promo.wearable.description") },
  ];

  return (
    <section className="bg-background py-10 sm:py-14">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          {featured.map((product, index) => (
            <HomePromoCard
              key={product.id}
              product={product}
              index={index}
              {...promoCopy[index] || promoCopy[promoCopy.length - 1]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
