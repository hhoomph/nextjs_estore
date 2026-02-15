/**
 * Admin Redirect Logic
 *
 * Handles automatic redirection of admin users after authentication
 * and provides utilities for admin role checking.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import type { Session } from "./config";

/**
 * Extended session interface for admin checking
 */
export interface ExtendedSession extends Session {
  isAdmin?: boolean;
}

/**
 * Checks if a user has admin role
 */
export function isUserAdmin(
  session: Session | ExtendedSession | null,
): boolean {
  if (!session) return false;

  // Check if it's an ExtendedSession (has isAdmin property)
  if ("isAdmin" in session) {
    return session.isAdmin === true;
  }

  // Otherwise it's a regular Session, check user role
  return session.user?.role === "ADMIN";
}

/**
 * Gets the appropriate redirect URL based on user role
 */
export function getRoleBasedRedirect(
  session: Session | ExtendedSession | null,
): string {
  if (!session) {
    return "/auth/signin";
  }

  if (isUserAdmin(session)) {
    return "/admin";
  }

  return "/dashboard";
}

/**
 * Handles post-authentication redirect with role checking
 */
export async function handlePostAuthRedirect(
  session: Session | ExtendedSession | null,
): Promise<string> {
  // Small delay to ensure session is fully loaded
  await new Promise((resolve) => setTimeout(resolve, 100));

  return getRoleBasedRedirect(session);
}

/**
 * Admin access control middleware
 */
export function requireAdmin(session: Session | null): {
  allowed: boolean;
  redirectTo?: string;
} {
  if (!session) {
    return { allowed: false, redirectTo: "/auth/signin" };
  }

  if (!isUserAdmin(session)) {
    return { allowed: false, redirectTo: "/dashboard" };
  }

  return { allowed: true };
}

/**
 * User access control middleware
 */
export function requireUser(session: Session | null): {
  allowed: boolean;
  redirectTo?: string;
} {
  if (!session) {
    return { allowed: false, redirectTo: "/auth/signin" };
  }

  return { allowed: true };
}
