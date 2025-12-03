import { defineMiddlewares } from "@medusajs/medusa"
import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import cors from "cors"

/**
 * CORS Preflight Handler
 *
 * This middleware ensures OPTIONS preflight requests are handled BEFORE
 * the publishable API key validation middleware runs. Without this,
 * preflight requests fail with 400 because browsers don't send custom
 * headers (like x-publishable-api-key) on OPTIONS requests.
 */
const corsOptions = {
  origin: (process.env.STORE_CORS || "http://localhost:3000").split(","),
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "x-publishable-api-key",
    "x-medusa-access-token",
  ],
}

const corsMiddleware = cors(corsOptions)

// Wrap cors middleware for Medusa's middleware system
const handleCors = (
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  corsMiddleware(req, res, next)
}

export default defineMiddlewares({
  routes: [
    {
      // Apply CORS to all store routes, ensuring OPTIONS is handled first
      matcher: "/store/*",
      method: "OPTIONS",
      middlewares: [handleCors],
    },
  ],
})
