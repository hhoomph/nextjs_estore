/**
 * Form Error Boundary Component
 *
 * Specialized error boundary for form-related errors with validation feedback,
 * submission error handling, and form state recovery.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import {
  AlertTriangle,
  CheckCircle,
  FileText,
  RefreshCw,
  Save,
} from "lucide-react";
import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface FormErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  formData: Record<string, any> | null;
  validationErrors: Record<string, string[]> | null;
  submissionErrors: string[] | null;
  lastValidState: Record<string, any> | null;
  canRecover: boolean;
}

interface FormErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  enableRecovery?: boolean;
  onFormDataCapture?: (data: Record<string, any>) => void;
  onValidationError?: (errors: Record<string, string[]>) => void;
  onSubmissionError?: (errors: string[]) => void;
  onRecovery?: (recoveredData: Record<string, any>) => void;
}

export class FormErrorBoundary extends Component<
  FormErrorBoundaryProps,
  FormErrorBoundaryState
> {
  constructor(props: FormErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      formData: null,
      validationErrors: null,
      submissionErrors: null,
      lastValidState: null,
      canRecover: false,
    };
  }

  static getDerivedStateFromError(
    error: Error,
  ): Partial<FormErrorBoundaryState> {
    // Determine if this is a form-related error
    const isFormError = FormErrorBoundary.isFormRelatedError(error);

    return {
      hasError: true,
      error,
      canRecover: isFormError, // Only allow recovery for form errors
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Form Error Boundary caught an error:", error);
    console.error("Error Info:", errorInfo);

    // Extract form-related information from error
    this.extractFormErrors(error);
  }

  private static isFormRelatedError(error: Error): boolean {
    const formErrorPatterns = [
      "validation",
      "schema",
      "zod",
      "yup",
      "joi",
      "formik",
      "react-hook-form",
      "form",
      "submit",
      "invalid",
    ];

    const errorMessage = error.message.toLowerCase();
    const errorName = error.name.toLowerCase();

    return formErrorPatterns.some(
      (pattern) =>
        errorMessage.includes(pattern) || errorName.includes(pattern),
    );
  }

  private extractFormErrors = (error: Error) => {
    // Try to extract validation errors from common form libraries
    const validationErrors = this.extractValidationErrors(error);
    const submissionErrors = this.extractSubmissionErrors(error);

    this.setState({
      validationErrors,
      submissionErrors,
    });

    // Call error handlers
    if (validationErrors && this.props.onValidationError) {
      this.props.onValidationError(validationErrors);
    }

    if (submissionErrors && this.props.onSubmissionError) {
      this.props.onSubmissionError(submissionErrors);
    }
  };

  private extractValidationErrors = (
    error: Error,
  ): Record<string, string[]> | null => {
    try {
      // Handle Zod errors
      if (error.name === "ZodError" && "issues" in error) {
        const zodError = error as any;
        const errors: Record<string, string[]> = {};

        zodError.issues.forEach((issue: any) => {
          const path = issue.path.join(".");
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(issue.message);
        });

        return errors;
      }

      // Handle Yup errors
      if (error.name === "ValidationError" && "path" in error) {
        const yupError = error as any;
        return {
          [yupError.path]: [yupError.message],
        };
      }

      // Handle generic validation errors
      if (
        error.message.includes("validation") ||
        error.message.includes("invalid")
      ) {
        return {
          general: [error.message],
        };
      }

      return null;
    } catch {
      return null;
    }
  };

  private extractSubmissionErrors = (error: Error): string[] | null => {
    // Extract submission-related errors
    const submissionPatterns = [
      "submit",
      "save",
      "create",
      "update",
      "delete",
      "network",
      "server",
      "api",
    ];

    const errorMessage = error.message.toLowerCase();

    if (submissionPatterns.some((pattern) => errorMessage.includes(pattern))) {
      return [error.message];
    }

    return null;
  };

  // Method to capture form data (call this from form components)
  captureFormData = (data: Record<string, any>) => {
    this.setState({
      formData: { ...data },
      lastValidState: { ...data },
    });

    if (this.props.onFormDataCapture) {
      this.props.onFormDataCapture(data);
    }
  };

  private handleRecover = () => {
    const { lastValidState, formData } = this.state;
    const { onRecovery } = this.props;

    // Use last valid state if available, otherwise use captured form data
    const recoveryData = lastValidState || formData || {};

    // Call recovery handler
    if (onRecovery) {
      onRecovery(recoveryData);
    }

    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      validationErrors: null,
      submissionErrors: null,
    });
  };

  private handleRetry = () => {
    // Reset error state to allow retry
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      validationErrors: null,
      submissionErrors: null,
    });
  };

  private getErrorIcon = () => {
    const { validationErrors, submissionErrors } = this.state;

    if (validationErrors) return <FileText className="h-6 w-6" />;
    if (submissionErrors) return <Save className="h-6 w-6" />;
    return <AlertTriangle className="h-6 w-6" />;
  };

  private getErrorTitle = () => {
    const { validationErrors, submissionErrors } = this.state;

    if (validationErrors) return "Form Validation Error";
    if (submissionErrors) return "Submission Error";
    return "Form Error";
  };

  private getErrorDescription = () => {
    const { validationErrors, submissionErrors, canRecover, formData } =
      this.state;

    if (validationErrors) {
      const errorCount = Object.keys(validationErrors).length;
      return `Please fix the ${errorCount} validation error${errorCount > 1 ? "s" : ""} in the form.`;
    }

    if (submissionErrors) {
      return "There was a problem submitting your form. Please try again.";
    }

    if (canRecover && formData) {
      return "Your form data has been preserved. You can try to recover and continue.";
    }

    return "An unexpected error occurred while processing the form.";
  };

  render() {
    const { children, fallback, enableRecovery = true } = this.props;
    const {
      hasError,
      validationErrors,
      submissionErrors,
      canRecover,
      formData,
      error,
    } = this.state;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default form error UI
      return (
        <div className="min-h-[300px] flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                {this.getErrorIcon()}
              </div>
              <CardTitle className="text-lg font-semibold">
                {this.getErrorTitle()}
              </CardTitle>
              <CardDescription>{this.getErrorDescription()}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Validation Errors */}
              {validationErrors && Object.keys(validationErrors).length > 0 && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Validation Errors:</p>
                      {Object.entries(validationErrors).map(
                        ([field, messages]) => (
                          <div key={field} className="ml-4">
                            <Badge variant="outline" className="mr-2">
                              {field}
                            </Badge>
                            <ul className="list-disc list-inside text-sm">
                              {messages.map((message, index) => (
                                <li key={index}>{message}</li>
                              ))}
                            </ul>
                          </div>
                        ),
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Submission Errors */}
              {submissionErrors && submissionErrors.length > 0 && (
                <Alert>
                  <Save className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Submission Errors:</p>
                      <ul className="list-disc list-inside text-sm">
                        {submissionErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Recovery Info */}
              {canRecover && formData && enableRecovery && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium">Data Recovery Available</p>
                    <p className="text-sm">
                      Your form data has been saved and can be recovered.
                      {Object.keys(formData).length > 0 && (
                        <span>
                          {" "}
                          ({Object.keys(formData).length} fields saved)
                        </span>
                      )}
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              <Separator />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={this.handleRetry}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>

                {canRecover && enableRecovery && (
                  <Button
                    variant="outline"
                    onClick={this.handleRecover}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Recover Form Data
                  </Button>
                )}
              </div>

              {/* Error Details for Development */}
              {process.env.NODE_ENV === "development" && error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <p className="text-xs font-medium">Error Message:</p>
                      <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-20">
                        {error.message}
                      </pre>
                    </div>
                    {error.stack && (
                      <div>
                        <p className="text-xs font-medium">Stack Trace:</p>
                        <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-32">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return children;
  }
}

// HOC for wrapping form components
export function withFormErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<FormErrorBoundaryProps, "children">,
) {
  const WrappedComponent = (props: P) => (
    <FormErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </FormErrorBoundary>
  );

  WrappedComponent.displayName = `withFormErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Hook for capturing form data in form components
export function useFormErrorCapture() {
  const errorBoundary = React.useContext(FormErrorBoundaryContext);

  const captureFormData = React.useCallback(
    (data: Record<string, any>) => {
      if (errorBoundary) {
        errorBoundary.captureFormData(data);
      }
    },
    [errorBoundary],
  );

  return { captureFormData };
}

// Context for form error boundary communication
const FormErrorBoundaryContext = React.createContext<FormErrorBoundary | null>(
  null,
);

export { FormErrorBoundaryContext };
