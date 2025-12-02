import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// Helper to ensure required environment variables
const ensure = (key: string, fallback?: string) => {
  const value = process.env[key] ?? fallback
  if (!value) {
    throw new Error(`[medusa-config] Missing required environment variable: ${key}`)
  }
  return value
}

// Helper for CORS string handling
const corsString = (value: string | undefined, fallback: string) => {
  return value && value.trim().length > 0 ? value : fallback
}

// Validate Stripe configuration
const stripeApiKey = process.env.STRIPE_API_KEY
if (!stripeApiKey) {
  console.warn("[medusa-config] STRIPE_API_KEY is not set. Stripe payments cannot be initialized without it.")
}

const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET
if (!stripeWebhookSecret) {
  console.warn("[medusa-config] STRIPE_WEBHOOK_SECRET is not set. Webhook verification will fail without it.")
}

// Check for Resend configuration
const resendApiKey = process.env.RESEND_API_KEY
if (!resendApiKey) {
  console.warn("[medusa-config] RESEND_API_KEY is not set. Email notifications will not work.")
}

// Redis URLs for infrastructure modules
const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379"
const redisCacheUrl = process.env.REDIS_CACHE_URL ?? redisUrl
const redisEventsUrl = process.env.REDIS_EVENTS_URL ?? redisUrl
const redisWorkflowUrl = process.env.REDIS_WORKFLOW_URL ?? redisUrl

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: ensure("DATABASE_URL", "postgres://medusa:medusa@localhost:5432/medusa"),
    http: {
      storeCors: corsString(process.env.STORE_CORS, "http://localhost:3000"),
      adminCors: corsString(process.env.ADMIN_CORS, "http://localhost:7000,http://localhost:8000"),
      authCors: corsString(process.env.AUTH_CORS, "http://localhost:7000,http://localhost:8000"),
      jwtSecret: ensure("JWT_SECRET", "supersecret"),
      cookieSecret: ensure("COOKIE_SECRET", "supersecret"),
    },
    redisUrl: redisUrl,
  },
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL ?? "http://localhost:9000",
    path: "/app",
  },
  modules: [
    // ===== CORE MODULES =====
    // The following core modules use default implementations (no explicit config needed):
    // - Currency Module (USD and multi-currency support enabled by default)
    // - Cart Module (shopping cart functionality)
    // - Customer Module (customer management)
    // - Auth Module (authentication)
    // - Session Module (session management)
    // - API Key Module (for headless/publishable API keys)
    // - Order Module, Product Module, Region Module, etc.
    //
    // To customize these, add explicit module configurations here.
    // See: https://docs.medusajs.com/resources/architectural-modules

    // ===== Infrastructure Modules (Redis-backed for production) =====
    {
      key: Modules.CACHE,
      resolve: "@medusajs/medusa/cache-redis",
      options: {
        redisUrl: redisCacheUrl,
        ttl: 30, // Cache TTL in seconds
      },
    },
    {
      key: Modules.EVENT_BUS,
      resolve: "@medusajs/medusa/event-bus-redis",
      options: {
        redisUrl: redisEventsUrl,
      },
    },
    {
      key: Modules.WORKFLOW_ENGINE,
      resolve: "@medusajs/medusa/workflow-engine-redis",
      options: {
        redis: {
          url: redisWorkflowUrl,
        },
      },
    },
    {
      key: Modules.LOCKING,
      resolve: "@medusajs/medusa/locking",
      options: {
        redisUrl: redisUrl,
      },
    },

    // ===== Payment Module (Stripe) =====
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

    // ===== Notification Module (Local/Resend) =====
    // NOTE: Using local provider for now. Resend integration can be added via custom module
    // See: https://docs.medusajs.com/resources/architectural-modules/notification
    {
      key: Modules.NOTIFICATION,
      resolve: "@medusajs/medusa/notification-local",
      options: {
        channels: ["email"],
        config: {
          email: {
            from: process.env.EMAIL_FROM ?? "noreply@optic.works",
          },
        },
      },
    },

    // ===== File Module (Local for now, will switch to R2 later) =====
    {
      key: Modules.FILE,
      resolve: "@medusajs/medusa/file-local",
      options: {
        upload_dir: "uploads",
        backend_url: process.env.MEDUSA_BACKEND_URL ?? "http://localhost:9000",
      },
    },
  ],
})
