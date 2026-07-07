/**
 * Cart Configuration Constants
 *
 * Centralized constants for cart-related operations to eliminate magic numbers.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

export const CART_CONSTANTS = {
  /** Interval in ms for periodic cart sync with server */
  SYNC_INTERVAL: 30000,
  /** Duration in ms for checkout session expiry (30 minutes) */
  CHECKOUT_SESSION_DURATION: 30 * 60 * 1000,
  /** Maximum allowed quantity per cart item */
  MAX_QUANTITY: 999,
  /** Prefix for guest user IDs */
  GUEST_ID_PREFIX: "guest_",
  /** Maximum number of retry attempts for API calls */
  MAX_RETRIES: 3,
  /** Base backoff delay in ms for retry logic */
  RETRY_BACKOFF_MS: 1000,
  /** Storage key for cart items in sessionStorage */
  STORAGE_KEY_ITEMS: "cart-items",
  /** Storage key for last sync timestamp in localStorage */
  STORAGE_KEY_LAST_SYNC: "cart-last-sync",
  /** Storage key for guest ID in localStorage */
  STORAGE_KEY_GUEST_ID: "cart-guest-id",
} as const;

export type CartConstant = (typeof CART_CONSTANTS)[keyof typeof CART_CONSTANTS];