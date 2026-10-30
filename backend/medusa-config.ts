import { loadEnv, defineConfig, Modules } from "@medusajs/framework/utils"
import { env } from "./src/lib/env"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

// Fails fast, naming (never printing) any missing or malformed variable.
const e = env()

module.exports = defineConfig({
  projectConfig: {
    // Neon pooled endpoint. TLS is verified against the system CA store.
    databaseUrl: e.DATABASE_URL,
    databaseDriverOptions: {
      connection: { ssl: { rejectUnauthorized: true } },
      // min 0 lets Neon scale to zero when the store is idle.
      pool: { min: 0, max: 10, idleTimeoutMillis: 30_000 },
    },
    redisUrl: e.REDIS_URL,
    workerMode: e.MEDUSA_WORKER_MODE,
    http: {
      storeCors: e.STORE_CORS,
      adminCors: e.ADMIN_CORS,
      authCors: e.AUTH_CORS,
      jwtSecret: e.JWT_SECRET,
      cookieSecret: e.COOKIE_SECRET,
    },
  },
  admin: {
    disable: e.DISABLE_MEDUSA_ADMIN === "true",
    backendUrl: e.MEDUSA_BACKEND_URL,
    path: "/app",
  },
  modules: [
    // ===== Infrastructure (local Redis) =====
    {
      key: Modules.CACHE,
      resolve: "@medusajs/medusa/cache-redis",
      options: { redisUrl: e.REDIS_URL, ttl: 30 },
    },
    {
      key: Modules.EVENT_BUS,
      resolve: "@medusajs/medusa/event-bus-redis",
      options: {
        redisUrl: e.REDIS_URL,
        // Subscribers throw on failure so BullMQ retries them; they use
        // idempotency keys so a retry never double-sends or double-commits.
        jobOptions: {
          attempts: 5,
          backoff: { type: "exponential", delay: 5_000 },
          removeOnComplete: 1_000,
          removeOnFail: 5_000,
        },
      },
    },
    {
      key: Modules.WORKFLOW_ENGINE,
      resolve: "@medusajs/medusa/workflow-engine-redis",
      options: { redis: { redisUrl: e.REDIS_URL } },
    },
    {
      // Locking needs an explicit provider: a bare redisUrl is ignored and the
      // module falls back to in-memory locks, which break across processes.
      key: Modules.LOCKING,
      resolve: "@medusajs/medusa/locking",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/locking-redis",
            id: "locking-redis",
            is_default: true,
            options: { redisUrl: e.REDIS_URL },
          },
        ],
      },
    },

    // ===== Payments (Stripe) =====
    {
      key: Modules.PAYMENT,
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/payment-stripe",
            id: "stripe",
            options: {
              apiKey: e.STRIPE_API_KEY,
              webhookSecret: e.STRIPE_WEBHOOK_SECRET,
              capture: true,
            },
          },
        ],
      },
    },

    // ===== Tax (Stripe Tax, fails closed) =====
    {
      key: Modules.TAX,
      resolve: "@medusajs/medusa/tax",
      options: {
        providers: [
          {
            resolve: "./src/modules/stripe-tax",
            id: "stripe-tax",
            options: {
              api_key: e.STRIPE_API_KEY,
              from_country: e.STRIPE_TAX_FROM_COUNTRY,
              from_state: e.STRIPE_TAX_FROM_STATE,
              from_city: e.STRIPE_TAX_FROM_CITY,
              from_postal: e.STRIPE_TAX_FROM_POSTAL,
            },
          },
        ],
      },
    },

    // ===== Notifications (Resend) =====
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
              api_key: e.RESEND_API_KEY,
              from: e.RESEND_FROM_EMAIL,
              allowlist: e.EMAIL_ALLOWLIST,
            },
          },
        ],
      },
    },

    // ===== Files (Cloudflare R2) =====
    {
      key: Modules.FILE,
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-s3",
            id: "s3",
            options: {
              file_url: e.R2_PUBLIC_URL,
              access_key_id: e.R2_ACCESS_KEY_ID,
              secret_access_key: e.R2_SECRET_ACCESS_KEY,
              region: "auto",
              bucket: e.R2_BUCKET_NAME,
              endpoint: e.R2_ENDPOINT_URL,
              additional_client_config: { forcePathStyle: true },
            },
          },
        ],
      },
    },

    // ===== Fulfillment (EasyPost, fails closed) =====
    {
      key: Modules.FULFILLMENT,
      resolve: "@medusajs/medusa/fulfillment",
      options: {
        providers: [
          { resolve: "@medusajs/medusa/fulfillment-manual", id: "manual" },
          {
            resolve: "./src/modules/easypost-fulfillment",
            id: "easypost",
            options: {
              api_key: e.EASYPOST_API_KEY,
              origin: {
                name: e.SHIP_FROM_NAME,
                street1: e.SHIP_FROM_STREET1,
                street2: e.SHIP_FROM_STREET2,
                city: e.SHIP_FROM_CITY,
                state: e.SHIP_FROM_STATE,
                zip: e.SHIP_FROM_ZIP,
                country: "US",
                phone: e.SHIP_FROM_PHONE,
              },
            },
          },
        ],
      },
    },

  ],
})
