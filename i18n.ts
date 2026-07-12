import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Configure next-intl plugin
const withNextIntl = createNextIntlPlugin("./i18n/request.tsx");

const nextConfig: NextConfig = {
  // Existing Next.js configuration
};

export default withNextIntl(nextConfig);
