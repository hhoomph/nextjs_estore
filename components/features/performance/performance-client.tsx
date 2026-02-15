"use client";
import dynamic from "next/dynamic";
import React from "react";

const PerformanceDashboard = dynamic(
  () =>
    import("@/components/features/performance/performance-dashboard").then(
      (mod) => ({
        default: (mod as any).PerformanceDashboard || (mod as any).default,
      }),
    ),
  {
    ssr: false,
    loading: () => null,
  },
) as unknown as React.ComponentType<any>;

export default function PerformanceDashboardClient() {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <PerformanceDashboard
      isVisible={isVisible}
      onToggle={() => setIsVisible((v) => !v)}
    />
  );
}
