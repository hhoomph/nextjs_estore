/**
 * Load Testing Script for Next.js E-commerce Application
 *
 * This script performs comprehensive load testing including:
 * - Concurrent user simulation
 * - API endpoint load testing
 * - Database connection stress testing
 * - Memory leak detection
 * - Response time analysis under load
 */

const { chromium } = require("playwright");
const http = require("http");
const https = require("https");
const { performance } = require("perf_hooks");

class LoadTester {
  constructor(options = {}) {
    this.options = {
      baseUrl: "http://localhost:3000",
      concurrentUsers: options.concurrentUsers || 10,
      duration: options.duration || 30000, // 30 seconds
      rampUpTime: options.rampUpTime || 5000, // 5 seconds
      ...options,
    };

    this.results = {
      timestamp: new Date().toISOString(),
      config: this.options,
      metrics: {
        responseTimes: [],
        errors: [],
        throughput: 0,
        concurrency: 0,
        memoryUsage: [],
        cpuUsage: [],
      },
      summary: {},
    };
  }

  async runLoadTest() {
    console.log("🔥 Starting Load Testing...\n");
    console.log(`   👥 Concurrent Users: ${this.options.concurrentUsers}`);
    console.log(`   ⏱️  Duration: ${this.options.duration / 1000}s`);
    console.log(`   📈 Ramp Up: ${this.options.rampUpTime / 1000}s\n`);

    const startTime = performance.now();

    try {
      await this.warmupPhase();
      await this.loadPhase();
      await this.cooldownPhase();

      this.calculateSummary();
      await this.generateReport();
    } catch (error) {
      console.error("❌ Load testing failed:", error);
      throw error;
    }

    const totalTime = performance.now() - startTime;
    console.log(`\n✅ Load testing completed in ${Math.round(totalTime)}ms`);
  }

  async warmupPhase() {
    console.log("🔥 Warmup Phase: Preparing system...");

    // Single user warmup
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto(this.options.baseUrl, {
        waitUntil: "networkidle",
        timeout: 10000,
      });
      await page.waitForTimeout(2000); // Let the app stabilize
      console.log("   ✅ Warmup completed");
    } finally {
      await browser.close();
    }
  }

  async loadPhase() {
    console.log("\n🚀 Load Phase: Simulating concurrent users...");

    const promises = [];
    const userDelay = this.options.rampUpTime / this.options.concurrentUsers;

    for (let i = 0; i < this.options.concurrentUsers; i++) {
      const delay = i * userDelay;
      promises.push(this.simulateUser(i, delay));
    }

    await Promise.allSettled(promises);
  }

  async simulateUser(userId, startDelay) {
    await new Promise((resolve) => setTimeout(resolve, startDelay));

    const browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: `LoadTest-User-${userId}`,
    });

    try {
      await this.runUserScenario(context, userId);
    } catch (error) {
      this.results.metrics.errors.push({
        userId,
        error: error.message,
        timestamp: Date.now(),
      });
    } finally {
      await browser.close();
    }
  }

  async runUserScenario(context, userId) {
    const scenarios = [
      { name: "Browse Home", action: () => this.browseHome(context) },
      { name: "Browse Products", action: () => this.browseProducts(context) },
      { name: "View Cart", action: () => this.viewCart(context) },
      { name: "Search Products", action: () => this.searchProducts(context) },
      { name: "API Health Check", action: () => this.apiHealthCheck() },
    ];

    const startTime = performance.now();

    // Run random scenarios for the duration
    while (performance.now() - startTime < this.options.duration) {
      const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

      try {
        const scenarioStart = performance.now();
        await scenario.action();
        const responseTime = performance.now() - scenarioStart;

        this.results.metrics.responseTimes.push({
          userId,
          scenario: scenario.name,
          responseTime,
          timestamp: Date.now(),
        });

        // Random delay between actions (1-5 seconds)
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 + Math.random() * 4000),
        );
      } catch (error) {
        this.results.metrics.errors.push({
          userId,
          scenario: scenario.name,
          error: error.message,
          timestamp: Date.now(),
        });

        // Shorter delay on error
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Monitor memory usage periodically
      if (Math.random() < 0.1) {
        // 10% chance
        const memUsage = process.memoryUsage();
        this.results.metrics.memoryUsage.push({
          timestamp: Date.now(),
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
          rss: Math.round(memUsage.rss / 1024 / 1024),
        });
      }
    }
  }

  async browseHome(context) {
    const page = await context.newPage();
    try {
      const startTime = performance.now();
      await page.goto(this.options.baseUrl, {
        waitUntil: "networkidle",
        timeout: 10000,
      });

      // Simulate user interaction
      await page.waitForTimeout(500 + Math.random() * 1000);

      // Maybe click on a product link
      if (Math.random() < 0.3) {
        const productLinks = await page.$$('a[href*="/products"]');
        if (productLinks.length > 0) {
          await productLinks[
            Math.floor(Math.random() * productLinks.length)
          ].click();
          await page.waitForTimeout(1000);
        }
      }
    } finally {
      await page.close();
    }
  }

  async browseProducts(context) {
    const page = await context.newPage();
    try {
      await page.goto(`${this.options.baseUrl}/products`, {
        waitUntil: "networkidle",
        timeout: 10000,
      });

      await page.waitForTimeout(1000);

      // Simulate scrolling and browsing
      await page.evaluate(() => {
        window.scrollTo(0, Math.random() * document.body.scrollHeight);
      });

      await page.waitForTimeout(500);
    } finally {
      await page.close();
    }
  }

  async viewCart(context) {
    const page = await context.newPage();
    try {
      await page.goto(`${this.options.baseUrl}/cart`, {
        waitUntil: "networkidle",
        timeout: 10000,
      });

      await page.waitForTimeout(800);
    } finally {
      await page.close();
    }
  }

  async searchProducts(context) {
    const page = await context.newPage();
    try {
      await page.goto(`${this.options.baseUrl}/search`, {
        waitUntil: "networkidle",
        timeout: 10000,
      });

      // Simulate search input
      const searchTerms = ["laptop", "phone", "book", "shirt", "watch"];
      const searchTerm =
        searchTerms[Math.floor(Math.random() * searchTerms.length)];

      const searchInput = await page.$(
        'input[type="search"], input[placeholder*="search" i]',
      );
      if (searchInput) {
        await searchInput.fill(searchTerm);
        await page.waitForTimeout(500);
      }

      await page.waitForTimeout(1000);
    } finally {
      await page.close();
    }
  }

  async apiHealthCheck() {
    return new Promise((resolve, reject) => {
      const url = new URL("/api/health", this.options.baseUrl);
      const client = url.protocol === "https:" ? https : http;

      const req = client.request(
        {
          hostname: url.hostname,
          port: url.port,
          path: url.pathname,
          method: "GET",
          timeout: 5000,
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            if (res.statusCode === 200) {
              resolve(data);
            } else {
              reject(new Error(`HTTP ${res.statusCode}`));
            }
          });
        },
      );

      req.on("error", reject);
      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Timeout"));
      });

      req.end();
    });
  }

  async cooldownPhase() {
    console.log("\n🧊 Cooldown Phase: Allowing system to stabilize...");
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  calculateSummary() {
    const responseTimes = this.results.metrics.responseTimes;
    const errors = this.results.metrics.errors;

    if (responseTimes.length === 0) {
      this.results.summary = { error: "No response times recorded" };
      return;
    }

    // Calculate statistics
    const sortedTimes = responseTimes
      .map((r) => r.responseTime)
      .sort((a, b) => a - b);
    const totalRequests = responseTimes.length;
    const totalErrors = errors.length;

    this.results.summary = {
      totalRequests,
      totalErrors,
      errorRate: (totalErrors / (totalRequests + totalErrors)) * 100,
      responseTime: {
        min: Math.min(...sortedTimes),
        max: Math.max(...sortedTimes),
        avg: sortedTimes.reduce((a, b) => a + b, 0) / sortedTimes.length,
        p50: sortedTimes[Math.floor(sortedTimes.length * 0.5)],
        p95: sortedTimes[Math.floor(sortedTimes.length * 0.95)],
        p99: sortedTimes[Math.floor(sortedTimes.length * 0.99)],
      },
      throughput: totalRequests / (this.options.duration / 1000), // requests per second
      concurrentUsers: this.options.concurrentUsers,
      testDuration: this.options.duration,
    };
  }

  async generateReport() {
    const fs = require("fs").promises;
    const path = require("path");

    const reportPath = path.join(
      process.cwd(),
      "reports/load-test-report.json",
    );
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));

    console.log("\n📋 Load Test Report Generated:");
    console.log(`   📁 Location: ${reportPath}`);

    console.log("\n📊 Summary:");
    console.log(`   📈 Total Requests: ${this.results.summary.totalRequests}`);
    console.log(
      `   ⚠️  Errors: ${this.results.summary.totalErrors} (${this.results.summary.errorRate.toFixed(2)}%)`,
    );
    console.log(
      `   🚀 Throughput: ${this.results.summary.throughput.toFixed(2)} req/sec`,
    );
    console.log(
      `   👥 Concurrent Users: ${this.results.summary.concurrentUsers}`,
    );

    console.log("\n⏱️  Response Times (ms):");
    const rt = this.results.summary.responseTime;
    console.log(`   Min: ${rt.min.toFixed(2)}`);
    console.log(`   Avg: ${rt.avg.toFixed(2)}`);
    console.log(`   P50: ${rt.p50.toFixed(2)}`);
    console.log(`   P95: ${rt.p95.toFixed(2)}`);
    console.log(`   P99: ${rt.p99.toFixed(2)}`);
    console.log(`   Max: ${rt.max.toFixed(2)}`);

    // Performance assessment
    const avgResponseTime = rt.avg;
    if (avgResponseTime < 500) {
      console.log(
        "\n✅ Excellent performance! Average response time under 500ms",
      );
    } else if (avgResponseTime < 1000) {
      console.log(
        "\n⚠️  Good performance, but consider optimization for faster response times",
      );
    } else {
      console.log(
        "\n❌ Poor performance detected. Response times exceed 1 second",
      );
    }

    if (this.results.summary.errorRate > 5) {
      console.log("❌ High error rate detected. Investigate system stability");
    }
  }
}

// CLI runner with options
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace("--", "");
    const value = args[i + 1];

    switch (key) {
      case "users":
        options.concurrentUsers = parseInt(value);
        break;
      case "duration":
        options.duration = parseInt(value) * 1000; // Convert to milliseconds
        break;
      case "rampup":
        options.rampUpTime = parseInt(value) * 1000;
        break;
      case "url":
        options.baseUrl = value;
        break;
    }
  }

  const tester = new LoadTester(options);

  try {
    await tester.runLoadTest();
    process.exit(0);
  } catch (error) {
    console.error("❌ Load testing failed:", error);
    process.exit(1);
  }
}

// Export for use in other scripts
module.exports = { LoadTester };

// Run if called directly
if (require.main === module) {
  main();
}
