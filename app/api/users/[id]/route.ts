import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/database";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id || session.user.id !== id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT id, name, email, image, role, bio, "preferredLanguage", "preferredTheme", "emailOrders", "emailPromotions", "emailNewsletter", "pushOrders", "pushPromotions", "createdAt" FROM "user" WHERE id = $1`,
    id,
  );
  const user = rows[0];
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({ user });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id || session.user.id !== id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const sets: string[] = [];
    const vals: any[] = [];
    let idx = 1;
    const add = (col: string, val: any) => {
      sets.push(`"${col}" = $${idx++}`);
      vals.push(val);
    };

    if (typeof body.name === "string") add("name", body.name);
    if (typeof body.email === "string") {
      const existing: any[] = await prisma.$queryRawUnsafe(
        `SELECT id FROM "user" WHERE email = $1 AND id <> $2`,
        body.email,
        id,
      );
      if (existing.length > 0) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 });
      }
      add("email", body.email);
    }
    if (typeof body.bio === "string") add("bio", body.bio);
    if (typeof body.image === "string") add("image", body.image);
    if (typeof body.preferredLanguage === "string") add("preferredLanguage", body.preferredLanguage);
    if (typeof body.preferredTheme === "string") add("preferredTheme", body.preferredTheme);
    for (const k of ["emailOrders", "emailPromotions", "emailNewsletter", "pushOrders", "pushPromotions"]) {
      if (typeof body[k] === "boolean") add(k, body[k]);
    }
    sets.push(`"updatedAt" = NOW()`);
    vals.push(id);
    if (sets.length === 1) {
      // only updatedAt
    }
    await prisma.$executeRawUnsafe(
      `UPDATE "user" SET ${sets.join(", ")} WHERE id = $${idx}`,
      ...vals,
    );

    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, name, email, image, role, bio, "preferredLanguage", "preferredTheme", "emailOrders", "emailPromotions", "emailNewsletter", "pushOrders", "pushPromotions" FROM "user" WHERE id = $1`,
      id,
    );
    return NextResponse.json({ success: true, user: rows[0] });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id || session.user.id !== id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ message: "Account deletion not implemented" }, { status: 501 });
}
