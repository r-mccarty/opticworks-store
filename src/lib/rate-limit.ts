/**
 * Simple in-memory rate limiter for Cloudflare Workers
 *
 * Note: This is per-isolate rate limiting. In Cloudflare Workers, each request
 * may hit a different isolate, so this provides soft rate limiting. For strict
 * rate limiting, use Cloudflare's built-in Rate Limiting rules or Durable Objects.
 *
 * @see https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (per isolate)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically
const CLEANUP_INTERVAL = 60000; // 1 minute
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  lastCleanup = now;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
  /** Optional prefix for the key (e.g., 'shipping', 'checkout') */
  prefix?: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Check if a request should be rate limited
 *
 * @param identifier - Unique identifier (usually IP address or user ID)
 * @param config - Rate limit configuration
 * @returns RateLimitResult with success status and metadata
 *
 * @example
 * ```ts
 * const result = checkRateLimit(clientIP, {
 *   limit: 10,
 *   windowSeconds: 60,
 *   prefix: 'shipping'
 * });
 *
 * if (!result.success) {
 *   return new Response('Too Many Requests', {
 *     status: 429,
 *     headers: { 'Retry-After': String(result.retryAfter) }
 *   });
 * }
 * ```
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanup();

  const { limit, windowSeconds, prefix = 'default' } = config;
  const key = `${prefix}:${identifier}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  let entry = rateLimitStore.get(key);

  // Create new entry if doesn't exist or window has expired
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 0,
      resetTime: now + windowMs,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);

  const remaining = Math.max(0, limit - entry.count);
  const success = entry.count <= limit;

  return {
    success,
    limit,
    remaining,
    resetTime: entry.resetTime,
    retryAfter: success ? undefined : Math.ceil((entry.resetTime - now) / 1000),
  };
}

/**
 * Get client IP from request headers
 * Works with Cloudflare Workers and standard proxies
 */
export function getClientIP(request: Request): string {
  // Cloudflare provides the real IP in CF-Connecting-IP
  const cfIP = request.headers.get('cf-connecting-ip');
  if (cfIP) return cfIP;

  // Fallback to X-Forwarded-For
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  // Fallback to X-Real-IP
  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP;

  // Default fallback
  return 'unknown';
}

/**
 * Create rate limit response headers
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
  };

  if (result.retryAfter) {
    headers['Retry-After'] = String(result.retryAfter);
  }

  return headers;
}

/**
 * Pre-configured rate limits for different API endpoints
 */
export const RATE_LIMITS = {
  // Shipping rates: 20 requests per minute per IP
  // (generous for normal checkout, but prevents abuse)
  shipping: {
    limit: 20,
    windowSeconds: 60,
    prefix: 'shipping',
  },

  // Checkout/payment: 10 requests per minute per IP
  checkout: {
    limit: 10,
    windowSeconds: 60,
    prefix: 'checkout',
  },

  // Address validation: 30 requests per minute per IP
  addressValidation: {
    limit: 30,
    windowSeconds: 60,
    prefix: 'address',
  },

  // General API: 100 requests per minute per IP
  general: {
    limit: 100,
    windowSeconds: 60,
    prefix: 'api',
  },

  // Strict: 5 requests per minute (for sensitive operations)
  strict: {
    limit: 5,
    windowSeconds: 60,
    prefix: 'strict',
  },
} as const;
