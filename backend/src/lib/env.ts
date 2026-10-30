import { z } from "zod"

/**
 * Strict runtime configuration. Every secret is required in production and
 * there are no fallback values: a missing or malformed variable stops the
 * process at boot instead of silently running with a default.
 */

const secret = z.string().min(32, "must be at least 32 characters")
const url = z.string().url()
const csv = z
  .string()
  .min(1)
  .transform((v) => v.split(",").map((s) => s.trim()).filter(Boolean))

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Neon: pooled endpoint for the app; direct endpoint is used only by migrations.
  DATABASE_URL: url.refine((v) => v.startsWith("postgres"), "must be a postgres URL"),

  // Local Redis on the host (unix socket or loopback), password-protected.
  REDIS_URL: url.refine((v) => /^rediss?:\/\//.test(v), "must be a redis URL"),

  JWT_SECRET: secret,
  COOKIE_SECRET: secret,

  STORE_CORS: z.string().min(1),
  ADMIN_CORS: z.string().min(1),
  AUTH_CORS: z.string().min(1),
  MEDUSA_BACKEND_URL: url,
  STOREFRONT_URL: url,

  MEDUSA_WORKER_MODE: z.enum(["shared", "worker", "server"]).default("shared"),
  DISABLE_MEDUSA_ADMIN: z.enum(["true", "false"]).default("false"),

  STRIPE_API_KEY: z.string().regex(/^(sk|rk)_(test|live)_/, "must be a Stripe secret or restricted key"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),

  STRIPE_TAX_FROM_COUNTRY: z.string().length(2),
  STRIPE_TAX_FROM_STATE: z.string().min(2),
  STRIPE_TAX_FROM_CITY: z.string().min(1),
  STRIPE_TAX_FROM_POSTAL: z.string().min(3),
  STRIPE_TAX_SKIP_COMMIT: z.enum(["true", "false"]).default("false"),

  EASYPOST_API_KEY: z.string().min(10),
  SHIP_FROM_NAME: z.string().min(1),
  SHIP_FROM_STREET1: z.string().min(1),
  SHIP_FROM_STREET2: z.string().optional(),
  SHIP_FROM_CITY: z.string().min(1),
  SHIP_FROM_STATE: z.string().min(2),
  SHIP_FROM_ZIP: z.string().min(5),
  // Optional: FedEx needs an origin phone to return rates; without it FedEx
  // options are unavailable and USPS still works.
  SHIP_FROM_PHONE: z.string().min(10).optional(),

  RESEND_API_KEY: z.string().startsWith("re_"),
  RESEND_FROM_EMAIL: z.string().min(3),
  // While the backend is dark, only these recipients receive mail; everything
  // else is dropped and logged by id. Unset in production to deliver normally.
  EMAIL_ALLOWLIST: csv.optional(),

  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET_NAME: z.string().min(1),
  R2_ENDPOINT_URL: url,
  R2_PUBLIC_URL: url,
})

export type Env = z.infer<typeof schema>

let cached: Env | undefined

export function env(): Env {
  if (cached) return cached
  const parsed = schema.safeParse(process.env)
  if (!parsed.success) {
    // Name the variables only; never echo values.
    const problems = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ")
    throw new Error(`[env] invalid configuration: ${problems}`)
  }
  cached = parsed.data
  return cached
}
