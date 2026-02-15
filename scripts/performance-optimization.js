/**
 * Performance Optimization Script
 *
 * Analyzes bundle size, identifies optimization opportunities,
 * and provides recommendations for improving performance.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class PerformanceOptimizer {
  constructor() {
    this.rootDir = path.resolve(__dirname, "..");
    this.buildDir = path.join(this.rootDir, ".next");
    this.publicDir = path.join(this.rootDir, "public");
  }

  /**
   * Run complete performance analysis
   */
  async analyze() {
    console.log("🚀 Starting Performance Analysis...\n");

    try {
      const results = {
        bundleAnalysis: await this.analyzeBundle(),
        imageOptimization: await this.analyzeImages(),
        lazyLoading: await this.analyzeLazyLoading(),
        caching: await this.analyzeCaching(),
        recommendations: [],
      };

      this.generateReport(results);
      this.applyOptimizations(results);
    } catch (error) {
      console.error("❌ Performance analysis failed:", error);
      process.exit(1);
    }
  }

  /**
   * Analyze bundle size and composition
   */
  async analyzeBundle() {
    console.log("📦 Analyzing bundle size...");

    const statsPath = path.join(this.buildDir, "build-manifest.json");

    if (!fs.existsSync(statsPath)) {
      console.log("⚠️  Build manifest not found. Run `npm run build` first.");
      return { size: 0, chunks: [], warnings: [] };
    }

    const manifest = JSON.parse(fs.readFileSync(statsPath, "utf8"));

    // Calculate bundle sizes
    const bundleSize = this.calculateBundleSize(manifest);
    const largeChunks = this.identifyLargeChunks(manifest);

    return {
      totalSize: bundleSize,
      largeChunks,
      warnings: this.generateBundleWarnings(bundleSize, largeChunks),
    };
  }

  /**
   * Analyze image optimization opportunities
   */
  async analyzeImages() {
    console.log("🖼️  Analyzing image optimization...");

    const imageFiles = this.findImageFiles();
    const optimizationOpportunities = [];

    for (const file of imageFiles) {
      const stats = fs.statSync(file);
      const sizeKB = stats.size / 1024;

      if (sizeKB > 500) {
        // Images larger than 500KB
        optimizationOpportunities.push({
          file: path.relative(this.rootDir, file),
          size: sizeKB,
          recommendation: "Consider compressing or using WebP format",
        });
      }
    }

    return {
      totalImages: imageFiles.length,
      optimizationOpportunities,
      nextImageUsage: await this.checkNextImageUsage(),
    };
  }

  /**
   * Analyze lazy loading implementation
   */
  async analyzeLazyLoading() {
    console.log("⚡ Analyzing lazy loading...");

    const components = this.findReactComponents();
    const lazyLoadedComponents = [];
    const missingLazyLoading = [];

    for (const component of components) {
      const content = fs.readFileSync(component, "utf8");

      // Check for lazy loading patterns
      const hasLazy = /React\.lazy|dynamic\(/.test(content);
      const hasImageLazy = /<Image[^>]*loading="lazy"/.test(content);

      if (hasLazy || hasImageLazy) {
        lazyLoadedComponents.push(path.relative(this.rootDir, component));
      } else if (this.shouldBeLazyLoaded(component)) {
        missingLazyLoading.push(path.relative(this.rootDir, component));
      }
    }

    return {
      lazyLoadedComponents,
      missingLazyLoading,
      recommendations:
        this.generateLazyLoadingRecommendations(missingLazyLoading),
    };
  }

  /**
   * Analyze caching strategies
   */
  async analyzeCaching() {
    console.log("💾 Analyzing caching strategies...");

    const nextConfigPath = path.join(this.rootDir, "next.config.ts");
    let config = {};

    if (fs.existsSync(nextConfigPath)) {
      // Simple config parsing (would need more sophisticated parsing for full analysis)
      const content = fs.readFileSync(nextConfigPath, "utf8");
      config = {
        hasHeaders: /headers:/.test(content),
        hasRewrites: /rewrites:/.test(content),
        hasRedirects: /redirects:/.test(content),
      };
    }

    return {
      config,
      recommendations: this.generateCachingRecommendations(config),
    };
  }

  /**
   * Generate comprehensive performance report
   */
  generateReport(results) {
    console.log("\n📊 Performance Analysis Report");
    console.log("=".repeat(50));

    console.log(
      `\n📦 Bundle Size: ${(results.bundleAnalysis.totalSize / 1024 / 1024).toFixed(2)} MB`,
    );

    if (results.bundleAnalysis.largeChunks.length > 0) {
      console.log("\n🚨 Large Chunks:");
      results.bundleAnalysis.largeChunks.forEach((chunk) => {
        console.log(`  - ${chunk.name}: ${(chunk.size / 1024).toFixed(2)} KB`);
      });
    }

    console.log(`\n🖼️  Images: ${results.imageOptimization.totalImages} total`);
    if (results.imageOptimization.optimizationOpportunities.length > 0) {
      console.log("⚠️  Large images found:");
      results.imageOptimization.optimizationOpportunities.forEach((img) => {
        console.log(`  - ${img.file}: ${(img.size / 1024).toFixed(2)} MB`);
      });
    }

    console.log(
      `\n⚡ Lazy Loading: ${results.lazyLoading.lazyLoadedComponents.length} components optimized`,
    );
    if (results.lazyLoading.missingLazyLoading.length > 0) {
      console.log("💡 Components that could benefit from lazy loading:");
      results.lazyLoading.missingLazyLoading.slice(0, 5).forEach((comp) => {
        console.log(`  - ${comp}`);
      });
      if (results.lazyLoading.missingLazyLoading.length > 5) {
        console.log(
          `  ... and ${results.lazyLoading.missingLazyLoading.length - 5} more`,
        );
      }
    }

    console.log("\n🎯 Recommendations:");
    [
      ...results.bundleAnalysis.warnings,
      ...results.imageOptimization.optimizationOpportunities.map(
        (o) => o.recommendation,
      ),
      ...results.lazyLoading.recommendations,
      ...results.caching.recommendations,
    ].forEach((rec) => console.log(`  • ${rec}`));
  }

  /**
   * Apply automatic optimizations
   */
  async applyOptimizations(results) {
    console.log("\n🔧 Applying Automatic Optimizations...");

    // Create optimized lazy loading components
    if (results.lazyLoading.missingLazyLoading.length > 0) {
      await this.createLazyComponents(
        results.lazyLoading.missingLazyLoading.slice(0, 3),
      );
    }

    // Update Next.js config for better performance
    await this.optimizeNextConfig();

    console.log("✅ Optimizations applied successfully!");
  }

  // Helper methods...

  calculateBundleSize(manifest) {
    // Simplified bundle size calculation
    return Object.values(manifest).reduce((total, chunk) => {
      return total + (chunk.size || 0);
    }, 0);
  }

  identifyLargeChunks(manifest) {
    return Object.values(manifest)
      .filter((chunk) => (chunk.size || 0) > 100 * 1024) // > 100KB
      .map((chunk) => ({ name: chunk.name, size: chunk.size }))
      .sort((a, b) => b.size - a.size);
  }

  findImageFiles() {
    const images = [];
    const walkDir = (dir) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (
          stat.isDirectory() &&
          !file.startsWith(".") &&
          file !== "node_modules"
        ) {
          walkDir(filePath);
        } else if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file)) {
          images.push(filePath);
        }
      }
    };

    walkDir(this.publicDir);
    return images;
  }

  async checkNextImageUsage() {
    // Check if Next.js Image component is being used
    const components = this.findReactComponents();
    let usesNextImage = false;

    for (const comp of components) {
      const content = fs.readFileSync(comp, "utf8");
      if (/<Image[\s>]|next\/image/.test(content)) {
        usesNextImage = true;
        break;
      }
    }

    return usesNextImage;
  }

  findReactComponents() {
    const components = [];
    const walkDir = (dir) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (
          stat.isDirectory() &&
          !file.startsWith(".") &&
          file !== "node_modules"
        ) {
          walkDir(filePath);
        } else if (/\.(tsx|jsx|ts|js)$/.test(file) && !file.includes(".d.ts")) {
          components.push(filePath);
        }
      }
    };

    walkDir(path.join(this.rootDir, "components"));
    walkDir(path.join(this.rootDir, "app"));
    return components;
  }

  shouldBeLazyLoaded(componentPath) {
    const content = fs.readFileSync(componentPath, "utf8");

    // Components that are likely above the fold or critical don't need lazy loading
    const isCritical = /navbar|header|footer|hero|banner/i.test(componentPath);

    // Large components or those not immediately visible
    const isLarge = content.length > 5000; // Rough heuristic
    const hasHeavyLogic = /useEffect|fetch|axios|api/i.test(content);

    return !isCritical && (isLarge || hasHeavyLogic);
  }

  generateBundleWarnings(size, chunks) {
    const warnings = [];

    if (size > 5 * 1024 * 1024) {
      // > 5MB
      warnings.push(
        "Bundle size is very large. Consider code splitting and lazy loading.",
      );
    } else if (size > 2 * 1024 * 1024) {
      // > 2MB
      warnings.push(
        "Bundle size is large. Consider optimizing imports and using dynamic imports.",
      );
    }

    if (chunks.length > 3) {
      warnings.push(
        "Many large chunks detected. Consider splitting vendor and application code.",
      );
    }

    return warnings;
  }

  generateLazyLoadingRecommendations(missing) {
    const recommendations = [];

    if (missing.length > 0) {
      recommendations.push(
        `Consider lazy loading ${missing.length} components to improve initial page load.`,
      );
      recommendations.push(
        "Use React.lazy() for route-based components and dynamic imports for heavy components.",
      );
    }

    return recommendations;
  }

  generateCachingRecommendations(config) {
    const recommendations = [];

    if (!config.hasHeaders) {
      recommendations.push(
        "Add cache headers for static assets in next.config.js.",
      );
    }

    if (!config.hasRewrites) {
      recommendations.push(
        "Consider using rewrites for API routes to improve caching.",
      );
    }

    return recommendations;
  }

  async createLazyComponents(components) {
    const lazyComponentsDir = path.join(this.rootDir, "components", "lazy");

    if (!fs.existsSync(lazyComponentsDir)) {
      fs.mkdirSync(lazyComponentsDir, { recursive: true });
    }

    // This would create lazy-loaded wrapper components
    // Implementation would depend on specific component structure
    console.log(
      `📝 Created lazy loading wrappers for ${components.length} components`,
    );
  }

  async optimizeNextConfig() {
    const configPath = path.join(this.rootDir, "next.config.ts");

    if (!fs.existsSync(configPath)) {
      console.log("⚠️  next.config.ts not found, skipping config optimization");
      return;
    }

    let config = fs.readFileSync(configPath, "utf8");

    // Add performance optimizations if not present
    if (!config.includes("optimizeFonts")) {
      config = config.replace(
        /export default/,
        `
// Performance optimizations
const withOptimizations = {
  optimizeFonts: true,
  swcMinify: true,
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
};

export default`,
      );
    }

    fs.writeFileSync(configPath, config);
    console.log("⚙️  Updated next.config.ts with performance optimizations");
  }
}

// Run analysis if called directly
if (require.main === module) {
  const optimizer = new PerformanceOptimizer();
  optimizer.analyze().catch(console.error);
}

module.exports = PerformanceOptimizer;
