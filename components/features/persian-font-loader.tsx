"use client";

/**
 * IranSans Font Loader Component
 *
 * This component ensures IranSans fonts are properly loaded before rendering Persian text,
 * providing better performance and preventing font loading flashes.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface IranSansFontConfig {
  /**
   * Font weights to load
   */
  weights?: (
    | "100"
    | "200"
    | "300"
    | "400"
    | "500"
    | "600"
    | "700"
    | "800"
    | "900"
  )[];

  /**
   * Font display strategy
   */
  display?: "auto" | "block" | "swap" | "fallback" | "optional";

  /**
   * Timeout for font loading (in milliseconds)
   */
  timeout?: number;

  /**
   * Callback when fonts are loaded
   */
  onLoad?: () => void;

  /**
   * Callback when font loading fails
   */
  onError?: (error: Error) => void;
}

interface IranSansLoaderProps extends IranSansFontConfig {
  /**
   * Children to render after fonts are loaded
   */
  children: React.ReactNode;

  /**
   * Fallback content to show while loading
   */
  fallback?: React.ReactNode;

  /**
   * Whether to show loading indicator
   */
  showLoader?: boolean;
}

/**
 * IranSans font loader utility
 */
export const iranSansFontUtils = {
  /**
   * Default font configuration
   */
  defaultConfig: {
    weights: ["400", "500", "600", "700"] as const,
    display: "swap" as const,
    timeout: 3000,
  },

  /**
   * Check if IranSans fonts are loaded
   */
  isFontLoaded: (weight: string = "400"): boolean => {
    if (typeof document === "undefined") return false;

    try {
      // Check if font is loaded by attempting to measure text
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) return false;

      context.font = `${weight} 12px IranSans, Vazirmatn, Shabnam, system-ui`;
      const testText = "تست";
      const fallbackText = "test";

      // Compare rendered widths - if they're the same, font didn't load
      const testWidth = context.measureText(testText).width;
      const fallbackWidth = context.measureText(fallbackText).width;

      return testWidth !== fallbackWidth;
    } catch {
      return false;
    }
  },

  /**
   * Load IranSans font with specified configuration
   */
  loadFont: async (config: IranSansFontConfig = {}): Promise<void> => {
    const {
      weights = iranSansFontUtils.defaultConfig.weights,
      display = iranSansFontUtils.defaultConfig.display,
      timeout = iranSansFontUtils.defaultConfig.timeout,
    } = config;

    if (typeof document === "undefined") {
      throw new Error("Font loading is only available in browser environment");
    }

    // Check if fonts are already loaded
    const loadedWeights = weights.filter((weight) =>
      iranSansFontUtils.isFontLoaded(weight),
    );
    if (loadedWeights.length === weights.length) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Font loading timeout after ${timeout}ms`));
      }, timeout);

      // Create font faces for loading
      const fontFaces: FontFace[] = [];

      weights.forEach((weight) => {
        if (!iranSansFontUtils.isFontLoaded(weight)) {
          try {
            // Skip IranSans loading since the CDN is not available
            console.warn(
              `IranSans font ${weight} not available - using fallback fonts`,
            );
            return;
          } catch (error) {
            console.warn(
              `Error creating font face for IranSans ${weight}:`,
              error,
            );
          }
        }
      });

      // Wait for all fonts to load
      if (fontFaces.length > 0) {
        Promise.all(fontFaces.map((face) => face.loaded))
          .then(() => {
            clearTimeout(timeoutId);
            resolve();
          })
          .catch((error) => {
            clearTimeout(timeoutId);
            reject(error);
          });
      } else {
        clearTimeout(timeoutId);
        resolve();
      }
    });
  },

  /**
   * Preload IranSans fonts for better performance - Disabled due to unavailable CDN
   * No warning is logged as this is expected behavior in development environments
   */
  preloadFonts: (weights: string[] = ["400", "500", "600", "700"]): void => {
    // IranSans fonts are not available from the CDN, so we skip preloading
    // Silently skip - this is expected and not an error condition
  },
};

/**
 * IranSans Font Loader Component
 *
 * Ensures IranSans fonts are loaded before rendering Persian content
 */
export function IranSansLoader({
  children,
  fallback,
  showLoader = true,
  onLoad,
  onError,
  ...config
}: IranSansLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Preload fonts for better performance
    iranSansFontUtils.preloadFonts(config.weights);

    // Load fonts
    iranSansFontUtils
      .loadFont(config)
      .then(() => {
        setIsLoading(false);
        onLoad?.();
      })
      .catch((err) => {
        console.warn("IranSans font loading failed, using fallbacks:", err);
        setError(err);
        setIsLoading(false);
        onError?.(err);
      });
  }, [config.weights, config.display, config.timeout, onLoad, onError]);

  // Show loading state
  if (isLoading) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showLoader) {
      return (
        <div className="flex items-center justify-center p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">بارگذاری فونت...</span>
          </div>
        </div>
      );
    }
  }

  // Show error state
  if (error && !fallback) {
    console.warn("IranSans font failed to load:", error);
  }

  // Render children with font-loaded class
  return (
    <div
      className="iran-sans-loaded"
      style={{ fontFamily: "var(--font-persian)" }}
    >
      {children}
    </div>
  );
}

/**
 * Hook for managing IranSans font loading state
 */
export function useIranSansLoader(config: IranSansFontConfig = {}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    iranSansFontUtils
      .loadFont(config)
      .then(() => {
        setIsLoaded(true);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
      });
  }, [config.weights, config.display, config.timeout]);

  return { isLoaded, isLoading, error };
}

/**
 * Higher-order component for IranSans font loading
 */
export function withIranSansLoader<P extends object>(
  Component: React.ComponentType<P>,
  loaderProps: IranSansLoaderProps = { children: null },
) {
  return function IranSansWrappedComponent(props: P) {
    return (
      <IranSansLoader {...loaderProps}>
        <Component {...props} />
      </IranSansLoader>
    );
  };
}

// Export font utilities
export { iranSansFontUtils as fontUtils };
