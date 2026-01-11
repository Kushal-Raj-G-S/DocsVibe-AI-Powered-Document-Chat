import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove env config to force runtime environment variable resolution
  // This ensures NEXT_PUBLIC_* vars are read from the deployment environment
};

export default nextConfig;
