"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
interface ProductActionButtonProps {
  inStock: boolean;
  onClick: () => void;
  label?: string;
  outOfStockLabel?: string;
  className?: string;
  disabled?: boolean;
  testId?: string;
}
export function ProductActionButton({
  inStock,
  onClick,
  label = "Add to Cart",
  outOfStockLabel = "Out of Stock",
  className,
  disabled,
  testId,
}: ProductActionButtonProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  const isDisabled = disabled || !isHydrated;
  return (
    <Button
      className={cn(
        "h-12 rounded-full px-5 font-bold shadow-lg shadow-primary/20 transition duration-300 hover:-translate-y-0.5",
        inStock && "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-primary/25",
        className,
      )}
      disabled={isDisabled}
      onClick={onClick}
      data-testid={testId}
    >
      {inStock ? (
        <>
          <ShoppingCart className="mr-2 ml-2 h-4 w-4" />
          {label}
        </>
      ) : (
        <>
          <Lock className="mr-2 ml-2 h-4 w-4" />
          {outOfStockLabel}
        </>
      )}
    </Button>
  );
}