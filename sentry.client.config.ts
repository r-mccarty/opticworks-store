/**
 * Sentry Client Configuration
 *
 * This file configures Sentry for the browser/client-side.
 * It runs in the user's browser and captures frontend JavaScript errors.
 *
 * Hybrid approach: Sentry handles client-side errors only.
 * Edge/server monitoring is handled by Cloudflare's native tools.
 */
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NODE_ENV || "development",

  // Performance Monitoring - 100% for dev/staging, reduce in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

  // Session Replay - helps debug user sessions
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% when error occurs

  integrations: [
    // Capture browser performance data
    Sentry.browserTracingIntegration(),
    // Session replay for debugging user interactions
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
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
