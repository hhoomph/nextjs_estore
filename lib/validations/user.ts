/**
 * User validation schemas using Zod
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { z } from "zod";

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(
    /[!@#$%^&*(),.?":{}|<>]/,
    "Password must contain at least one special character",
  );

// Email validation schema
export const emailSchema = z
  .string()
  .email("Invalid email address")
  .toLowerCase();

// Phone number validation schema (Iranian format)
export const phoneSchema = z
  .string()
  .regex(/^(\+98|0)?9\d{9}$/, "Invalid phone number format")
  .transform((val) => val.replace(/^0/, "+98"));

// User creation schema
export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must be less than 255 characters")
    .trim(),
  email: emailSchema,
  password: passwordSchema,
  phone_number: phoneSchema.optional(),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
  active: z.boolean().default(true),
});

// User update schema
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must be less than 255 characters")
    .trim()
    .optional(),
  email: emailSchema.optional(),
  phone_number: phoneSchema.optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
  active: z.boolean().optional(),
});

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// Password change schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Password reset schema
export const resetPasswordSchema = z.object({
  email: emailSchema,
});

// Set new password schema
export const setNewPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// User profile schema
export const userProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must be less than 255 characters")
    .trim(),
  email: emailSchema,
  phone_number: phoneSchema.optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be less than 50 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, hyphens, and underscores",
    )
    .optional(),
});

// Type exports
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type SetNewPasswordInput = z.infer<typeof setNewPasswordSchema>;
export type UserProfileInput = z.infer<typeof userProfileSchema>;
