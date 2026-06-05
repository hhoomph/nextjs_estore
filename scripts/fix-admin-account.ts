import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function fixAdminAccount() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: "admin@example.com" },
    });
    if (!user) {
      console.log("❌ User not found");
      process.exit(1);
    }
    console.log("✅ Found user:", user.email, "role:", user.role);

    const existingAccount = await prisma.account.findFirst({
      where: { userId: user.id, providerId: "credential" },
    });
    if (existingAccount) {
      console.log("✅ Account already exists");
      await prisma.$disconnect();
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash("admin123456", 12);

    const account = await prisma.account.create({
      data: {
        userId: user.id,
        accountId: user.email,
        providerId: "credential",
        password: passwordHash,
      },
    });

    console.log("✅ Account created:", {
      id: account.id,
      providerId: account.providerId,
    });
    console.log("   Email: admin@example.com");
    console.log("   Password: admin123456");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminAccount();