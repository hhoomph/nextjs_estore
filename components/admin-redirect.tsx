/**
 * Module for admin-redirect
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";

export function AdminRedirect() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  // Handle redirects when authentication state changes
  useEffect(() => {
    if (!isPending) {
      // If user is not signed in, redirect to admin signin
      if (!session) {
        router.push("/admin/signin");
        return;
      }

      // If user is signed in but not admin, redirect to home
      if (session.user.role !== "ADMIN") {
        router.push("/");
        return;
      }
    }
  }, [session, isPending, router]);

  // Show loading state while checking authentication
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50"
      suppressHydrationWarning={true}
    >
      <div className="text-center">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
          style={{ borderBottomColor: "rgb(37, 99, 235)" }}
        ></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Checking Permissions
        </h2>
        <p className="text-gray-600">Redirecting to admin panel...</p>
      </div>
    </div>
  );
}
