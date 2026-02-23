/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Optimize webpack cache to prevent chunk loading errors
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.cache = {
        type: 'filesystem',
        cacheDirectory: '.next/cache',
        buildDependencies: {
          config: [__filename],
        },
      };
    }
    return config;
  },
};

export default nextConfig;
