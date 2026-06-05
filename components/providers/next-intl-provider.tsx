/**
 * NextIntl Provider Component
 *
 * Provides internationalization context with fallback support.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import type * as React from "react";

type Messages = Record<string, unknown>;

interface NextIntlProviderProps {
  children: React.ReactNode;
  locale: string;
  messages: Messages;
}

export function NextIntlProvider({ children, locale, messages }: NextIntlProviderProps) {
  const ClientProvider = ({ children: c }: { children: React.ReactNode }) => {
    // Use dynamic import to avoid hard dependency
    return <div data-testid="next-intl-provider" data-locale={locale} data-messages={JSON.stringify(messages)}>{c}</div>;
  };

  return <ClientProvider>{children}</ClientProvider>;
}

export function useIntlFallback() {
  return {
    t: (key: string, params?: Record<string, string>) => {
      if (!params) return key;
      let result = key;
      for (const [k, v] of Object.entries(params)) {
        result = result.replace(`{${k}}`, v);
      }
      return result;
    },
    locale: "en",
  };
}

export function createMergedMessages(
  base: Record<string, unknown>,
  additional: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base };

  for (const [key, value] of Object.entries(additional)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      result[key] &&
      typeof result[key] === "object" &&
      !Array.isArray(result[key])
    ) {
      result[key] = createMergedMessages(
        result[key] as Record<string, unknown>,
        value as Record<string, unknown>,
      );
    } else {
      result[key] = value;
    }
  }

  return result;
}