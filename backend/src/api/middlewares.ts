import { defineMiddlewares } from "@medusajs/medusa"

/**
 * Custom Middlewares
 *
 * NOTE: CORS preflight handling for production is done by the Cloudflare Worker
 * at infrastructure/workers/api-cors/ which intercepts OPTIONS requests before
 * they reach Medusa.
 *
 * This file can be used for any additional custom middleware if needed.
 */
export default defineMiddlewares({
  routes: [],
})
