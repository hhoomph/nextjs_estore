/**
 * Global Cursor Enhancement Component
 *
 * Automatically enhances cursor behavior for all interactive elements
 * throughout the application, ensuring consistent pointer cursors on hover.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

"use client";

import React, { useEffect, useRef } from "react";
import { cursorEnhancementUtils } from "@/lib/animations/navbar-animations";

interface CursorEnhancerProps {
  children: React.ReactNode;
  enableGlobalEnhancement?: boolean;
  customSelectors?: string[];
}

export function CursorEnhancer({
  children,
  enableGlobalEnhancement = true,
  customSelectors = [],
}: CursorEnhancerProps) {
  const cleanupRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    if (!enableGlobalEnhancement) return;

    const defaultSelectors = [
      "button:not([disabled])",
      "a[href]",
      '[role="button"]:not([aria-disabled="true"])',
      '[role="link"]',
      'input[type="submit"]',
      'input[type="button"]',
      '[tabindex]:not([tabindex="-1"])',
      ".cursor-pointer",
      ".interactive",
      ".clickable",
    ];

    const allSelectors = [...defaultSelectors, ...customSelectors];

    const enhanceElements = () => {
      allSelectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          if (element instanceof HTMLElement) {
            const cleanup =
              cursorEnhancementUtils.createHoverCursorEffect(element);
            if (cleanup) {
              cleanupRef.current.push(cleanup);
            }
          }
        });
      });
    };

    // Initial enhancement
    enhanceElements();

    // Observer for dynamically added elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;

            // Check if the added element matches our selectors
            allSelectors.forEach((selector) => {
              if (element.matches && element.matches(selector)) {
                const cleanup = cursorEnhancementUtils.createHoverCursorEffect(
                  element as HTMLElement,
                );
                if (cleanup) {
                  cleanupRef.current.push(cleanup);
                }
              }

              // Also check child elements
              const childElements = element.querySelectorAll(selector);
              childElements.forEach((child) => {
                const cleanup = cursorEnhancementUtils.createHoverCursorEffect(
                  child as HTMLElement,
                );
                if (cleanup) {
                  cleanupRef.current.push(cleanup);
                }
              });
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      cleanupRef.current.forEach((cleanup) => cleanup());
      cleanupRef.current = [];
    };
  }, [enableGlobalEnhancement, customSelectors]);

  return <>{children}</>;
}

// Hook for manual cursor enhancement
export function useCursorEnhancement() {
  const enhanceElement = React.useCallback(
    (element: HTMLElement, cursorType: string = "pointer") => {
      return cursorEnhancementUtils.enhanceCursorOnHover(element, cursorType);
    },
    [],
  );

  const enhanceOnHover = React.useCallback((element: HTMLElement) => {
    return cursorEnhancementUtils.createHoverCursorEffect(element);
  }, []);

  return {
    enhanceElement,
    enhanceOnHover,
  };
}

// Utility component for specific cursor enhancement
export function EnhancedInteractive({
  children,
  cursorType = "pointer",
  className,
  ...props
}: {
  children: React.ReactNode;
  cursorType?: string;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      cursorEnhancementUtils.enhanceCursorOnHover(
        elementRef.current,
        cursorType,
      );
    }
  }, [cursorType]);

  return (
    <div
      ref={elementRef}
      className={className}
      style={{ cursor: cursorType }}
      {...props}
    >
      {children}
    </div>
  );
}
