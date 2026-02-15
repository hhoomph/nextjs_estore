/**
 * Accessibility Utilities for Enhanced User Experience
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

/**
 * Generate accessible labels for form inputs
 */
export function generateAccessibleLabels(
  inputName: string,
  required?: boolean,
) {
  const baseLabel = inputName.charAt(0).toUpperCase() + inputName.slice(1);
  const requiredText = required ? " (required)" : "";

  return {
    label: `${baseLabel}${requiredText}`,
    ariaLabel: `${baseLabel} input field${requiredText}`,
    placeholder: `Enter your ${inputName.toLowerCase()}`,
    errorId: `${inputName}-error`,
    helpId: `${inputName}-help`,
  };
}

/**
 * Generate ARIA attributes for interactive elements
 */
export function generateAriaAttributes(options: {
  expanded?: boolean;
  controls?: string;
  labelledBy?: string;
  describedBy?: string;
  current?: "page" | "step" | "location" | "date" | "time" | true | false;
  selected?: boolean;
  pressed?: boolean;
  checked?: boolean | "mixed";
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  live?: "off" | "assertive" | "polite";
  atomic?: boolean;
  relevant?: string;
}) {
  const attributes: Record<string, any> = {};

  if (options.expanded !== undefined) {
    attributes["aria-expanded"] = options.expanded;
  }

  if (options.controls) {
    attributes["aria-controls"] = options.controls;
  }

  if (options.labelledBy) {
    attributes["aria-labelledby"] = options.labelledBy;
  }

  if (options.describedBy) {
    attributes["aria-describedby"] = options.describedBy;
  }

  if (options.current !== undefined) {
    attributes["aria-current"] = options.current;
  }

  if (options.selected !== undefined) {
    attributes["aria-selected"] = options.selected;
  }

  if (options.pressed !== undefined) {
    attributes["aria-pressed"] = options.pressed;
  }

  if (options.checked !== undefined) {
    attributes["aria-checked"] = options.checked;
  }

  if (options.disabled !== undefined) {
    attributes["aria-disabled"] = options.disabled;
  }

  if (options.required !== undefined) {
    attributes["aria-required"] = options.required;
  }

  if (options.invalid !== undefined) {
    attributes["aria-invalid"] = options.invalid;
  }

  if (options.live) {
    attributes["aria-live"] = options.live;
  }

  if (options.atomic !== undefined) {
    attributes["aria-atomic"] = options.atomic;
  }

  if (options.relevant) {
    attributes["aria-relevant"] = options.relevant;
  }

  return attributes;
}

/**
 * Generate accessible navigation attributes
 */
export function generateNavigationAttributes(
  currentPath: string,
  navigationItems: Array<{ path: string; label: string }>,
) {
  return navigationItems.map((item) => ({
    ...item,
    ariaCurrent: item.path === currentPath ? "page" : undefined,
    tabIndex: item.path === currentPath ? 0 : -1,
  }));
}

/**
 * Generate focus management utilities
 */
export class FocusManager {
  private focusStack: HTMLElement[] = [];

  /**
   * Trap focus within a container element
   */
  trapFocus(container: HTMLElement): () => void {
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }

      if (e.key === "Escape") {
        this.releaseFocus();
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  }

  /**
   * Release focus trap
   */
  releaseFocus(): void {
    // Return focus to the previously focused element
    if (this.focusStack.length > 0) {
      const previousElement = this.focusStack.pop();
      previousElement?.focus();
    }
  }

  /**
   * Save current focus and move to new element
   */
  saveAndFocus(element: HTMLElement): void {
    const currentFocused = document.activeElement as HTMLElement;
    if (currentFocused && currentFocused !== document.body) {
      this.focusStack.push(currentFocused);
    }
    element.focus();
  }

  /**
   * Get all focusable elements within a container
   */
  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const selectors = [
      "a[href]",
      "button:not([disabled])",
      "textarea:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ];

    return Array.from(container.querySelectorAll(selectors.join(","))).filter(
      (element) => {
        const htmlElement = element as HTMLElement;
        return (
          htmlElement.offsetWidth > 0 &&
          htmlElement.offsetHeight > 0 &&
          !htmlElement.hasAttribute("inert")
        );
      },
    ) as HTMLElement[];
  }
}

/**
 * Screen reader announcements
 */
export class ScreenReaderAnnouncer {
  private static announcer: HTMLElement | null = null;

  private static getAnnouncer(): HTMLElement {
    if (!ScreenReaderAnnouncer.announcer) {
      ScreenReaderAnnouncer.announcer = document.createElement("div");
      ScreenReaderAnnouncer.announcer.setAttribute("aria-live", "polite");
      ScreenReaderAnnouncer.announcer.setAttribute("aria-atomic", "true");
      ScreenReaderAnnouncer.announcer.style.position = "absolute";
      ScreenReaderAnnouncer.announcer.style.left = "-10000px";
      ScreenReaderAnnouncer.announcer.style.width = "1px";
      ScreenReaderAnnouncer.announcer.style.height = "1px";
      ScreenReaderAnnouncer.announcer.style.overflow = "hidden";
      document.body.appendChild(ScreenReaderAnnouncer.announcer);
    }
    return ScreenReaderAnnouncer.announcer;
  }

  static announce(
    message: string,
    priority: "polite" | "assertive" = "polite",
  ): void {
    const announcer = ScreenReaderAnnouncer.getAnnouncer();
    announcer.setAttribute("aria-live", priority);
    announcer.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      announcer.textContent = "";
    }, 1000);
  }

  static announceError(message: string): void {
    ScreenReaderAnnouncer.announce(message, "assertive");
  }

  static announceSuccess(message: string): void {
    ScreenReaderAnnouncer.announce(message, "polite");
  }
}

/**
 * Skip link management
 */
export function createSkipLinks(
  links: Array<{ id: string; label: string; target: string }>,
): void {
  const skipLinksContainer = document.createElement("div");
  skipLinksContainer.className = "skip-links";
  skipLinksContainer.style.cssText = `
    position: absolute;
    top: -40px;
    left: 6px;
    z-index: 1000;
  `;

  links.forEach((link) => {
    const anchor = document.createElement("a");
    anchor.href = `#${link.target}`;
    anchor.textContent = link.label;
    anchor.className = "skip-link";
    anchor.style.cssText = `
      display: inline-block;
      padding: 8px 16px;
      background: #000;
      color: #fff;
      text-decoration: none;
      border-radius: 4px;
      margin-right: 8px;
      font-weight: bold;
    `;

    anchor.addEventListener("focus", () => {
      skipLinksContainer.style.top = "6px";
    });

    anchor.addEventListener("blur", () => {
      skipLinksContainer.style.top = "-40px";
    });

    skipLinksContainer.appendChild(anchor);
  });

  document.body.insertBefore(skipLinksContainer, document.body.firstChild);
}

/**
 * High contrast mode detection
 */
export function detectHighContrastMode(): boolean {
  // Create a test element to detect high contrast mode
  const testElement = document.createElement("div");
  testElement.style.cssText = `
    position: absolute;
    left: -9999px;
    background-color: rgb(31, 41, 55);
    color: rgb(255, 255, 255);
  `;
  testElement.textContent = "test";
  document.body.appendChild(testElement);

  const computedStyle = window.getComputedStyle(testElement);
  const backgroundColor = computedStyle.backgroundColor;
  const color = computedStyle.color;

  document.body.removeChild(testElement);

  // If colors are overridden (typical in high contrast mode), return true
  return backgroundColor === color;
}

/**
 * Reduced motion preference detection
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Color contrast utilities
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  // Simple contrast calculation - in production, use a proper color library
  const getLuminance = (color: string): number => {
    // Convert hex to RGB and calculate relative luminance
    // This is a simplified implementation
    if (color.startsWith("#")) {
      const r = parseInt(color.slice(1, 3), 16) / 255;
      const g = parseInt(color.slice(3, 5), 16) / 255;
      const b = parseInt(color.slice(5, 7), 16) / 255;

      const [rs, gs, bs] = [r, g, b].map((c) =>
        c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
      );

      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }
    return 0;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * WCAG compliance checker
 */
export function checkWCAGCompliance(
  foregroundColor: string,
  backgroundColor: string,
  level: "AA" | "AAA" = "AA",
  size: "normal" | "large" = "normal",
): { compliant: boolean; ratio: number; requiredRatio: number } {
  const ratio = calculateContrastRatio(foregroundColor, backgroundColor);
  const isLargeText = size === "large";

  let requiredRatio: number;
  if (level === "AA") {
    requiredRatio = isLargeText ? 3.0 : 4.5;
  } else {
    requiredRatio = isLargeText ? 4.5 : 7.0;
  }

  return {
    compliant: ratio >= requiredRatio,
    ratio: Math.round(ratio * 100) / 100,
    requiredRatio,
  };
}
