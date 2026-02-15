/**
 * SSR-safe storage utilities for Zustand persist middleware
 *
 * Provides storage adapters that work safely during server-side rendering
 * and handle localStorage/sessionStorage access properly.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

/**
 * Check if we're running on the client side (browser)
 */
export const isClient = typeof window !== "undefined";

/**
 * Check if localStorage is available
 */
export const isLocalStorageAvailable =
  isClient && typeof localStorage !== "undefined";

/**
 * Check if sessionStorage is available
 */
export const isSessionStorageAvailable =
  isClient && typeof sessionStorage !== "undefined";

/**
 * Safe localStorage wrapper with SSR compatibility
 */
export class SafeLocalStorage {
  static getItem(key: string): string | null {
    if (!isLocalStorageAvailable) return null;

    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn("Failed to read from localStorage:", error);
      return null;
    }
  }

  static setItem(key: string, value: string): void {
    if (!isLocalStorageAvailable) return;

    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn("Failed to write to localStorage:", error);
    }
  }

  static removeItem(key: string): void {
    if (!isLocalStorageAvailable) return;

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn("Failed to remove from localStorage:", error);
    }
  }

  static clear(): void {
    if (!isLocalStorageAvailable) return;

    try {
      localStorage.clear();
    } catch (error) {
      console.warn("Failed to clear localStorage:", error);
    }
  }
}

/**
 * Safe sessionStorage wrapper with SSR compatibility
 */
export class SafeSessionStorage {
  static getItem(key: string): string | null {
    if (!isSessionStorageAvailable) return null;

    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.warn("Failed to read from sessionStorage:", error);
      return null;
    }
  }

  static setItem(key: string, value: string): void {
    if (!isSessionStorageAvailable) return;

    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.warn("Failed to write to sessionStorage:", error);
    }
  }

  static removeItem(key: string): void {
    if (!isSessionStorageAvailable) return;

    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn("Failed to remove from sessionStorage:", error);
    }
  }

  static clear(): void {
    if (!isSessionStorageAvailable) return;

    try {
      sessionStorage.clear();
    } catch (error) {
      console.warn("Failed to clear sessionStorage:", error);
    }
  }
}

/**
 * Zustand persist storage adapter for localStorage with SSR safety
 */
export const localStorageAdapter = {
  getItem: (key: string): string | null => {
    return SafeLocalStorage.getItem(key);
  },
  setItem: (key: string, value: string): void => {
    SafeLocalStorage.setItem(key, value);
  },
  removeItem: (key: string): void => {
    SafeLocalStorage.removeItem(key);
  },
};

/**
 * Zustand persist storage adapter for sessionStorage with SSR safety
 */
export const sessionStorageAdapter = {
  getItem: (key: string): string | null => {
    return SafeSessionStorage.getItem(key);
  },
  setItem: (key: string, value: string): void => {
    SafeSessionStorage.setItem(key, value);
  },
  removeItem: (key: string): void => {
    SafeSessionStorage.removeItem(key);
  },
};

/**
 * No-op storage adapter for SSR (returns null for all operations)
 * Useful for stores that should not persist during SSR
 */
export const noopStorage = {
  getItem: (): null => null,
  setItem: (): void => {},
  removeItem: (): void => {},
};

/**
 * Create a custom storage adapter with expiration support
 */
export interface StorageWithExpirationOptions {
  storage: typeof localStorageAdapter | typeof sessionStorageAdapter;
  expirationKey?: string;
  defaultExpirationMs?: number;
}

export function createStorageWithExpiration(
  options: StorageWithExpirationOptions,
) {
  const {
    storage,
    expirationKey = "expiresAt",
    defaultExpirationMs = 30 * 24 * 60 * 60 * 1000,
  } = options;

  return {
    getItem: (key: string): string | null => {
      const item = storage.getItem(key);
      if (!item) return null;

      try {
        const parsed = JSON.parse(item);

        // Check expiration if present
        if (
          parsed[expirationKey] &&
          new Date(parsed[expirationKey]) < new Date()
        ) {
          storage.removeItem(key);
          return null;
        }

        return JSON.stringify(parsed.data || parsed);
      } catch (error) {
        console.warn("Failed to parse stored item:", error);
        storage.removeItem(key);
        return null;
      }
    },

    setItem: (key: string, value: string): void => {
      try {
        const parsed = JSON.parse(value);
        const data = {
          data: parsed,
          [expirationKey]: new Date(
            Date.now() + defaultExpirationMs,
          ).toISOString(),
        };
        storage.setItem(key, JSON.stringify(data));
      } catch (error) {
        console.warn("Failed to store item with expiration:", error);
        storage.setItem(key, value);
      }
    },

    removeItem: (key: string): void => {
      storage.removeItem(key);
    },
  };
}

/**
 * Utility function to safely parse JSON with fallback
 */
export function safeJsonParse<T>(jsonString: string | null, fallback: T): T {
  if (!jsonString) return fallback;

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn("Failed to parse JSON:", error);
    return fallback;
  }
}

/**
 * Utility function to safely stringify JSON
 */
export function safeJsonStringify(value: any): string {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.warn("Failed to stringify value:", error);
    return "";
  }
}
