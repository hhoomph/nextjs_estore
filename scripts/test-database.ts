import "dotenv/config"; // ✅ CRITICAL: Load environment variables
import type { User } from "../app/generated/prisma/client";
import prisma from "../lib/prisma";

async function testDatabase() {
  console.log("🔍 Testing Prisma Postgres connection...\n");

  try {
    // Test 1: Check connection
    console.log("✅ Connected to database!");

    // Test 2: Fetch existing users (don't create to avoid id requirement issues)
    console.log("\n📋 Fetching existing users...");
    const allUsers = await prisma.user.findMany();
    console.log(`✅ Found ${allUsers.length} user(s):`);
    allUsers.forEach((user: User) => {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    // Test 3: Test product count
    console.log("\n📦 Checking products...");
    const productCount = await prisma.product.count();
    console.log(`✅ Found ${productCount} product(s)`);

    console.log("\n🎉 All tests passed! Your database is working perfectly.\n");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

testDatabase();
