import { z } from "zod";

export const checkoutContactSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().min(1, "Email is required").max(254).email("Invalid email address"),
  phone: z.string().min(1, "Phone is required").max(20),
  createAccount: z.boolean().default(false),
  password: z.string().min(8, "Password must be at least 8 characters").max(128).optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.createAccount) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type CheckoutContactFormData = z.infer<typeof checkoutContactSchema>;
