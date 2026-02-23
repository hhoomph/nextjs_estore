#!/usr/bin/env node

/**
 * Admin User Setup Script
 * Creates or updates admin user in the database
 * Usage: node scripts/setup-admin.js
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function setupAdmin() {
  try {
    console.log("Setting up admin user...");

    // Admin credentials
    const adminEmail = "admin@example.com";
    const adminPassword = "admin123456";
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Check if admin user exists
    let adminUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (adminUser) {
      // Update existing user to be admin
      adminUser = await prisma.user.update({
        where: { email: adminEmail },
        data: {
          role: "ADMIN",
          emailVerified: new Date(),
          password: hashedPassword,
        },
      });
      console.log("Admin user updated:", adminUser.email);
    } else {
      // Create new admin user
      adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          name: "Administrator",
          password: hashedPassword,
          role: "ADMIN",
          emailVerified: new Date(),
          image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Administrator",
          active: true,
        },
      });
      console.log("Admin user created:", adminUser.email);
    }

    console.log("\n✅ Admin Setup Complete!");
    console.log("\nAdmin Credentials:");
    console.log("=================");
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log("\nYou can now sign in at: /admin/signin");

    await prisma.$disconnect();
  } catch (error) {
    console.error("Error setting up admin user:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

setupAdmin();
