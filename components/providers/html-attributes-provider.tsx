/**
 * HTML Attributes Provider
 *
 * Sets HTML attributes (lang, dir) based on current locale.
 * Must be used in client components to access locale from next-intl.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";

export function HTMLAttributesProvider() {
  const locale = useLocale();

  useEffect(() => {
    // Set lang attribute
    document.documentElement.lang = locale;

    // Set dir attribute for RTL languages
    const isRTL = locale === "fa";
    document.documentElement.dir = isRTL ? "rtl" : "ltr";

    // Set data-locale attribute for styling
    document.documentElement.setAttribute("data-locale", locale);
  }, [locale]);

  // This component doesn't render anything
  return null;
}
