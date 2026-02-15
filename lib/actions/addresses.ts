/**
 * Module for addresses
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/database";
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

export async function getUserAddresses(userId: string) {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: userId },
      orderBy: [
        { isDefault: "desc" }, // Default addresses first
        { id: "desc" }, // Then by creation order
      ],
    });
    return { success: true, addresses };
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return { success: false, error: "Failed to fetch addresses" };
  }
}

export async function createAddress(userId: string, data: AddressFormData) {
  try {
    // Validate input data
    const validatedData = addressSchema.parse(data);

    // If this is set as default, unset other defaults
    if (validatedData.is_default) {
      await prisma.address.updateMany({
        where: { userId: userId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        ...validatedData,
        userId: userId,
      },
    });

    revalidatePath("/settings/addresses");
    revalidatePath("/checkout");

    return { success: true, address };
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

    // If this is set as default, unset other defaults
    if (updateData.is_default) {
      await prisma.address.updateMany({
        where: {
          userId: userId,
          id: { not: id },
        },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/settings/addresses");
    revalidatePath("/checkout");

    return { success: true, address };
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
    // Check if address exists and belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: userId,
      },
    });

    if (!address) {
      return { success: false, error: "Address not found" };
    }

    await prisma.address.delete({
      where: { id: addressId },
    });

    revalidatePath("/settings/addresses");
    revalidatePath("/checkout");

    return { success: true };
  } catch (error) {
    console.error("Error deleting address:", error);
    return { success: false, error: "Failed to delete address" };
  }
}

export async function setDefaultAddress(
  data: SetDefaultAddressData,
  userId: string,
) {
  try {
    const { addressId } = setDefaultAddressSchema.parse(data);

    // Check if address exists and belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: userId,
      },
    });

    if (!address) {
      return { success: false, error: "Address not found" };
    }

    // Unset all defaults for this user
    await prisma.address.updateMany({
      where: { userId: userId },
      data: { isDefault: false },
    });

    // Set the new default
    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });

    revalidatePath("/settings/addresses");
    revalidatePath("/checkout");

    return { success: true, address: updatedAddress };
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
    const address = await prisma.address.findFirst({
      where: {
        userId: userId,
        isDefault: true,
      },
    });
    return { success: true, address };
  } catch (error) {
    console.error("Error fetching default address:", error);
    return { success: false, error: "Failed to fetch default address" };
  }
}
