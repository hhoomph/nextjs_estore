/**
 * Theme Test Utilities
 *
 * Test utilities for theme management that include Vitest imports.
 * This file is only loaded during testing, not in production builds.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import { vi } from "vitest";

/**
 * Theme utilities for testing
 */
export const themeTestUtils = {
  /**
   * Mock theme in tests
   */
  mockTheme: (theme: "light" | "dark" | "system" = "light") => {
    // Mock localStorage
    const mockStorage = {
      getItem: vi.fn(() => theme),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

    Object.defineProperty(window, "localStorage", {
      value: mockStorage,
      writable: true,
    });

    // Mock matchMedia
    Object.defineProperty(window, "matchMedia", {
      value: vi.fn().mockImplementation(() => ({
        matches: theme === "system" ? false : theme === "dark",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
      writable: true,
    });

    return mockStorage;
  },

  /**
   * Reset theme mocks
   */
  resetThemeMocks: () => {
    // Reset document classes
    document.documentElement.className = "";
  },
};
