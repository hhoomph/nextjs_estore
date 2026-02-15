#!/usr/bin/env node

/**
 * Staging Environment Verification Script
 *
 * Verifies critical functionality before production deployment
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

const https = require("https");
const http = require("http");

const STAGING_URL =
  process.env.STAGING_URL || "https://your-staging-domain.com";
const TIMEOUT = 30000; // 30 seconds

class StagingVerifier {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, ""); // Remove trailing slash
    this.results = {
      passed: [],
      failed: [],
      warnings: [],
    };
  }

  log(message, type = "info") {
    const timestamp = new Date().toISOString();
    const colors = {
      info: "\x1b[36m",
      success: "\x1b[32m",
      error: "\x1b[31m",
      warning: "\x1b[33m",
      reset: "\x1b[0m",
    };
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}${path}`;
      const protocol = url.startsWith("https") ? https : http;

      const req = protocol.get(url, { timeout: TIMEOUT, ...options }, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const jsonData = data ? JSON.parse(data) : null;
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: jsonData,
              rawData: data,
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: null,
              rawData: data,
            });
          }
        });
      });

      req.on("error", reject);
      req.on("timeout", () => {
        req.destroy();
        reject(new Error(`Request timeout for ${url}`));
      });
    });
  }

  async checkHomepage() {
    try {
      this.log("Checking homepage...");
      const response = await this.makeRequest("/");

      if (response.status === 200) {
        this.results.passed.push("Homepage loads successfully");
        this.log("✓ Homepage loads successfully", "success");
      } else {
        this.results.failed.push(`Homepage returned status ${response.status}`);
        this.log(`✗ Homepage returned status ${response.status}`, "error");
      }
    } catch (error) {
      this.results.failed.push(`Homepage check failed: ${error.message}`);
      this.log(`✗ Homepage check failed: ${error.message}`, "error");
    }
  }

  async checkPersianLocale() {
    try {
      this.log("Checking Persian locale...");
      const response = await this.makeRequest("/fa");

      if (response.status === 200) {
        // Check for Persian content indicators
        const hasPersianLang =
          response.headers["content-language"] === "fa" ||
          response.rawData.includes('lang="fa"') ||
          response.rawData.includes('dir="rtl"');

        if (hasPersianLang) {
          this.results.passed.push(
            "Persian locale loads with correct attributes",
          );
          this.log("✓ Persian locale loads with correct attributes", "success");
        } else {
          this.results.warnings.push(
            "Persian locale loads but RTL attributes not detected",
          );
          this.log(
            "⚠ Persian locale loads but RTL attributes not detected",
            "warning",
          );
        }
      } else {
        this.results.failed.push(
          `Persian locale returned status ${response.status}`,
        );
        this.log(
          `✗ Persian locale returned status ${response.status}`,
          "error",
        );
      }
    } catch (error) {
      this.results.failed.push(`Persian locale check failed: ${error.message}`);
      this.log(`✗ Persian locale check failed: ${error.message}`, "error");
    }
  }

  async checkEnglishLocale() {
    try {
      this.log("Checking English locale...");
      const response = await this.makeRequest("/en");

      if (response.status === 200) {
        const hasEnglishLang =
          response.headers["content-language"] === "en" ||
          response.rawData.includes('lang="en"') ||
          response.rawData.includes('dir="ltr"');

        if (hasEnglishLang) {
          this.results.passed.push(
            "English locale loads with correct attributes",
          );
          this.log("✓ English locale loads with correct attributes", "success");
        } else {
          this.results.warnings.push(
            "English locale loads but LTR attributes not detected",
          );
          this.log(
            "⚠ English locale loads but LTR attributes not detected",
            "warning",
          );
        }
      } else {
        this.results.failed.push(
          `English locale returned status ${response.status}`,
        );
        this.log(
          `✗ English locale returned status ${response.status}`,
          "error",
        );
      }
    } catch (error) {
      this.results.failed.push(`English locale check failed: ${error.message}`);
      this.log(`✗ English locale check failed: ${error.message}`, "error");
    }
  }

  async checkApiHealth() {
    try {
      this.log("Checking API health...");
      const response = await this.makeRequest("/api/health");

      if (response.status === 200) {
        this.results.passed.push("API health endpoint responds correctly");
        this.log("✓ API health endpoint responds correctly", "success");
      } else {
        this.results.failed.push(
          `API health returned status ${response.status}`,
        );
        this.log(`✗ API health returned status ${response.status}`, "error");
      }
    } catch (error) {
      this.results.failed.push(`API health check failed: ${error.message}`);
      this.log(`✗ API health check failed: ${error.message}`, "error");
    }
  }

  async checkDatabaseConnection() {
    try {
      this.log("Checking database connectivity...");
      const response = await this.makeRequest("/api/products?page=1&limit=1");

      if (response.status === 200 && response.data) {
        this.results.passed.push("Database connection working");
        this.log("✓ Database connection working", "success");
      } else {
        this.results.failed.push("Database connection issue detected");
        this.log("✗ Database connection issue detected", "error");
      }
    } catch (error) {
      this.results.failed.push(`Database check failed: ${error.message}`);
      this.log(`✗ Database check failed: ${error.message}`, "error");
    }
  }

  async checkStaticAssets() {
    const assets = ["/favicon.ico", "/globals.css"];

    for (const asset of assets) {
      try {
        this.log(`Checking static asset: ${asset}`);
        const response = await this.makeRequest(asset);

        if (response.status === 200) {
          this.results.passed.push(`Static asset ${asset} loads correctly`);
          this.log(`✓ Static asset ${asset} loads correctly`, "success");
        } else {
          this.results.warnings.push(
            `Static asset ${asset} returned status ${response.status}`,
          );
          this.log(
            `⚠ Static asset ${asset} returned status ${response.status}`,
            "warning",
          );
        }
      } catch (error) {
        this.results.warnings.push(
          `Static asset ${asset} check failed: ${error.message}`,
        );
        this.log(
          `⚠ Static asset ${asset} check failed: ${error.message}`,
          "warning",
        );
      }
    }
  }

  async checkSecurityHeaders() {
    try {
      this.log("Checking security headers...");
      const response = await this.makeRequest("/");

      const securityHeaders = [
        "x-content-type-options",
        "x-frame-options",
        "x-xss-protection",
        "referrer-policy",
      ];

      let securityScore = 0;
      for (const header of securityHeaders) {
        if (response.headers[header]) {
          securityScore++;
        }
      }

      if (securityScore >= 2) {
        this.results.passed.push("Security headers properly configured");
        this.log("✓ Security headers properly configured", "success");
      } else {
        this.results.warnings.push("Some security headers missing");
        this.log("⚠ Some security headers missing", "warning");
      }
    } catch (error) {
      this.results.warnings.push(
        `Security headers check failed: ${error.message}`,
      );
      this.log(`⚠ Security headers check failed: ${error.message}`, "warning");
    }
  }

  async run() {
    this.log(`Starting staging verification for ${this.baseUrl}`, "info");
    this.log("=".repeat(60), "info");

    // Run all checks
    await Promise.all([
      this.checkHomepage(),
      this.checkPersianLocale(),
      this.checkEnglishLocale(),
      this.checkApiHealth(),
      this.checkDatabaseConnection(),
      this.checkStaticAssets(),
      this.checkSecurityHeaders(),
    ]);

    // Report results
    this.log("=".repeat(60), "info");
    this.log("VERIFICATION RESULTS", "info");
    this.log("=".repeat(60), "info");

    if (this.results.passed.length > 0) {
      this.log(`✅ PASSED (${this.results.passed.length}):`, "success");
      this.results.passed.forEach((item) => this.log(`  ✓ ${item}`, "success"));
    }

    if (this.results.warnings.length > 0) {
      this.log(`⚠️ WARNINGS (${this.results.warnings.length}):`, "warning");
      this.results.warnings.forEach((item) =>
        this.log(`  ⚠ ${item}`, "warning"),
      );
    }

    if (this.results.failed.length > 0) {
      this.log(`❌ FAILED (${this.results.failed.length}):`, "error");
      this.results.failed.forEach((item) => this.log(`  ✗ ${item}`, "error"));
    }

    this.log("=".repeat(60), "info");

    // Final verdict
    const totalChecks =
      this.results.passed.length +
      this.results.failed.length +
      this.results.warnings.length;
    const passRate =
      ((this.results.passed.length + this.results.warnings.length) /
        totalChecks) *
      100;

    if (this.results.failed.length === 0 && passRate >= 80) {
      this.log(
        `🎉 STAGING VERIFICATION PASSED (${passRate.toFixed(1)}%)`,
        "success",
      );
      process.exit(0);
    } else {
      this.log(
        `💥 STAGING VERIFICATION FAILED (${passRate.toFixed(1)}%)`,
        "error",
      );
      this.log(
        "Please address the failed checks before deploying to production.",
        "error",
      );
      process.exit(1);
    }
  }
}

// Run verification if called directly
if (require.main === module) {
  const verifier = new StagingVerifier(STAGING_URL);
  verifier.run().catch((error) => {
    console.error("Verification script failed:", error);
    process.exit(1);
  });
}

module.exports = StagingVerifier;
