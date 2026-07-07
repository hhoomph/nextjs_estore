import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StockBadgeProps {
  inStock: boolean;
  quantity?: number;
  inStockLabel?: string;
  outOfStockLabel?: string;
  showQuantity?: boolean;
  className?: string;
}

export function StockBadge({
  inStock,
  quantity,
  inStockLabel = "In Stock",
  outOfStockLabel = "Out of Stock",
  showQuantity = true,
  className,
}: StockBadgeProps) {
  const label = inStock
    ? showQuantity && typeof quantity === "number"
      ? `${inStockLabel} (${quantity} available)`
      : inStockLabel
    : outOfStockLabel;

  return (
    <Badge
      variant={inStock ? "outline" : "destructive"}
      className={cn(
        inStock ? "border-success/40 bg-success/10 text-success shadow-sm" : "border-destructive/40 bg-destructive/10 text-destructive shadow-sm",
        className,
      )}
    >
      {label}
    </Badge>
  );
}
