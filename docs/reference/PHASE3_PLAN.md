# Phase 3: Medusa E-Commerce Migration

**Status**: 🚧 IN PROGRESS (Tracks 1-4, 6-10 Complete, Track 5 Pending)
**Updated**: 2025-12-03

---

## Quick Status

| Track | Status | Description |
|-------|--------|-------------|
| 1 | ✅ Complete | Backend config (US region, Stripe provider) |
| 2 | ✅ Complete | Products API integration with fallback |
| 2.5 | ✅ Complete | Product catalog sync to Medusa |
| 3 | ✅ Complete | Cart API (hybrid local + Medusa) |
| 4 | ✅ Complete | Checkout flow (Medusa payment sessions) |
| 5 | 📋 Pending | Webhook documentation (Hookdeck configured) |
| 6 | ✅ Complete | Customer authentication |
| 7 | ✅ Complete | E2E testing (Playwright with page objects) |
| 8 | ✅ Complete | Cloudflare Workers deployment (OpenNext) |
| 9 | ✅ Complete | Medusa order integration (admin price display bug documented) |
| 10 | ✅ Complete | SSR direct tunnel routing (bypass Cloudflare hairpin) |

**Blockers Resolved**:
- ✅ Email system stubbed (react-email/Next.js 15 conflict)
- ✅ Lazy Stripe initialization pattern applied
- ✅ Product pages use force-dynamic

---

## Architecture

### Current State (Phase 3 Partial)

```
┌──────────────┐
│  Storefront  │
└──────┬───────┘
       │
       ├─→ Medusa Store API (/store/products) ✅
       │
       ├─→ Hybrid Cart
       │   ├─ Zustand (optimistic UI) ✅
       │   └─ Medusa Cart API (persistence) ✅
       │
       ├─→ Medusa Checkout ✅
       │   └─ Payment Sessions → Stripe
       │
       └─→ Stripe Webhooks
           └─ Hookdeck → Medusa backend ✅ (configured, needs docs)

┌─────────────────┐
│ Medusa Backend  │ → api.optic.works
├─────────────────┤
│ PostgreSQL 17   │
│ Redis 7.x       │
│ Stripe Provider │
│ US Region       │
└─────────────────┘
```

### Target State (Phase 3 Complete)

Same as above, plus:
- Customer authentication (login/register)
- Customer portal (order history)
- E2E test coverage

---

## Track Details

### Track 1: Backend Configuration ✅ COMPLETE

**What was done**:
- Created US region in Medusa Admin
- Assigned Stripe payment provider to region
- Verified region API returns correctly

**Key endpoints**:
```bash
# Verify region
curl -H "x-publishable-api-key: $PUBKEY" \
  https://api.optic.works/store/regions | jq '.regions[0].id'
```

---

### Track 2: Products API ✅ COMPLETE

**What was done**:
- Fixed auth header (`x-publishable-api-key` not `Authorization: Bearer`)
- Added fallback to static products when API unavailable
- Products load dynamically from Medusa

**Key file**: `src/lib/api/medusa.ts`

**Fallback behavior**: During builds or when API key missing, falls back to `src/lib/products.ts`

---

### Track 2.5: Product Catalog Sync ✅ COMPLETE

**Problem**: Medusa had generic template products, storefront has real OpticWorks products.

**Solution**: Seed script syncs catalog to Medusa via Medusa workflows.

**What was done**:
- Created `backend/src/scripts/seed-opticworks-products.ts`
- Created `backend/src/scripts/cleanup-template-products.ts`
- Ran seed on api.optic.works - 7 products created
- Deleted 4 template products (T-Shirt, Sweatpants, etc.)

**Products in Medusa**:
1. Bed Presence Sensor Kit (3 variants: Single $239, Duo $449, Studio $525)
2. Presence Sensor Duo Pack ($449)
3. Presence Engine Developer Edition ($329)
4. Home Assistant Dashboard Pack ($59)
5. Magnetic Enclosure + Mount Pack ($79)
6. Spare mmWave Sensor Module ($119)
7. Reliability Lab Subscription ($19/mo)

**Run seed** (if needed):
```bash
ssh hetzner-node
cd /opt/opticworks/medusa-backend
pnpm medusa exec ./src/scripts/seed-opticworks-products.ts
```

**Verify**:
```bash
curl -H "x-publishable-api-key: $PUBKEY" \
  https://api.optic.works/store/products | jq '.products[].title'
```

---

### Track 3: Cart API ✅ COMPLETE

**What was done**:
- Implemented hybrid cart (Zustand + Medusa)
- Cart functions: createCart, addLineItem, updateLineItem, removeLineItem, getCart
- Optimistic updates with server sync
- Cart ID persisted to localStorage

**Key file**: `src/hooks/useCart.ts`

**Cart flow**:
1. User adds item → instant Zustand update
2. Background: create/update Medusa cart
3. On error: rollback optimistic update

---

### Track 4: Checkout Flow ✅ COMPLETE

**What was done**:
- Medusa payment session creation
- Stripe Elements integration via Medusa
- Cart completion on payment success
- Lazy Stripe initialization (build fix)

**Key files**:
- `src/lib/api/medusa.ts` - createPaymentSession, completeCart
- `src/components/checkout/CheckoutForm.tsx`
- `src/components/checkout/CheckoutWrapper.tsx`

**Payment flow**:
1. Initialize payment sessions on cart
2. Select Stripe provider
3. Get client_secret for Stripe Elements
4. User completes payment
5. Call completeCart to finalize order

---

### Track 5: Webhook Documentation 📋 PENDING

**Current state**: Hookdeck configured and routing webhooks to Medusa

**Needs**:
- [ ] Document Hookdeck setup
- [ ] Document webhook events configured
- [ ] Verify Medusa processes webhooks correctly
- [ ] Test order creation via webhook

**Hookdeck dashboard**: https://hookdeck.com (check team account)

---

### Track 6: Customer Authentication ✅ COMPLETE

**What was done**:
- [x] Registration page (`/auth/register`)
- [x] Login page (`/auth/login`)
- [x] Auth API routes (proxy to Medusa with httpOnly cookies)
- [x] useAuth Zustand hook for client state
- [x] Session management (httpOnly cookies, 7-day expiry)
- [x] Account dashboard page (`/account`)
- [x] Navbar integration (user icon, mobile menu)

**Key files**:
- `src/hooks/useAuth.ts` - Zustand auth store
- `src/app/api/auth/register/route.ts` - Registration with auto-login
- `src/app/api/auth/login/route.ts` - Login with cookie creation
- `src/app/api/auth/logout/route.ts` - Cookie deletion
- `src/app/api/auth/me/route.ts` - Current customer fetch
- `src/app/auth/register/page.tsx` - Registration UI
- `src/app/auth/login/page.tsx` - Login UI (with Suspense for searchParams)
- `src/app/account/page.tsx` - Account dashboard
- `src/components/ui/Navbar.tsx` - Auth state integration

**Auth flow**:
1. User registers/logs in via form
2. API route calls Medusa auth endpoint
3. JWT stored in httpOnly cookie (7 days)
4. Client state updated via Zustand
5. Subsequent requests include cookie automatically

**Medusa endpoints used**:
- POST `/store/customers` - Register customer
- POST `/store/auth/customer/emailpass` - Login
- GET `/store/customers/me` - Current customer

---

### Track 7: E2E Testing ✅ COMPLETE

**Infrastructure** (commit 96dca2a):
- [x] Playwright installed and configured
- [x] Page object models created (ProductPage, CartPage, CheckoutPage)
- [x] Test helpers for console capture, network logging, storage inspection
- [x] Test data fixtures with products, addresses, test cards

**Test Files**:

| File | Purpose |
|------|---------|
| `e2e/tests/checkout-flow.spec.ts` | Full checkout E2E with Stripe |
| `e2e/tests/add-to-cart.spec.ts` | Add to cart functionality |

**Page Objects** (`e2e/fixtures/page-objects/`):

| File | Covers |
|------|--------|
| `product-page.ts` | Product detail page, variant selection, add to cart |
| `cart-page.ts` | Cart view, quantity updates, proceed to checkout |
| `checkout-page.ts` | Shipping address, Stripe Elements, payment submission |

**Helper Utilities** (`e2e/helpers/`):

| File | Purpose |
|------|---------|
| `console-capture.ts` | Capture browser console logs/errors during tests |
| `network-logger.ts` | Log API calls and failures for debugging |
| `storage-inspector.ts` | Inspect/clear localStorage cart state |
| `debug-utils.ts` | Screenshot capture, network idle waits |

**Test Data** (`e2e/fixtures/test-data.ts`):
- Test products with slugs and variant IDs
- Stripe test cards (success, decline, auth required)
- Test shipping addresses
- Email generator for unique test runs

**Run Tests**:
```bash
# Install Playwright browsers (first time only)
pnpm exec playwright install

# Run all E2E tests
pnpm exec playwright test

# Run with UI mode (interactive debugging)
pnpm exec playwright test --ui

# Run specific test file
pnpm exec playwright test checkout-flow

# Run with headed browser (watch execution)
pnpm exec playwright test --headed

# Debug a specific test
pnpm exec playwright test checkout-flow --debug
```

**Test Scenarios Covered**:
1. ✅ Browse → Add to cart → Checkout → Payment → Confirmation
2. ✅ Declined card shows error (not redirected to success)
3. ✅ Debug test captures full initialization state

**Future Enhancements** (not blocking):
- [ ] Authentication flow test (login/register)
- [ ] Email delivery verification (Mailosaur per RFD-010)
- [ ] CI/CD integration (GitHub Actions)

---

### Track 9: Medusa-Only Checkout Flow ✅ COMPLETE

**Goal**: Remove direct Stripe fallback and establish Medusa as the single source of truth for e-commerce operations.

**What was done**:
- [x] Include `variantId` in Product type
- [x] Return first variant ID from Medusa API response
- [x] Update `transformMedusaProduct()` to include variant ID
- [x] Hardcode Medusa variant IDs in static product fallback
- [x] Full checkout flow working: cart → shipping → payment → order

**E2E Test Completed** (2025-12-03):
- Added product to cart (variant_01KBF0WRDCT61JD4HHH2PGDHAK)
- Completed checkout with shipping address
- Payment processed via Stripe Elements (Medusa payment session)
- Order created in Medusa: `order_01JDZFK38B5PRM0QC22B6VHS06` (display_id: 2)
- Success page displayed with order confirmation

**Key Fix Applied** (commit 349f5a6):
- Wrapped `getProductById` with React `cache()` to deduplicate API calls
- Prevents duplicate Medusa requests when `generateMetadata` and page component both fetch the same product
- Addresses RFD-011 Cloudflare→Cloudflare routing issue by reducing API call frequency

**FIXED: Medusa v2 Price Storage (Major Units)**

Medusa v2 stores prices in **MAJOR units** (dollars), not minor units (cents). This was a breaking change from v1.

**Root Cause**: Our seed scripts were using v1 convention (`amount: 23900` for $239), but Medusa v2 expects `amount: 239`. The storefront was dividing by 100, which accidentally made prices look correct while Stripe was being charged 100x too much.

**Reference**: https://docs.medusajs.com/learn/introduction/from-v1-to-v2#prices-are-stored-in-major-units

**What Was Fixed**:
- ✅ `backend/src/scripts/seed-opticworks-products.ts` - Now uses `amount: 239` (dollars)
- ✅ `backend/src/scripts/seed-us-region.ts` - Shipping prices in dollars
- ✅ `backend/src/scripts/import-products.ts` - No longer multiplies by 100
- ✅ `backend/src/scripts/verify-catalog.ts` - Expects dollars in price checks
- ✅ `src/lib/api/medusa.ts` - `normalizePrice()` returns amount directly
- ✅ `src/hooks/useCart.ts` - Cart items use price directly
- ✅ `src/app/store/cart/success/page.tsx` - No division for order totals
- ✅ `backend/src/modules/resend/emails/order-placed.tsx` - No division in email

**Note**: Stripe webhook routes correctly divide by 100 because **Stripe always uses cents**.

**Action Completed (2025-12-03)**: Prices fixed via direct database update:
```bash
# Prices were updated directly in PostgreSQL (faster than re-seeding)
ssh hetzner-node
sudo -u postgres psql -d medusa_db -c "UPDATE price SET amount = amount / 100 WHERE currency_code = 'usd' AND amount > 100;"
# Updated 13 prices

# For future re-seeds, use the corrected seed script:
pnpm medusa exec ./src/scripts/seed-opticworks-products.ts
```

---

### Track 9 (Legacy): Medusa-Only Checkout Flow 📋 ARCHIVED

**Goal**: Remove direct Stripe fallback and establish Medusa as the single source of truth for e-commerce operations. This simplifies the codebase and ensures all orders flow through Medusa.

**Problem**: Orders are not being created in Medusa because:
1. Products are added to cart without variant IDs
2. Cart sync is skipped, Medusa cart stays empty
3. Checkout falls back to direct Stripe (bypassing Medusa entirely)
4. `completeCart()` is never called, no Medusa order created

**Current Flow** (broken with hidden fallback):
```
Product Page → addToCart(product) → Local cart only (no variant ID)
            → Checkout → Medusa fails → Falls back to direct Stripe
            → Webhook → Supabase only (no Medusa order)
```

**Target Flow** (Medusa-only):
```
Product Page → addToCart(product) → Product includes variantId
            → Medusa cart sync → Cart has items
            → Checkout → Medusa payment session (Stripe via Medusa)
            → Payment success → completeCart(cartId)
            → Medusa order created ✅
            → Medusa triggers order notifications
```

**Implementation Tasks**:

1. **Product Data**:
   - [ ] Include `variantId` in Product type
   - [ ] Return first variant ID from Medusa API response
   - [ ] Update `transformMedusaProduct()` to include variant ID

2. **Cart Integration**:
   - [ ] Remove "no variant ID" skip logic - throw error instead
   - [ ] Ensure all `addToCart()` calls have variant IDs available
   - [ ] Update product components to use product.variantId

3. **Checkout Simplification**:
   - [ ] Remove direct Stripe checkout fallback from `CheckoutWrapper.tsx`
   - [ ] Remove `createPaymentSession()` fallback path
   - [ ] Remove `/api/stripe/create-checkout-session` route (or keep for legacy)
   - [ ] Make Medusa cart required for checkout

4. **Testing**:
   - [ ] Test add to cart creates Medusa line item
   - [ ] Test checkout uses Medusa payment session
   - [ ] Test `completeCart()` creates order
   - [ ] Verify order in Medusa dashboard

**Key Files to Modify**:
- `src/lib/products.ts` - Add variantId to Product type
- `src/lib/api/medusa.ts` - Include variant ID in product transform
- `src/hooks/useCart.ts` - Remove skip logic, require variant ID
- `src/components/checkout/CheckoutWrapper.tsx` - Remove Stripe fallback
- `src/components/products/*.tsx` - Use product.variantId in addToCart

**Benefits of Medusa-Only Approach**:
- Single source of truth for orders
- Medusa handles inventory, notifications, fulfillment
- Clearer error messages (no silent fallbacks)
- Simpler codebase to maintain

---

### Track 10: SSR Direct Tunnel Routing ✅ COMPLETE

**Goal**: Fix Cloudflare Workers → Medusa API 404 errors by routing SSR requests directly through the Cloudflare Tunnel, bypassing the public proxy.

**Problem**: When the OpenNext worker (optic.works) makes server-side requests to `api.optic.works`, Cloudflare's edge routing fails with 404. This is a known "hairpin" issue - Cloudflare Workers calling Cloudflare-proxied domains don't route correctly.

**Current Workaround**: Static product data fallback (works, but prevents dynamic product updates)

**Solution**: Use `medusa.optic.works` (internal Cloudflare Tunnel hostname) for SSR requests:
- The `opticworks-api-cors` worker already uses this successfully
- Same tunnel, just accessed directly without going through the public proxy
- Client-side requests continue using `api.optic.works` (Medusa handles CORS directly)

**Architecture** (Simplified 2025-12-03):
```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Cloudflare Edge                                   │
│                                                                         │
│  ┌─────────────────────────────────┐                                    │
│  │  opticworks-store (OpenNext)    │                                    │
│  │  Routes: optic.works/*          │                                    │
│  │                                 │                                    │
│  │  SSR: medusa.optic.works ───────┼────────────┐                       │
│  │  (direct tunnel, no proxy)      │            │                       │
│  └─────────────────────────────────┘            │                       │
│                                                 │  Cloudflare Tunnel    │
│  Browser → api.optic.works ─────────────────────┤  (both hostnames)     │
│            (direct to tunnel)                   │                       │
│                                                 │                       │
│  Note: CORS worker removed from request path    │                       │
│  Medusa handles CORS via medusa-config.ts       │                       │
└─────────────────────────────────────────────────────────────────────────┘
                                                  │
                                                  ▼
                                        ┌─────────────────┐
                                        │  Hetzner VPS    │
                                        │  Medusa :9000   │
                                        │  (handles CORS) │
                                        └─────────────────┘
```

**CORS Simplification** (2025-12-03):

The CORS worker (`opticworks-api-cors`) has been removed from the request path. Medusa v2 natively supports CORS configuration via `storeCors`, `adminCors`, and `authCors` in `backend/medusa-config.ts`. Both `api.optic.works` and `medusa.optic.works` now route directly to the Cloudflare Tunnel.

Server `.env` on Hetzner:
```bash
STORE_CORS=http://localhost:3000,https://optic.works,https://www.optic.works
AUTH_CORS=http://localhost:7000,http://localhost:8000,https://api.optic.works
```

Tunnel config (`/etc/cloudflared/config.yml`):
```yaml
ingress:
  - hostname: api.optic.works
    service: http://localhost:9000
  - hostname: medusa.optic.works
    service: http://localhost:9000
  - service: http_status:404
```

The CORS worker has been deleted from the repo. Delete it from Cloudflare dashboard if still present.

**Implementation**:

1. **Add SSR base URL to wrangler.jsonc**:
```jsonc
"vars": {
  "NEXT_PUBLIC_MEDUSA_BASE_URL": "https://api.optic.works",     // Client
  "MEDUSA_SSR_BASE_URL": "https://medusa.optic.works"           // Server
}
```

2. **Update src/lib/api/medusa.ts**:
```typescript
const medusaEnv = {
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BASE_URL,
  ssrBaseUrl: process.env.MEDUSA_SSR_BASE_URL,
}

const getBaseUrl = () => {
  // Server-side: use direct tunnel (avoids Cloudflare hairpin)
  if (typeof window === 'undefined' && medusaEnv.ssrBaseUrl) {
    return medusaEnv.ssrBaseUrl
  }
  // Client-side: use public API (CORS worker adds headers)
  return medusaEnv.baseUrl
}
```

**Why This Works**:
- `medusa.optic.works` is a Cloudflare Tunnel hostname pointing directly to the origin
- No Cloudflare proxy in the middle = no hairpin issue
- Client requests still go through `api.optic.works` (Medusa handles CORS directly)

**Tasks** (Completed 2025-12-03):
- [x] Add `MEDUSA_SSR_BASE_URL` to `wrangler.jsonc`
- [x] Update `src/lib/api/medusa.ts` to use SSR base URL server-side
- [x] Deploy to Cloudflare Workers
- [x] Test SSR product fetching works (200 OK from medusa.optic.works)
- [x] Verify client-side cart/checkout still works (api.optic.works direct to Medusa)
- [x] Remove CORS worker from request path (Medusa handles CORS natively)

**Verification** (from Cloudflare Worker logs):
```
[medusa] Server config: { ssrBaseUrl: 'SET', usingUrl: 'SET' }
[medusa] GET https://medusa.optic.works/store/products?handle=bed-presence-sensor-kit
[medusa] Response: 200 OK
```

**Related**:
- Archived: `docs/reference/archived/RFD-011-cloudflare-ssr-workaround.md`

---

### Track 8: Cloudflare Workers Deployment ✅ COMPLETE

**Goal**: Deploy Next.js storefront to Cloudflare Workers using OpenNext adapter, replacing Vercel deployment.

**Benefits Achieved**:
- Direct connectivity to Hetzner/Medusa backend (no Vercel cold starts)
- R2 for incremental cache (ISR/SSG)
- Better edge performance
- Backend-for-frontend pattern with Workers
- GitOps deployment via Cloudflare dashboard git integration

**Architecture**:
```
┌──────────────────────┐
│  Cloudflare Workers  │ → optic.works (Next.js via OpenNext)
│  + R2 Storage        │ → incremental cache (ISR/SSG)
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐     ┌──────────────────────┐
│  Hookdeck            │ ←── │  Stripe Webhooks     │
│  (webhook proxy)     │     └──────────────────────┘
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Hetzner VPS         │ → api.optic.works (Medusa v2)
│  + PostgreSQL/Redis  │
└──────────────────────┘
```

**Implementation Status**:
- [x] Install @opennextjs/cloudflare adapter
- [x] Configure wrangler.jsonc for Workers deployment
- [x] Set up R2 bucket binding for incremental cache
- [x] Create R2 cache bucket (`opticworks-cache`)
- [x] Configure Workers secrets in Cloudflare dashboard
- [x] Update DNS (moved from Vercel to Cloudflare Workers)
- [x] Test Medusa API connectivity from Workers
- [x] Stripe checkout working with Cloudflare Workers
- [x] Hookdeck webhook routing configured and tested

**Reference**: https://opennext.js.org/cloudflare

**Key Files**:
- `wrangler.jsonc` - Wrangler configuration with R2 bindings
- `open-next.config.ts` - OpenNext configuration with R2 incremental cache
- `.github/workflows/deploy-cloudflare.yml` - GitHub Actions workflow (optional)
- `public/_headers` - Static asset cache headers

**npm Scripts**:
```bash
pnpm run cf:build      # Build for Cloudflare
pnpm run cf:preview    # Build and preview locally
pnpm run cf:deploy     # Deploy to default env (workers.dev)
```

**Manual Production Deploy**:
```bash
unset NODE_ENV && pnpm run cf:build
pnpm exec wrangler deploy --env production
```

**Cloudflare Workers Configuration**:

Custom domains configured in `wrangler.jsonc`:
- `optic.works` (primary)
- `www.optic.works` (alias)

Worker secrets (set in Cloudflare dashboard → Workers → Settings → Variables):
| Secret | Description |
|--------|-------------|
| `STRIPE_SECRET_KEY` | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `RESEND_API_KEY` | Resend email API key |

**Stripe SDK Cloudflare Workers Compatibility**:

The Stripe SDK requires special configuration for Cloudflare Workers:

```typescript
import Stripe from 'stripe';

// Use FetchHttpClient instead of Node's http module
// API version 2025-03-31.basil required for ui_mode: custom
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil' as Stripe.LatestApiVersion,
  httpClient: Stripe.createFetchHttpClient(),
});

// For webhook signature verification, use SubtleCryptoProvider (Web Crypto API)
const cryptoProvider = Stripe.createSubtleCryptoProvider();
event = await stripe.webhooks.constructEventAsync(
  body,
  signature,
  webhookSecret,
  undefined,
  cryptoProvider
);
```

Reference: https://opennext.js.org/cloudflare/howtos/stripeAPI

**Hookdeck Webhook Configuration**:

Stripe webhooks are routed through Hookdeck for reliability and observability:

1. Stripe sends webhooks to Hookdeck endpoint
2. Hookdeck validates and forwards to `https://optic.works/api/stripe/webhook`
3. Webhook route detects Hookdeck headers and skips Stripe signature verification

Hookdeck detection headers:
- `X-Hookdeck-Signature` - Hookdeck's signature
- `X-Hookdeck-Verified: true` - Indicates Hookdeck validated the webhook

**Caching Notes** (per https://opennext.js.org/cloudflare/caching):
- Uses R2 for incremental cache (ISR/SSG pages)
- Workers KV is NOT used (eventually consistent, not recommended)
- Static assets served via Workers Assets binding
- `public/_headers` file controls static asset caching

---

## Known Issues

### Email System - RESTORED via Medusa

**Original Issue**: Incorrectly attributed to @react-email conflict (actual root cause: NODE_ENV not unset in Codespaces)

**Solution Implemented**: Email functionality restored via Medusa notification system using Resend

**Backend files added**:
- `backend/src/modules/resend/` - Custom Resend notification provider
- `backend/src/modules/resend/emails/` - React Email templates (order-placed, order-shipped, password-reset)
- `backend/src/subscribers/order-placed.ts` - Event subscriber for order confirmations
- Updated `backend/medusa-config.ts` - Resend provider configuration

**Storefront files** (still stubbed, handled by Medusa backend now):
- `src/lib/api/email.ts` - Stubbed (transactional emails go through Medusa)
- `src/app/api/email/send/route.ts` - Stubbed

**Environment Variables Required**:
- `RESEND_API_KEY` - Resend API key
- `RESEND_FROM_EMAIL` - Sender email address (e.g., "OpticWorks <notifications@optic.works>")

### Build Workarounds

| Issue | Solution |
|-------|----------|
| NODE_ENV in Codespaces | `unset NODE_ENV && pnpm run build` |
| Stripe SDK at build time | Lazy initialization with getStripe() |
| Medusa API at build time | Fallback to static products |
| Product SSG fails | `export const dynamic = 'force-dynamic'` |

---

## Success Criteria

### Complete ✅
- [x] Products from Medusa API
- [x] Cart persists in Medusa
- [x] Checkout via Medusa payment sessions
- [x] Stripe integration working

### Pending 📋
- [ ] Customer can register/login
- [ ] Customer can view order history
- [ ] E2E tests pass
- [ ] Webhooks documented

---

## Next Steps

1. **Track 5**: Document Hookdeck setup
2. **Track 6**: Implement customer auth pages
3. **Track 7**: Add Playwright E2E tests
4. **Phase 4**: Restore email via Medusa notifications

---

## Reference Commands

```bash
# Development
pnpm run dev

# Pre-commit
pnpm run lint && pnpm run test && unset NODE_ENV && pnpm run build

# Verify Medusa API
curl -H "x-publishable-api-key: pk_xxx" https://api.optic.works/store/products

# SSH to backend
ssh hetzner-node
pm2 logs medusa-dev
```
