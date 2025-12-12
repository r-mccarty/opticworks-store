import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

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

// Wrap with Sentry configuration for client-side error tracking
// Server/edge monitoring is handled by Cloudflare's native tools
export default withSentryConfig(nextConfig, {
  // Sentry organization and project (set via environment variables)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Suppress Sentry logs during build (except in CI)
  silent: !process.env.CI,

  // Upload source maps for better stack traces
  widenClientFileUpload: true,

  // Hide source maps from production build (but upload to Sentry)
  hideSourceMaps: true,

  // Route browser requests to Sentry through a Next.js rewrite
  // This hides DSN from ad-blockers
  tunnelRoute: "/monitoring",

  // Webpack configuration for Cloudflare Workers compatibility
  // Server/edge monitoring handled by Cloudflare native tools
  webpack: {
    autoInstrumentServerFunctions: false,
    autoInstrumentMiddleware: false,
    autoInstrumentAppDirectory: false,
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
