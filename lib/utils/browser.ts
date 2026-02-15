/**
 * Module for browser
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

/**
 * SSR-safe browser API utilities
 * Provides safe access to browser APIs that may not be available during SSR
 */

// Window API checks
export const isWindowDefined = typeof window !== "undefined";

// Local storage with SSR safety
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (!isWindowDefined) return null;
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      console.warn("localStorage access failed:", error);
      return null;
    }
  },

  setItem: (key: string, value: string): void => {
    if (!isWindowDefined) return;
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      console.warn("localStorage access failed:", error);
    }
  },

  removeItem: (key: string): void => {
    if (!isWindowDefined) return;
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn("localStorage access failed:", error);
    }
  },

  clear: (): void => {
    if (!isWindowDefined) return;
    try {
      window.localStorage.clear();
    } catch (error) {
      console.warn("localStorage access failed:", error);
    }
  },
};

// Session storage with SSR safety
export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    if (!isWindowDefined) return null;
    try {
      return window.sessionStorage.getItem(key);
    } catch (error) {
      console.warn("sessionStorage access failed:", error);
      return null;
    }
  },

  setItem: (key: string, value: string): void => {
    if (!isWindowDefined) return;
    try {
      window.sessionStorage.setItem(key, value);
    } catch (error) {
      console.warn("sessionStorage access failed:", error);
    }
  },

  removeItem: (key: string): void => {
    if (!isWindowDefined) return;
    try {
      window.sessionStorage.removeItem(key);
    } catch (error) {
      console.warn("sessionStorage access failed:", error);
    }
  },

  clear: (): void => {
    if (!isWindowDefined) return;
    try {
      window.sessionStorage.clear();
    } catch (error) {
      console.warn("sessionStorage access failed:", error);
    }
  },
};

// Match media with SSR safety
export const safeMatchMedia = (query: string): MediaQueryList => {
  if (!isWindowDefined) {
    // Return a mock MediaQueryList for SSR
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    } as MediaQueryList;
  }

  return window.matchMedia(query);
};

// Navigator API with SSR safety
export const safeNavigator = isWindowDefined
  ? window.navigator
  : {
      userAgent: "",
      language: "en",
      languages: ["en"],
      platform: "",
      cookieEnabled: false,
      onLine: true,
    };

// Location API with SSR safety
export const safeLocation = isWindowDefined
  ? window.location
  : ({
      href: "",
      origin: "",
      protocol: "",
      host: "",
      hostname: "",
      port: "",
      pathname: "",
      search: "",
      hash: "",
    } as Location);

// History API with SSR safety
export const safeHistory = isWindowDefined
  ? window.history
  : ({
      length: 0,
      scrollRestoration: "auto" as ScrollRestoration,
      state: null,
      back: () => {},
      forward: () => {},
      go: () => {},
      pushState: () => {},
      replaceState: () => {},
    } as History);

// Screen API with SSR safety
export const safeScreen = isWindowDefined
  ? window.screen
  : ({
      width: 1920,
      height: 1080,
      availWidth: 1920,
      availHeight: 1040,
      colorDepth: 24,
      pixelDepth: 24,
    } as Screen);

// Performance API with SSR safety
export const safePerformance = isWindowDefined
  ? window.performance
  : ({
      now: () => Date.now(),
      mark: () => {},
      measure: () => {},
      getEntriesByName: () => [],
      getEntriesByType: () => [],
      clearMarks: () => {},
      clearMeasures: () => {},
    } as unknown as Performance);

// RequestAnimationFrame with SSR safety
export const safeRequestAnimationFrame = (
  callback: FrameRequestCallback,
): number => {
  if (!isWindowDefined) return 0;
  return window.requestAnimationFrame(callback);
};

// CancelAnimationFrame with SSR safety
export const safeCancelAnimationFrame = (id: number): void => {
  if (!isWindowDefined) return;
  window.cancelAnimationFrame(id);
};

// ResizeObserver with SSR safety
export const safeResizeObserver = isWindowDefined
  ? window.ResizeObserver
  : class MockResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };

// IntersectionObserver with SSR safety
export const safeIntersectionObserver = isWindowDefined
  ? window.IntersectionObserver
  : class MockIntersectionObserver {
      constructor() {}
      observe() {}
      unobserve() {}
      disconnect() {}
      root = null;
      rootMargin = "";
      thresholds = [];
    };

// MutationObserver with SSR safety
export const safeMutationObserver = isWindowDefined
  ? window.MutationObserver
  : class MockMutationObserver {
      constructor() {}
      observe() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    };

// Geolocation API with SSR safety
export const safeGeolocation = isWindowDefined
  ? window.navigator.geolocation
  : ({
      getCurrentPosition: () => {},
      watchPosition: () => 0,
      clearWatch: () => {},
    } as Geolocation);

// Clipboard API with SSR safety
export const safeClipboard = isWindowDefined
  ? window.navigator.clipboard
  : ({
      readText: async () => "",
      writeText: async () => {},
      read: async () => [],
      write: async () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    } as Clipboard);

// Permissions API with SSR safety
export const safePermissions = isWindowDefined
  ? window.navigator.permissions
  : ({
      query: async () => ({ state: "granted" }) as PermissionStatus,
    } as Permissions);

// WakeLock API with SSR safety
export const safeWakeLock = isWindowDefined
  ? window.navigator.wakeLock
  : ({
      request: async () =>
        ({
          released: false,
          type: "screen",
          onrelease: null,
          release: async () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }) as WakeLockSentinel,
    } as WakeLock);
