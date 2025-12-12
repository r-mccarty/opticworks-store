/**
 * Simple in-memory rate limiter for API routes.
 *
 * Not distributed across instances; intended as a lightweight guard
 * for auth endpoints to reduce brute-force attempts.
 */

const buckets: Map<string, { count: number; expiresAt: number }> = new Map()

type RateLimitOptions = {
  /** Max requests allowed within the window */
  limit: number
  /** Window size in milliseconds */
  windowMs: number
}

export type RateLimitResult =
  | { success: true }
  | { success: false; retryAfter: number }

export function rateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions
): RateLimitResult {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (bucket && bucket.expiresAt > now) {
    if (bucket.count >= limit) {
      return { success: false, retryAfter: bucket.expiresAt - now }
    }
    bucket.count += 1
    buckets.set(key, bucket)
    return { success: true }
  }

  buckets.set(key, { count: 1, expiresAt: now + windowMs })
  return { success: true }
}

/**
 * Build a stable rate-limit key using route + client identifier.
 * Falls back to "unknown" when no identifier can be derived.
 */
export function buildRateLimitKey(route: string, req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")
  const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("cf-connecting-ip") || "unknown"
  return `${route}:${ip}`
}
