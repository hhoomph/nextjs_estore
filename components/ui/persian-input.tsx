"use client";

/**
 * Persian-Aware Input Component
 *
 * An enhanced input component that automatically converts Persian/Arabic numerals
 * to English numerals in real-time, providing better UX for Persian users.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import * as React from "react";
import type { InputProps } from "@/components/ui/input";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { persianInputUtils } from "@/lib/utils/persian";

interface PersianInputProps extends Omit<InputProps, "onChange" | "value"> {
  /**
   * Current input value
   */
  value?: string | number;

  /**
   * Callback when value changes
   */
  onChange?: (value: string, processedValue: string) => void;

  /**
   * Whether to convert Persian numbers to English in real-time
   */
  convertPersianNumbers?: boolean;

  /**
   * Whether to allow decimal numbers
   */
  allowDecimals?: boolean;

  /**
   * Input type for validation
   */
  inputType?: "text" | "number" | "currency" | "phone";

  /**
   * Maximum allowed value (for number/currency inputs)
   */
  maxValue?: number;

  /**
   * Whether to show Persian number formatting
   */
  showPersianNumbers?: boolean;

  /**
   * Custom validation function
   */
  validate?: (value: string) => boolean | { isValid: boolean; error?: string };
}

const PersianInput = React.forwardRef<HTMLInputElement, PersianInputProps>(
  (
    {
      className,
      type = "text",
      value,
      onChange,
      convertPersianNumbers = true,
      allowDecimals = true,
      inputType = "text",
      maxValue,
      showPersianNumbers = false,
      validate,
      onBlur,
      onFocus,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = React.useState<string>(
      value ? String(value) : "",
    );
    const [displayValue, setDisplayValue] = React.useState<string>(
      value ? String(value) : "",
    );
    const [isFocused, setIsFocused] = React.useState(false);

    // Update internal value when prop value changes
    React.useEffect(() => {
      const newValue = value ? String(value) : "";
      setInternalValue(newValue);
      setDisplayValue(
        showPersianNumbers
          ? persianInputUtils.formatDisplayValue(newValue)
          : newValue,
      );
    }, [value, showPersianNumbers]);

    // Process input value based on type
    const processInput = React.useCallback(
      (inputValue: string): string => {
        if (!convertPersianNumbers) return inputValue;

        switch (inputType) {
          case "number":
          case "currency":
            return persianInputUtils.processFormInput(
              inputValue,
              allowDecimals,
            );

          case "phone":
            // For phone numbers, only convert Persian numbers but keep formatting
            return persianInputUtils.convertInput(inputValue);

          default:
            return convertPersianNumbers
              ? persianInputUtils.convertInput(inputValue)
              : inputValue;
        }
      },
      [convertPersianNumbers, inputType, allowDecimals],
    );

    // Validate input value
    const validateInput = React.useCallback(
      (inputValue: string): boolean => {
        if (validate) {
          const result = validate(inputValue);
          return typeof result === "boolean" ? result : result.isValid;
        }

        switch (inputType) {
          case "number":
            return persianInputUtils.isValidPersianNumber(inputValue);

          case "currency": {
            const validation = persianInputUtils.validateCurrencyInput(
              inputValue,
              maxValue,
            );
            return validation.isValid;
          }

          case "phone": {
            // Basic phone validation - should be enhanced based on requirements
            const processed = processInput(inputValue);
            return (
              processed.length >= 10 &&
              /^\d+$/.test(processed.replace(/\s+/g, ""))
            );
          }

          default:
            return true;
        }
      },
      [validate, inputType, maxValue, processInput],
    );

    // Handle input change
    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const processedValue = processInput(rawValue);

        // Update internal state
        setInternalValue(processedValue);

        // Update display value
        if (showPersianNumbers && !isFocused) {
          setDisplayValue(persianInputUtils.formatDisplayValue(processedValue));
        } else {
          setDisplayValue(rawValue);
        }

        // Call onChange with both raw and processed values
        onChange?.(processedValue, rawValue);
      },
      [processInput, showPersianNumbers, isFocused, onChange],
    );

    // Handle focus
    const handleFocus = React.useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        // Show raw input value when focused for editing
        setDisplayValue(internalValue);
        onFocus?.(e);
      },
      [internalValue, onFocus],
    );

    // Handle blur
    const handleBlur = React.useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);

        // Validate on blur
        const isValid = validateInput(internalValue);
        if (!isValid) {
          // Could add error styling here
          console.warn("Invalid input value:", internalValue);
        }

        // Format display value when blurred
        if (showPersianNumbers) {
          setDisplayValue(persianInputUtils.formatDisplayValue(internalValue));
        } else {
          setDisplayValue(internalValue);
        }

        onBlur?.(e);
      },
      [internalValue, showPersianNumbers, validateInput, onBlur],
    );

    return (
      <Input
        {...props}
        ref={ref}
        type={type}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(
          // Add RTL support for Persian text
          containsPersian(displayValue) && "text-right",
          // Add validation styling
          !validateInput(internalValue) &&
            "border-destructive focus-visible:ring-destructive",
          className,
        )}
        dir={containsPersian(displayValue) ? "rtl" : "ltr"}
      />
    );
  },
);

PersianInput.displayName = "PersianInput";

// Helper function to check if text contains Persian characters
function containsPersian(text: string): boolean {
  const persianRegex =
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return persianRegex.test(text);
}

/**
 * Persian Number Input Component
 *
 * Specialized input for numeric values with Persian number support
 */
export const PersianNumberInput = React.forwardRef<
  HTMLInputElement,
  Omit<PersianInputProps, "inputType">
>((props, ref) => (
  <PersianInput
    {...props}
    ref={ref}
    inputType="number"
    convertPersianNumbers={true}
  />
));

PersianNumberInput.displayName = "PersianNumberInput";

/**
 * Persian Currency Input Component
 *
 * Specialized input for currency values with Persian number support
 */
export const PersianCurrencyInput = React.forwardRef<
  HTMLInputElement,
  Omit<PersianInputProps, "inputType"> & {
    currency?: string;
    showCurrencySymbol?: boolean;
  }
>(
  (
    { currency = "IRR", showCurrencySymbol = false, className, ...props },
    ref,
  ) => (
    <div className="relative">
      <PersianInput
        {...props}
        ref={ref}
        inputType="currency"
        convertPersianNumbers={true}
        className={cn(showCurrencySymbol && "pr-16", className)}
      />
      {showCurrencySymbol && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {currency === "IRR" ? "تومان" : currency}
        </div>
      )}
    </div>
  ),
);

PersianCurrencyInput.displayName = "PersianCurrencyInput";

/**
 * Persian Phone Input Component
 *
 * Specialized input for phone numbers with Persian number support
 */
export const PersianPhoneInput = React.forwardRef<
  HTMLInputElement,
  Omit<PersianInputProps, "inputType"> & {
    format?: boolean;
  }
>(({ format = true, className, ...props }, ref) => (
  <PersianInput
    {...props}
    ref={ref}
    inputType="phone"
    convertPersianNumbers={true}
    placeholder={props.placeholder || "۰۹۱۲ ۳۴۵ ۶۷۸۹"}
    className={cn("text-left", className)}
    validate={(value) => {
      if (!value) return true; // Allow empty values
      const processed = persianInputUtils.convertInput(value);
      const cleanPhone = processed.replace(/\s+/g, "");
      return cleanPhone.length >= 10 && /^\d+$/.test(cleanPhone);
    }}
  />
));

PersianPhoneInput.displayName = "PersianPhoneInput";

/**
 * Persian Search Input Component
 *
 * Input component optimized for Persian search with RTL support
 */
export const PersianSearchInput = React.forwardRef<
  HTMLInputElement,
  Omit<PersianInputProps, "inputType"> & {
    onSearch?: (query: string) => void;
    debounceMs?: number;
  }
>(({ onSearch, debounceMs = 300, className, ...props }, ref) => {
  const [debouncedTimer, setDebouncedTimer] = React.useState<NodeJS.Timeout>();

  const handleChange = React.useCallback(
    (value: string, processedValue: string) => {
      props.onChange?.(value, processedValue);

      // Debounced search
      if (debouncedTimer) clearTimeout(debouncedTimer);
      const timer = setTimeout(() => {
        onSearch?.(processedValue);
      }, debounceMs);
      setDebouncedTimer(timer);
    },
    [props.onChange, onSearch, debounceMs, debouncedTimer],
  );

  React.useEffect(() => {
    return () => {
      if (debouncedTimer) clearTimeout(debouncedTimer);
    };
  }, [debouncedTimer]);

  return (
    <PersianInput
      {...props}
      ref={ref}
      inputType="text"
      convertPersianNumbers={false} // Don't convert numbers in search
      onChange={handleChange}
      className={cn(
        // RTL support for Persian search queries
        "text-right",
        className,
      )}
      dir="rtl"
    />
  );
});

PersianSearchInput.displayName = "PersianSearchInput";

export default PersianInput;
