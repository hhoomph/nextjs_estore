/**
 * Standardized Error Handler
 *
 * Provides consistent error handling across the application with
 * logging, toast notifications, and re-throwing.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly context?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NetworkError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "NetworkError";
  }
}

export interface ErrorHandlerOptions {
  /** Log the error to console */
  log?: boolean;
  /** Re-throw the error after handling */
  rethrow?: boolean;
  /** Context label for logging */
  context?: string;
}

/**
 * Handles errors in a standardized way.
 *
 * Provides logging, toast notification support, and optional re-throwing.
 * Designed to be framework-agnostic - toast integration is handled by
 * the caller or via the store layer.
 *
 * @param error - The error to handle
 * @param options - Handling options
 * @returns The error message string
 *
 * @example
 * ```ts
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   ErrorHandler.handle(error, { context: 'cart-sync', log: true });
 * }
 * ```
 */
export class ErrorHandler {
  static handle(error: unknown, options: ErrorHandlerOptions = {}): string {
    const { log = true, context } = options;
    const message = this.extractMessage(error);
    const prefix = context ? `[${context}]` : "";

    if (log) {
      console.error(`${prefix} ${message}`, error);
    }

    if (options.rethrow) {
      throw error instanceof Error ? error : new Error(message);
    }

    return message;
  }

  static extractMessage(error: unknown): string {
    if (error instanceof ApiError) return error.message;
    if (error instanceof NetworkError) return error.message;
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    return "An unexpected error occurred";
  }

  static isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
  }

  static isNetworkError(error: unknown): error is NetworkError {
    return error instanceof NetworkError;
  }
}