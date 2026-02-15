/**
 * Environment variable validation
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { z } from "zod";

// Environment schema validation
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),

  // Next.js
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL must be a valid URL"),

  // Better Auth
  NEXTAUTH_SECRET: z
    .string()
    .min(32, "NEXTAUTH_SECRET must be at least 32 characters"),

  // OAuth Providers (optional)
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Email service (optional for now)
  RESEND_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // File upload
  UPLOAD_MAX_SIZE: z.string().default("5242880"), // 5MB default
  UPLOAD_ALLOWED_TYPES: z.string().default("image/jpeg,image/png,image/webp"),

  // Security
  SECURITY_RATE_LIMIT_MAX: z.string().default("100"),
  SECURITY_RATE_LIMIT_WINDOW: z.string().default("15"), // minutes

  // Node environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Optional analytics
  GOOGLE_ANALYTICS_ID: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
});

// Validate environment variables
const envValidation = envSchema.safeParse(process.env);

if (!envValidation.success) {
  console.error("❌ Invalid environment variables:");
  envValidation.error.issues.forEach((error) => {
    console.error(`  ${error.path.join(".")}: ${error.message}`);
  });
  throw new Error("Invalid environment configuration");
}

// Export validated environment
export const env = envValidation.data;

// Type for environment variables
export type Env = typeof env;

// Helper to check if we're in production
export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";
export const isTest = env.NODE_ENV === "test";

// Helper to get environment-specific values
export const getEnvValue = (key: keyof Env): string | undefined => {
  return env[key] as string | undefined;
};

// Validate OAuth configuration
export const hasOAuthProvider = (provider: "github" | "google"): boolean => {
  switch (provider) {
    case "github":
      return !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET);
    case "google":
      return !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
    default:
      return false;
  }
};

// Validate email configuration
export const hasEmailService = (): boolean => {
  return !!(
    env.RESEND_API_KEY ||
    (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS)
  );
};
