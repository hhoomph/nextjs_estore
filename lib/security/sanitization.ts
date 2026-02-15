/**
 * Module for sanitization
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import DOMPurify from "isomorphic-dompurify";
import { z } from "zod";
import { randomUUID } from "../utils/crypto-ssr";

// HTML sanitization
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "blockquote",
    ],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
  });
}

// SQL injection prevention (additional layer beyond Prisma)
export function sanitizeSqlInput(input: string): string {
  // Remove potentially dangerous SQL keywords and characters
  return input
    .replace(/;/g, "")
    .replace(/--/g, "")
    .replace(/\/\*/g, "")
    .replace(/\*\//g, "")
    .replace(/xp_/gi, "")
    .replace(/sp_/gi, "")
    .replace(/exec/gi, "")
    .replace(/union/gi, "")
    .replace(/select/gi, "")
    .replace(/insert/gi, "")
    .replace(/update/gi, "")
    .replace(/delete/gi, "")
    .replace(/drop/gi, "")
    .replace(/create/gi, "")
    .replace(/alter/gi, "")
    .replace(/truncate/gi, "")
    .trim();
}

// XSS prevention for general text input
export function sanitizeText(input: string): string {
  return input
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
}

// Email sanitization
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

// Filename sanitization for uploads
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.\-_]/g, "_") // Replace special chars with underscore
    .replace(/_{2,}/g, "_") // Replace multiple underscores with single
    .replace(/^_+|_+$/g, "") // Remove leading/trailing underscores
    .toLowerCase()
    .substring(0, 255); // Limit length
}

// URL validation and sanitization
export function sanitizeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    // Only allow http and https protocols
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error("Invalid protocol");
    }
    return parsedUrl.toString();
  } catch {
    throw new Error("Invalid URL");
  }
}

// Phone number sanitization
export function sanitizePhoneNumber(phone: string): string {
  return phone.replace(/[^\d+\-\s()]/g, "").trim();
}

// General input sanitization schema
export const sanitizedInputSchema = z.object({
  text: z.string().transform(sanitizeText),
  html: z.string().transform(sanitizeHtml),
  email: z.string().email().transform(sanitizeEmail),
  phone: z.string().transform(sanitizePhoneNumber),
  filename: z.string().transform(sanitizeFilename),
  url: z.string().url().transform(sanitizeUrl),
});

// Password strength validation
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
  score: number; // 0-4 scale
} {
  const errors: string[] = [];
  let score = 0;

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  } else {
    score += 1;
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  } else {
    score += 1;
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
    score: Math.min(score, 4),
  };
}

// Input validation with sanitization
export function validateAndSanitizeInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

// CSRF token generation and validation
export function generateCSRFToken(): string {
  return randomUUID();
}

export function validateCSRFToken(
  token: string,
  sessionToken: string,
): boolean {
  // Use constant-time comparison to prevent timing attacks
  if (token.length !== sessionToken.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ sessionToken.charCodeAt(i);
  }

  return result === 0;
}

// Request size validation
export const MAX_REQUEST_SIZE = 10 * 1024 * 1024; // 10MB

export function validateRequestSize(contentLength?: string | null): boolean {
  if (!contentLength) return true;

  const size = parseInt(contentLength, 10);
  return size <= MAX_REQUEST_SIZE;
}

// File upload validation
export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[]; // MIME types
  allowedExtensions?: string[]; // file extensions
}

export function validateFile(
  file: File,
  options: FileValidationOptions = {},
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const {
    maxSize = 5 * 1024 * 1024,
    allowedTypes = [],
    allowedExtensions = [],
  } = options;

  // Size validation
  if (file.size > maxSize) {
    errors.push(
      `File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`,
    );
  }

  // Type validation
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(
      `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
    );
  }

  // Extension validation
  if (allowedExtensions.length > 0) {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      errors.push(
        `File extension is not allowed. Allowed extensions: ${allowedExtensions.join(", ")}`,
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
