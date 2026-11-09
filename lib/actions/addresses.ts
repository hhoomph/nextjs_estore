"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/database";
import { randomUUID } from "crypto";
import type {
  AddressFormData,
  SetDefaultAddressData,
  UpdateAddressData,
} from "@/lib/validations/schemas/address";
import {
  addressSchema,
  setDefaultAddressSchema,
  updateAddressSchema,
} from "@/lib/validations/schemas/address";

const mapRow = (a: any) => ({
  id: a.id,
  userId: a.userId ?? a.userid,
  addressLine1: a.addressLine1 ?? a.addressline1,
  addressLine2: a.addressLine2 ?? a.addressline2,
  city: a.city,
  state: a.state,
  postalCode: a.postalCode ?? a.postalcode,
  country: a.country,
  telephone: a.telephone,
  mobile: a.mobile,
  location: a.location,
  isDefault: a.isDefault ?? a.isdefault,
  createdAt: a.createdAt ?? a.createdat,
  updatedAt: a.updatedAt ?? a.updatedat,
  // snake_case for UI
  address_line1: a.addressLine1 ?? a.addressline1,
  address_line2: a.addressLine2 ?? a.addressline2,
  postal_code: a.postalCode ?? a.postalcode,
  is_default: a.isDefault ?? a.isdefault,
});

export async function getUserAddresses(userId: string) {
  try {
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM "address" WHERE "userId" = $1 ORDER BY "isDefault" DESC, "id" DESC`,
      userId,
    );
    return { success: true, addresses: rows.map(mapRow) };
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return { success: false, error: "Failed to fetch addresses" };
  }
}

export async function createAddress(userId: string, data: AddressFormData) {
  try {
    const validatedData = addressSchema.parse(data);

    if (validatedData.is_default) {
      await prisma.$executeRawUnsafe(
        `UPDATE "address" SET "isDefault" = false WHERE "userId" = $1`,
        userId,
      );
    }

    const newId = randomUUID();
    const rows: any[] = await prisma.$queryRawUnsafe(
      `INSERT INTO "address" ("id","addressLine1","addressLine2","city","state","postalCode","country","telephone","mobile","location","isDefault","userId","createdAt","updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW(),NOW()) RETURNING *`,
      newId,
      validatedData.address_line1,
      validatedData.address_line2 ?? null,
      validatedData.city,
      validatedData.state,
      validatedData.postal_code,
      validatedData.country,
      validatedData.telephone ?? null,
      validatedData.mobile,
      validatedData.location ?? null,
      validatedData.is_default,
      userId,
    );

    try { revalidatePath("/settings/addresses"); } catch {}
    try { revalidatePath("/checkout"); } catch {}

    return { success: true, address: mapRow(rows[0]) };
  } catch (error) {
    console.error("Error creating address:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create address" };
  }
}

export async function updateAddress(userId: string, data: UpdateAddressData) {
  try {
    const { id, ...updateData } = updateAddressSchema.parse(data);

    if (updateData.is_default) {
      await prisma.$executeRawUnsafe(
        `UPDATE "address" SET "isDefault" = false WHERE "userId" = $1 AND "id" <> $2`,
        userId,
        id,
      );
    }

    const sets: string[] = [];
    const vals: any[] = [];
    let idx = 1;
    const add = (col: string, val: any) => {
      sets.push(`"${col}" = $${idx++}`);
      vals.push(val);
    };
    if (updateData.address_line1 !== undefined) add("addressLine1", updateData.address_line1);
    if (updateData.address_line2 !== undefined) add("addressLine2", updateData.address_line2);
    if (updateData.city !== undefined) add("city", updateData.city);
    if (updateData.state !== undefined) add("state", updateData.state);
    if (updateData.postal_code !== undefined) add("postalCode", updateData.postal_code);
    if (updateData.country !== undefined) add("country", updateData.country);
    if (updateData.telephone !== undefined) add("telephone", updateData.telephone);
    if (updateData.mobile !== undefined) add("mobile", updateData.mobile);
    if (updateData.location !== undefined) add("location", updateData.location);
    if (updateData.is_default !== undefined) add("isDefault", updateData.is_default);
    sets.push(`"updatedAt" = NOW()`);
    vals.push(id);
    vals.push(userId);

    await prisma.$executeRawUnsafe(
      `UPDATE "address" SET ${sets.join(", ")} WHERE "id" = $${idx} AND "userId" = $${idx + 1}`,
      ...vals,
    );

    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM "address" WHERE "id" = $1`,
      id,
    );

    try { revalidatePath("/settings/addresses"); } catch {}
    try { revalidatePath("/checkout"); } catch {}

    return { success: true, address: mapRow(rows[0]) };
  } catch (error) {
    console.error("Error updating address:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update address" };
  }
}

export async function deleteAddress(addressId: string, userId: string) {
  try {
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM "address" WHERE "id" = $1 AND "userId" = $2`,
      addressId,
      userId,
    );
    if (!rows[0]) {
      return { success: false, error: "Address not found" };
    }
    await prisma.$executeRawUnsafe(`DELETE FROM "address" WHERE "id" = $1`, addressId);

    try { revalidatePath("/settings/addresses"); } catch {}
    try { revalidatePath("/checkout"); } catch {}

    return { success: true };
  } catch (error) {
    console.error("Error deleting address:", error);
    return { success: false, error: "Failed to delete address" };
  }
}

export async function setDefaultAddress(data: SetDefaultAddressData, userId: string) {
  try {
    const { addressId } = setDefaultAddressSchema.parse(data);

    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM "address" WHERE "id" = $1 AND "userId" = $2`,
      addressId,
      userId,
    );
    if (!rows[0]) {
      return { success: false, error: "Address not found" };
    }

    await prisma.$executeRawUnsafe(
      `UPDATE "address" SET "isDefault" = false WHERE "userId" = $1`,
      userId,
    );
    await prisma.$executeRawUnsafe(
      `UPDATE "address" SET "isDefault" = true WHERE "id" = $1`,
      addressId,
    );

    const updated: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM "address" WHERE "id" = $1`,
      addressId,
    );

    try { revalidatePath("/settings/addresses"); } catch {}
    try { revalidatePath("/checkout"); } catch {}

    return { success: true, address: mapRow(updated[0]) };
  } catch (error) {
    console.error("Error setting default address:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to set default address" };
  }
}

export async function getDefaultAddress(userId: string) {
  try {
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM "address" WHERE "userId" = $1 AND "isDefault" = true LIMIT 1`,
      userId,
    );
    return { success: true, address: rows[0] ? mapRow(rows[0]) : null };
  } catch (error) {
    console.error("Error fetching default address:", error);
    return { success: false, error: "Failed to fetch default address" };
  }
}
