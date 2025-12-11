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

// Check for EasyPost configuration
// Support test/production mode toggle via EASYPOST_MODE env var
// Test mode uses test API key (EZTK*) for safe label testing without charges
// Production mode uses production API key (EZAK*) for real shipping labels
const easypostMode = process.env.EASYPOST_MODE || "production"
const easypostApiKey = easypostMode === "test"
  ? process.env.EASYPOST_TEST_API_KEY
  : process.env.EASYPOST_API_KEY

if (!easypostApiKey) {
  const keyName = easypostMode === "test" ? "EASYPOST_TEST_API_KEY" : "EASYPOST_API_KEY"
  console.warn(`[medusa-config] ${keyName} is not set. Shipping rate calculation will not work.`)
} else {
  console.log(`[medusa-config] EasyPost mode: ${easypostMode} (key prefix: ${easypostApiKey.substring(0, 4)}...)`)
}

// Stripe Tax configuration (ship-from address for tax calculations)
const stripeTaxFromCountry = process.env.STRIPE_TAX_FROM_COUNTRY
const stripeTaxFromState = process.env.STRIPE_TAX_FROM_STATE
const stripeTaxFromPostal = process.env.STRIPE_TAX_FROM_POSTAL
const stripeTaxFromCity = process.env.STRIPE_TAX_FROM_CITY
const stripeTaxSkipCommit = process.env.STRIPE_TAX_SKIP_COMMIT === "true"

if (!stripeTaxFromCountry || !stripeTaxFromPostal) {
  console.warn("[medusa-config] STRIPE_TAX_FROM_COUNTRY or STRIPE_TAX_FROM_POSTAL not set. Stripe Tax will not work.")
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

    // ===== Tax Module (Stripe Tax) =====
    {
      key: Modules.TAX,
      resolve: "@medusajs/medusa/tax",
      options: {
        providers: [
          {
            resolve: "./src/modules/stripe-tax",
            id: "stripe-tax",
            options: {
              api_key: stripeApiKey,
              from_country: stripeTaxFromCountry,
              from_state: stripeTaxFromState,
              from_postal: stripeTaxFromPostal,
              from_city: stripeTaxFromCity,
              skip_commit: stripeTaxSkipCommit,
            },
          },
        ],
      },
    },

    // ===== Notification Module (Resend) =====
    {
      key: Modules.NOTIFICATION,
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "./src/modules/resend",
            id: "resend",
            options: {
              channels: ["email"],
              api_key: resendApiKey,
              from: process.env.RESEND_FROM_EMAIL ?? "OpticWorks <notifications@optic.works>",
            },
          },
        ],
      },
    },

    // ===== File Module (Cloudflare R2) =====
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-s3",
            id: "s3",
            options: {
              file_url: process.env.R2_PUBLIC_URL,
              access_key_id: process.env.R2_ACCESS_KEY_ID,
              secret_access_key: process.env.R2_SECRET_ACCESS_KEY,
              region: "auto",
              bucket: process.env.R2_BUCKET_NAME,
              endpoint: process.env.R2_ENDPOINT_URL,
              additional_client_config: {
                forcePathStyle: true,
              },
            },
          },
        ],
      },
    },

    // ===== Fulfillment Module (EasyPost) =====
    {
      key: Modules.FULFILLMENT,
      resolve: "@medusajs/medusa/fulfillment",
      options: {
        providers: [
          // Manual provider for legacy/fallback
          {
            resolve: "@medusajs/medusa/fulfillment-manual",
            id: "manual",
          },
          // EasyPost provider for dynamic shipping rates
          {
            resolve: "./src/modules/easypost-fulfillment",
            id: "easypost",
            options: {
              api_key: easypostApiKey,
              ship_from_name: process.env.SHIP_FROM_NAME,
              ship_from_street1: process.env.SHIP_FROM_STREET1,
              ship_from_street2: process.env.SHIP_FROM_STREET2,
              ship_from_city: process.env.SHIP_FROM_CITY,
              ship_from_state: process.env.SHIP_FROM_STATE,
              ship_from_zip: process.env.SHIP_FROM_ZIP,
              ship_from_phone: process.env.SHIP_FROM_PHONE,
            },
          },
        ],
      },
    },
  ],
})
