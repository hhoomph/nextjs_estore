/**
 * Module for admin
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { endOfDay, startOfDay, startOfMonth, startOfWeek } from "date-fns";
import type { AuthUser } from "@/types/database";

// Admin utility functions for data processing and formatting

export interface SalesReport {
  period: string;
  revenue: number;
  orders: number;
  customers: number;
  averageOrderValue: number;
  growth: number;
}

export interface ExportData {
  headers: string[];
  rows: (string | number)[][];
  filename: string;
}

/**
 * Generate sales report for a given period
 */
export function generateSalesReport(
  salesData: Array<{ date: string; revenue: number; orders: number }>,
  userGrowth: Array<{ date: string; users: number }>,
): SalesReport[] {
  const reports: SalesReport[] = [];
  const now = new Date();

  // Generate reports for different periods
  const periods = [
    {
      label: "Today",
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    },
    { label: "This Week", start: startOfWeek(now, { weekStartsOn: 1 }) },
    { label: "This Month", start: startOfMonth(now) },
    {
      label: "Last 7 Days",
      start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      label: "Last 30 Days",
      start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    },
  ];

  periods.forEach((period, index) => {
    const periodData = salesData.filter(
      (item) => new Date(item.date) >= period.start,
    );
    const userData = userGrowth.filter(
      (item) => new Date(item.date) >= period.start,
    );

    const totalRevenue = periodData.reduce(
      (sum, item) => sum + item.revenue,
      0,
    );
    const totalOrders = periodData.reduce((sum, item) => sum + item.orders, 0);
    const totalCustomers = userData.reduce((sum, item) => sum + item.users, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate growth compared to previous period
    let growth = 0;
    if (index > 0) {
      const prevPeriod = periods[index - 1];
      const prevData = salesData.filter((item) => {
        const date = new Date(item.date);
        return date >= prevPeriod.start && date < period.start;
      });
      const prevRevenue = prevData.reduce((sum, item) => sum + item.revenue, 0);
      if (prevRevenue > 0) {
        growth = ((totalRevenue - prevRevenue) / prevRevenue) * 100;
      }
    }

    reports.push({
      period: period.label,
      revenue: totalRevenue,
      orders: totalOrders,
      customers: totalCustomers,
      averageOrderValue,
      growth,
    });
  });

  return reports;
}

/**
 * Export data to CSV format
 */
export function exportDataToCSV(data: ExportData): string {
  const { headers, rows } = data;

  // Create CSV content
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((cell) => {
          // Escape commas and quotes in cell values
          const cellStr = String(cell);
          if (
            cellStr.includes(",") ||
            cellStr.includes('"') ||
            cellStr.includes("\n")
          ) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        })
        .join(","),
    ),
  ].join("\n");

  return csvContent;
}

/**
 * Format currency values
 */
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Calculate growth percentage
 */
export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Format large numbers with abbreviations (K, M, B)
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + "B";
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces, underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Check if user has admin permissions
 */
export function isAdmin(user: AuthUser | null | undefined): boolean {
  return user?.role === "ADMIN";
}

/**
 * Get status color for UI components
 */
export function getStatusColor(status: string): string {
  const colors = {
    pending: "bg-warning/10 text-warning",
    processing: "bg-primary/10 text-primary",
    shipped: "bg-secondary text-secondary-foreground",
    delivered: "bg-success/10 text-success",
    cancelled: "bg-destructive/10 text-destructive",
    active: "bg-success/10 text-success",
    inactive: "bg-muted text-muted-foreground",
  };

  return colors[status as keyof typeof colors] || "bg-muted text-muted-foreground";
}

/**
 * Calculate date ranges for analytics
 */
export function getDateRange(period: string): { start: Date; end: Date } {
  const now = new Date();
  const end = endOfDay(now);

  let start: Date;

  switch (period) {
    case "7":
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30":
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "90":
      start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case "365":
      start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return { start: startOfDay(start), end };
}

/**
 * Sort array by key
 */
export function sortByKey<T>(
  array: T[],
  key: keyof T,
  direction: "asc" | "desc" = "asc",
): T[] {
  return [...array].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];

    if (aValue < bValue) return direction === "asc" ? -1 : 1;
    if (aValue > bValue) return direction === "asc" ? 1 : -1;
    return 0;
  });
}

/**
 * Filter array by search term
 */
export function filterBySearch<T>(
  array: T[],
  searchTerm: string,
  keys: (keyof T)[],
): T[] {
  if (!searchTerm) return array;

  const term = searchTerm.toLowerCase();
  return array.filter((item) =>
    keys.some((key) => {
      const value = item[key];
      return String(value).toLowerCase().includes(term);
    }),
  );
}
