# Phase 4: Production Launch

**Status**: Planning
**Target**: Production-ready store with real products, polished UI, and fulfillment automation

---

## Quick Status

| Track | Status | Description |
|-------|--------|-------------|
| 1 | Pending | Production product catalog (real products, images, pricing) |
| 2 | Pending | Design system + UI overhaul (Shadcn/Radix theming) |
| 3 | **Near Complete** | Fulfillment module (EasyPost + inventory tracking) |
| 4 | **Complete** | Consumer documentation site (docs.optic.works) |
| 5 | Pending | Usability testing + accessibility audit |
| 6 | Pending | CI/CD hardening + monitoring |
| 7 | **In Progress** | Edge rate limiting + request buffering (Cloudflare WAF + Upstash Qstash) |

---

## Phase 3 Summary (Complete)

Phase 3 established a fully functional e-commerce platform:

- **Products**: Medusa catalog with 7 products, variant support
- **Cart**: Hybrid local + Medusa persistence
- **Checkout**: Stripe Elements via Medusa payment sessions
- **Auth**: Customer registration/login with httpOnly cookies
- **Email**: Resend integration with order confirmations
- **Deployment**: Cloudflare Workers (storefront) + Hetzner (backend)
- **Testing**: Playwright E2E suite covering critical flows

See `docs/reference/archived/PHASE3_PLAN.md` for full implementation details.

---

## Track 1: Production Product Catalog

**Goal**: Replace placeholder products with real OpticWorks inventory.

### Tasks

- [ ] Product photography (high-res images for all 7 products)
- [ ] Upload images to Cloudflare R2 via Medusa Admin
- [ ] Finalize product descriptions and specifications
- [ ] Set production pricing (verify Medusa v2 major units)
- [ ] Configure inventory levels and SKUs
- [ ] Add product categories and collections
- [ ] SEO metadata (descriptions, keywords)

### Key Files

- `backend/src/scripts/seed-opticworks-products.ts` - Update with final data
- Medusa Admin UI - Product editing

### Verification

```bash
curl -H "x-publishable-api-key: $PUBKEY" \
  https://api.optic.works/store/products | jq '.products[].thumbnail'
# All products should have R2 image URLs
```

---

## Track 2: Design System + UI Overhaul

**Goal**: Professional, cohesive visual design with consistent component library.

### Design System Components

| Component | Current | Target |
|-----------|---------|--------|
| Color palette | Ad-hoc Tailwind | Defined brand tokens |
| Typography | Geist font | Typography scale + hierarchy |
| Spacing | Inconsistent | 4px grid system |
| Components | Mixed Shadcn/custom | Unified Radix + Shadcn |
| Dark mode | Partial | Complete implementation |

### Tasks

- [ ] Define brand color palette (primary, secondary, accent, semantic)
- [ ] Create typography scale in `tailwind.config.ts`
- [ ] Audit and standardize all Shadcn components
- [ ] Implement consistent spacing system
- [ ] Complete dark mode support
- [ ] Design product cards, CTAs, and hero sections
- [ ] Mobile-first responsive polish
- [ ] Loading states and skeleton screens

### Key Files

- `src/app/globals.css` - CSS variables and base styles
- `src/components/ui/` - Shadcn components
- `tailwind.config.ts` - Theme configuration

### Deliverables

- Style guide document
- Component storybook (optional)
- Before/after screenshots

---

## Track 3: Fulfillment Module (EasyPost + Inventory)

**Goal**: Address validation, real-time shipping rates, label generation, and inventory tracking.

**Status**: Near Complete (E2E testing in progress)

### Architecture

```
INVENTORY FLOW:
Product (manage_inventory: true) → Stock tracked at US Warehouse
  → Add to cart → Reserve inventory
  → Complete checkout → Deduct inventory
  → Cancel order → Restore inventory

SHIPPING FLOW:
Customer enters address
  → (on blur) Light address validation via EasyPost
  → (on submit) Full validation with ZIP+4
  → Fetch real-time rates (USPS Ground, FedEx 2Day/Express)
  → User selects shipping option
  → Rate included in payment intent

FULFILLMENT FLOW:
Admin marks order ready → Generate EasyPost label
  → Tracking number stored → Email sent via Resend
```

### Implementation Approach

**EasyPost (Storefront-side)** instead of FedEx plugin because:
- Already have EasyPost API key and client code
- Multi-carrier support (USPS + FedEx) in single API
- Simpler integration at checkout layer
- Keep existing Medusa manual fulfillment provider

### Tasks

**Inventory Management (Phase 0)**:
- [x] Enable `manage_inventory: true` in product seed
- [x] Create `seed-inventory.ts` with realistic stock quantities (50-100 units)
- [x] Run inventory seed script on backend (100 units per SKU)
- [x] Create `enable-inventory-management.ts` to enable inventory on existing products
- [x] Create `link-inventory-items.ts` to link variants to inventory items
- [x] Fix Medusa API to include `+variants.inventory_quantity` in product queries
- [ ] Verify reservation flow during checkout
- [ ] Test stock deduction on order completion

**Running Inventory Scripts** (on production backend):
```bash
ssh hetzner-node
cd /opt/opticworks/medusa-backend
# Enable inventory management on all variants
pnpm medusa exec ./src/scripts/enable-inventory-management.ts
# Set stock levels (100 units per SKU)
pnpm medusa exec ./src/scripts/seed-inventory.ts
# Link inventory items to variants (required for inventory_quantity to show in API)
pnpm medusa exec ./src/scripts/link-inventory-items.ts
```

**EasyPost Integration (Phases 1-2)**:
- [x] Extend `src/lib/api/easypost.ts` with rate calculation
- [x] Replace mock `/api/shipping/rates` with EasyPost
- [x] Add product parcel dimensions config (`src/lib/products-dimensions.ts`)

**Checkout Flow (Phases 3-5)**:
- [x] Add address validation (`useAddressValidation` hook)
- [x] Create ShippingSelector component
- [x] Create useShippingRates hook
- [x] Update CheckoutWrapper to wait for shipping selection
- [x] Integrate ShippingSelector into CheckoutForm
- [x] Include shipping cost in payment intent via `/api/checkout/update-shipping`

**Label Generation (Phase 6)**:
- [x] Create `/api/fulfillment/create-label` endpoint
- [x] Create fulfillment helper functions
- [x] Store tracking number in order metadata (via Medusa Admin API)
- [x] Trigger tracking email via Resend (via Medusa fulfillment notification)

**E2E Testing (Phase 7)**:
- [x] Add data-testid attributes to ShippingSelector
- [x] Extend CheckoutPage page object with shipping methods
- [x] Create `e2e/tests/checkout-shipping.spec.ts`
- [x] Update `e2e/tests/checkout-flow.spec.ts` with shipping step

### Key Files

**Backend (Medusa)**:
- `backend/src/scripts/seed-opticworks-products.ts` - Products with `manage_inventory: true`
- `backend/src/scripts/seed-inventory.ts` - Realistic stock quantities
- `backend/src/scripts/enable-inventory-management.ts` - Enable inventory on existing variants
- `backend/src/scripts/link-inventory-items.ts` - Link variants to inventory items
- `backend/src/scripts/seed-us-region.ts` - US Warehouse stock location
- `backend/src/modules/resend/emails/order-shipped.tsx` - Order shipped email template

**Storefront (Next.js)**:
- `src/lib/api/easypost.ts` - EasyPost client (fetch-based, Cloudflare Workers compatible)
- `src/lib/api/fulfillment.ts` - Fulfillment helper functions
- `src/lib/products-dimensions.ts` - Product parcel dimensions + SKU mapping
- `src/lib/rate-limit.ts` - In-memory rate limiting for API routes
- `src/app/api/shipping/rates/route.ts` - Shipping rates API (rate limited)
- `src/app/api/checkout/update-shipping/route.ts` - Update cart with shipping (rate limited)
- `src/app/api/easypost/validate-address/route.ts` - Address validation (rate limited)
- `src/app/api/fulfillment/create-label/route.ts` - Label generation + metadata + fulfillment
- `src/hooks/useShippingRates.ts` - Shipping rates hook
- `src/hooks/useAddressValidation.ts` - Address validation hook
- `src/components/checkout/ShippingSelector.tsx` - Shipping option selector
- `src/components/checkout/AddressValidationIndicator.tsx` - Validation status UI
- `src/components/checkout/CheckoutForm.tsx` - Checkout form with shipping integration
- `src/components/checkout/CheckoutWrapper.tsx` - Checkout wrapper with shipping updates

**E2E Tests**:
- `e2e/tests/checkout-shipping.spec.ts` - Shipping-specific tests
- `e2e/tests/checkout-flow.spec.ts` - Main checkout flow (includes shipping)
- `e2e/fixtures/page-objects/checkout-page.ts` - Checkout page object with shipping methods

### Environment Variables

```bash
# EasyPost (must be added as Cloudflare Workers secret)
# If not configured, shipping rates will use mock data
EASYPOST_API_KEY=xxx

# Origin warehouse address (for shipments)
SHIP_FROM_NAME="OpticWorks"
SHIP_FROM_STREET1="123 Commerce St"
SHIP_FROM_CITY="Los Angeles"
SHIP_FROM_STATE="CA"
SHIP_FROM_ZIP="90001"

# FedEx carrier account (add to EasyPost dashboard)
# Sign up at https://developer.fedex.com/
```

### Deployment Notes

**Build-time vs Runtime Variables:**
- `NEXT_PUBLIC_*` variables must be set as **build variables** in Cloudflare Workers Builds
- They are inlined at build time and cannot be set at runtime
- Created `.env.production` with public keys (safe to commit - publishable keys only)

**Cloudflare Workers Secrets:**
- `EASYPOST_API_KEY` - Add via Cloudflare dashboard or `wrangler secret put`
- `STRIPE_SECRET_KEY` - Already configured
- `STRIPE_WEBHOOK_SECRET` - Already configured

**Known Issues Fixed (2024-12):**
- Fixed infinite loop in `useShippingRates` hook when API returned errors
- Fixed graceful fallback to mock rates when `EASYPOST_API_KEY` not configured
- Fixed `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` not available at runtime (now in `.env.production`)
- Replaced EasyPost SDK with fetch-based API (SDK uses Node.js `https` which isn't supported in Cloudflare Workers)
- Added rate limiting to shipping and checkout APIs to prevent abuse and control costs

### Rate Limiting

API endpoints are protected with in-memory rate limiting to prevent abuse and control third-party API costs:

| Endpoint | Limit | Window | Purpose |
|----------|-------|--------|---------|
| `/api/shipping/rates` | 20 req | 1 min | EasyPost API cost control |
| `/api/checkout/update-shipping` | 10 req | 1 min | Prevent checkout abuse |
| `/api/easypost/validate-address` | 30 req | 1 min | EasyPost API cost control |

**Implementation**: `src/lib/rate-limit.ts`

**Note**: This is per-isolate rate limiting. Cloudflare Workers run across multiple isolates, so this provides soft rate limiting. For strict enforcement, use Cloudflare's built-in Rate Limiting Rules or Durable Objects.

**Rate Limit Headers** (returned on all requests):
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in window
- `X-RateLimit-Reset`: Unix timestamp when limit resets
- `Retry-After`: Seconds to wait (only on 429 responses)

---

## Track 4: Consumer Documentation Site

**Status**: Complete

**Goal**: Launch docs.optic.works with product guides and support content.

**Design Reference**: [docs.crossplane.io](https://docs.crossplane.io) - Clone their "Geekboot" theme styling.

### Architecture

```
platform/docs-site/
├── content/
│   ├── getting-started/      # Setup guides
│   ├── products/             # Product documentation
│   ├── troubleshooting/      # Common issues
│   └── support/              # Contact info, warranty
├── themes/
│   └── opticboot/            # Custom theme (based on Crossplane's Geekboot)
│       ├── assets/
│       │   ├── scss/         # Custom SCSS (variables, components)
│       │   └── js/           # Search, navigation
│       ├── layouts/
│       │   ├── _default/     # Base templates
│       │   ├── partials/     # Header, footer, sidebar
│       │   └── shortcodes/   # Callouts, tabs, hints
│       └── static/           # Fonts, images
├── config.yaml               # Hugo configuration
└── package.json              # PostCSS, dependencies
```

### Theme Reference: Crossplane Geekboot

Source: [github.com/crossplane/docs](https://github.com/crossplane/docs/tree/master/themes/geekboot)

**Key Features to Adopt**:

| Feature | Crossplane Implementation |
|---------|---------------------------|
| Color System | 16-shade grayscale (fog-0 to fog-1000) + accent colors |
| Typography | Avenir font family, 1.125rem base, 1.8 line-height |
| Dark Mode | Separate `dark-mode.scss` and `light-mode.scss` |
| Navigation | Dark navbar (#0A1111), white links, 17px font |
| Sidebar | Collapsible sections, version selector |
| Code Blocks | Light/dark themes, line numbers, copy button |
| Callouts | Info, warning, danger variants with icons |
| Search | Client-side search with results overlay |

**SCSS Structure** (from Crossplane):
```
assets/scss/
├── _variables.scss      # Colors, fonts, spacing
├── _navbar.scss         # Top navigation
├── _sidebar.scss        # Left navigation
├── _content.scss        # Main content area
├── _code-theme-*.scss   # Syntax highlighting
├── _callouts.scss       # Admonition blocks
├── _hints.scss          # Inline hints
├── _toc.scss            # Table of contents
├── dark-mode.scss       # Dark theme overrides
├── light-mode.scss      # Light theme
└── docs.scss            # Main entry point
```

**Color Palette** (Crossplane variables):
```scss
// Grayscale
$fog-0: #FFFFFF;     // Background
$fog-100: #E8E9E9;   // Borders
$fog-200: #CECFCF;   // Muted text
$fog-800: #1A2222;   // Text
$fog-1000: #0A1111;  // Navbar background

// Accent (adapt for OpticWorks brand)
$aqua-500: #23B89A;  // Primary accent (Crossplane teal)
```

### OpticWorks Customizations

Adapt Crossplane's theme with OpticWorks branding:

| Element | Crossplane | OpticWorks |
|---------|------------|------------|
| Primary accent | Teal (#23B89A) | Brand blue (TBD) |
| Logo | Crossplane | OpticWorks |
| Fonts | Avenir | Geist or Inter |
| Favicon | Crossplane | OpticWorks |

### Deployment

- **Host**: Cloudflare Pages
- **Domain**: docs.optic.works
- **Build**: `pnpm docs:build`

### Content Plan

| Section | Content |
|---------|---------|
| Getting Started | Unboxing, initial setup, Home Assistant integration |
| Bed Presence Sensor | Installation, configuration, calibration |
| Presence Engine | API docs, developer guide |
| Dashboard Pack | Template installation, customization |
| Troubleshooting | FAQ, common issues, reset procedures |
| Support | Contact, warranty, returns |

### Tasks

- [x] Clone Crossplane's Geekboot theme as starting point
- [x] Rename to `opticboot`, update branding
- [x] Adapt color palette for OpticWorks brand
- [x] Configure hugo.yaml (based on Crossplane's config.yaml)
- [x] Set up PostCSS pipeline for SCSS compilation
- [x] Write Getting Started guide
- [x] Write product documentation (Bed Presence Sensor)
- [x] Add troubleshooting section
- [x] Configure Cloudflare Pages deployment
- [x] Set up docs.optic.works DNS
- [x] Add Docs link to main store navigation (MenuBar)

### Commands

```bash
# Development
pnpm docs:dev

# Build
pnpm docs:build

# Deploy (Cloudflare Pages)
# Configured via dashboard or wrangler
```

### Reference

- [Crossplane Docs Repo](https://github.com/crossplane/docs)
- [Crossplane Geekboot Theme](https://github.com/crossplane/docs/tree/master/themes/geekboot)
- [Live Example](https://docs.crossplane.io)

---

## Track 5: Usability Testing + Accessibility

**Goal**: Validate user experience and ensure WCAG 2.1 AA compliance.

### Usability Testing

| Test Type | Method | Participants |
|-----------|--------|--------------|
| Task completion | Moderated sessions | 5-8 users |
| First-click | Unmoderated (Maze/Lyssna) | 20+ users |
| Checkout flow | A/B testing (optional) | Traffic-based |

### Key Flows to Test

1. Browse products and add to cart
2. Complete checkout as guest
3. Register account and view order history
4. Find product documentation
5. Contact support

### Accessibility Audit

| Area | Tool |
|------|------|
| Automated scan | axe DevTools, Lighthouse |
| Keyboard navigation | Manual testing |
| Screen reader | NVDA/VoiceOver testing |
| Color contrast | WebAIM Contrast Checker |
| Focus management | Manual testing |

### Tasks

- [ ] Run Lighthouse accessibility audit
- [ ] Fix critical accessibility issues
- [ ] Conduct 5-8 moderated usability sessions
- [ ] Document findings and recommendations
- [ ] Implement high-priority fixes
- [ ] Verify keyboard navigation throughout
- [ ] Test with screen reader

### Deliverables

- Accessibility audit report
- Usability test findings
- Prioritized fix list

---

## Track 6: CI/CD Hardening + Monitoring

**Goal**: Reliable deployments and production observability.

### CI/CD Improvements

| Current | Target |
|---------|--------|
| Manual Cloudflare deploy | GitHub Actions auto-deploy |
| Ansible for backend | Ansible + Terraform hybrid |
| No staging environment | Staging on workers.dev |
| Manual E2E runs | E2E in CI pipeline |

### Monitoring Stack

| Layer | Tool |
|-------|------|
| Uptime | Cloudflare Health Checks |
| Errors | Sentry (frontend + backend) |
| Logs | Cloudflare Workers Logs + PM2 |
| Analytics | Cloudflare Analytics + GA4 |
| APM | Cloudflare Workers Analytics |

### Tasks

- [ ] Set up GitHub Actions for storefront deploy
- [ ] Configure staging environment (workers.dev)
- [ ] Add E2E tests to CI pipeline
- [ ] Implement Sentry for error tracking
- [ ] Configure Cloudflare health checks
- [ ] Set up alerting (Slack/email)
- [ ] Document runbooks for common issues
- [ ] Add Terraform for Hetzner infrastructure (per RFD-010)

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test

  e2e:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm exec playwright install --with-deps
      - run: pnpm exec playwright test --project=chromium

  deploy:
    needs: e2e
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm run cf:build
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: deploy --env production
```

---

## Track 7: Edge Rate Limiting + Request Buffering

**Goal**: Protect against runaway loops, API abuse, and third-party API cost overruns using edge-level rate limiting and request queuing.

**Status**: In Progress

**Context**: On December 7, 2025, an infinite loop bug exhausted the Cloudflare Workers free tier limit (100K/day) by generating ~580K requests in 2 hours. See `docs/postmortems/2025-12-07-infinite-loop-rate-limit.md` for full details.

### Architecture

```
                    EDGE LAYER                         APPLICATION LAYER

Browser Request
       │
       ▼
┌─────────────────┐
│  Cloudflare WAF │  ← Rate limiting rules (IP-based, path-based)
│  Rate Limiting  │  ← Block before Workers invocation
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Cloudflare    │  ← In-memory rate limiting (per-isolate)
│    Workers      │  ← Request debouncing
└────────┬────────┘
         │
         ├──────────────────────────────────────┐
         │                                      │
         ▼                                      ▼
┌─────────────────┐                   ┌─────────────────┐
│  Direct APIs    │                   │  Upstash Qstash │
│  (Medusa, etc)  │                   │  Request Queue  │
└─────────────────┘                   └────────┬────────┘
                                               │
                                               ▼
                                      ┌─────────────────┐
                                      │   EasyPost API  │
                                      │  (rate limited) │
                                      └─────────────────┘
```

### Defense Layers

| Layer | Technology | Purpose |
|-------|------------|---------|
| 1. Edge | Cloudflare WAF Rate Limiting | Block abusive IPs before Workers invocation |
| 2. Application | In-memory rate limiting | Soft per-IP limits within Workers |
| 3. Frontend | Request debouncing | Prevent rapid-fire requests from typing |
| 4. Queue | Upstash Qstash | Buffer EasyPost calls, prevent overwhelming API |
| 5. Circuit Breaker | Application logic | Stop calling failing APIs temporarily |

### Implementation Plan

#### Phase 1: Cloudflare WAF Rate Limiting (Edge)

Configure WAF rules in Cloudflare dashboard for optic.works zone:

**Rule 1: Shipping API Rate Limit**
```
Expression: (http.request.uri.path contains "/api/shipping")
Characteristics: IP
Period: 1 minute
Requests: 30
Action: Block
Mitigation timeout: 60 seconds
```

**Rule 2: Checkout API Rate Limit**
```
Expression: (http.request.uri.path contains "/api/checkout")
Characteristics: IP
Period: 1 minute
Requests: 15
Action: Block
Mitigation timeout: 60 seconds
```

**Rule 3: General API Rate Limit**
```
Expression: (http.request.uri.path starts with "/api/")
Characteristics: IP
Period: 1 minute
Requests: 100
Action: Challenge
Mitigation timeout: 60 seconds
```

#### Phase 2: Frontend Debouncing

Add debouncing to `useShippingRates` hook:

```typescript
// src/hooks/useShippingRates.ts
import { useDebouncedCallback } from 'use-debounce';

const debouncedFetch = useDebouncedCallback(
  fetchRates,
  500,  // 500ms debounce
  { leading: false, trailing: true }
);
```

#### Phase 3: Upstash Qstash Integration

**Why Qstash?**
- Rate limiting: Control requests/second to EasyPost
- Retry logic: Automatic retries on failure
- Dead letter queue: Handle permanently failed requests
- Decoupling: Frontend doesn't wait for EasyPost response

**Architecture:**

```
POST /api/shipping/rates
       │
       ▼
┌─────────────────┐
│  Check cache    │ ← Redis/KV cache for recent rates
│  (hit? return)  │
└────────┬────────┘
         │ (miss)
         ▼
┌─────────────────┐
│  Qstash publish │ ← Queue the EasyPost request
│  + return 202   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Qstash worker  │ ← Processes queue with rate limiting
│  calls EasyPost │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Store in cache │ ← Cache result for 5-15 minutes
│  (Redis/KV)     │
└─────────────────┘
```

**Qstash Configuration:**
```typescript
// src/lib/qstash.ts
import { Client } from '@upstash/qstash';

export const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
});

// Rate limit: 2 requests per second to EasyPost
export const EASYPOST_RATE_LIMIT = {
  requestsPerSecond: 2,
  burstLimit: 5,
};
```

**API Route (async pattern):**
```typescript
// POST /api/shipping/rates
export async function POST(request: NextRequest) {
  const { address, items } = await request.json();
  const cacheKey = generateCacheKey(address, items);

  // Check cache first
  const cached = await kv.get(cacheKey);
  if (cached) return Response.json(cached);

  // Queue the request
  await qstash.publishJSON({
    url: `${process.env.APP_URL}/api/shipping/rates/process`,
    body: { address, items, cacheKey },
    retries: 3,
    delay: 0,
  });

  // Return 202 Accepted with polling endpoint
  return Response.json({
    status: 'processing',
    pollUrl: `/api/shipping/rates/status/${cacheKey}`,
  }, { status: 202 });
}
```

#### Phase 4: Circuit Breaker

Implement circuit breaker pattern for EasyPost:

```typescript
// src/lib/circuit-breaker.ts
interface CircuitState {
  failures: number;
  lastFailure: number;
  state: 'closed' | 'open' | 'half-open';
}

const FAILURE_THRESHOLD = 5;
const RESET_TIMEOUT = 300_000; // 5 minutes

export function shouldAllowRequest(service: string): boolean {
  const state = getCircuitState(service);

  if (state.state === 'open') {
    if (Date.now() - state.lastFailure > RESET_TIMEOUT) {
      // Try half-open
      setCircuitState(service, { ...state, state: 'half-open' });
      return true;
    }
    return false; // Circuit open, use fallback
  }

  return true;
}
```

### Tasks

**Phase 1: Cloudflare WAF (Edge Rate Limiting)**
- [ ] Create shipping API rate limit rule (30 req/min)
- [ ] Create checkout API rate limit rule (15 req/min)
- [ ] Create general API rate limit rule (100 req/min)
- [ ] Test rules don't block legitimate traffic
- [ ] Document rules in `docs/reference/CLOUDFLARE_API.md`

**Phase 2: Frontend Debouncing**
- [ ] Install `use-debounce` package
- [ ] Add 500ms debounce to `useShippingRates`
- [ ] Add 300ms debounce to `useAddressValidation`
- [ ] Test debouncing doesn't affect UX

**Phase 3: Upstash Qstash Integration**
- [ ] Set up Upstash account and Qstash
- [ ] Add `QSTASH_TOKEN` to Infisical and Workers secrets
- [ ] Implement async shipping rates API
- [ ] Add Cloudflare KV for rate caching
- [ ] Create Qstash callback endpoint
- [ ] Implement polling mechanism for frontend
- [ ] Add fallback for when queue is slow

**Phase 4: Circuit Breaker**
- [ ] Implement circuit breaker utility
- [ ] Add to EasyPost API calls
- [ ] Configure failure threshold (5 failures in 60s)
- [ ] Configure reset timeout (5 minutes)
- [ ] Log circuit state changes

**Phase 5: Monitoring & Alerting**
- [ ] Set up Cloudflare Workers analytics alerting
- [ ] Add Qstash dashboard monitoring
- [ ] Create runbook for rate limit incidents
- [ ] Document escalation procedures

### Environment Variables

```bash
# Upstash Qstash (add to Infisical + Cloudflare Workers secrets)
QSTASH_TOKEN=xxx
QSTASH_CURRENT_SIGNING_KEY=xxx
QSTASH_NEXT_SIGNING_KEY=xxx

# Upstash Redis (for caching, optional)
UPSTASH_REDIS_URL=xxx
UPSTASH_REDIS_TOKEN=xxx
```

### Key Files

**New Files:**
- `src/lib/qstash.ts` - Qstash client configuration
- `src/lib/circuit-breaker.ts` - Circuit breaker utility
- `src/app/api/shipping/rates/process/route.ts` - Qstash callback endpoint
- `src/app/api/shipping/rates/status/[key]/route.ts` - Polling endpoint

**Modified Files:**
- `src/hooks/useShippingRates.ts` - Add debouncing, polling support
- `src/hooks/useAddressValidation.ts` - Add debouncing
- `src/app/api/shipping/rates/route.ts` - Async queue pattern
- `src/lib/api/easypost.ts` - Circuit breaker integration

### Success Criteria

- [ ] WAF rules blocking >30 req/min from single IP on /api/shipping
- [ ] No infinite loops can exhaust Workers daily limit
- [ ] EasyPost API calls rate-limited to 2/second via Qstash
- [ ] Circuit breaker activates after 5 consecutive failures
- [ ] Frontend debouncing prevents rapid-fire requests
- [ ] Alerting triggers on abnormal request volumes

### Reference

- [Cloudflare WAF Rate Limiting](https://developers.cloudflare.com/waf/rate-limiting-rules/)
- [Upstash Qstash Documentation](https://upstash.com/docs/qstash/overall/getstarted)
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Postmortem: 2025-12-07 Infinite Loop](../postmortems/2025-12-07-infinite-loop-rate-limit.md)

---

## Success Criteria

### Track 1: Products
- [ ] All 7 products have production images
- [ ] Prices match marketing materials
- [ ] Inventory tracking enabled

### Track 2: Design
- [ ] Consistent visual language across all pages
- [ ] Dark mode fully functional
- [ ] Mobile experience polished

### Track 3: Fulfillment
- [ ] FedEx rates shown in checkout
- [ ] Labels generated automatically
- [ ] Tracking emails sent

### Track 4: Docs
- [x] docs.optic.works live
- [x] Product guides complete (Bed Presence Sensor)
- [x] Navigation link added to main store

### Track 5: Usability
- [ ] WCAG 2.1 AA compliant
- [ ] Usability issues documented
- [ ] Critical fixes implemented

### Track 6: CI/CD
- [ ] Automated deployments working
- [ ] E2E tests in CI
- [ ] Monitoring and alerting active

### Track 7: Rate Limiting
- [ ] Cloudflare WAF rate limiting rules active
- [ ] Frontend debouncing implemented
- [ ] Upstash Qstash buffering EasyPost requests
- [ ] Circuit breaker preventing cascading failures
- [ ] Alerting on abnormal request volumes

---

## Reference

### Previous Phases

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Static Next.js storefront | Complete |
| 1 | Medusa backend deployment | Complete |
| 2 | Medusa API integration | Complete |
| 3 | Full e-commerce functionality | Complete |

### Key Documentation

- `CLAUDE.md` - Agent context and commands
- `docs/SECRETS.md` - Environment variables
- `docs/reference/ARCHITECTURE.md` - System overview
- `docs/reference/archived/PHASE3_PLAN.md` - Previous phase details

### External Resources

- [Medusa FedEx Fulfillment](https://github.com/igorppbr/medusa-fedex-fulfillment)
- [Crossplane Docs (theme reference)](https://github.com/crossplane/docs)
- [docs.crossplane.io (live example)](https://docs.crossplane.io)
- [EasyPost API](https://www.easypost.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
