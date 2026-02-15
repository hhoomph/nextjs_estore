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
import prisma from "@/lib/prisma";

// Better Auth configuration with database integration
export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
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
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        html: `Welcome, ${user.name}! Please click the link to verify your email: <a href="${url}">${url}</a>`,
      });
    },
    sendResetPassword: async ({
      user,
      url,
    }: {
      user: { email: string; name?: string };
      url: string;
    }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        html: `Hi, ${user.name}. Please click the link to reset your password: <a href="${url}">${url}</a>`,
      });
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
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
