import { defineMiddlewares, authenticate } from "@medusajs/framework/http"
import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import express from "express"
import * as Sentry from "@sentry/node"
import { generateCorrelationId, createChildLogger } from "../lib/logger"

// Extended request type with our custom properties
interface ExtendedRequest {
  rawBody?: string
  correlationId?: string
  startTime?: number
}

/**
 * Custom JSON body parser with raw body capture for webhook signature verification.
 */
const jsonParserWithRawBody = express.json({
  verify: (req, _res, buf) => {
    // Store raw body on request for signature verification
    (req as MedusaRequest & ExtendedRequest).rawBody = buf.toString("utf8");
  },
})

/**
 * Wrapper middleware to apply custom JSON parser.
 */
function webhookBodyParser(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  jsonParserWithRawBody(req, res, next);
}

/**
 * Request logging middleware with correlation ID support.
 *
 * - Generates a unique correlation ID for request tracing
 * - Logs request start/end with timing
 * - Propagates correlation ID to Sentry for error correlation
 */
function requestLogger(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  const extReq = req as MedusaRequest & ExtendedRequest

  // Generate or use existing correlation ID (from upstream proxy/gateway)
  const correlationId =
    (req.headers["x-correlation-id"] as string) ||
    (req.headers["x-request-id"] as string) ||
    generateCorrelationId()

  // Attach to request for downstream use
  extReq.correlationId = correlationId
  extReq.startTime = Date.now()

  // Set response header for tracing
  res.setHeader("x-correlation-id", correlationId)

  // Create child logger with request context
  const logger = createChildLogger({
    correlationId,
    method: req.method,
    path: req.path,
  })

  // Log request start (skip health checks to reduce noise)
  const isHealthCheck = req.path === "/health" || req.path === "/store/health"
  if (!isHealthCheck) {
    logger.pino.info(
      {
        type: "request",
        phase: "start",
        query: req.query,
        userAgent: req.headers["user-agent"],
      },
      `${req.method} ${req.path}`
    )
  }

  // Log response on finish
  res.on("finish", () => {
    const duration = Date.now() - (extReq.startTime || Date.now())
    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info"

    if (!isHealthCheck) {
      logger.pino[level](
        {
          type: "request",
          phase: "end",
          statusCode: res.statusCode,
          durationMs: duration,
        },
        `${req.method} ${req.path} ${res.statusCode} ${duration}ms`
      )
    }
  })

  next()
}

/**
 * Sentry request handler - adds request context to Sentry events.
 * Sentry's expressIntegration() automatically captures errors,
 * this middleware enriches the context for better debugging.
 */
function sentryRequestHandler(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  const extReq = req as MedusaRequest & ExtendedRequest

  // Include correlation ID in Sentry context for error correlation
  Sentry.setContext("request", {
    url: req.url,
    method: req.method,
    query: req.query,
    correlationId: extReq.correlationId,
  })

  // Set correlation ID as a tag for filtering in Sentry
  Sentry.setTag("correlation_id", extReq.correlationId || "unknown")

  next()
}

/**
 * Custom Middlewares
 *
 * NOTE: CORS preflight handling for production is done by the Cloudflare Worker
 * at infrastructure/workers/api-cors/ which intercepts OPTIONS requests before
 * they reach Medusa.
 *
 * Middleware order:
 * 1. requestLogger - Adds correlation ID and logs request/response
 * 2. sentryRequestHandler - Enriches Sentry context with request info
 *
 * Sentry error capturing is handled automatically by Sentry's expressIntegration()
 * configured in instrumentation.ts. The request handler here enriches context.
 *
 * Webhook routes use custom body parser to capture raw body for signature verification.
 */
export default defineMiddlewares({
  routes: [
    // Request logging and correlation ID (first in chain)
    {
      matcher: "/*",
      middlewares: [requestLogger],
    },
    // Sentry request handler for all routes
    {
      matcher: "/*",
      middlewares: [sentryRequestHandler],
    },
    // Webhook routes use custom body parser
    {
      matcher: "/webhooks/*",
      bodyParser: false, // Disable default body parser
      middlewares: [webhookBodyParser],
    },
    // Protected customer routes (require authentication)
    {
      matcher: "/store/customers/me/payment-methods",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
  ],
})
