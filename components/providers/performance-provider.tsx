/**
 * Performance Provider Component
 * Provides performance monitoring and alerting capabilities
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

"use client";

import * as React from "react";
import {
  setupPerformanceAlerts,
  trackWebVitals,
  usePerformanceMonitoring,
} from "@/lib/lazy";

interface PerformanceProviderProps {
  children: React.ReactNode;
  enableAlerts?: boolean;
  alertThresholds?: {
    lcp?: number;
    fid?: number;
    cls?: number;
    fcp?: number;
  };
}

export function PerformanceProvider({
  children,
  enableAlerts = true,
  alertThresholds,
}: PerformanceProviderProps) {
  const metrics = usePerformanceMonitoring();

  React.useEffect(() => {
    // Initialize performance monitoring
    trackWebVitals();

    // Setup performance alerts if enabled
    if (enableAlerts) {
      setupPerformanceAlerts(alertThresholds);
    }

    // Log initial metrics in development
    if (
      process.env.NODE_ENV === "development" &&
      Object.keys(metrics).length > 0
    ) {
      console.log("🚀 Performance monitoring initialized:", metrics);
    }
  }, [enableAlerts, alertThresholds, metrics]);

  return <>{children}</>;
}

// Performance monitoring context for advanced use cases
interface PerformanceContextType {
  metrics: Record<string, number>;
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
}

const PerformanceContext = React.createContext<
  PerformanceContextType | undefined
>(undefined);

export function usePerformanceContext() {
  const context = React.useContext(PerformanceContext);
  if (context === undefined) {
    throw new Error(
      "usePerformanceContext must be used within a PerformanceProvider",
    );
  }
  return context;
}

interface AdvancedPerformanceProviderProps extends PerformanceProviderProps {
  enableContext?: boolean;
}

export function AdvancedPerformanceProvider({
  children,
  enableAlerts = true,
  alertThresholds,
  enableContext = false,
}: AdvancedPerformanceProviderProps) {
  const [isMonitoring, setIsMonitoring] = React.useState(true);
  const metrics = usePerformanceMonitoring();

  const startMonitoring = React.useCallback(() => {
    setIsMonitoring(true);
    trackWebVitals();
  }, []);

  const stopMonitoring = React.useCallback(() => {
    setIsMonitoring(false);
  }, []);

  React.useEffect(() => {
    if (isMonitoring) {
      trackWebVitals();

      if (enableAlerts) {
        setupPerformanceAlerts(alertThresholds);
      }
    }
  }, [isMonitoring, enableAlerts, alertThresholds]);

  const contextValue: PerformanceContextType = {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
  };

  if (enableContext) {
    return (
      <PerformanceContext.Provider value={contextValue}>
        <PerformanceProvider
          enableAlerts={enableAlerts}
          alertThresholds={alertThresholds}
        >
          {children}
        </PerformanceProvider>
      </PerformanceContext.Provider>
    );
  }

  return (
    <PerformanceProvider
      enableAlerts={enableAlerts}
      alertThresholds={alertThresholds}
    >
      {children}
    </PerformanceProvider>
  );
}
