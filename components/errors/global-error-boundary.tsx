/**
 * Global Error Boundary Component
 * Comprehensive error handling with user-friendly fallbacks
 *
 * @author hh.oomph@gmail.com
 * @version 2.0.0
 * @since 2025-01-01
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Bug,
  ChevronDown,
  ChevronUp,
  Home,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ErrorInfo {
  componentStack?: string;
  errorBoundary?: string;
  errorBoundaryStack?: string;
  willRetry?: boolean;
}

interface ErrorFallbackProps {
  error: Error;
  errorInfo?: ErrorInfo;
  resetError?: () => void;
  variant?: "minimal" | "detailed" | "fullscreen" | "card";
  showDetails?: boolean;
  showRetry?: boolean;
  showHome?: boolean;
  showReport?: boolean;
  onReport?: (error: Error, errorInfo?: ErrorInfo) => void;
  className?: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  resetError,
  variant = "card",
  showDetails = process.env.NODE_ENV === "development",
  showRetry = true,
  showHome = true,
  showReport = true,
  onReport,
  className,
}) => {
  const [showErrorDetails, setShowErrorDetails] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleRetry = React.useCallback(async () => {
    if (!resetError) return;

    setIsRetrying(true);
    setRetryCount((prev) => prev + 1);

    // Add a small delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 1000));

    resetError();
    setIsRetrying(false);
  }, [resetError]);

  const handleReport = React.useCallback(() => {
    onReport?.(error, errorInfo);
  }, [error, errorInfo, onReport]);

  const getErrorSeverity = React.useCallback(
    (error: Error): "low" | "medium" | "high" => {
      // Analyze error to determine severity
      if (
        error.message.includes("Network") ||
        error.message.includes("fetch")
      ) {
        return "medium";
      }
      if (
        error.message.includes("TypeError") ||
        error.message.includes("ReferenceError")
      ) {
        return "high";
      }
      return "low";
    },
    [],
  );

  const severity = getErrorSeverity(error);
  const severityConfig = {
    low: {
      color: "text-warning",
      bgColor: "bg-warning/10",
      borderColor: "border-warning/30",
    },
    medium: {
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/30",
    },
    high: {
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      borderColor: "border-destructive/30",
    },
  };

  const severityColors = severityConfig[severity];

  // Minimal variant
  if (variant === "minimal") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn("flex items-center justify-center p-4", className)}
      >
        <Alert
          className={cn(severityColors.borderColor, severityColors.bgColor)}
        >
          <AlertTriangle className={cn("h-4 w-4", severityColors.color)} />
          <AlertTitle className={severityColors.color}>
            Something went wrong
          </AlertTitle>
          <AlertDescription className="text-muted-foreground">
            {error.message || "An unexpected error occurred"}
          </AlertDescription>
          {showRetry && resetError && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={isRetrying}
              className="mt-2"
            >
              {isRetrying ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Try Again
            </Button>
          )}
        </Alert>
      </motion.div>
    );
  }

  // Fullscreen variant
  if (variant === "fullscreen") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center",
          "bg-background/80 backdrop-blur-sm",
          className,
        )}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="max-w-md mx-4"
        >
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">
                Oops! Something went wrong
              </CardTitle>
              <CardDescription>
                We're sorry, but something unexpected happened. Please try
                again.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex gap-2">
                {showRetry && resetError && (
                  <Button
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="flex-1"
                  >
                    {isRetrying ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Try Again
                  </Button>
                )}

                {showHome && (
                  <Button variant="outline" asChild={true} className="flex-1">
                    <Link href="/">
                      <Home className="h-4 w-4 mr-2" />
                      Go Home
                    </Link>
                  </Button>
                )}
              </div>

              {showReport && (
                <Button
                  variant="ghost"
                  onClick={handleReport}
                  className="w-full"
                >
                  <Bug className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  // Detailed variant
  if (variant === "detailed") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("space-y-4", className)}
      >
        <Alert
          className={cn(severityColors.borderColor, severityColors.bgColor)}
        >
          <AlertTriangle className={cn("h-4 w-4", severityColors.color)} />
          <AlertTitle className={severityColors.color}>
            Error: {error.name}
          </AlertTitle>
          <AlertDescription className="text-muted-foreground mt-2">
            {error.message || "An unexpected error occurred"}
          </AlertDescription>
        </Alert>

        {showDetails && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Bug className="h-4 w-4" />
                Error Details
                <Badge variant="outline" className="ml-auto">
                  {process.env.NODE_ENV}
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Error Type:</span>
                  <p className="font-mono text-xs mt-1">{error.name}</p>
                </div>
                <div>
                  <span className="font-medium">Severity:</span>
                  <Badge
                    variant="outline"
                    className={cn("mt-1", severityColors.color)}
                  >
                    {severity.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Timestamp:</span>
                  <p className="font-mono text-xs mt-1">
                    {new Date().toISOString()}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Retry Count:</span>
                  <p className="font-mono text-xs mt-1">{retryCount}</p>
                </div>
              </div>

              <Accordion type="single" collapsible={true} className="w-full">
                <AccordionItem value="stack-trace">
                  <AccordionTrigger className="text-sm">
                    Stack Trace
                  </AccordionTrigger>
                  <AccordionContent>
                    <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                      {error.stack}
                    </pre>
                  </AccordionContent>
                </AccordionItem>

                {errorInfo?.componentStack && (
                  <AccordionItem value="component-stack">
                    <AccordionTrigger className="text-sm">
                      Component Stack
                    </AccordionTrigger>
                    <AccordionContent>
                      <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                        {errorInfo.componentStack}
                      </pre>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>

              <div className="flex gap-2 pt-4 border-t">
                {showRetry && resetError && (
                  <Button onClick={handleRetry} disabled={isRetrying} size="sm">
                    {isRetrying ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Retry
                  </Button>
                )}

                {showReport && (
                  <Button variant="outline" onClick={handleReport} size="sm">
                    <Bug className="h-4 w-4 mr-2" />
                    Report
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center gap-2">
          {showHome && (
            <Button variant="outline" asChild={true}>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  // Default card variant
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("max-w-md mx-auto", className)}
      role="alert"
      aria-live="assertive"
    >
      <span className="sr-only">An error has occurred: {error.message}</span>
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <CardTitle className="text-lg">Something went wrong</CardTitle>
          <CardDescription>
            {error.message || "An unexpected error occurred. Please try again."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {showDetails && (
            <Alert>
              <Bug className="h-4 w-4" />
              <AlertTitle>Technical Details</AlertTitle>
              <AlertDescription className="font-mono text-xs mt-2">
                {error.name}: {error.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            {showRetry && resetError && (
              <Button
                onClick={handleRetry}
                disabled={isRetrying}
                className="flex-1"
              >
                {isRetrying ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Try Again
              </Button>
            )}

            {showHome && (
              <Button variant="outline" asChild={true} className="flex-1">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Link>
              </Button>
            )}
          </div>

          {showReport && (
            <Button variant="ghost" onClick={handleReport} className="w-full">
              <Bug className="h-4 w-4 mr-2" />
              Report This Issue
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Global Error Boundary Class Component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error: Error;
    errorInfo?: ErrorInfo;
    resetError: () => void;
  }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

class GlobalErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorBoundaryInfo: ErrorInfo = {
      componentStack: errorInfo.componentStack || undefined,
      errorBoundary: this.constructor.name,
      errorBoundaryStack: new Error().stack || undefined,
    };

    // Avoid infinite loop: only setState if errorInfo is not already set
    if (!this.state.errorInfo) {
      this.setState({
        errorInfo: errorBoundaryInfo,
      });
    }

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error Boundary caught an error:", error, errorInfo);
    }

    // Call onError callback
    this.props.onError?.(error, errorBoundaryInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    if (hasError && resetOnPropsChange) {
      const prevResetKeys = prevProps.resetKeys;
      const currentResetKeys = resetKeys;

      const hasResetKeyChanged =
        prevResetKeys && currentResetKeys
          ? prevResetKeys.length !== currentResetKeys.length ||
            prevResetKeys.some((key, index) => key !== currentResetKeys[index])
          : false;

      if (hasResetKeyChanged) {
        this.resetError();
      }
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback: Fallback } = this.props;

    if (hasError && error) {
      if (Fallback) {
        return (
          <Fallback
            error={error}
            errorInfo={errorInfo || undefined}
            resetError={this.resetError}
          />
        );
      }

      return (
        <ErrorFallback
          error={error}
          errorInfo={errorInfo || undefined}
          resetError={this.resetError}
        />
      );
    }

    return children;
  }
}

// Hook-based error boundary for functional components
export function useErrorHandler() {
  return React.useCallback((error: Error, errorInfo?: ErrorInfo) => {
    // Log error to external service
    console.error("Error caught by useErrorHandler:", error, errorInfo);

    // You can integrate with error reporting services here
    // Example: Sentry.captureException(error, { contexts: { errorInfo } });
  }, []);
}

// Error boundary with Suspense support
interface AsyncErrorBoundaryProps extends ErrorBoundaryProps {
  suspenseFallback?: React.ReactNode;
}

export const AsyncErrorBoundary: React.FC<AsyncErrorBoundaryProps> = ({
  suspenseFallback,
  ...props
}) => (
  <React.Suspense fallback={suspenseFallback || <div>Loading...</div>}>
    <GlobalErrorBoundary {...props} />
  </React.Suspense>
);

export { GlobalErrorBoundary, ErrorFallback };
export type { ErrorBoundaryProps, ErrorFallbackProps, ErrorInfo };
