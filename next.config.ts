import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["localhost", "127.0.0.1"],

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Image optimization
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/**",
      },
    ],
    // Disable static image optimization for external URLs in development
    unoptimized: process.env.NODE_ENV === "development",
    // Disable image caching in development
    minimumCacheTTL: process.env.NODE_ENV === "development" ? 0 : 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  compress: true,
  turbopack: {
    debugIds: process.env.NODE_ENV !== "production",
  },
  // Bundle analysis and optimization
  // webpack: (config, { dev, isServer }) => {
  //   // Optimize bundle splits
  //   if (!dev && !isServer) {
  //     config.optimization.splitChunks = {
  //       chunks: "all",
  //       cacheGroups: {
  //         ...(config.optimization.splitChunks?.cacheGroups || {}),
  //         vendor: {
  //           test: /[\\/]node_modules[\\/]/,
  //           name: "vendors",
  //           chunks: "all",
  //           priority: 10,
  //         },
  //         radix: {
  //           test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
  //           name: "radix-ui",
  //           chunks: "all",
  //           priority: 20,
  //         },
  //         ui: {
  //           test: /[\\/]components[\\/]ui[\\/]/,
  //           name: "ui-components",
  //           chunks: "all",
  //           priority: 15,
  //         },
  //       },
  //     };
  //   }

  //   // Add performance hints with more reasonable limits
  //   if (!dev) {
  //     config.performance = {
  //       hints: false, // Disable hints to prevent build failures
  //       maxEntrypointSize: 1000000, // 1MB
  //       maxAssetSize: 1000000, // 1MB
  //     };
  //   }

  //   return config;
  // },

  // Experimental features for better performance
  experimental: {
    // Disable filesystem caching for `next dev` in development
    turbopackFileSystemCacheForDev: process.env.NODE_ENV !== "development",
    // Enable filesystem caching for `next build`
    turbopackFileSystemCacheForBuild: true,
    optimizePackageImports: ["@radix-ui/react-icons"],
    optimizeCss: true,
    scrollRestoration: true,
    externalDir: true,
  },
  poweredByHeader: false,

  // Disable static optimization for pages with client components
  generateBuildId: async () => {
    return (
      process.env.BUILD_ID ||
      `build-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    );
  },

  // Security headers (will be merged with performance headers)
  async headers() {
    const isDevelopment = process.env.NODE_ENV === "development";

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Disable caching in development
          ...(isDevelopment
            ? [
                {
                  key: "Cache-Control",
                  value: "no-cache, no-store, must-revalidate",
                },
                {
                  key: "Pragma",
                  value: "no-cache",
                },
                {
                  key: "Expires",
                  value: "0",
                },
              ]
            : []),
        ],
      },
      // Static assets caching (only in production)
      ...(!isDevelopment
        ? [
            {
              source: "/_next/static/(.*)",
              headers: [
                {
                  key: "Cache-Control",
                  value: "public, max-age=31536000, immutable",
                },
              ],
            },
          ]
        : []),
      // API caching (only in production)
      ...(!isDevelopment
        ? [
            {
              source: "/api/(.*)",
              headers: [
                {
                  key: "Cache-Control",
                  value:
                    "public, max-age=300, s-maxage=600, stale-while-revalidate=86400",
                },
              ],
            },
          ]
        : []),
    ];
  },
};

export default withNextIntl(nextConfig);
