import type { NextConfig } from "next";

import { LEGACY_REDIRECTS } from "./src/lib/legacy-routes";

const nextConfig: NextConfig = {
  images: {
    // Disable Next.js image optimization for Cloudflare Workers
    // Workers runtime doesn't support Node.js sharp library
    // Images are served directly from /public or R2
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-e97850e2b6554798b4b0ec23548c975d.r2.dev',
        port: '',
        pathname: '/**',
      }
    ],
  },
  async redirects() {
    return LEGACY_REDIRECTS;
  },
};

// Note: Sentry is initialized client-side only via sentry.client.config.ts
// Server/edge monitoring is handled by Cloudflare's native tools
export default nextConfig;
