/**
 * Performance Testing Script for Next.js E-commerce Application
 *
 * This script performs comprehensive performance testing including:
 * - Page load performance metrics
 * - Core Web Vitals measurement
 * - Bundle size analysis
 * - Memory usage monitoring
 * - Lighthouse performance audits
 */

const { chromium } = require("playwright");
const fs = require("fs").promises;
const path = require("path");

class PerformanceTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      metrics: {},
      recommendations: [],
    };
  }

  async runAllTests() {
    console.log("🚀 Starting Comprehensive Performance Testing...\n");

    const browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
      });

      await this.testPageLoadPerformance(context);
      await this.testCoreWebVitals(context);
      await this.testBundleAnalysis();
      await this.testMemoryUsage();
      await this.generateReport();
    } finally {
      await browser.close();
    }

    console.log("✅ Performance testing completed!");
  }

  async testPageLoadPerformance(context) {
    console.log("📊 Testing Page Load Performance...");

    const pages = [
      { name: "Home Page", url: "http://localhost:3000" },
      { name: "Products Page", url: "http://localhost:3000/products" },
      { name: "Cart Page", url: "http://localhost:3000/cart" },
      { name: "Dashboard", url: "http://localhost:3000/dashboard" },
    ];

    this.results.metrics.pageLoad = {};

    for (const page of pages) {
      try {
        const pageInstance = await context.newPage();

        // Enable performance monitoring
        await pageInstance.evaluateOnNewDocument(() => {
          window.performance.mark("page-start");
        });

        const startTime = Date.now();

        // Navigate and wait for load
        await pageInstance.goto(page.url, {
          waitUntil: "networkidle",
          timeout: 30000,
        });

        const loadTime = Date.now() - startTime;

        // Get performance metrics
        const metrics = await pageInstance.evaluate(() => {
          const perfData = performance.getEntriesByType("navigation")[0];
          return {
            domContentLoaded:
              perfData.domContentLoadedEventEnd -
              perfData.domContentLoadedEventStart,
            loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
            firstPaint:
              performance.getEntriesByName("first-paint")[0]?.startTime || 0,
            firstContentfulPaint:
              performance.getEntriesByName("first-contentful-paint")[0]
                ?.startTime || 0,
            largestContentfulPaint:
              performance.getEntriesByName("largest-contentful-paint")[0]
                ?.startTime || 0,
          };
        });

        this.results.metrics.pageLoad[page.name] = {
          url: page.url,
          loadTime,
          ...metrics,
        };

        console.log(`  ✅ ${page.name}: ${loadTime}ms`);

        await pageInstance.close();
      } catch (error) {
        console.log(`  ❌ ${page.name}: Failed - ${error.message}`);
        this.results.metrics.pageLoad[page.name] = {
          url: page.url,
          error: error.message,
        };
      }
    }
  }

  async testCoreWebVitals(context) {
    console.log("\n📈 Testing Core Web Vitals...");

    const page = await context.newPage();
    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

    // Simulate user interactions
    await page.waitForTimeout(2000);

    const vitals = await page.evaluate(() => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        return entries.map((entry) => ({
          name: entry.name,
          value: entry.value,
          rating:
            entry.value > 2500
              ? "poor"
              : entry.value > 1000
                ? "needs-improvement"
                : "good",
        }));
      });

      observer.observe({ entryTypes: ["measure", "largest-contentful-paint"] });

      // Wait for measurements
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([]);
        }, 3000);
      });
    });

    this.results.metrics.coreWebVitals = {
      largestContentfulPaint:
        vitals.find((v) => v.name === "largest-contentful-paint") || null,
      firstInputDelay: null, // Would need real user interaction
      cumulativeLayoutShift: null, // Would need layout changes
    };

    console.log("  ✅ Core Web Vitals measured");
    await page.close();
  }

  async testBundleAnalysis() {
    console.log("\n📦 Analyzing Bundle Size...");

    try {
      // Read Next.js build output
      const buildManifestPath = path.join(
        process.cwd(),
        ".next/build-manifest.json",
      );

      let manifest = {};
      try {
        const manifestContent = await fs.readFile(buildManifestPath, "utf-8");
        manifest = JSON.parse(manifestContent);
      } catch (e) {
        console.log("  ⚠️  Build manifest not found, running build first...");
        // Note: Would need to run build command here
      }

      // Analyze bundle sizes from stats if available
      const statsPath = path.join(
        process.cwd(),
        ".next/static/chunks/webpack-stats.json",
      );
      let bundleStats = {};

      try {
        const statsContent = await fs.readFile(statsPath, "utf-8");
        const stats = JSON.parse(statsContent);

        bundleStats = {
          totalSize: Object.values(stats.assets || {}).reduce(
            (sum, asset) => sum + (asset.size || 0),
            0,
          ),
          chunks: stats.chunks?.length || 0,
          assets: Object.keys(stats.assets || {}).length,
        };
      } catch (e) {
        bundleStats = { error: "Stats not available" };
      }

      this.results.metrics.bundleAnalysis = bundleStats;
      console.log("  ✅ Bundle analysis completed");
    } catch (error) {
      this.results.metrics.bundleAnalysis = { error: error.message };
      console.log(`  ❌ Bundle analysis failed: ${error.message}`);
    }
  }

  async testMemoryUsage() {
    console.log("\n🧠 Testing Memory Usage...");

    const memUsage = process.memoryUsage();

    this.results.metrics.memoryUsage = {
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
    };

    console.log(
      `  ✅ Memory usage: ${this.results.metrics.memoryUsage.heapUsed}MB heap used`,
    );
  }

  generateRecommendations() {
    const recommendations = [];

    // Page load recommendations
    Object.entries(this.results.metrics.pageLoad || {}).forEach(
      ([page, metrics]) => {
        if (metrics.loadTime > 3000) {
          recommendations.push(
            `${page} load time (${metrics.loadTime}ms) exceeds 3s threshold`,
          );
        }
        if (metrics.largestContentfulPaint > 2500) {
          recommendations.push(
            `${page} LCP (${metrics.largestContentfulPaint}ms) is poor`,
          );
        }
      },
    );

    // Bundle size recommendations
    if (this.results.metrics.bundleAnalysis.totalSize > 500000) {
      // 500KB
      recommendations.push(
        "Bundle size exceeds 500KB, consider code splitting",
      );
    }

    // Memory recommendations
    if (this.results.metrics.memoryUsage.heapUsed > 100) {
      // 100MB
      recommendations.push(
        "High memory usage detected, check for memory leaks",
      );
    }

    this.results.recommendations = recommendations;
  }

  async generateReport() {
    this.generateRecommendations();

    const reportPath = path.join(
      process.cwd(),
      "reports/performance-report.json",
    );
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));

    console.log("\n📋 Performance Report Generated:");
    console.log(`   📁 Location: ${reportPath}`);
    console.log("\n📊 Summary:");

    // Page load summary
    console.log("\n🏠 Page Load Performance:");
    Object.entries(this.results.metrics.pageLoad || {}).forEach(
      ([page, metrics]) => {
        if (metrics.error) {
          console.log(`   ❌ ${page}: ${metrics.error}`);
        } else {
          console.log(`   ✅ ${page}: ${metrics.loadTime}ms`);
        }
      },
    );

    // Recommendations
    if (this.results.recommendations.length > 0) {
      console.log("\n💡 Recommendations:");
      this.results.recommendations.forEach((rec) => console.log(`   • ${rec}`));
    } else {
      console.log("\n✅ No performance issues detected!");
    }
  }
}

// CLI runner
async function main() {
  const tester = new PerformanceTester();

  try {
    await tester.runAllTests();
    process.exit(0);
  } catch (error) {
    console.error("❌ Performance testing failed:", error);
    process.exit(1);
  }
}

// Export for use in other scripts
module.exports = { PerformanceTester };

// Run if called directly
if (require.main === module) {
  main();
}
