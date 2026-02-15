/**
 * Module for auth-provider
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import { BetterAuthProvider } from "@/components/providers/better-auth-provider";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <BetterAuthProvider>{children}</BetterAuthProvider>;
}
