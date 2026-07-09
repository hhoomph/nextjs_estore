/**
 * Internationalized Toast Hook
 *
 * Provides toast notification helpers that use next-intl translations
 * for all user-facing messages, ensuring full i18n support.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

"use client";

import { useTranslations } from "next-intl";
import { toast } from "@/lib/hooks/use-toast";

export interface TranslatedToastOptions {
  /** Translation key for the toast title */
  titleKey: string;
  /** Optional translation key for the toast description */
  descriptionKey?: string;
  /** Optional values for interpolation in the description */
  descriptionValues?: Record<string, string | number>;
  /** Toast variant */
  variant?: "success" | "destructive" | "default";
}

/**
 * Hook that returns internationalized toast helpers.
 *
 * Uses the 'cart' namespace from next-intl messages by default.
 * Pass a custom namespace for use outside cart contexts.
 *
 * @param namespace - The i18n namespace to use (default: 'cart')
 * @returns Object with success and error toast methods
 *
 * @example
 * ```tsx
 * const toast = useTranslatedToast();
 * toast.success('addedToCart', { name: product.name });
 * ```
 */
export function useTranslatedToast(namespace = "cart") {
  const t = useTranslations(namespace as Parameters<typeof useTranslations>[0]);

  return {
    /**
     * Shows a success toast with translated title and optional description.
     */
    success: (
      titleKey: string,
      descriptionKey?: string,
      descriptionValues?: Record<string, string | number>,
    ) => {
      toast({
        title: t(titleKey),
        description: descriptionKey ? t(descriptionKey, descriptionValues) : undefined,
        variant: "success",
      });
    },

    /**
     * Shows an error/destructive toast with translated title and optional description.
     */
    error: (
      titleKey: string,
      descriptionKey?: string,
      descriptionValues?: Record<string, string | number>,
    ) => {
      toast({
        title: t(titleKey),
        description: descriptionKey ? t(descriptionKey, descriptionValues) : undefined,
        variant: "destructive",
      });
    },

    /**
     * Shows a default toast with translated title and optional description.
     */
    default: (
      titleKey: string,
      descriptionKey?: string,
      descriptionValues?: Record<string, string | number>,
    ) => {
      toast({
        title: t(titleKey),
        description: descriptionKey ? t(descriptionKey, descriptionValues) : undefined,
        variant: "default",
      });
    },

    /**
     * Shows a toast using explicit TranslatedToastOptions.
     */
    show: (options: TranslatedToastOptions) => {
      toast({
        title: t(options.titleKey),
        description: options.descriptionKey
          ? t(options.descriptionKey, options.descriptionValues)
          : undefined,
        variant: options.variant ?? "default",
      });
    },
  };
}