/**
 * Sentry + OpenTelemetry Instrumentation for Medusa v2
 *
 * This file MUST be at the root of the backend directory.
 * Medusa automatically loads instrumentation.ts before starting the server.
 *
 * Reference: https://docs.medusajs.com/learn/debugging-and-testing/instrumentation
 */
import * as Sentry from "@sentry/node"
import { registerOtel } from "@medusajs/medusa"

export function register() {
  // Skip initialization if no DSN is configured
  if (!process.env.SENTRY_DSN) {
    console.log("[Sentry] SENTRY_DSN not set, skipping initialization")
    return
  }

  // Initialize Sentry with auto-instrumentation
  // Sentry SDK v8+ handles OpenTelemetry integration automatically
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    release:
      process.env.SENTRY_RELEASE ||
      `opticworks-backend@${process.env.npm_package_version || "0.0.1"}`,

    // Performance monitoring - 100% for dev/staging, reduce in production
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

    // Profiling (helps identify slow code)
    profilesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

    // Auto-instrument common integrations
    integrations: [
      Sentry.httpIntegration(),
      Sentry.expressIntegration(),
      Sentry.postgresIntegration(),
      Sentry.redisIntegration(),
    ],

    // Filter sensitive data before sending to Sentry
    beforeSend(event) {
      if (event.request?.headers) {
        delete event.request.headers["authorization"]
        delete event.request.headers["cookie"]
        delete event.request.headers["x-api-key"]
      }
      return event
    },

    // Ignore certain non-actionable errors
    ignoreErrors: [
      /^Network request failed$/,
      /^AbortError$/,
      /^ECONNRESET$/,
      /^ECONNREFUSED$/,
    ],
  })

  // Register Medusa's OpenTelemetry instrumentation
  // This enables tracing for HTTP, workflows, and database queries
  registerOtel({
    serviceName: "opticworks-medusa-backend",
    instrument: {
      http: true, // Instrument HTTP requests
      workflows: true, // Instrument Medusa workflows
      query: true, // Instrument database queries
    },
  })

  console.log("[Sentry] Initialized with OpenTelemetry instrumentation")
}
