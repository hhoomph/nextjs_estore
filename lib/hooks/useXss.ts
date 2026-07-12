/**
 * React Hook for XSS Protection
 *
 * Provides automatic HTML sanitization for user-generated content
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 * @security Critical for preventing XSS attacks
 */

'use client';

import { useEffect, useState } from 'react';
import { sanitizeHtml, sanitizeUrl, sanitizeText, sanitizeFilename } from '@/lib/security/xss';

/**
 * Hook for sanitizing HTML content
 *
 * @param content - Raw HTML content
 * @param options - Sanitization options
 * @returns Sanitized HTML content
 *
 * @example
 * ```typescript
 * const { sanitized } = useXss('<script>alert(1)</script><p>Hello</p>');
 * // Returns: <p>Hello</p>
 * ```
 */
export function useXss(
  content: string,
  options?: {
    tagName?: string;
    className?: string;
  },
): string {
  const [sanitized, setSanitized] = useState('');

  useEffect(() => {
    setSanitized(sanitizeHtml(content));
  }, [content]);

  return sanitized;
}

/**
 * Hook for sanitizing and wrapping content in a specific tag
 *
 * @param content - Raw content
 * @param tagName - Tag to wrap content in
 * @param className - CSS class to apply
 * @returns Sanitized content wrapped in a tag
 *
 * @example
 * ```typescript
 * const { html } = useXssTag('<p>Hello</p>', 'div', 'text-lg');
 * // Returns: <div class="text-lg"><p>Hello</p></div>
 * ```
 */
export function useXssTag(
  content: string,
  tagName: string,
  className?: string,
): string {
  const sanitized = useXss(content);

  return className
    ? `<${tagName} class="${className}">${sanitized}</${tagName}>`
    : `<${tagName}>${sanitized}</${tagName}>`;
}

/**
 * Hook for safe link generation
 *
 * @param href - Raw URL
 * @param text - Display text
 * @returns Safe HTML link
 *
 * @example
 * ```typescript
 * const { html } = useSafeLink('javascript:alert(1)', 'Click');
 * // Returns: Click (sanitized out)
 * ```
 */
export function useSafeLink(href: string, text?: string): string {
  const [html, setHtml] = useState(text || href);

  useEffect(() => {
    // Import the function dynamically to avoid SSR issues
    import('@/lib/security/xss').then(({ createSafeLink }) => {
      setHtml(createSafeLink(href, text));
    });
  }, [href, text]);

  return html;
}

/**
 * Hook for safe filename generation
 *
 * @param filename - Raw filename
 * @returns Sanitized filename
 *
 * @example
 * ```typescript
 * const { filename } = useSafeFilename('test<script>.jpg');
 * // Returns: 'test.jpg'
 * ```
 */
export function useSafeFilename(filename: string): string {
  const [safeFilename, setSafeFilename] = useState('');

  useEffect(() => {
    import('@/lib/security/xss').then(({ sanitizeFilename }) => {
      setSafeFilename(sanitizeFilename(filename));
    });
  }, [filename]);

  return safeFilename;
}

/**
 * Hook for validating email addresses
 *
 * @param email - Email to validate
 * @returns Validation result
 *
 * @example
 * ```typescript
 * const { isValid, email } = useEmailValidation('test@example.com');
 * // Returns: { isValid: true, email: 'test@example.com' }
 * ```
 */
export function useEmailValidation(initialEmail: string) {
  const [isValid, setIsValid] = useState(false);
  const [email, setEmail] = useState(initialEmail);

  useEffect(() => {
    import('@/lib/security/xss').then(({ isValidEmail }) => {
      const valid = isValidEmail(email);
      setIsValid(valid);
    });
  }, [email]);

  return { isValid, email };
}

/**
 * Hook for validating phone numbers
 *
 * @param phone - Phone number to validate
 * @returns Validation result
 *
 * @example
 * ```typescript
 * const { isValid, phone } = usePhoneValidation('+1234567890');
 * // Returns: { isValid: true, phone: '+1234567890' }
 * ```
 */
export function usePhoneValidation(initialPhone: string) {
  const [isValid, setIsValid] = useState(false);
  const [phone, setPhone] = useState(initialPhone);

  useEffect(() => {
    import('@/lib/security/xss').then(({ isValidPhone }) => {
      const valid = isValidPhone(phone);
      setIsValid(valid);
    });
  }, [phone]);

  return { isValid, phone };
}

/**
 * Hook for content sanitization with different modes
 *
 * @param content - Raw content
 * @param mode - Sanitization mode
 * @returns Sanitized content
 *
 * @example
 * ```typescript
 * const { text } = useSanitizeMode('<script>alert(1)</script>', 'text');
 * // Returns: '&lt;script&gt;alert(1)&lt;/script&gt;'
 * ```
 */
export function useSanitizeMode(
  content: string,
  mode: 'html' | 'text' | 'link' | 'filename' | 'email' | 'phone',
): string {
  const [sanitized, setSanitized] = useState('');

  useEffect(() => {
    const sanitize = async () => {
      const module = await import('@/lib/security/xss');
      switch (mode) {
        case 'html':
          setSanitized(module.sanitizeHtml(content));
          break;
        case 'text':
          setSanitized(module.sanitizeText(content));
          break;
        case 'link':
          setSanitized(module.sanitizeUrl(content) || content);
          break;
        case 'filename':
          setSanitized(module.sanitizeFilename(content));
          break;
        case 'email':
          setSanitized(content);
          break;
        case 'phone':
          setSanitized(content);
          break;
      }
    };

    sanitize();
  }, [content, mode]);

  return sanitized;
}
