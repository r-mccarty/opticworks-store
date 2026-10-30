import { defineMiddlewares } from "@medusajs/framework/http"
import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { rateLimit } from "../lib/rate-limit"

const SAFE_ID = /^[A-Za-z0-9._-]{1,64}$/

/**
 * Echo a caller's correlation id only if it is short and plain, so it can't
 * inject content into logs or headers; otherwise mint one.
 */
function correlationId(req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) {
  const given = req.headers["x-correlation-id"] ?? req.headers["cf-ray"]
  const id = typeof given === "string" && SAFE_ID.test(given) ? given : crypto.randomUUID()
  res.setHeader("x-correlation-id", id)
  next()
}

/**
 * The backend exposes only Medusa's core Store, Auth and Admin APIs; there are
 * no custom routes. These rules add per-IP limits to the abuse-prone auth endpoints.
 */
export default defineMiddlewares({
  routes: [
    { matcher: "/*", middlewares: [correlationId] },
    { matcher: "/auth/customer/emailpass", methods: ["POST"], middlewares: [rateLimit("login", 10, 60)] },
    {
      matcher: "/auth/customer/emailpass/register",
      methods: ["POST"],
      middlewares: [rateLimit("register", 5, 600)],
    },
    {
      matcher: "/auth/customer/emailpass/reset-password",
      methods: ["POST"],
      middlewares: [rateLimit("reset", 5, 600)],
    },
    { matcher: "/auth/user/emailpass", methods: ["POST"], middlewares: [rateLimit("admin-login", 5, 60)] },
    {
      matcher: "/auth/user/emailpass/reset-password",
      methods: ["POST"],
      middlewares: [rateLimit("admin-reset", 5, 600)],
    },
  ],
})
