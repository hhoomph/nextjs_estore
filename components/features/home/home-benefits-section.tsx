import { Headphones, Package, ShieldCheck, Truck } from "lucide-react";
import { HomeBenefitCard } from "@/components/features/home/home-benefit-card";
import { SectionHeading } from "@/components/features/layout/section-heading";

interface HomeBenefitsSectionProps {
  title: string;
  subtitle: string;
  freeShipping: { title: string; description: string };
  securePayment: { title: string; description: string };
  qualityProducts: { title: string; description: string };
  support247: { title: string; description: string };
}

export function HomeBenefitsSection({
  title,
  subtitle,
  freeShipping,
  securePayment,
  qualityProducts,
  support247,
}: HomeBenefitsSectionProps) {
  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Store Benefits"
          title={title}
          description={subtitle}
          className="mb-10"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <HomeBenefitCard
            icon={Truck}
            title={freeShipping.title}
            description={freeShipping.description}
          />
          <HomeBenefitCard
            icon={ShieldCheck}
            title={securePayment.title}
            description={securePayment.description}
          />
          <HomeBenefitCard
            icon={Package}
            title={qualityProducts.title}
            description={qualityProducts.description}
          />
          <HomeBenefitCard
            icon={Headphones}
            title={support247.title}
            description={support247.description}
          />
        </div>
      </div>
    </section>
  );
}
