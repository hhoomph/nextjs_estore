/**
 * Test script to verify navbar route exclusions work correctly
 */

// Test cases with expected results
const testCases = [
  {
    path: "/en",
    expected: false,
    description: "Home page - should show navbar",
  },
  {
    path: "/en/products",
    expected: false,
    description: "Products page - should show navbar",
  },
  {
    path: "/en/categories",
    expected: false,
    description: "Categories page - should show navbar",
  },
  {
    path: "/en/auth/signin",
    expected: true,
    description: "Auth signin - should exclude navbar",
  },
  {
    path: "/en/auth/signup",
    expected: true,
    description: "Auth signup - should exclude navbar",
  },
  {
    path: "/en/admin",
    expected: true,
    description: "Admin page - should exclude navbar",
  },
  {
    path: "/en/admin/analytics",
    expected: true,
    description: "Admin analytics - should exclude navbar",
  },
  {
    path: "/en/admin/users",
    expected: true,
    description: "Admin users - should exclude navbar",
  },
  {
    path: "/api/auth/signin",
    expected: true,
    description: "API auth - should exclude navbar",
  },
  {
    path: "/api/products",
    expected: true,
    description: "API routes - should exclude navbar",
  },
  {
    path: "/health",
    expected: true,
    description: "Health check - should exclude navbar",
  },
  {
    path: "/favicon.ico",
    expected: true,
    description: "Static files - should exclude navbar",
  },
];

// Same EXCLUDED_ROUTES from ConditionalNavbar component
const EXCLUDED_ROUTES = [
  /^\/[^/]+\/admin/, // Matches /en/admin, /fa/admin, etc.
  /^\/admin/, // Matches /admin (without locale prefix)
  /^\/[^/]+\/auth/, // Matches /en/auth, /fa/auth, etc.
  /^\/auth/, // Matches /auth (without locale prefix)
  /^\/api/, // API routes
  /\.(ico|png|jpg|jpeg|gif|svg|css|js|json|xml|txt|pdf)$/, // Static files
  /^\/health/, // Health check endpoints
];

function shouldExcludeNavbar(pathname: string): boolean {
  for (const route of EXCLUDED_ROUTES) {
    if (route.test(pathname)) {
      return true;
    }
  }
  return false;
}

console.log("🧪 Testing navbar route exclusions...\n");

let passedTests = 0;
const totalTests = testCases.length;

for (const testCase of testCases) {
  const result = shouldExcludeNavbar(testCase.path);
  const passed = result === testCase.expected;
  const status = passed ? "✅ PASS" : "❌ FAIL";

  if (passed) passedTests++;

  console.log(`${status} ${testCase.path}`);
  console.log(`    ${testCase.description}`);
  console.log(
    `    Expected: ${testCase.expected ? "excluded" : "shown"}, Got: ${result ? "excluded" : "shown"}`,
  );
  console.log("");
}

console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
  console.log("🎉 All navbar exclusion tests passed!");
} else {
  console.log("⚠️  Some tests failed. Please review the regex patterns.");
}
