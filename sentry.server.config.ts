/**
 * Sentry Server Configuration (Minimal)
 *
 * This file is required by @sentry/nextjs but we keep it minimal.
 *
 * Hybrid approach: Server/edge monitoring is handled by Cloudflare's native
 * tools (Workers Analytics, Logpush, Tail Workers). Sentry focuses on
 * client-side JavaScript errors only.
 */
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Disabled - using Cloudflare for server/edge monitoring
  enabled: false,
})
