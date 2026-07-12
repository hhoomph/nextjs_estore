/**
 * Currency formatting utilities for Persian (Toman) and English (USD)
 *
 * Automatically formats prices based on the selected locale.
 * Persian displays prices in Toman with RTL support.
 * English displays prices in USD with standard LTR format.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

/**
 * Currency symbols and configurations
 */
export const CURRENCY_CONFIG = {
  fa: {
    symbol: "تومان",
    symbolAlt: "Toman",
    format: "{symbol} {amount}",
    locale: "fa-IR",
  },
  en: {
    symbol: "$",
    symbolAlt: "USD",
    format: "{symbol}{amount}",
    locale: "en-US",
  },
} as const;

/**
 * Formats a price with the appropriate currency
 *
 * @param amount - The amount to format
 * @param locale - The locale (default: 'fa')
 * @returns Formatted price string
 *
 * @example
 * formatPrice(1000000) // "۱,۰۰۰,۰۰۰ تومان" (Persian)
 * formatPrice(1000000, "en") // "$1,000,000.00" (English)
 */
export function formatPrice(
  amount: number,
  locale: "fa" | "en" = "fa"
): string {
  const config = CURRENCY_CONFIG[locale];
  const formattedAmount = amount.toLocaleString(config.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return config.format
    .replace("{symbol}", config.symbol)
    .replace("{symbolAlt}", config.symbolAlt)
    .replace("{amount}", formattedAmount);
}

/**
 * Formats amount using currency codes (toman, usd, etc.)
 * Compatible with ProductPrice component and CurrencyStore
 *
 * @param amount - The amount to format
 * @param currency - The currency code (default: 'toman')
 * @returns Formatted price string
 *
 * @example
 * formatAmount(1000000) // "۱,۰۰۰,۰۰۰ تومان" (Persian)
 * formatAmount(1000000, 'usd') // "$1,000,000.00" (English)
 */
export function formatAmount(
  amount: number,
  currency: "toman" | "usd" | "toman-symbol" | "toman-fa" | "IRR" | "USD" = "toman"
): string {
  // Map currency codes to locales
  const localeMap: Record<string, "fa" | "en"> = {
    toman: "fa",
    "toman-symbol": "fa",
    "toman-fa": "fa",
    usd: "en",
  };

  const locale = localeMap[currency] || "fa";
  return formatPrice(amount, locale);
}

/**
 * Formats a price as an integer (no decimals)
 * Useful for display purposes when decimals aren't needed
 *
 * @param amount - The amount to format
 * @param locale - The locale (default: 'fa')
 * @returns Formatted price string
 */
export function formatPriceInteger(
  amount: number,
  locale: "fa" | "en" = "fa"
): string {
  const config = CURRENCY_CONFIG[locale];
  const formattedAmount = Math.round(amount).toLocaleString(config.locale);

  return config.format
    .replace("{symbol}", config.symbol)
    .replace("{symbolAlt}", config.symbolAlt)
    .replace("{amount}", formattedAmount);
}

/**
 * Parses a formatted price string back to a number
 * Useful for processing user input
 *
 * @param formattedPrice - The formatted price string
 * @param locale - The locale (default: 'fa')
 * @returns Parsed number
 */
export function parsePrice(formattedPrice: string, locale: "fa" | "en" = "fa"): number {
  const config = CURRENCY_CONFIG[locale];

  // Remove currency symbol and format characters
  const cleaned = formattedPrice
    .replace(/[^\d.,]/g, "")
    .replace(/\./g, "") // Remove decimal points (we'll add them back)
    .replace(/,/g, ""); // Remove thousand separators

  // Parse the number
  const number = parseFloat(cleaned);

  if (isNaN(number)) {
    throw new Error("Invalid price format");
  }

  return number;
}

/**
 * Converts price from one currency to another
 * Simplified conversion (1 USD ≈ 42,000 Toman)
 *
 * @param amount - The amount in source currency
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @returns Converted amount
 */
export function convertCurrency(
  amount: number,
  fromCurrency: "usd" | "toman" | "IRR" | "USD",
  toCurrency: "usd" | "toman" | "IRR" | "USD"
): number {
  const USD_TO_TOMAN_RATE = 42000; // Approximate conversion rate

  // Handle IRR to USD conversion
  if (fromCurrency === "IRR" && toCurrency === "USD") {
    return amount / USD_TO_TOMAN_RATE;
  }

  // Handle USD to IRR conversion
  if (fromCurrency === "USD" && toCurrency === "IRR") {
    return amount * USD_TO_TOMAN_RATE;
  }

  // Handle toman to USD conversion (toman and IRR are the same)
  if (fromCurrency === "toman" && toCurrency === "USD") {
    return amount / USD_TO_TOMAN_RATE;
  }

  // Handle USD to toman conversion
  if (fromCurrency === "USD" && toCurrency === "toman") {
    return amount * USD_TO_TOMAN_RATE;
  }

  return amount;
}

/**
 * Gets the currency configuration for a locale
 *
 * @param locale - The locale
 * @returns Currency configuration object
 */
export function getCurrencyConfig(locale: "fa" | "en") {
  return CURRENCY_CONFIG[locale];
}

/**
 * Checks if a price format requires RTL layout
 *
 * @param locale - The locale
 * @returns true if RTL, false otherwise
 */
export function isRTLCurrency(locale: "fa" | "en"): boolean {
  return locale === "fa";
}
