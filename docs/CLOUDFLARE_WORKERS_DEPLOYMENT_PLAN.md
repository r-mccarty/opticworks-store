# Cloudflare Workers Deployment Plan (Node.js Runtime)

## Overview
This document outlines the steps to deploy the OpticWorks storefront to Cloudflare Workers using the Node.js-compatible runtime provided by [`@opennextjs/cloudflare`]. The plan emphasizes why the Node.js runtime is required for this project, how to prepare the application for OpenNext builds, and the Cloudflare-specific infrastructure needed to support the storefront's production workloads.

## Why the Node.js Runtime Is Required
- The storefront relies on full Node.js APIs for critical features such as Stripe payment intent creation and webhook handling (`src/app/api/stripe/*`). These modules use the official Stripe SDK, which depends on Node.js primitives that are unavailable in the Edge runtime.【F:src/app/api/stripe/create-payment-intent/route.ts†L1-L108】
- Email workflows (`src/lib/email/*`) render transactional templates with `@react-email/render`, which expects Node.js streams and Buffer support. Running them in an Edge context would require substantial refactors that are avoided when targeting the Node.js runtime.【F:src/lib/email/templates/OrderConfirmation.tsx†L1-L120】
- The project does not currently declare any `export const runtime = "edge"` overrides, so staying on the default Node.js runtime keeps behavior consistent across all routes while maximizing compatibility.【F:src/app/layout.tsx†L1-L120】

Because of these dependencies, the deployment must target the Node.js runtime supported by Cloudflare Workers rather than the Edge-only runtime exposed by `@cloudflare/next-on-pages`.

## Prerequisites
1. **Tooling**
   - Install `wrangler` globally or use `npx wrangler` for running and publishing the worker.
   - Add `@opennextjs/cloudflare` as a dev dependency: `pnpm add -D @opennextjs/cloudflare`.
   - Ensure the repository continues to use `pnpm` for all package scripts.
2. **Accounts & Services**
   - Cloudflare account with Workers enabled.
   - Optional: Cloudflare R2 bucket if migrating media assets away from the current R2 endpoint used by Next Image optimization (`pub-e97850e2b6554798b4b0ec23548c975d.r2.dev`).
   - Stripe account with production keys configured as Cloudflare Worker secrets.
   - Email provider credentials (Resend) stored as Worker secrets for `src/app/api/email` and transactional flows.
3. **Local Environment**
   - Node.js 18+.
   - Access to environment variables currently defined in Vercel/Env files so they can be duplicated as Worker secrets (`STRIPE_SECRET_KEY`, `RESEND_API_KEY`, etc.).

## Build & Runtime Configuration
1. **Introduce OpenNext configuration**
   - Create `opennext.config.mjs` to define Cloudflare-specific settings:
     ```js
     import { defineConfig } from "@opennextjs/cloudflare";

     export default defineConfig({
       outDir: ".open-next",  // matches wrangler entry point
       // Enable Node.js runtime features exposed by Workers
       worker: {
         name: "opticworks-storefront",
         compatibilityDate: "2025-01-01",
         compatibilityFlags: ["nodejs_compat"],
       },
       images: {
         // Disable Next default optimizer since Workers edge runtime cannot run sharp
         // or configure Cloudflare Image Resizing if needed
         format: "pass-through",
       },
     });
     ```
   - The compatibility flag ensures the Worker runs in the Node.js-compatible environment rather than the Edge-only runtime.
2. **Adjust Next.js config if required**
   - Confirm `next.config.ts` does not enable experimental edge features. If future code adds route-level runtime overrides, ensure they continue to opt into `"nodejs"` to remain compatible with the Worker platform.
   - If image optimization is necessary, plan to switch to Cloudflare Image Resizing or continue using remote patterns as configured.
3. **Define Worker routing**
   - Add a `wrangler.toml` with bindings for secrets and durable objects (if introduced later). Minimal example:
     ```toml
     name = "opticworks-storefront"
     main = ".open-next/worker.js"
     account_id = "<CLOUDFLARE_ACCOUNT_ID>"
     compatibility_date = "2025-01-01"
     compatibility_flags = ["nodejs_compat"]

     [vars]
     NEXT_TELEMETRY_DISABLED = "1"

     [env.production.vars]
     STRIPE_SECRET_KEY = "${STRIPE_SECRET_KEY}"
     RESEND_API_KEY = "${RESEND_API_KEY}"
     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = "${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}"
     NEXT_PUBLIC_SITE_URL = "${NEXT_PUBLIC_SITE_URL}"
     ```
   - Use `wrangler secret put` for sensitive values so they are not committed.

## Build Pipeline
1. **Local build**
   - `pnpm install` to ensure dependencies are up to date.
   - `pnpm run lint` and `pnpm run build` to validate the Next.js project before packaging.
   - `pnpm dlx @opennextjs/cloudflare build` produces the Worker bundle inside `.open-next/`.
2. **Preview**
   - `wrangler dev --env production` serves the Worker locally using the Node.js compatibility layer. Verify critical flows: product listing, cart, checkout, Stripe test payments, email preview endpoints.
3. **Deploy**
   - `wrangler deploy --env production` publishes the Worker.
   - Configure a Cloudflare Pages or DNS route to map the storefront domain to the Worker using `routes = ["example.com/*"]` in `wrangler.toml` if serving from a custom domain.

## Platform Integrations
- **Stripe Webhooks**
  - Configure `wrangler.toml` to expose the webhook endpoint route generated by OpenNext (typically `/api/stripe/webhook`).
  - Use `wrangler tail` or Cloudflare Logs to monitor webhook execution.
- **Email (Resend)**
  - Confirm the Worker has network access to Resend endpoints. Store API keys as secrets.
  - If rendering large email templates becomes constrained by Workers limits, consider prerendering templates during build and shipping them as assets.
- **Analytics & External APIs**
  - Verify `src/app/api/analytics` and `src/app/api/easypost` calls remain within Workers HTTP fetch capabilities.
  - For any Node-specific modules (e.g., `@easypost/api`), verify they are compatible with Cloudflare's Node.js runtime; if not, replace with REST fetch calls.

## Observability & Operations
- Enable Cloudflare Worker metrics and logs for error tracking.
- Integrate with existing monitoring (e.g., Logflare, Sentry) using Worker-compatible SDKs that assume Node.js runtime.
- Establish a rollout checklist: secret synchronization, R2 bucket availability, domain routing, Stripe webhook reconfiguration.

## Future Enhancements
- Explore migrating static assets to Cloudflare R2 and enabling cache rules for faster delivery.
- Evaluate using Cloudflare KV/Durable Objects if persistent session data is needed beyond Zustand's client-side storage.
- Document a rollback strategy: keep Vercel deployment as fallback until Workers deployment is proven stable.

