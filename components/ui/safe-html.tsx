/**
 * Safe HTML Component
 *
 * Renders sanitized HTML content with XSS protection
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 * @security Critical for preventing XSS attacks
 */

'use client';

import { useEffect, useState } from 'react';
import { sanitizeHtml } from '@/lib/security/xss';

interface SafeHtmlProps {
  content: string;
  className?: string;
  tagName?: string;
  role?: string;
  'aria-label'?: string;
}

/**
 * Safe HTML Component
 *
 * Renders HTML content with XSS protection
 *
 * @param content - Raw HTML content
 * @param className - CSS class to apply
 * @param tagName - Tag name to wrap content in
 *
 * @example
 * ```tsx
 * <SafeHtml content="<p>Hello</p><script>alert(1)</script>" className="text-lg" />
 * // Renders: <div class="text-lg"><p>Hello</p></div>
 * ```
 */
export function SafeHtml({
  content,
  className,
  tagName = 'div',
  role = 'article',
  'aria-label': ariaLabel,
}: SafeHtmlProps) {
  const [sanitized, setSanitized] = useState('');

  useEffect(() => {
    setSanitized(sanitizeHtml(content));
  }, [content]);

  if (!sanitized) {
    return null;
  }

  const Component = tagName as any;

  return (
    <Component
      className={className}
      role={role}
      aria-label={ariaLabel}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}

/**
 * Safe Link Component
 *
 * Renders a sanitized link with XSS protection
 *
 * @param href - Link URL
 * @param text - Display text
 * @param className - CSS class to apply
 * @param newTab - Open in new tab
 *
 * @example
 * ```tsx
 * <SafeLink href="https://example.com" text="Click here" className="text-blue-500" />
 * ```
 */
export function SafeLink({
  href,
  text,
  className,
  newTab = true,
}: {
  href: string;
  text: string;
  className?: string;
  newTab?: boolean;
}) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    import('@/lib/security/xss').then(({ createSafeLink }) => {
      setHtml(createSafeLink(href, text));
    });
  }, [href, text]);

  if (!html) {
    return null;
  }

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Safe Image Component
 *
 * Renders an image with XSS protection
 *
 * @param src - Image URL
 * @param alt - Alt text
 * @param className - CSS class to apply
 *
 * @example
 * ```tsx
 * <SafeImage src="/image.jpg" alt="Product image" className="w-full" />
 * ```
 */
export function SafeImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [safeSrc, setSafeSrc] = useState<string | null>(null);

  useEffect(() => {
    import('@/lib/security/xss').then(({ sanitizeUrl }) => {
      const url = sanitizeUrl(src);
      setSafeSrc(url);
    });
  }, [src]);

  if (!safeSrc) {
    return null;
  }

  return (
    <img
      src={safeSrc}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
}

/**
 * Sanitized Content Wrapper Component
 *
 * Wrapper component for various content types with XSS protection
 *
 * @param type - Content type
 * @param content - Raw content
 * @param className - CSS class to apply
 *
 * @example
 * ```tsx
 * <SanitizedContent type="html" content="<p>Hello</p>" className="text-lg" />
 * ```
 */
export function SanitizedContent({
  type,
  content,
  className,
}: {
  type: 'html' | 'text' | 'link' | 'filename' | 'email' | 'phone';
  content: string;
  className?: string;
}) {
  const [sanitized, setSanitized] = useState('');

  useEffect(() => {
    import('@/lib/security/xss').then((module) => {
      switch (type) {
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
    });
  }, [type, content]);

  if (!sanitized) {
    return null;
  }

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}

/**
 * Safe List Component
 *
 * Renders a sanitized list with XSS protection
 *
 * @param items - Array of list items
 * @param className - CSS class to apply
 *
 * @example
 * ```tsx
 * <SafeList items={['Item 1', '<script>alert(1)</script>']} className="list-disc" />
 * ```
 */
export function SafeList({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  return (
    <ul className={className}>
      {items.map((item, index) => (
        <li key={index}>
          <SafeHtml content={item} />
        </li>
      ))}
    </ul>
  );
}

/**
 * Safe Blockquote Component
 *
 * Renders a sanitized blockquote with XSS protection
 *
 * @param quote - Quote text
 * @param author - Author name
 * @param className - CSS class to apply
 *
 * @example
 * ```tsx
 * <SafeBlockquote quote="<p>This is a quote</p>" author="John Doe" />
 * ```
 */
export function SafeBlockquote({
  quote,
  author,
  className,
}: {
  quote: string;
  author?: string;
  className?: string;
}) {
  return (
    <blockquote className={className}>
      <SafeHtml content={quote} />
      {author && (
        <footer>
          <cite>{author}</cite>
        </footer>
      )}
    </blockquote>
  );
}
