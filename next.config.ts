import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ignore lint errors in other files during build (waitlist-only launch)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
