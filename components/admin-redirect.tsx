/**
 * Module for admin-redirect
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useSession } from "@/lib/auth-client";

export function AdminRedirect() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const hasFetched = useRef(false);

  // Track when session has actually been fetched at least once
  useEffect(() => {
    if (!isPending && !hasFetched.current) {
      hasFetched.current = true;
    }
  }, [isPending]);

  // Only redirect AFTER the session has been fully fetched (not just initial render)
  useEffect(() => {
    if (!hasFetched.current) return;
    if (isPending) return;

    // Check both possible session data structures
    const userObj = (session?.user as any) || (session?.session as any)?.user;

    // Session was fetched and user is not signed in or not admin
    if (!userObj) {
      router.push("/admin/signin");
      return;
    }

    if (userObj.role !== "ADMIN") {
      router.push("/");
      return;
    }
  }, [session, isPending, router]);

  // Show loading state while checking authentication
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-background"
      suppressHydrationWarning={true}
    >
      <div className="text-center">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
          style={{ borderBottomColor: "var(--primary)" }}
        ></div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Checking Permissions
        </h2>
        <p className="text-muted-foreground">Redirecting to admin panel...</p>
      </div>
    </div>
  );
}
