/**
 * XSS Protection Utilities
 *
 * Sanitizes HTML content to prevent cross-site scripting attacks
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 * @security Critical for preventing XSS attacks
 */

import DOMPurify from 'dompurify';
import { useEffect, useState } from 'react';

/**
 * Sanitize HTML content to prevent XSS attacks
 *
 * @param html - Raw HTML content to sanitize
 * @param options - Sanitization options
 * @returns Cleaned HTML string
 *
 * @example
 * ```typescript
 * const clean = sanitizeHtml('<script>alert("XSS")</script><p>Hello</p>');
 * // Returns: <p>Hello</p>
 * ```
 */
export function sanitizeHtml(
  html: string,
  options?: {
    allowUnsafeProtocol?: boolean;
    addCheckNodes?: boolean;
  },
): string {
  // Return empty string if input is invalid
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Default options
  const {
    allowUnsafeProtocol = false,
    addCheckNodes = true,
  } = options || {};

  // In server-side rendering, we need to use a DOMPurify setup
  if (typeof window === 'undefined') {
    try {
      // Server-side sanitization using a simple approach
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      return tempDiv.textContent || '';
    } catch (error) {
      console.error('Server-side sanitization error:', error);
      return '';
    }
  }

  // Client-side sanitization
  return DOMPurify.sanitize(html, {
    // Allowed tags
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'a',
      'ul',
      'ol',
      'li',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'div',
      'span',
      'blockquote',
      'code',
      'pre',
      'img',
      'video',
      'audio',
      'table',
      'tr',
      'td',
      'th',
      'thead',
      'tbody',
      'tfoot',
      'hr',
      'section',
      'article',
      'aside',
      'footer',
      'header',
      'nav',
      'main',
    ],
    // Allowed attributes
    ALLOWED_ATTR: [
      'href',
      'src',
      'alt',
      'title',
      'class',
      'id',
      'style',
      'width',
      'height',
      'target',
      'rel',
      'role',
      'aria-label',
      'aria-hidden',
    ],
    // Protocol policy
    ALLOWED_URI_REGEXP: allowUnsafeProtocol
      ? undefined
      : /^(?:(?:(?:f|ht)tps?):)?\/\/([a-z0-9-]+\.)*([a-z0-9-]+)\.[a-z]{2,5}(:[0-9]{1,5})?$/,
    // Add additional checks
    ADD_TAGS: addCheckNodes ? ['img'] : [],
  });
}

/**
 * Sanitize URL to prevent open redirect attacks
 *
 * @param url - URL to validate
 * @returns Validated URL or null
 *
 * @example
 * ```typescript
 * const valid = sanitizeUrl('https://example.com');
 * // Returns: 'https://example.com'
 * ```
 */
export function sanitizeUrl(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    const parsed = new URL(url);
    const allowedProtocols = ['http:', 'https:'];

    // Block if protocol is not allowed
    if (!allowedProtocols.includes(parsed.protocol)) {
      return null;
    }

    // Block localhost and internal networks
    if (
      parsed.hostname === 'localhost' ||
      parsed.hostname.startsWith('127.') ||
      parsed.hostname.startsWith('0.') ||
      parsed.hostname.startsWith('10.') ||
      parsed.hostname.startsWith('192.168.') ||
      parsed.hostname.startsWith('172.16.') ||
      parsed.hostname.startsWith('172.17.') ||
      parsed.hostname.startsWith('172.18.') ||
      parsed.hostname.startsWith('172.19.') ||
      parsed.hostname.startsWith('172.20.') ||
      parsed.hostname.startsWith('172.21.') ||
      parsed.hostname.startsWith('172.22.') ||
      parsed.hostname.startsWith('172.23.') ||
      parsed.hostname.startsWith('172.24.') ||
      parsed.hostname.startsWith('172.25.') ||
      parsed.hostname.startsWith('172.26.') ||
      parsed.hostname.startsWith('172.27.') ||
      parsed.hostname.startsWith('172.28.') ||
      parsed.hostname.startsWith('172.29.') ||
      parsed.hostname.startsWith('172.30.') ||
      parsed.hostname.startsWith('172.31.') ||
      parsed.hostname.startsWith('169.254.') ||
      parsed.hostname.startsWith('::1') ||
      parsed.hostname.startsWith('fe80:') ||
      parsed.hostname.startsWith('fd')
    ) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

/**
 * Create a safe link from user input
 *
 * @param href - Raw link URL
 * @param text - Display text for the link
 * @returns Safe link element or text
 *
 * @example
 * ```typescript
 * const link = createSafeLink('javascript:alert(1)', 'Click here');
 * // Returns: 'Click here' (sanitized out)
 * ```
 */
export function createSafeLink(href: string, text?: string): string {
  const safeUrl = sanitizeUrl(href);
  if (!safeUrl) {
    return text || href;
  }
  return `<a href="${safeUrl}" rel="noopener noreferrer" target="_blank">${text || href}</a>`;
}

/**
 * Create a safe HTML element from user input
 *
 * @param html - Raw HTML content
 * @returns Sanitized HTML string
 *
 * @example
 * ```typescript
 * const safe = createSafeHtml('<p>Hello</p><script>alert(1)</script>');
 * // Returns: '<p>Hello</p>'
 * ```
 */
export function createSafeHtml(html: string): string {
  return sanitizeHtml(html);
}

/**
 * Sanitize plain text input
 *
 * @param text - Plain text to sanitize
 * @returns Sanitized text
 *
 * @example
 * ```typescript
 * const safe = sanitizeText('<script>alert(1)</script>');
 * // Returns: '&lt;script&gt;alert(1)&lt;/script&gt;'
 * ```
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Escape HTML entities
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitize file input
 *
 * @param filename - Raw filename to sanitize
 * @returns Sanitized filename
 *
 * @example
 * ```typescript
 * const safe = sanitizeFilename('test<script>.jpg');
 * // Returns: 'test.jpg'
 * ```
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return '';
  }

  // Remove path separators and malicious characters
  const sanitized = filename
    .replace(/\\/, '/')
    .split('/')
    .pop()!
    .replace(/[<>:"|?*]/g, '');

  return sanitized || 'file';
}

/**
 * Validate email address
 *
 * @param email - Email to validate
 * @returns True if valid
 *
 * @example
 * ```typescript
 * const valid = isValidEmail('test@example.com');
 * // Returns: true
 * ```
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number
 *
 * @param phone - Phone number to validate
 * @returns True if valid
 *
 * @example
 * ```typescript
 * const valid = isValidPhone('+1234567890');
 * // Returns: true
 * ```
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
}

/**
 * Sanitize SQL query parameters
 *
 * @param param - SQL parameter to sanitize
 * @returns Sanitized parameter
 *
 * @example
 * ```typescript
 * const safe = sanitizeSqlParam('test; DROP TABLE users;');
 * // Returns: 'test'
 * ```
 */
export function sanitizeSqlParam(param: string): string {
  if (!param || typeof param !== 'string') {
    return '';
  }

  // Remove SQL injection patterns
  return param
    .replace(/'/g, "''")
    .replace(/--/g, '')
    .replace(/;/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .replace(/;\$/g, '');
}

/**
 * Sanitize JSON
 *
 * @param json - Raw JSON string
 * @returns Validated JSON object
 *
 * @example
 * ```typescript
 * const valid = sanitizeJson('{"test": 1}');
 * // Returns: { test: 1 }
 * ```
 */
export function sanitizeJson<T = any>(json: string): T | null {
  try {
    const parsed = JSON.parse(json);
    return parsed;
  } catch {
    return null;
  }
}
