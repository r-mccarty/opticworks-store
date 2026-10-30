import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Disable Next.js image optimization for Cloudflare Workers
    // Workers runtime doesn't support Node.js sharp library
    // Images are served directly from /public or R2
    unoptimized: true,
  },
  async redirects() {
    // Temporary until the legal review (#126) moves the documents to /legal/*.
    return [
      { source: "/legal/privacy", destination: "/support/legal/privacy", permanent: false },
      { source: "/legal/terms", destination: "/support/legal/terms", permanent: false },
    ];
  },
};

// Note: Sentry is initialized client-side only via sentry.client.config.ts
// Server/edge monitoring is handled by Cloudflare's native tools
export default nextConfig;
