# OpticWorks Store — Codebase Audit & Refactor Plan

**Date:** 2026-09-30
**Scope:** Storefront (`src/`), Medusa backend (`backend/`), webhook/Hookdeck infrastructure (`infrastructure/`), E2E suite (`e2e/`), deploy tooling (`infrastructure/ansible/`)
**Baseline commit:** `13b0484` on `claude/opticworks-codebase-audit-iekzs4`
**Status:** Audit only. No source code was changed. Implementation waits until this plan is reviewed and approved.

---

## 0. How to read this document

- **Severity** (High/Medium/Low) is the impact if the flaw is hit. **Priority** (P0/P1/P2) is how soon to fix it. P0 means before any refactor work starts.
- `file:line` references point at the audited commit.
- **Verified** marks behavior I checked against the installed Medusa 2.12 source in `backend/node_modules`, not just recalled.
- **⚠ Config-dependent** marks findings whose real-world impact depends on runtime configuration I can't see from the repo: Cloudflare Worker secrets, Hookdeck destinations, production `.env`. These need a quick check by someone with dashboard access.

### Baseline results

| Check | Command | Result |
|---|---|---|
| Lint | `pnpm run lint` | ✅ Pass with 2 warnings (unused vars at `src/app/api/stripe/webhook/route.ts:369`, `src/components/checkout/CheckoutForm.tsx:48`). `next lint` is deprecated as of Next 16. |
| Unit tests | `pnpm run test` | ✅ 5/5 pass, but in **one** test file (`src/lib/cart/utils.test.ts`). No tests cover checkout, API routes, hooks, webhooks or money math. |
| Storefront typecheck | `pnpm exec tsc --noEmit` | ❌ **8 real errors in `src/`**: `validate-address` route ×4, `ContactForm.tsx` ×2, `Footer.tsx` ×2. There are also 136 errors from `backend/`, which the root `tsconfig.json` sweeps in (`"include": ["**/*.ts"]`). Builds hide all of this through `ignoreBuildErrors: true`. |
| Backend install | `pnpm install --frozen-lockfile` (in `backend/`) | ❌ **Lockfile out of sync**: 17 dependencies in `package.json` are missing from `backend/pnpm-lock.yaml`. |
| Backend typecheck | `tsc --noEmit` (backend, own deps) | ✅ 0 errors. The config is not `strict` (only `strictNullChecks`). |
| Backend tests | — | One integration test (`/health`). No unit tests. Not run because it needs Postgres. |
| E2E | not run | `playwright.config.ts:37` targets **production** (`https://optic.works`) by default and would create real orders. |
| CI | `.github/workflows/*` | Only AI review bots (hammer/anvil/forge). **Nothing runs lint, typecheck, tests or a build** before `main` auto-deploys. |

---

## 1. Executive Summary & Health Score

The architectural choices are sound. Medusa v2 is the commerce source of truth, the storefront uses Stripe's deferred-intent pattern to avoid remounting Elements, Hookdeck buffers webhooks, auth uses httpOnly cookies behind a BFF, and the storefront uses Workers-safe Stripe/EasyPost clients (fetch + SubtleCrypto). The team also has a healthy postmortem habit.

The implementation around those choices is fragile. The storefront is still partly the "Solar" template (`package.json` name `template-solar`, Tesla window-tint pages and SKUs). It carries a layer of **public API routes that hold server secrets but have no authentication**. The money path has several ways to **charge a customer without producing a correct order**. Nothing in the pipeline catches regressions.

### Health score: **3.5 / 10**

| Dimension | Score | Summary |
|---|---|---|
| Architecture fundamentals | 7/10 | Right stack and patterns; boundaries between storefront, BFF and Medusa are blurred |
| Security | 2/10 | Unauthenticated admin-key route, IDOR on saved cards, serial-only device pairing, insecure secret fallbacks, possibly real secrets committed |
| Payment & order integrity | 3/10 | Auto-capture happens before order validation; redirect flow shows false success; displayed total can differ from the charged amount; Stripe Tax lines are misreported |
| Reliability & operations | 3/10 | No DB migrations in deploy; lockfile drift; downtime on every deploy; webhooks swallow errors |
| Code quality & maintainability | 4/10 | About 27% of storefront code is unreferenced; god components; string-matched errors; many hard-coded values |
| Test & pipeline health | 2/10 | No CI gates; 5 unit tests; E2E runs against production with 48 hard sleeps and silent skips |

### Top 3 technical risks

1. **Privileged surface open to the internet (security, P0).**
   - `POST /api/fulfillment/create-label` has no authentication. It uses `MEDUSA_ADMIN_API_KEY` to create fulfillments on any order ID, and can buy EasyPost labels.
   - Any logged-in customer can detach *any* Stripe payment method by ID.
   - Any logged-in customer can claim any shipped RS-1 presence sensor by serial number.
   - The backend falls back to `"supersecret"` for `JWT_SECRET`/`COOKIE_SECRET`.
   - A committed Ansible vars file appears to contain real JWT/cookie secrets.
2. **Money-path correctness (P0/P1).**
   - Stripe captures funds in the browser *before* Medusa validates the cart. Validation failures before authorization (missing shipping method, out of stock) leave a captured charge with no order and no automatic refund (**Verified**).
   - Redirect-based confirmations never complete the cart client-side, and the success page says "Your payment was successful" without checking `redirect_status`.
   - The final PaymentIntent amount is never reconciled with the displayed total.
   - The Stripe Tax provider sends unit prices where Stripe expects line totals, so committed tax transactions under-report every multi-quantity line.
3. **No safety net (P1).**
   - No CI gate. Builds ignore type errors; a shipped API route is broken today.
   - The backend lockfile is out of sync, and deploys don't use `--frozen-lockfile`.
   - **No DB migrations exist or run** anywhere in deploy tooling.
   - Several customer-facing flows are **silent-success stubs**: the contact form, warranty claims, refund requests and order lookup show success while doing nothing.

---

## 2. Critical Bugs & Flaws Log

### 2.1 Security

| ID | Sev | Pri | Location | Finding | Why it's broken / impact |
|---|---|---|---|---|---|
| S1 | High | P0 | `src/app/api/fulfillment/create-label/route.ts:5-6, 41-57, 88-130, 158-231` | Unauthenticated route that uses `MEDUSA_ADMIN_API_KEY` to POST `/admin/orders/{id}` and `/admin/orders/{id}/fulfillments`, and `EASYPOST_API_KEY` to buy labels. | Anyone can mark any order fulfilled and overwrite its tracking metadata. A `shipmentId` starting with `mock_` (`:175-197`) skips EasyPost entirely. With a real shipment and rate ID, anyone can buy labels on the company account. The route has **no callers** (`src/lib/api/fulfillment.ts` is itself unused). ⚠ Config-dependent: full impact requires those secrets to be set on the Worker. |
| S2 | High | P0 | `backend/medusa-config.ts:74, 79-80, 144-145` | `ensure("JWT_SECRET", "supersecret")` and `ensure("COOKIE_SECRET", "supersecret")`. The fallback means `ensure` can never throw. Stripe falls back to `sk_test_missing`/`whsec_missing`. | If an env var is ever missing (bad template render, new host), Medusa boots with a public JWT secret. Anyone could then forge customer **and admin** tokens. Config errors should fail at boot, not degrade silently. |
| S3 | High | P0 | `infrastructure/ansible/group_vars/secrets.yml.phase2-baseline:13-14` | A committed vars file holds 64-hex `jwt_secret`/`cookie_secret` values, not `CHANGE_ME` placeholders like the `.example` file. I didn't inspect it further. | If these values were ever used in any environment, treat them as compromised: rotate, remove from `HEAD`, and decide whether to purge git history. This conflicts with the "Never commit secrets" rule in `CLAUDE.md`. |
| S4 | High | P0 | `backend/src/api/store/customers/me/payment-methods/route.ts:136-163` | DELETE checks only that the caller *has* an account holder, then calls `stripe.paymentMethods.detach(paymentMethodId)` with the platform key. | Classic IDOR: any authenticated customer (registration is open) can detach **any** customer's saved card if they know the `pm_` ID. Fix by retrieving the PaymentMethod and checking `pm.customer === accountHolder.data.id`. |
| S5 | High | P0 | `backend/src/api/store/devices/pair/route.ts:90-132`, `backend/src/modules/device/service.ts:70-94` | Pairing needs only a serial number and a logged-in customer. The check-then-update has no lock. | Serials come from `/proc/cpuinfo`, are printed on packaging, and are guessable. Anyone can claim a shipped presence sensor before its buyer does and route occupancy telemetry to their own account; the real buyer gets `409`. Two concurrent pairings can both succeed. Pairing needs proof of possession (an on-device code or `temp_token`) or an order-ownership check. |
| S6 | Medium | P0 | `src/app/api/stripe/create-checkout-session/route.ts:38-131`, `src/app/api/stripe/get-session-tax/route.ts:23-91`, `src/app/api/easypost/suggest-address/route.ts:4-37`, `src/app/api/order-details/route.ts:26-78`, `src/app/api/analytics/events/route.ts:117` | Five public routes with **no callers** that still run with server secrets. | `create-checkout-session` accepts **client-supplied prices** and creates live Checkout Sessions, which is a card-testing vector. `get-session-tax` and `suggest-address` burn billable or rate-limited Stripe Tax and EasyPost calls with no rate limit. `order-details` returns customer name, email and total for any `payment_intent` ID. `analytics/events` GET returns stored `userEmail` values. |
| S7 | Medium | P1 | `src/app/api/stripe/webhook/route.ts:103, 150, 176, 212, 364`; `backend/src/modules/easypost-fulfillment/service.ts:316, 348`; `src/lib/api/medusa.ts:234`; `wrangler.jsonc:19` | Full webhook events, PaymentIntents, customers and addresses are logged as pretty-printed JSON. Every Medusa request logs its headers. Workers logs sample at 100%. | Customer PII (names, emails, addresses) lands in Cloudflare and PM2 logs with no retention policy. The volume also increases Workers log costs. |
| S8 | Medium | P1 | `src/lib/rate-limit.ts:8`; `src/app/api/auth/forgot-password`, `reset-password` | The rate limiter is an in-memory `Map` per Worker isolate. Password-reset routes have no limit at all. | Workers spread requests across many short-lived isolates, so the limit barely applies. Use Cloudflare WAF rules or the Workers Rate Limiting binding. |
| S9 | Medium | P1 | `src/app/api/auth/logout/route.ts:10`, `login/route.ts:46`, `me/route.ts:30` | Logout only deletes the cookie; the Medusa JWT stays valid until it expires. Error handling classifies failures by `message.includes('401')`. | A stolen token survives logout. String-matched error handling breaks silently when upstream message formats change. |
| S10 | Low | P2 | `src/lib/webhook-verification.ts:61-67`; `infrastructure/hookdeck-transformations/easypost-verify/src/index.js:17, 25-26` | Storefront HMAC comparison uses `===`, which is not constant-time. The EasyPost transformation signs `JSON.stringify(request.body)` (a re-serialization) and puts the **expected** signature in its error message. | Timing leak (minor). Re-serialized JSON can drop legitimate events. Echoing the expected HMAC is an information leak into Hookdeck logs. |
| S11 | Low | P2 | `backend/instrumentation.ts:43-50` | Sentry scrubbing removes only the `authorization`, `cookie` and `x-api-key` headers. | `x-medusa-access-token` (admin key, sent by S1), `event.request.cookies` and request bodies are not scrubbed. Login bodies contain passwords; check Sentry's request-data defaults. |
| S12 | Low | P2 | `public/_headers`, `next.config.ts` | No CSP, HSTS, `frame-ancestors` or `Referrer-Policy`. | The checkout page can be framed (clickjacking). There is no defense-in-depth against injected scripts on a payment page. |

### 2.2 Checkout, Payments & Tax

| ID | Sev | Pri | Location | Finding | Why it's broken / impact |
|---|---|---|---|---|---|
| P1 | High | P0 | `backend/medusa-config.ts:146` (`capture: true`), `src/components/checkout/CheckoutForm.tsx:242-275` | Stripe confirms with automatic capture in the browser, and only then does the client call `completeCart`. | Medusa's `compensatePaymentIfNeededStep` refunds only when a `payment` record with `captured_at` exists. That record is created in `authorizePaymentSessionStep`, *after* `validateShippingStep` and the inventory/line-item validations (**Verified** in `core-flows/dist/cart/workflows/complete-cart.js:285-495`). A validation failure, such as out of stock or a missing shipping method, leaves **a captured charge with no order and no automatic refund**. The Medusa webhook retry hits the same failure. |
| P2 | High | P0 | `CheckoutForm.tsx:246`, `src/app/store/cart/success/page.tsx:39-47, 274-300` | Redirect-based confirmations (3DS redirect, wallets) return to `/store/cart/success?payment_intent=pi_…&redirect_status=…`. The page never reads `redirect_status`, never completes the cart, and for any non-`order_` ID shows **"Your payment was successful"**. | Failed redirect payments see a success page. Successful ones depend entirely on the Medusa Stripe webhook to create the order (see W1). The local cart and the `medusa_cart_id` cookie still point at the (possibly completed) cart. |
| P3 | High | P0 | `CheckoutForm.tsx:228-233` vs `:145, :474` | On submit, the client posts the full shipping address with name and phone, which re-runs Medusa's shipping and tax refresh. It then creates the PaymentIntent for whatever the new total is, without comparing it to the `Pay $X` the user clicked. | The customer can be charged a different amount than displayed, for example after tax recalculates on the full address or a calculated shipping price refreshes. |
| P4 | High | P1 | `backend/src/modules/stripe-tax/service.ts:183-199` | Stripe Tax `line_items[].amount` is sent as the **unit price** alongside `quantity`. | Stripe defines `amount` as the **line total**; `quantity` only derives a unit price. Medusa applies the returned *rate* to the full line, so the customer's charge is roughly right. But every `createFromCalculation` commit (`backend/src/subscribers/stripe-tax-commit.ts:144`) **under-reports taxable sales and tax collected** by a factor of the quantity, and amount-threshold rules are evaluated on the wrong amount. This is a tax-filing compliance issue. |
| P5 | High | P1 | `src/hooks/useMedusaShipping.ts:321-337, 404-423` | The auto-selected rate is set in UI state immediately, while `addShippingMethod` runs fire-and-forget with errors only logged. `selectRate` also keeps the selection when the API call fails. | The Pay button is enabled while the cart has **no shipping method**. Combined with P1, completion fails *after* capture. |
| P6 | Medium | P1 | `useMedusaShipping.ts:237-257` | An `AbortController` is created, but its `signal` never reaches `fetch` (`medusaFetch` doesn't accept one). | "Cancel stale requests" does nothing. A slow response for an old address can overwrite rates for the new one. |
| P7 | Medium | P1 | `useMedusaShipping.ts:321, 351` | `selectedRate` persists across address changes, and auto-select only runs `if (!selectedRate)`. | After an address change, the UI shows the old rate and amount while Medusa has recalculated or removed the method. This feeds into P3. |
| P8 | Medium | P1 | `CheckoutForm.tsx:281-314` | After polling fails, `finally` re-enables Pay. A resubmit calls `createMedusaPaymentSession(cartId, true)`. | Medusa's `createPaymentSessionsWorkflow` deletes existing sessions in parallel (**Verified**). A second submit either gets a 500 ("Could not delete all payment sessions", which is documented in `STRIPE_INTEGRATION.md`) or a **second PaymentIntent**, risking a double charge. |
| P9 | Medium | P1 | `backend/src/modules/stripe-tax/service.ts:149-157` | Any Stripe Tax error returns zero-tax lines ("fail-open for better UX"). | Orders complete without collecting tax during a Stripe outage, and the merchant absorbs the liability. There is no flag on the order for review. |
| P10 | Medium | P1 | `backend/src/modules/easypost-fulfillment/service.ts:226-228, 245-248, 285-287, 299-302` | `calculatePrice` returns `calculated_amount: 0` on unknown option, missing address, no matching rate, or any exception. | Shipping is free whenever EasyPost is slow or down. The storefront hides $0 options in the listing, but the cart-refresh path (P3) applies them. The provider should throw so Medusa rejects the method. |
| P11 | Medium | P1 | `easypost-fulfillment/service.ts:527-536, 60-69, 402-420` | `findMatchingRate` falls back to the carrier's cheapest rate when the exact service is missing. The origin address silently defaults to EasyPost's San Francisco test address. `cancelFulfillment` returns `{cancelled:false}` instead of throwing. | A customer who pays for 2Day can get a Ground label. A missing env var buys labels with the wrong ship-from address. Medusa marks a fulfillment canceled while the label is never refunded. |
| P12 | Medium | P2 | `backend/src/subscribers/stripe-tax-commit.ts:144, 184` | Commit failures are logged and swallowed, with no retry. Refunds and cancellations never create Stripe Tax reversals. | Stripe Tax reporting silently drifts from reality in both directions. |
| P13 | Low | P2 | `CheckoutForm.tsx:93-107` | `handleSelectRate` computes the Elements amount from local `subtotal` plus a stale `taxAmount` closure. The comment acknowledges this. | The displayed amount is briefly wrong and gets overwritten by the effect at `:109-119`. It's noise, but it's the same class of bug as P3. |
| P14 | Low | P2 | `src/app/api/stripe/webhook/route.ts:105-151` | The "PRIMARY and ACTIVE" handler processes `checkout.session.*`, but the active flow uses Medusa PaymentIntents. It writes to a Supabase `test_orders` table. | This is dead code that looks authoritative and misleads anyone debugging payments. |

### 2.3 Cart, Session & State

| ID | Sev | Pri | Location | Finding | Why it's broken / impact |
|---|---|---|---|---|---|
| C1 | High | P1 | `src/hooks/useAuth.ts:94-100, 150-157` | After login or registration the client calls `POST /store/carts/{id}` with `customer_id`, publishable key only. | Medusa 2.12's `UpdateCart` schema is `.strict()` and has no `customer_id` (**Verified**, `api/store/carts/validators.js:37-47`), so this **always returns 400** and is swallowed. Carts are never linked to customers: orders don't show in account history and saved cards aren't used. The supported route is `POST /store/carts/{id}/customer` with the customer's bearer token. |
| C2 | Medium | P1 | `src/hooks/useCart.ts:59, 215, 276, 305`, `src/lib/api/medusa.ts:158` | Cart items are keyed by `product_id`, not by variant or line item. Optimistic items use `product.id` (the **handle**), while synced items use Medusa's `product_id` (`prod_…`). | Two variants of one product collide: remove deletes both locally, quantity edits the wrong line, and React keys duplicate. Adding the same product after a sync creates a duplicate optimistic row, and `productCache` lookups never hit. |
| C3 | Medium | P1 | `useCart.ts:124-164, 249-261` | No in-flight dedupe for cart creation. `addToCart`, `initializeCart` (`CartPage`) and `CheckoutWrapper` can each create a cart concurrently. | Orphaned carts and items added to the "losing" cart vanish, which shows up as intermittent empty carts. |
| C4 | Medium | P1 | `useCart.ts:274-329` | Optimistic remove and update have no rollback and no ordering. Failures only log, and `syncStatus` isn't set. | Rapid +/+/+ clicks race; the last *response* to arrive wins even if it's stale. The UI diverges from the server cart, and the server cart is what gets charged. |
| C5 | Medium | P1 | `src/components/store/CartPage.tsx:111-137, 213` | Totals refresh only when `items.length` changes, and the displayed subtotal prefers `cartTotals.subtotal`. | Changing a quantity leaves a **stale subtotal and total** on screen. |
| C6 | Medium | P2 | `useCart.ts:144-146`, `src/lib/api/medusa-server.ts:34-78, 85-92` | Any error restoring the cart, including a network blip, creates a brand-new empty cart. SSR returns **completed** carts; `isValidCartSSR` exists but nothing uses it. | Users lose their carts. After a redirect checkout (P2), the store hydrates a completed cart and every later add fails. |
| C7 | Low | P2 | `src/hooks/useAuth.ts:224-232` | `useAuthInit` fires network calls in the render body. It's currently unused. | Wiring it up would cause a render→fetch→setState→render loop, the same class of bug as the Dec-07 postmortem. Delete it. |
| C8 | Low | P2 | Cart state spread across `localStorage` (`cart-storage`), a non-httpOnly `medusa_cart_id` cookie and Zustand | Three sources of truth with no reconciliation rule. | Clearing one but not the others produces confusing, hard-to-reproduce states. |

### 2.4 Webhooks, Fulfillment & Backend Workflows

| ID | Sev | Pri | Location | Finding | Why it's broken / impact |
|---|---|---|---|---|---|
| W1 | High | P0 | `docs/reference/STRIPE_INTEGRATION.md:118`, `backend/medusa-config.ts:26-29` | Order creation for redirect flows and the "polling fallback" depends on Stripe → Hookdeck → Medusa `/hooks/payment/{provider}`. The docs name the path `/hooks/payment/stripe`, but the provider ID is `stripe_stripe` (`pp_stripe_stripe`). | Medusa's webhook route **returns 200 before processing** and handles the event asynchronously (**Verified**, `api/hooks/payment/[provider]/route.js`). A wrong path or secret therefore fails *silently*: Hookdeck shows success, no order is created, and the customer has been charged. ⚠ Config-dependent: confirm the Hookdeck destination is `/hooks/payment/stripe_stripe` and that `STRIPE_WEBHOOK_SECRET` is set in the backend `.env`. |
| W2 | Medium | P1 | `src/app/api/stripe/webhook/route.ts:289-295, 450-455`; `backend/src/api/webhooks/easypost/route.ts:282-290`; `backend/src/workflows/handle-easypost-event.ts:103-106` | Handlers catch everything and return 200. The lookup step converts DB errors into "not found". | Hookdeck's retries never run for transient failures, so a Postgres blip permanently loses a tracking update. Return 5xx for transient errors and 2xx only for permanent or ignorable ones. |
| W3 | Medium | P1 | `handle-easypost-event.ts:78-88` | `fulfillmentService.listFulfillments({})` loads **every fulfillment** on every event and filters in memory with `data.tracking_code === input.trackingCode`. | This is O(n) per webhook. With no payload validation, a payload missing `tracking_code` matches any fulfillment whose `data` lacks it (`undefined === undefined`). Add Zod validation and an indexed lookup. |
| W4 | Medium | P1 | `handle-easypost-event.ts:165, 196, 208`; `backend/src/modules/resend/service.ts:26` | Shipped and delivered states are written straight to the fulfillment module, bypassing Medusa order workflows. An `order.shipped` email template is registered, but **no subscriber triggers it**. | The order's fulfillment status and `shipment.created`/`delivery.created` events never update, so admin shows stale state. **Shipping-confirmation emails never send.** The create-label route's log line claiming "order.shipped email will be triggered" is false. |
| W5 | Low | P2 | `backend/src/api/middlewares.ts:32-34` | The raw body is built by concatenating `chunk.toString("utf8")` per chunk, with no size limit. | A multi-byte character split across chunks corrupts the body, so the signature fails and the event is lost. Unauthenticated memory growth is possible. Use `Buffer.concat` plus a cap. |
| W6 | Low | P2 | `handle-easypost-event.ts:188-211` | `delivered` rewrites `delivered_at` on every duplicate event, and the `in_transit` then `delivered` sequence isn't transactional. | Timestamps drift, and a partial failure leaves the fulfillment shipped but not delivered with no retry (see W2). |
| W7 | Low | P2 | `backend/src/modules/device/models/device.ts:22-24`; `backend/src/api/admin/devices/route.ts:42-50` | `cloud_token` and `temp_token` are stored in plaintext and returned by the admin list. The count is computed by loading all rows. | Anyone with DB or admin access gets working device bearer tokens. Store hashes and compare. |

### 2.5 Build, Deploy, Tests & Pipeline

| ID | Sev | Pri | Location | Finding | Why it's broken / impact |
|---|---|---|---|---|---|
| O1 | High | P1 | `.github/workflows/`, `next.config.ts:9-14` | No CI job runs lint, typecheck, tests or a build. The build sets `ignoreBuildErrors` and `ignoreDuringBuilds`. Pushing to `main` auto-deploys. | Type errors ship to production. See O2 for a live example. |
| O2 | Medium | P1 | `src/app/api/easypost/validate-address/route.ts:3-19` | Imports `checkRateLimit`, `getClientIP`, `rateLimitHeaders` and `RATE_LIMITS`, none of which exist in `@/lib/rate-limit`. | `getClientIP(...)` runs *before* the `try`, so every request throws a TypeError and returns 500. The hidden type error is a live bug. The route has no live callers: its only caller, `useAddressValidation`, is itself unused. |
| O3 | High | P1 | `backend/pnpm-lock.yaml`, `infrastructure/ansible/playbooks/medusa-deploy.yml:54`, `backend/package.json` | The lockfile is missing 17 dependencies. Deploy runs `pnpm install --ignore-workspace` without `--frozen-lockfile`. `@medusajs/*` versions mix exact pins (`2.12.0`) and carets (`^2.12.0` on `dashboard` and `draft-order`). | Production installs whatever resolves on deploy day. Medusa packages can drift out of lockstep, and nobody can reproduce a known-good build. |
| O4 | High | P1 | `infrastructure/ansible/**`, `backend/src/modules/device/` | **No migrations anywhere.** There's no `medusa db:migrate` in deploy or provision, and no migration files for the custom `device` module or the `device ↔ customer` link. | The `device` table exists only if someone created it by hand. Any Medusa upgrade (see O3) runs against an unmigrated schema. |
| O5 | Medium | P2 | `medusa-deploy.yml:22-35, 88-100` | `rsync --delete` into the live app directory, build in place, then `pm2 delete` plus `pkill -9`. | Guaranteed downtime on every deploy, the running process can read half-synced files, and there's no rollback path. |
| O6 | Medium | P1 | `playwright.config.ts:37`, `e2e/**` | E2E targets production by default. It has 48 hard sleeps (`waitForTimeout`) plus ad-hoc `setTimeout` polling, 14 conditional `test.skip`s that pass when env vars are missing, and runs only on Chromium. The 3DS test card is defined (`e2e/fixtures/test-data.ts:117`) but never used. | Tests create orders in production. They're slow and flaky by design, a missing env var turns coverage into green skips, and redirect/3DS flows (P2) are never exercised. |
| O7 | Medium | P1 | `tsconfig.json:28` | The root `include: ["**/*.ts", ...]` sweeps in `backend/` and `e2e/`. | `tsc` at the root can't be a CI gate without first excluding `backend/`, which has its own dependencies and config. |
| O8 | Low | P2 | `package.json:26-27`, `next.config.ts:8`, `pnpm-workspace.yaml` | Scripts `cd services/medusa`, which doesn't exist. A comment cites a non-existent `docs/PHASE2_INTEGRATION_SUMMARY.md`. The workspace globs `services/*`. | Broken developer tooling and misleading references. |
| O9 | Medium | P2 | `sentry.client.config.ts`, `next.config.ts:39-40` | Storefront Sentry is client-only. | Errors in API routes, SSR and webhooks go only to Workers logs, with no alerting. |

### 2.6 Product Integrity, Tech Debt & Design System

| ID | Sev | Pri | Location | Finding | Why it's broken / impact |
|---|---|---|---|---|---|
| U1 | High | P0 | `src/app/api/email/send/route.ts:80-94`, `src/components/support/ContactForm.tsx:194-241`, `src/components/support/WarrantyClaimForm.tsx:90-98` | The contact form posts to a stub that returns `success: true` and a fake `messageId`. The warranty form waits 2 s and `console.log`s the claim. | **Customer support requests and warranty claims are silently dropped** while the UI confirms submission. |
| U2 | High | P0 | `src/app/support/orders/page.tsx:22`, `src/app/support/billing/page.tsx:24`, `src/lib/api/orders.ts:179-207`, `src/lib/api/billing.ts:152-405` | Order lookup, invoices, refund requests, payment retries and billing disputes all run on hard-coded stub data with `setTimeout` delays. | Real customers can't find real orders, and refund or dispute submissions go nowhere while reporting success. This is a trust and potentially consumer-protection risk. |
| U3 | Medium | P2 | ~64 unreferenced modules (**~7.6k of ~28k storefront lines, ~27%**; heuristic import scan), `src/lib/email/templates/*.disabled`, unused KV binding `SHIPPING_RATES_CACHE` (`wrangler.jsonc`), unused deps (`@easypost/api`, `dotenv`, `@upstash/qstash`, `@supabase/supabase-js` only for `test_orders`) | Template and prototype residue. | Slower builds and reviews. Dead code looks "live": `circuit-breaker.ts` is documented as a protection layer in `ARCHITECTURE.md` but nothing imports it, and there's no backend equivalent. |
| U4 | Medium | P2 | `src/app/api/inventory/check/route.ts:20-49`, `src/app/install-guides/cybershade-irx-tesla-model-y/`, `src/app/support/legal/tinting-laws/`, `src/lib/api/tintingLaws.ts`, `src/lib/products.ts` (`vlt` field), `package.json` (`template-solar`) | Tesla window-film SKUs, inventory and legal pages from a different business are still routed. | Brand confusion, SEO pollution, and an inventory API that reports mock stock. |
| U5 | Medium | P2 | `src/lib/api/medusa.ts:275-315` | Any Medusa error silently falls back to the static catalog with hard-coded prices and no `variantId`. | Shoppers see possibly stale prices, and "Add to cart" then fails with "missing required data". Degraded mode should be explicit (a banner, disabled purchase). |
| U6 | Low | P2 | `tailwind.config.js` with no `@config` in `src/app/globals.css`; `src/app/layout.tsx:157` | Tailwind v4 ignores the JS config. The app forces the `.dark` class, but no `@custom-variant dark` is declared. | Custom tokens in the JS config (e.g. `amber-450/550`, font stacks) never apply. The 20 `dark:` utilities follow the **OS** preference rather than the forced theme, so light-OS users get light-variant styling on a dark UI. |
| U7 | Low | P2 | `src/components/Button.tsx` and `src/components/ui/button.tsx`; `class-variance-authority` and `tailwind-variants`; `framer-motion` and `motion`; 3 icon libraries; 14 arbitrary `[#hex]` classes and 41 hex literals in TSX; Stripe `colorPrimary: '#16a34a'` (`CheckoutWrapper.tsx:174`) vs brand token `--color-primary` | Duplicate primitives and libraries, plus off-token colors. | Inconsistent UI and a bigger bundle. The checkout's green accent doesn't match the brand's orange primary. |
| U8 | Low | P2 | `CheckoutForm.tsx:395, 401`, `CartPage.tsx` | Money is formatted with `toLocaleString()` and `$` string concatenation. | `$49.5` instead of `$49.50`, inconsistent between screens. |
| U9 | Low | P2 | `src/app/**` | Only `global-error.tsx` and `not-found.tsx` exist; there are no segment `error.tsx` or `loading.tsx` files. | Any server error in a segment replaces the whole root layout, including the navigation. |

---

## 3. Module-by-Module Review

### 3.1 Storefront (Next.js 15 on Cloudflare Workers)

**Workers compatibility: mostly correct.**
- `nodejs_compat` and `nodejs_compat_populate_process_env` are enabled.
- Stripe uses `createFetchHttpClient()` and `createSubtleCryptoProvider()`, and EasyPost calls use `fetch` plus `btoa`. Images are unoptimized, which suits Workers.
- `@easypost/api` (Node `https`) is still a dependency but isn't imported. Remove it so nobody imports it by accident.
- **Module-level mutable state** is unreliable on Workers because isolates are per-instance and short-lived. This affects the rate limiter (`rate-limit.ts`), the circuit breaker (`circuit-breaker.ts`), and the analytics `eventStore`. Replace these with Cloudflare primitives: the Rate Limiting binding, KV or Durable Objects, or WAF rules.
- `medusa.ts:36-46` logs at import time and `medusa.ts:234` logs headers on every request. That's log noise on a hot path.
- The `SHIPPING_RATES_CACHE` KV namespace is bound but unused.

**App Router structure and RSC boundaries.**
- 97 of 141 TSX files are Client Components, and 9 `page.tsx` files are entirely client-side (`/account`, `/auth/*`, `/store/cart/success`, three `/support/*` pages).
- `CartPage.tsx` (529 lines) is a god component that combines display, totals fetching, two effects racing the store, and checkout mounting.
- Data fetching is split between an SSR `fetch` (`medusa-server.ts`) and a different client `fetch` wrapper (`medusa.ts`). The two duplicate headers and base-URL logic.
- Caching:
  - `/store` uses `revalidate = 300`.
  - `/products/[slug]` is `force-dynamic` with no fetch caching, so every product page view hits Medusa through the tunnel.
  - No `next: { tags }` is used, so product updates can't trigger targeted revalidation, even though the R2 incremental cache and the `WORKER_SELF_REFERENCE` binding are already configured.
  - `getProductById` wrapped in React `cache()` is correct.

**State management.** Zustand for `useCart` is reasonable, but it currently acts as a *second source of truth* rather than a cache of the Medusa cart (C2–C6, C8). `useCheckoutState` exists only so `CartPage` can show tax computed inside `CheckoutForm`, which is a symptom of the implicit checkout state machine described below. `useSupportStore` is unused.

**Medusa client.** A hand-rolled `fetch` wrapper returns `response.json() as T` with no runtime validation. Errors are encoded as `"Medusa request failed (401): …"` strings, and callers use `includes('401')` to classify them. There's no `AbortSignal` support (P6), and query parameters like `handle=${id}` (`medusa.ts:304`) aren't encoded. `@medusajs/js-sdk` would provide typed calls, auth handling and consistent errors.

### 3.2 Checkout & Payments (Stripe / EasyPost / Stripe Tax)

**What's right.**
- The deferred-intent pattern is set up properly: Elements uses `mode/amount/currency`, and the PaymentIntent is created at submit time. This fixed the form-reset postmortem.
- Medusa computes the PaymentIntent amount server-side, so the client can't tamper with prices on the *active* path. The dead Checkout Session route is the exception (S6).
- Order polling replaced the blind redirect.

**What's fragile.**
- **The checkout is an implicit state machine** spread across four components, a hook and a global store, with about ten booleans and nullable fields. Invalid combinations are reachable: Pay enabled with no shipping method on the cart (P5), a stale rate after an address change (P7), and Pay re-enabled after a captured payment (P8).
- **Capture timing (P1).** Automatic capture plus client-side confirmation means money moves before Medusa has validated the cart. Medusa's own compensation can't cover failures that happen before authorization.
- **No final reconciliation (P3).** Nothing asserts that the PaymentIntent amount equals the total the customer saw.
- **Redirect path (P2, W1).** The redirect return is unhandled on the client, and the server-side fallback's wiring is unverified and fails silently.
- **Rate fetching.**
  - Calculated options take N+1 requests: one list call, then one `calculate` per option. Each `calculate` creates a new EasyPost shipment (a full rate-shop), and selecting a method creates another shipment plus an address verification (`validateFulfillmentData`).
  - Nothing caches this, and the backend has no timeouts or circuit breaker, although `ARCHITECTURE.md` lists both as "Protection Layers".
  - Failures resolve to **$0 shipping** (P10), and service matching falls back to "any rate from this carrier" (P11).
- **Tax.** The provider design is reasonable (it encodes the calculation ID in `code` because Medusa drops metadata), but it has four problems: the unit-vs-line amount bug (P4), fail-open zero tax (P9), no reversal on refund, and commit errors that are swallowed (P12). Every cart refresh also creates a new Stripe Tax calculation with no caching.

### 3.3 Backend & Workflows (Medusa v2)

**Custom modules.**
- `easypost-fulfillment` implements the provider interface correctly, but it fails open (P10), falls back to wrong services (P11), logs PII (S7), and has no timeouts. `createReturnFulfillment` is a stub.
- `stripe-tax`: see 3.2.
- `device` is a clean `MedusaService` model, but pairing authorization is broken (S5), tokens are stored in plaintext (W7), and **no migrations exist** (O4).
- `resend` is fine, but the `order.shipped` template has no trigger (W4).

**API routes.**
- They don't use Medusa's `validateAndTransformBody`/Zod pattern. Bodies are cast (`req.body as EasyPostWebhookPayload`, `req.body` destructured) and never validated.
- Authorization happens in handlers with ad-hoc checks, and the saved-card route gets it wrong (S4).
- `/store/custom` and `/admin/custom` template routes are still live.

**Workflows.**
- `handle-easypost-event` works around core workflows instead of using them (W4). It full-scans fulfillments (W3), has no compensation, and its steps swallow errors (W2).
- Subscribers (`stripe-customer-sync`, `stripe-tax-commit`, `order-placed`) catch everything, which disables the Redis event bus's built-in retry `attempts`.

**Configuration.** Secret fallbacks (S2); `EASYPOST_MODE` defaults to `production` (`medusa-config.ts:41`); and the backend `tsconfig` isn't `strict`.

### 3.4 Webhooks & External Services

| Flow | Signature verification | Payload validation | Idempotency | Retry semantics | Verdict |
|---|---|---|---|---|---|
| Stripe → Hookdeck → storefront `/api/stripe/webhook` | Hookdeck HMAC (non-constant-time) or Stripe signature ✅ | None (`JSON.parse as Stripe.Event`) | None (no `event.id` store) | Always 200 on handler error | **Delete**: handles only unused Checkout Session events |
| Stripe → Hookdeck → storefront `/api/stripe/shipping-webhook` | Same | None | None | N/A (no-op) | **Delete**: TODO stub with mock rates |
| Stripe → Hookdeck → Medusa `/hooks/payment/stripe_stripe` | Medusa Stripe provider (raw body) ✅ | Medusa core ✅ | Medusa core ✅ | 200 immediately, async processing with 3 attempts | **Keep, but verify wiring (W1)** and add reconciliation alerting |
| EasyPost → Hookdeck transform → Medusa `/webhooks/easypost` | Transform re-serializes JSON (fragile); Medusa verifies Hookdeck HMAC with `timingSafeEqual` ✅ | None (cast) | State-based only (`shipped_at`) | Always 200, so retries are disabled | **Refactor** (W2–W6) |

---

## 4. Target Refactor Architecture

### 4.1 Guiding principles

1. **Medusa is the single source of truth** for catalog, cart, totals, payment and fulfillment state. The browser *caches* server state and never *owns* it.
2. **Every trust boundary parses its input with Zod**: env vars, route bodies, webhook payloads, and the money fields of third-party responses.
3. **Money only moves after the order is valid**: authorize → complete cart → capture.
4. **No silent success.** A stub either throws `NotImplemented` or its page is hidden behind a feature flag.
5. **The storefront BFF holds no admin credentials.** It proxies only customer-scoped calls, using the customer's token.

### 4.2 Proposed directory structure

```text
opticworks-store/
├── apps/
│   ├── storefront/                     # (current repo root src/, moved when convenient)
│   │   └── src/
│   │       ├── app/
│   │       │   ├── (shop)/             # store, products, cart, checkout, success
│   │       │   │   └── checkout/
│   │       │   │       ├── page.tsx    # RSC shell: loads cart server-side
│   │       │   │       ├── error.tsx
│   │       │   │       └── loading.tsx
│   │       │   ├── (account)/          # account, auth
│   │       │   ├── (support)/          # only real, backed flows
│   │       │   └── api/                # BFF ONLY: auth/*, account/* (customer-token proxies)
│   │       ├── features/
│   │       │   ├── catalog/            # queries.ts (RSC, tagged fetch), components/
│   │       │   ├── cart/               # cart.service.ts, cart.store.ts (UI-only), schemas.ts, components/
│   │       │   ├── checkout/           # checkout.machine.ts, payment.ts, shipping.ts, components/
│   │       │   ├── account/
│   │       │   └── support/
│   │       ├── lib/
│   │       │   ├── medusa/             # sdk.ts (@medusajs/js-sdk), errors.ts (MedusaApiError), schemas.ts
│   │       │   ├── money.ts            # Money type + formatMoney (single implementation)
│   │       │   ├── env.server.ts       # zod-validated server env (fails fast)
│   │       │   ├── env.client.ts       # zod-validated NEXT_PUBLIC_* env
│   │       │   └── log.ts              # structured logger with PII redaction
│   │       └── components/ui/          # shadcn primitives ONLY (one Button, one Dialog…)
│   └── backend/                        # Medusa (current backend/)
│       └── src/
│           ├── api/
│           │   ├── store/**/route.ts + validators.ts   # zod via validateAndTransformBody
│           │   ├── admin/**/route.ts + validators.ts
│           │   └── webhooks/easypost/route.ts + schema.ts
│           ├── modules/
│           │   ├── easypost-fulfillment/   # + rate cache (Redis), timeouts, fail-closed
│           │   ├── stripe-tax/             # line-total amounts, fail-closed on completion
│           │   ├── device/                 # + migrations/, hashed tokens, pairing codes
│           │   ├── webhook-inbox/          # NEW: processed-event idempotency table
│           │   └── resend/
│           ├── workflows/
│           │   ├── fulfillment/handle-tracker-event.ts   # uses core createOrderShipmentWorkflow etc.
│           │   ├── payments/capture-on-order-placed.ts
│           │   └── tax/commit-and-reverse.ts
│           ├── subscribers/            # thin: enqueue workflow, let bus retry
│           ├── jobs/                   # reconciliation: orphan PaymentIntents, tax commits
│           └── migrations/             # committed, run on every deploy
├── packages/
│   └── contracts/                      # shared zod schemas: webhook payloads, money, API DTOs
├── infrastructure/                     # ansible (+ migrate step, release dirs), hookdeck
└── e2e/                                # targets preview/staging; @prod-smoke tag for read-only prod checks
```

Moving to `apps/` is optional and can happen last. The important part is the **`features/` split and the `lib/medusa` boundary**, which can be introduced in place.

### 4.3 Key patterns

**Type-safe boundaries (Zod).**

```ts
// lib/env.server.ts — fail fast, no fallbacks in production
const ServerEnv = z.object({
  MEDUSA_SSR_BASE_URL: z.string().url(),
  HOOKDECK_WEBHOOK_SECRET: z.string().min(32),
  // NOTE: no MEDUSA_ADMIN_API_KEY, no EASYPOST_API_KEY on the Worker
})
export const env = ServerEnv.parse(process.env)

// backend/src/api/webhooks/easypost/schema.ts
export const TrackerUpdated = z.object({
  id: z.string(),                         // evt_… → idempotency key
  description: z.literal("tracker.updated"),
  mode: z.enum(["test", "production"]),
  result: z.object({
    tracking_code: z.string().min(1),
    shipment_id: z.string().nullable(),
    status: z.enum(["pre_transit","in_transit","out_for_delivery","delivered","failure","unknown", /* … */]),
    public_url: z.string().url().optional(),
  }),
})
```

**Typed errors instead of string matching.**

```ts
export class MedusaApiError extends Error {
  constructor(public status: number, public type: string, message: string) { super(message) }
}
// callers: if (err instanceof MedusaApiError && err.status === 401) …
```

**Cart state.** The server (Medusa) owns the cart. On the client, use TanStack Query, or keep Zustand but store only the `Cart` DTO and never derived items. Rules:
- All mutations go through a **single serialized queue**, so responses can't be applied out of order.
- Cart creation is deduplicated with an in-flight promise.
- Items are keyed by **line-item ID**.
- The cart ID lives in one place: an httpOnly cookie set by a Server Action or BFF route, read by RSC.
- After login, call `POST /store/carts/{id}/customer` with the bearer token.

**Checkout as an explicit state machine** (`useReducer` or XState):

```text
idle → collectingAddress → fetchingRates → ratesReady → applyingShipping → readyToPay
readyToPay --submit--> reconciling (GET cart; assert cart.total == displayedTotal && shipping_methods.length > 0)
reconciling → creatingIntent → confirming → completing → done
confirming --requires_action/redirect--> awaitingRedirect (success page resumes: read redirect_status, complete cart idempotently)
completing --failure--> needsSupport (Pay permanently disabled, PI id shown, alert fired)
```

The Pay button renders only in `readyToPay`, which makes P3, P5, P7 and P8 unrepresentable.

**Payment safety.**
- Set the Stripe provider to `capture: false`, so the charge is only an authorization.
- Complete the cart, then capture in a workflow triggered by `order.placed`.
- If completion fails, the authorization is voided (or expires in 7 days) and the customer is never charged.
- Add a **reconciliation job**: any `payment_intent.succeeded` or `amount_capturable_updated` without an order after N minutes pages someone and auto-voids.

**Webhooks.**
- Payments are handled only by Medusa core (`/hooks/payment/stripe_stripe`). Delete the storefront Stripe routes.
- For EasyPost, Hookdeck handles delivery and retries. Medusa verifies **both** the Hookdeck HMAC and the original EasyPost HMAC over the raw bytes, parses with Zod, and records `event.id` in `webhook-inbox`, returning 2xx for duplicates.
- Transient failures return 5xx so Hookdeck retries.
- Tracker states map to core workflows (`createOrderShipmentWorkflow`, `markOrderFulfillmentAsDeliveredWorkflow`), which emit the events that drive emails.

**Error boundaries and observability.**
- Add `error.tsx` and `loading.tsx` per route group.
- Report server-side storefront errors (Sentry for Workers, or Workers Logpush plus alerts).
- Use one structured logger per side, with a redaction list (email, address, phone, `authorization`, `x-medusa-access-token`, `stripe-signature`).

**Design system.**
- Use only shadcn/ui primitives in `components/ui` with a single CVA variant system; delete the legacy `Button.tsx`, `tailwind-variants`, and either `framer-motion` or `motion`.
- Pick one icon set.
- Move all tokens into `@theme` (Tailwind v4), add `@custom-variant dark (&:where(.dark, .dark *));`, and delete `tailwind.config.js`.
- Drive the Stripe `appearance` from the same CSS tokens.

---

## 5. Phase-by-Phase Execution Plan

Every phase is incremental and ships behind the existing integrations: Stripe deferred intent, the Medusa cart API, Hookdeck and EasyPost stay in place throughout. Each phase has exit criteria and a rollback path. No phase needs a code freeze.

### Phase 0: Stop the bleeding (days 1–3, P0 security and money)

| Step | Change | Rollback |
|---|---|---|
| 0.1 | Delete unused public routes: `fulfillment/create-label`, `stripe/create-checkout-session`, `stripe/get-session-tax`, `stripe/shipping-webhook`, `order-details`, `inventory/check`, `easypost/suggest-address`, `easypost/validate-address`, `analytics/events`. Remove `MEDUSA_ADMIN_API_KEY`, `EASYPOST_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` from Worker secrets (S1, S6). | Revert the commit. None of these routes has a caller. |
| 0.2 | Fix the saved-card IDOR: retrieve the PaymentMethod and require `pm.customer === accountHolder.data.id` (S4). Add an integration test. | Revert. |
| 0.3 | Remove secret fallbacks in `medusa-config.ts` (throw when `NODE_ENV=production`). Rotate `JWT_SECRET`/`COOKIE_SECRET` (this logs out all sessions). Remove `secrets.yml.phase2-baseline` from `HEAD`, rotate anything it contains, and decide on a history purge (S2, S3). | Rotation is one-way. Schedule it in a low-traffic window. |
| 0.4 | Device pairing: require a pairing code or `temp_token` from the device, or match `device.order_id` to the customer's orders. Make the update conditional (`WHERE customer_id IS NULL`) (S5). | Feature-flag the new check. |
| 0.5 | **Verify Stripe → Medusa webhook wiring**: the Hookdeck destination must be `/hooks/payment/stripe_stripe` with the backend `STRIPE_WEBHOOK_SECRET`. Replay one test event end to end (W1). | Config only. |
| 0.6 | Hide or disable the fake support flows (contact form, warranty, `/support/orders`, `/support/billing`). Replace them with a `mailto:` link or a real ticketing link until Phase 4 (U1, U2). | Feature flag. |
| 0.7 | Stop logging full webhook payloads and headers (S7). | Revert. |
| 0.8 | Success page: read `redirect_status`, show failure or pending states honestly, and never say "payment successful" without an `order_` ID or a verified PaymentIntent status (P2, first half). | Revert. |

**Exit criteria:** an external scan shows no unauthenticated route holding a server secret; a replayed test PaymentIntent webhook creates an order in Medusa; support pages no longer claim false success.

### Phase 1: Safety net (week 1)

1. **CI (GitHub Actions) on every PR and on `main`:**
   - Storefront: `pnpm install --frozen-lockfile` → `pnpm lint` → `pnpm exec tsc --noEmit -p tsconfig.json` (after adding `"exclude": ["backend", "e2e", …]`) → `pnpm test` → `pnpm run cf:build`.
   - Backend: `pnpm install --frozen-lockfile` → `tsc --noEmit` → `medusa build` → unit tests.
   - Make CI a required check, and make Cloudflare deploy only from green `main`.
2. Remove `ignoreBuildErrors` and `ignoreDuringBuilds`, then fix the 8 type errors (O1, O2, O7).
3. Regenerate `backend/pnpm-lock.yaml`, pin **all** `@medusajs/*` packages to the same exact version, and change deploy to `pnpm install --frozen-lockfile` (O3).
4. **Migrations:** `medusa db:generate device` and commit the result. Add `pg_dump` backup → `medusa db:migrate` to `medusa-deploy.yml`, running before restart (O4).
5. E2E: default `baseURL` to a preview/staging URL, tag read-only checks `@prod-smoke`, and make missing required env a **failure** (not a skip) in CI (O6).
6. Server-side error reporting for the storefront (O9).

**Exit criteria:** a PR with a type error can't merge; a deploy from a clean checkout is byte-for-byte reproducible; a staging DB can be rebuilt from migrations.

### Phase 2: Money-path correctness (weeks 2–3)

1. Switch the Stripe provider to `capture: false` and add a `capture-on-order-placed` workflow. Keep Elements `captureMethod` consistent with it (deferred intent requires matching settings). Roll out to staging first, then production behind a flag (P1).
2. Add an **orphan-payment reconciliation job**: a PaymentIntent that succeeded or is capturable with no order after 10 minutes triggers an alert and an auto-void or refund.
3. Introduce the checkout state machine (`features/checkout/checkout.machine.ts`) inside the existing components. Gate Pay on server readiness (shipping method present) and on **total reconciliation** right before `createPaymentSession` (P3, P5, P7, P8).
4. Complete redirect flows: on return, retrieve the PaymentIntent with `payment_intent_client_secret`, then complete the cart idempotently or poll `cart.completed_at` (P2, second half).
5. Wire `AbortSignal` through the Medusa client, and key rate responses by address hash (P6).
6. Stripe Tax: send `amount = unit_price × quantity`; fail closed during cart completion (block the order and show a retry) while staying fail-open for *display*; make commits retryable; add reversals on refund and cancel (P4, P9, P12).
7. EasyPost provider:
   - Throw instead of returning $0.
   - Match the service exactly, or hide the option.
   - Require an explicit origin address.
   - Add a 5 s timeout, a Redis rate cache keyed by `(address hash, parcel)` with a short TTL, and a real circuit breaker in the backend.
   - `cancelFulfillment` should throw when the refund fails (P10, P11).
8. Cart store:
   - Key items by line-item ID and remove optimistic writes that use handles.
   - Serialize mutations and dedupe cart creation.
   - Recreate the cart only on 404 or a completed cart.
   - Link carts with `POST /store/carts/{id}/customer` (C1–C6).

**Exit criteria:** new E2E specs pass on staging:
- 3DS card `4000002500003155`
- redirect-flow return (success and failure)
- declined after shipping selection
- logged-in checkout (order appears in account)
- quantity-2 tax (Stripe Tax transaction amount matches the line total)
- double-click Pay (exactly one PaymentIntent)
- address change after rate selection (charged == displayed)
- out-of-stock at completion (authorization voided, no capture)

### Phase 3: Webhooks & fulfillment (weeks 3–5)

1. Delete the storefront Stripe webhook routes and the Supabase dependency (P14).
2. EasyPost route:
   - Build the raw body from Buffers with a size cap.
   - Verify the EasyPost HMAC in Medusa as well as in the Hookdeck transform, and drop the transform's re-serialization.
   - Parse with Zod.
   - Record idempotency in `webhook-inbox`.
   - Return 5xx on transient errors (W2, W5, S10).
3. Replace the full-scan lookup with an indexed lookup: persist `tracking_code` in a queryable column or a link table (W3).
4. Map tracker states to core order workflows; add a `shipment.created` → `order.shipped` email subscriber (W4).
5. Hash device tokens and stop returning them from the admin list (W7).

**Exit criteria:** replaying the same EasyPost event 10× produces exactly one state change; a forced DB outage during a webhook results in a Hookdeck retry and eventual success; the shipping email arrives in Mailosaur.

### Phase 4: Structural refactor (strangler fig, weeks 4–8)

The work proceeds one feature at a time, and each step is a small, reviewable PR.

1. `lib/medusa`: adopt `@medusajs/js-sdk` behind the existing function names so call sites don't change. Add `MedusaApiError` and Zod parsing of money fields. Remove string-matched error handling.
2. `lib/env.*`, `lib/money.ts` and `lib/log.ts` (with redaction), then migrate call sites.
3. `features/cart` and `features/checkout`: move logic out of `CartPage.tsx`, `CheckoutWrapper.tsx` and `CheckoutForm.tsx` into services and the state machine. The components become thin views. The cart page becomes an RSC shell with client islands.
4. Catalog: tagged `fetch` (`next: { tags: ['product:<handle>'] }`) plus ISR on product pages. A Medusa `product.updated` subscriber calls a signed revalidation endpoint. Replace the silent static-catalog fallback with an explicit degraded mode (U5).
5. Support: implement real flows with real backends:
   - Contact form → Medusa custom route (Turnstile + Resend).
   - Order lookup → rate-limited Medusa route (email + display ID) that sends a signed link.
   - Refund or return → Medusa return request.
   Delete `lib/api/orders.ts`, `billing.ts` and the stub email route (U1, U2).
6. Delete dead code (~7.6k lines), template leftovers (Tesla/tint pages, `vlt`, `template-solar`), `.disabled` files, unused dependencies, the unused KV binding, and the legacy `useAuthInit` (U3, U4, C7).
7. Design system consolidation (U6, U7, U8) and segment error/loading boundaries (U9).
8. Backend: turn on `strict: true`, add `validators.ts` for every custom route, and remove the `/custom` template routes.

**Exit criteria:** no file in `src/` over ~250 lines except generated or static content; the unreferenced-module scan returns none; every API route has a Zod schema and a test.

### Phase 5: Hardening & operations (ongoing, from week 6)

1. Rate limiting through Cloudflare (WAF rules or the Rate Limiting binding) on `/api/auth/*`, the cart and checkout endpoints, and Medusa `/store/*` via the tunnel (S8).
2. Security headers: a CSP allowing `js.stripe.com`, `*.stripe.com` frames and `challenges.cloudflare.com`, plus HSTS, `frame-ancestors 'none'` and `Referrer-Policy` (S12).
3. Token revocation on logout: short JWT TTL plus refresh, or a Medusa session store (S9).
4. Zero-downtime deploys: build into versioned release directories, run migrations, swap a symlink, and `pm2 reload` with a health gate; keep the last N releases for rollback (O5).
5. SLOs and alerts: checkout success rate, orphan payments, webhook failure rate, and EasyPost latency.
6. Test pyramid targets. **Unit** (Vitest/Jest):
   - money utilities and cart reducer/queue
   - checkout machine transitions
   - Stripe Tax mapping, including qty > 1 and zero-decimal currencies
   - EasyPost rate matching and failure modes
   - webhook schemas, signature helpers and idempotency
   - IDOR/authorization tests for every `/store/*` custom route

   **Integration**: `@medusajs/test-utils` for custom routes and workflows. **E2E**: page objects without `waitForTimeout`, using `expect.poll` and network-idle assertions on specific responses, on Chromium and WebKit, with the mobile plan from `MOBILE_E2E_TESTING_PLAN.md`.

### Sequencing summary

```text
Week:      1      2      3      4      5      6      7      8
Phase 0  ███
Phase 1   ██████
Phase 2         ████████████
Phase 3                ████████████
Phase 4                       ████████████████████████
Phase 5                                   ██████████████████ → ongoing
```

---

## Appendix A: Verification checklist for the team (config I couldn't see)

1. Which secrets are set on the `opticworks-store` Worker? Is `MEDUSA_ADMIN_API_KEY`, `EASYPOST_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` present? (S1, S6)
2. Hookdeck: what is the destination URL for the Stripe source? Is Medusa's `STRIPE_WEBHOOK_SECRET` the one for *that* Stripe endpoint? (W1)
3. Were the values in `secrets.yml.phase2-baseline` ever deployed to any environment? (S3)
4. Is `JWT_SECRET` definitely set in production `.env` (not falling back)? (S2)
5. Does the `device` table exist in production, and how was it created? (O4)
6. Production Stripe publishable key is `pk_test_…` (`wrangler.jsonc`, `.env.production`). Is the store intentionally pre-launch? E2E and anyone else can create "production" test-mode orders, and with `EASYPOST_MODE` defaulting to `production` an admin fulfillment would buy **real** labels.

## Appendix B: Strengths to preserve

- Deferred-intent Elements with `elements.update({ amount })`, which keeps form state across total changes.
- An httpOnly auth cookie behind storefront API routes; the JWT is never exposed to JS.
- Workers-safe Stripe (fetch client and SubtleCrypto) and EasyPost (fetch and `btoa`) usage.
- Medusa totals displayed as authoritative (single-source-of-truth intent is right).
- The backend Hookdeck verifier uses `timingSafeEqual`.
- Structured Pino logging with correlation IDs; Sentry backend instrumentation.
- A postmortem culture, and detailed reference docs (which need a drift pass; see W1, P10 and the "Protection Layers" in `ARCHITECTURE.md`).
