/**
 * Persian Form Validation Utilities
 *
 * Comprehensive validation utilities for Persian (Farsi) language forms
 * including Persian number validation, phone number validation, and cultural-specific rules.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import { z } from "zod";
import {
  containsPersian,
  convertPersianToEnglish,
  persianInputUtils,
  sanitizeIranianPhone,
} from "@/lib/utils/persian";

/**
 * Persian phone number validation schema
 */
export const persianPhoneSchema = z
  .string()
  .min(1, "شماره تلفن الزامی است")
  .transform((val) => val.trim())
  .refine(
    (val) => {
      const processed = persianInputUtils.convertInput(val);
      return processed.length >= 10;
    },
    {
      message: "شماره تلفن باید حداقل ۱۰ رقم باشد",
    },
  )
  .refine(
    (val) => {
      const cleanPhone = sanitizeIranianPhone(val);
      return cleanPhone !== null;
    },
    {
      message: "فرمت شماره تلفن نامعتبر است (مثال: ۰۹۱۲۳۴۵۶۷۸۹)",
    },
  )
  .transform((val) => {
    const cleanPhone = sanitizeIranianPhone(val);
    return cleanPhone || val;
  });

/**
 * Persian mobile phone validation schema
 */
export const persianMobileSchema = z
  .string()
  .min(1, "شماره موبایل الزامی است")
  .transform((val) => val.trim())
  .refine(
    (val) => {
      const processed = persianInputUtils.convertInput(val);
      return processed.length >= 10;
    },
    {
      message: "شماره موبایل باید حداقل ۱۰ رقم باشد",
    },
  )
  .refine(
    (val) => {
      const cleanPhone = sanitizeIranianPhone(val);
      return cleanPhone !== null && cleanPhone.startsWith("09");
    },
    {
      message: "شماره موبایل باید با ۰۹ شروع شود",
    },
  )
  .transform((val) => {
    const cleanPhone = sanitizeIranianPhone(val);
    return cleanPhone || val;
  });

/**
 * Persian number validation schema
 */
export const persianNumberSchema = z
  .string()
  .transform((val) => val.trim())
  .refine((val) => persianInputUtils.isValidPersianNumber(val), {
    message: "عدد وارد شده نامعتبر است",
  })
  .transform((val) => persianInputUtils.convertInput(val));

/**
 * Persian currency amount validation schema
 */
export const persianCurrencySchema = z
  .string()
  .min(1, "مبلغ الزامی است")
  .transform((val) => val.trim())
  .refine(
    (val) => {
      const validation = persianInputUtils.validateCurrencyInput(val);
      return validation.isValid;
    },
    {
      message: "مبلغ وارد شده نامعتبر است",
    },
  )
  .transform((val) => {
    const validation = persianInputUtils.validateCurrencyInput(val);
    return validation.value.toString();
  });

/**
 * Persian postal code validation schema
 */
export const persianPostalCodeSchema = z
  .string()
  .min(1, "کد پستی الزامی است")
  .transform((val) => val.trim())
  .refine(
    (val) => {
      const english = convertPersianToEnglish(val);
      return /^\d{10}$/.test(english.replace(/\s/g, ""));
    },
    {
      message: "کد پستی باید ۱۰ رقم باشد",
    },
  )
  .transform((val) => {
    const english = convertPersianToEnglish(val);
    return english.replace(/\s/g, "");
  });

/**
 * Persian national ID validation schema
 */
export const persianNationalIdSchema = z
  .string()
  .min(1, "کد ملی الزامی است")
  .transform((val) => val.trim())
  .refine(
    (val) => {
      const english = convertPersianToEnglish(val);
      return /^\d{10}$/.test(english);
    },
    {
      message: "کد ملی باید ۱۰ رقم باشد",
    },
  )
  .refine(
    (val) => {
      const english = convertPersianToEnglish(val);
      // Iranian national ID validation algorithm
      if (!/^\d{10}$/.test(english)) return false;

      const digits = english.split("").map(Number);
      const checkDigit = digits[9];
      const sum = digits.slice(0, 9).reduce((acc, digit, index) => {
        return acc + digit * (10 - index);
      }, 0);

      const remainder = sum % 11;
      return remainder < 2
        ? checkDigit === remainder
        : checkDigit === 11 - remainder;
    },
    {
      message: "کد ملی نامعتبر است",
    },
  )
  .transform((val) => convertPersianToEnglish(val));

/**
 * Persian text validation schema (with Persian character requirements)
 */
export const persianTextSchema = z
  .string()
  .transform((val) => val.trim())
  .refine((val) => val.length > 0, {
    message: "این فیلد نمی‌تواند خالی باشد",
  })
  .refine((val) => containsPersian(val), {
    message: "این فیلد باید شامل حروف فارسی باشد",
  });

/**
 * Persian name validation schema
 */
export const persianNameSchema = z
  .string()
  .min(2, "نام باید حداقل ۲ حرف باشد")
  .max(50, "نام نمی‌تواند بیش از ۵۰ حرف باشد")
  .transform((val) => val.trim())
  .refine((val) => /^[آ-ی\s]+$/.test(val), {
    message: "نام باید فقط شامل حروف فارسی و فاصله باشد",
  })
  .refine((val) => !/\s{2,}/.test(val), {
    message: "فاصله‌های متوالی مجاز نیستند",
  })
  .transform((val) => val.replace(/\s+/g, " ").trim());

/**
 * Persian address validation schema
 */
export const persianAddressSchema = z
  .string()
  .min(10, "آدرس باید حداقل ۱۰ حرف باشد")
  .max(500, "آدرس نمی‌تواند بیش از ۵۰۰ حرف باشد")
  .transform((val) => val.trim())
  .refine(
    (val) => {
      // Must contain at least some Persian characters or valid address patterns
      return containsPersian(val) || /[a-zA-Z0-9]/.test(val);
    },
    {
      message: "آدرس وارد شده نامعتبر است",
    },
  );

/**
 * Persian email validation with RTL support
 */
export const persianEmailSchema = z
  .string()
  .min(1, "ایمیل الزامی است")
  .transform((val) => val.trim().toLowerCase())
  .refine(
    (val) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(val);
    },
    {
      message: "فرمت ایمیل نامعتبر است",
    },
  )
  .refine(
    (val) => {
      // Additional Persian email domain validation
      const domain = val.split("@")[1];
      return !domain.includes(" ") && domain.length >= 3;
    },
    {
      message: "دامنه ایمیل نامعتبر است",
    },
  );

/**
 * Persian date validation schema
 */
export const persianDateSchema = z.string().refine(
  (val) => {
    // Support both Gregorian and Persian date formats
    const gregorianRegex = /^\d{4}-\d{2}-\d{2}$/;
    const persianRegex = /^\d{4}\/\d{2}\/\d{2}$/;

    if (gregorianRegex.test(val)) {
      const date = new Date(val);
      return date instanceof Date && !isNaN(date.getTime());
    }

    if (persianRegex.test(val)) {
      const [year, month, day] = val.split("/").map(Number);
      return (
        year >= 1300 &&
        year <= 1500 &&
        month >= 1 &&
        month <= 12 &&
        day >= 1 &&
        day <= 31
      );
    }

    return false;
  },
  {
    message: "فرمت تاریخ نامعتبر است (مثال: ۱۴۰۳/۱۲/۲۵ یا 2024-12-25)",
  },
);

/**
 * Persian form validation utilities
 */
export const persianValidationUtils = {
  /**
   * Validate Iranian bank card number
   */
  validateBankCard: (cardNumber: string): boolean => {
    const cleaned = convertPersianToEnglish(cardNumber).replace(/\s+/g, "");
    if (!/^\d{16}$/.test(cleaned)) return false;

    // Iranian bank card validation (simplified)
    const digits = cleaned.split("").map(Number);
    let sum = 0;

    for (let i = 0; i < 16; i++) {
      let digit = digits[i];
      if (i % 2 === 0) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }

    return sum % 10 === 0;
  },

  /**
   * Validate Iranian IBAN
   */
  validateIBAN: (iban: string): boolean => {
    const cleaned = iban.replace(/\s+/g, "").toUpperCase();
    if (!/^IR\d{24}$/.test(cleaned)) return false;

    // Iranian IBAN validation (simplified)
    // In a real implementation, you'd use the full IBAN validation algorithm
    return cleaned.length === 26 && cleaned.startsWith("IR");
  },

  /**
   * Validate Persian text for profanity (simplified)
   */
  validateProfanity: (text: string): boolean => {
    // This is a simplified profanity check - in production, you'd use a comprehensive list
    const profanityWords = ["badword1", "badword2"]; // Add actual profanity words
    const lowerText = text.toLowerCase();

    return !profanityWords.some((word) => lowerText.includes(word));
  },

  /**
   * Validate Persian business registration number
   */
  validateBusinessReg: (regNumber: string): boolean => {
    const cleaned = convertPersianToEnglish(regNumber).replace(/\s+/g, "");
    // Iranian business registration number format (simplified)
    return /^\d{11,12}$/.test(cleaned);
  },
};

/**
 * Complete Persian address form schema
 */
export const persianAddressFormSchema = z.object({
  firstName: persianNameSchema,
  lastName: persianNameSchema,
  mobile: persianMobileSchema,
  telephone: persianPhoneSchema.optional(),
  address_line1: persianAddressSchema,
  address_line2: z.string().optional(),
  city: persianTextSchema,
  state: persianTextSchema,
  postal_code: persianPostalCodeSchema,
  national_id: persianNationalIdSchema.optional(),
  email: persianEmailSchema.optional(),
});

/**
 * Persian user registration schema
 */
export const persianUserRegistrationSchema = z
  .object({
    firstName: persianNameSchema,
    lastName: persianNameSchema,
    email: persianEmailSchema,
    mobile: persianMobileSchema,
    password: z
      .string()
      .min(8, "رمز عبور باید حداقل ۸ حرف باشد")
      .regex(/[A-Z]/, "رمز عبور باید شامل حداقل یک حرف بزرگ باشد")
      .regex(/[a-z]/, "رمز عبور باید شامل حداقل یک حرف کوچک باشد")
      .regex(/\d/, "رمز عبور باید شامل حداقل یک عدد باشد"),
    confirmPassword: z.string(),
    nationalId: persianNationalIdSchema.optional(),
    birthDate: persianDateSchema.optional(),
    acceptTerms: z
      .boolean()
      .refine((val) => val === true, "شما باید شرایط و قوانین را بپذیرید"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "رمز عبور و تکرار آن یکسان نیستند",
    path: ["confirmPassword"],
  });

/**
 * Persian product search schema
 */
export const persianProductSearchSchema = z.object({
  query: z
    .string()
    .min(2, "جستجو باید حداقل ۲ حرف باشد")
    .max(100, "جستجو نمی‌تواند بیش از ۱۰۰ حرف باشد"),
  category: z.string().optional(),
  minPrice: persianCurrencySchema.optional(),
  maxPrice: persianCurrencySchema.optional(),
  brand: z.string().optional(),
  inStock: z.boolean().optional(),
});

/**
 * Persian order schema
 */
export const persianOrderSchema = z.object({
  customerName: persianNameSchema,
  customerMobile: persianMobileSchema,
  customerEmail: persianEmailSchema.optional(),
  shippingAddress: persianAddressSchema,
  billingAddress: persianAddressSchema.optional(),
  orderNotes: z
    .string()
    .max(500, "یادداشت نمی‌تواند بیش از ۵۰۰ حرف باشد")
    .optional(),
});

/**
 * Create Persian-aware form validator
 */
export function createPersianFormValidator<T extends z.ZodSchema>(
  schema: T,
  options: {
    language?: "fa" | "en";
    strict?: boolean;
    transformErrors?: boolean;
  } = {},
) {
  const { language = "fa", strict = false, transformErrors = true } = options;

  return (
    data: unknown,
  ):
    | { success: true; data: z.infer<T> }
    | { success: false; errors: Record<string, string> } => {
    try {
      const result = schema.parse(data);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};

        error.issues.forEach((err) => {
          const path = err.path.join(".");
          let message = err.message;

          if (transformErrors && language === "fa") {
            // Transform common validation messages to Persian
            message = message
              .replace("Required", "الزامی است")
              .replace("Invalid", "نامعتبر است")
              .replace("Too long", "بسیار طولانی")
              .replace("Too short", "بسیار کوتاه");
          }

          errors[path] = message;
        });

        return { success: false, errors };
      }

      return {
        success: false,
        errors: { general: "خطای نامشخص در اعتبارسنجی" },
      };
    }
  };
}

export type PersianAddressForm = z.infer<typeof persianAddressFormSchema>;
export type PersianUserRegistration = z.infer<
  typeof persianUserRegistrationSchema
>;
export type PersianProductSearch = z.infer<typeof persianProductSearchSchema>;
export type PersianOrder = z.infer<typeof persianOrderSchema>;
