/**
 * Module for advanced-ssr
 *
 * Advanced server-side rendering optimizations for Next.js
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

import React from "react";

// SSR optimization configuration
export interface SSROptimizationConfig {
  enableStreaming: boolean;
  enableSelectiveHydration: boolean;
  enableEdgeRuntime: boolean;
  enableIncrementalCache: boolean;
  enableRequestMemoization: boolean;
  enableDynamicImports: boolean;
  enableImageOptimization: boolean;
  enableFontOptimization: boolean;
  enableCriticalCSS: boolean;
  prerendering: {
    enableStaticGeneration: boolean;
    enableIncrementalStaticGeneration: boolean;
    revalidateInterval: number;
    fallbackStrategy: "blocking" | "static";
  };
  caching: {
    enableSWRCache: boolean;
    enableRedisCache: boolean;
    enableCDNCache: boolean;
    cacheTimeout: number;
  };
}

// SSR performance metrics
export interface SSRPerformanceMetrics {
  timestamp: number;
  route: string;
  renderTime: number;
  hydrationTime?: number;
  dataFetchTime: number;
  cacheHit: boolean;
  bundleSize: number;
  firstByteTime: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  totalBlockingTime?: number;
  recommendations: string[];
}

// Advanced SSR optimizer class
export class AdvancedSSROptimizer {
  private config: SSROptimizationConfig;
  private metrics: SSRPerformanceMetrics[] = [];
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> =
    new Map();

  constructor(config: Partial<SSROptimizationConfig> = {}) {
    this.config = {
      enableStreaming: true,
      enableSelectiveHydration: true,
      enableEdgeRuntime: false,
      enableIncrementalCache: true,
      enableRequestMemoization: true,
      enableDynamicImports: true,
      enableImageOptimization: true,
      enableFontOptimization: true,
      enableCriticalCSS: true,
      prerendering: {
        enableStaticGeneration: true,
        enableIncrementalStaticGeneration: true,
        revalidateInterval: 3600, // 1 hour
        fallbackStrategy: "static",
      },
      caching: {
        enableSWRCache: true,
        enableRedisCache: false,
        enableCDNCache: true,
        cacheTimeout: 300, // 5 minutes
      },
      ...config,
    };
  }

  // Optimize page rendering
  async optimizePageRender(
    pageComponent: React.ComponentType<any>,
    props: any,
    context: {
      pathname: string;
      query: Record<string, string>;
      locale?: string;
    },
  ): Promise<{ html: string; metrics: SSRPerformanceMetrics }> {
    const startTime = performance.now();

    try {
      // Apply prerendering optimizations
      const optimizedProps = await this.optimizeProps(props, context);

      // Generate optimized HTML
      const html = await this.renderOptimizedHTML(
        pageComponent,
        optimizedProps,
        context,
      );

      // Apply post-rendering optimizations
      const finalHtml = await this.applyPostRenderOptimizations(html, context);

      const renderTime = performance.now() - startTime;

      const metrics: SSRPerformanceMetrics = {
        timestamp: Date.now(),
        route: context.pathname,
        renderTime,
        dataFetchTime: 0, // Would be calculated from data fetching
        cacheHit: false, // Would be determined by cache layer
        bundleSize: 0, // Would be calculated from build stats
        firstByteTime: renderTime,
        recommendations:
          await this.generateSSROptimizationRecommendations(context),
      };

      this.metrics.push(metrics);

      return { html: finalHtml, metrics };
    } catch (error) {
      console.error("SSR optimization failed:", error);
      throw error;
    }
  }

  // Optimize props before rendering
  private async optimizeProps(
    props: any,
    context: {
      pathname: string;
      query: Record<string, string>;
      locale?: string;
    },
  ): Promise<any> {
    const optimizedProps = { ...props };

    // Apply request memoization
    if (this.config.enableRequestMemoization) {
      optimizedProps._memoized = await this.memoizeRequest(context);
    }

    // Apply selective hydration hints
    if (this.config.enableSelectiveHydration) {
      optimizedProps._hydrationHints = this.generateHydrationHints(props);
    }

    // Apply dynamic import hints
    if (this.config.enableDynamicImports) {
      optimizedProps._dynamicImports = this.analyzeDynamicImports(props);
    }

    return optimizedProps;
  }

  // Render optimized HTML
  private async renderOptimizedHTML(
    pageComponent: React.ComponentType<any>,
    props: any,
    context: any,
  ): Promise<string> {
    // Streaming SSR implementation
    if (this.config.enableStreaming) {
      return this.renderStreamingHTML(pageComponent, props, context);
    }

    // Regular SSR with optimizations
    return this.renderStandardHTML(pageComponent, props, context);
  }

  // Streaming HTML rendering
  private async renderStreamingHTML(
    pageComponent: React.ComponentType<any>,
    props: any,
    context: any,
  ): Promise<string> {
    // Simulate streaming by rendering critical content first
    const criticalHtml = await this.renderCriticalContent(pageComponent, props);
    const deferredHtml = await this.renderDeferredContent(pageComponent, props);

    return `
      ${criticalHtml}
      <template id="deferred-content">${deferredHtml}</template>
      <script>
        // Hydrate critical content immediately
        ${this.generateCriticalHydrationScript()}
        // Defer non-critical content
        ${this.generateDeferredHydrationScript()}
      </script>
    `;
  }

  // Standard HTML rendering with optimizations
  private async renderStandardHTML(
    pageComponent: React.ComponentType<any>,
    props: any,
    context: any,
  ): Promise<string> {
    // Create element and render
    const element = React.createElement(pageComponent, props);
    const html = ReactDOMServer.renderToString(element);

    return this.optimizeRenderedHTML(html, context);
  }

  // Apply post-rendering optimizations
  private async applyPostRenderOptimizations(
    html: string,
    context: {
      pathname: string;
      query: Record<string, string>;
      locale?: string;
    },
  ): Promise<string> {
    let optimizedHtml = html;

    // Apply critical CSS inlining
    if (this.config.enableCriticalCSS) {
      optimizedHtml = await this.inlineCriticalCSS(optimizedHtml, context);
    }

    // Apply image optimization
    if (this.config.enableImageOptimization) {
      optimizedHtml = this.optimizeImages(optimizedHtml);
    }

    // Apply font optimization
    if (this.config.enableFontOptimization) {
      optimizedHtml = this.optimizeFonts(optimizedHtml);
    }

    // Apply compression hints
    optimizedHtml = this.addCompressionHints(optimizedHtml);

    return optimizedHtml;
  }

  // Cache management
  private async getCachedData(key: string): Promise<any | null> {
    if (!this.config.caching.enableSWRCache) return null;

    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private async setCachedData(
    key: string,
    data: any,
    ttl: number = this.config.caching.cacheTimeout,
  ): Promise<void> {
    if (!this.config.caching.enableSWRCache) return;

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  // Request memoization
  private async memoizeRequest(context: {
    pathname: string;
    query: Record<string, string>;
  }): Promise<any> {
    const cacheKey = `request_${context.pathname}_${JSON.stringify(context.query)}`;
    return this.getCachedData(cacheKey);
  }

  // Hydration hints generation
  private generateHydrationHints(props: any): any {
    // Analyze component tree for hydration optimization
    return {
      priority: this.analyzeComponentPriority(props),
      defer: this.identifyDeferredComponents(props),
      eager: this.identifyEagerComponents(props),
    };
  }

  // Dynamic imports analysis
  private analyzeDynamicImports(props: any): any {
    // Analyze which components can be dynamically imported
    return {
      candidates: this.findDynamicImportCandidates(props),
      priorities: this.calculateImportPriorities(props),
    };
  }

  // Critical content rendering
  private async renderCriticalContent(
    pageComponent: React.ComponentType<any>,
    props: any,
  ): Promise<string> {
    // Render only above-the-fold content for faster initial paint
    const criticalProps = this.extractCriticalProps(props);
    const element = React.createElement(pageComponent, {
      ...props,
      _renderMode: "critical",
      ...criticalProps,
    });
    return ReactDOMServer.renderToString(element);
  }

  // Deferred content rendering
  private async renderDeferredContent(
    pageComponent: React.ComponentType<any>,
    props: any,
  ): Promise<string> {
    // Render below-the-fold content for deferred hydration
    const deferredProps = this.extractDeferredProps(props);
    const element = React.createElement(pageComponent, {
      ...props,
      _renderMode: "deferred",
      ...deferredProps,
    });
    return ReactDOMServer.renderToString(element);
  }

  // Critical CSS inlining
  private async inlineCriticalCSS(html: string, context: any): Promise<string> {
    // Extract critical CSS and inline it
    const criticalCSS = await this.extractCriticalCSS(context.pathname);

    if (criticalCSS) {
      return html.replace(
        "<head>",
        `<head><style data-critical-css>${criticalCSS}</style>`,
      );
    }

    return html;
  }

  // Image optimization
  private optimizeImages(html: string): string {
    // Add loading="lazy" to below-fold images
    // Convert to modern formats
    // Add responsive image attributes
    return html
      .replace(/<img([^>]+)>/g, (match, attrs) => {
        if (!attrs.includes("loading=")) {
          return `<img${attrs} loading="lazy">`;
        }
        return match;
      })
      .replace(
        /<img([^>]+src="[^"]+\.(jpg|jpeg|png)"[^>]*)>/g,
        (match, before, after, ext) => {
          // Add WebP alternatives for supported browsers
          return `${match}<source srcset="${before.replace(ext, "webp")}" type="image/webp">`;
        },
      );
  }

  // Font optimization
  private optimizeFonts(html: string): string {
    // Add font-display: swap
    // Preload critical fonts
    return html.replace(
      /<link[^>]+href="[^"]+\.(woff2?|ttf|eot)"[^>]*>/g,
      (match) => {
        if (!match.includes("font-display")) {
          return match.replace(">", ' style="font-display: swap;">');
        }
        return match;
      },
    );
  }

  // Compression hints
  private addCompressionHints(html: string): string {
    // Add compression hints for better performance
    return html.replace(
      "<head>",
      '<head><meta http-equiv="Accept-CH" content="DPR, Width, Viewport-Width"><meta http-equiv="Accept-Encoding" content="gzip, deflate, br">',
    );
  }

  // Hydration scripts generation
  private generateCriticalHydrationScript(): string {
    return `
      window.__CRITICAL_HYDRATED__ = true;
      // Immediate hydration for critical content
    `;
  }

  private generateDeferredHydrationScript(): string {
    return `
      // Defer hydration for non-critical content
      requestIdleCallback(() => {
        const template = document.getElementById('deferred-content');
        if (template) {
          const content = template.content;
          document.body.appendChild(content);
          // Hydrate deferred content
        }
      });
    `;
  }

  // HTML optimization
  private optimizeRenderedHTML(html: string, context: any): string {
    return (
      html
        // Remove unnecessary whitespace
        .replace(/\s+/g, " ")
        // Optimize attribute order for better compression
        .replace(/class="([^"]*)" id="([^"]*)"/g, 'id="$2" class="$1"')
        // Add resource hints
        .replace(
          "<head>",
          `<head>
        <link rel="dns-prefetch" href="//fonts.googleapis.com">
        <link rel="preconnect" href="//fonts.gstatic.com" crossorigin>
      `,
        )
    );
  }

  // Utility methods
  private analyzeComponentPriority(props: any): string[] {
    // Analyze which components should hydrate first
    return ["Header", "Navigation", "Search", "CriticalContent"];
  }

  private identifyDeferredComponents(props: any): string[] {
    // Identify components that can be hydrated later
    return ["Footer", "Sidebar", "Comments", "RelatedProducts"];
  }

  private identifyEagerComponents(props: any): string[] {
    // Identify components that need immediate hydration
    return ["InteractiveElements", "Forms", "ShoppingCart"];
  }

  private findDynamicImportCandidates(props: any): string[] {
    // Find components that can be dynamically imported
    return ["HeavyComponents", "AdminPanel", "AnalyticsDashboard"];
  }

  private calculateImportPriorities(props: any): Record<string, number> {
    // Calculate import priorities (1-10, higher = more important)
    return {
      CriticalComponents: 10,
      AboveFoldContent: 8,
      InteractiveElements: 6,
      DeferredContent: 2,
    };
  }

  private extractCriticalProps(props: any): any {
    // Extract only props needed for critical content rendering
    const { header, navigation, main, search, ...rest } = props;
    return { header, navigation, main, search };
  }

  private extractDeferredProps(props: any): any {
    // Extract props for deferred content
    const { footer, sidebar, comments, relatedProducts, ...rest } = props;
    return { footer, sidebar, comments, relatedProducts };
  }

  private async extractCriticalCSS(pathname: string): Promise<string | null> {
    // Extract critical CSS for the current route
    // This would integrate with a CSS extraction tool
    return `
      /* Critical CSS for ${pathname} */
      body { margin: 0; font-family: system-ui; }
      .critical { display: block; }
    `;
  }

  // Generate SSR optimization recommendations
  private async generateSSROptimizationRecommendations(
    context: any,
  ): Promise<string[]> {
    const recommendations = [];

    // Analyze route and suggest optimizations
    if (context.pathname.includes("/product/")) {
      recommendations.push("Implement product page caching with ISR");
      recommendations.push(
        "Use static generation for frequently viewed products",
      );
      recommendations.push("Optimize image loading with priority hints");
    }

    if (context.pathname.includes("/search")) {
      recommendations.push("Implement search result caching");
      recommendations.push("Use streaming for large result sets");
      recommendations.push("Optimize filter component hydration");
    }

    if (context.pathname.includes("/admin")) {
      recommendations.push("Use client-side rendering for admin interfaces");
      recommendations.push("Implement lazy loading for admin components");
    }

    // General recommendations
    recommendations.push("Enable gzip/brotli compression");
    recommendations.push("Implement proper cache headers");
    recommendations.push("Use CDN for static assets");
    recommendations.push("Monitor Core Web Vitals regularly");

    return recommendations;
  }

  // Public API methods
  getMetrics(): SSRPerformanceMetrics[] {
    return [...this.metrics];
  }

  getLatestMetrics(limit: number = 10): SSRPerformanceMetrics[] {
    return this.metrics.slice(-limit);
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0, // Would track cache hits vs misses
    };
  }

  async preloadRoute(pathname: string, props?: any): Promise<void> {
    // Preload route data for faster subsequent requests
    const cacheKey = `route_${pathname}`;
    await this.setCachedData(cacheKey, props || {}, 300); // 5 minutes
  }
}

// React hooks for SSR optimization
export function useSSROptimization(config?: Partial<SSROptimizationConfig>) {
  const optimizerRef = React.useRef<AdvancedSSROptimizer | null>(null);

  React.useEffect(() => {
    if (!optimizerRef.current) {
      optimizerRef.current = new AdvancedSSROptimizer(config);
    }
  }, []);

  const preloadRoute = React.useCallback((pathname: string, props?: any) => {
    if (optimizerRef.current) {
      optimizerRef.current.preloadRoute(pathname, props).catch(console.error);
    }
  }, []);

  return {
    preloadRoute,
    getMetrics: () => optimizerRef.current?.getMetrics() || [],
    getCacheStats: () =>
      optimizerRef.current?.getCacheStats() || { size: 0, hitRate: 0 },
    clearCache: () => optimizerRef.current?.clearCache(),
  };
}

// Higher-order component for SSR optimization
export function withSSROptimization<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    priority?: "critical" | "high" | "normal" | "low";
    defer?: boolean;
    dynamic?: boolean;
  } = {},
) {
  const OptimizedComponent = React.forwardRef<any, P>((props, ref) => {
    // Add optimization hints to component
    React.useEffect(() => {
      // Mark component for optimization
      const element = ref as any;
      if (element && element._internalInstance) {
        element._internalInstance._optimizationHints = options;
      }
    }, []);

    return React.createElement(Component, props as any);
  });

  OptimizedComponent.displayName = `withSSROptimization(${Component.displayName || Component.name})`;

  return OptimizedComponent;
}

// Utility functions for SSR optimization
export const SSROptimizationUtils = {
  // Generate preload hints
  generatePreloadHints: (
    resources: Array<{ href: string; as: string; type?: string }>,
  ) => {
    return resources.map((resource) =>
      React.createElement("link", {
        rel: "preload",
        href: resource.href,
        as: resource.as,
        type: resource.type,
        key: resource.href,
      }),
    );
  },

  // Generate resource hints
  generateResourceHints: (
    hints: Array<{ rel: string; href: string; [key: string]: any }>,
  ) => {
    return hints.map((hint) =>
      React.createElement("link", {
        ...hint,
        key: hint.href,
      }),
    );
  },

  // Check if component should hydrate immediately
  shouldHydrateImmediately: (componentName: string, context: any): boolean => {
    const criticalComponents = [
      "Header",
      "Navigation",
      "SearchForm",
      "ShoppingCart",
    ];
    return criticalComponents.includes(componentName);
  },

  // Calculate hydration priority
  calculateHydrationPriority: (componentName: string, context: any): number => {
    const priorities: Record<string, number> = {
      Header: 10,
      Navigation: 9,
      SearchForm: 8,
      ShoppingCart: 8,
      ProductGrid: 6,
      Footer: 2,
      Comments: 1,
    };

    return priorities[componentName] || 5;
  },
};

// Next.js specific optimizations
export const NextJSOptimizations = {
  // Generate static props with optimizations
  generateOptimizedStaticProps: async (context: any) => {
    const startTime = Date.now();

    // Add optimization metadata
    const optimizedProps = {
      ...context,
      _optimization: {
        generatedAt: new Date().toISOString(),
        generationTime: Date.now() - startTime,
        cacheHint: "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    };

    return optimizedProps;
  },

  // Optimize image component props
  optimizeImageProps: (props: any) => {
    return {
      ...props,
      priority: props.priority || false,
      placeholder: props.placeholder || "blur",
      blurDataURL: props.blurDataURL || undefined,
      loading: props.loading || "lazy",
      sizes:
        props.sizes ||
        "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
    };
  },

  // Generate optimized metadata
  generateOptimizedMetadata: (metadata: any, route: string) => {
    const optimizedMetadata = {
      ...metadata,
      other: {
        ...metadata.other,
        "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "x-optimization-hints": JSON.stringify({
          route,
          optimized: true,
          timestamp: new Date().toISOString(),
        }),
      },
    };

    return optimizedMetadata;
  },
};

// Import React DOM Server (would need to be added to dependencies)
const ReactDOMServer = {
  renderToString: (element: React.ReactElement) => {
    // Placeholder - would use actual ReactDOMServer.renderToString
    return "<div>Rendered content</div>";
  },
};
