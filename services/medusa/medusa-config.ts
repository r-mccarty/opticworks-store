import "dotenv/config"

import { defineConfig, Modules } from "@medusajs/utils"

const ensure = (key: string, fallback?: string) => {
  const value = process.env[key] ?? fallback
  if (!value) {
    throw new Error(`[medusa-config] Missing required environment variable: ${key}`)
  }
  return value
}

const corsString = (value: string | undefined, fallback: string) => {
  return value && value.trim().length > 0 ? value : fallback
}

const stripeApiKey = process.env.STRIPE_API_KEY
if (!stripeApiKey) {
  console.warn("[medusa-config] STRIPE_API_KEY is not set. Stripe payments cannot be initialized without it.")
}

const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET
if (!stripeWebhookSecret) {
  console.warn("[medusa-config] STRIPE_WEBHOOK_SECRET is not set. Webhook verification will fail without it.")
}

const hasR2Config =
  Boolean(process.env.R2_ACCESS_KEY_ID) &&
  Boolean(process.env.R2_SECRET_ACCESS_KEY) &&
  Boolean(process.env.R2_BUCKET)

const modulesConfig: Array<Record<string, unknown>> = [
  {
    key: Modules.PAYMENT,
    options: {
      providers: [
        {
          id: "stripe",
          resolve: "@medusajs/medusa/payment-stripe",
          options: {
            apiKey: stripeApiKey ?? "sk_test_missing",
            webhookSecret: stripeWebhookSecret ?? "whsec_missing",
            capture: true,
          },
        },
      ],
    },
  },
]

if (hasR2Config) {
  modulesConfig.push({
    key: Modules.FILE,
    options: {
      providers: [
        {
          id: "r2",
          resolve: "@medusajs/medusa/file-s3",
          options: {
            access_key_id: ensure("R2_ACCESS_KEY_ID"),
            secret_access_key: ensure("R2_SECRET_ACCESS_KEY"),
            bucket: ensure("R2_BUCKET"),
            region: process.env.R2_REGION ?? "auto",
            endpoint: process.env.R2_ENDPOINT,
          },
        },
      ],
    },
  })
}

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL ?? "postgres://medusa:medusa@localhost:5432/medusa",
    redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
    http: {
      storeCors: corsString(process.env.MEDUSA_STORE_CORS, "http://localhost:3000"),
      adminCors: corsString(process.env.MEDUSA_ADMIN_CORS, "http://localhost:7000,http://localhost:8000"),
      authCors: corsString(process.env.MEDUSA_ADMIN_CORS, "http://localhost:7000,http://localhost:8000"),
      jwtSecret: process.env.JWT_SECRET ?? "supersecret",
      cookieSecret: process.env.COOKIE_SECRET ?? "supersecret",
    },
  },
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL ?? "http://localhost:9000",
    path: "/app",
  },
  modules: modulesConfig,
})
