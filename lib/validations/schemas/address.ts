/**
 * Module for address
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { z } from "zod";

export const addressSchema = z.object({
  address_line1: z.string().min(1, "Address line 1 is required"),
  address_line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State/Province is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  telephone: z.string().optional(),
  mobile: z
    .string()
    .min(1, "Mobile number is required")
    .regex(/^(\+98|0)?9\d{9}$/, "Invalid mobile number format"),
  location: z.string().optional(),
  is_default: z.boolean().default(false),
});

export const updateAddressSchema = addressSchema.extend({
  id: z.string().min(1, "Address ID is required"),
});

export const setDefaultAddressSchema = z.object({
  addressId: z.string().min(1, "Address ID is required"),
});

export type AddressFormData = z.infer<typeof addressSchema>;
export type UpdateAddressData = z.infer<typeof updateAddressSchema>;
export type SetDefaultAddressData = z.infer<typeof setDefaultAddressSchema>;
