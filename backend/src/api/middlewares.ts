import { defineMiddlewares } from "@medusajs/medusa"
import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import express from "express"
import * as Sentry from "@sentry/node"

/**
 * Custom JSON body parser with raw body capture for webhook signature verification.
 */
const jsonParserWithRawBody = express.json({
  verify: (req, _res, buf) => {
    // Store raw body on request for signature verification
    (req as MedusaRequest & { rawBody?: string }).rawBody = buf.toString("utf8");
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
 * Sentry request handler - adds request context to Sentry events.
 * Sentry's expressIntegration() automatically captures errors,
 * this middleware enriches the context for better debugging.
 */
function sentryRequestHandler(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  Sentry.setContext("request", {
    url: req.url,
    method: req.method,
    query: req.query,
  })
  next()
}

/**
 * Custom Middlewares
 *
 * NOTE: CORS preflight handling for production is done by the Cloudflare Worker
 * at infrastructure/workers/api-cors/ which intercepts OPTIONS requests before
 * they reach Medusa.
 *
 * Sentry error capturing is handled automatically by Sentry's expressIntegration()
 * configured in instrumentation.ts. The request handler here enriches context.
 *
 * Webhook routes use custom body parser to capture raw body for signature verification.
 */
export default defineMiddlewares({
  routes: [
    // Sentry request handler for all routes (early in chain)
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
  ],
})
