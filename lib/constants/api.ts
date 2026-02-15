/**
 * Module for api
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
// API Constants
export const API_CONSTANTS = {
  // Pagination defaults
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 1,

  // Product status
  PRODUCT_STATUS_ACTIVE: 1,
  PRODUCT_STATUS_INACTIVE: 0,

  // Sort options
  SORT_FIELDS: {
    CREATED_AT: "createdAt",
    PRICE: "price",
    NAME: "name",
    RATING: "rating",
  } as const,

  SORT_ORDERS: {
    ASC: "asc",
    DESC: "desc",
  } as const,

  // Filter limits
  MAX_SEARCH_LENGTH: 100,
  MAX_PRICE_VALUE: 999999.99,

  // Image limits
  MAX_IMAGES_PER_PRODUCT: 10,
  MAX_IMAGE_DISPLAY_ORDER: 99,

  // Validation messages
  ERRORS: {
    UNAUTHORIZED: "Unauthorized - Admin access required",
    INVALID_CATEGORY: "Invalid category",
    PRODUCT_NOT_FOUND: "Product not found",
    MISSING_REQUIRED_FIELDS: "Missing required fields",
    INVALID_INPUT: "Invalid input data",
    INTERNAL_ERROR: "Internal server error",
    RATE_LIMIT_EXCEEDED: "Too many requests",
  },
} as const;

// Type helpers
export type SortField =
  (typeof API_CONSTANTS.SORT_FIELDS)[keyof typeof API_CONSTANTS.SORT_FIELDS];
export type SortOrder =
  (typeof API_CONSTANTS.SORT_ORDERS)[keyof typeof API_CONSTANTS.SORT_ORDERS];
