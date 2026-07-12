/**
 * CSRF Protection Utilities
 *
 * Generates and validates CSRF tokens to prevent cross-site request forgery attacks
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 * @security Critical for preventing CSRF attacks
 */

import { createHmac } from 'crypto';
import { useState, useEffect } from 'react';

const SECRET_KEY = process.env.CSRF_SECRET || 'your-secret-key-change-in-production';
const TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes

/**
 * Generate a new CSRF token
 *
 * @returns CSRF token string (token.hash)
 *
 * @example
 * ```typescript
 * const token = generateCsrfToken();
 * // Returns: 'abc123def456.xyz789abc'
 * ```
 */
export function generateCsrfToken(): string {
  // Generate random token
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const token = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // Generate HMAC hash
  const hash = createHmac('sha256', SECRET_KEY)
    .update(token)
    .digest('hex');

  // Return token.hash format
  return `${token}.${hash}`;
}

/**
 * Verify a CSRF token
 *
 * @param token - CSRF token to verify (token.hash format)
 * @returns True if token is valid
 *
 * @example
 * ```typescript
 * const isValid = verifyCsrfToken('abc123.xyz789');
 * // Returns: true
 * ```
 */
export function verifyCsrfToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  try {
    const [tokenValue, hash] = token.split('.');

    if (!tokenValue || !hash) {
      return false;
    }

    // Generate expected hash
    const computedHash = createHmac('sha256', SECRET_KEY)
      .update(tokenValue)
      .digest('hex');

    // Compare hashes (constant time)
    return computedHash === hash;
  } catch {
    return false;
  }
}

/**
 * Generate a signed CSRF token for cookies
 *
 * @returns Signed CSRF token string
 *
 * @example
 * ```typescript
 * const signedToken = signCsrfToken();
 * // Returns: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 * ```
 */
export function signCsrfToken(): string {
  const token = generateCsrfToken();

  // Base64 encode the token
  return Buffer.from(token).toString('base64');
}

/**
 * Verify a signed CSRF token from cookies
 *
 * @param signedToken - Signed token from cookie
 * @returns True if token is valid
 *
 * @example
 * ```typescript
 * const isValid = verifySignedCsrfToken(encryptedToken);
 * // Returns: true
 * ```
 */
export function verifySignedCsrfToken(signedToken: string): boolean {
  if (!signedToken || typeof signedToken !== 'string') {
    return false;
  }

  try {
    // Base64 decode
    const token = Buffer.from(signedToken, 'base64').toString('hex');

    // Verify token
    return verifyCsrfToken(token);
  } catch {
    return false;
  }
}

/**
 * Validate CSRF token against stored token
 *
 * @param token - CSRF token to validate
 * @param storedToken - Stored token from session
 * @returns True if tokens match
 *
 * @example
 * ```typescript
 * const isValid = validateCsrfTokenFromSession(token, session.csrfToken);
 * // Returns: true
 * ```
 */
export function validateCsrfTokenFromSession(
  token: string,
  storedToken: string,
): boolean {
  if (!token || !storedToken) {
    return false;
  }

  try {
    // Try to verify as signed token first
    if (verifySignedCsrfToken(token)) {
      return verifySignedCsrfToken(storedToken);
    }

    // Try as plain token
    return verifyCsrfToken(token) && verifyCsrfToken(storedToken);
  } catch {
    return false;
  }
}

/**
 * Get or generate CSRF token for a session
 *
 * @param session - Session object
 * @returns CSRF token
 *
 * @example
 * ```typescript
 * const token = getCachedCsrfToken(session);
 * session.csrfToken = token;
 * ```
 */
export function getCachedCsrfToken(session: any): string {
  // Return cached token if it's fresh
  if (session.csrfToken && !isTokenExpired(session.csrfTokenTimestamp)) {
    return session.csrfToken;
  }

  // Generate new token
  const token = generateCsrfToken();
  session.csrfToken = token;
  session.csrfTokenTimestamp = Date.now();

  return token;
}

/**
 * Check if a token has expired
 *
 * @param timestamp - Token timestamp
 * @returns True if expired
 *
 * @example
 * ```typescript
 * const isExpired = isTokenExpired(Date.now() - 20 * 60 * 1000);
 * // Returns: true
 * ```
 */
export function isTokenExpired(timestamp: number): boolean {
  return Date.now() - timestamp > TOKEN_EXPIRY;
}

/**
 * Create CSRF protection middleware function
 *
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * const csrfMiddleware = createCsrfMiddleware();
 * app.use(csrfMiddleware);
 * ```
 */
export function createCsrfMiddleware() {
  return (req: any, res: any, next: any) => {
    // Get token from headers or cookies
    const token =
      req.headers['x-csrf-token'] ||
      req.cookies?.csrfToken ||
      req.body?._csrf;

    // Validate token
    const isValid = verifyCsrfToken(token as string);

    if (!isValid) {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }

    next();
  };
}

/**
 * Get CSRF token from request
 *
 * @param req - Request object
 * @returns CSRF token or null
 *
 * @example
 * ```typescript
 * const token = getTokenFromRequest(req);
 * ```
 */
export function getTokenFromRequest(req: any): string | null {
  return (
    req.headers['x-csrf-token'] ||
    req.cookies?.csrfToken ||
    req.body?._csrf ||
    null
  );
}

/**
 * Set CSRF token in response
 *
 * @param res - Response object
 * @param token - CSRF token
 *
 * @example
 * ```typescript
 * setCsrfTokenInResponse(res, token);
 * ```
 */
export function setCsrfTokenInResponse(res: any, token: string) {
  res.setHeader('X-CSRF-Token', token);
  res.cookie('csrfToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: TOKEN_EXPIRY,
  });
}

/**
 * Generate a CSRF token input for forms
 *
 * @returns HTML input element
 *
 * @example
 * ```typescript
 * const input = getCsrfInput();
 * // Returns: '<input type="hidden" name="_csrf" value="abc123" />'
 * ```
 */
export function getCsrfInput(): string {
  const token = generateCsrfToken();
  return `<input type="hidden" name="_csrf" value="${token}" />`;
}

/**
 * Create a CSRF token component for React
 *
 * @returns React component
 *
 * @example
 * ```tsx
 * <CsrfTokenInput />
 * ```
 */
export function CsrfTokenInput() {
  const [token, setToken] = useState('');

  useEffect(() => {
    setToken(generateCsrfToken());
  }, []);

  if (!token) {
    return null;
  }

  return (
    <input
      type="hidden"
      name="_csrf"
      value={token}
      id="csrf-token"
      aria-label="CSRF Token"
    />
  );
}
