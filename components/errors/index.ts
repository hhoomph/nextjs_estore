/**
 * Error Boundaries Index
 *
 * Centralized exports for all error boundary components.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

// Main error boundary components
export {
  AdvancedErrorBoundary,
  withErrorBoundary,
} from "./advanced-error-boundary";
export { ApiErrorBoundary, withApiErrorBoundary } from "./api-error-boundary";
export {
  FormErrorBoundary,
  withFormErrorBoundary,
} from "./form-error-boundary";
