/**
 * Locale Provider for Client Components
 *
 * Provides locale context and switching functionality for client-side components.
 * Works with cookie-based locale storage.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { CookieLocale } from "@/lib/i18n/cookie-locale";

interface LocaleContextType {
  locale: CookieLocale;
  setLocale: (locale: CookieLocale) => Promise<void>;
  isLoading: boolean;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface LocaleProviderProps {
  children: React.ReactNode;
  initialLocale: CookieLocale;
}

/**
 * Provider component for locale management
 */
export function LocaleProvider({
  children,
  initialLocale,
}: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<CookieLocale>(initialLocale);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Sync locale with cookie on mount
  useEffect(() => {
    const syncLocale = async () => {
      try {
        const response = await fetch("/api/locale");
        if (response.ok) {
          const data = await response.json();
          if (data.locale && data.locale !== locale) {
            setLocaleState(data.locale);
          }
        }
      } catch (error) {
        // Silently fail - use initial locale
        console.error("Failed to sync locale:", error);
      }
    };

    syncLocale();
  }, [locale]);

  /**
   * Set locale via API and refresh the page
   */
  const setLocale = useCallback(
    async (newLocale: CookieLocale) => {
      if (newLocale === locale) return;

      setIsLoading(true);
      try {
        const response = await fetch("/api/locale", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ locale: newLocale }),
        });

        if (response.ok) {
          setLocaleState(newLocale);
          // Refresh to apply new locale (re-renders Server Components)
          router.refresh();
        } else {
          console.error("Failed to set locale");
        }
      } catch (error) {
        console.error("Error setting locale:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [locale, router],
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, isLoading }}>
      {children}
    </LocaleContext.Provider>
  );
}

/**
 * Hook to use locale context
 */
export function useCookieLocale(): LocaleContextType {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error("useCookieLocale must be used within a LocaleProvider");
  }
  return context;
}

/**
 * Standalone function to switch locale without context
 * Useful for components that can't access context
 */
export async function switchLocale(locale: CookieLocale): Promise<boolean> {
  try {
    const response = await fetch("/api/locale", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ locale }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error switching locale:", error);
    return false;
  }
}
