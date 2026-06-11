"use client";

import { useCallback, useEffect, useState } from "react";

export interface BrowserSessionUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: string;
  [key: string]: unknown;
}

export interface BrowserSession {
  user: BrowserSessionUser;
  session?: {
    id: string;
    userId: string;
    expiresAt: string;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
}

interface UseBrowserSessionOptions {
  enabled?: boolean;
}

export function useBrowserSession({
  enabled = true,
}: UseBrowserSessionOptions = {}) {
  const [session, setSession] = useState<BrowserSession | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/get-session", {
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json().catch(() => ({}));
      const browserSession = data?.session?.user
        ? data.session
        : data?.session && data?.user
          ? { ...data.session, user: data.user }
          : null;

      setSession(browserSession);
    } catch (err) {
      setSession(null);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load the current session.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { session, isLoading, error, refetch };
}
