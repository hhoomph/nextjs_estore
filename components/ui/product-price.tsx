import { cn } from "@/lib/utils";
import { formatAmount } from "@/lib/utils/currency";
import { useCurrencyStore } from "@/lib/stores/currency-store";

type PriceValue = number | string | null | undefined;

interface ProductPriceProps {
  price: PriceValue;
  discountPrice?: PriceValue;
  currency?: string;
  className?: string;
  amountClassName?: string;
  originalClassName?: string;
}

function toNumber(value: PriceValue) {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function getProductCurrentPrice(price: PriceValue, discountPrice?: PriceValue) {
  const discounted = toNumber(discountPrice);
  const base = toNumber(price);
  return discounted > 0 && discounted < base ? discounted : base;
}

export function ProductPrice({
  price,
  discountPrice,
  currency: currencyOverride,
  className,
  amountClassName,
  originalClassName,
}: ProductPriceProps) {
  const { currency: storeCurrency } = useCurrencyStore();
  const currentPrice = getProductCurrentPrice(price, discountPrice);
  const originalPrice = toNumber(price);
  const discountedPrice = toNumber(discountPrice);
  const hasDiscount = discountedPrice > 0 && discountedPrice < originalPrice;
  const activeCurrency = currencyOverride || storeCurrency;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={cn("font-black text-foreground", amountClassName)}>
        {formatAmount(currentPrice, activeCurrency)}
      </span>
      {hasDiscount && (
        <span className={cn("text-sm text-muted-foreground line-through", originalClassName)}>
          {formatAmount(originalPrice, activeCurrency)}
        </span>
      )}
    </div>
  );
}
