/**
 * Module for button
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] shadow-md",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 shadow-md",
        outline:
          "border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20 hover:shadow-md dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 hover:scale-[1.01]",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
        gradient:
          "bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] shadow-md",
        success:
          "bg-success text-success-foreground hover:bg-success/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] shadow-md",
        warning:
          "bg-warning text-warning-foreground hover:bg-warning/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] shadow-md",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 text-xs",
        lg: "h-12 rounded-lg px-8 has-[>svg]:px-5 text-base",
        xl: "h-14 rounded-lg px-10 has-[>svg]:px-6 text-lg",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: LucideIcon | React.ReactNode;
  rightIcon?: LucideIcon | React.ReactNode;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      onClick,
      "aria-label": ariaLabel,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;

    // Generate unique IDs for accessibility
    const buttonId = React.useId();
    const loadingId = React.useId();

    const renderIcon = (icon: LucideIcon | React.ReactNode) => {
      if (React.isValidElement(icon)) {
        const element = icon as React.ReactElement<{
          className?: string;
          "aria-hidden"?: boolean;
        }>;
        return React.cloneElement(element, {
          className: cn(
            "transition-transform duration-200",
            element.props?.className,
          ),
          "aria-hidden": true, // Icons are decorative
        });
      }
      if (typeof icon === "function") {
        const IconComponent = icon as LucideIcon;
        return (
          <IconComponent
            className="transition-transform duration-200"
            aria-hidden={true}
          />
        );
      }
      return icon;
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (!isDisabled && onClick) {
          // Most onClick handlers can work with keyboard events too
          onClick(event as unknown as React.MouseEvent<HTMLButtonElement>);
        }
      }
      if (props.onKeyDown) {
        props.onKeyDown(event);
      }
    };

    // Determine accessibility attributes
    const accessibilityProps = {
      "aria-label": ariaLabel,
      "aria-describedby": loading ? loadingId : ariaDescribedBy,
      "aria-disabled": isDisabled,
      "aria-busy": loading,
      role: props.role || (asChild ? undefined : "button"),
      tabIndex: isDisabled ? -1 : props.tabIndex,
    };

    if (asChild) {
      // When asChild is true, we can't modify the child structure
      // Icons should be handled by the parent component or not used with asChild
      if (leftIcon || rightIcon) {
        console.warn(
          "Button: leftIcon and rightIcon are not supported when asChild is true. Handle icons in the child component instead.",
        );
      }
      return (
        <Slot
          ref={ref}
          className={cn(
            buttonVariants({ variant, size, className }),
            fullWidth && "w-full",
            loading && "cursor-wait",
            "group",
          )}
          {...accessibilityProps}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <>
        <button
          ref={ref}
          id={buttonId}
          data-slot="button"
          className={cn(
            buttonVariants({ variant, size, className }),
            fullWidth && "w-full",
            loading && "cursor-wait",
            "group",
          )}
          disabled={isDisabled}
          onClick={onClick}
          onKeyDown={handleKeyDown}
          {...accessibilityProps}
          {...props}
        >
          {/* Loading shimmer effect */}
          {loading && (
            <div
              className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent animate-pulse"
              aria-hidden="true"
            />
          )}

          {/* Content */}
          <div className="relative flex items-center gap-2">
            {loading && (
              <Loader2
                className="animate-spin"
                data-testid="loading-spinner"
                aria-hidden="true"
              />
            )}
            {!loading && leftIcon && renderIcon(leftIcon)}
            <span
              className={cn(
                loading && "opacity-70",
                "transition-opacity duration-200",
              )}
            >
              {children}
            </span>
            {!loading && rightIcon && renderIcon(rightIcon)}
          </div>

          {/* Hover ripple effect */}
          <div
            className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-1000 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full"
            aria-hidden="true"
          />
        </button>

        {/* Hidden loading announcement for screen readers */}
        {loading && (
          <div
            id={loadingId}
            className="sr-only"
            role="status"
            aria-live="polite"
          >
            Loading, please wait
          </div>
        )}
      </>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
export type { ButtonProps };
