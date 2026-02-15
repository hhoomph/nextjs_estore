/**
 * CI/CD Bundle Analysis Script
 *
 * Automated bundle analysis for CI/CD pipelines with alerts and reporting
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// CI/CD Bundle Analysis Configuration
const CI_CONFIG = {
  thresholds: {
    critical: {
      cartSidebar: 60 * 1024, // 60KB critical threshold
      checkoutFlow: 120 * 1024, // 120KB critical threshold
      translations: 20 * 1024, // 20KB critical threshold
      totalCartCheckout: 250 * 1024, // 250KB critical threshold
    },
    warning: {
      cartSidebar: 50 * 1024, // 50KB warning threshold
      checkoutFlow: 100 * 1024, // 100KB warning threshold
      translations: 15 * 1024, // 15KB warning threshold
      totalCartCheckout: 200 * 1024, // 200KB warning threshold
    },
  },
  outputDir: "bundle-analysis",
  ci: {
    maxBuildTime: 10 * 60 * 1000, // 10 minutes
    retryAttempts: 3,
    notificationChannels: ["slack", "github", "email"],
  },
  alerts: {
    enabled: true,
    failureThreshold: 10 * 1024, // Alert if bundle increases by 10KB+
    regressionThreshold: 5, // Alert if score decreases by 5%+
  },
};

class BundleAnalysisCI {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        ci: process.env.CI === "true",
        branch:
          process.env.GITHUB_HEAD_REF || process.env.GIT_BRANCH || "unknown",
        commit: process.env.GITHUB_SHA || this.getGitCommit(),
      },
      analysis: {},
      alerts: [],
      recommendations: [],
      status: "pending",
    };
  }

  async runCIAnalysis() {
    console.log("🚀 Starting CI/CD Bundle Analysis...\n");

    const startTime = Date.now();

    try {
      // Initialize analysis
      await this.initializeAnalysis();

      // Run bundle analysis
      await this.analyzeBundles();

      // Generate comparative analysis
      await this.generateComparativeAnalysis();

      // Check thresholds and generate alerts
      this.checkThresholds();

      // Generate recommendations
      this.generateCIRecommendations();

      // Save results
      await this.saveCIResults();

      // Send notifications if configured
      await this.sendNotifications();

      const duration = Date.now() - startTime;
      this.results.status = this.determineOverallStatus();
      this.results.duration = duration;

      console.log(`\n✅ CI/CD Bundle Analysis completed in ${duration}ms`);
      console.log(`📊 Overall Status: ${this.results.status.toUpperCase()}`);

      return this.results;
    } catch (error) {
      console.error("❌ CI/CD Bundle Analysis failed:", error);
      this.results.status = "failed";
      this.results.error = error.message;

      // Still save results for debugging
      await this.saveCIResults();

      throw error;
    }
  }

  async initializeAnalysis() {
    console.log("📋 Initializing analysis environment...");

    // Create output directory
    if (!fs.existsSync(CI_CONFIG.outputDir)) {
      fs.mkdirSync(CI_CONFIG.outputDir, { recursive: true });
    }

    // Check if this is a CI environment
    if (this.results.environment.ci) {
      console.log("🏗️  Running in CI environment");
      console.log(`📝 Branch: ${this.results.environment.branch}`);
      console.log(`🔗 Commit: ${this.results.environment.commit}`);
    }
  }

  async analyzeBundles() {
    console.log("📦 Analyzing bundle sizes...");

    // Dynamic import to avoid circular dependency issues
    const { BundleAnalyzer } = await import("./analyze-bundle.js");

    // Run the existing bundle analyzer
    const analyzer = new BundleAnalyzer();
    const analysisResults = await analyzer.analyze();

    this.results.analysis = analysisResults;
  }

  async generateComparativeAnalysis() {
    console.log("📊 Generating comparative analysis...");

    const currentResults = this.results.analysis;
    const previousResults = await this.loadPreviousResults();

    if (!previousResults) {
      console.log("ℹ️  No previous results found for comparison");
      return;
    }

    this.results.comparison = {
      previousTimestamp: previousResults.timestamp,
      changes: {},
      regressions: [],
      improvements: [],
    };

    // Compare bundle sizes
    for (const [component, currentData] of Object.entries(currentResults)) {
      if (previousResults[component]) {
        const previousData = previousResults[component];
        const sizeChange = currentData.size - previousData.size;
        const percentChange =
          previousData.size > 0
            ? ((sizeChange / previousData.size) * 100).toFixed(2)
            : 0;

        this.results.comparison.changes[component] = {
          previousSize: previousData.size,
          currentSize: currentData.size,
          sizeChange,
          percentChange: parseFloat(percentChange),
          status:
            sizeChange > 0
              ? "increased"
              : sizeChange < 0
                ? "decreased"
                : "unchanged",
        };

        // Check for regressions
        if (sizeChange > CI_CONFIG.alerts.failureThreshold) {
          this.results.comparison.regressions.push({
            component,
            sizeIncrease: sizeChange,
            percentIncrease: percentChange,
            severity:
              sizeChange > CI_CONFIG.alerts.failureThreshold * 2
                ? "critical"
                : "warning",
          });
        }

        // Check for improvements
        if (sizeChange < -1024) {
          // More than 1KB improvement
          this.results.comparison.improvements.push({
            component,
            sizeDecrease: Math.abs(sizeChange),
            percentDecrease: Math.abs(parseFloat(percentChange)),
          });
        }
      }
    }
  }

  checkThresholds() {
    console.log("⚖️  Checking bundle size thresholds...");

    const alerts = [];
    const currentResults = this.results.analysis;

    for (const [component, data] of Object.entries(currentResults)) {
      const criticalThreshold = CI_CONFIG.thresholds.critical[component];
      const warningThreshold = CI_CONFIG.thresholds.warning[component];

      if (criticalThreshold && data.size > criticalThreshold) {
        alerts.push({
          type: "critical",
          component,
          currentSize: data.size,
          threshold: criticalThreshold,
          excess: data.size - criticalThreshold,
          message: `${component} bundle size (${this.formatBytes(data.size)}) exceeds critical threshold (${this.formatBytes(criticalThreshold)})`,
        });
      } else if (warningThreshold && data.size > warningThreshold) {
        alerts.push({
          type: "warning",
          component,
          currentSize: data.size,
          threshold: warningThreshold,
          excess: data.size - warningThreshold,
          message: `${component} bundle size (${this.formatBytes(data.size)}) exceeds warning threshold (${this.formatBytes(warningThreshold)})`,
        });
      }
    }

    this.results.alerts = alerts;
  }

  generateCIRecommendations() {
    console.log("💡 Generating CI recommendations...");

    const recommendations = [];
    const alerts = this.results.alerts;
    const comparison = this.results.comparison;

    // Alert-based recommendations
    if (alerts.length > 0) {
      recommendations.push({
        type: "urgent",
        priority: "high",
        title: "Bundle Size Optimization Required",
        description: `${alerts.length} bundle(s) exceed size thresholds`,
        actions: [
          "Run bundle analyzer locally: npm run analyze:bundle",
          "Review webpack bundle analyzer output",
          "Consider code splitting for large components",
          "Optimize imports and tree shaking",
        ],
      });
    }

    // Regression-based recommendations
    if (comparison?.regressions?.length > 0) {
      recommendations.push({
        type: "regression",
        priority: "high",
        title: "Bundle Size Regression Detected",
        description: `${comparison.regressions.length} bundle(s) significantly increased in size`,
        actions: [
          "Review recent changes that may have caused size increase",
          "Check for new dependencies or larger imports",
          "Consider lazy loading or dynamic imports",
          "Review if new features are essential for initial bundle",
        ],
      });
    }

    // Performance recommendations
    const totalSize = Object.values(this.results.analysis).reduce(
      (sum, data) => sum + (data.size || 0),
      0,
    );

    if (totalSize > 1024 * 1024) {
      // Over 1MB
      recommendations.push({
        type: "performance",
        priority: "medium",
        title: "Large Bundle Size Detected",
        description: `Total bundle size is ${this.formatBytes(totalSize)}`,
        actions: [
          "Implement code splitting",
          "Use dynamic imports for non-critical features",
          "Optimize images and assets",
          "Consider CDN for static assets",
        ],
      });
    }

    // CI/CD specific recommendations
    if (this.results.environment.ci) {
      recommendations.push({
        type: "ci",
        priority: "low",
        title: "CI/CD Optimization",
        description: "Consider caching strategies for faster builds",
        actions: [
          "Cache node_modules between builds",
          "Use build cache for unchanged dependencies",
          "Consider parallel bundle analysis",
          "Set up automated alerts for size regressions",
        ],
      });
    }

    this.results.recommendations = recommendations;
  }

  async saveCIResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `ci-bundle-analysis-${timestamp}.json`;
    const filepath = path.join(CI_CONFIG.outputDir, filename);

    const reportData = {
      ...this.results,
      summary: {
        totalComponents: Object.keys(this.results.analysis).length,
        totalSize: Object.values(this.results.analysis).reduce(
          (sum, data) => sum + (data.size || 0),
          0,
        ),
        alertsCount: this.results.alerts.length,
        regressionsCount: this.results.comparison?.regressions?.length || 0,
        improvementsCount: this.results.comparison?.improvements?.length || 0,
        status: this.results.status,
        duration: this.results.duration,
      },
    };

    fs.writeFileSync(filepath, JSON.stringify(reportData, null, 2));
    console.log(`📄 CI report saved to: ${filepath}`);

    // Also save as latest for comparisons
    const latestPath = path.join(
      CI_CONFIG.outputDir,
      "latest-bundle-analysis.json",
    );
    fs.writeFileSync(latestPath, JSON.stringify(reportData, null, 2));

    return filepath;
  }

  async sendNotifications() {
    if (!CI_CONFIG.alerts.enabled || this.results.alerts.length === 0) {
      return;
    }

    console.log("📢 Sending notifications...");

    const notificationData = {
      status: this.results.status,
      alerts: this.results.alerts,
      regressions: this.results.comparison?.regressions || [],
      recommendations: this.results.recommendations,
      reportUrl: this.generateReportUrl(),
      environment: this.results.environment,
    };

    // Send to configured channels
    for (const channel of CI_CONFIG.ci.notificationChannels) {
      try {
        await this.sendToChannel(channel, notificationData);
      } catch (error) {
        console.warn(
          `Failed to send notification to ${channel}:`,
          error.message,
        );
      }
    }
  }

  async sendToChannel(channel, data) {
    switch (channel) {
      case "slack":
        await this.sendSlackNotification(data);
        break;
      case "github":
        await this.sendGitHubComment(data);
        break;
      case "email":
        await this.sendEmailNotification(data);
        break;
      default:
        console.log(`Unknown notification channel: ${channel}`);
    }
  }

  async sendSlackNotification(data) {
    // Placeholder - would integrate with Slack API
    console.log("📱 Slack notification would be sent:", {
      status: data.status,
      alerts: data.alerts.length,
      channel: process.env.SLACK_CHANNEL,
    });
  }

  async sendGitHubComment(data) {
    // Placeholder - would use GitHub API to comment on PR
    console.log("🐙 GitHub comment would be posted:", {
      status: data.status,
      alerts: data.alerts.length,
      pr: process.env.GITHUB_PR_NUMBER,
    });
  }

  async sendEmailNotification(data) {
    // Placeholder - would send email notification
    console.log("📧 Email notification would be sent:", {
      status: data.status,
      alerts: data.alerts.length,
      recipients: process.env.ALERT_EMAIL_RECIPIENTS,
    });
  }

  generateReportUrl() {
    // Generate URL to view the detailed report
    if (this.results.environment.ci) {
      // In CI environment, generate artifact URL
      return `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;
    }
    return "./bundle-analysis/";
  }

  async loadPreviousResults() {
    try {
      const latestPath = path.join(
        CI_CONFIG.outputDir,
        "latest-bundle-analysis.json",
      );
      if (fs.existsSync(latestPath)) {
        const data = fs.readFileSync(latestPath, "utf8");
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn("Failed to load previous results:", error.message);
    }
    return null;
  }

  determineOverallStatus() {
    const hasCriticalAlerts = this.results.alerts.some(
      (alert) => alert.type === "critical",
    );
    const hasRegressions =
      (this.results.comparison?.regressions?.length || 0) > 0;

    if (hasCriticalAlerts) {
      return "failed";
    } else if (this.results.alerts.length > 0 || hasRegressions) {
      return "warning";
    } else {
      return "passed";
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / k ** i).toFixed(2)) + " " + sizes[i];
  }

  getGitCommit() {
    try {
      return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
    } catch {
      return "unknown";
    }
  }
}

// CI/CD Integration Functions
function setupGitHubActions() {
  const workflowContent = `
name: Bundle Analysis CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  bundle-analysis:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run bundle analysis
        run: node scripts/bundle-analysis-ci.js

      - name: Upload bundle analysis results
        uses: actions/upload-artifact@v3
        with:
          name: bundle-analysis-report
          path: bundle-analysis/
  `;

  const workflowPath = ".github/workflows/bundle-analysis.yml";
  fs.mkdirSync(path.dirname(workflowPath), { recursive: true });
  fs.writeFileSync(workflowPath, workflowContent);

  console.log("✅ GitHub Actions workflow created:", workflowPath);
}

function setupJenkinsPipeline() {
  const pipelineContent = `
pipeline {
    agent any
    stages {
        stage('Bundle Analysis') {
            steps {
                sh 'npm ci'
                sh 'node scripts/bundle-analysis-ci.js'
            }
            post {
                always {
                    archiveArtifacts artifacts: 'bundle-analysis/**', fingerprint: true
                }
            }
        }
    }
    post {
        failure {
            script {
                // Send failure notifications
                echo 'Bundle analysis failed!'
            }
        }
    }
}
  `;

  const pipelinePath = "Jenkinsfile";
  fs.writeFileSync(pipelinePath, pipelineContent);

  console.log("✅ Jenkins pipeline created:", pipelinePath);
}

function setupGitLabCI() {
  const gitlabCiContent = `
stages:
  - bundle-analysis

bundle_analysis:
  stage: bundle-analysis
  image: node:18
  before_script:
    - npm ci
  script:
    - node scripts/bundle-analysis-ci.js
  artifacts:
    paths:
      - bundle-analysis/
    expire_in: 1 week
  only:
    - merge_requests
    - main
  `;

  const gitlabCiPath = ".gitlab-ci.yml";
  fs.writeFileSync(gitlabCiPath, gitlabCiContent);

  console.log("✅ GitLab CI configuration created:", gitlabCiPath);
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "setup-github":
      setupGitHubActions();
      break;
    case "setup-jenkins":
      setupJenkinsPipeline();
      break;
    case "setup-gitlab":
      setupGitLabCI();
      break;
    case "run":
    default: {
      const analyzer = new BundleAnalysisCI();
      await analyzer.runCIAnalysis();
      break;
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { BundleAnalysisCI };
