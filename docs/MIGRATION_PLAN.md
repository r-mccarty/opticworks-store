# OpticWorks Platform Migration Plan (Bootstrap Edition)

**Document version**: 3.0
**Last updated**: 2025-11-16
**Philosophy**: Deploy fast, test early, expand incrementally

This plan replaces the previous waterfall approach. Since the current storefront is **not production**, we can move directly to MedusaJS without maintaining backwards compatibility. The entire strategy focuses on getting a working Medusa backend on Hetzner with one product, then expanding from that validated foundation.

## Core Strategy: Bootstrap → Validate → Expand

### Critical Insight
The previous plan (v2.0) prepared the storefront for a future Medusa backend that didn't exist. **This is backwards.** The new approach:

1. **Deploy Medusa to Hetzner first** (proves infrastructure works)
2. **Add ONE product and complete ONE checkout** (proves commerce flow works)
3. **Write E2E tests against Hetzner** (proves integration is testable)
4. **Migrate remaining catalog incrementally** (expand validated pattern)
5. **Delete legacy Stripe routes** (clean up once Medusa is stable)

## Current State (Baseline)

```
/home/user/opticworks-store/
├── src/                          # Next.js storefront (working, not production)
│   ├── app/api/stripe/*          # Legacy payment routes (will be deleted)
│   ├── lib/products.ts           # Hardcoded catalog (source of truth)
│   └── lib/api/medusa.ts         # Abstraction layer (230 lines, untested)
├── services/medusa/              # Scaffolded workspace (NOT deployed)
│   ├── package.json              # @medusajs/medusa ^2.0.0
│   ├── docker-compose.yml        # Postgres + Redis
│   └── scripts/import-products.ts # Catalog migration script
├── platform/docs-site/           # Hugo scaffold (not built)
├── platform/forum/               # Discourse scaffold (not deployed)
└── docs/                         # Canonical markdown docs
```

**What works**: Storefront displays products, cart state management
**What doesn't work**: Actual checkout (payment routes broken per user report)
**What exists but unproven**: Medusa service layer, scaffolds, migration scripts

## Bootstrap Plan: 3 Phases Over 3 Weeks

### Phase 1: Hetzner Deployment & Single Product Validation (Days 1-5)

**Goal**: Medusa running on Hetzner with the Bed Presence Sensor product, completing one successful checkout.

#### Milestone B1: Medusa Running on Hetzner (Day 1-2)

**Deploy steps**:
1. SSH to Hetzner node (credentials in `docs/CONTRIBUTORS.md`)
2. Clone repo to `/opt/opticworks/medusa-backend`
3. Run `services/medusa/docker-compose.yml` (Postgres + Redis)
4. Install dependencies: `pnpm install --filter @opticworks/medusa-service`
5. Run migrations: `pnpm --filter @opticworks/medusa-service migrate`
6. Start Medusa: `pnpm --filter @opticworks/medusa-service dev`

**Exit criteria**:
- [ ] `http://<hetzner-ip>:9000/health` returns 200 OK
- [ ] Medusa Admin accessible at `http://<hetzner-ip>:9000/app`
- [ ] Postgres + Redis containers healthy (`docker ps`)

#### Milestone B2: Single Product Import (Day 2-3)

**Product selection**: Bed Presence Sensor (`bed-presence-sensor`) - flagship product, simplest SKU.

**Import steps**:
1. Extract Bed Presence Sensor data from `src/lib/products.ts`
2. Manually create product via Medusa Admin UI (verify UI workflow)
3. Test `GET /store/products` returns the product
4. Configure Stripe payment provider in Medusa
5. Create a test cart: `POST /store/carts` with Bed Sensor variant

**Exit criteria**:
- [ ] Bed Presence Sensor visible in Medusa Admin
- [ ] `GET http://<hetzner-ip>:9000/store/products` returns 1 product
- [ ] Product has correct price ($199 USD), image, description
- [ ] Can add product to cart via API

#### Milestone B3: First Checkout E2E Test (Day 3-5)

**Test scenario**: Add Bed Sensor to cart → Complete payment with Stripe test card → Verify order in Medusa Admin.

**Implementation**:
```typescript
// tests/e2e/medusa-checkout.spec.ts
test('Complete checkout for Bed Presence Sensor on Hetzner', async ({ page }) => {
  // 1. Navigate to storefront (localhost or staging)
  await page.goto('http://localhost:3000/products/bed-presence-sensor')

  // 2. Add to cart
  await page.click('[data-testid="add-to-cart"]')

  // 3. Proceed to checkout
  await page.goto('http://localhost:3000/store/checkout')

  // 4. Fill shipping/payment (pointing to Hetzner Medusa)
  // ... Stripe Elements interaction

  // 5. Verify order created in Medusa
  const orderId = await page.textContent('[data-testid="order-id"]')
  const medusaOrder = await fetch(`${HETZNER_MEDUSA_URL}/admin/orders/${orderId}`)
  expect(medusaOrder.status).toBe('pending')
})
```

**Exit criteria**:
- [ ] E2E test passes against Hetzner Medusa instance
- [ ] Playwright test runs in CI (GitHub Actions)
- [ ] Can manually complete checkout from storefront UI
- [ ] Order appears in Medusa Admin with correct line items

---

### Phase 2: Full Catalog Migration & Storefront Integration (Days 6-12)

**Goal**: All products from `src/lib/products.ts` imported into Medusa, storefront fetching live data.

#### Milestone B4: Automated Catalog Import (Day 6-7)

**Script**: `services/medusa/scripts/import-products.ts` (already exists, needs testing)

**Steps**:
1. Review script to ensure it maps all product fields correctly:
   - Core: id, name, description, price, image
   - Metadata: category, specifications, keyBenefits, heroIntro
   - Variants: sensor modes, compatibility flags
2. Run import script against Hetzner Medusa
3. Verify all products via Admin UI and `/store/products` API

**Exit criteria**:
- [ ] All 6-8 products imported (Bed Sensor, Duo Pack, Bridge, Developer Kit, etc.)
- [ ] Product metadata preserved (installation guides, reviews, variants)
- [ ] Images accessible (uploaded to Medusa or linked to existing CDN)
- [ ] Inventory counts set correctly

#### Milestone B5: Storefront Integration (Day 8-10)

**Goal**: Storefront reads from Hetzner Medusa instead of `lib/products.ts`.

**Changes required**:
1. Set environment variables:
   ```bash
   # .env.local
   NEXT_PUBLIC_MEDUSA_ENABLED=true
   NEXT_PUBLIC_MEDUSA_BASE_URL=http://<hetzner-ip>:9000
   MEDUSA_API_TOKEN=<admin-token>
   ```

2. Update `src/lib/api/medusa.ts`:
   - Remove transformation complexity (keep it simple)
   - Directly map Medusa response to Product type
   - Delete fallback logic once Medusa is stable

3. Test product listing page (`/products`)
4. Test product detail pages (`/products/[slug]`)
5. Test cart operations (add/remove/update quantities)

**Exit criteria**:
- [ ] Product listing fetches from Hetzner Medusa
- [ ] Product detail pages render correctly
- [ ] Cart state syncs with Medusa cart API
- [ ] No fallback to `lib/products.ts` needed

#### Milestone B6: Full Checkout Integration (Day 10-12)

**Goal**: Replace legacy `/api/stripe/*` routes with Medusa payment flow.

**Implementation**:
1. Configure Stripe payment provider in Medusa (`medusa-config.ts`)
2. Update checkout page to use Medusa cart API
3. Handle payment via Medusa payment sessions (not direct Stripe)
4. Implement order confirmation flow
5. Set up Medusa webhooks for order events

**Exit criteria**:
- [ ] Checkout completes via Medusa (no legacy Stripe routes)
- [ ] Order confirmation email sent via Medusa + Resend
- [ ] Order history visible in Medusa Admin
- [ ] E2E tests cover all product checkouts (not just Bed Sensor)

---

### Phase 3: Knowledge Systems & Production Hardening (Days 13-21)

**Goal**: Deploy Hugo docs, Discourse forum, and prepare for production traffic.

#### Milestone B7: Hugo Docs Site (Day 13-15)

**Scope**: Standalone documentation site generated from `/docs` markdown.

**Steps**:
1. Configure Hugo in `platform/docs-site/` (already scaffolded)
2. Copy/symlink `/docs/*.md` to `content/` directory
3. Apply Geekdoc theme styling
4. Deploy to Cloudflare Pages or Vercel static hosting
5. Update main site footer to link to docs subdomain

**Exit criteria**:
- [ ] `pnpm docs:dev` runs Hugo server locally
- [ ] `pnpm docs:build` generates static site
- [ ] Docs accessible at `docs.opticworks.io` (or staging URL)
- [ ] Search functionality works

#### Milestone B8: Discourse Forum (Day 16-18)

**Scope**: Community forum for integrator discussions, support threads.

**Steps**:
1. Deploy Discourse via `platform/forum/docker-compose.yml`
2. Apply OpticWorks theme (SCSS/JS in `platform/forum/theme/`)
3. Seed initial categories (Announcements, Integrator Lounge, Support)
4. Configure SMTP for notifications (Resend or dedicated service)
5. Set up admin account and moderation workflow

**Exit criteria**:
- [ ] Forum accessible at `forum.opticworks.io` (or staging)
- [ ] OpticWorks branding applied (logo, colors, fonts)
- [ ] Can create/reply to threads
- [ ] Email notifications work

#### Milestone B9: Production Readiness (Day 19-21)

**Scope**: CI/CD, monitoring, secrets management, rollback procedures.

**CI Pipeline** (GitHub Actions):
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm run lint
      - run: pnpm run build
      - run: pnpm --filter @opticworks/medusa-service build
      - run: pnpm test:e2e  # Playwright tests against staging Medusa
```

**Secrets consolidation**:
- Move all secrets to `/config/.env.production` (template)
- Use environment variable injection (Vercel for storefront, systemd for Medusa)
- Document secrets in `docs/DEPLOYMENT.md`

**Monitoring**:
- Health checks for Medusa (`/health` endpoint)
- Uptime monitoring (UptimeRobot or Cloudflare Workers)
- Error tracking (Sentry or simple log aggregation)

**Exit criteria**:
- [ ] CI runs all tests on every PR
- [ ] Deployment script for Hetzner Medusa (systemd service)
- [ ] Rollback procedure documented (database snapshots, container restart)
- [ ] Monitoring alerts configured

---

## Simplified Track Summary

| Phase | Timeline | Deliverable | Dependency |
|-------|----------|-------------|------------|
| **Phase 1** | Days 1-5 | Medusa on Hetzner + 1 product checkout | None (start immediately) |
| **Phase 2** | Days 6-12 | Full catalog + storefront integration | Phase 1 complete |
| **Phase 3** | Days 13-21 | Docs + Forum + Production hardening | Phase 2 complete (Docs/Forum can start Day 10) |

## Environment Configuration

### Development (Local)
```bash
# Storefront (.env.local)
NEXT_PUBLIC_MEDUSA_ENABLED=true
NEXT_PUBLIC_MEDUSA_BASE_URL=http://localhost:9000
RESEND_API_KEY=re_xxx

# Medusa (services/medusa/.env)
POSTGRES_URL=postgresql://medusa:medusa@localhost:5432/medusa
REDIS_URL=redis://localhost:6379
STRIPE_SECRET_KEY=sk_test_xxx
MEDUSA_ADMIN_TOKEN=<generate-secure-token>
```

### Production (Hetzner)
```bash
# Storefront (Vercel env vars)
NEXT_PUBLIC_MEDUSA_ENABLED=true
NEXT_PUBLIC_MEDUSA_BASE_URL=https://api.opticworks.io
RESEND_API_KEY=re_prod_xxx

# Medusa (Hetzner /opt/opticworks/medusa/.env)
POSTGRES_URL=postgresql://medusa:<secure-pw>@localhost:5432/medusa_prod
REDIS_URL=redis://localhost:6379
STRIPE_SECRET_KEY=sk_live_xxx
MEDUSA_ADMIN_TOKEN=<rotate-monthly>
```

## Deleted Artifacts (Post-Migration Cleanup)

Once Phase 2 is complete and Medusa checkout is stable:

| Path | Action | Reason |
|------|--------|--------|
| `src/app/api/stripe/create-payment-intent/` | **DELETE** | Replaced by Medusa payment sessions |
| `src/app/api/stripe/create-checkout-session/` | **DELETE** | Replaced by Medusa cart API |
| `src/app/api/stripe/webhook/` | **DELETE** | Replaced by Medusa webhooks |
| `src/lib/products.ts` | **ARCHIVE** | Move to `docs/archived/static-catalog.ts` for reference |
| `src/lib/api/medusa.ts` (complex version) | **SIMPLIFY** | Remove transformation logic once catalog is in Medusa |

## Success Metrics

**Phase 1 success**: Can buy Bed Presence Sensor via Medusa on Hetzner in <5 days
**Phase 2 success**: All products purchasable, legacy Stripe routes deleted
**Phase 3 success**: Docs + Forum live, CI green, ready for production traffic

## Risk Mitigation

| Risk | Probability | Mitigation |
|------|-------------|------------|
| Hetzner connectivity issues | Medium | Document SSH access in CONTRIBUTORS.md, use tmux for long-running processes |
| Medusa v2 API changes | Low | Pin `@medusajs/medusa` to specific version in package.json |
| Data loss during migration | Low | PostgreSQL backups before each import script run |
| Stripe integration complexity | Medium | Start with Stripe test mode, validate webhooks before going live |
| E2E test flakiness | High | Use Playwright retry logic, add explicit waits for Stripe Elements |

## Approval & Change Management

**This plan is the new source of truth.** The previous v2.0 plan (waterfall tracks T1-T5) is **deprecated**.

**Review cadence**:
- Daily standups during Phase 1 (critical path)
- Weekly progress reviews during Phase 2-3
- Final retrospective after Phase 3 (document lessons learned)

**Change requests**: Any deviation from this plan requires updating this document via PR with justification.

---

## Why This Plan Works

1. **Hetzner-first**: Proves infrastructure before touching storefront
2. **Single product validation**: Reduces surface area for first integration
3. **Test-driven**: E2E tests written alongside implementation, not retrofitted
4. **Delete legacy code**: No dual-maintenance burden once Medusa works
5. **Independent tracks**: Docs/Forum don't block commerce migration
6. **Measurable milestones**: Each milestone has concrete exit criteria

**Previous plan failed because**: It optimized for abstraction before validation.
**This plan succeeds because**: It optimizes for working software at every step.
