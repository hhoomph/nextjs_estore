/**
 * Navbar Transition Component
 *
 * A component for smooth navbar state transitions with loading states,
 * session changes, and animation coordination.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

"use client";

import { AnimatePresence, motion, useAnimation } from "framer-motion";
import type React from "react";
import { useEffect, useState } from "react";
import { Loading } from "@/components/ui/loading";
import { useNavbarAnimations } from "@/lib/hooks/use-navbar-animations";
import { cn } from "@/lib/utils";
import { navbarPerformanceUtils } from "@/lib/utils/navbar-animations";

interface NavbarTransitionProps {
  children: React.ReactNode;
  showLoadingState?: boolean;
  transitionType?: "fade" | "slide" | "scale" | "none";
  className?: string;
}

const transitionVariants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 },
  },
  scale: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.05, opacity: 0 },
  },
  none: {
    initial: {},
    animate: {},
    exit: {},
  },
};

const transitionConfig = {
  duration: 0.3,
  ease: "easeOut" as const,
};

export function NavbarTransition({
  children,
  showLoadingState = true,
  transitionType = "fade",
  className,
}: NavbarTransitionProps) {
  const { isAnimating } = useNavbarAnimations();
  const controls = useAnimation();

  // Check performance settings
  const shouldReduceMotion = navbarPerformanceUtils.shouldReduceMotion();
  const devicePerformance = navbarPerformanceUtils.getDevicePerformance();

  // Adjust transitions based on performance
  const effectiveTransitionType = shouldReduceMotion ? "none" : transitionType;
  const adjustedConfig = {
    ...transitionConfig,
    duration:
      devicePerformance === "low"
        ? transitionConfig.duration * 0.5
        : transitionConfig.duration,
  };

  // Always show content (no session loading state)
  const isVisible = true;

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          className={className}
          variants={transitionVariants[effectiveTransitionType]}
          initial="initial"
          animate={controls}
          exit="exit"
          transition={adjustedConfig}
          layout={true}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Specialized transition for navbar sections
export function NavbarSectionTransition({
  children,
  sectionKey,
  className,
}: {
  children: React.ReactNode;
  sectionKey: string;
  className?: string;
}) {
  const { isAnimating } = useNavbarAnimations();
  const isSectionAnimating = isAnimating(sectionKey);

  return (
    <motion.div
      className={className}
      animate={isSectionAnimating ? { opacity: 0.7 } : { opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

// Transition wrapper for navbar items
export function NavbarItemTransition({
  children,
  itemKey,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  itemKey: string;
  delay?: number;
  className?: string;
}) {
  const shouldReduceMotion = navbarPerformanceUtils.shouldReduceMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay,
        ease: [0.4, 0, 0.2, 1],
      }}
      layout={true}
    >
      {children}
    </motion.div>
  );
}

// Staggered transition for multiple navbar items
export function NavbarStaggeredTransition({
  children,
  staggerDelay = 0.1,
  className,
}: {
  children: React.ReactNode[];
  staggerDelay?: number;
  className?: string;
}) {
  const shouldReduceMotion = navbarPerformanceUtils.shouldReduceMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} layout={true}>
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: index * staggerDelay,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// Session change transition - simplified version without session loading
export function SessionChangeTransition({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = navbarPerformanceUtils.shouldReduceMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
