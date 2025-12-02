# Phase 3: Medusa E-Commerce Migration

**Status**: 🚧 IN PROGRESS (Tracks 1-4, 6 Complete, 5, 7, 8 Pending)
**Updated**: 2025-12-02

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
| 7 | 📋 Pending | E2E testing |
| 8 | 📋 Pending | Cloudflare Workers deployment (OpenNext) |

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

### Track 7: E2E Testing 📋 PENDING

**Needs**:
- [ ] Install Playwright
- [ ] Checkout flow test
- [ ] Authentication flow test
- [ ] Email delivery test (Mailosaur)

**Test scenarios**:
1. Browse → Add to cart → Checkout → Payment → Confirmation
2. Register → Login → View orders → Logout

---

### Track 8: Cloudflare Workers Deployment 🚧 IN PROGRESS

**Goal**: Deploy Next.js storefront to Cloudflare Workers using OpenNext adapter, replacing Vercel deployment. This provides:
- Direct connectivity to Hetzner/Medusa backend (no Vercel cold starts)
- R2 for incremental cache (ISR/SSG)
- Better edge performance
- Backend-for-frontend pattern with Workers
- GitOps deployment on push to main

**Architecture**:
```
┌──────────────────────┐
│  Cloudflare Workers  │ → storefront (Next.js via OpenNext)
│  + R2 Storage        │ → incremental cache (ISR/SSG)
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
- [x] Create GitHub Actions workflow for GitOps deployment
- [ ] Create R2 cache bucket in Cloudflare dashboard
- [ ] Set up GitHub secrets and variables
- [ ] Configure Workers secrets in Cloudflare dashboard
- [ ] Update DNS (move from Vercel to Cloudflare)
- [ ] Test Medusa API connectivity from Workers
- [ ] Verify Stripe webhooks work with new domain

**Reference**: https://opennext.js.org/cloudflare

**Key Files**:
- `wrangler.jsonc` - Wrangler configuration
- `open-next.config.ts` - OpenNext configuration with R2 cache
- `.github/workflows/deploy-cloudflare.yml` - GitOps deployment
- `public/_headers` - Static asset cache headers

**npm Scripts**:
```bash
pnpm run cf:build      # Build for Cloudflare
pnpm run cf:preview    # Build and preview locally
pnpm run cf:deploy     # Deploy to default env
pnpm run cf:deploy:production  # Deploy to production
```

## Setup Instructions

### 1. Create R2 Cache Bucket
```bash
# Create the incremental cache bucket
npx wrangler r2 bucket create opticworks-cache
```

### 2. GitHub Repository Secrets
Add these secrets in GitHub repo settings → Secrets → Actions:

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | API token with Workers/R2/DNS permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |

### 3. GitHub Repository Variables
Add these variables in GitHub repo settings → Variables → Actions:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_MEDUSA_BASE_URL` | `https://api.optic.works` |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | (from Infisical) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | (from Infisical) |
| `NEXT_PUBLIC_APP_URL` | `https://optic.works` |
| `NEXT_PUBLIC_MEDUSA_ENABLED` | `true` |

### 4. Cloudflare Worker Secrets
Set via Cloudflare dashboard (Workers → opticworks-store → Settings → Variables):

| Secret | Description |
|--------|-------------|
| `STRIPE_SECRET_KEY` | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `RESEND_API_KEY` | Resend email API key |
| `MEDUSA_SECRET_KEY` | Medusa backend secret |

### 5. DNS Configuration
Since optic.works already uses Cloudflare DNS:
1. Remove Vercel CNAME/A records
2. Worker routes in wrangler.jsonc will handle `optic.works` and `www.optic.works`

### 6. Stripe Webhook Update
Update Stripe webhook endpoint from Vercel URL to:
- `https://optic.works/api/stripe/webhook`

**Environment Variables** (in Infisical):
- `CLOUDFLARE_API_BASE_URL` - Cloudflare API endpoint
- `CLOUDFLARE_EMAIL` - Account email
- `CLOUDFLARE_GLOBAL_API_KEY` - API key (use API Token instead for GitHub Actions)
- `R2_ACCESS_KEY_ID` - R2 bucket access
- `R2_SECRET_ACCESS_KEY` - R2 bucket secret
- `R2_BUCKET_NAME` - `opticworks-public`
- `R2_ENDPOINT_URL` - R2 S3-compatible endpoint
- `R2_PUBLIC_URL` - Public R2 URL

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
