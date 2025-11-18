# OpticWorks Platform Migration Plan (Bootstrap Edition)

**Document version**: 4.1
**Last updated**: 2025-11-17
**Philosophy**: Deploy fast, test early, expand incrementally, secure from day one

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

## Bootstrap Plan: 4 Phases Over 4 Weeks

### Phase 1: Hetzner Deployment with Cloudflare Tunnel & Single Product Validation (Days 1-5)

**Goal**: Medusa running on Hetzner, exposed via Cloudflare Tunnel at `api.optic.works`, with the Bed Presence Sensor product completing one successful checkout.

**Why Tunnel in Phase 1**:
- SSH is for infrastructure management only (deployment, logs, database admin)
- Application access (Medusa Admin, Store API) should use proper SSL/TLS from day one
- No direct IP exposure or firewall port management
- Production-like environment from the start
- Easier integration testing with storefront

#### Milestone B1: Medusa Running on Hetzner with Cloudflare Tunnel (Day 1-2)

**Deploy steps**:
1. SSH to Hetzner node (credentials in `docs/CONTRIBUTORS.md`)
2. Clone repo to `/opt/opticworks/medusa-backend`
3. Generate secure credentials: `pnpm run generate:secrets`
4. Provision PostgreSQL + Redis: `scripts/hetzner-provision.sh`
5. Install dependencies: `pnpm install`
6. Run migrations: `pnpm run migrate`
7. Build admin dashboard: `pnpm run build`
8. Setup API keys: `pnpm run setup:keys`
9. **Install Cloudflare Tunnel**: `apt install cloudflared`
10. **Authenticate and create tunnel**: `cloudflared tunnel login && cloudflared tunnel create opticworks-medusa`
11. **Configure tunnel** for `api.optic.works` → `localhost:9000`
12. **Install tunnel as systemd service**: `cloudflared service install`
13. **Configure DNS**: Add CNAME `api.optic.works` → tunnel (in Cloudflare dashboard)
14. Start Medusa with PM2: `pnpm run dev:pm2`

**Exit criteria**:
- [ ] `https://api.optic.works/health` returns 200 OK (via tunnel, not direct IP)
- [ ] Medusa Admin accessible at `https://api.optic.works/app`
- [ ] PostgreSQL + Redis running and healthy
- [ ] Cloudflared service running (`systemctl status cloudflared`)
- [ ] SSL/TLS certificate valid (Cloudflare managed)

#### Milestone B2: Single Product Import (Day 2-3)

**Product selection**: Bed Presence Sensor (`bed-presence-sensor`) - flagship product, simplest SKU.

**Import steps**:
1. Access Medusa Admin at `https://api.optic.works/app`
2. Create admin user on first login
3. Manually create Bed Presence Sensor product via Admin UI (verify workflow)
4. Test `GET https://api.optic.works/store/products` returns the product
5. Configure Stripe payment provider in Medusa
6. Create a test cart: `POST https://api.optic.works/store/carts` with Bed Sensor variant

**Exit criteria**:
- [ ] Bed Presence Sensor visible in Medusa Admin at `https://api.optic.works/app`
- [ ] `GET https://api.optic.works/store/products` returns 1 product
- [ ] Product has correct price ($199 USD), image, description
- [ ] Can add product to cart via API (through tunnel)

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

### Phase 4: Storefront Deployment & Webhook Buffering (Days 22-28)

**Goal**: Deploy storefront to Cloudflare Pages, implement webhook buffering, finalize production hardening.

**Context**: Cloudflare Tunnel already configured in Phase 1, so Phase 4 focuses on storefront deployment and production hardening.

#### Milestone P1: Storefront Deployment to Cloudflare Pages (Day 22-24)

**Goal**: Deploy Next.js storefront to Cloudflare Pages with environment variables for production Medusa endpoint.

**Steps**:
1. Connect GitHub repo to Cloudflare Pages
2. Configure build settings:
   - Build command: `pnpm run build`
   - Build output directory: `.next`
   - Root directory: `/`
   - Node version: 20
3. Set environment variables in Cloudflare Pages dashboard:
   ```bash
   NEXT_PUBLIC_MEDUSA_ENABLED=true
   NEXT_PUBLIC_MEDUSA_BASE_URL=https://api.optic.works
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
   # ... other production secrets
   ```
4. Configure custom domain: `optic.works` and `www.optic.works`
5. Enable automatic deployments on `main` branch push
6. Test preview deployments on PRs

**Exit criteria**:
- [ ] Storefront accessible at `https://optic.works`
- [ ] Products load from `https://api.optic.works`
- [ ] Checkout flow completes via tunnel-exposed Medusa
- [ ] Preview deployments work for PRs

#### Milestone P2: Cloudflare Workers Webhook Buffer (Day 24-25)

**Goal**: Deploy Cloudflare Worker to buffer Stripe webhooks and forward to Medusa with retry logic.

**Architecture**:
```
Stripe Webhooks
    ↓
Cloudflare Worker (webhook.optic.works)
    ├─ Validate Stripe signature
    ├─ Store in Durable Object (buffer)
    ├─ Retry with exponential backoff
    └─ Forward to api.optic.works/stripe/hooks
        ↓
    Medusa (via Cloudflare Tunnel)
```

**Implementation**:
1. Create `workers/webhook-buffer/` workspace
2. Implement Worker with:
   - Stripe webhook signature verification
   - Durable Objects for persistent queue
   - Exponential backoff retry (3 attempts)
   - Dead letter queue for failures
3. Deploy Worker to `webhook.optic.works`
4. Update Stripe webhook endpoint to `https://webhook.optic.works`
5. Configure Worker environment variables:
   - `STRIPE_WEBHOOK_SECRET`
   - `MEDUSA_API_URL=https://api.optic.works`
   - `MEDUSA_SECRET_KEY` (secret API key for Medusa admin requests)

**Exit criteria**:
- [ ] Stripe webhooks forwarded successfully
- [ ] Worker retries failed requests (observable in logs)
- [ ] Medusa receives `payment_intent.succeeded` events
- [ ] Order status updates in Admin after payment

#### Milestone P3: Production Environment Hardening (Day 26-28)

**Scope**: SSL/TLS certificates, secrets rotation, monitoring, backup procedures.

**SSL/TLS**:
- Cloudflare automatically provisions SSL for `api.optic.works` via tunnel
- Enable Full (Strict) SSL mode in Cloudflare dashboard
- Force HTTPS redirects for all domains

**Secrets Management**:
- Rotate all Medusa credentials generated in Phase 1
- Store production secrets in Infisical with `production` environment tag
- Document rotation schedule (JWT/Cookie secrets: monthly, DB passwords: quarterly)
- Enable audit logging in Infisical

**Monitoring**:
- Cloudflare Analytics for storefront traffic
- Cloudflare Tunnel metrics for backend connectivity
- Medusa health checks via UptimeRobot: `https://api.optic.works/health`
- Sentry error tracking for storefront (optional)
- PostgreSQL slow query log on Hetzner

**Backups**:
- PostgreSQL daily backups: `pg_dump medusa_db > /backups/medusa-$(date +%Y%m%d).sql`
- Backup retention: 7 daily, 4 weekly, 12 monthly
- Backup storage: Cloudflare R2 with lifecycle rules
- Test restore procedure quarterly

**Firewall**:
- Hetzner firewall: ONLY allow SSH (port 8032) from GitHub Codespaces IPs
- Cloudflare Tunnel handles all public traffic (no direct internet exposure for Medusa)
- Enable Cloudflare WAF for `api.optic.works` and `optic.works`

**Exit criteria**:
- [ ] SSL certificates auto-renew (Cloudflare managed)
- [ ] All production secrets rotated and stored in Infisical
- [ ] Health checks passing for 24 hours
- [ ] Backup restoration tested successfully
- [ ] Firewall rules documented and applied

---

## Phase Summary

| Phase | Timeline | Deliverable | Dependency |
|-------|----------|-------------|------------|
| **Phase 1** | Days 1-5 | Medusa on Hetzner + Cloudflare Tunnel + 1 product checkout | None (start immediately) |
| **Phase 2** | Days 6-12 | Full catalog + storefront integration | Phase 1 complete |
| **Phase 3** | Days 13-21 | Docs + Forum + CI/CD hardening | Phase 2 complete (Docs/Forum can start Day 10) |
| **Phase 4** | Days 22-28 | Storefront deployment + Webhook buffering | Phase 3 complete (can start Day 18) |

## Environment Configuration

### Development (Local)
```bash
# Storefront (.env.local) - Testing against Hetzner Medusa via tunnel
NEXT_PUBLIC_MEDUSA_ENABLED=true
NEXT_PUBLIC_MEDUSA_BASE_URL=https://api.optic.works
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxx
RESEND_API_KEY=re_test_xxx

# Or test against local Medusa (if running services/medusa locally)
NEXT_PUBLIC_MEDUSA_BASE_URL=http://localhost:9000

# Medusa (services/medusa/.env on Hetzner)
POSTGRES_URL=postgresql://medusa_user:<POSTGRES_PASSWORD>@localhost:5432/medusa_db
REDIS_URL=redis://:<REDIS_PASSWORD>@localhost:6379
STRIPE_SECRET_KEY=sk_test_xxx
MEDUSA_SECRET_KEY=<secret-api-key-from-admin-ui>
MEDUSA_ADMIN_EMAIL=admin@optic.works
MEDUSA_ADMIN_PASSWORD=<secure-password>  # fallback auth if secret key unavailable
MEDUSA_BACKEND_URL=https://api.optic.works
```

### Production (Cloudflare + Hetzner)
```bash
# Storefront (Cloudflare Pages env vars)
NEXT_PUBLIC_MEDUSA_ENABLED=true
NEXT_PUBLIC_MEDUSA_BASE_URL=https://api.optic.works
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
RESEND_API_KEY=re_prod_xxx

# Medusa (Hetzner /opt/opticworks/medusa/.env)
POSTGRES_URL=postgresql://medusa:<secure-pw>@localhost:5432/medusa_prod
REDIS_URL=redis://localhost:6379
STRIPE_SECRET_KEY=sk_live_xxx
MEDUSA_SECRET_KEY=<rotate-monthly-via-admin-ui>
MEDUSA_ADMIN_EMAIL=admin@optic.works
MEDUSA_ADMIN_PASSWORD=<secure-password>
MEDUSA_BACKEND_URL=https://api.optic.works

# Cloudflare Tunnel (Hetzner /etc/cloudflared/config.yml)
tunnel: <tunnel-id>
credentials-file: /root/.cloudflared/<tunnel-id>.json
ingress:
  - hostname: api.optic.works
    service: http://localhost:9000
  - service: http_status:404
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
**Phase 3 success**: Docs + Forum live, CI green, ready for production deployment
**Phase 4 success**: Production traffic served via Cloudflare, all services monitored, backups automated

## Risk Mitigation

| Risk | Probability | Mitigation |
|------|-------------|------------|
| Hetzner connectivity issues | Medium | Document SSH access in CONTRIBUTORS.md, use tmux for long-running processes |
| Medusa v2 API changes | Low | Pin `@medusajs/medusa` to specific version in package.json |
| Data loss during migration | Low | PostgreSQL backups before each import script run |
| Stripe integration complexity | Medium | Start with Stripe test mode, validate webhooks before going live |
| E2E test flakiness | High | Use Playwright retry logic, add explicit waits for Stripe Elements |

## Approval & Change Management

**This plan is the new source of truth.** The previous v2.0 track-based plan is **deprecated**.

**Review cadence**:
- Daily standups during Phase 1 (critical path)
- Weekly progress reviews during Phase 2-3
- Final retrospective after Phase 3 (document lessons learned)

**Change requests**: Any deviation from this plan requires updating this document via PR with justification.

---

## Why This Plan Works

1. **Tunnel from day one**: No dual-mode configuration (dev vs prod), secure from the start
2. **SSH for infrastructure only**: Clear separation between deployment (SSH) and application access (tunnel)
3. **Single product validation**: Reduces surface area for first integration
4. **Test-driven**: E2E tests written alongside implementation, not retrofitted
5. **Delete legacy code**: No dual-maintenance burden once Medusa works
6. **Independent tracks**: Docs/Forum don't block commerce migration
7. **Measurable milestones**: Each milestone has concrete exit criteria
8. **Production-grade from Phase 1**: SSL/TLS, no direct IP exposure, proper DNS

**Previous plan failed because**: It optimized for abstraction before validation, and deferred security to "Phase 4."
**This plan succeeds because**: It deploys production-grade infrastructure immediately, validates with working software at every step.
