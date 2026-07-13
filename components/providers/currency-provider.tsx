/**
 * Currency Context for Conditional Currency Display
 *
 * Provides currency switching functionality (Toman for Persian, USD for English).
 * Automatically switches based on locale.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CookieLocale } from "@/lib/i18n/cookie-locale";
import { hydrateCurrencyStore } from "@/lib/stores/currency-store";

interface CurrencyContextType {
  locale: CookieLocale;
  currencyConfig: {
    symbol: string;
    prefix: string;
    format: string;
    locale: string;
  };
  isLoading: boolean;
  setCurrency: (currency: string) => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: React.ReactNode;
  initialLocale?: CookieLocale;
}

/**
 * Currency configuration per locale
 */
const localeCurrencyConfig: Record<string, { symbol: string; prefix: string; format: string; locale: string }> = {
  fa: {
    symbol: "تومان",
    prefix: "",
    format: "{symbol} {amount}",
    locale: "fa-IR",
  },
  en: {
    symbol: "$",
    prefix: "",
    format: "${amount}",
    locale: "en-US",
  },
};

/**
 * Format price with conditional currency
 */
export function formatPrice(
  amount: number,
  locale?: string,
  symbol?: string,
  prefix?: string,
  format?: string
): string {
  // Get currency config or use default (USD)
  const config = locale
    ? localeCurrencyConfig[locale as CookieLocale] || localeCurrencyConfig.en
    : localeCurrencyConfig.fa;

  const finalSymbol = symbol || config.symbol;
  const finalPrefix = prefix || config.prefix;
  const finalFormat = format || config.format;

  // Format the number with 2 decimal places
  const formattedAmount = amount.toLocaleString(config.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return finalFormat
    .replace("{symbol}", finalSymbol)
    .replace("{amount}", formattedAmount)
    .replace(/{prefix}/g, finalPrefix);
}

/**
 * Provider component for currency management
 */
export function CurrencyProvider({
  children,
  initialLocale = "fa",
}: CurrencyProviderProps) {
  const [locale, setLocale] = useState<CookieLocale>(initialLocale);
  const [currencyConfig, setCurrencyConfig] = useState<CurrencyContextType["currencyConfig"]>(
    localeCurrencyConfig[initialLocale]
  );
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Load locale from cookie on mount
  useEffect(() => {
    const controller = new AbortController();
    const loadLocale = async () => {
      try {
        const response = await fetch("/api/locale", {
          method: "GET",
          signal: controller.signal,
        });

        if (response.ok) {
          const data = await response.json();
          const loadedLocale = data.locale as CookieLocale;
          if (loadedLocale) {
            setLocale(loadedLocale);
          }
        }
      } catch (error) {
        if (
          error instanceof Error &&
          (error.name === "AbortError" || error.message === "Failed to fetch")
        ) {
          return;
        }
        console.error("Failed to load locale:", error);
      }
    };

    // Hydrate currency store from localStorage after mount
    // to avoid SSR hydration mismatches
    hydrateCurrencyStore();

    void loadLocale();
    return () => controller.abort();
  }, []);

  // Update currency config when locale changes
  useEffect(() => {
    const config = localeCurrencyConfig[locale] || localeCurrencyConfig.en;
    setCurrencyConfig({
      symbol: config.symbol,
      prefix: config.prefix,
      format: config.format,
      locale: config.locale,
    });
  }, [locale]);

  /**
   * Set currency via API
   */
  const setCurrency = useCallback(
    async (newCurrency: string) => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/currency", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ currency: newCurrency }),
        });

        if (response.ok) {
          router.refresh();
        } else {
          console.error("Failed to set currency");
        }
      } catch (error) {
        console.error("Error setting currency:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const value: CurrencyContextType = {
    locale,
    currencyConfig: {
      symbol: currencyConfig.symbol,
      prefix: currencyConfig.prefix,
      format: currencyConfig.format,
      locale: currencyConfig.locale,
    },
    isLoading,
    setCurrency,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

/**
 * Hook to use currency context
 */
export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}

/**
 * Hook to format prices with current currency
 */
export function useFormattedPrice(amount: number): string {
  const { currencyConfig } = useCurrency();

  return formatPrice(amount, currencyConfig.locale, currencyConfig.symbol, currencyConfig.prefix);
}
