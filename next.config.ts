import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Ignore ESLint errors during builds for faster deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore TypeScript errors during builds for faster deployment
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
