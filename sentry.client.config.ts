/**
 * Sentry Client Configuration
 *
 * This file configures Sentry for the browser/client-side only.
 * Uses @sentry/browser for minimal bundle size on Cloudflare Workers.
 *
 * Hybrid approach: Sentry handles client-side errors only.
 * Edge/server monitoring is handled by Cloudflare's native tools.
 */
import * as Sentry from "@sentry/browser"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NODE_ENV || "development",

  // Performance Monitoring - 20% sample rate for production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

  // Session Replay removed - too heavy for Cloudflare Workers bundle
  // Use Cloudflare's native analytics for user session insights

  integrations: [
    // Browser tracing for performance monitoring
    Sentry.browserTracingIntegration(),
  ],

  // Filter out noisy, non-actionable errors
  ignoreErrors: [
    // Browser extensions
    /^chrome-extension:\/\//,
    /^moz-extension:\/\//,
    // Common non-actionable errors
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
    /Loading chunk \d+ failed/,
    "Network request failed",
    // User-initiated navigation
    "AbortError",
    // Third-party scripts
    /^Script error\.?$/,
  ],

  // Filter sensitive data from breadcrumbs
  beforeBreadcrumb(breadcrumb) {
    if (breadcrumb.category === "xhr" || breadcrumb.category === "fetch") {
      // Don't log request bodies (may contain PII)
      if (breadcrumb.data?.body) {
        delete breadcrumb.data.body
      }
    }
    return breadcrumb
  },

  // Filter sensitive data from events
  beforeSend(event) {
    // Remove cookies and auth headers
    if (event.request?.headers) {
      delete event.request.headers["cookie"]
      delete event.request.headers["authorization"]
    }
    return event
  },
})

// Export Sentry for use in error boundaries
export { Sentry }
