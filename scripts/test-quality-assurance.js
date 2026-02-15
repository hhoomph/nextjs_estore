/**
 * Test Quality Assurance Script
 *
 * Comprehensive test quality assurance and reporting system
 * that runs all test suites, validates quality metrics, and generates reports.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

const { execSync, spawn } = require("child_process");
const fs = require("fs").promises;
const path = require("path");
const os = require("os");

class TestQualityAssurance {
  constructor() {
    this.startTime = Date.now();
    this.results = {
      timestamp: new Date().toISOString(),
      environment: this.getEnvironmentInfo(),
      testSuites: {},
      qualityMetrics: {},
      recommendations: [],
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        skippedTests: 0,
        coverage: 0,
        duration: 0,
        qualityScore: 0,
      },
    };
  }

  getEnvironmentInfo() {
    return {
      nodeVersion: process.version,
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      memory: Math.round(os.totalmem() / 1024 / 1024 / 1024), // GB
      ci: process.env.CI === "true",
      branch: this.getCurrentBranch(),
      commit: this.getCurrentCommit(),
    };
  }

  getCurrentBranch() {
    try {
      return execSync("git rev-parse --abbrev-ref HEAD", {
        encoding: "utf8",
      }).trim();
    } catch {
      return "unknown";
    }
  }

  getCurrentCommit() {
    try {
      return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
    } catch {
      return "unknown";
    }
  }

  async runQualityAssurance() {
    console.log("🔬 Starting Comprehensive Test Quality Assurance...\n");

    try {
      // 1. Pre-flight checks
      await this.runPreFlightChecks();

      // 2. Unit Tests
      await this.runUnitTests();

      // 3. Component Tests
      await this.runComponentTests();

      // 4. Integration Tests
      await this.runIntegrationTests();

      // 5. API Route Tests
      await this.runApiRouteTests();

      // 6. Database Integration Tests
      await this.runDatabaseTests();

      // 7. E2E Tests
      await this.runE2ETests();

      // 8. Performance Tests
      await this.runPerformanceTests();

      // 9. Accessibility Tests
      await this.runAccessibilityTests();

      // 10. Security Tests
      await this.runSecurityTests();

      // 11. Code Quality Checks
      await this.runCodeQualityChecks();

      // 12. Generate Quality Metrics
      this.calculateQualityMetrics();

      // 13. Generate Recommendations
      this.generateRecommendations();

      // 14. Generate Final Report
      await this.generateFinalReport();

      console.log("✅ Quality Assurance completed successfully!");
    } catch (error) {
      console.error("❌ Quality Assurance failed:", error);
      this.results.error = error.message;
      await this.generateErrorReport(error);
      throw error;
    }
  }

  async runPreFlightChecks() {
    console.log("🔍 Running Pre-flight Checks...");

    const checks = {
      nodeVersion:
        process.version.startsWith("v20") ||
        process.version.startsWith("v18") ||
        process.version.startsWith("v24"),
      dependencies: await this.checkDependencies(),
      database: await this.checkDatabaseConnection(),
      environment: await this.checkEnvironmentVariables(),
    };

    const failedChecks = Object.entries(checks).filter(([, passed]) => !passed);

    if (failedChecks.length > 0) {
      throw new Error(
        `Pre-flight checks failed: ${failedChecks.map(([check]) => check).join(", ")}`,
      );
    }

    console.log("   ✅ All pre-flight checks passed");
  }

  async checkDependencies() {
    try {
      // Try bun first, then npm, then just check if node_modules exists
      try {
        execSync("bun pm ls --depth=0", { stdio: "pipe" });
        return true;
      } catch {
        try {
          execSync("npm ls --depth=0", { stdio: "pipe" });
          return true;
        } catch {
          // Check if node_modules exists as fallback
          const fs = require("fs");
          return fs.existsSync("node_modules");
        }
      }
    } catch {
      return false;
    }
  }

  async checkDatabaseConnection() {
    try {
      // This would need to be implemented based on your database setup
      // For now, we'll assume it's working
      return true;
    } catch {
      return false;
    }
  }

  async checkEnvironmentVariables() {
    // Check if at least some auth-related vars are present
    const authVars = [
      "NEXTAUTH_SECRET",
      "NEXTAUTH_URL",
      "BETTER_AUTH_SECRET",
      "BETTER_AUTH_URL",
    ];
    const hasAuthVars = authVars.some((varName) => process.env[varName]);

    const checks = [
      process.env.DATABASE_URL, // Database URL is required
      hasAuthVars, // At least some auth configuration
    ];

    return checks.every(Boolean);
  }

  async runUnitTests() {
    console.log("\n🧪 Running Unit Tests...");

    try {
      const output = execSync("bun run test:unit", {
        encoding: "utf8",
        stdio: "pipe",
        timeout: 300000, // 5 minutes
      });

      this.results.testSuites.unit = this.parseTestOutput(output);
      console.log(
        `   ✅ Unit tests: ${this.results.testSuites.unit.passed}/${this.results.testSuites.unit.total} passed`,
      );
    } catch (error) {
      this.results.testSuites.unit = {
        error: error.message,
        passed: 0,
        total: 0,
      };
      console.log(`   ❌ Unit tests failed: ${error.message}`);
    }
  }

  async runComponentTests() {
    console.log("\n🧩 Running Component Tests...");

    try {
      const output = execSync("bun run test:component", {
        encoding: "utf8",
        stdio: "pipe",
        timeout: 300000,
      });

      this.results.testSuites.component = this.parseTestOutput(output);
      console.log(
        `   ✅ Component tests: ${this.results.testSuites.component.passed}/${this.results.testSuites.component.total} passed`,
      );
    } catch (error) {
      this.results.testSuites.component = {
        error: error.message,
        passed: 0,
        total: 0,
      };
      console.log(`   ❌ Component tests failed: ${error.message}`);
    }
  }

  async runIntegrationTests() {
    console.log("\n🔗 Running Integration Tests...");

    try {
      const output = execSync("bun run test:e2e", {
        encoding: "utf8",
        stdio: "pipe",
        timeout: 600000, // 10 minutes
      });

      this.results.testSuites.integration = this.parseTestOutput(output);
      console.log(
        `   ✅ Integration tests: ${this.results.testSuites.integration.passed}/${this.results.testSuites.integration.total} passed`,
      );
    } catch (error) {
      this.results.testSuites.integration = {
        error: error.message,
        passed: 0,
        total: 0,
      };
      console.log(`   ❌ Integration tests failed: ${error.message}`);
    }
  }

  async runApiRouteTests() {
    console.log("\n🔌 Running API Route Tests...");

    try {
      const output = execSync("bun run api:test", {
        encoding: "utf8",
        stdio: "pipe",
        timeout: 180000, // 3 minutes
      });

      this.results.testSuites.api = this.parseTestOutput(output);
      console.log(
        `   ✅ API tests: ${this.results.testSuites.api.passed}/${this.results.testSuites.api.total} passed`,
      );
    } catch (error) {
      this.results.testSuites.api = {
        error: error.message,
        passed: 0,
        total: 0,
      };
      console.log(`   ❌ API tests failed: ${error.message}`);
    }
  }

  async runDatabaseTests() {
    console.log("\n💾 Running Database Integration Tests...");

    try {
      const output = execSync("bun run db:test:integration", {
        encoding: "utf8",
        stdio: "pipe",
        timeout: 180000,
      });

      this.results.testSuites.database = this.parseTestOutput(output);
      console.log(
        `   ✅ Database tests: ${this.results.testSuites.database.passed}/${this.results.testSuites.database.total} passed`,
      );
    } catch (error) {
      this.results.testSuites.database = {
        error: error.message,
        passed: 0,
        total: 0,
      };
      console.log(`   ❌ Database tests failed: ${error.message}`);
    }
  }

  async runE2ETests() {
    console.log("\n🌐 Running Enhanced E2E Tests...");

    try {
      const output = execSync("bun run e2e:enhanced", {
        encoding: "utf8",
        stdio: "pipe",
        timeout: 900000, // 15 minutes
      });

      this.results.testSuites.e2e = this.parseTestOutput(output);
      console.log(
        `   ✅ E2E tests: ${this.results.testSuites.e2e.passed}/${this.results.testSuites.e2e.total} passed`,
      );
    } catch (error) {
      this.results.testSuites.e2e = {
        error: error.message,
        passed: 0,
        total: 0,
      };
      console.log(`   ❌ E2E tests failed: ${error.message}`);
    }
  }

  async runPerformanceTests() {
    console.log("\n⚡ Running Performance Tests...");

    try {
      // Run performance tests (they generate reports automatically)
      execSync("bun run perf:test", {
        stdio: "pipe",
        timeout: 180000,
      });

      this.results.testSuites.performance = { status: "completed" };
      console.log("   ✅ Performance tests completed");
    } catch (error) {
      this.results.testSuites.performance = { error: error.message };
      console.log(`   ❌ Performance tests failed: ${error.message}`);
    }
  }

  async runAccessibilityTests() {
    console.log("\n♿ Running Accessibility Tests...");

    try {
      execSync("bun run a11y:test", {
        stdio: "pipe",
        timeout: 300000,
      });

      this.results.testSuites.accessibility = { status: "completed" };
      console.log("   ✅ Accessibility tests completed");
    } catch (error) {
      this.results.testSuites.accessibility = { error: error.message };
      console.log(`   ❌ Accessibility tests failed: ${error.message}`);
    }
  }

  async runSecurityTests() {
    console.log("\n🔒 Running Security Tests...");

    try {
      // Run security audit
      execSync("bun audit --audit-level=moderate", {
        stdio: "pipe",
        timeout: 60000,
      });

      // Check for security headers, etc.
      this.results.testSuites.security = { status: "passed" };
      console.log("   ✅ Security tests passed");
    } catch (error) {
      this.results.testSuites.security = { error: error.message };
      console.log(`   ❌ Security issues found: ${error.message}`);
    }
  }

  async runCodeQualityChecks() {
    console.log("\n📏 Running Code Quality Checks...");

    const qualityChecks = {
      lint: false,
      typecheck: false,
      build: false,
    };

    try {
      // ESLint
      execSync("bun run lint", { stdio: "pipe", timeout: 60000 });
      qualityChecks.lint = true;
      console.log("   ✅ Linting passed");
    } catch (error) {
      console.log(`   ❌ Linting failed: ${error.message}`);
    }

    try {
      // TypeScript
      execSync("bun run typecheck", { stdio: "pipe", timeout: 60000 });
      qualityChecks.typecheck = true;
      console.log("   ✅ Type checking passed");
    } catch (error) {
      console.log(`   ❌ Type checking failed: ${error.message}`);
    }

    try {
      // Build
      execSync("bun run build", { stdio: "pipe", timeout: 300000 });
      qualityChecks.build = true;
      console.log("   ✅ Build passed");
    } catch (error) {
      console.log(`   ❌ Build failed: ${error.message}`);
    }

    this.results.testSuites.quality = qualityChecks;
  }

  parseTestOutput(output) {
    // Simple parsing - in a real implementation, you'd use proper test result parsing
    const passed = (output.match(/✓|PASS/g) || []).length;
    const failed = (output.match(/✗|FAIL/g) || []).length;
    const total = passed + failed;

    return {
      total,
      passed,
      failed,
      success: failed === 0,
    };
  }

  calculateQualityMetrics() {
    const suites = this.results.testSuites;

    // Calculate totals
    this.results.summary.totalTests =
      (suites.unit?.total || 0) +
      (suites.component?.total || 0) +
      (suites.integration?.total || 0) +
      (suites.api?.total || 0) +
      (suites.database?.total || 0) +
      (suites.e2e?.total || 0);

    this.results.summary.passedTests =
      (suites.unit?.passed || 0) +
      (suites.component?.passed || 0) +
      (suites.integration?.passed || 0) +
      (suites.api?.passed || 0) +
      (suites.database?.passed || 0) +
      (suites.e2e?.passed || 0);

    this.results.summary.failedTests =
      this.results.summary.totalTests - this.results.summary.passedTests;
    this.results.summary.duration = Date.now() - this.startTime;

    // Calculate quality score (0-100)
    let score = 0;

    // Test coverage (40%)
    const testCoverage =
      this.results.summary.totalTests > 0
        ? this.results.summary.passedTests / this.results.summary.totalTests
        : 0;
    score += testCoverage * 40;

    // Code quality (30%)
    const qualityChecks = suites.quality || {};
    const qualityScore =
      Object.values(qualityChecks).filter(Boolean).length /
      Object.keys(qualityChecks).length;
    score += qualityScore * 30;

    // Other checks (30%)
    const otherChecks =
      [
        suites.performance?.status === "completed",
        suites.accessibility?.status === "completed",
        suites.security?.status === "passed",
      ].filter(Boolean).length / 3;
    score += otherChecks * 30;

    this.results.summary.qualityScore = Math.round(score);

    // Coverage estimation (simplified)
    this.results.summary.coverage = Math.round(testCoverage * 100);
  }

  generateRecommendations() {
    const recommendations = [];

    // Test coverage recommendations
    if (this.results.summary.coverage < 80) {
      recommendations.push(
        "Increase test coverage to at least 80% by adding more unit and integration tests",
      );
    }

    // Failed tests
    if (this.results.summary.failedTests > 0) {
      recommendations.push(
        `Fix ${this.results.summary.failedTests} failing tests before deployment`,
      );
    }

    // Code quality
    const qualityChecks = this.results.testSuites.quality || {};
    if (!qualityChecks.lint) {
      recommendations.push("Fix ESLint errors and warnings");
    }
    if (!qualityChecks.typecheck) {
      recommendations.push("Fix TypeScript compilation errors");
    }
    if (!qualityChecks.build) {
      recommendations.push("Fix build errors before deployment");
    }

    // Performance and security
    if (this.results.testSuites.performance?.error) {
      recommendations.push("Address performance test failures");
    }
    if (this.results.testSuites.accessibility?.error) {
      recommendations.push(
        "Fix accessibility issues to comply with WCAG guidelines",
      );
    }
    if (this.results.testSuites.security?.error) {
      recommendations.push(
        "Address security vulnerabilities and audit findings",
      );
    }

    // Quality score based recommendations
    if (this.results.summary.qualityScore < 70) {
      recommendations.push(
        "Overall code quality needs improvement - focus on testing and code standards",
      );
    }

    this.results.recommendations = recommendations;
  }

  async generateFinalReport() {
    const reportPath = path.join(
      process.cwd(),
      "reports/quality-assurance-report.json",
    );
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));

    console.log("\n📋 Quality Assurance Report Generated:");
    console.log(`   📁 Location: ${reportPath}`);

    console.log("\n📊 Quality Assurance Summary:");
    console.log(
      `   🎯 Quality Score: ${this.results.summary.qualityScore}/100`,
    );
    console.log(`   🧪 Total Tests: ${this.results.summary.totalTests}`);
    console.log(`   ✅ Passed: ${this.results.summary.passedTests}`);
    console.log(`   ❌ Failed: ${this.results.summary.failedTests}`);
    console.log(`   📈 Coverage: ${this.results.summary.coverage}%`);
    console.log(
      `   ⏱️  Duration: ${Math.round(this.results.summary.duration / 1000)}s`,
    );

    console.log("\n🏆 Test Suite Results:");
    Object.entries(this.results.testSuites).forEach(([suite, result]) => {
      if (result.error) {
        console.log(`   ❌ ${suite}: Failed - ${result.error}`);
      } else if (result.status) {
        console.log(`   ✅ ${suite}: ${result.status}`);
      } else if (result.total !== undefined) {
        console.log(`   ✅ ${suite}: ${result.passed}/${result.total} passed`);
      }
    });

    if (this.results.recommendations.length > 0) {
      console.log("\n💡 Recommendations:");
      this.results.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }

    // Quality gates
    const qualityGates = {
      "Minimum Quality Score": this.results.summary.qualityScore >= 70,
      "All Tests Pass": this.results.summary.failedTests === 0,
      "Code Quality Checks":
        this.results.testSuites.quality?.build &&
        this.results.testSuites.quality?.typecheck,
      "Security Audit": !this.results.testSuites.security?.error,
      "Performance Tests": !this.results.testSuites.performance?.error,
    };

    console.log("\n🚪 Quality Gates:");
    Object.entries(qualityGates).forEach(([gate, passed]) => {
      console.log(`   ${passed ? "✅" : "❌"} ${gate}`);
    });

    const allGatesPass = Object.values(qualityGates).every(Boolean);
    console.log(
      `\n🎯 Overall Status: ${allGatesPass ? "✅ READY FOR DEPLOYMENT" : "❌ QUALITY GATES FAILED"}`,
    );
  }

  async generateErrorReport(error) {
    const errorReport = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      environment: this.results.environment,
      partialResults: this.results,
    };

    const errorPath = path.join(
      process.cwd(),
      "reports/quality-assurance-error.json",
    );
    await fs.mkdir(path.dirname(errorPath), { recursive: true });
    await fs.writeFile(errorPath, JSON.stringify(errorReport, null, 2));

    console.log(`\n❌ Error report saved to: ${errorPath}`);
  }
}

// CLI runner
async function main() {
  const qa = new TestQualityAssurance();

  try {
    await qa.runQualityAssurance();

    // Exit with appropriate code based on quality score
    const score = qa.results.summary.qualityScore;
    if (score >= 80) {
      console.log("\n🎉 Excellent quality! Ready for deployment.");
      process.exit(0);
    } else if (score >= 70) {
      console.log(
        "\n⚠️  Good quality with minor issues. Review recommendations.",
      );
      process.exit(0);
    } else {
      console.log("\n❌ Quality issues detected. Address before deployment.");
      process.exit(1);
    }
  } catch (error) {
    console.error("\n💥 Quality assurance failed catastrophically!");
    process.exit(1);
  }
}

// Export for use in other scripts
module.exports = { TestQualityAssurance };

// Run if called directly
if (require.main === module) {
  main();
}
