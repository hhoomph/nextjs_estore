/**
 * Module for config
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/database";

// Suppress warnings about missing OAuth providers in development
const originalWarn = console.warn;
const suppressedWarnings = ["[better-auth]", "Social provider"];
const filteredWarn = (...args: any[]) => {
  const message = String(args[0]);
  if (!suppressedWarnings.some(warning => message.includes(warning))) {
    originalWarn(...args);
  }
};

// Only suppress in development
if (process.env.NODE_ENV === "development") {
  console.warn = filteredWarn;
}

// Better Auth configuration with database integration
export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "development-secret-key",
  baseURL: process.env.BETTER_AUTH_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  trustHost: true,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    modelName: "user",
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        required: false,
      },
      phone_number: {
        type: "string",
        required: false,
      },
      active: {
        type: "boolean",
        defaultValue: true,
        required: false,
      },
    },
    fieldMap: {
      emailVerified: "emailVerified",
      image: "image",
    },
    changeEmail: {
      enabled: true,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: process.env.NODE_ENV === "production", // Enable email verification in production
    sendVerificationRequest: async ({
      user,
      url,
    }: {
      user: { email: string; name?: string };
      url: string;
    }) => {
      try {
        await sendEmail({
          to: user.email,
          subject: "Verify your email address",
          html: `Welcome, ${user.name}! Please click the link to verify your email: <a href="${url}">${url}</a>`,
        });
      } catch (error) {
        console.warn("[v0] Email sending not configured, skipping verification email");
      }
    },
    sendResetPassword: async ({
      user,
      url,
    }: {
      user: { email: string; name?: string };
      url: string;
    }) => {
      try {
        await sendEmail({
          to: user.email,
          subject: "Reset your password",
          html: `Hi, ${user.name}. Please click the link to reset your password: <a href="${url}">${url}</a>`,
        });
      } catch (error) {
        console.warn("[v0] Email sending not configured, skipping password reset email");
      }
    },
  },
  socialProviders: {
    // Only include providers that have credentials configured
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
  },
  advanced: {
    cookiePrefix: "estore",
    crossSubDomainCookies: {
      enabled: false, // Disable for localhost development
    },
    defaultCookieOptions: {
      secure: process.env.NODE_ENV === "production", // Secure cookies in production
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60, // Update session every hour
    },
  },
  trustedOrigins: [
    "http://localhost:3000",
    // Add your production URL here
    ...(process.env.NEXT_PUBLIC_APP_URL
      ? [process.env.NEXT_PUBLIC_APP_URL]
      : []),
  ],
});

export type Session = typeof auth.$Infer.Session;

// Helper functions for role checking
export const isAdmin = (session: Session | null) => {
  return session?.user?.role === "ADMIN";
};

export const isUser = (session: Session | null) => {
  return session?.user?.role === "USER";
};

export const hasRole = (session: Session | null, role: string) => {
  return session?.user?.role === role;
};
