import { create } from "zustand";

export type CurrencyCode = "IRR" | "USD" | "EUR" | "GBP" | "AED" | "TRY";

export type Currency = {
  code: CurrencyCode;
  symbol: string;
  locale: string;
  name: string;
};

const CURRENCIES: Record<CurrencyCode, Currency> = {
  IRR: { code: "IRR", symbol: "تومان", locale: "fa-IR", name: "تومان" },
  USD: { code: "USD", symbol: "$", locale: "en-US", name: "US Dollar" },
  EUR: { code: "EUR", symbol: "€", locale: "en-US", name: "Euro" },
  GBP: { code: "GBP", symbol: "£", locale: "en-US", name: "British Pound" },
  AED: { code: "AED", symbol: "د.إ", locale: "en-US", name: "UAE Dirham" },
  TRY: { code: "TRY", symbol: "₺", locale: "en-US", name: "Turkish Lira" },
};

type CurrencyStore = {
  currency: CurrencyCode;
  currencies: Record<CurrencyCode, Currency>;
  setCurrency: (code: CurrencyCode) => void;
};

const STORAGE_KEY = "storefront-currency";

const loadStoredCurrency = (): CurrencyCode => {
  if (typeof window === "undefined") return "IRR";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in CURRENCIES) return stored as CurrencyCode;
  } catch {
    // localStorage unavailable
  }
  return "IRR";
};

export const useCurrencyStore = create<CurrencyStore>((set) => ({
  currency: loadStoredCurrency(),
  currencies: CURRENCIES,
  setCurrency: (code: CurrencyCode) => {
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // localStorage unavailable
    }
    set({ currency: code });
  },
}));

export { CURRENCIES };
