/**
 * Hook for managing navbar animations and transitions
 *
 * This hook provides utilities for managing navbar animation states,
 * smooth transitions, and micro-interactions.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

"use client";

import { useCallback, useEffect, useRef } from "react";
import { useNavbarStore } from "@/lib/stores/navbar-store";

export interface AnimationConfig {
  duration?: number;
  easing?: string;
  delay?: number;
}

interface NavbarAnimationHook {
  // Animation state management
  setHoverState: (element: string, isHovered: boolean) => void;
  setFocusState: (element: string, isFocused: boolean) => void;
  setActiveState: (element: string, isActive: boolean) => void;

  // Animation utilities
  animateElement: (
    elementId: string,
    animation: string,
    config?: AnimationConfig,
  ) => void;
  resetElementAnimation: (elementId: string) => void;

  // Batch operations
  animateMultiple: (
    animations: Array<{
      id: string;
      animation: string;
      config?: AnimationConfig;
    }>,
  ) => void;

  // Animation state getters
  isAnimating: (element: string) => boolean;
  getAnimationState: (element: string) => boolean | undefined;
}

export function useNavbarAnimations(): NavbarAnimationHook {
  const { setAnimationState, animationStates } = useNavbarStore();
  const animationTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      animationTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      animationTimeoutsRef.current.clear();
    };
  }, []);

  const setHoverState = useCallback(
    (element: string, isHovered: boolean) => {
      const key = `hover-${element}`;
      setAnimationState(key, isHovered);

      // Auto-reset after animation completes
      if (isHovered) {
        const existingTimeout = animationTimeoutsRef.current.get(key);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        const timeout = setTimeout(() => {
          setAnimationState(key, false);
          animationTimeoutsRef.current.delete(key);
        }, 300); // Standard hover animation duration

        animationTimeoutsRef.current.set(key, timeout);
      }
    },
    [setAnimationState],
  );

  const setFocusState = useCallback(
    (element: string, isFocused: boolean) => {
      const key = `focus-${element}`;
      setAnimationState(key, isFocused);
    },
    [setAnimationState],
  );

  const setActiveState = useCallback(
    (element: string, isActive: boolean) => {
      const key = `active-${element}`;
      setAnimationState(key, isActive);
    },
    [setAnimationState],
  );

  const animateElement = useCallback(
    (elementId: string, animation: string, config: AnimationConfig = {}) => {
      const { duration = 300, easing = "ease-out", delay = 0 } = config;
      const key = `anim-${elementId}-${animation}`;

      // Set animation state
      setAnimationState(key, true);

      // Create CSS animation style (this would be used with a CSS-in-JS solution or data attributes)
      const animationStyle = {
        animation: `${animation} ${duration}ms ${easing} ${delay}ms both`,
      };

      // Auto-reset animation state
      const timeout = setTimeout(
        () => {
          setAnimationState(key, false);
          animationTimeoutsRef.current.delete(key);
        },
        duration + delay + 50,
      ); // Small buffer

      animationTimeoutsRef.current.set(key, timeout);

      return animationStyle;
    },
    [setAnimationState],
  );

  const resetElementAnimation = useCallback(
    (elementId: string) => {
      // Reset all animations for this element
      const keysToRemove: string[] = [];
      animationTimeoutsRef.current.forEach((timeout, key) => {
        if (key.includes(elementId)) {
          clearTimeout(timeout);
          setAnimationState(key, false);
          keysToRemove.push(key);
        }
      });

      keysToRemove.forEach((key) => animationTimeoutsRef.current.delete(key));
    },
    [setAnimationState],
  );

  const animateMultiple = useCallback(
    (
      animations: Array<{
        id: string;
        animation: string;
        config?: AnimationConfig;
      }>,
    ) => {
      animations.forEach(({ id, animation, config }) => {
        animateElement(id, animation, config);
      });
    },
    [animateElement],
  );

  const isAnimating = useCallback(
    (element: string) => {
      return Object.keys(animationStates).some(
        (key) => key.includes(element) && animationStates[key],
      );
    },
    [animationStates],
  );

  const getAnimationState = useCallback(
    (element: string) => {
      const key = `anim-${element}`;
      return animationStates[key];
    },
    [animationStates],
  );

  return {
    setHoverState,
    setFocusState,
    setActiveState,
    animateElement,
    resetElementAnimation,
    animateMultiple,
    isAnimating,
    getAnimationState,
  };
}

// Utility functions for navbar animations
export const navbarAnimationUtils = {
  // Standard animation configurations
  configs: {
    hover: { duration: 200, easing: "ease-out" },
    focus: { duration: 150, easing: "ease-out" },
    active: { duration: 100, easing: "ease-out" },
    slideIn: { duration: 300, easing: "ease-out" },
    fadeIn: { duration: 200, easing: "ease-out" },
    bounce: { duration: 400, easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)" },
  },

  // Animation classes (for CSS-in-JS or Tailwind)
  classes: {
    hover:
      "transform transition-transform duration-200 ease-out hover:scale-105",
    focus: "ring-2 ring-blue-500 ring-opacity-50 transition-all duration-150",
    active: "scale-95 transition-transform duration-100",
    slideInRight: "animate-in slide-in-from-right-2 fade-in duration-300",
    slideInLeft: "animate-in slide-in-from-left-2 fade-in duration-300",
    fadeIn: "animate-in fade-in duration-200",
    bounce: "animate-bounce",
  },

  // Create custom animation
  createAnimation: (
    name: string,
    keyframes: string,
    config: AnimationConfig = {},
  ) => {
    const { duration = 300, easing = "ease-out", delay = 0 } = config;
    return {
      animation: `${name} ${duration}ms ${easing} ${delay}ms both`,
      keyframes,
    };
  },
};
