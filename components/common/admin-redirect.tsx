/**
 * Module for admin-redirect
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";

export function AdminRedirect() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        // Not signed in, redirect to admin sign-in
        router.push("/admin/signin");
      } else if (session.user.role !== "ADMIN") {
        // Signed in but not admin, redirect to admin sign-in
        router.push("/admin/signin");
      } else {
        // Admin user, redirect to admin dashboard
        router.push("/admin");
      }
    }
  }, [session, isPending, router]);

  // Show loading while checking session
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render anything while redirecting
  return null;
}
