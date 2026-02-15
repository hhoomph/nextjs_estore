/**
 * Test Setup Utilities
 *
 * Provides utilities and mocks for testing components and functions.
 * Includes database mocking, theme provider mocks, and common test helpers.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import type { RenderOptions } from "@testing-library/react";
import React from "react";
import { vi } from "vitest";

// Mock implementations for common dependencies

/**
 * Mock theme provider for tests
 */
export function mockThemeProvider() {
  return {
    theme: "light",
    setTheme: vi.fn(),
    themes: ["light", "dark", "system"],
    systemTheme: "light",
    resolvedTheme: "light",
  };
}

/**
 * Test database setup utility
 */
export async function setupTestDatabase() {
  // Mock Prisma client for tests
  const mockPrisma = {
    user: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 1, email: "test@example.com" }),
      update: vi.fn().mockResolvedValue({ id: 1, email: "test@example.com" }),
      delete: vi.fn().mockResolvedValue({ id: 1 }),
    },
    product: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 1, name: "Test Product" }),
      update: vi.fn().mockResolvedValue({ id: 1, name: "Test Product" }),
      delete: vi.fn().mockResolvedValue({ id: 1 }),
    },
    $disconnect: vi.fn(),
  };

  return mockPrisma;
}

/**
 * Custom render function with basic wrapper
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options: RenderOptions = {},
) {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(
      "div",
      { "data-testid": "test-wrapper" },
      children,
    );
  };

  // Use a globally-registered render function if tests lazy-loaded RTL.
  const globalRender = (globalThis as any).__RTL_RENDER__ as
    | ((ui: React.ReactElement, opts?: RenderOptions) => any)
    | undefined;

  if (!globalRender) {
    throw new Error(
      "Testing Library render is not available. Ensure you import '@testing-library/react' in your test (lazy-load it) and assign render to globalThis.__RTL_RENDER__ before calling renderWithProviders.",
    );
  }

  return globalRender(ui, { wrapper: AllTheProviders, ...options });
}

/**
 * Mock Next.js router
 */
export function mockNextRouter() {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    pathname: "/",
    query: {},
    asPath: "/",
    locale: "en",
    locales: ["en", "fa"],
    defaultLocale: "en",
    domainLocales: [],
    isReady: true,
    isLocaleDomain: false,
    isPreview: false,
    basePath: "",
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
  };
}

/**
 * Mock NextIntl translations
 */
export function mockTranslations() {
  return {
    t: vi.fn((key: string) => key),
    useTranslations: vi.fn(() => (key: string) => key),
  };
}

/**
 * Mock auth client
 */
export function mockAuthClient() {
  return {
    useSession: vi.fn(() => ({
      data: null,
      isPending: false,
      error: null,
    })),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn().mockResolvedValue(null),
  };
}

/**
 * Mock cart store
 */
export function mockCartStore() {
  return {
    items: [],
    total: 0,
    itemCount: 0,
    addItem: vi.fn(),
    removeItem: vi.fn(),
    updateQuantity: vi.fn(),
    clearCart: vi.fn(),
  };
}

/**
 * Mock wishlist store
 */
export function mockWishlistStore() {
  return {
    items: [],
    addItem: vi.fn(),
    removeItem: vi.fn(),
    isInWishlist: vi.fn(() => false),
    getItemCount: vi.fn(() => 0),
    clearWishlist: vi.fn(),
  };
}

/**
 * Create test user data
 */
export function createTestUser(overrides = {}) {
  return {
    id: "user-1",
    email: "test@example.com",
    name: "Test User",
    image: null,
    role: "USER",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    ...overrides,
  };
}

/**
 * Create test product data
 */
export function createTestProduct(overrides = {}) {
  return {
    id: "product-1",
    name: "Test Product",
    description: "A test product description",
    price: 99.99,
    imageUrl: "/test-image.jpg",
    category: "test-category",
    inStock: true,
    stockQuantity: 10,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    ...overrides,
  };
}

/**
 * Test wrapper for components requiring authentication
 */
export function withAuth<P extends Record<string, unknown>>(
  Component: React.ComponentType<P>,
  user = createTestUser(),
) {
  return function AuthenticatedComponent(props: P) {
    // Mock authenticated context - create wrapper component
    const WrappedComponent = () =>
      React.createElement(Component, {
        ...props,
        user,
        isAuthenticated: true,
      } as P & { user: typeof user; isAuthenticated: boolean });

    return React.createElement(WrappedComponent);
  };
}

/**
 * Test wrapper for components requiring specific locale
 */
export function withLocale<P extends Record<string, unknown>>(
  Component: React.ComponentType<P>,
  locale = "en",
) {
  return function LocalizedComponent(props: P) {
    // Create wrapper component with locale
    const WrappedComponent = () =>
      React.createElement(Component, {
        ...props,
        locale,
      } as P & { locale: string });

    return React.createElement(WrappedComponent);
  };
}

/**
 * Wait for component to finish loading
 */
export function waitForComponent() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Mock fetch for API calls
 */
export function mockFetch(response: unknown = {}, status = 200) {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    } as Response),
  );
}

/**
 * Reset all mocks
 */
export function resetAllMocks() {
  vi.clearAllMocks();
  vi.resetAllMocks();
}

/**
 * Test environment setup
 */
export async function setupTestEnvironment() {
  // Mock environment variables
  process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";

  // Mock browser APIs
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock localStorage
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    },
  });

  return {
    prisma: await setupTestDatabase(),
    router: mockNextRouter(),
    translations: mockTranslations(),
    auth: mockAuthClient(),
    cart: mockCartStore(),
    wishlist: mockWishlistStore(),
  };
}
