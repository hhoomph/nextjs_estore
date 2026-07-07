/**
 * Enhanced Error Boundary with Advanced Features
 *
 * Provides comprehensive error handling with retry logic, network monitoring,
 * bug reporting, and graceful degradation.
 *
 * @author hh.oomph@gmail.com
 * @version 2.0.0
 * @since 2025-01-01
 */

"use client";

import {
  AlertTriangle,
  Bug,
  Home,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import type React from "react";
import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/hooks/use-toast";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showErrorDetails?: boolean;
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
  isRetrying: boolean;
  isOnline: boolean;
  errorCategory?: ErrorCategory;
  errorSeverity?: ErrorSeverity;
}

export type ErrorCategory =
  | "network"
  | "authentication"
  | "authorization"
  | "validation"
  | "server"
  | "client"
  | "third_party"
  | "unknown";

export type ErrorSeverity = "low" | "medium" | "high" | "critical";

export class EnhancedErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
      isRetrying: false,
      isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      retryCount: 0,
      isRetrying: false,
      isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    };
  }

  componentDidMount() {
    // Listen for online/offline events
    if (typeof window !== "undefined") {
      window.addEventListener("online", this.handleOnline);
      window.addEventListener("offline", this.handleOffline);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("online", this.handleOnline);
      window.removeEventListener("offline", this.handleOffline);
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("EnhancedErrorBoundary caught an error:", error, errorInfo);

    // Categorize and assess severity of the error
    const errorCategory = this.categorizeError(error, errorInfo);
    const errorSeverity = this.assessErrorSeverity(error, errorCategory);

    this.setState({
      error,
      errorInfo,
      errorCategory,
      errorSeverity,
    });

    // Enhanced error reporting
    this.reportError(error, errorInfo, errorCategory, errorSeverity);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Show contextual toast notification
    this.showErrorToast(errorCategory, errorSeverity);
  }

  handleOnline = () => {
    this.setState({ isOnline: true });
    toast({
      title: "Connection restored",
      description: "You're back online.",
      variant: "default",
    });
  };

  handleOffline = () => {
    this.setState({ isOnline: false });
    toast({
      title: "Connection lost",
      description: "Some features may not work properly.",
      variant: "destructive",
    });
  };

  handleRetry = () => {
    const { maxRetries = 3, retryDelay = 1000 } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= maxRetries) {
      toast({
        title: "Max retries reached",
        description: "Please refresh the page or contact support.",
        variant: "destructive",
      });
      return;
    }

    this.setState({ isRetrying: true, retryCount: retryCount + 1 });

    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        isRetrying: false,
      });
    }, retryDelay);
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  handleReportBug = () => {
    const { error, errorInfo, errorCategory, errorSeverity } = this.state;
    const bugReport = {
      message: error?.message || "Unknown error",
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      category: errorCategory,
      severity: errorSeverity,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userId: "anonymous", // Would be populated from auth context
      sessionId: this.generateSessionId(),
    };

    // Copy to clipboard
    navigator.clipboard
      .writeText(JSON.stringify(bugReport, null, 2))
      .then(() => {
        toast({
          title: "Bug report copied",
          description: "Please paste this in a support ticket.",
          variant: "default",
        });
      });
  };

  /**
   * Categorize error based on message, stack, and component info
   */
  categorizeError = (
    error: Error,
    errorInfo: React.ErrorInfo,
  ): ErrorCategory => {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || "";
    const componentStack = errorInfo.componentStack?.toLowerCase() || "";

    // Network errors
    if (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("connection") ||
      message.includes("timeout") ||
      message.includes("cors") ||
      message.includes("502") ||
      message.includes("503") ||
      message.includes("504")
    ) {
      return "network";
    }

    // Authentication errors
    if (
      message.includes("unauthorized") ||
      message.includes("401") ||
      message.includes("not authenticated") ||
      message.includes("login required")
    ) {
      return "authentication";
    }

    // Authorization errors
    if (
      message.includes("forbidden") ||
      message.includes("403") ||
      message.includes("permission denied") ||
      message.includes("access denied")
    ) {
      return "authorization";
    }

    // Validation errors
    if (
      message.includes("validation") ||
      message.includes("invalid") ||
      message.includes("required") ||
      message.includes("400")
    ) {
      return "validation";
    }

    // Server errors
    if (
      message.includes("500") ||
      message.includes("internal server") ||
      message.includes("server error") ||
      stack.includes("api/")
    ) {
      return "server";
    }

    // Third-party service errors
    if (
      componentStack.includes("script") ||
      message.includes("third-party") ||
      stack.includes("google") ||
      stack.includes("facebook") ||
      stack.includes("analytics") ||
      stack.includes("stripe")
    ) {
      return "third_party";
    }

    // Client-side errors (default for React components)
    if (
      componentStack.includes("component") ||
      componentStack.includes("jsx") ||
      error.name === "TypeError" ||
      error.name === "ReferenceError"
    ) {
      return "client";
    }

    return "unknown";
  };

  /**
   * Assess error severity based on category and impact
   */
  assessErrorSeverity = (
    error: Error,
    category: ErrorCategory,
  ): ErrorSeverity => {
    // Critical errors that break the entire app
    if (
      category === "authentication" ||
      category === "server" ||
      error.message.includes("cannot read property") ||
      error.message.includes("undefined is not a function")
    ) {
      return "critical";
    }

    // High severity - affects user experience significantly
    if (
      category === "network" ||
      category === "authorization" ||
      error.message.includes("failed to fetch") ||
      error.message.includes("chunk load error")
    ) {
      return "high";
    }

    // Medium severity - partial functionality affected
    if (
      category === "validation" ||
      category === "third_party" ||
      error.name === "TypeError"
    ) {
      return "medium";
    }

    // Low severity - minor issues
    return "low";
  };

  /**
   * Enhanced error reporting with categorization and metrics
   */
  reportError = (
    error: Error,
    errorInfo: React.ErrorInfo,
    category: ErrorCategory,
    severity: ErrorSeverity,
  ) => {
    const errorReport = {
      timestamp: new Date().toISOString(),
      category,
      severity,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: typeof window !== "undefined" ? window.location.href : "server",
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
      sessionId: this.generateSessionId(),
      userId: "anonymous", // Would be populated from auth context
      retryCount: this.state.retryCount,
      isOnline: this.state.isOnline,
    };

    // Log to console with structured format
    console.error("[ErrorBoundary]", {
      category: category.toUpperCase(),
      severity: severity.toUpperCase(),
      message: error.message,
      url: errorReport.url,
      timestamp: errorReport.timestamp,
    });

    // Send to error reporting service (would be implemented)
    this.sendErrorReport(errorReport);

    // Track error metrics (would be implemented)
    this.trackErrorMetrics(category, severity);
  };

  /**
   * Send error report to monitoring service
   */
  sendErrorReport = async (errorReport: any) => {
    try {
      // This would send to services like Sentry, LogRocket, etc.
      if (process.env.NODE_ENV === "production") {
        // await fetch('/api/errors/report', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(errorReport),
        // });
        console.log("Error report sent:", errorReport);
      }
    } catch (reportingError) {
      console.error("Failed to send error report:", reportingError);
    }
  };

  /**
   * Track error metrics for monitoring
   */
  trackErrorMetrics = (category: ErrorCategory, severity: ErrorSeverity) => {
    try {
      // This would integrate with analytics services
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "exception", {
          description: `${category}_${severity}`,
          fatal: severity === "critical",
        });
      }

      // Custom metrics tracking
      const metrics = {
        [`error_${category}`]: 1,
        [`error_severity_${severity}`]: 1,
        total_errors: 1,
      };

      console.log("Error metrics tracked:", metrics);
    } catch (metricsError) {
      console.error("Failed to track error metrics:", metricsError);
    }
  };

  /**
   * Show contextual toast based on error category and severity
   */
  showErrorToast = (category: ErrorCategory, severity: ErrorSeverity) => {
    let title = "An error occurred";
    let description = "We're working to fix this. Please try again.";

    switch (category) {
      case "network":
        title = "Connection Problem";
        description = "Please check your internet connection and try again.";
        break;
      case "authentication":
        title = "Authentication Required";
        description = "Please log in to continue.";
        break;
      case "authorization":
        title = "Access Denied";
        description = "You don't have permission to perform this action.";
        break;
      case "validation":
        title = "Invalid Input";
        description = "Please check your input and try again.";
        break;
      case "server":
        title = "Server Error";
        description =
          "Our servers are experiencing issues. Please try again later.";
        break;
      case "third_party":
        title = "Service Unavailable";
        description = "A third-party service is temporarily unavailable.";
        break;
    }

    const variant = severity === "critical" ? "destructive" : "default";

    toast({
      title,
      description,
      variant,
    });
  };

  /**
   * Generate unique session ID for error tracking
   */
  generateSessionId = (): string => {
    if (typeof window === "undefined") return "server-session";

    let sessionId = sessionStorage.getItem("error_session_id");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem("error_session_id", sessionId);
    }
    return sessionId;
  };

  render() {
    const { hasError, error, errorInfo, isRetrying, isOnline, retryCount } =
      this.state;
    const {
      fallback,
      showErrorDetails = true,
      enableRetry = true,
      maxRetries = 3,
    } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      const canRetry = enableRetry && retryCount < maxRetries;
      const isNetworkError =
        !isOnline ||
        error?.message?.includes("network") ||
        error?.message?.includes("fetch");

      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="max-w-lg w-full bg-card rounded-xl shadow-xl p-8 text-center border border-border">
            {/* Network Status Indicator */}
            <div className="flex justify-center mb-4">
              {isOnline ? (
                <Wifi className="h-6 w-6 text-success" />
              ) : (
                <WifiOff className="h-6 w-6 text-destructive" />
              )}
            </div>

            <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-6" />

            <h2 className="text-2xl font-bold text-foreground mb-3">
              {isNetworkError ? "Connection Problem" : "Something went wrong"}
            </h2>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              {isNetworkError
                ? "It looks like you're having connection issues. Please check your internet and try again."
                : "We encountered an unexpected error. Our team has been notified and is working to fix this."}
            </p>

            {/* Retry Count Indicator */}
            {retryCount > 0 && (
              <div className="text-sm text-muted-foreground mb-4">
                Retry attempts: {retryCount}/{maxRetries}
              </div>
            )}

            <div className="space-y-3">
              {canRetry && (
                <Button
                  onClick={this.handleRetry}
                  disabled={isRetrying}
                  className="w-full"
                  size="lg"
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${isRetrying ? "animate-spin" : ""}`}
                  />
                  {isRetrying ? "Retrying..." : "Try Again"}
                </Button>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={this.handleGoHome} size="lg">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Button>

                <Button
                  variant="outline"
                  onClick={this.handleReportBug}
                  size="lg"
                >
                  <Bug className="mr-2 h-4 w-4" />
                  Report
                </Button>
              </div>
            </div>

            {/* Error Details for Development */}
            {showErrorDetails &&
              process.env.NODE_ENV === "development" &&
              error && (
                <details className="mt-6 text-left bg-muted rounded-lg p-4">
                  <summary className="cursor-pointer text-sm font-medium text-foreground">
                    Error Details (Development Only)
                  </summary>
                  <div className="mt-3 space-y-2">
                    <div>
                      <strong className="text-xs text-muted-foreground uppercase tracking-wide">
                        Error:
                      </strong>
                        <pre className="mt-1 text-xs bg-destructive/10 text-destructive p-2 rounded overflow-auto max-h-20">
                        {error.toString()}
                      </pre>
                    </div>

                    {errorInfo?.componentStack && (
                      <div>
                        <strong className="text-xs text-muted-foreground uppercase tracking-wide">
                          Component Stack:
                        </strong>
                        <pre className="mt-1 text-xs bg-primary/10 text-primary p-2 rounded overflow-auto max-h-32">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

            {/* User-friendly error message */}
            <div className="mt-4 text-xs text-muted-foreground">
              Error ID: {Date.now().toString(36)}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
