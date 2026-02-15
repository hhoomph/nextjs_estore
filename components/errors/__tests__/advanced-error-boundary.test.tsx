/**
 * @vitest-environment jsdom
 * Advanced Error Boundary Component Tests
 *
 * Comprehensive tests for the AdvancedErrorBoundary component
 * including error catching, recovery, and reporting functionality.
 */

import type * as RTL from "@testing-library/react";
import React from "react";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

// Lazy-load Testing Library to ensure jsdom is initialized first
let render: typeof RTL.render;
let screen: typeof RTL.screen;
let fireEvent: typeof RTL.fireEvent;
let waitFor: typeof RTL.waitFor;

import { AdvancedErrorBoundary } from "../advanced-error-boundary";

// Mock console methods
const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

// Mock fetch for error reporting
global.fetch = vi.fn();

// Component that throws an error
function ErrorThrowingComponent() {
  React.useEffect(() => {
    throw new Error("Test error");
  }, []);

  return <div>Should not render</div>;
}

// Component that renders normally
function NormalComponent() {
  return <div>Normal component</div>;
}

describe("AdvancedErrorBoundary", () => {
  beforeAll(async () => {
    const rtl = await import("@testing-library/react");
    render = rtl.render;
    screen = rtl.screen;
    fireEvent = rtl.fireEvent;
    waitFor = rtl.waitFor;

    // Expose render globally for helper utilities that rely on it
    (
      globalThis as {
        __RTL_RENDER__?: typeof rtl.render;
        __RTL_SCREEN__?: typeof rtl.screen;
        __RTL_FIRE_EVENT__?: typeof rtl.fireEvent;
        __RTL_WAIT_FOR__?: typeof rtl.waitFor;
      }
    ).__RTL_RENDER__ = rtl.render;
    (
      globalThis as {
        __RTL_RENDER__?: typeof rtl.render;
        __RTL_SCREEN__?: typeof rtl.screen;
        __RTL_FIRE_EVENT__?: typeof rtl.fireEvent;
        __RTL_WAIT_FOR__?: typeof rtl.waitFor;
      }
    ).__RTL_SCREEN__ = rtl.screen;
    (
      globalThis as {
        __RTL_RENDER__?: typeof rtl.render;
        __RTL_SCREEN__?: typeof rtl.screen;
        __RTL_FIRE_EVENT__?: typeof rtl.fireEvent;
        __RTL_WAIT_FOR__?: typeof rtl.waitFor;
      }
    ).__RTL_FIRE_EVENT__ = rtl.fireEvent;
    (
      globalThis as {
        __RTL_RENDER__?: typeof rtl.render;
        __RTL_SCREEN__?: typeof rtl.screen;
        __RTL_FIRE_EVENT__?: typeof rtl.fireEvent;
        __RTL_WAIT_FOR__?: typeof rtl.waitFor;
      }
    ).__RTL_WAIT_FOR__ = rtl.waitFor;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockClear();
    consoleLogSpy.mockClear();
  });

  it("renders children normally when no error occurs", () => {
    render(
      <AdvancedErrorBoundary>
        <NormalComponent />
      </AdvancedErrorBoundary>,
    );

    expect(screen.getByText("Normal component")).toBeInTheDocument();
  });

  it("catches and displays error when child component throws", () => {
    render(
      <AdvancedErrorBoundary>
        <ErrorThrowingComponent />
      </AdvancedErrorBoundary>,
    );

    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("displays custom fallback UI when provided", () => {
    const fallback = <div>Custom error message</div>;

    render(
      <AdvancedErrorBoundary fallback={fallback}>
        <ErrorThrowingComponent />
      </AdvancedErrorBoundary>,
    );

    expect(screen.getByText("Custom error message")).toBeInTheDocument();
  });

  it("calls onError callback when error occurs", () => {
    const onError = vi.fn();

    render(
      <AdvancedErrorBoundary onError={onError}>
        <ErrorThrowingComponent />
      </AdvancedErrorBoundary>,
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      }),
    );
  });

  it("reports error when enableReporting is true", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    render(
      <AdvancedErrorBoundary enableReporting={true}>
        <ErrorThrowingComponent />
      </AdvancedErrorBoundary>,
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/errors",
        expect.any(Object),
      );
    });
  });

  it("handles retry functionality", async () => {
    let shouldThrowOnce = true;

    function RetryTestComponent() {
      if (shouldThrowOnce) {
        // ensure we only throw once across renders
        shouldThrowOnce = false;
        throw new Error("Retry test error");
      }
      return <div>Recovered component</div>;
    }

    render(
      <AdvancedErrorBoundary>
        <RetryTestComponent />
      </AdvancedErrorBoundary>,
    );

    // The error UI may appear or the component may already be recovered
    // Wait for either the recovered content OR the retry button, and if
    // the button exists click it to trigger recovery.
    await waitFor(() => {
      const recovered = screen.queryByText("Recovered component");
      if (recovered) return true;

      const btn = screen.queryByRole("button", { name: /try again/i });
      if (btn) {
        fireEvent.click(btn);
        return true;
      }
      throw new Error("Waiting for recovery or retry button");
    });

    // Ensure recovered content is visible
    await screen.findByText("Recovered component");
  });

  it("respects retry limits", async () => {
    render(
      <AdvancedErrorBoundary>
        <ErrorThrowingComponent />
      </AdvancedErrorBoundary>,
    );

    // Click retry button multiple times
    // Click retry button multiple times and wait for the counter to update
    const retryButton = await screen.findByRole("button", {
      name: /try again/i,
    });

    // First click -> should advance to (1/3)
    fireEvent.click(retryButton);
    await waitFor(async () => {
      const btn = await screen.findByRole("button", { name: /try again/i });
      expect(btn.textContent).toMatch(/\(1\/3\)/);
    });

    // Second click -> should advance to (2/3)
    const retryButton2 = await screen.findByRole("button", {
      name: /try again/i,
    });
    fireEvent.click(retryButton2);
    await waitFor(async () => {
      const btn = await screen.findByRole("button", { name: /try again/i });
      expect(btn.textContent).toMatch(/\(2\/3\)/);
    });

    // Third click -> should advance to (3/3)
    const retryButton3 = await screen.findByRole("button", {
      name: /try again/i,
    });
    fireEvent.click(retryButton3);
    await waitFor(async () => {
      const btn = await screen.findByRole("button", { name: /try again/i });
      expect(btn.textContent).toMatch(/\(3\/3\)/);
    });
  });

  it("handles go home functionality", () => {
    // Mock window.location
    const mockLocation = { href: "" };
    Object.defineProperty(window, "location", {
      value: mockLocation,
      writable: true,
    });

    render(
      <AdvancedErrorBoundary>
        <ErrorThrowingComponent />
      </AdvancedErrorBoundary>,
    );

    const homeButton = screen.getByRole("button", { name: /go home/i });
    fireEvent.click(homeButton);

    expect(mockLocation.href).toBe("/");
  });

  it("displays error details in development mode", async () => {
    // Set NODE_ENV to development
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    render(
      <AdvancedErrorBoundary showErrorDetails={true}>
        <ErrorThrowingComponent />
      </AdvancedErrorBoundary>,
    );

    // Open details and assert error message
    const detailsBtn = screen.getByRole("button", { name: /error details/i });
    fireEvent.click(detailsBtn);
    // Development mode shows error details — there may be multiple matching nodes,
    // so assert at least one occurrence is present.
    await waitFor(() => {
      const matches = screen.getAllByText(/Test error/i);
      expect(matches.length).toBeGreaterThan(0);
    });

    // Restore original environment
    process.env.NODE_ENV = originalEnv;
  });

  it("hides error details in production mode", () => {
    // Set NODE_ENV to production
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    render(
      <AdvancedErrorBoundary showDetails={true}>
        <ErrorThrowingComponent />
      </AdvancedErrorBoundary>,
    );

    expect(screen.queryByText(/Error Details/)).not.toBeInTheDocument();

    // Restore original environment
    process.env.NODE_ENV = originalEnv;
  });

  it("handles component unmounting correctly", () => {
    const { unmount } = render(
      <AdvancedErrorBoundary>
        <NormalComponent />
      </AdvancedErrorBoundary>,
    );

    expect(() => unmount()).not.toThrow();
  });

  it("maintains error state across re-renders", () => {
    const { rerender } = render(
      <AdvancedErrorBoundary>
        <ErrorThrowingComponent />
      </AdvancedErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // Re-render with same error
    rerender(
      <AdvancedErrorBoundary>
        <ErrorThrowingComponent />
      </AdvancedErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });
});
