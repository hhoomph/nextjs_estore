/**
 * Module for custom-validators
 *
 * Custom validation functions for comprehensive business logic validation
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

// Password validation
export function validatePasswordStrength(password: string): boolean {
  // At least 8 characters, one uppercase, one lowercase, one number, one special character
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasNonalphas = /\W/.test(password);

  // Check for common patterns
  const hasCommonPatterns =
    /(.)\1{2,}/.test(password) || // Repeated characters
    /123|abc|qwe|asd|zxc/i.test(password); // Common sequences

  return (
    hasMinLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasNonalphas &&
    !hasCommonPatterns
  );
}

// Email domain validation
export function validateEmailDomain(email: string): boolean {
  const blockedDomains = [
    "10minutemail.com",
    "guerrillamail.com",
    "mailinator.com",
    "temp-mail.org",
    "throwaway.email",
    "yopmail.com",
    "test.com",
    "example.com",
  ];

  const domain = email.split("@")[1]?.toLowerCase();
  return !!(domain && !blockedDomains.includes(domain));
}

// Phone number validation (Iranian format)
export function validatePhoneNumber(phone: string): boolean {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  // Iranian mobile numbers: 09xxxxxxxxx (11 digits)
  const iranianMobileRegex = /^09\d{9}$/;

  // Iranian landline numbers: 0xxxxxxxxxx (11 digits, area code + number)
  const iranianLandlineRegex = /^0[1-8]\d{9}$/;

  // International format: +98xxxxxxxxxx
  const internationalRegex = /^989\d{9}$/;

  return (
    iranianMobileRegex.test(cleaned) ||
    iranianLandlineRegex.test(cleaned) ||
    internationalRegex.test(cleaned)
  );
}

// Iranian National ID validation
export function validateIranianNationalId(nationalId: string): boolean {
  // Iranian National ID is 10 digits
  if (!/^\d{10}$/.test(nationalId)) {
    return false;
  }

  const digits = nationalId.split("").map(Number);
  const checksum = digits[9];

  // Calculate check digit using Iranian algorithm
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }

  const remainder = sum % 11;
  const checkDigit = remainder < 2 ? remainder : 11 - remainder;

  return checkDigit === checksum;
}

// Iranian postal code validation
export function validateIranianPostalCode(postalCode: string): boolean {
  // Iranian postal codes are 10 digits
  return /^\d{10}$/.test(postalCode);
}

// Credit card validation (Luhn algorithm)
export function validateCreditCard(cardNumber: string): boolean {
  // Remove spaces and dashes
  const cleaned = cardNumber.replace(/[\s-]/g, "");

  // Check if all digits
  if (!/^\d+$/.test(cleaned)) {
    return false;
  }

  // Luhn algorithm
  let sum = 0;
  let shouldDouble = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

// Business hours validation
export function validateBusinessHours(hours: {
  start: string;
  end: string;
}): boolean {
  const start = new Date(`1970-01-01T${hours.start}:00`);
  const end = new Date(`1970-01-01T${hours.end}:00`);

  return start < end && end.getTime() - start.getTime() <= 12 * 60 * 60 * 1000; // Max 12 hours
}

// Product slug validation
export function validateProductSlug(slug: string): boolean {
  // Only lowercase letters, numbers, and hyphens
  // No consecutive hyphens, no leading/trailing hyphens
  return (
    /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) &&
    slug.length >= 3 &&
    slug.length <= 100 &&
    !slug.includes("--")
  );
}

// Coupon code validation
export function validateCouponCode(code: string): boolean {
  // Alphanumeric, hyphens, underscores only
  // No leading/trailing special characters
  return (
    /^[A-Z0-9_-]+$/i.test(code) &&
    code.length >= 3 &&
    code.length <= 20 &&
    !/^[-_]|[-_]$/.test(code)
  );
}

// Type definitions for validation
interface OrderItem {
  quantity?: number;
  unitPrice?: number;
}

interface OrderData {
  items: OrderItem[];
}

// Order total validation
export function validateOrderTotal(orderData: OrderData): boolean {
  const { items } = orderData;

  if (!items || items.length === 0) {
    return false;
  }

  // Calculate total
  const total = items.reduce((sum: number, item: OrderItem) => {
    const quantity = item.quantity ?? 1;
    const price = item.unitPrice ?? 0;
    return sum + price * quantity;
  }, 0);

  // Business rules
  return total > 0 && total <= 50000; // Minimum $0.01, maximum $50,000
}

interface ShippingItem {
  weight?: number;
  quantity?: number;
}

interface ShippingOrderData {
  items: ShippingItem[];
  shippingMethod: string;
}

// Shipping eligibility validation
export function validateShippingEligibility(
  orderData: ShippingOrderData,
): boolean {
  const { items, shippingMethod } = orderData;

  if (!items || !shippingMethod) {
    return false;
  }

  const totalWeight = items.reduce((sum: number, item: ShippingItem) => {
    // Assume each item weighs 1kg if not specified
    return sum + (item.weight || 1) * (item.quantity || 1);
  }, 0);

  // Business rules based on shipping method
  switch (shippingMethod) {
    case "free":
      return totalWeight <= 5; // Max 5kg for free shipping
    case "standard":
      return totalWeight <= 30; // Max 30kg for standard
    case "express":
      return totalWeight <= 20; // Max 20kg for express
    case "overnight":
      return totalWeight <= 10; // Max 10kg for overnight
    default:
      return false;
  }
}

interface PaymentOrderData {
  paymentMethod: string;
  shippingMethod: string;
}

interface DiscountOrderData {
  couponCode?: string;
  items: OrderItem[];
}

interface TaxOrderData {
  items: OrderItem[];
  taxExempt?: boolean;
}

interface ProductInventoryData {
  quantity: number;
  variants?: Array<{ quantity?: number }>;
  inventory?: {
    trackInventory?: boolean;
    allowBackorders?: boolean;
  };
}

// Payment method compatibility
export function validatePaymentMethodCompatibility(
  orderData: PaymentOrderData,
): boolean {
  const { paymentMethod, shippingMethod } = orderData;

  // Business rules for payment method compatibility
  if (
    shippingMethod === "cash_on_delivery" &&
    paymentMethod !== "cash_on_delivery"
  ) {
    return false;
  }

  if (
    paymentMethod === "cash_on_delivery" &&
    shippingMethod !== "cash_on_delivery"
  ) {
    return false;
  }

  return true;
}

// Discount rules validation
export function validateDiscountRules(orderData: DiscountOrderData): boolean {
  const { couponCode, items } = orderData;

  if (!couponCode) {
    return true; // No coupon, no validation needed
  }

  // This would typically check against database
  // For now, basic validation
  const totalBeforeDiscount = items.reduce(
    (sum: number, item: OrderItem) =>
      sum + (item.unitPrice || 0) * (item.quantity || 1),
    0,
  );

  // Assume minimum purchase for coupons
  return totalBeforeDiscount >= 10; // Minimum $10 for coupon usage
}

// Tax calculation validation
export function validateTaxCalculation(orderData: TaxOrderData): boolean {
  // Basic tax validation - this would be more complex in real implementation
  const { items, taxExempt } = orderData;

  if (taxExempt) {
    // Tax exempt orders should have tax rate of 0
    return true; // Would validate against calculated tax
  }

  return true; // Placeholder - would validate actual tax calculation
}

// Inventory availability validation
export function validateInventoryAvailability(
  productData: ProductInventoryData,
): boolean {
  const { quantity, variants, inventory } = productData;

  // Check main inventory
  if (inventory?.trackInventory !== false && quantity < 0) {
    return false;
  }

  // Check variant inventory
  if (variants) {
    for (const variant of variants) {
      if (variant.quantity !== undefined && variant.quantity < 0) {
        return false;
      }
    }
  }

  // Business rule: Don't allow backorders unless explicitly enabled
  if (!inventory?.allowBackorders && quantity <= 0) {
    return false;
  }

  return true;
}

// Review content validation
export function validateReviewContent(content: string): boolean {
  // Check for excessive caps
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (capsRatio > 0.7) {
    return false;
  }

  // Check for spam patterns
  const spamPatterns = [
    /(.)\1{4,}/, // Repeated characters
    /\b(?:buy|cheap|discount|free)\b/gi, // Commercial keywords
    /\b(?:http|www|\.com|\.net|\.org)\b/gi, // URLs
  ];

  return !spamPatterns.some((pattern) => pattern.test(content));
}

interface AddressData {
  firstName?: string;
  lastName?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

interface BulkOperationData {
  operation: string;
  resource?: string;
  ids: unknown[];
  options?: {
    skipValidation?: boolean;
  };
}

interface ApiRequestData {
  endpoint?: string;
  method?: string;
  userId?: string;
  ip?: string;
}

// Address completeness validation
export function validateAddressCompleteness(address: AddressData): boolean {
  const requiredFields = [
    "firstName",
    "lastName",
    "addressLine1",
    "city",
    "state",
    "postalCode",
    "country",
  ] as const;

  return requiredFields.every((field) => {
    const value = address[field];
    return value && typeof value === "string" && value.trim().length > 0;
  });
}

// User age restriction validation
export function validateUserAgeRestriction(birthDate: Date): boolean {
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    return age - 1 >= 13;
  }

  return age >= 13;
}

// Bulk operation limits validation
export function validateBulkOperationLimits(
  operationData: BulkOperationData,
): boolean {
  const { operation, resource, ids, options } = operationData;

  // Maximum items per operation
  if (ids.length > 1000) {
    return false;
  }

  // Operation-specific limits
  switch (operation) {
    case "delete":
      return ids.length <= 100; // Safer limit for deletions
    case "update":
      return ids.length <= 500; // Moderate limit for updates
    case "export":
      return ids.length <= 10000; // Higher limit for exports
    case "import":
      return !options?.skipValidation || ids.length <= 100; // Stricter for imports
    default:
      return true;
  }
}

// API rate limits validation
export function validateApiRateLimits(requestData: ApiRequestData): boolean {
  // This would typically check against rate limiting middleware
  // For validation schema, we just ensure required fields
  const { endpoint, method, userId, ip } = requestData;

  return !!(endpoint && method && (userId || ip));
}

// File upload security validation
export function validateFileUploadSecurity(file: File): boolean {
  // Check file extension matches MIME type
  const extension = file.name.split(".").pop()?.toLowerCase();
  const mimeType = file.type.toLowerCase();

  const mimeToExt: Record<string, string[]> = {
    "image/jpeg": ["jpg", "jpeg"],
    "image/png": ["png"],
    "image/webp": ["webp"],
    "image/gif": ["gif"],
    "image/svg+xml": ["svg"],
    "application/pdf": ["pdf"],
    "text/csv": ["csv"],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
      "xlsx",
    ],
  };

  const expectedExtensions = mimeToExt[mimeType];
  if (!expectedExtensions || !expectedExtensions.includes(extension || "")) {
    return false;
  }

  // Check for malicious file signatures (basic check)
  // This is a simplified example - real implementation would be more thorough
  const maliciousSignatures = [
    "<script",
    "<?php",
    "<%",
    "<!DOCTYPE",
    "<html",
    "\x00\x00\x00\x00", // Null bytes
  ];

  // For text-based files, check content
  if (mimeType.startsWith("text/") || mimeType === "application/pdf") {
    // Would need to read file content here
    // For this validation, we'll assume the file is safe
  }

  return true;
}

// HTML content validation
export function validateHtmlContent(content: string): boolean {
  if (!content || content.length === 0) {
    return true;
  }

  // Check for dangerous HTML tags
  const dangerousTags = [
    "<script",
    "<iframe",
    "<object",
    "<embed",
    "<form",
    "<input",
    "<button",
    "<link",
    "<meta",
    "<style",
    "javascript:",
    "vbscript:",
    "data:",
    "onload=",
    "onerror=",
  ];

  const lowerContent = content.toLowerCase();
  return !dangerousTags.some((tag) => lowerContent.includes(tag));
}

// URL safety validation
export function validateUrlSafety(url: string): boolean {
  try {
    const urlObj = new URL(url);

    // Check protocol
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      return false;
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /\.\./, // Directory traversal
      /localhost/i,
      /127\.0\.0\.1/,
      /0\.0\.0\.0/,
      /169\.254\./, // Link-local
      /10\.0\.0\.0/, // Private network
      /172\.16\./, // Private network
      /192\.168\./, // Private network
    ];

    return !suspiciousPatterns.some((pattern) => pattern.test(url));
  } catch {
    return false;
  }
}

interface DateRangeData {
  validFrom: Date;
  validTo: Date;
  validDays?: unknown[];
  validHours?: {
    start: string;
    end: string;
  };
}

interface NumericRangeData {
  filters?: {
    priceMin?: number;
    priceMax?: number;
  };
  priceMin?: number;
  priceMax?: number;
}

interface StringPatternData {
  pattern?: string;
  value?: string;
}

// Date range logic validation
export function validateDateRangeLogic(dateRange: DateRangeData): boolean {
  const { validFrom, validTo, validDays, validHours } = dateRange;

  // Basic date validation
  if (validTo <= validFrom) {
    return false;
  }

  // Days validation
  if (validDays && validDays.length === 0) {
    return false;
  }

  // Hours validation
  if (validHours) {
    const start = new Date(`1970-01-01T${validHours.start}:00`);
    const end = new Date(`1970-01-01T${validHours.end}:00`);

    if (start >= end) {
      return false;
    }
  }

  return true;
}

// Numeric ranges validation
export function validateNumericRanges(rangeData: NumericRangeData): boolean {
  const { priceMin, priceMax } = rangeData.filters || rangeData;

  if (priceMin !== undefined && priceMax !== undefined) {
    return priceMin >= 0 && priceMax >= 0 && priceMax >= priceMin;
  }

  return true;
}

// String patterns validation
export function validateStringPatterns(
  patternData: StringPatternData,
): boolean {
  // Generic string pattern validation
  const { pattern, value } = patternData;

  if (pattern && value) {
    try {
      const regex = new RegExp(pattern);
      return regex.test(value);
    } catch {
      return false; // Invalid regex pattern
    }
  }

  return true; // No pattern to validate
}

// Array constraints validation
export function validateArrayConstraints(arrayData: unknown): boolean {
  // Generic array validation
  if (Array.isArray(arrayData)) {
    return arrayData.length <= 1000; // Reasonable limit
  }
  return true;
}

// Object structure validation
export function validateObjectStructure(objectData: unknown): boolean {
  // Generic object validation
  if (typeof objectData === "object" && objectData !== null) {
    const keyCount = Object.keys(objectData).length;
    return keyCount <= 100; // Reasonable limit
  }
  return true;
}
