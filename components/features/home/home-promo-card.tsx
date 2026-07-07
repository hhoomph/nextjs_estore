import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { HomeHeroProduct } from "@/components/features/home/home-hero";
import { PLACEHOLDER_IMAGE } from "@/lib/utils/image-utils";

interface HomePromoCardProps {
  product: HomeHeroProduct;
  eyebrow: string;
  title: string;
  description: string;
  index: number;
}

function createProductHref(product: HomeHeroProduct) {
  return product.slug ? `/products/${product.slug}` : "/products";
}

export function HomePromoCard({
  product,
  eyebrow,
  title,
  description,
  index,
}: HomePromoCardProps) {
  return (
    <article className="group overflow-hidden rounded-[2rem] border border-border/60 bg-card/80 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
      <div className="relative overflow-hidden bg-muted">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name || title}
            width={index === 0 ? 900 : 640}
            height={index === 0 ? 720 : 520}
            className={`object-cover transition duration-700 group-hover:scale-105 ${index === 0 ? "aspect-[4/3]" : "aspect-square"}`}
          />
        ) : (
          <div className="relative aspect-square bg-muted">
            <Image
              src={PLACEHOLDER_IMAGE}
              alt={product.name || title}
              fill
              className="object-cover opacity-50"
            />
          </div>
        )}
        <div className="absolute left-4 top-4 rounded-full bg-primary px-4 py-2 text-xs font-black uppercase tracking-widest text-primary-foreground shadow-lg">
          {eyebrow}
        </div>
      </div>
      <div className="space-y-4 p-6">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-primary">{title}</p>
          <h3 className="mt-2 text-2xl font-black text-foreground">{product.name || "Featured Product"}</h3>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
        </div>
        <Button asChild={true} className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href={createProductHref(product)}>
            Purchase Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
