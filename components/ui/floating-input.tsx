/**
 * Floating Input Component with Advanced Features
 * Modern input with floating labels, validation feedback, and animations
 *
 * @author hh.oomph@gmail.com
 * @version 2.0.0
 * @since 2025-01-01
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, Eye, EyeOff, Info, X } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FloatingInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "filled" | "outlined" | "underlined";
  fullWidth?: boolean;
  loading?: boolean;
  clearable?: boolean;
  onClear?: () => void;
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      success,
      helperText,
      leftIcon,
      rightIcon,
      showPasswordToggle,
      size = "md",
      variant = "default",
      fullWidth = false,
      loading = false,
      clearable = false,
      onClear,
      value,
      onChange,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(Boolean(value));
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => inputRef.current!);

    const inputType = showPasswordToggle && showPassword ? "text" : type;

    const handleFocus = React.useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        onFocus?.(e);
      },
      [onFocus],
    );

    const handleBlur = React.useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        onBlur?.(e);
      },
      [onBlur],
    );

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setHasValue(Boolean(e.target.value));
        onChange?.(e);
      },
      [onChange],
    );

    const handleClear = React.useCallback(() => {
      if (inputRef.current) {
        inputRef.current.value = "";
        setHasValue(false);
        onClear?.();
        inputRef.current.focus();
      }
    }, [onClear]);

    const shouldFloatLabel = isFocused || hasValue;

    const variants = {
      default: "border-input bg-background",
      filled: "border-0 bg-muted/50 focus:bg-background",
      outlined: "border-2 border-input bg-transparent focus:border-primary",
      underlined:
        "border-0 border-b-2 border-input bg-transparent rounded-none focus:border-primary",
    };

    const sizes = {
      sm: "h-9 px-3 text-sm",
      md: "h-10 px-4 text-base",
      lg: "h-12 px-4 text-lg",
    };

    const labelSizes = {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    };

    return (
      <div className={cn("relative", fullWidth && "w-full")}>
        {/* Floating Label */}
        <AnimatePresence>
          {label && (
            <motion.label
              initial={false}
              animate={{
                y: shouldFloatLabel ? -24 : 0,
                x: shouldFloatLabel ? -2 : leftIcon ? 36 : 16,
                scale: shouldFloatLabel ? 0.85 : 1,
                color: isFocused
                  ? "rgb(var(--primary))"
                  : error
                    ? "rgb(var(--destructive))"
                    : "rgb(var(--muted-foreground))",
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 24,
                duration: 0.2,
              }}
              className={cn(
                "absolute left-0 top-0 flex items-center pointer-events-none select-none",
                labelSizes[size],
                "font-medium transition-colors duration-200",
              )}
            >
              {label}
              {props.required && (
                <span className="text-destructive ml-1" aria-hidden="true">
                  *
                </span>
              )}
            </motion.label>
          )}
        </AnimatePresence>

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <motion.input
            ref={inputRef}
            type={inputType}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn(
              "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
              variants[variant],
              sizes[size],
              leftIcon && "pl-10",
              (rightIcon || showPasswordToggle || (clearable && hasValue)) &&
                "pr-10",
              error && "border-destructive focus-visible:ring-destructive",
              success && "border-success focus-visible:ring-success",
              loading && "cursor-wait opacity-70",
              fullWidth && "w-full",
              className,
            )}
            style={{
              paddingTop: shouldFloatLabel ? "20px" : "8px",
              paddingBottom: shouldFloatLabel ? "4px" : "8px",
            }}
            {...(props as any)}
          />

          {/* Loading Spinner */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Clear Button */}
          <AnimatePresence>
            {clearable && hasValue && !loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-muted"
                  onClick={handleClear}
                  aria-label="Clear input"
                >
                  <X className="h-3 w-3" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Password Toggle */}
          <AnimatePresence>
            {showPasswordToggle && !loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-muted"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right Icon */}
          <AnimatePresence>
            {rightIcon &&
              !loading &&
              !showPasswordToggle &&
              !(clearable && hasValue) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {rightIcon}
                </motion.div>
              )}
          </AnimatePresence>
        </div>

        {/* Status Icons */}
        <AnimatePresence>
          {(success || error) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {success && <Check className="h-4 w-4 text-success" />}
              {error && <AlertCircle className="h-4 w-4 text-destructive" />}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Helper Text / Error Message */}
        <AnimatePresence>
          {(helperText || error) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "mt-1 text-xs flex items-start gap-1",
                error ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {error && (
                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
              )}
              {!error && helperText && (
                <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
              )}
              <span>{error || helperText}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

FloatingInput.displayName = "FloatingInput";

// Pre-configured variants
const PasswordInput: React.FC<
  Omit<FloatingInputProps, "type" | "showPasswordToggle">
> = (props) => (
  <FloatingInput {...props} type="password" showPasswordToggle={true} />
);

const EmailInput: React.FC<Omit<FloatingInputProps, "type">> = (props) => (
  <FloatingInput {...props} type="email" />
);

const SearchInput: React.FC<Omit<FloatingInputProps, "type">> = (props) => (
  <FloatingInput {...props} type="search" clearable={true} />
);

export { FloatingInput, PasswordInput, EmailInput, SearchInput };
