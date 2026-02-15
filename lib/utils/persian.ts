/**
 * Persian Language Utilities for E-commerce Application
 *
 * This module provides comprehensive utilities for handling Persian (Farsi) language
 * features in an e-commerce application, including:
 * - Persian/Arabic numeral conversion to English
 * - Iranian Rial currency formatting
 * - Phone number validation and formatting
 * - Text direction detection
 * - Form input processing utilities
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

/**
 * Persian to English numeral mapping
 */
const PERSIAN_NUMBERS = {
  "۰": "0",
  "۱": "1",
  "۲": "2",
  "۳": "3",
  "۴": "4",
  "۵": "5",
  "۶": "6",
  "۷": "7",
  "۸": "8",
  "۹": "9",
} as const;

/**
 * Arabic to English numeral mapping (for compatibility)
 */
const ARABIC_NUMBERS = {
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
} as const;

/**
 * Converts Persian/Arabic numerals to English numerals
 * @param input - String containing Persian or Arabic numerals
 * @returns String with English numerals
 * @example
 * convertPersianToEnglish("۱۲۳۴۵") // returns "12345"
 * convertPersianToEnglish("٠١٢") // returns "012"
 */
export function convertPersianToEnglish(input: string): string {
  if (!input || typeof input !== "string") return input;

  let result = input;

  // Convert Persian numerals
  Object.entries(PERSIAN_NUMBERS).forEach(([persian, english]) => {
    result = result.replace(new RegExp(persian, "g"), english);
  });

  // Convert Arabic numerals (for compatibility)
  Object.entries(ARABIC_NUMBERS).forEach(([arabic, english]) => {
    result = result.replace(new RegExp(arabic, "g"), english);
  });

  return result;
}

/**
 * Converts English numbers to Persian numbers
 * @param num - Number or string to convert
 * @returns Persian number string
 * @example
 * toPersianNumbers("12345") // returns "۱۲۳۴۵"
 * toPersianNumbers(123) // returns "۱۲۳"
 */
export function toPersianNumbers(num: string | number): string {
  const str = num.toString();
  return str.replace(
    /\d/g,
    (digit) => PERSIAN_NUMBERS[digit as keyof typeof PERSIAN_NUMBERS],
  );
}

/**
 * Formats Iranian Rial currency
 * @param amount - Amount in Rials (as number or string)
 * @param showCurrency - Whether to include currency symbol
 * @returns Formatted currency string
 * @example
 * formatIranianCurrency(150000) // returns "150,000 تومان"
 * formatIranianCurrency("2500000", false) // returns "2,500,000"
 */
export function formatIranianCurrency(
  amount: number | string,
  showCurrency = true,
): string {
  // Convert Persian numbers to English first
  const cleanAmount = convertPersianToEnglish(String(amount));

  // Parse to number and validate
  const numAmount = parseFloat(cleanAmount.replace(/,/g, ""));
  if (isNaN(numAmount)) return "0";

  // Format with thousands separator
  const formatted = Math.floor(numAmount).toLocaleString("fa-IR");

  return showCurrency ? `${formatted} تومان` : formatted;
}

/**
 * Formats price with both IRR and USD (if conversion rate available)
 * @param rialAmount - Amount in Iranian Rials
 * @param usdRate - USD to IRR conversion rate (optional)
 * @returns Formatted price string
 * @example
 * formatPrice(150000) // returns "150,000 تومان"
 * formatPrice(150000, 500000) // returns "150,000 تومان (0.30 USD)"
 */
export function formatPrice(rialAmount: number, usdRate?: number): string {
  const rialFormatted = formatIranianCurrency(rialAmount);

  if (usdRate && usdRate > 0) {
    const usdAmount = rialAmount / usdRate;
    const usdFormatted = usdAmount.toFixed(2);
    return `${rialFormatted} (${usdFormatted} USD)`;
  }

  return rialFormatted;
}

/**
 * Validates and sanitizes phone numbers for Iranian format
 * @param phone - Phone number string
 * @returns Sanitized phone number or null if invalid
 * @example
 * sanitizeIranianPhone("۰۹۱۲۳۴۵۶۷۸۹") // returns "09123456789"
 * sanitizeIranianPhone("+989123456789") // returns "09123456789"
 */
export function sanitizeIranianPhone(phone: string): string | null {
  if (!phone) return null;

  // Convert Persian numbers to English
  let cleanPhone = convertPersianToEnglish(phone);

  // Remove all non-numeric characters except +
  cleanPhone = cleanPhone.replace(/[^\d+]/g, "");

  // Handle international format
  if (cleanPhone.startsWith("+98")) {
    cleanPhone = "0" + cleanPhone.substring(3);
  }

  // Validate Iranian mobile format (09xxxxxxxxx)
  const mobileRegex = /^09\d{9}$/;
  if (!mobileRegex.test(cleanPhone)) {
    return null;
  }

  return cleanPhone;
}

/**
 * Formats phone number for display
 * @param phone - Phone number string
 * @returns Formatted phone number
 * @example
 * formatPhoneNumber("09123456789") // returns "0912 345 6789"
 */
export function formatPhoneNumber(phone: string): string {
  const cleanPhone = sanitizeIranianPhone(phone);
  if (!cleanPhone) return phone;

  // Format as: 0912 345 6789
  return `${cleanPhone.slice(0, 4)} ${cleanPhone.slice(4, 7)} ${cleanPhone.slice(7)}`;
}

/**
 * Checks if text contains Persian characters
 * @param text - Text to check
 * @returns True if text contains Persian characters
 */
export function containsPersian(text: string): boolean {
  const persianRegex =
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return persianRegex.test(text);
}

/**
 * Determines the appropriate text direction based on content
 * @param text - Text to analyze
 * @returns 'rtl' for Persian/Arabic text, 'ltr' for English
 */
export function getTextDirection(text: string): "ltr" | "rtl" {
  return containsPersian(text) ? "rtl" : "ltr";
}

/**
 * Persian number utilities for form inputs
 */
export const persianNumberUtils = {
  /**
   * Converts input value to English numbers for form processing
   * @param value - Input value
   * @returns Converted value
   */
  processInput: (value: string | number): string => {
    return convertPersianToEnglish(String(value));
  },

  /**
   * Validates numeric input allowing Persian numbers
   * @param value - Input value
   * @returns True if valid number
   */
  isValidNumber: (value: string): boolean => {
    const englishValue = convertPersianToEnglish(value);
    return !isNaN(Number(englishValue)) && englishValue.trim() !== "";
  },

  /**
   * Parses numeric value from Persian/English input
   * @param value - Input value
   * @returns Parsed number or NaN
   */
  parseNumber: (value: string): number => {
    const englishValue = convertPersianToEnglish(value);
    return parseFloat(englishValue);
  },
};

/**
 * Currency conversion utilities
 */
export const currencyUtils = {
  /**
   * Iranian Rial to USD conversion (approximate)
   * @param rialAmount - Amount in Rials
   * @param rate - Current USD/IRR rate (default: 500,000)
   * @returns Amount in USD
   */
  rialToUSD: (rialAmount: number, rate = 500000): number => {
    return rialAmount / rate;
  },

  /**
   * USD to Iranian Rial conversion
   * @param usdAmount - Amount in USD
   * @param rate - Current USD/IRR rate (default: 500,000)
   * @returns Amount in Rials
   */
  usdToRial: (usdAmount: number, rate = 500000): number => {
    return usdAmount * rate;
  },

  /**
   * Format currency based on language
   * @param amount - Amount to format
   * @param currency - Currency code ('IRR', 'USD', etc.)
   * @param language - Language code ('fa', 'en')
   * @returns Formatted currency string
   */
  formatByLanguage: (
    amount: number,
    currency: string,
    language: string,
  ): string => {
    if (currency === "IRR" && language === "fa") {
      return formatIranianCurrency(amount);
    }

    // Fallback to English formatting
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  },
};

/**
 * Enhanced Persian input processing utilities
 */
export const persianInputUtils = {
  /**
   * Converts Persian input to English numbers in real-time
   * @param input - Input string with potential Persian numbers
   * @returns Converted string with English numbers
   */
  convertInput: (input: string): string => {
    if (!input) return input;
    return convertPersianToEnglish(input);
  },

  /**
   * Validates Persian number input
   * @param input - Input string to validate
   * @returns True if input contains valid Persian/English numbers
   */
  isValidPersianNumber: (input: string): boolean => {
    const englishValue = convertPersianToEnglish(input);
    return /^\d*\.?\d*$/.test(englishValue) && englishValue.trim() !== "";
  },

  /**
   * Formats input value with Persian numbers for display
   * @param value - Numeric value
   * @param usePersianNumbers - Whether to use Persian digits
   * @returns Formatted string
   */
  formatDisplayValue: (
    value: number | string,
    usePersianNumbers = true,
  ): string => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) return String(value);

    if (usePersianNumbers) {
      return toPersianNumbers(numValue.toString());
    }
    return numValue.toString();
  },

  /**
   * Processes form input for Persian number fields
   * @param value - Input value
   * @param allowDecimals - Whether to allow decimal numbers
   * @returns Processed value
   */
  processFormInput: (value: string, allowDecimals = true): string => {
    if (!value) return value;

    // Convert Persian numbers to English
    let processed = convertPersianToEnglish(value);

    // Remove invalid characters
    const regex = allowDecimals ? /[^\d.]/g : /[^\d]/g;
    processed = processed.replace(regex, "");

    // Ensure only one decimal point
    const parts = processed.split(".");
    if (parts.length > 2) {
      processed = parts[0] + "." + parts.slice(1).join("");
    }

    return processed;
  },

  /**
   * Validates currency input with Persian number support
   * @param input - Input string
   * @param maxAmount - Maximum allowed amount
   * @returns Validation result
   */
  validateCurrencyInput: (
    input: string,
    maxAmount?: number,
  ): { isValid: boolean; value: number; error?: string } => {
    const processed = persianInputUtils.processFormInput(input, true);
    const numericValue = parseFloat(processed);

    if (isNaN(numericValue)) {
      return { isValid: false, value: 0, error: "Invalid number format" };
    }

    if (maxAmount !== undefined && numericValue > maxAmount) {
      return {
        isValid: false,
        value: numericValue,
        error: `Amount cannot exceed ${maxAmount.toLocaleString()}`,
      };
    }

    if (numericValue < 0) {
      return {
        isValid: false,
        value: numericValue,
        error: "Amount cannot be negative",
      };
    }

    return { isValid: true, value: numericValue };
  },
};

/**
 * Persian number formatting utilities
 */
export const persianNumberFormatter = {
  /**
   * Converts English numbers to Persian numbers
   * @param num - Number or string to convert
   * @returns Persian number string
   */
  toPersian: (num: string | number): string => {
    return toPersianNumbers(String(num));
  },

  /**
   * Formats large numbers with Persian abbreviations
   * @param num - Number to format
   * @param language - Language ('fa' or 'en')
   * @returns Formatted string
   */
  formatLargeNumber: (num: number, language: "fa" | "en" = "fa"): string => {
    const units =
      language === "fa"
        ? {
            thousand: "هزار",
            million: "میلیون",
            billion: "میلیارد",
          }
        : {
            thousand: "K",
            million: "M",
            billion: "B",
          };

    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}${units.billion}`;
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}${units.million}`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}${units.thousand}`;
    }

    return language === "fa"
      ? toPersianNumbers(num.toString())
      : num.toString();
  },

  /**
   * Formats percentage with Persian number support
   * @param value - Percentage value
   * @param decimals - Number of decimal places
   * @param usePersianNumbers - Whether to use Persian digits
   * @returns Formatted percentage string
   */
  formatPercentage: (
    value: number,
    decimals = 1,
    usePersianNumbers = true,
  ): string => {
    const formatted = value.toFixed(decimals);
    return usePersianNumbers
      ? `${toPersianNumbers(formatted)}%`
      : `${formatted}%`;
  },

  /**
   * Formats phone number with Persian numbers
   * @param phone - Phone number string
   * @returns Formatted phone number
   */
  formatPersianPhone: (phone: string): string => {
    const cleanPhone = sanitizeIranianPhone(phone);
    if (!cleanPhone) return phone;

    // Format with Persian numbers: ۰۹۱۲ ۳۴۵ ۶۷۸۹
    const formatted = `${cleanPhone.slice(0, 4)} ${cleanPhone.slice(4, 7)} ${cleanPhone.slice(7)}`;
    return toPersianNumbers(formatted);
  },
};

/**
 * Persian currency formatting enhancements
 */
export const persianCurrencyFormatter = {
  /**
   * Enhanced Iranian Toman formatting with Persian numbers (1 Toman = 10 Rials)
   * @param amount - Amount in Tomans
   * @param options - Formatting options
   * @returns Formatted currency string
   */
  formatToman: (
    amount: number | string,
    options: {
      showCurrency?: boolean;
      usePersianNumbers?: boolean;
      compact?: boolean;
      decimals?: number;
    } = {},
  ): string => {
    const {
      showCurrency = true,
      usePersianNumbers = true,
      compact = false,
      decimals = 0,
    } = options;

    // Convert Persian numbers to English first
    const cleanAmount = convertPersianToEnglish(String(amount));
    const numAmount = parseFloat(cleanAmount.replace(/,/g, ""));

    if (isNaN(numAmount)) return "۰";

    let formatted: string;

    if (compact && numAmount >= 100000) {
      // Use compact notation for large amounts (divide by 1000 for Toman)
      const thousands = numAmount / 1000;
      formatted = `${thousands.toFixed(1)}K`;
    } else {
      // Standard formatting with thousands separator
      formatted = Math.floor(numAmount).toLocaleString("fa-IR");
    }

    // Apply Persian numbers if requested
    if (usePersianNumbers) {
      formatted = toPersianNumbers(formatted);
    }

    // Add decimals if specified
    if (decimals > 0 && !compact) {
      const decimalPart = (numAmount % 1).toFixed(decimals).slice(1);
      if (decimalPart !== ".000") {
        formatted += usePersianNumbers
          ? toPersianNumbers(decimalPart)
          : decimalPart;
      }
    }

    return showCurrency ? `${formatted} تومان` : formatted;
  },

  /**
   * Enhanced Iranian Rial formatting with Persian numbers
   * @param amount - Amount in Rials
   * @param options - Formatting options
   * @returns Formatted currency string
   */
  formatIRR: (
    amount: number | string,
    options: {
      showCurrency?: boolean;
      usePersianNumbers?: boolean;
      compact?: boolean;
      decimals?: number;
    } = {},
  ): string => {
    const {
      showCurrency = true,
      usePersianNumbers = true,
      compact = false,
      decimals = 0,
    } = options;

    // Convert Persian numbers to English first
    const cleanAmount = convertPersianToEnglish(String(amount));
    const numAmount = parseFloat(cleanAmount.replace(/,/g, ""));

    if (isNaN(numAmount)) return "۰";

    let formatted: string;

    if (compact && numAmount >= 1000000) {
      // Use compact notation for large amounts
      const millions = numAmount / 1000000;
      formatted = `${millions.toFixed(1)}M`;
    } else {
      // Standard formatting with thousands separator
      formatted = Math.floor(numAmount).toLocaleString("fa-IR");
    }

    // Apply Persian numbers if requested
    if (usePersianNumbers) {
      formatted = toPersianNumbers(formatted);
    }

    // Add decimals if specified
    if (decimals > 0 && !compact) {
      const decimalPart = (numAmount % 1).toFixed(decimals).slice(1);
      if (decimalPart !== ".000") {
        formatted += usePersianNumbers
          ? toPersianNumbers(decimalPart)
          : decimalPart;
      }
    }

    return showCurrency ? `${formatted} تومان` : formatted;
  },

  /**
   * Formats price range with Persian support
   * @param minPrice - Minimum price
   * @param maxPrice - Maximum price
   * @param language - Language ('fa' or 'en')
   * @returns Formatted price range
   */
  formatPriceRange: (
    minPrice: number,
    maxPrice: number,
    language: "fa" | "en" = "fa",
  ): string => {
    const minFormatted = persianCurrencyFormatter.formatIRR(minPrice, {
      showCurrency: false,
    });
    const maxFormatted = persianCurrencyFormatter.formatIRR(maxPrice, {
      showCurrency: false,
    });

    if (language === "fa") {
      return `${minFormatted} - ${maxFormatted} تومان`;
    } else {
      return `${minFormatted} - ${maxFormatted} IRR`;
    }
  },

  /**
   * Formats discount percentage with Persian support
   * @param originalPrice - Original price
   * @param discountedPrice - Discounted price
   * @param language - Language ('fa' or 'en')
   * @returns Discount information
   */
  formatDiscount: (
    originalPrice: number,
    discountedPrice: number,
    language: "fa" | "en" = "fa",
  ): {
    percentage: string;
    savings: string;
    finalPrice: string;
  } => {
    const savings = originalPrice - discountedPrice;
    const percentage = Math.round((savings / originalPrice) * 100);

    return {
      percentage:
        language === "fa"
          ? `${toPersianNumbers(percentage.toString())}%`
          : `${percentage}%`,
      savings: persianCurrencyFormatter.formatIRR(savings, {
        showCurrency: true,
      }),
      finalPrice: persianCurrencyFormatter.formatIRR(discountedPrice, {
        showCurrency: true,
      }),
    };
  },
};
