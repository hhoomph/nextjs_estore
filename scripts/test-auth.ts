import "dotenv/config";
import { authClient } from "../lib/auth-client";

async function testAuthFlows() {
  console.log("🔐 Testing Authentication Flows...\n");

  try {
    // Test 1: Sign up a new user
    console.log("📝 Testing user sign up...");
    const signUpResult = await authClient.signUp.email({
      email: "testuser@example.com",
      password: "testpassword123",
      name: "Test User",
    });

    if (signUpResult.error) {
      console.log("❌ Sign up failed:", signUpResult.error.message);
    } else {
      console.log("✅ Sign up successful!");
      console.log("   User data:", signUpResult.data?.user);
    }

    // Test 2: Try to sign in with the new user (might fail if email verification is required)
    console.log("\n🔑 Testing sign in...");
    const signInResult = await authClient.signIn.email({
      email: "testuser@example.com",
      password: "testpassword123",
    });

    if (signInResult.error) {
      console.log("❌ Sign in failed:", signInResult.error.message);
      // This might be expected if email verification is required
      if (signInResult.error.message?.includes("verify")) {
        console.log("   (This is expected if email verification is required)");
      }
    } else {
      console.log("✅ Sign in successful!");
      console.log("   User:", signInResult.data?.user);
    }

    // Test 3: Try admin sign in
    console.log("\n👑 Testing admin sign in...");
    const adminSignInResult = await authClient.signIn.email({
      email: "admin2@test.com",
      password: "admin123456",
    });

    if (adminSignInResult.error) {
      console.log("❌ Admin sign in failed:", adminSignInResult.error.message);
    } else {
      console.log("✅ Admin sign in successful!");
      console.log("   Admin user:", adminSignInResult.data?.user);

      // Test dashboard access (admin only)
      console.log("\n🏢 Testing admin dashboard access...");
      try {
        const dashboardResponse = await fetch(
          "http://localhost:3000/dashboard",
          {
            method: "GET",
            headers: {
              Cookie: adminSignInResult.data?.token
                ? `estore.session_token=${adminSignInResult.data.token}`
                : "",
            },
          },
        );
        console.log("   Dashboard access status:", dashboardResponse.status);
        if (dashboardResponse.status === 200) {
          console.log("✅ Admin dashboard access granted!");
        } else {
          console.log("❌ Admin dashboard access denied");
        }
      } catch (error) {
        console.log("   Dashboard access test failed");
      }

      // Test logout
      console.log("\n🚪 Testing logout...");
      const logoutResult = await authClient.signOut();
      if (logoutResult.error) {
        console.log("❌ Logout failed:", logoutResult.error.message);
      } else {
        console.log("✅ Logout successful!");
      }
    }

    // Test 4: Test social login through client API
    console.log("\n🌐 Testing social login through client API...");
    try {
      const githubSignIn = await authClient.signIn.social({
        provider: "github",
        callbackURL: "http://localhost:3000/dashboard",
      });

      if (githubSignIn.error) {
        console.log("   GitHub OAuth:", githubSignIn.error.message);
      } else {
        console.log("   GitHub OAuth: Redirect initiated");
      }
    } catch (error) {
      console.log("   GitHub OAuth: Failed to initiate");
    }

    try {
      const googleSignIn = await authClient.signIn.social({
        provider: "google",
        callbackURL: "http://localhost:3000/dashboard",
      });

      if (googleSignIn.error) {
        console.log("   Google OAuth:", googleSignIn.error.message);
      } else {
        console.log("   Google OAuth: Redirect initiated");
      }
    } catch (error) {
      console.log("   Google OAuth: Failed to initiate");
    }

    console.log("\n🎉 Auth flow testing completed!\n");
  } catch (error) {
    console.error("❌ Unexpected error during auth testing:", error);
    process.exit(1);
  }
}

testAuthFlows();
