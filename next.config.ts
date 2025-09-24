import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/.well-known/:path*',
        destination: '/.well-known/:path*',
      },
    ];
  },
};

export default nextConfig;
