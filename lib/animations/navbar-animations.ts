/**
 * Centralized animation configurations and utilities for navbar components
 *
 * This module provides performance-optimized animation variants, utilities,
 * and configuration for enhanced navbar interactions.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import type { Easing, Variant } from "framer-motion";

// Performance detection utilities
export const navbarPerformanceUtils = {
  shouldReduceMotion: (): boolean => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  },

  getDevicePerformance: (): "low" | "medium" | "high" => {
    if (typeof window === "undefined") return "high";

    // Check for mobile devices (generally lower performance)
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );
    if (isMobile) return "low";

    // Check hardware concurrency
    const cores = navigator.hardwareConcurrency || 4;
    if (cores <= 2) return "low";
    if (cores <= 4) return "medium";
    return "high";
  },

  getOptimalDuration: (baseDuration: number = 300): number => {
    const performance = navbarPerformanceUtils.getDevicePerformance();
    const reducedMotion = navbarPerformanceUtils.shouldReduceMotion();

    if (reducedMotion) return 0.01;

    switch (performance) {
      case "low":
        return baseDuration * 0.6;
      case "medium":
        return baseDuration * 0.8;
      case "high":
        return baseDuration;
      default:
        return baseDuration;
    }
  },
};

// Animation configuration interfaces
export interface NavbarAnimationConfig {
  duration?: number;
  easing?: Easing | Easing[];
  delay?: number;
  reducedMotion?: boolean;
  performance?: "low" | "medium" | "high";
}

export interface IconAnimationVariants {
  hover: Variant;
  tap: Variant;
  initial: Variant;
  animate: Variant;
  exit: Variant;
}

// Core animation variants
export const navbarAnimationVariants = {
  // Icon hover animations
  iconHover: {
    scale: [1, 1.1, 1.05],
    rotate: [0, -3, 3, 0],
    transition: {
      duration: navbarPerformanceUtils.getOptimalDuration(0.4),
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },

  iconTap: {
    scale: 0.95,
    transition: {
      duration: navbarPerformanceUtils.getOptimalDuration(0.1),
      ease: "easeOut",
    },
  },

  // Button hover effects
  buttonHover: {
    scale: [1, 1.02, 1.01],
    boxShadow: [
      "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    ],
    transition: {
      duration: navbarPerformanceUtils.getOptimalDuration(0.2),
      ease: "easeOut",
    },
  },

  buttonTap: {
    scale: 0.98,
    transition: {
      duration: navbarPerformanceUtils.getOptimalDuration(0.1),
      ease: "easeOut",
    },
  },

  // Link hover animations
  linkHover: {
    scale: [1, 1.02],
    color: ["var(--foreground)", "var(--primary)"],
    transition: {
      duration: navbarPerformanceUtils.getOptimalDuration(0.2),
      ease: "easeOut",
    },
  },

  // Theme transition animations
  themeTransition: {
    backgroundColor: ["var(--background)", "var(--background)"],
    transition: {
      duration: navbarPerformanceUtils.getOptimalDuration(0.3),
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },

  // Session change animations
  sessionEnter: {
    opacity: [0, 1],
    scale: [0.95, 1],
    y: [10, 0],
    transition: {
      duration: navbarPerformanceUtils.getOptimalDuration(0.3),
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },

  sessionExit: {
    opacity: [1, 0],
    scale: [1, 0.95],
    y: [0, -10],
    transition: {
      duration: navbarPerformanceUtils.getOptimalDuration(0.2),
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },

  // Badge animations
  badgeEnter: {
    scale: [0, 1.2, 1],
    opacity: [0, 1],
    transition: {
      duration: navbarPerformanceUtils.getOptimalDuration(0.3),
      ease: [0.68, -0.55, 0.265, 1.55] as const,
    },
  },

  badgeExit: {
    scale: [1, 0.8, 0],
    opacity: [1, 0],
    transition: {
      duration: navbarPerformanceUtils.getOptimalDuration(0.2),
      ease: "easeInOut",
    },
  },
};

// Factory function for creating navbar animation variants
export function createNavbarAnimationVariants(
  config?: NavbarAnimationConfig,
): IconAnimationVariants {
  const {
    duration = 300,
    easing = "easeOut",
    delay = 0,
    reducedMotion = navbarPerformanceUtils.shouldReduceMotion(),
    performance = navbarPerformanceUtils.getDevicePerformance(),
  } = config || {};

  const optimalDuration = reducedMotion
    ? 0.01
    : navbarPerformanceUtils.getOptimalDuration(duration);

  return {
    hover: reducedMotion
      ? {
          scale: 1,
          transition: {
            duration: optimalDuration * 0.4,
            ease: easing,
            delay,
          },
        }
      : {
          scale: [1, 1.05, 1.02] as const,
          transition: {
            duration: optimalDuration * 0.4,
            ease: easing,
            delay,
          },
        },
    tap: {
      scale: reducedMotion ? 1 : 0.95,
      transition: {
        duration: optimalDuration * 0.1,
        ease: easing,
      },
    },
    initial: {
      opacity: 0,
      scale: reducedMotion ? 1 : 0.9,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: optimalDuration * 0.3,
        ease: easing,
        delay,
      },
    },
    exit: {
      opacity: 0,
      scale: reducedMotion ? 1 : 0.9,
      transition: {
        duration: optimalDuration * 0.2,
        ease: easing,
      },
    },
  };
}

// Cursor enhancement utilities
export const cursorEnhancementUtils = {
  enhanceCursorOnHover: (
    element: HTMLElement,
    cursorType: string = "pointer",
  ) => {
    if (typeof window === "undefined") return;

    const style = window.getComputedStyle(element);
    if (style.cursor === "auto" || style.cursor === "") {
      element.style.cursor = cursorType;
    }
  },

  createHoverCursorEffect: (element: HTMLElement): (() => void) | undefined => {
    if (typeof window === "undefined") return;

    const handleMouseEnter = () => {
      cursorEnhancementUtils.enhanceCursorOnHover(element, "pointer");
      element.style.transform = "scale(1.02)";
      element.style.transition = "transform 0.2s ease-out";
    };

    const handleMouseLeave = () => {
      element.style.transform = "scale(1)";
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  },
};

// Theme transition utilities
export const themeTransitionUtils = {
  createSmoothThemeTransition: (fromTheme: string, toTheme: string) => {
    return {
      backgroundColor: [fromTheme, toTheme],
      transition: {
        duration: navbarPerformanceUtils.getOptimalDuration(0.4),
        ease: [0.4, 0, 0.2, 1],
      },
    };
  },

  animateThemeChange: (callback: () => void) => {
    if (navbarPerformanceUtils.shouldReduceMotion()) {
      callback();
      return;
    }

    // Add a small delay to allow for smooth transitions
    setTimeout(callback, 50);
  },
};

// Performance-based animation adjustments
export function calculateAnimationPerformance(
  baseConfig: NavbarAnimationConfig = {},
): NavbarAnimationConfig {
  const performance = navbarPerformanceUtils.getDevicePerformance();
  const reducedMotion = navbarPerformanceUtils.shouldReduceMotion();

  const adjustments = {
    low: { duration: 0.6, complexity: "simple" },
    medium: { duration: 0.8, complexity: "medium" },
    high: { duration: 1.0, complexity: "complex" },
  };

  const adjustment = adjustments[performance];

  return {
    ...baseConfig,
    duration: baseConfig.duration
      ? baseConfig.duration * adjustment.duration
      : 300 * adjustment.duration,
    reducedMotion,
    performance,
  };
}

// Optimized icon animations based on device performance
export function optimizeIconAnimations(
  baseVariants: IconAnimationVariants,
): IconAnimationVariants {
  const config = calculateAnimationPerformance();
  const reducedMotion = navbarPerformanceUtils.shouldReduceMotion();

  if (reducedMotion) {
    return {
      hover: { scale: 1 },
      tap: { scale: 1 },
      initial: { opacity: 1, scale: 1 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1 },
    };
  }

  return baseVariants;
}

// Export default configurations
export const defaultNavbarAnimations = {
  variants: navbarAnimationVariants,
  utils: navbarPerformanceUtils,
  cursor: cursorEnhancementUtils,
  theme: themeTransitionUtils,
};
