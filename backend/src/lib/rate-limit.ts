import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { redis } from "./redis"

/**
 * Client address. Medusa listens on loopback and is reachable only through the
 * Cloudflare tunnel, so CF-Connecting-IP is set by Cloudflare, not the client.
 */
export function clientIp(req: MedusaRequest): string {
  const cf = req.headers["cf-connecting-ip"]
  return (typeof cf === "string" && cf) || req.socket.remoteAddress || "unknown"
}

/**
 * Fixed-window limiter backed by Redis, so limits hold across the server and
 * worker processes. If Redis is unavailable it fails open for availability;
 * Cloudflare rate-limiting rules remain the outer layer.
 */
export function rateLimit(name: string, limit: number, windowSeconds: number) {
  return async (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
    const key = `rl:${name}:${clientIp(req)}:${Math.floor(Date.now() / 1000 / windowSeconds)}`
    try {
      // One transaction, so a crash can't leave a counter without an expiry.
      const replies = await redis().multi().incr(key).expire(key, windowSeconds, "NX").exec()
      const count = Number(replies?.[0]?.[1] ?? 0)
      if (count > limit) {
        res.setHeader("Retry-After", String(windowSeconds))
        res.status(429).json({ type: "rate_limited", message: "Too many requests. Try again later." })
        return
      }
    } catch {
      // Fall through: never take the store down because the limiter's store is down.
    }
    next()
  }
}
