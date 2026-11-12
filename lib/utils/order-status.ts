import type { OrderStatus } from "@/lib/generated/prisma/client";

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

/**
 * Normalises an externally supplied order status to the Prisma enum value.
 *
 * The UI has historically sent lower-case values, and the enum has no
 * PROCESSING state (the admin UI mapped it onto CONFIRMED), so both forms are
 * accepted. Returns null when the value cannot be mapped.
 */
export function normaliseOrderStatus(value: unknown): OrderStatus | null {
  if (typeof value !== "string") return null;

  const normalised = value.trim().toUpperCase();
  if (normalised === "PROCESSING") return "CONFIRMED";
  if (normalised === "CONFIRMED") return "CONFIRMED";

  return ORDER_STATUSES.includes(normalised as OrderStatus)
    ? (normalised as OrderStatus)
    : null;
}
