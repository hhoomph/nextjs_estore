/**
 * Module for advanced-monitoring
 *
 * Advanced performance monitoring with real-time metrics collection and alerting
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { useCallback, useEffect, useRef } from "react";
import { AnalyticsEvents } from "../analytics/advanced-analytics";

// Performance metric thresholds (based on Core Web Vitals)
export const PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint (ms)
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint (ms)
  FID: { good: 100, poor: 300 }, // First Input Delay (ms)
  CLS: { good: 0.1, poor: 0.25 }, // Cumulative Layout Shift
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte (ms)

  // Additional metrics
  TBT: { good: 200, poor: 600 }, // Total Blocking Time (ms)
  SI: { good: 3400, poor: 5800 }, // Speed Index (ms)
  TTI: { good: 3800, poor: 7300 }, // Time to Interactive (ms)

  // Custom thresholds
  bundleSize: { warning: 1024 * 1024, critical: 2 * 1024 * 1024 }, // Bundle size (bytes)
  memoryUsage: { warning: 50 * 1024 * 1024, critical: 100 * 1024 * 1024 }, // Memory usage (bytes)
  apiResponseTime: { warning: 1000, critical: 3000 }, // API response time (ms)
  errorRate: { warning: 0.05, critical: 0.1 }, // Error rate (0-1)
};

// Performance monitoring configuration
export interface PerformanceConfig {
  enableRealTimeMonitoring: boolean;
  enableUserTiming: boolean;
  enableResourceTiming: boolean;
  enableNavigationTiming: boolean;
  enablePaintTiming: boolean;
  enableLongTasks: boolean;
  enableMemoryMonitoring: boolean;
  samplingRate: number; // 0-1
  reportingInterval: number; // ms
  alertThresholds: typeof PERFORMANCE_THRESHOLDS;
  customMetrics: Record<
    string,
    { name: string; threshold: number; unit: string }
  >;
}

// Performance metric data structure
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  context?: {
    url: string;
    userAgent: string;
    connectionType?: string;
    deviceMemory?: number;
    hardwareConcurrency?: number;
  };
  metadata?: Record<string, string | number | boolean>;
}

// Performance alert data structure
export interface PerformanceAlert {
  id: string;
  type: "warning" | "critical" | "info";
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: number;
  url: string;
  userId?: string;
  context?: Record<string, string | number | boolean>;
}

// Performance report data structure
export interface PerformanceReport {
  timestamp: number;
  period: { start: number; end: number };
  metrics: PerformanceMetric[];
  alerts: PerformanceAlert[];
  summary: {
    averageFCP: number;
    averageLCP: number;
    averageFID: number;
    averageCLS: number;
    totalAlerts: number;
    criticalAlerts: number;
    warningAlerts: number;
    overallScore: number; // 0-100
  };
  recommendations: string[];
}

// Main performance monitor class
export class AdvancedPerformanceMonitor {
  private config: PerformanceConfig;
  private metrics: PerformanceMetric[] = [];
  private alerts: PerformanceAlert[] = [];
  private observers: PerformanceObserver[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private memoryIntervalId: NodeJS.Timeout | null = null;
  private isMonitoring = false;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enableRealTimeMonitoring: true,
      enableUserTiming: true,
      enableResourceTiming: true,
      enableNavigationTiming: true,
      enablePaintTiming: true,
      enableLongTasks: true,
      enableMemoryMonitoring: false, // Disabled by default for compatibility
      samplingRate: 1.0, // Monitor all users
      reportingInterval: 30000, // 30 seconds
      alertThresholds: PERFORMANCE_THRESHOLDS,
      customMetrics: {},
      ...config,
    };
  }

  // Start performance monitoring
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) return;

    console.log("🚀 Starting Advanced Performance Monitoring...");

    this.isMonitoring = true;

    // Start collecting built-in metrics
    await this.setupBuiltInMetrics();

    // Start real-time monitoring if enabled
    if (this.config.enableRealTimeMonitoring) {
      this.startRealTimeMonitoring();
    }

    // Start periodic reporting
    this.startPeriodicReporting();

    console.log("✅ Performance monitoring started");
  }

  // Stop performance monitoring
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    console.log("🛑 Stopping Advanced Performance Monitoring...");

    this.isMonitoring = false;

    // Disconnect all observers
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];

    // Clear reporting interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Clear memory monitoring interval if exists
    if (this.memoryIntervalId) {
      clearInterval(this.memoryIntervalId);
      this.memoryIntervalId = null;
    }

    console.log("✅ Performance monitoring stopped");
  }

  // Setup built-in performance metrics collection
  private async setupBuiltInMetrics(): Promise<void> {
    if (typeof window === "undefined" || !window.performance) return;

    // Navigation Timing
    if (this.config.enableNavigationTiming) {
      this.collectNavigationTiming();
    }

    // Paint Timing (FCP, LCP)
    if (this.config.enablePaintTiming) {
      this.setupPaintTiming();
    }

    // Long Tasks
    if (this.config.enableLongTasks) {
      this.setupLongTasksMonitoring();
    }

    // Resource Timing
    if (this.config.enableResourceTiming) {
      this.setupResourceTiming();
    }

    // Memory monitoring (if available)
    if (this.config.enableMemoryMonitoring && "memory" in performance) {
      this.setupMemoryMonitoring();
    }

    // User Timing
    if (this.config.enableUserTiming) {
      this.setupUserTiming();
    }
  }

  // Collect navigation timing metrics
  private collectNavigationTiming(): void {
    const navigation = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;

    if (navigation) {
      const metrics = [
        {
          name: "TTFB",
          value: navigation.responseStart - navigation.requestStart,
          unit: "ms",
        },
        {
          name: "DOM_Content_Loaded",
          value:
            navigation.domContentLoadedEventEnd -
            navigation.domContentLoadedEventStart,
          unit: "ms",
        },
        {
          name: "Load_Complete",
          value: navigation.loadEventEnd - navigation.loadEventStart,
          unit: "ms",
        },
        {
          name: "DNS_Lookup",
          value: navigation.domainLookupEnd - navigation.domainLookupStart,
          unit: "ms",
        },
        {
          name: "TCP_Connection",
          value: navigation.connectEnd - navigation.connectStart,
          unit: "ms",
        },
      ];

      metrics.forEach((metric) => this.recordMetric(metric));
    }
  }

  // Setup paint timing observers
  private setupPaintTiming(): void {
    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      if (entries.length > 0) {
        this.recordMetric({
          name: "FCP",
          value: entries[0].startTime,
          unit: "ms",
        });
      }
    });
    fcpObserver.observe({ entryTypes: ["paint"] });

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
        startTime: number;
      };
      if (lastEntry) {
        this.recordMetric({
          name: "LCP",
          value: lastEntry.startTime,
          unit: "ms",
        });
      }
    });
    lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });

    // Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
      const entries = list.getEntries();

      entries.forEach(
        (
          entry: PerformanceEntry & {
            hadRecentInput?: boolean;
            value?: number;
          },
        ) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value || 0;
          }
        },
      );

      this.recordMetric({
        name: "CLS",
        value: clsValue,
        unit: "score",
      });
    });
    clsObserver.observe({ entryTypes: ["layout-shift"] });

    this.observers.push(fcpObserver, lcpObserver, clsObserver);
  }

  // Setup long tasks monitoring
  private setupLongTasksMonitoring(): void {
    const longTasksObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry: any) => {
        if (entry.duration > 50) {
          // Tasks longer than 50ms are considered long
          this.recordMetric({
            name: "Long_Task",
            value: entry.duration,
            unit: "ms",
            metadata: {
              startTime: entry.startTime,
              name: entry.name,
            },
          });
        }
      });
    });

    longTasksObserver.observe({ entryTypes: ["longtask"] });
    this.observers.push(longTasksObserver);
  }

  // Setup resource timing monitoring
  private setupResourceTiming(): void {
    const resourceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceResourceTiming[];

      entries.forEach((entry) => {
        // Only monitor critical resources or slow requests
        if (entry.duration > 1000 || this.isCriticalResource(entry.name)) {
          this.recordMetric({
            name: "Resource_Load",
            value: entry.duration,
            unit: "ms",
            metadata: {
              url: entry.name,
              type: this.getResourceType(entry.initiatorType),
              size: entry.transferSize,
              cached: entry.transferSize === 0,
            },
          });
        }
      });
    });

    resourceObserver.observe({ entryTypes: ["resource"] });
    this.observers.push(resourceObserver);
  }

  // Setup memory monitoring
  private setupMemoryMonitoring(): void {
    const memoryCheckInterval = setInterval(() => {
      if ("memory" in performance) {
        const memory = (
          performance as {
            memory: {
              usedJSHeapSize: number;
              totalJSHeapSize: number;
              jsHeapSizeLimit: number;
            };
          }
        ).memory;

        this.recordMetric({
          name: "Memory_Used",
          value: memory.usedJSHeapSize,
          unit: "bytes",
        });

        this.recordMetric({
          name: "Memory_Total",
          value: memory.totalJSHeapSize,
          unit: "bytes",
        });

        this.recordMetric({
          name: "Memory_Limit",
          value: memory.jsHeapSizeLimit,
          unit: "bytes",
        });
      }
    }, 5000); // Check every 5 seconds

    // Store interval ID for cleanup
    this.memoryIntervalId = memoryCheckInterval;
  }

  // Setup user timing monitoring
  private setupUserTiming(): void {
    // Custom marks and measures can be created by the application
    const userTimingObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry) => {
        if (entry.entryType === "measure") {
          this.recordMetric({
            name: `User_Timing_${entry.name}`,
            value: entry.duration,
            unit: "ms",
            metadata: {
              startTime: entry.startTime,
            },
          });
        }
      });
    });

    userTimingObserver.observe({ entryTypes: ["measure"] });
    this.observers.push(userTimingObserver);
  }

  // Start real-time monitoring
  private startRealTimeMonitoring(): void {
    // Monitor First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      if (entries.length > 0) {
        const fidEntry = entries[0] as any;
        this.recordMetric({
          name: "FID",
          value: fidEntry.processingStart - fidEntry.startTime,
          unit: "ms",
        });
      }
    });

    fidObserver.observe({ entryTypes: ["first-input"] });
    this.observers.push(fidObserver);

    // Monitor Total Blocking Time approximation
    let totalBlockingTime = 0;
    const tbtObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry: any) => {
        if (entry.duration > 50) {
          totalBlockingTime += entry.duration - 50;
        }
      });

      this.recordMetric({
        name: "TBT",
        value: totalBlockingTime,
        unit: "ms",
      });
    });

    tbtObserver.observe({ entryTypes: ["longtask"] });
    this.observers.push(tbtObserver);
  }

  // Start periodic reporting
  private startPeriodicReporting(): void {
    this.intervalId = setInterval(() => {
      this.generatePeriodicReport();
    }, this.config.reportingInterval);
  }

  // Record a performance metric
  recordMetric(metric: Omit<PerformanceMetric, "timestamp" | "context">): void {
    // Apply sampling
    if (Math.random() > this.config.samplingRate) return;

    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now(),
      context: this.getContext(),
    };

    this.metrics.push(fullMetric);

    // Check for alerts
    this.checkMetricAlerts(fullMetric);

    // Keep only recent metrics (last 1000)
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  // Check for metric alerts
  private checkMetricAlerts(metric: PerformanceMetric): void {
    const thresholds =
      this.config.alertThresholds[
        metric.name as keyof typeof PERFORMANCE_THRESHOLDS
      ];

    if (!thresholds) return;

    let alertType: "warning" | "critical" | null = null;
    let message = "";
    let thresholdValue = 0;

    // Check if this is a standard Core Web Vitals metric (good/poor structure)
    if ("good" in thresholds && "poor" in thresholds) {
      if (metric.name === "CLS") {
        // For CLS, lower is better
        if (metric.value > (thresholds as any).poor) {
          alertType = "critical";
          thresholdValue = (thresholds as any).poor;
          message = `High Cumulative Layout Shift: ${metric.value}`;
        } else if (metric.value > (thresholds as any).good) {
          alertType = "warning";
          thresholdValue = (thresholds as any).good;
          message = `Moderate Cumulative Layout Shift: ${metric.value}`;
        }
      } else {
        // For time-based metrics, higher is worse
        if (metric.value > (thresholds as any).poor) {
          alertType = "critical";
          thresholdValue = (thresholds as any).poor;
          message = `Poor ${metric.name}: ${metric.value}${metric.unit}`;
        } else if (metric.value > (thresholds as any).good) {
          alertType = "warning";
          thresholdValue = (thresholds as any).good;
          message = `Needs improvement ${metric.name}: ${metric.value}${metric.unit}`;
        }
      }
    } else if ("warning" in thresholds && "critical" in thresholds) {
      // Custom metric with warning/critical structure
      if (metric.value > (thresholds as any).critical) {
        alertType = "critical";
        thresholdValue = (thresholds as any).critical;
        message = `Critical ${metric.name}: ${metric.value}${metric.unit}`;
      } else if (metric.value > (thresholds as any).warning) {
        alertType = "warning";
        thresholdValue = (thresholds as any).warning;
        message = `Warning ${metric.name}: ${metric.value}${metric.unit}`;
      }
    }

    if (alertType) {
      const alert: PerformanceAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: alertType,
        metric: metric.name,
        value: metric.value,
        threshold: thresholdValue,
        message,
        timestamp: Date.now(),
        url: metric.context?.url || "",
        context: metric.metadata,
      };

      this.alerts.push(alert);

      // Send alert notification
      this.sendAlertNotification(alert);

      // Keep only recent alerts (last 100)
      if (this.alerts.length > 100) {
        this.alerts = this.alerts.slice(-100);
      }
    }
  }

  // Generate periodic performance report
  private generatePeriodicReport(): PerformanceReport {
    const now = Date.now();
    const periodStart = now - this.config.reportingInterval;

    const periodMetrics = this.metrics.filter(
      (m) => m.timestamp >= periodStart,
    );
    const periodAlerts = this.alerts.filter((a) => a.timestamp >= periodStart);

    // Calculate averages for Core Web Vitals
    const fcpMetrics = periodMetrics.filter((m) => m.name === "FCP");
    const lcpMetrics = periodMetrics.filter((m) => m.name === "LCP");
    const fidMetrics = periodMetrics.filter((m) => m.name === "FID");
    const clsMetrics = periodMetrics.filter((m) => m.name === "CLS");

    const report: PerformanceReport = {
      timestamp: now,
      period: { start: periodStart, end: now },
      metrics: periodMetrics,
      alerts: periodAlerts,
      summary: {
        averageFCP:
          fcpMetrics.length > 0
            ? fcpMetrics.reduce((sum, m) => sum + m.value, 0) /
              fcpMetrics.length
            : 0,
        averageLCP:
          lcpMetrics.length > 0
            ? lcpMetrics.reduce((sum, m) => sum + m.value, 0) /
              lcpMetrics.length
            : 0,
        averageFID:
          fidMetrics.length > 0
            ? fidMetrics.reduce((sum, m) => sum + m.value, 0) /
              fidMetrics.length
            : 0,
        averageCLS:
          clsMetrics.length > 0
            ? clsMetrics.reduce((sum, m) => sum + m.value, 0) /
              clsMetrics.length
            : 0,
        totalAlerts: periodAlerts.length,
        criticalAlerts: periodAlerts.filter((a) => a.type === "critical")
          .length,
        warningAlerts: periodAlerts.filter((a) => a.type === "warning").length,
        overallScore: this.calculateOverallScore(periodMetrics),
      },
      recommendations: this.generateRecommendations(
        periodMetrics,
        periodAlerts,
      ),
    };

    // Send report to analytics
    this.sendPerformanceReport(report);

    return report;
  }

  // Calculate overall performance score
  private calculateOverallScore(metrics: PerformanceMetric[]): number {
    let score = 100;
    const thresholds = this.config.alertThresholds;

    // Core Web Vitals scoring
    const fcp = metrics.find((m) => m.name === "FCP")?.value || 0;
    const lcp = metrics.find((m) => m.name === "LCP")?.value || 0;
    const fid = metrics.find((m) => m.name === "FID")?.value || 0;
    const cls = metrics.find((m) => m.name === "CLS")?.value || 0;

    // Deduct points for poor metrics
    if (fcp > thresholds.FCP.poor) score -= 10;
    else if (fcp > thresholds.FCP.good) score -= 5;

    if (lcp > thresholds.LCP.poor) score -= 10;
    else if (lcp > thresholds.LCP.good) score -= 5;

    if (fid > thresholds.FID.poor) score -= 10;
    else if (fid > thresholds.FID.good) score -= 5;

    if (cls > thresholds.CLS.poor) score -= 10;
    else if (cls > thresholds.CLS.good) score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  // Generate performance recommendations
  private generateRecommendations(
    metrics: PerformanceMetric[],
    alerts: PerformanceAlert[],
  ): string[] {
    const recommendations: string[] = [];

    // Core Web Vitals recommendations
    const fcp = metrics.find((m) => m.name === "FCP");
    if (fcp && fcp.value > PERFORMANCE_THRESHOLDS.FCP.good) {
      recommendations.push(
        "Optimize server response time and remove render-blocking resources",
      );
    }

    const lcp = metrics.find((m) => m.name === "LCP");
    if (lcp && lcp.value > PERFORMANCE_THRESHOLDS.LCP.good) {
      recommendations.push(
        "Optimize largest contentful paint by improving image loading and reducing blocking scripts",
      );
    }

    const fid = metrics.find((m) => m.name === "FID");
    if (fid && fid.value > PERFORMANCE_THRESHOLDS.FID.good) {
      recommendations.push(
        "Reduce JavaScript execution time and break up long tasks",
      );
    }

    const cls = metrics.find((m) => m.name === "CLS");
    if (cls && cls.value > PERFORMANCE_THRESHOLDS.CLS.good) {
      recommendations.push(
        "Reserve space for dynamic content and avoid inserting content above existing content",
      );
    }

    // Resource loading recommendations
    const slowResources = metrics.filter(
      (m) => m.name === "Resource_Load" && m.value > 2000,
    );
    if (slowResources.length > 0) {
      recommendations.push(
        `Optimize ${slowResources.length} slow-loading resources`,
      );
    }

    // Memory usage recommendations
    const highMemoryUsage = metrics.find(
      (m) => m.name === "Memory_Used" && m.value > 50 * 1024 * 1024,
    );
    if (highMemoryUsage) {
      recommendations.push(
        "High memory usage detected - consider optimizing memory-intensive operations",
      );
    }

    return recommendations;
  }

  // Send alert notification
  private sendAlertNotification(alert: PerformanceAlert): void {
    // Send to analytics for tracking
    if (typeof window !== "undefined" && (window as any).analytics) {
      (window as any).analytics.trackEvent({
        event: "performance_alert",
        category: "performance",
        action: "alert",
        label: alert.metric,
        value: alert.value,
        properties: {
          alertType: alert.type,
          threshold: alert.threshold,
          message: alert.message,
        },
      });
    }

    console.warn(`🚨 Performance Alert: ${alert.message}`);
  }

  // Send performance report
  private sendPerformanceReport(report: PerformanceReport): void {
    // Send summary to analytics
    if (typeof window !== "undefined" && (window as any).analytics) {
      (window as any).analytics.trackEvent({
        event: "performance_report",
        category: "performance",
        action: "report",
        properties: {
          score: report.summary.overallScore,
          alerts: report.summary.totalAlerts,
          fcp: report.summary.averageFCP,
          lcp: report.summary.averageLCP,
          fid: report.summary.averageFID,
          cls: report.summary.averageCLS,
        },
      });
    }
  }

  // Get current context
  private getContext(): PerformanceMetric["context"] {
    if (typeof window === "undefined") return undefined;

    return {
      url: window.location.href,
      userAgent: navigator.userAgent,
      connectionType: (navigator as any).connection?.effectiveType,
      deviceMemory: (navigator as any).deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency,
    };
  }

  // Utility methods
  private isCriticalResource(url: string): boolean {
    // Consider resources that are likely to impact performance
    return (
      url.includes(".js") && !url.includes("chunk") && !url.includes("vendor")
    );
  }

  private getResourceType(initiatorType: string): string {
    switch (initiatorType) {
      case "img":
        return "image";
      case "script":
        return "javascript";
      case "link":
        return "stylesheet";
      case "xmlhttprequest":
      case "fetch":
        return "api";
      default:
        return initiatorType || "unknown";
    }
  }

  // Public API methods
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  getLatestReport(): PerformanceReport | null {
    return this.generatePeriodicReport();
  }

  clearData(): void {
    this.metrics = [];
    this.alerts = [];
  }

  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }
}

// React hook for performance monitoring
export function usePerformanceMonitoring(config?: Partial<PerformanceConfig>) {
  const monitorRef = useRef<AdvancedPerformanceMonitor | null>(null);

  useEffect(() => {
    if (!monitorRef.current) {
      monitorRef.current = new AdvancedPerformanceMonitor(config);
      monitorRef.current.startMonitoring().catch(console.error);
    }

    return () => {
      if (monitorRef.current) {
        monitorRef.current.stopMonitoring();
      }
    };
  }, []);

   const trackTiming = useCallback((name: string, startMark?: string) => {
     if (
       monitorRef.current &&
       typeof window !== "undefined" &&
       window.performance
     ) {
       const markName = startMark || `${name}_start`;

       if (startMark) {
         // End timing
         window.performance.mark(`${name}_end`);
         window.performance.measure(name, markName, `${name}_end`);
       } else {
         // Start timing
         window.performance.mark(markName);
       }
     }
   }, []);

   const recordMetric = useCallback(
     (name: string, value: number, unit: string = "ms", metadata?: any) => {
       if (monitorRef.current) {
         monitorRef.current.recordMetric({ name, value, unit, metadata });
       }
     },
     [],
   );

  return {
    trackTiming,
    recordMetric,
    getMetrics: () => monitorRef.current?.getMetrics() || [],
    getAlerts: () => monitorRef.current?.getAlerts() || [],
    getLatestReport: () => monitorRef.current?.getLatestReport() || null,
    isMonitoringActive: () => monitorRef.current?.isMonitoringActive() || false,
  };
}

// Utility functions for common performance measurements
export const PerformanceUtils = {
  // Measure function execution time
  measureExecutionTime: async <T>(
    fn: () => Promise<T> | T,
    name: string,
    monitor?: AdvancedPerformanceMonitor,
  ): Promise<T> => {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;

      if (monitor) {
        monitor.recordMetric({
          name: `Execution_Time_${name}`,
          value: duration,
          unit: "ms",
        });
      }

      return result;
    } catch (error: unknown) {
      const duration = performance.now() - start;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      if (monitor) {
        monitor.recordMetric({
          name: `Execution_Time_${name}_Error`,
          value: duration,
          unit: "ms",
          metadata: { error: errorMessage },
        });
      }

      throw error;
    }
  },

  // Measure API response time
  measureApiCall: async (
    url: string,
    method: string = "GET",
    monitor?: AdvancedPerformanceMonitor,
  ): Promise<Response> => {
    const start = performance.now();

    try {
      const response = await fetch(url, { method });
      const duration = performance.now() - start;

      if (monitor) {
        monitor.recordMetric({
          name: "API_Response_Time",
          value: duration,
          unit: "ms",
          metadata: {
            url,
            method,
            status: response.status,
            success: response.ok,
          },
        });
      }

      return response;
    } catch (error: unknown) {
      const duration = performance.now() - start;
      const errorMessage =
        error instanceof Error ? error.message : "Network error";

      if (monitor) {
        monitor.recordMetric({
          name: "API_Response_Time_Error",
          value: duration,
          unit: "ms",
          metadata: {
            url,
            method,
            error: errorMessage,
          },
        });
      }

      throw error;
    }
  },

  // Measure component render time
  measureRenderTime: (
    componentName: string,
    monitor?: AdvancedPerformanceMonitor,
  ) => {
    const start = performance.now();
    const duration = performance.now() - start;

    if (monitor) {
      monitor.recordMetric({
        name: `Render_Time_${componentName}`,
        value: duration,
        unit: "ms",
      });
    }

    return () => undefined;
  },

  // Monitor memory usage
  getMemoryUsage: (): { used: number; total: number; limit: number } | null => {
    if (typeof window === "undefined" || !("memory" in performance)) {
      return null;
    }

    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
    };
  },

  // Calculate Core Web Vitals scores
  calculateCWVScores: (metrics: {
    fcp?: number;
    lcp?: number;
    fid?: number;
    cls?: number;
  }) => {
    const scores = {
      fcp: metrics.fcp
        ? metrics.fcp <= 1800
          ? "good"
          : metrics.fcp <= 3000
            ? "needs-improvement"
            : "poor"
        : "unknown",
      lcp: metrics.lcp
        ? metrics.lcp <= 2500
          ? "good"
          : metrics.lcp <= 4000
            ? "needs-improvement"
            : "poor"
        : "unknown",
      fid: metrics.fid
        ? metrics.fid <= 100
          ? "good"
          : metrics.fid <= 300
            ? "needs-improvement"
            : "poor"
        : "unknown",
      cls: metrics.cls
        ? metrics.cls <= 0.1
          ? "good"
          : metrics.cls <= 0.25
            ? "needs-improvement"
            : "poor"
        : "unknown",
    };

    const goodCount = Object.values(scores).filter(
      (score) => score === "good",
    ).length;
    const overallScore =
      goodCount === 4 ? "good" : goodCount >= 2 ? "needs-improvement" : "poor";

    return { scores, overallScore };
  },
};
