import "dotenv/config";
import { authClient } from "../lib/auth-client";
import prisma from "../lib/prisma";

async function createAdminUser() {
  console.log("👑 Creating admin user...\n");

  try {
    // Create a working admin user through Better Auth
    console.log("🔐 Creating admin user through Better Auth...");
    const adminSignUpResult = await authClient.signUp.email({
      email: "admin@estore.com",
      password: "admin123456",
      name: "Admin User",
    });

    if (adminSignUpResult.error) {
      if (adminSignUpResult.error.message?.includes("already exists")) {
        console.log("✅ Admin user already exists, updating role...");
        // Find and update existing user
        const existingUser = await prisma.user.findUnique({
          where: { email: "admin@estore.com" },
        });
        if (existingUser) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { role: "ADMIN" },
          });
          console.log("✅ User role updated to ADMIN!");
        }
      } else {
        console.log(
          "❌ Admin sign up failed:",
          adminSignUpResult.error?.message || "Unknown error",
        );
      }
    } else {
      console.log("✅ Admin user created successfully!");
      console.log("   Admin user:", adminSignUpResult.data?.user);

      // Update the user role to ADMIN in the database
      const userId = adminSignUpResult.data?.user?.id;
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { role: "ADMIN" },
        });
        console.log("✅ User role updated to ADMIN!");
      }
    }

    // Test sign in with different possible admin emails
    const adminEmails = [
      "admin@test.com",
      "admin@example.com",
      "admin2@test.com",
    ];

    for (const email of adminEmails) {
      console.log(`\n🔐 Testing sign in for: ${email}`);
      const adminSignInResult = await authClient.signIn.email({
        email: email,
        password: "admin123456",
      });

      if (adminSignInResult.error) {
        console.log(
          `❌ Sign in failed for ${email}:`,
          adminSignInResult.error.message,
        );
      } else {
        console.log(`✅ Sign in successful for ${email}!`);
        console.log("   User:", adminSignInResult.data?.user);
        break; // Stop after first successful login
      }
    }
  } catch (error) {
    console.error("❌ Unexpected error creating admin user:", error);
    process.exit(1);
  }
}

createAdminUser();
