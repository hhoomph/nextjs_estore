/**
 * Fetch with Retry Utility
 *
 * Wraps the native fetch API with exponential backoff retry logic
 * for improved resilience against transient network failures.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import { CART_CONSTANTS } from "@/lib/constants/cart";

export interface FetchWithRetryOptions extends RequestInit {
  /** Maximum number of retry attempts (default: MAX_RETRIES) */
  retries?: number;
  /** Base backoff delay in ms (default: RETRY_BACKOFF_MS) */
  backoffMs?: number;
  /** Called before each retry attempt with the attempt number and error */
  onRetry?: (attempt: number, error: unknown) => void;
}

/**
 * Fetches a URL with automatic retry on failure using exponential backoff.
 *
 * Retries only on network errors and 5xx server errors. 4xx client errors
 * are treated as non-retryable and are returned immediately.
 *
 * @param url - The URL to fetch
 * @param options - Fetch options with retry configuration
 * @returns The fetch Response object
 * @throws Error if all retry attempts are exhausted
 *
 * @example
 * ```ts
 * const response = await fetchWithRetry('/api/cart/sync', {
 *   method: 'POST',
 *   body: JSON.stringify(items),
 *   retries: 3,
 * });
 * ```
 */
export async function fetchWithRetry(
  url: string,
  options: FetchWithRetryOptions = {},
): Promise<Response> {
  const {
    retries = CART_CONSTANTS.MAX_RETRIES,
    backoffMs = CART_CONSTANTS.RETRY_BACKOFF_MS,
    onRetry,
    ...fetchOptions
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);

      // Only retry on server errors (5xx). Client errors (4xx) are final.
      if (!response.ok && response.status >= 500 && attempt < retries) {
        const error = new Error(
          `Server error ${response.status}: ${response.statusText}`,
        );
        onRetry?.(attempt + 1, error);
        await delay(backoffMs * Math.pow(2, attempt));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;

      if (attempt < retries) {
        onRetry?.(attempt + 1, error);
        await delay(backoffMs * Math.pow(2, attempt));
      }
    }
  }

  throw new Error(
    `Request to ${url} failed after ${retries + 1} attempts: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
  );
}

/**
 * Delays execution for the specified number of milliseconds.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}