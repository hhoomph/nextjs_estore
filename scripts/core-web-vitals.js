/**
 * Core Web Vitals Monitoring Script
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import chromeLauncher from "chrome-launcher";
import fs from "fs";
import lighthouse from "lighthouse";
import path from "path";
import puppeteer from "puppeteer";

class CoreWebVitalsMonitor {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      tests: [],
    };

    // Core Web Vitals thresholds
    this.thresholds = {
      "First Contentful Paint": { good: 1800, needsImprovement: 3000 }, // ms
      "Largest Contentful Paint": { good: 2500, needsImprovement: 4000 }, // ms
      "First Input Delay": { good: 100, needsImprovement: 300 }, // ms
      "Cumulative Layout Shift": { good: 0.1, needsImprovement: 0.25 }, // unitless
      "Speed Index": { good: 3400, needsImprovement: 5800 }, // ms
      "Time to Interactive": { good: 3800, needsImprovement: 7300 }, // ms
    };
  }

  async measureCoreWebVitals(url, options = {}) {
    console.log(`Measuring Core Web Vitals for: ${url}`);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });

    const page = await browser.newPage();

    try {
      // Set up performance monitoring
      const performanceMetrics = {};

      // Monitor Core Web Vitals
      await page.evaluateOnNewDocument(() => {
        // FCP (First Contentful Paint)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            window.__fcp = entries[0].startTime;
          }
        }).observe({ entryTypes: ["paint"] });

        // LCP (Largest Contentful Paint)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          window.__lcp = lastEntry.startTime;
        }).observe({ entryTypes: ["largest-contentful-paint"] });

        // FID (First Input Delay)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            window.__fid = entries[0].processingStart - entries[0].startTime;
          }
        }).observe({ entryTypes: ["first-input"] });

        // CLS (Cumulative Layout Shift)
        let clsValue = 0;
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          window.__cls = clsValue;
        }).observe({ entryTypes: ["layout-shift"] });
      });

      // Navigate to page
      await page.goto(url, {
        waitUntil: "networkidle0",
        timeout: 60000,
      });

      // Wait for page to stabilize
      await page.waitForTimeout(3000);

      // Simulate user interactions to measure FID
      await page.mouse.move(100, 100);
      await page.mouse.down();
      await page.mouse.up();
      await page.waitForTimeout(1000);

      // Collect metrics
      const metrics = await page.evaluate(() => {
        return {
          fcp: window.__fcp || null,
          lcp: window.__lcp || null,
          fid: window.__fid || null,
          cls: window.__cls || 0,
          // Additional metrics
          domContentLoaded:
            performance.timing.domContentLoadedEventEnd -
            performance.timing.navigationStart,
          loadComplete:
            performance.timing.loadEventEnd -
            performance.timing.navigationStart,
          firstPaint:
            performance.getEntriesByType("paint")[0]?.startTime || null,
        };
      });

      await browser.close();

      return this.processMetrics(url, metrics);
    } catch (error) {
      await browser.close();
      throw error;
    }
  }

  async measureWithLighthouse(url, options = {}) {
    console.log(`Measuring with Lighthouse for: ${url}`);

    const chrome = await chromeLauncher.launch({
      chromeFlags: ["--headless", "--no-sandbox", "--disable-dev-shm-usage"],
    });

    try {
      const runnerResult = await lighthouse(url, {
        logLevel: "error",
        output: "json",
        port: chrome.port,
        onlyCategories: ["performance"],
        ...options,
      });

      const audits = runnerResult.lhr.audits;

      return {
        url,
        method: "lighthouse",
        metrics: {
          "First Contentful Paint": audits["first-contentful-paint"],
          "Largest Contentful Paint": audits["largest-contentful-paint"],
          "First Input Delay": audits["max-potential-fid"],
          "Cumulative Layout Shift": audits["cumulative-layout-shift"],
          "Speed Index": audits["speed-index"],
          "Time to Interactive": audits["interactive"],
        },
        score: runnerResult.lhr.categories.performance.score,
      };
    } finally {
      await chrome.kill();
    }
  }

  processMetrics(url, rawMetrics) {
    const processedMetrics = {};

    // Process each metric
    Object.entries(this.thresholds).forEach(([metric, thresholds]) => {
      const key = metric.toLowerCase().replace(/\s+/g, "-");
      const value = rawMetrics[key];

      if (value !== null && value !== undefined) {
        const rating = this.getRating(metric, value);

        processedMetrics[metric] = {
          value: Math.round(value * 100) / 100,
          rating,
          thresholds,
          passed: rating === "good",
        };
      } else {
        processedMetrics[metric] = {
          value: null,
          rating: "unknown",
          thresholds,
          passed: false,
        };
      }
    });

    return {
      url,
      method: "direct-measurement",
      metrics: processedMetrics,
      score: this.calculateOverallScore(processedMetrics),
      timestamp: new Date().toISOString(),
    };
  }

  getRating(metric, value) {
    const thresholds = this.thresholds[metric];
    if (!thresholds) return "unknown";

    if (metric === "Cumulative Layout Shift") {
      // Lower is better for CLS
      if (value <= thresholds.good) return "good";
      if (value <= thresholds.needsImprovement) return "needs-improvement";
      return "poor";
    } else {
      // Higher is worse for other metrics (time-based)
      if (value <= thresholds.good) return "good";
      if (value <= thresholds.needsImprovement) return "needs-improvement";
      return "poor";
    }
  }

  calculateOverallScore(metrics) {
    const validMetrics = Object.values(metrics).filter((m) => m.value !== null);
    if (validMetrics.length === 0) return 0;

    const weights = {
      "First Contentful Paint": 0.15,
      "Largest Contentful Paint": 0.25,
      "First Input Delay": 0.15,
      "Cumulative Layout Shift": 0.25,
      "Speed Index": 0.1,
      "Time to Interactive": 0.1,
    };

    let weightedScore = 0;
    let totalWeight = 0;

    validMetrics.forEach((metric) => {
      const metricName = Object.keys(metrics).find(
        (key) => metrics[key] === metric,
      );
      const weight = weights[metricName] || 0;

      let score;
      switch (metric.rating) {
        case "good":
          score = 1;
          break;
        case "needs-improvement":
          score = 0.5;
          break;
        case "poor":
          score = 0;
          break;
        default:
          score = 0;
      }

      weightedScore += score * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? weightedScore / totalWeight : 0;
  }

  async runMonitoring(urls, options = {}) {
    console.log("📊 Starting Core Web Vitals Monitoring...\n");

    const { method = "both", runs = 3 } = options;

    for (const url of urls) {
      console.log(`\n📈 Monitoring: ${url}`);
      console.log("=".repeat(60));

      const urlResults = [];

      try {
        // Run multiple times for statistical significance
        for (let run = 1; run <= runs; run++) {
          console.log(`Run ${run}/${runs}...`);

          if (method === "direct" || method === "both") {
            const directResult = await this.measureCoreWebVitals(url);
            urlResults.push({ ...directResult, run, method: "direct" });
          }

          if (method === "lighthouse" || method === "both") {
            const lighthouseResult = await this.measureWithLighthouse(url);
            urlResults.push({ ...lighthouseResult, run, method: "lighthouse" });
          }
        }

        // Aggregate results
        const aggregatedResult = this.aggregateResults(url, urlResults);
        this.results.tests.push(aggregatedResult);

        // Log results
        this.logResults(url, aggregatedResult);
      } catch (error) {
        console.error(`❌ Error monitoring ${url}:`, error.message);
        this.results.tests.push({
          url,
          method: "error",
          error: error.message,
          passed: false,
        });
      }
    }

    this.generateReport();
  }

  aggregateResults(url, results) {
    const aggregated = {
      url,
      runs: results.length,
      methods: [...new Set(results.map((r) => r.method))],
      metrics: {},
      scores: [],
      averageScore: 0,
      passed: false,
    };

    // Aggregate metrics across runs
    results.forEach((result) => {
      if (result.score !== undefined) {
        aggregated.scores.push(result.score);
      }

      if (result.metrics) {
        Object.entries(result.metrics).forEach(([metricName, metricData]) => {
          if (!aggregated.metrics[metricName]) {
            aggregated.metrics[metricName] = {
              values: [],
              ratings: [],
              averageValue: 0,
              averageRating: "unknown",
              passed: false,
            };
          }

          if (metricData.value !== null) {
            aggregated.metrics[metricName].values.push(metricData.value);
            aggregated.metrics[metricName].ratings.push(
              metricData.rating || "unknown",
            );
          }
        });
      }
    });

    // Calculate averages
    Object.keys(aggregated.metrics).forEach((metricName) => {
      const metric = aggregated.metrics[metricName];
      if (metric.values.length > 0) {
        metric.averageValue =
          metric.values.reduce((sum, val) => sum + val, 0) /
          metric.values.length;

        // Most common rating
        const ratingCounts = {};
        metric.ratings.forEach((rating) => {
          ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
        });
        metric.averageRating = Object.keys(ratingCounts).reduce((a, b) =>
          ratingCounts[a] > ratingCounts[b] ? a : b,
        );

        metric.passed = metric.averageRating === "good";
      }
    });

    if (aggregated.scores.length > 0) {
      aggregated.averageScore =
        aggregated.scores.reduce((sum, score) => sum + score, 0) /
        aggregated.scores.length;
      aggregated.passed = aggregated.averageScore >= 0.8;
    }

    return aggregated;
  }

  logResults(url, result) {
    console.log(`\n📊 Results for ${url}:`);
    console.log(
      `   Average Score: ${(result.averageScore * 100).toFixed(1)}% ${result.passed ? "✅" : "❌"}`,
    );
    console.log(`   Runs: ${result.runs}`);
    console.log(`   Methods: ${result.methods.join(", ")}`);

    console.log("\n   Core Web Vitals:");
    Object.entries(result.metrics).forEach(([metricName, metric]) => {
      if (metric.averageValue !== undefined) {
        const unit = metricName.includes("Shift") ? "" : "ms";
        console.log(
          `     ${metricName}: ${metric.averageValue.toFixed(1)}${unit} (${metric.averageRating}) ${metric.passed ? "✅" : "❌"}`,
        );
      }
    });
  }

  generateReport() {
    const reportDir = path.join(process.cwd(), "reports", "core-web-vitals");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const reportPath = path.join(
      reportDir,
      `core-web-vitals-report-${timestamp}.json`,
    );

    // Ensure directory exists
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    // Calculate summary
    const summary = {
      totalTests: this.results.tests.length,
      passedTests: this.results.tests.filter((t) => t.passed).length,
      failedTests: this.results.tests.filter((t) => !t.passed).length,
      overallScore: this.calculateOverallScore(),
      recommendations: this.generateRecommendations(),
    };

    const finalReport = {
      ...this.results,
      summary,
    };

    fs.writeFileSync(reportPath, JSON.stringify(finalReport, null, 2));

    console.log("\n📋 Core Web Vitals Monitoring Summary:");
    console.log("=".repeat(60));
    console.log(`Total Tests: ${summary.totalTests}`);
    console.log(`Passed: ${summary.passedTests} ✅`);
    console.log(`Failed: ${summary.failedTests} ❌`);
    console.log(`Overall Score: ${(summary.overallScore * 100).toFixed(1)}%`);

    if (summary.recommendations.length > 0) {
      console.log("\n💡 Recommendations:");
      summary.recommendations.forEach((rec) => console.log(`   • ${rec}`));
    }

    console.log(`\n📄 Detailed report saved to: ${reportPath}`);

    if (summary.failedTests > 0) {
      console.log(
        "\n❌ Some Core Web Vitals tests failed. Please review the detailed report.",
      );
      process.exit(1);
    } else {
      console.log("\n✅ All Core Web Vitals tests passed!");
    }
  }

  calculateOverallScore() {
    const scores = this.results.tests
      .filter((t) => t.averageScore !== undefined)
      .map((t) => t.averageScore);

    if (scores.length === 0) return 0;

    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  generateRecommendations() {
    const recommendations = [];
    const failedMetrics = new Set();

    this.results.tests.forEach((test) => {
      if (test.metrics) {
        Object.entries(test.metrics).forEach(([metricName, metric]) => {
          if (!metric.passed) {
            failedMetrics.add(metricName);
          }
        });
      }
    });

    if (
      failedMetrics.has("First Contentful Paint") ||
      failedMetrics.has("Largest Contentful Paint")
    ) {
      recommendations.push(
        "Optimize images and reduce render-blocking resources",
      );
      recommendations.push("Consider using a CDN for static assets");
    }

    if (failedMetrics.has("First Input Delay")) {
      recommendations.push(
        "Reduce JavaScript execution time and improve main thread performance",
      );
      recommendations.push("Implement code splitting and lazy loading");
    }

    if (failedMetrics.has("Cumulative Layout Shift")) {
      recommendations.push("Reserve space for dynamic content and images");
      recommendations.push("Avoid inserting content above existing content");
    }

    if (
      failedMetrics.has("Speed Index") ||
      failedMetrics.has("Time to Interactive")
    ) {
      recommendations.push("Minimize unused JavaScript and CSS");
      recommendations.push(
        "Optimize font loading and consider font-display: swap",
      );
    }

    return recommendations;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(
      "Usage: node scripts/core-web-vitals.js <url1> <url2> ... [--method=direct|lighthouse|both] [--runs=3]",
    );
    console.log("Examples:");
    console.log("  node scripts/core-web-vitals.js http://localhost:3000");
    console.log(
      "  node scripts/core-web-vitals.js http://localhost:3000 --method=lighthouse --runs=5",
    );
    process.exit(1);
  }

  // Parse arguments
  const urls = [];
  const options = { method: "both", runs: 3 };

  args.forEach((arg) => {
    if (arg.startsWith("--method=")) {
      options.method = arg.split("=")[1];
    } else if (arg.startsWith("--runs=")) {
      options.runs = parseInt(arg.split("=")[1]);
    } else {
      urls.push(arg);
    }
  });

  const monitor = new CoreWebVitalsMonitor();
  await monitor.runMonitoring(urls, options);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = CoreWebVitalsMonitor;
