import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm",
  {
    variants: {
      variant: {
        default:
          "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:shadow-md dark:border-primary/40 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30",
        secondary:
          "border-secondary/30 bg-secondary/10 text-secondary-foreground hover:bg-secondary/20 dark:border-secondary/40 dark:bg-secondary/20",
        destructive:
          "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 dark:border-destructive/40 dark:bg-destructive/20 dark:text-destructive",
        outline: "border text-foreground hover:bg-accent/50",
        success:
          "border-green-300/50 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-900 dark:bg-green-900/20 dark:text-green-400",
        warning:
          "border-amber-300/50 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-400",
        info:
          "border-blue-300/50 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-900/20 dark:text-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
