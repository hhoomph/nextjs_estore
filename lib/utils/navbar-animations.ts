/**
 * Utility functions for navbar animations and transitions
 *
 * This module provides utility functions for creating smooth navbar transitions,
 * managing animation states, and handling performance optimizations.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import type { AnimationConfig } from "@/lib/hooks/use-navbar-animations";

// Animation presets for common navbar interactions
export const navbarAnimationPresets = {
  // Hover animations
  buttonHover: {
    scale: 1.05,
    duration: 200,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  },

  iconHover: {
    rotate: 5,
    scale: 1.1,
    duration: 150,
    easing: "ease-out",
  },

  // Focus animations
  focusRing: {
    ringWidth: 2,
    ringColor: "rgb(59, 130, 246)", // blue-500
    ringOpacity: 0.5,
    duration: 150,
  },

  // Active/press animations
  buttonPress: {
    scale: 0.95,
    duration: 100,
    easing: "ease-out",
  },

  // Transition animations
  slideInFromTop: {
    from: { y: -20, opacity: 0 },
    to: { y: 0, opacity: 1 },
    duration: 300,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  },

  slideInFromBottom: {
    from: { y: 20, opacity: 0 },
    to: { y: 0, opacity: 1 },
    duration: 300,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  },

  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: 200,
    easing: "ease-out",
  },

  // Loading animations
  pulse: {
    opacity: [1, 0.5, 1],
    duration: 1500,
    repeat: "infinite",
  },

  // Notification animations
  bounceIn: {
    scale: [0.3, 1.05, 0.9, 1],
    duration: 500,
    easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },
};

// Create transition utility
export function createNavbarTransition(
  from: Record<string, any>,
  to: Record<string, any>,
  config: AnimationConfig = {},
): string {
  const { duration = 300, easing = "ease-out", delay = 0 } = config;

  const fromProps = Object.entries(from)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");

  const toProps = Object.entries(to)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");

  return `transition: all ${duration}ms ${easing} ${delay}ms;`;
}

// Performance optimization utilities
export const navbarPerformanceUtils = {
  // Debounce function for animation triggers
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number,
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function for frequent updates
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number,
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Check if animations should be reduced (prefers-reduced-motion)
  shouldReduceMotion: (): boolean => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  },

  // Check device performance for animation adjustments
  getDevicePerformance: (): "low" | "medium" | "high" => {
    if (typeof window === "undefined") return "high";

    // Simple performance check based on device memory and hardware concurrency
    const memory = (navigator as any).deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;

    if (memory <= 2 || cores <= 2) return "low";
    if (memory <= 4 || cores <= 4) return "medium";
    return "high";
  },
};

// Animation timing utilities
export const navbarTimingUtils = {
  // Stagger animations for multiple elements
  stagger:
    (baseDelay: number, increment: number = 50) =>
    (index: number): number =>
      baseDelay + index * increment,

  // Create animation sequence
  sequence: (animations: Array<{ func: () => void; delay: number }>) => {
    animations.forEach(({ func, delay }) => {
      setTimeout(func, delay);
    });
  },

  // Create animation timeline
  timeline: (steps: Array<{ animation: () => void; duration: number }>) => {
    let currentDelay = 0;

    return steps.map(({ animation, duration }) => {
      const delay = currentDelay;
      currentDelay += duration;

      return { animation, delay };
    });
  },
};

// CSS custom properties for dynamic theming
export const navbarCSSVariables = {
  // Animation durations
  "--navbar-hover-duration": "200ms",
  "--navbar-focus-duration": "150ms",
  "--navbar-active-duration": "100ms",
  "--navbar-transition-duration": "300ms",

  // Easing functions
  "--navbar-easing": "cubic-bezier(0.4, 0, 0.2, 1)",
  "--navbar-easing-bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",

  // Colors
  "--navbar-accent-color": "rgb(59, 130, 246)",
  "--navbar-accent-hover": "rgb(37, 99, 235)",

  // Shadows
  "--navbar-shadow-sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  "--navbar-shadow-md": "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  "--navbar-shadow-lg": "0 10px 15px -3px rgb(0 0 0 / 0.1)",
};

// Utility for creating data attributes for animations
export const createAnimationAttributes = (
  elementId: string,
  animations: string[],
) => {
  return {
    "data-navbar-element": elementId,
    "data-navbar-animations": animations.join(" "),
  };
};

// Intersection Observer for scroll-triggered animations
export const createScrollObserver = (
  element: Element,
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {},
) => {
  const defaultOptions: IntersectionObserverInit = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(callback);
    },
    { ...defaultOptions, ...options },
  );

  observer.observe(element);

  return () => observer.disconnect();
};

// Animation cleanup utilities
export const animationCleanup = {
  // Clear all animations for an element
  clearElementAnimations: (element: Element) => {
    element.getAnimations().forEach((animation) => animation.cancel());
  },

  // Clear all CSS transitions
  clearTransitions: (element: Element) => {
    const htmlElement = element as HTMLElement;
    htmlElement.style.transition = "none";
    // Force reflow
    htmlElement.offsetHeight;
    htmlElement.style.transition = "";
  },

  // Reset transform and opacity
  resetTransform: (element: Element) => {
    const htmlElement = element as HTMLElement;
    htmlElement.style.transform = "";
    htmlElement.style.opacity = "";
  },
};
