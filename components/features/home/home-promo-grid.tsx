import type { HomeHeroProduct } from "@/components/features/home/home-hero";
import { HomePromoCard } from "@/components/features/home/home-promo-card";

interface HomePromoGridProps {
  products: HomeHeroProduct[];
}

const promoCopy = [
  {
    eyebrow: "Up to 30% off",
    title: "Today's hero deal",
    description: "A premium pick with fast delivery and a limited-time price drop.",
  },
  {
    eyebrow: "Workout at home",
    title: "Fitness essentials",
    description: "Build a comfortable home routine with reliable everyday gear.",
  },
  {
    eyebrow: "Up to 40% off",
    title: "Wearable tech",
    description: "Compact, useful, and ready for the next upgrade cycle.",
  },
];

export function HomePromoGrid({ products }: HomePromoGridProps) {
  const featured = products.slice(0, 3);

  if (featured.length === 0) {
    return null;
  }

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
