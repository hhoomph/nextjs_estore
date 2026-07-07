/**
 * Script to create smoke test users via Better Auth API.
 * Run while dev server is active on localhost:3000
 */
import "dotenv/config";
import { hashPassword } from "../node_modules/better-auth/node_modules/@better-auth/utils/dist/password.node.mjs";

const BASE = "http://localhost:3000";
const HEADERS = { "Content-Type": "application/json" };

async function main() {
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const { PrismaClient } = await import("../app/generated/prisma/client");
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  try {
    // 1. Create customer user
    console.log("🔐 Creating customer smoke test user...");
    const customerRes = await fetch(`${BASE}/api/auth/sign-up/email`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        email: "test@example.com",
        password: "password",
        name: "Smoke Customer",
      }),
    });
    const customerBody = await customerRes.json();

    if (customerRes.ok) {
      console.log("  ✅ Customer user created successfully");
    } else {
      console.log("  ℹ️  Customer user status:", customerBody.message || customerBody.code);
    }

    const customer = await prisma.user.findUnique({
      where: { email: "test@example.com" },
      include: { accounts: true },
    });

    if (customer) {
      await prisma.account.updateMany({
        where: { userId: customer.id, providerId: "credential" },
        data: { password: await hashPassword("password") },
      });
      console.log("  ✅ Customer password hash reset");
    }

    // 2. Create admin user
    console.log("\n👑 Creating admin smoke test user...");
    const adminRes = await fetch(`${BASE}/api/auth/sign-up/email`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        email: "admin@example.com",
        password: "admin123456",
        name: "Admin User",
      }),
    });
    const adminBody = await adminRes.json();

    const adminId = adminBody.user?.id ?? null;
    if (adminRes.ok) {
      console.log("  ✅ Admin user created successfully");
    } else {
      console.log("  ℹ️  Admin user status:", adminBody.message || adminBody.code);
    }

    // 3. Set admin role if the admin user exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@example.com" },
    });

    if (existingAdmin || adminId) {
      console.log("\n⚙️  Setting admin role...");
      await prisma.user.update({
        where: { id: existingAdmin?.id ?? adminId! },
        data: { role: "ADMIN" },
      });
      console.log("  ✅ Admin role set");
    }

    // 4. Verify logins
    for (const { label, email, password } of [
      { label: "customer", email: "test@example.com", password: "password" },
      { label: "admin", email: "admin@example.com", password: "admin123456" },
    ]) {
      console.log(`\n🔍 Verifying ${label} login...`);
      const res = await fetch(`${BASE}/api/auth/sign-in/email`, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        console.log(`  ✅ ${label} login works!`);
      } else {
        const err = await res.json().catch(() => ({}));
        console.log(`  ❌ ${label} login failed:`, err);
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);


