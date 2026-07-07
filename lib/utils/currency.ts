// lib/utils/currency.ts
/**
 * Currency formatting utilities for the admin dashboard and storefront.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2026-06-26
 */

const CURRENCY_LOCALES: Record<string, string> = {
  IRR: "fa-IR",
  TOMAN: "fa-IR",
  USD: "en-US",
  EUR: "en-IE",
  GBP: "en-GB",
  CAD: "en-CA",
  AUD: "en-AU",
  JPY: "ja-JP",
  CNY: "zh-CN",
  INR: "en-IN",
};

const DEFAULT_LOCALE = "en-US";

export function formatAmount(value: number, currency = "IRR"): string {
  const numericValue = Number.isFinite(value) ? value : 0;

  if (currency === "TOMAN") {
    return new Intl.NumberFormat("fa-IR", {
      style: "currency",
      currency: "IRR",
      maximumFractionDigits: 0,
    }).format(numericValue / 10);
  }

  if (currency === "IRR") {
    return new Intl.NumberFormat("fa-IR", {
      style: "currency",
      currency: "IRR",
      maximumFractionDigits: 0,
    }).format(numericValue);
  }

  const locale = CURRENCY_LOCALES[currency] ?? DEFAULT_LOCALE;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(numericValue);
}