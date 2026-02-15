/**
 * API Error Boundary Component
 *
 * Specialized error boundary for API-related errors with network status monitoring
 * and automatic retry mechanisms for failed API calls.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import {
  AlertCircle,
  Clock,
  RefreshCw,
  Server,
  Wifi,
  WifiOff,
} from "lucide-react";
import type React from "react";
import { Component, type ErrorInfo, type ReactNode } from "react";
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
import { Progress } from "@/components/ui/progress";

interface ApiErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  isNetworkError: boolean;
  isServerError: boolean;
  isTimeoutError: boolean;
  retryCount: number;
  isRetrying: boolean;
  lastRetryTime: number | null;
  networkStatus: "online" | "offline" | "slow";
}

interface ApiErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  showNetworkStatus?: boolean;
  enableAutoRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  onNetworkStatusChange?: (status: "online" | "offline" | "slow") => void;
  onApiError?: (error: Error, isNetworkError: boolean) => void;
}

export class ApiErrorBoundary extends Component<
  ApiErrorBoundaryProps,
  ApiErrorBoundaryState
> {
  private retryTimeout: NodeJS.Timeout | null = null;
  private networkCheckInterval: NodeJS.Timeout | null = null;

  constructor(props: ApiErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      isNetworkError: false,
      isServerError: false,
      isTimeoutError: false,
      retryCount: 0,
      isRetrying: false,
      lastRetryTime: null,
      networkStatus: "online",
    };
  }

  componentDidMount() {
    const { showNetworkStatus } = this.props;

    // Monitor network status if enabled
    if (showNetworkStatus) {
      this.startNetworkMonitoring();
    }

    // Listen for online/offline events
    window.addEventListener("online", this.handleOnline);
    window.addEventListener("offline", this.handleOffline);
  }

  componentWillUnmount() {
    // Cleanup
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
    if (this.networkCheckInterval) {
      clearInterval(this.networkCheckInterval);
    }

    window.removeEventListener("online", this.handleOnline);
    window.removeEventListener("offline", this.handleOffline);
  }

  private startNetworkMonitoring = () => {
    // Check network status every 30 seconds
    this.networkCheckInterval = setInterval(async () => {
      const status = await this.checkNetworkStatus();
      if (status !== this.state.networkStatus) {
        this.setState({ networkStatus: status });
        this.props.onNetworkStatusChange?.(status);
      }
    }, 30000);
  };

  private checkNetworkStatus = async (): Promise<
    "online" | "offline" | "slow"
  > => {
    if (!navigator.onLine) {
      return "offline";
    }

    try {
      // Test connection speed with a small request
      const startTime = Date.now();
      const response = await fetch("/api/health", {
        method: "HEAD",
        cache: "no-cache",
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (!response.ok) {
        return "offline";
      }

      // Consider slow if response takes more than 3 seconds
      return responseTime > 3000 ? "slow" : "online";
    } catch {
      return "offline";
    }
  };

  private handleOnline = () => {
    this.setState({ networkStatus: "online" });
    this.props.onNetworkStatusChange?.("online");
  };

  private handleOffline = () => {
    this.setState({ networkStatus: "offline" });
    this.props.onNetworkStatusChange?.("offline");
  };

  static getDerivedStateFromError(
    error: Error,
  ): Partial<ApiErrorBoundaryState> {
    // Determine error type
    const isNetworkError = ApiErrorBoundary.isNetworkError(error);
    const isServerError = ApiErrorBoundary.isServerError(error);
    const isTimeoutError = ApiErrorBoundary.isTimeoutError(error);

    return {
      hasError: true,
      error,
      isNetworkError,
      isServerError,
      isTimeoutError,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onApiError } = this.props;
    const { isNetworkError } = this.state;

    // Call custom API error handler
    if (onApiError) {
      onApiError(error, isNetworkError);
    }

    // Auto-retry for network errors if enabled
    if (isNetworkError && this.props.enableAutoRetry) {
      this.scheduleAutoRetry();
    }

    // Log error details
    console.error("API Error Boundary caught an error:", error);
    console.error("Error Info:", errorInfo);
  }

  private static isNetworkError(error: Error): boolean {
    const networkErrorPatterns = [
      "fetch",
      "network",
      "connection",
      "offline",
      "ERR_NETWORK",
      "Failed to fetch",
      "Load failed",
    ];

    return networkErrorPatterns.some((pattern) =>
      error.message.toLowerCase().includes(pattern.toLowerCase()),
    );
  }

  private static isServerError(error: Error): boolean {
    const serverErrorPatterns = [
      "500",
      "502",
      "503",
      "504",
      "internal server error",
      "bad gateway",
      "service unavailable",
      "gateway timeout",
    ];

    return serverErrorPatterns.some((pattern) =>
      error.message.toLowerCase().includes(pattern.toLowerCase()),
    );
  }

  private static isTimeoutError(error: Error): boolean {
    const timeoutErrorPatterns = [
      "timeout",
      "aborted",
      "request timeout",
      "ERR_TIMEOUT",
    ];

    return timeoutErrorPatterns.some((pattern) =>
      error.message.toLowerCase().includes(pattern.toLowerCase()),
    );
  }

  private scheduleAutoRetry = () => {
    const { maxRetries = 3, retryDelay = 2000 } = this.props;
    const { retryCount } = this.state;

    if (retryCount < maxRetries && !this.state.isRetrying) {
      this.retryTimeout = setTimeout(
        () => {
          this.handleRetry();
        },
        retryDelay * 2 ** retryCount,
      ); // Exponential backoff
    }
  };

  private handleRetry = () => {
    const { maxRetries = 3 } = this.props;

    if (this.state.retryCount < maxRetries) {
      this.setState((prevState) => ({
        retryCount: prevState.retryCount + 1,
        isRetrying: true,
        lastRetryTime: Date.now(),
      }));

      // Reset error state to retry
      setTimeout(() => {
        this.setState({
          hasError: false,
          error: null,
          isNetworkError: false,
          isServerError: false,
          isTimeoutError: false,
          isRetrying: false,
        });
      }, 100);
    }
  };

  private getErrorIcon = () => {
    const { isNetworkError, isServerError, isTimeoutError } = this.state;

    if (isNetworkError) return <WifiOff className="h-6 w-6" />;
    if (isServerError) return <Server className="h-6 w-6" />;
    if (isTimeoutError) return <Clock className="h-6 w-6" />;
    return <AlertCircle className="h-6 w-6" />;
  };

  private getErrorTitle = () => {
    const { isNetworkError, isServerError, isTimeoutError } = this.state;

    if (isNetworkError) return "Connection Problem";
    if (isServerError) return "Server Error";
    if (isTimeoutError) return "Request Timeout";
    return "API Error";
  };

  private getErrorDescription = () => {
    const { isNetworkError, isServerError, isTimeoutError, networkStatus } =
      this.state;

    if (isNetworkError) {
      return networkStatus === "offline"
        ? "You appear to be offline. Please check your internet connection."
        : "Unable to connect to our servers. Please check your connection.";
    }

    if (isServerError) {
      return "Our servers are experiencing issues. Please try again in a few moments.";
    }

    if (isTimeoutError) {
      return "The request took too long to complete. Please try again.";
    }

    return "An error occurred while communicating with our servers.";
  };

  render() {
    const {
      children,
      fallback,
      showNetworkStatus,
      maxRetries = 3,
    } = this.props;
    const {
      hasError,
      error,
      isNetworkError,
      retryCount,
      isRetrying,
      networkStatus,
      lastRetryTime,
    } = this.state;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default API error UI
      return (
        <div className="min-h-[300px] flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                {this.getErrorIcon()}
              </div>
              <CardTitle className="text-lg font-semibold">
                {this.getErrorTitle()}
              </CardTitle>
              <CardDescription>{this.getErrorDescription()}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Network Status */}
              {showNetworkStatus && (
                <Alert>
                  <Wifi className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>
                      Network Status:
                      <Badge
                        variant={
                          networkStatus === "online" ? "default" : "destructive"
                        }
                        className="ml-2"
                      >
                        {networkStatus}
                      </Badge>
                    </span>
                    {networkStatus === "slow" && (
                      <span className="text-sm text-muted-foreground">
                        Slow connection detected
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Retry Progress */}
              {retryCount > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Retry Attempts</span>
                    <span>
                      {retryCount}/{maxRetries}
                    </span>
                  </div>
                  <Progress
                    value={(retryCount / maxRetries) * 100}
                    className="h-2"
                  />
                  {lastRetryTime && (
                    <p className="text-xs text-muted-foreground">
                      Last retry: {new Date(lastRetryTime).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={this.handleRetry}
                  disabled={retryCount >= maxRetries || isRetrying}
                  className="flex items-center gap-2"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`}
                  />
                  {isRetrying
                    ? "Retrying..."
                    : `Try Again ${retryCount > 0 ? `(${retryCount}/${maxRetries})` : ""}`}
                </Button>

                {isNetworkError && networkStatus === "offline" && (
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2"
                  >
                    <Wifi className="h-4 w-4" />
                    Check Connection
                  </Button>
                )}
              </div>

              {/* Error Details for Development */}
              {process.env.NODE_ENV === "development" && error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 text-xs bg-muted p-3 rounded-md overflow-auto max-h-32">
                    {error.message}
                  </pre>
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

// HOC for wrapping API components
export function withApiErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ApiErrorBoundaryProps, "children">,
) {
  const WrappedComponent = (props: P) => (
    <ApiErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ApiErrorBoundary>
  );

  WrappedComponent.displayName = `withApiErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
