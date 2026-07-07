import type { ElementType } from "react";

interface HomeBenefitCardProps {
  icon: ElementType;
  title: string;
  description: string;
}

export function HomeBenefitCard({
  icon: Icon,
  title,
  description,
}: HomeBenefitCardProps) {
  return (
    <div className="group rounded-[2rem] border border-border/60 bg-card/80 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition duration-300 group-hover:scale-105">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mb-2 text-lg font-black text-foreground">{title}</h3>
      <p className="text-sm leading-7 text-muted-foreground">{description}</p>
    </div>
  );
}
