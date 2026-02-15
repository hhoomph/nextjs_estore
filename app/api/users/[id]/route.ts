/**
 * Module for route
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { type NextRequest, NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth/config";
import { prisma } from "@/lib/database";

// GET /api/users/[id] - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: request.headers });

    // Users can view their own profile, admins can view any profile
    if (!session || (session.user.id !== id && !isAdmin(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phoneNumber: true,
        role: true,
        active: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        image: true,
        _count: {
          select: {
            orders: true,
            addresses: true,
            cartItems: true,
          },
        },
        addresses: {
          select: {
            id: true,
            addressLine1: true,
            addressLine2: true,
            city: true,
            state: true,
            postalCode: true,
            telephone: true,
            mobile: true,
            location: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

// PUT /api/users/[id] - Update user by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: request.headers });

    // Users can update their own profile, admins can update any profile
    if (!session || (session.user.id !== id && !isAdmin(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      email,
      phone_number,
      username,
      role,
      active,
      image,
      picture,
    } = body;

    // Check if email is being changed and if it's already taken
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          id: { not: id },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email is already taken" },
          { status: 400 },
        );
      }
    }

    // Prepare update data
    const updateData: Partial<{
      name: string;
      email: string;
      phoneNumber: string;
      username: string;
      image: string;
      role: string;
      active: boolean;
      updatedAt: Date;
    }> = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone_number !== undefined) updateData.phoneNumber = phone_number;
    if (username !== undefined) updateData.username = username;
    if (image !== undefined) updateData.image = image;

    // Admin-only fields
    if (isAdmin(session)) {
      if (role !== undefined) updateData.role = role;
      if (active !== undefined) updateData.active = active;
    }

    updateData.updatedAt = new Date();

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phoneNumber: true,
        role: true,
        active: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        image: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}

// DELETE /api/users/[id] - Delete user by ID (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: request.headers });

    // Only admins can delete users
    if (!session || !isAdmin(session)) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 },
      );
    }

    // Prevent admin from deleting themselves
    if (session.user.id === id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 },
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Soft delete by setting active to false instead of hard delete
    await prisma.user.update({
      where: { id },
      data: {
        active: false,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ message: "User deactivated successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
