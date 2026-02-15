"use client";

/**
 * Persian-Aware Currency Display Component
 *
 * A flexible currency display component with full Persian language support,
 * including Persian number formatting, currency conversion, and RTL layout.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  currencyUtils,
  persianCurrencyFormatter,
  persianNumberFormatter,
} from "@/lib/utils/persian";

interface CurrencyDisplayProps {
  /**
   * The amount to display
   */
  amount: number | string;

  /**
   * Currency code (IRR, USD, etc.)
   */
  currency?: string;

  /**
   * Language for display ('fa' for Persian, 'en' for English)
   */
  language?: "fa" | "en";

  /**
   * Whether to show currency symbol/code
   */
  showCurrency?: boolean;

  /**
   * Whether to use Persian digits
   */
  usePersianNumbers?: boolean;

  /**
   * Formatting options
   */
  options?: {
    compact?: boolean;
    decimals?: number;
    showCurrency?: boolean;
    usePersianNumbers?: boolean;
  };

  /**
   * CSS classes
   */
  className?: string;

  /**
   * Size variant
   */
  size?: "sm" | "md" | "lg" | "xl";

  /**
   * Whether to show discount information
   */
  showDiscount?: {
    originalPrice: number;
    discountedPrice: number;
  };

  /**
   * Custom formatter function
   */
  formatter?: (amount: number, currency: string, language: string) => string;
}

const CurrencyDisplay = React.forwardRef<HTMLSpanElement, CurrencyDisplayProps>(
  (
    {
      amount,
      currency = "IRR",
      language = "fa",
      showCurrency = true,
      usePersianNumbers = true,
      options = {},
      className,
      size = "md",
      showDiscount,
      formatter,
      ...props
    },
    ref,
  ) => {
    // Merge options
    const finalOptions = {
      showCurrency,
      usePersianNumbers,
      compact: false,
      decimals: currency === "IRR" ? 0 : 2,
      ...options,
    };

    // Format the amount
    const formatAmount = React.useCallback(
      (value: number): string => {
        if (formatter) {
          return formatter(value, currency, language);
        }

        if ((currency === "IRR" || currency === "TOMAN") && language === "fa") {
          return persianCurrencyFormatter.formatToman(value, finalOptions);
        }

        // Fallback to international formatting
        const formatted = new Intl.NumberFormat(
          language === "fa" ? "fa-IR" : "en-US",
          {
            style: finalOptions.showCurrency ? "currency" : "decimal",
            currency,
            minimumFractionDigits: finalOptions.decimals,
            maximumFractionDigits: finalOptions.decimals,
          },
        ).format(value);

        // Apply Persian numbers if requested
        return finalOptions.usePersianNumbers && language === "fa"
          ? persianNumberFormatter.toPersian(formatted)
          : formatted;
      },
      [currency, language, finalOptions, formatter],
    );

    // Parse amount to number
    const numericAmount = React.useMemo(() => {
      if (typeof amount === "number") return amount;
      // Convert Persian numbers if present
      const englishAmount = persianNumberFormatter
        .toPersian(amount)
        .replace(/[^\d.-]/g, "");
      return parseFloat(englishAmount) || 0;
    }, [amount]);

    // Size classes
    const sizeClasses = {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl font-semibold",
    };

    // Format currency symbol
    const getCurrencySymbol = React.useCallback((): string => {
      if (!finalOptions.showCurrency) return "";

      switch (currency) {
        case "IRR":
          return language === "fa" ? "تومان" : "IRR";
        case "USD":
          return language === "fa" ? "دلار" : "$";
        case "EUR":
          return language === "fa" ? "یورو" : "€";
        default:
          return currency;
      }
    }, [currency, language, finalOptions.showCurrency]);

    const formattedAmount = formatAmount(numericAmount);
    const currencySymbol = getCurrencySymbol();

    // Handle discount display
    if (showDiscount) {
      const { originalPrice, discountedPrice } = showDiscount;
      const discount = persianCurrencyFormatter.formatDiscount(
        originalPrice,
        discountedPrice,
        language,
      );

      return (
        <span
          className={cn("inline-flex flex-col gap-1", className)}
          {...props}
        >
          {/* Original price (strikethrough) */}
          <span
            className={cn("text-muted-foreground line-through", sizeClasses.sm)}
          >
            {formatAmount(originalPrice)}
          </span>

          {/* Discounted price */}
          <span className="flex items-center gap-2">
            <span
              className={cn("font-semibold text-primary", sizeClasses[size])}
              ref={ref}
            >
              {discount.finalPrice}
            </span>

            {/* Discount percentage badge */}
            <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
              {discount.percentage}
            </span>
          </span>

          {/* Savings amount */}
          <span className={cn("text-sm text-green-600", sizeClasses.sm)}>
            {language === "fa" ? "صرفه اقتصادی: " : "Save: "}
            {discount.savings}
          </span>
        </span>
      );
    }

    // Regular price display
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1",
          sizeClasses[size],
          // RTL support for Persian
          language === "fa" && "font-persian",
          className,
        )}
        dir={language === "fa" ? "rtl" : "ltr"}
        {...props}
      >
        <span>{formattedAmount}</span>
        {currencySymbol && (
          <span className="text-muted-foreground">{currencySymbol}</span>
        )}
      </span>
    );
  },
);

CurrencyDisplay.displayName = "CurrencyDisplay";

/**
 * Compact Currency Display for small spaces
 */
export const CompactCurrencyDisplay = React.forwardRef<
  HTMLSpanElement,
  Omit<CurrencyDisplayProps, "options"> & {
    options?: CurrencyDisplayProps["options"] & {
      compact: true;
    };
  }
>((props, ref) => (
  <CurrencyDisplay
    {...props}
    ref={ref}
    options={{
      compact: true,
      ...props.options,
    }}
  />
));

CompactCurrencyDisplay.displayName = "CompactCurrencyDisplay";

/**
 * Price Range Display Component
 */
export const PriceRangeDisplay = React.forwardRef<
  HTMLSpanElement,
  Omit<CurrencyDisplayProps, "amount"> & {
    minPrice: number;
    maxPrice: number;
  }
>(
  (
    {
      minPrice,
      maxPrice,
      currency = "IRR",
      language = "fa",
      className,
      ...props
    },
    ref,
  ) => {
    const rangeText = React.useMemo(() => {
      if (currency === "IRR" && language === "fa") {
        return persianCurrencyFormatter.formatPriceRange(
          minPrice,
          maxPrice,
          language,
        );
      }

      const minFormatted = new Intl.NumberFormat(
        language === "fa" ? "fa-IR" : "en-US",
        {
          style: "currency",
          currency,
        },
      ).format(minPrice);

      const maxFormatted = new Intl.NumberFormat(
        language === "fa" ? "fa-IR" : "en-US",
        {
          style: "currency",
          currency,
        },
      ).format(maxPrice);

      return `${minFormatted} - ${maxFormatted}`;
    }, [minPrice, maxPrice, currency, language]);

    return (
      <span
        ref={ref}
        className={cn(
          "inline-block",
          language === "fa" && "font-persian",
          className,
        )}
        dir={language === "fa" ? "rtl" : "ltr"}
        {...props}
      >
        {rangeText}
      </span>
    );
  },
);

PriceRangeDisplay.displayName = "PriceRangeDisplay";

/**
 * Currency Converter Display
 */
export const CurrencyConverterDisplay = React.forwardRef<
  HTMLDivElement,
  {
    amount: number;
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    language?: "fa" | "en";
    className?: string;
  }
>(
  (
    {
      amount,
      fromCurrency,
      toCurrency,
      rate,
      language = "fa",
      className,
      ...props
    },
    ref,
  ) => {
    const convertedAmount = React.useMemo(() => {
      return fromCurrency === "IRR"
        ? currencyUtils.rialToUSD(amount, rate)
        : amount * rate;
    }, [amount, fromCurrency, rate]);

    const originalDisplay = React.useMemo(() => {
      if (fromCurrency === "IRR" && language === "fa") {
        return persianCurrencyFormatter.formatIRR(amount, {
          showCurrency: true,
        });
      }
      return new Intl.NumberFormat(language === "fa" ? "fa-IR" : "en-US", {
        style: "currency",
        currency: fromCurrency,
      }).format(amount);
    }, [amount, fromCurrency, language]);

    const convertedDisplay = React.useMemo(() => {
      if (toCurrency === "IRR" && language === "fa") {
        return persianCurrencyFormatter.formatIRR(convertedAmount, {
          showCurrency: true,
        });
      }
      return new Intl.NumberFormat(language === "fa" ? "fa-IR" : "en-US", {
        style: "currency",
        currency: toCurrency,
      }).format(convertedAmount);
    }, [convertedAmount, toCurrency, language]);

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-1",
          language === "fa" && "font-persian",
          className,
        )}
        dir={language === "fa" ? "rtl" : "ltr"}
        {...props}
      >
        <div className="text-lg font-semibold">{originalDisplay}</div>
        <div className="text-sm text-muted-foreground">
          ≈ {convertedDisplay}
        </div>
        <div className="text-xs text-muted-foreground">
          {language === "fa" ? "نرخ تبدیل: " : "Rate: "}
          {persianNumberFormatter.formatPercentage(
            (1 / rate) * 100,
            2,
            language === "fa",
          )}
        </div>
      </div>
    );
  },
);

CurrencyConverterDisplay.displayName = "CurrencyConverterDisplay";

/**
 * Hook for currency formatting
 */
export function useCurrencyFormatter(
  options: {
    currency?: string;
    language?: "fa" | "en";
    usePersianNumbers?: boolean;
  } = {},
) {
  const {
    currency = "IRR",
    language = "fa",
    usePersianNumbers = true,
  } = options;

  const formatCurrency = React.useCallback(
    (amount: number | string) => {
      const numericAmount =
        typeof amount === "number"
          ? amount
          : parseFloat(amount.toString()) || 0;

      if (currency === "IRR" && language === "fa") {
        return persianCurrencyFormatter.formatIRR(numericAmount, {
          showCurrency: true,
          usePersianNumbers,
        });
      }

      return new Intl.NumberFormat(language === "fa" ? "fa-IR" : "en-US", {
        style: "currency",
        currency,
      }).format(numericAmount);
    },
    [currency, language, usePersianNumbers],
  );

  return { formatCurrency };
}

export default CurrencyDisplay;
