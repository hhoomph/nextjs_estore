/**
 * Module for input
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "",
        filled: "bg-muted/50 border-muted focus-visible:bg-background",
        ghost:
          "border-transparent bg-transparent hover:bg-accent hover:text-accent-foreground focus-visible:bg-background focus-visible:border-input",
        error: "border-destructive focus-visible:ring-destructive",
      },
      size: {
        sm: "h-8 px-2 py-1 text-xs",
        default: "h-10 px-3 py-2",
        lg: "h-12 px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  leftIcon?: LucideIcon | React.ReactNode;
  rightIcon?: LucideIcon | React.ReactNode;
  error?: boolean;
  loading?: boolean;
  errorMessage?: string;
  helperText?: string;
  required?: boolean;
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      type,
      leftIcon,
      rightIcon,
      error,
      loading,
      disabled,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    const finalVariant = error ? "error" : variant;

    const renderIcon = (
      icon: LucideIcon | React.ReactNode,
      position: "left" | "right",
    ) => {
      const baseClasses = cn(
        "absolute top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
        position === "left" ? "left-3" : "right-3",
        isDisabled
          ? "text-muted-foreground"
          : "text-muted-foreground group-focus-within:text-foreground",
      );

      if (React.isValidElement(icon)) {
        return React.cloneElement(
          icon as React.ReactElement<{ className?: string }>,
          {
            className: cn(
              baseClasses,
              (icon.props as { className?: string })?.className,
            ),
          },
        );
      }
      if (typeof icon === "function") {
        const IconComponent = icon as LucideIcon;
        return <IconComponent className={baseClasses} />;
      }
      return icon;
    };

    const inputPadding = leftIcon ? "pl-9" : rightIcon ? "pr-9" : "";

    return (
      <div className="relative group">
        {leftIcon && renderIcon(leftIcon, "left")}
        <input
          type={type}
          className={cn(
            inputVariants({ variant: finalVariant, size, className }),
            inputPadding,
            loading && "pr-9", // Add padding for loading spinner
            "input-focus",
          )}
          ref={ref}
          disabled={isDisabled}
          {...props}
        />
        {rightIcon && !loading && renderIcon(rightIcon, "right")}
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          </div>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

// Enhanced input components for specific use cases
export interface SearchInputProps extends Omit<InputProps, "type"> {
  onSearch?: (value: string) => void;
  debounceMs?: number;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, debounceMs = 300, onChange, ...props }, ref) => {
    const [debounceTimer, setDebounceTimer] =
      React.useState<NodeJS.Timeout | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);

      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const timer = setTimeout(() => {
        onSearch?.(e.target.value);
      }, debounceMs);

      setDebounceTimer(timer);
    };

    React.useEffect(() => {
      return () => {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
      };
    }, [debounceTimer]);

    return (
      <Input
        ref={ref}
        type="search"
        leftIcon="Search"
        onChange={handleChange}
        {...props}
      />
    );
  },
);
SearchInput.displayName = "SearchInput";

// Password input with visibility toggle
export interface PasswordInputProps extends Omit<InputProps, "type"> {
  showToggle?: boolean;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showToggle = true, rightIcon, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <Input
        ref={ref}
        type={showPassword ? "text" : "password"}
        rightIcon={
          showToggle ? (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          ) : (
            rightIcon
          )
        }
        {...props}
      />
    );
  },
);
PasswordInput.displayName = "PasswordInput";

// Numeric input with increment/decrement buttons
export interface NumberInputProps extends Omit<InputProps, "type"> {
  min?: number;
  max?: number;
  step?: number;
  showControls?: boolean;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ min, max, step = 1, showControls = true, onChange, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => inputRef.current!);

    const increment = () => {
      const currentValue = parseFloat(inputRef.current?.value || "0");
      const newValue = Math.min(max || Infinity, currentValue + step);
      if (inputRef.current) {
        inputRef.current.value = newValue.toString();
        onChange?.({
          target: inputRef.current,
          currentTarget: inputRef.current,
        } as React.ChangeEvent<HTMLInputElement>);
      }
    };

    const decrement = () => {
      const currentValue = parseFloat(inputRef.current?.value || "0");
      const newValue = Math.max(min || -Infinity, currentValue - step);
      if (inputRef.current) {
        inputRef.current.value = newValue.toString();
        onChange?.({
          target: inputRef.current,
          currentTarget: inputRef.current,
        } as React.ChangeEvent<HTMLInputElement>);
      }
    };

    return (
      <div className="relative">
        <Input
          ref={inputRef}
          type="number"
          min={min}
          max={max}
          step={step}
          className={showControls ? "pr-16" : ""}
          onChange={onChange}
          {...props}
        />
        {showControls && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col h-8">
            <button
              type="button"
              onClick={increment}
              className="flex-1 px-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-t transition-colors"
              aria-label="Increment"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={decrement}
              className="flex-1 px-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-b transition-colors"
              aria-label="Decrement"
            >
              ▼
            </button>
          </div>
        )}
      </div>
    );
  },
);
NumberInput.displayName = "NumberInput";

export { Input, SearchInput, PasswordInput, NumberInput, inputVariants };
