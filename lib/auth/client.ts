/**
 * Module for client
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import { adminClient, phoneNumberClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL:
    process.env.NODE_ENV === "production"
      ? process.env.BETTER_AUTH_BASE_URL || process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      : "http://localhost:3000",
  plugins: [adminClient(), phoneNumberClient()],
});
export const { signIn, signUp, signOut, useSession } = authClient;
export type Session = typeof authClient.$Infer.Session;
