/**
 * Enhanced Card Component with Advanced Features
 * Modern cards with hover effects, expandable content, and animations
 *
 * @author hh.oomph@gmail.com
 * @version 2.0.0
 * @since 2025-01-01
 */

"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ChevronDown,
  Expand,
  Heart,
  MoreHorizontal,
  Share2,
} from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "bordered" | "glass" | "interactive";
  size?: "sm" | "md" | "lg" | "xl";
  hover?: boolean;
  expandable?: boolean;
  showActions?: boolean;
  favorite?: boolean;
  onFavorite?: () => void;
  onShare?: () => void;
  onExpand?: () => void;
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  actions?: React.ReactNode;
}

const EnhancedCardComponent = React.forwardRef<
  HTMLDivElement,
  EnhancedCardProps
>(
  (
    {
      className,
      variant = "default",
      size = "md",
      hover = true,
      expandable = false,
      showActions = false,
      favorite = false,
      onFavorite,
      onShare,
      onExpand,
      children,
      header,
      footer,
      actions,
      ...props
    },
    ref,
  ) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [isFavorited, setIsFavorited] = React.useState(favorite);

    // Mouse tracking for interactive effects
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useSpring(useTransform(mouseX, [-0.5, 0.5], [15, -15]));
    const rotateY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-15, 15]));

    // Memoized event handlers
    const handleMouseMove = React.useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!hover) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        mouseX.set((e.clientX - centerX) / rect.width);
        mouseY.set((e.clientY - centerY) / rect.height);
      },
      [hover, mouseX, mouseY],
    );

    const handleMouseLeave = React.useCallback(() => {
      mouseX.set(0);
      mouseY.set(0);
    }, [mouseX, mouseY]);

    const handleFavorite = React.useCallback(() => {
      setIsFavorited(!isFavorited);
      onFavorite?.();
    }, [isFavorited, onFavorite]);

    const handleExpand = React.useCallback(() => {
      setIsExpanded(!isExpanded);
      onExpand?.();
    }, [isExpanded, onExpand]);

    // Memoized style objects
    const variants = React.useMemo(
      () => ({
        default: "bg-card text-card-foreground shadow-sm",
        elevated: "bg-card text-card-foreground shadow-lg hover:shadow-xl",
        bordered: "border bg-card text-card-foreground",
        glass: "backdrop-blur-xl bg-white/10 border border-white/20 text-white",
        interactive:
          "bg-card text-card-foreground shadow-sm hover:shadow-lg cursor-pointer",
      }),
      [],
    );

    const sizes = React.useMemo(
      () => ({
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
        xl: "p-10",
      }),
      [],
    );

    // Memoized computed styles
    const cardClasses = React.useMemo(
      () =>
        cn(
          "rounded-lg border transition-all duration-300",
          variants[variant],
          sizes[size],
          hover && "hover:scale-[1.02] transition-transform duration-300",
          className,
        ),
      [variants, variant, sizes, size, hover, className],
    );

    const interactiveStyle = React.useMemo(
      () =>
        hover
          ? {
              rotateX: variant === "interactive" ? rotateX : 0,
              rotateY: variant === "interactive" ? rotateY : 0,
              transformStyle: "preserve-3d" as const,
            }
          : undefined,
      [hover, variant, rotateX, rotateY],
    );

    return (
      <motion.div
        ref={ref}
        className={cardClasses}
        style={interactiveStyle}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={hover ? { y: -8 } : undefined}
        whileTap={hover ? { scale: 0.98 } : undefined}
        {...(props as any)}
      >
        {/* Header Section */}
        {(header || showActions) && (
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">{header}</div>

            {/* Action Buttons */}
            {showActions && (
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleFavorite}
                >
                  <Heart
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isFavorited && "fill-red-500 text-red-500",
                    )}
                  />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onShare}
                >
                  <Share2 className="h-4 w-4" />
                </Button>

                {expandable && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleExpand}
                  >
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.div>
                  </Button>
                )}

                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={isExpanded ? "expanded" : "collapsed"}
              initial={{ opacity: 0, height: "auto" }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={cn(
                "overflow-hidden",
                !isExpanded && expandable && "max-h-32",
              )}
            >
              {children}
            </motion.div>
          </AnimatePresence>

          {/* Gradient overlay for expandable cards */}
          {expandable && !isExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none" />
          )}
        </div>

        {/* Expand Button for expandable cards */}
        {expandable && !isExpanded && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExpand}
              className="gap-2"
            >
              <Expand className="h-4 w-4" />
              Show More
            </Button>
          </div>
        )}

        {/* Custom Actions */}
        {actions && <div className="mt-4 pt-4 border-t">{actions}</div>}

        {/* Footer */}
        {footer && <div className="mt-4 pt-4 border-t">{footer}</div>}

        {/* Interactive hover effect overlay */}
        {hover && (
          <motion.div
            className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none"
            initial={false}
          />
        )}
      </motion.div>
    );
  },
);

EnhancedCardComponent.displayName = "EnhancedCard";

// Memoized version for performance
const EnhancedCard = React.memo(EnhancedCardComponent);

// Preset card components with memoization
const InteractiveCard: React.FC<Omit<EnhancedCardProps, "variant">> =
  React.memo((props) => (
    <EnhancedCard {...props} variant="interactive" hover={true} />
  ));

const GlassCard: React.FC<Omit<EnhancedCardProps, "variant">> = React.memo(
  (props) => <EnhancedCard {...props} variant="glass" />,
);

const ElevatedCard: React.FC<Omit<EnhancedCardProps, "variant">> = React.memo(
  (props) => <EnhancedCard {...props} variant="elevated" hover={true} />,
);

const ExpandableCard: React.FC<Omit<EnhancedCardProps, "expandable">> =
  React.memo((props) => (
    <EnhancedCard
      {...props}
      expandable={true}
      showActions={true}
      hover={true}
    />
  ));

export {
  EnhancedCard,
  InteractiveCard,
  GlassCard,
  ElevatedCard,
  ExpandableCard,
};
