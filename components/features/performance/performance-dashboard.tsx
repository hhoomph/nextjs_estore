/**
 * Performance Dashboard Component
 *
 * Real-time performance monitoring dashboard for Core Web Vitals
 * and application metrics.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

"use client";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  Monitor,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { usePerformanceMonitoring } from "@/lib/lazy";

interface PerformanceMetric {
  name: string;
  value: number;
  status: "good" | "needs-improvement" | "poor";
  thresholds: {
    good: number;
    poor: number;
  };
  unit: string;
  description: string;
}

interface PerformanceDashboardProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

export function PerformanceDashboard({
  isVisible = false,
  onToggle,
}: PerformanceDashboardProps) {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get performance metrics from the monitoring system
  const performanceData = usePerformanceMonitoring();

  useEffect(() => {
    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [performanceData]);

  const updateMetrics = () => {
    const newMetrics: PerformanceMetric[] = [
      {
        name: "LCP",
        value: performanceData.lcp || 0,
        status: getMetricStatus(performanceData.lcp || 0, 2500, 4000),
        thresholds: { good: 2500, poor: 4000 },
        unit: "ms",
        description: "Largest Contentful Paint",
      },
      {
        name: "FID",
        value: performanceData.fid || 0,
        status: getMetricStatus(performanceData.fid || 0, 100, 300, true),
        thresholds: { good: 100, poor: 300 },
        unit: "ms",
        description: "First Input Delay",
      },
      {
        name: "CLS",
        value: performanceData.cls || 0,
        status: getMetricStatus(performanceData.cls || 0, 0.1, 0.25, true),
        thresholds: { good: 0.1, poor: 0.25 },
        unit: "",
        description: "Cumulative Layout Shift",
      },
      {
        name: "FCP",
        value: performanceData.fcp || 0,
        status: getMetricStatus(performanceData.fcp || 0, 1800, 3000),
        thresholds: { good: 1800, poor: 3000 },
        unit: "ms",
        description: "First Contentful Paint",
      },
      {
        name: "TTFB",
        value: performanceData.ttfb || 0,
        status: getMetricStatus(performanceData.ttfb || 0, 800, 1800),
        thresholds: { good: 800, poor: 1800 },
        unit: "ms",
        description: "Time to First Byte",
      },
    ];

    setMetrics(newMetrics);
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  const getMetricStatus = (
    value: number,
    goodThreshold: number,
    poorThreshold: number,
    lowerIsBetter = false,
  ): "good" | "needs-improvement" | "poor" => {
    if (lowerIsBetter) {
      if (value <= goodThreshold) return "good";
      if (value <= poorThreshold) return "needs-improvement";
      return "poor";
    } else {
      if (value <= goodThreshold) return "good";
      if (value <= poorThreshold) return "needs-improvement";
      return "poor";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-success bg-success/10";
      case "needs-improvement":
        return "text-warning bg-warning/10";
      case "poor":
        return "text-destructive bg-destructive/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "good":
        return <CheckCircle className="h-4 w-4" />;
      case "needs-improvement":
        return <AlertTriangle className="h-4 w-4" />;
      case "poor":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const calculateOverallScore = () => {
    if (metrics.length === 0) return 0;

    const weights = { good: 1, "needs-improvement": 0.5, poor: 0 };
    const totalScore = metrics.reduce((sum, metric) => {
      return sum + (weights[metric.status] || 0);
    }, 0);

    return Math.round((totalScore / metrics.length) * 100);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    updateMetrics();
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onToggle}
          size="sm"
          variant="outline"
          className="shadow-lg"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Performance
        </Button>
      </div>
    );
  }

  const overallScore = calculateOverallScore();

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-hidden">
      <Card className="shadow-xl border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Monitor className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Performance Monitor</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleRefresh}
                size="sm"
                variant="ghost"
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
              <Button onClick={onToggle} size="sm" variant="ghost">
                ✕
              </Button>
            </div>
          </div>

          {/* Overall Score */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              <Badge
                variant={overallScore >= 80 ? "default" : "destructive"}
                className="text-sm"
              >
                Score: {overallScore}/100
              </Badge>
              <span className="text-xs text-muted-foreground">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 max-h-64 overflow-y-auto">
          {metrics.map((metric) => (
            <div
              key={metric.name}
              className="flex items-center justify-between p-2 rounded-lg border bg-card"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">{metric.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${getStatusColor(metric.status)}`}
                  >
                    {getStatusIcon(metric.status)}
                    <span className="ml-1 capitalize">
                      {metric.status.replace("-", " ")}
                    </span>
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.description}
                </p>
              </div>

              <div className="text-right">
                <div className="font-mono text-sm font-bold">
                  {metric.value.toFixed(metric.name === "CLS" ? 3 : 0)}
                  {metric.unit}
                </div>
                <div className="text-xs text-muted-foreground">
                  Good: ≤{metric.thresholds.good}
                  {metric.unit}
                </div>
              </div>
            </div>
          ))}

          {metrics.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Collecting performance metrics...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Performance Alert Component
export function PerformanceAlert({
  alert,
  onDismiss,
}: {
  alert: {
    type: "warning" | "error";
    message: string;
    metric: string;
    value: number;
    threshold: number;
  };
  onDismiss: () => void;
}) {
  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border-2 max-w-sm ${
        alert.type === "error"
          ? "bg-destructive/10 border-destructive text-destructive"
          : "bg-warning/10 border-warning text-foreground"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">
              Performance Alert: {alert.metric}
            </h4>
            <p className="text-sm mt-1">{alert.message}</p>
            <p className="text-xs mt-2 opacity-75">
              Value: {alert.value} | Threshold: {alert.threshold}
            </p>
          </div>
        </div>
        <Button
          onClick={onDismiss}
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
        >
          ✕
        </Button>
      </div>
    </div>
  );
}
