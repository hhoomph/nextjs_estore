/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["localhost", "127.0.0.1"],

  typescript: {
    ignoreBuildErrors: true,
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: (() => {
      const isDev = process.env.NODE_ENV === "development";
      const fromEnv = (process.env.NEXT_PUBLIC_IMAGE_ALLOWED_HOSTS ?? "")
        .split(",")
        .map((h) => h.trim().toLowerCase())
        .filter(Boolean);

      const prodHosts =
        fromEnv.length > 0
          ? fromEnv
          : [
              "lh3.googleusercontent.com",
              "avatars.githubusercontent.com",
              "images.unsplash.com",
              "res.cloudinary.com",
            ];

      const patterns = prodHosts.map((hostname) => ({
        protocol: "https",
        hostname,
        port: "",
        pathname: "/**",
      }));

      if (isDev) {
        patterns.push({
          protocol: "http",
          hostname: "localhost",
          port: "3000",
          pathname: "/**",
        });
      }
      return patterns;
    })(),
    unoptimized: process.env.NODE_ENV === "development",
    minimumCacheTTL: process.env.NODE_ENV === "development" ? 0 : 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  compress: true,
  turbopack: {
    debugIds: process.env.NODE_ENV !== "development",
    resolveAlias: {
      "next-intl/config": "./i18n/request.tsx",
    },
  },
  experimental: {
    useTypeScriptCli: true,
  },
  poweredByHeader: false,

  generateBuildId: async () => {
    return (
      process.env.BUILD_ID ||
      `build-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    );
  },

  async headers() {
    const isDevelopment = process.env.NODE_ENV === "development";

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          ...(isDevelopment
            ? [
                { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
                { key: "Pragma", value: "no-cache" },
                { key: "Expires", value: "0" },
              ]
            : []),
        ],
      },
      ...(!isDevelopment
        ? [
            {
              source: "/_next/static/(.*)",
              headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
            },
          ]
        : []),
      ...(!isDevelopment
        ? [
            {
              source: "/api/(.*)",
              headers: [{ key: "Cache-Control", value: "public, max-age=300, s-maxage=600, stale-while-revalidate=86400" }],
            },
          ]
        : []),
    ];
  },
};

module.exports = nextConfig;
