/**
 * Conditional Navbar Component
 *
 * Intelligently renders navbar based on current route to prevent duplicates
 * on admin pages and other special layouts.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

"use client";

import { usePathname } from "next/navigation";
import { UnifiedNavbar } from "./unified-navbar";

/**
 * Routes that should NOT show the main navbar
 * These routes have their own navigation systems
 */
const EXCLUDED_ROUTES = [
  // Admin routes - have their own sidebar navigation
  /^\/admin/, // Matches /admin (without locale prefix) - highest priority
  /^\/[^/]+\/admin/, // Matches /en/admin, /fa/admin, etc.

  // Auth routes - authentication pages don't need main navbar
  /^\/auth/, // Matches /auth (without locale prefix)
  /^\/[^/]+\/auth/, // Matches /en/auth, /fa/auth, etc.

  // API routes - no navigation needed
  /^\/api/,

  // Static assets and files
  /\.(ico|png|jpg|jpeg|gif|svg|css|js|json|xml|txt|pdf)$/,

  // Health check and monitoring endpoints
  /^\/health/,
];

/**
 * Routes that should ALWAYS show the navbar
 * (useful for overriding exclusions if needed)
 */
const FORCED_ROUTES: RegExp[] = [
  // Add any routes that should always show navbar here
];

/**
 * Check if current route should exclude navbar
 */
function shouldExcludeNavbar(pathname: string): boolean {
  // Check forced routes first (higher priority)
  for (const route of FORCED_ROUTES) {
    if (route.test(pathname)) {
      return false;
    }
  }

  // Check excluded routes
  for (const route of EXCLUDED_ROUTES) {
    if (route.test(pathname)) {
      return true;
    }
  }

  return false;
}

/**
 * Conditional navbar that only renders on appropriate routes
 * Prevents navbar duplication on admin pages and other special layouts
 * Now guaranteed to have NextIntl context since it's rendered within the provider
 */
export function ConditionalNavbar() {
  const pathname = usePathname();

  // Don't render navbar if route is excluded
  if (shouldExcludeNavbar(pathname)) {
    return null;
  }

  return <UnifiedNavbar />;
}

/**
 * Hook to check navbar visibility for programmatic access
 */
export function useNavbarVisibility() {
  const pathname = usePathname();
  return !shouldExcludeNavbar(pathname);
}
