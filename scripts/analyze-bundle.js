/**
 * Bundle Size Analysis Script
 *
 * Analyzes and optimizes bundle sizes for cart and checkout components.
 * Provides detailed breakdown of bundle composition and optimization recommendations.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// Bundle analysis configuration
const BUNDLE_CONFIG = {
  entryPoints: [
    "components/features/cart/cart-sidebar.tsx",
    "components/features/checkout/guest-checkout-flow.tsx",
    "lib/stores/guest-cart-store.ts",
    "lib/stores/cart-store.ts",
    "lib/validations/cart.ts",
    "lib/i18n/translations.ts",
  ],
  outputDir: "bundle-analysis",
  thresholds: {
    cartSidebar: 50 * 1024, // 50KB
    checkoutFlow: 100 * 1024, // 100KB
    cartStore: 30 * 1024, // 30KB
    validations: 20 * 1024, // 20KB
    translations: 15 * 1024, // 15KB
    totalCartCheckout: 200 * 1024, // 200KB total
  },
};

class BundleAnalyzer {
  constructor() {
    this.results = {};
    this.recommendations = [];
  }

  async analyze() {
    console.log("🔍 Analyzing bundle sizes...\n");

    // Create output directory
    if (!fs.existsSync(BUNDLE_CONFIG.outputDir)) {
      fs.mkdirSync(BUNDLE_CONFIG.outputDir, { recursive: true });
    }

    // Analyze each entry point
    for (const entryPoint of BUNDLE_CONFIG.entryPoints) {
      await this.analyzeEntryPoint(entryPoint);
    }

    // Generate summary report
    this.generateSummaryReport();

    // Provide optimization recommendations
    this.generateOptimizationRecommendations();

    return this.results;
  }

  async analyzeEntryPoint(entryPoint) {
    const name = path.basename(entryPoint, path.extname(entryPoint));
    console.log(`📦 Analyzing ${name}...`);

    try {
      // Use esbuild to analyze bundle size
      const bundleSize = await this.measureBundleSize(entryPoint);

      this.results[name] = {
        file: entryPoint,
        size: bundleSize,
        threshold: BUNDLE_CONFIG.thresholds[name] || 0,
        status:
          bundleSize > (BUNDLE_CONFIG.thresholds[name] || 0)
            ? "OVER_LIMIT"
            : "OK",
        dependencies: await this.analyzeDependencies(entryPoint),
      };

      console.log(`   Size: ${(bundleSize / 1024).toFixed(2)} KB`);
      console.log(`   Status: ${this.results[name].status}\n`);
    } catch (error) {
      console.error(`❌ Failed to analyze ${name}:`, error.message);
      this.results[name] = {
        file: entryPoint,
        error: error.message,
        status: "ERROR",
      };
    }
  }

  async measureBundleSize(entryPoint) {
    // Simple file size measurement for now
    // In production, this would use esbuild or webpack-bundle-analyzer
    const filePath = path.resolve(entryPoint);

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const stats = fs.statSync(filePath);
    return stats.size;
  }

  async analyzeDependencies(entryPoint) {
    // Analyze import statements to understand dependencies
    const content = fs.readFileSync(entryPoint, "utf8");
    const imports = [];

    // Simple regex to find import statements
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];

      // Skip relative imports and node_modules
      if (!importPath.startsWith(".") && !importPath.startsWith("@/")) {
        continue;
      }

      imports.push(importPath);
    }

    return imports;
  }

  generateSummaryReport() {
    console.log("📊 Bundle Analysis Summary\n");
    console.log("=".repeat(50));

    let totalSize = 0;
    let overLimitCount = 0;

    for (const [name, result] of Object.entries(this.results)) {
      if (result.error) {
        console.log(`❌ ${name}: ERROR - ${result.error}`);
        continue;
      }

      const sizeKB = (result.size / 1024).toFixed(2);
      const thresholdKB = (result.threshold / 1024).toFixed(2);
      const status = result.status === "OVER_LIMIT" ? "🚨 OVER LIMIT" : "✅ OK";

      console.log(`${name.padEnd(20)} ${sizeKB.padStart(8)} KB ${status}`);

      if (result.threshold > 0) {
        console.log(`                     Threshold: ${thresholdKB} KB`);
      }

      totalSize += result.size;
      if (result.status === "OVER_LIMIT") {
        overLimitCount++;
      }
    }

    console.log("=".repeat(50));
    console.log(`Total Size: ${(totalSize / 1024).toFixed(2)} KB`);
    console.log(`Over Limit: ${overLimitCount} components\n`);
  }

  generateOptimizationRecommendations() {
    console.log("💡 Optimization Recommendations\n");

    this.recommendations = [];

    // Analyze results and provide recommendations
    for (const [name, result] of Object.entries(this.results)) {
      if (result.error) continue;

      if (result.status === "OVER_LIMIT") {
        this.addRecommendation(
          `Reduce ${name} bundle size`,
          `Current: ${(result.size / 1024).toFixed(2)} KB, Limit: ${(result.threshold / 1024).toFixed(2)} KB`,
          this.getOptimizationStrategies(name, result),
        );
      }

      // Check for heavy dependencies
      if (result.dependencies?.length > 5) {
        this.addRecommendation(
          `Review dependencies in ${name}`,
          `${result.dependencies.length} imports detected`,
          [
            "Consider lazy loading heavy dependencies",
            "Use dynamic imports for optional features",
          ],
        );
      }
    }

    // General recommendations
    this.addGeneralRecommendations();

    // Output recommendations
    this.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.title}`);
      console.log(`   ${rec.description}`);
      rec.strategies.forEach((strategy) => {
        console.log(`   • ${strategy}`);
      });
      console.log("");
    });

    // Save recommendations to file
    this.saveRecommendationsToFile();
  }

  addRecommendation(title, description, strategies) {
    this.recommendations.push({ title, description, strategies });
  }

  getOptimizationStrategies(name, result) {
    const strategies = [];

    switch (name) {
      case "cart-sidebar":
        strategies.push(
          "Implement lazy loading for cart items",
          "Use React.memo for cart item components",
          "Minimize re-renders with useMemo for calculations",
        );
        break;

      case "guest-checkout-flow":
        strategies.push(
          "Split checkout into separate lazy-loaded steps",
          "Implement form field lazy loading",
          "Use dynamic imports for validation logic",
        );
        break;

      case "translations":
        strategies.push(
          "Implement lazy loading for translation chunks",
          "Load only current language translations",
          "Compress translation data",
        );
        break;

      default:
        strategies.push(
          "Implement code splitting",
          "Use dynamic imports",
          "Minimize bundle size with tree shaking",
        );
    }

    return strategies;
  }

  addGeneralRecommendations() {
    this.addRecommendation(
      "Implement Code Splitting",
      "Split cart and checkout code into separate chunks",
      [
        "Use React.lazy() for cart components",
        "Implement route-based code splitting",
        "Load checkout components only when needed",
      ],
    );

    this.addRecommendation(
      "Optimize Bundle Loading",
      "Improve loading performance with better bundling strategies",
      [
        "Preload critical cart resources",
        "Use service worker for caching",
        "Implement progressive loading",
      ],
    );

    this.addRecommendation(
      "Reduce Runtime Dependencies",
      "Minimize the impact of third-party libraries",
      [
        "Audit and remove unused dependencies",
        "Use lighter alternatives where possible",
        "Lazy load non-critical dependencies",
      ],
    );
  }

  saveRecommendationsToFile() {
    const reportPath = path.join(
      BUNDLE_CONFIG.outputDir,
      "bundle-analysis-report.json",
    );

    const report = {
      timestamp: new Date().toISOString(),
      results: this.results,
      recommendations: this.recommendations,
      summary: {
        totalComponents: Object.keys(this.results).length,
        componentsOverLimit: Object.values(this.results).filter(
          (r) => r.status === "OVER_LIMIT",
        ).length,
        totalSize: Object.values(this.results).reduce(
          (sum, r) => sum + (r.size || 0),
          0,
        ),
      },
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}`);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const ciMode = args.includes("--ci") || args.includes("--ci-mode");

  if (ciMode) {
    // Use CI/CD version for automated analysis
    console.log("🔄 Running in CI mode, delegating to CI analyzer...");
    const { BundleAnalysisCI } = await import("./bundle-analysis-ci.js");
    const ciAnalyzer = new BundleAnalysisCI();
    await ciAnalyzer.runCIAnalysis();
    return;
  }

  const analyzer = new BundleAnalyzer();

  try {
    await analyzer.analyze();

    // Exit with appropriate code based on results
    const hasErrors = Object.values(analyzer.results).some((r) => r.error);
    const hasOverLimit = Object.values(analyzer.results).some(
      (r) => r.status === "OVER_LIMIT",
    );

    if (hasErrors) {
      console.log("❌ Bundle analysis completed with errors");
      process.exit(1);
    } else if (hasOverLimit) {
      console.log(
        "⚠️  Bundle analysis completed with components over size limits",
      );
      process.exit(1);
    } else {
      console.log("✅ Bundle analysis completed successfully");
      process.exit(0);
    }
  } catch (error) {
    console.error("❌ Bundle analysis failed:", error.message);
    process.exit(1);
  }
}

// Export for use in other scripts
export { BundleAnalyzer };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
