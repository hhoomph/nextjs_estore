/**
 * Advanced Error Boundary Component
 *
 * Comprehensive error handling with recovery mechanisms, reporting, and user-friendly UI.
 * Supports nested error boundaries and different error types.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import {
  AlertTriangle,
  Bug,
  ChevronDown,
  ChevronUp,
  Home,
  RefreshCw,
} from "lucide-react";
import type React from "react";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
  isExpanded: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  showErrorDetails?: boolean;
  enableReporting?: boolean;
  maxRetries?: number;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
  onReset?: () => void;
}

export class AdvancedErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryTimeoutsRef: NodeJS.Timeout[] = [];

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      isExpanded: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, enableReporting } = this.props;

    // Update state with error info
    this.setState({ errorInfo });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Report error if enabled
    if (enableReporting) {
      this.reportError(error, errorInfo);
    }

    // Log error details
    console.error("Error Boundary caught an error:", error);
    console.error("Error Info:", errorInfo);
    console.error("Error ID:", this.state.errorId);
  }

  componentWillUnmount() {
    // Clear all pending retry timeouts to prevent memory leaks
      this.retryTimeoutsRef.forEach((timeout) => {
        clearTimeout(timeout);
      });
      this.retryTimeoutsRef = [];
  }

  private reportError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Prepare error report matching API schema
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        retryCount: this.state.retryCount,
        userId: "anonymous",
      };

      // Send to error reporting service (implement based on your service)
      console.log("Reporting error:", errorReport);

      // Send to external service (test-friendly POST)
      await fetch("/api/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(errorReport),
      });
    } catch (reportError) {
      console.error("Failed to report error:", reportError);
    }
  };

  private handleRetry = () => {
    const { maxRetries = 3, onRetry } = this.props;
    const { retryCount } = this.state;

    if (retryCount < maxRetries) {
      // Increment retry count
      this.setState((prevState) => ({ retryCount: prevState.retryCount + 1 }));

      // Call custom retry handler
      if (onRetry) {
        onRetry();
      }

      // Reset error state to retry
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
      });

      // Create a timeout to reset retry count after 2 minutes
      const timeoutId = setTimeout(() => {
        this.setState((prevState) => {
          if (prevState.retryCount > 0) {
            return { retryCount: 0 };
          }
          return null;
        });
      }, 2 * 60 * 1000); // 2 minutes

      // Store timeout ID in ref to track and cleanup
      this.retryTimeoutsRef.push(timeoutId);
    }
  };

  private handleReset = () => {
    const { onReset } = this.props;

    // Clear all pending timeouts
    this.retryTimeoutsRef.forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.retryTimeoutsRef = [];

    // Reset all state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      isExpanded: false,
    });

    // Call custom reset handler
    if (onReset) {
      onReset();
    }

    // Navigate home as part of reset action
    try {
      window.location.href = "/";
    } catch (_e) {
      // ignore in non-browser environments
    }
  };

  private toggleExpanded = () => {
    this.setState((prevState) => ({ isExpanded: !prevState.isExpanded }));
  };

  render() {
    const {
      children,
      fallback,
      showErrorDetails = false,
      maxRetries = 3,
    } = this.props;
    const { hasError, error, errorInfo, errorId, retryCount, isExpanded } =
      this.state;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl font-semibold text-destructive">
                Something went wrong
              </CardTitle>
              <CardDescription className="text-base">
                We encountered an unexpected error. Please try again or contact
                support if the problem persists.
              </CardDescription>
              {error?.message && (
                <pre className="max-h-32 overflow-auto rounded-md bg-muted p-3 text-left text-xs text-destructive">
                  {error.message}
                </pre>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Error ID for support */}
              {errorId && (
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    <Bug className="mr-1 h-3 w-3" />
                    Error ID: {errorId}
                  </Badge>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={this.handleRetry}
                  disabled={retryCount >= maxRetries}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again {retryCount > 0 && `(${retryCount}/${maxRetries})`}
                </Button>

                <Button
                  variant="outline"
                  onClick={this.handleReset}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              </div>

              {/* Error details (only in development or when explicitly enabled) */}
              {showErrorDetails && error && process.env.NODE_ENV !== "production" && (
                <Collapsible
                  open={isExpanded}
                  onOpenChange={this.toggleExpanded}
                >
                  <CollapsibleTrigger asChild={true}>
                    <Button variant="ghost" className="w-full justify-between">
                      Error Details
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="space-y-4">
                    <Separator />

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-1">
                          Error Message:
                        </h4>
                        <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-32">
                          {error.message}
                        </pre>
                      </div>

                      {errorInfo?.componentStack && (
                        <div>
                          <h4 className="font-medium text-sm mb-1">
                            Component Stack:
                          </h4>
                          <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-48">
                            {errorInfo.componentStack}
                          </pre>
                        </div>
                      )}

                      {error.stack && (
                        <div>
                          <h4 className="font-medium text-sm mb-1">
                            Stack Trace:
                          </h4>
                          <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-48">
                            {error.stack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return children;
  }
}

// HOC for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">,
) {
  const WrappedComponent = (props: P) => (
    <AdvancedErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </AdvancedErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
