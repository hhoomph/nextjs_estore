/**
 * Enhanced Navbar Icon Component
 *
 * A reusable component for animated navbar icons with hover effects,
 * notifications, and accessibility features. Now uses enhanced animation
 * system with performance optimizations and better cursor handling.
 *
 * @author hh.oomph@gmail.com
 * @version 2.0.0
 * @since 2025-01-01
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { navbarPerformanceUtils } from "@/lib/animations/navbar-animations";
import { useNavbarAnimations } from "@/lib/hooks/use-navbar-animations";
import { cn } from "@/lib/utils";

interface EnhancedNavbarIconProps {
  icon: React.ReactNode;
  count?: number;
  onClick?: () => void;
  href?: string;
  label: string;
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
  animationEnabled?: boolean;
  className?: string;
  "data-testid"?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

const variantClasses = {
  default: "text-foreground hover:text-primary",
  ghost: "text-muted-foreground hover:text-foreground hover:bg-accent",
  outline:
    "text-muted-foreground hover:text-foreground border border-border hover:border-primary/20",
};

export function EnhancedNavbarIcon({
  icon,
  count = 0,
  onClick,
  href,
  label,
  variant = "ghost",
  size = "md",
  showBadge = true,
  animationEnabled = true,
  className,
  "data-testid": testId,
}: EnhancedNavbarIconProps) {
  const { setHoverState } = useNavbarAnimations();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Check if animations should be reduced
  const shouldReduceMotion = navbarPerformanceUtils.shouldReduceMotion();
  const effectiveAnimationEnabled = animationEnabled && !shouldReduceMotion;

  const handleMouseEnter = useCallback(() => {
    if (effectiveAnimationEnabled) {
      setIsHovered(true);
      setHoverState(`icon-${label}`, true);
    }
  }, [effectiveAnimationEnabled, setHoverState, label]);

  const handleMouseLeave = useCallback(() => {
    if (effectiveAnimationEnabled) {
      setIsHovered(false);
      setHoverState(`icon-${label}`, false);
    }
  }, [effectiveAnimationEnabled, setHoverState, label]);

  const handleMouseDown = useCallback(() => {
    if (effectiveAnimationEnabled) {
      setIsPressed(true);
    }
  }, [effectiveAnimationEnabled]);

  const handleMouseUp = useCallback(() => {
    if (effectiveAnimationEnabled) {
      setIsPressed(false);
    }
  }, [effectiveAnimationEnabled]);

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick();
    }
  }, [onClick]);

  const iconElement = (
    <motion.div
      className={cn(
        "relative flex items-center justify-center rounded-md p-2 transition-all duration-200 cursor-pointer",
        variantClasses[variant],
        className,
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleClick();
        }
      }}
      whileHover={effectiveAnimationEnabled ? { scale: 1.05 } : {}}
      whileTap={effectiveAnimationEnabled ? { scale: 0.95 } : {}}
      animate={
        isPressed && effectiveAnimationEnabled ? { scale: 0.95 } : { scale: 1 }
      }
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17,
        duration: 0.2,
      }}
      data-testid={testId}
      role="button"
      tabIndex={href ? -1 : 0}
      aria-label={label}
    >
      <motion.div
        animate={
          isHovered && effectiveAnimationEnabled
            ? {
                rotate: [0, -5, 5, 0],
                scale: [1, 1.1, 1.1, 1],
              }
            : { rotate: 0, scale: 1 }
        }
        transition={{
          duration: 0.4,
          ease: "easeInOut",
        }}
        className={sizeClasses[size]}
      >
        {icon}
      </motion.div>

      {/* Notification Badge */}
      <AnimatePresence>
        {showBadge && count > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 25,
              duration: 0.3,
            }}
            className="absolute -top-1 -right-1"
          >
            <Badge
              variant="destructive"
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs font-bold",
                "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
                "shadow-lg ring-2 ring-background",
                count > 99 && "text-[10px]",
              )}
            >
              {count > 99 ? "99+" : count}
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accessibility indicator for screen readers */}
      <span className="sr-only">
        {label}
        {count > 0 && ` (${count} ${count === 1 ? "item" : "items"})`}
      </span>
    </motion.div>
  );

  // If href is provided, wrap in Link
  if (href) {
    const LinkComponent = motion.a;
    return (
      <LinkComponent
        href={href}
        className="block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        whileHover={effectiveAnimationEnabled ? { scale: 1.02 } : {}}
        whileTap={effectiveAnimationEnabled ? { scale: 0.98 } : {}}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 17,
        }}
      >
        {iconElement}
      </LinkComponent>
    );
  }

  return iconElement;
}

// Specialized components for common navbar icons
export const CartIcon: React.FC<
  Omit<EnhancedNavbarIconProps, "icon" | "label">
> = (props) => (
  <EnhancedNavbarIcon icon={<span>🛒</span>} label="Shopping cart" {...props} />
);

export const WishlistIcon: React.FC<
  Omit<EnhancedNavbarIconProps, "icon" | "label">
> = (props) => (
  <EnhancedNavbarIcon icon={<span>❤️</span>} label="Wishlist" {...props} />
);

export const SearchIcon: React.FC<
  Omit<EnhancedNavbarIconProps, "icon" | "label">
> = (props) => (
  <EnhancedNavbarIcon icon={<span>🔍</span>} label="Search" {...props} />
);

export const UserIcon: React.FC<
  Omit<EnhancedNavbarIconProps, "icon" | "label">
> = (props) => (
  <EnhancedNavbarIcon icon={<span>👤</span>} label="User account" {...props} />
);
