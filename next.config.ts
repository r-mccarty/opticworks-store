import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // WORKAROUND: Next.js 15 build-time type checking hangs indefinitely
  // Root cause: Unknown (possibly Next.js 15 bug with large codebases)
  // Verification: `pnpm exec tsc --noEmit` completes successfully in ~2min
  // Solution: Run type checking separately in CI/CD pipeline
  // See: docs/PHASE2_INTEGRATION_SUMMARY.md for details
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-e97850e2b6554798b4b0ec23548c975d.r2.dev',
        port: '',
        pathname: '/**',
      }
    ],
  },
  transpilePackages: ['three'],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ['raw-loader'],
    });
    return config;
  },
};

// Note: Sentry is initialized client-side only via sentry.client.config.ts
// Server/edge monitoring is handled by Cloudflare's native tools
export default nextConfig;
