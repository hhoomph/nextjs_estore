/**
 * Module for loading
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Heart, Loader2, Package, ShoppingBag } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

const loadingVariants = cva("animate-spin text-muted-foreground", {
  variants: {
    variant: {
      default: "",
      pulse: "animate-pulse",
      bounce: "animate-bounce",
      gradient:
        "bg-gradient-to-r from-primary via-primary/50 to-primary bg-clip-text text-transparent",
    },
    size: {
      xs: "h-3 w-3",
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8",
      xl: "h-12 w-12",
      "2xl": "h-16 w-16",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

interface LoadingProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingVariants> {
  text?: string;
  showText?: boolean;
  icon?: React.ReactNode;
}

export const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  (
    { className, variant, size = "md", text, showText = true, icon, ...props },
    ref,
  ) => {
    const IconComponent = icon || (
      <Loader2 className={loadingVariants({ variant, size })} />
    );

    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center", className)}
        {...props}
      >
        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            {IconComponent}
            {/* Pulse ring effect */}
            {variant === "gradient" && (
              <div
                className="absolute inset-0 rounded-full border-2 animate-ping"
                style={{ borderColor: "hsl(var(--primary) / 0.2)" }}
              />
            )}
          </div>
          {text && showText && (
            <p className="text-sm text-muted-foreground animate-pulse">
              {text}
            </p>
          )}
        </div>
      </div>
    );
  },
);
Loading.displayName = "Loading";

export function LoadingSpinner({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <Loader2
      className={cn(
        "animate-spin text-muted-foreground",
        sizeClasses[size],
        className,
      )}
    />
  );
}

export function LoadingPage({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background via-background to-muted/20">
      <div className="text-center space-y-4">
        <div className="relative">
          <div
            className="w-16 h-16 border-4 rounded-full animate-spin mx-auto"
            style={{
              borderColor: "hsl(var(--muted))",
              borderTopColor: "hsl(var(--primary))",
            }}
          />
          <div
            className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-spin mx-auto animate-reverse"
            style={{ borderRightColor: "hsl(var(--primary) / 0.4)" }}
          />
        </div>
        <p className="text-muted-foreground animate-pulse">{text}</p>
      </div>
    </div>
  );
}

// Specialized loading components for e-commerce
export function LoadingProductCard() {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-3 animate-pulse">
      <div className="w-full h-32 bg-muted rounded-lg" />
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
      </div>
      <div className="flex justify-between items-center">
        <div className="h-6 bg-muted rounded w-16" />
        <div className="h-8 bg-muted rounded w-20" />
      </div>
    </div>
  );
}

export function LoadingProductGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingProductCard key={i} />
      ))}
    </div>
  );
}

export function LoadingCartItem() {
  return (
    <div className="flex items-center space-x-4 p-4 animate-pulse">
      <div className="w-16 h-16 bg-muted rounded" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-3 bg-muted rounded w-1/4" />
      </div>
      <div className="h-6 bg-muted rounded w-16" />
    </div>
  );
}

export function LoadingButton({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      disabled={true}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-muted text-muted-foreground cursor-not-allowed",
        className,
      )}
      {...props}
    >
      <Loader2 className="h-4 w-4 animate-spin" />
      {children}
    </button>
  );
}

// Skeleton loading components
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 && lines > 1 && "w-3/4", // Last line shorter
            i === 0 && "w-full", // First line full width
            i > 0 && i < lines - 1 && "w-5/6", // Middle lines slightly shorter
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-6 space-y-4 animate-pulse",
        className,
      )}
    >
      <Skeleton className="h-6 w-3/4" />
      <SkeletonText lines={2} />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

// Page transition loading
export function PageTransition({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <Package
            className="w-12 h-12 animate-bounce mx-auto text-primary"
          />
          <div
            className="absolute -inset-2 border-2 rounded-full animate-ping border-primary/20"
          />
        </div>
        <p className="text-muted-foreground">Loading page...</p>
      </div>
    </div>
  );
}

// E-commerce specific loading states
export function LoadingCart() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <ShoppingBag
          className="w-12 h-12 animate-pulse mx-auto text-primary"
        />
        <p className="text-muted-foreground">Loading cart...</p>
      </div>
    </div>
  );
}

export function LoadingWishlist() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <Heart
          className="w-12 h-12 animate-pulse mx-auto text-destructive"
        />
        <p className="text-muted-foreground">Loading wishlist...</p>
      </div>
    </div>
  );
}
