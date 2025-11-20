# OpticWorks Presence Intelligence Platform

**Production e-commerce platform** for OpticWorks' mmWave presence sensing hardware. Built with Next.js 15, Medusa v2, and deployed via Ansible Infrastructure-as-Code.

## Overview

This monorepo powers the complete OpticWorks commercial presence:

- **Storefront** (`src/`): Next.js 15 app with cinematic product storytelling, Stripe checkout, and warranty/support flows
- **Backend** (`services/medusa/`): Medusa v2 e-commerce engine with product catalog API (✅ operational, e-commerce config in Phase 3)
- **Infrastructure** (`infrastructure/ansible/`): Fully automated provisioning playbooks for production deployment (✅ deployed)
- **Platform** (`platform/`): Hugo docs site and Discord community (Phase 3)

**Live Production Endpoints:**
- 🌐 Backend API: `https://api.optic.works` (✅ OPERATIONAL)
- 🛠️ Admin Dashboard: `https://api.optic.works/app` (✅ ACCESSIBLE)
- ✅ Health Check: `https://api.optic.works/health` (✅ LIVE)
- 📦 Store API: `https://api.optic.works/store/*` (✅ 7 PRODUCTS)

**Current Status**: Phase 2 infrastructure deployment complete. Phase 3 e-commerce configuration in planning.

## Quick Start

### Prerequisites

- **Node.js** 18+
- **pnpm** (required - no npm/yarn)
- **Infisical Token** (for secrets management)

### Local Development

```bash
# 1. Clone repository
git clone https://github.com/r-mccarty/opticworks-store.git
cd opticworks-store

# 2. Install dependencies
pnpm install

# 3. Pull secrets from Infisical
# Codespaces: INFISICAL_SERVICE_TOKEN is auto-configured
# Local: export INFISICAL_SERVICE_TOKEN=<your-token>
pnpm run secrets:pull

# 4. Start development server
pnpm run dev  # http://localhost:3000
```

### Required Commands

```bash
pnpm run lint   # ✅ REQUIRED pre-commit
pnpm run test   # ✅ REQUIRED pre-commit (cart coverage)
pnpm run build  # ✅ REQUIRED pre-commit (240s timeout recommended)
```

**Note:** Next.js builds can take 2-3 minutes. Increase CLI timeout if needed.

## Project Status & Roadmap

### ✅ Phase 2: Infrastructure & Backend Deployment (COMPLETE - 2025-11-20)

**Infrastructure operational and validated** - backend deployed, accessible via API, ready for e-commerce configuration.

**Delivered:**
- ✅ Backend at `https://api.optic.works` (Hetzner + Cloudflare Tunnel)
- ✅ PostgreSQL 17 + Redis 7.x operational (proven via API)
- ✅ Medusa v2.11.3 serving Store/Admin APIs (7 products queryable)
- ✅ Admin dashboard accessible with authentication
- ✅ Cloudflare Tunnel configured and routing traffic
- ✅ Infisical secret management integrated
- ✅ Ansible automation preventing infrastructure drift
- ✅ Next.js storefront builds successfully (46 pages)
- ✅ Infrastructure validation suite created

**Validation**: See `docs/PHASE2_VALIDATION_REPORT.md` for complete test results.

**What's Deferred to Phase 3**: Full e-commerce configuration (cart/checkout flow, Medusa regions, payment processing) - infrastructure is ready, configuration is next.

### 📋 Phase 3: Complete E-Commerce Integration (IN PLANNING)

**Transform infrastructure into fully functional e-commerce platform.**

**Core Features:**
- Full cart/checkout flow (Medusa regions, Stripe payments, shipping)
- Customer authentication (Medusa CIAM) + customer portal
- Hookdeck webhook infrastructure (Stripe → Hookdeck → Medusa)
- Discord community (replaces planned Discourse forum)
- Hugo documentation site (`docs.optic.works`)
- Automated E2E testing + CI/CD

**Details**: See `docs/PHASE3_PLAN.md` for comprehensive implementation guide (7 tracks, ~15-20 sessions).

**Status**: Planning complete, ready for implementation. Critical path: Medusa configuration → Cart/Checkout integration.

### 📋 Phase 4: Production Optimization

Cloudflare Pages migration, performance optimization, international expansion.

---

## Architecture

### Deployed Infrastructure (Production)

```
┌─────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE SERVICES                       │
├─────────────────────────────────────────────────────────────┤
│  Pages (optic.works)          Tunnel (api.optic.works)      │
│  ↓ Next.js Storefront         ↓ Medusa Backend Proxy        │
└────────┬──────────────────────────────┬─────────────────────┘
         │                              │
         │                              ↓
         │                    ┌──────────────────────┐
         │                    │  HETZNER CLOUD       │
         │                    │  (Ansible-managed)   │
         │                    ├──────────────────────┤
         │                    │  • PostgreSQL 17     │
         │                    │  • Redis 7.x         │
         │                    │  • Node.js 22        │
         │                    │  • Medusa v2.11.3    │
         │                    │  • PM2 (dev mode)    │
         │                    │  • Cloudflared       │
         │                    └──────────────────────┘
         │
         └──────────────────────────────┘
                  API Calls
```

**Deployment Method:** All infrastructure provisioned via Ansible playbooks in `infrastructure/ansible/`. See `docs/DEPLOYMENT_GUIDE.md` for details.

### Repository Structure

```
/
├── src/                          # Next.js 15 storefront application
│   ├── app/                      # App Router (pages + API routes)
│   │   ├── page.tsx              # Landing page
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Global styles
│   │   ├── siteConfig.ts         # Site configuration
│   │   │
│   │   ├── api/                  # API routes
│   │   │   ├── analytics/        # Analytics endpoints
│   │   │   ├── stripe/           # Stripe integration
│   │   │   ├── email/            # Email service (Resend)
│   │   │   ├── easypost/         # EasyPost shipping integration
│   │   │   ├── shipping/         # Shipping calculations
│   │   │   ├── inventory/        # Inventory checks
│   │   │   └── order-details/    # Order information
│   │   │
│   │   ├── products/             # Product catalog pages
│   │   │   ├── page.tsx          # All products listing
│   │   │   └── [slug]/           # Dynamic product detail pages
│   │   │
│   │   ├── store/                # Shopping experience
│   │   │   ├── page.tsx          # Store main page
│   │   │   └── cart/             # Cart page
│   │   │
│   │   ├── install-guides/       # Installation documentation
│   │   │   ├── page.tsx          # Install guides hub
│   │   │   ├── bed-presence-sensor/
│   │   │   ├── presence-duo-pack/
│   │   │   ├── adjustable-base/
│   │   │   └── cybershade-irx-tesla-model-y/
│   │   │
│   │   └── support/              # Customer support pages
│   │       ├── page.tsx          # Support hub
│   │       ├── faq/              # FAQ page
│   │       ├── contact/          # Contact form
│   │       ├── orders/           # Order tracking
│   │       ├── warranty/         # Warranty claims
│   │       ├── billing/          # Billing help
│   │       ├── compatibility/    # Compatibility checker
│   │       ├── legal/            # Legal pages
│   │       └── oops/             # Error pages
│   │
│   ├── components/
│   │   ├── ui/                   # Tier 1: Shadcn primitives + marketing UI
│   │   │   ├── button.tsx, card.tsx, dialog.tsx, form.tsx, input.tsx
│   │   │   ├── Hero.tsx, Navbar.tsx, Footer.tsx, Features.tsx
│   │   │   ├── PresenceHowItWorks.tsx, TechnicalDifferentiators.tsx
│   │   │   ├── VideoBackground.tsx, GoogleAnalytics.tsx
│   │   │   └── Map/ (map components)
│   │   │
│   │   ├── checkout/             # Stripe Elements integration
│   │   │   ├── CheckoutWrapper.tsx, CheckoutForm.tsx
│   │   │   ├── PaymentForm.tsx, AddressForm.tsx
│   │   │
│   │   ├── products/             # Tier 2: Product marketing components
│   │   │   ├── ProductHero.tsx, ProductDetailView.tsx
│   │   │   ├── BentoProductShowcase.tsx, AnimatedSpecsSection.tsx
│   │   │   ├── dashboard/, developer/, duo-pack/, enclosure/
│   │   │   ├── lab-subscription/, spare-sensor/
│   │   │
│   │   ├── store/                # Store/cart components
│   │   │   ├── CartPage.tsx, ProductGrid.tsx
│   │   │
│   │   ├── support/              # Support page components
│   │   │   ├── SupportHero.tsx, ContactForm.tsx
│   │   │   ├── FAQAccordion.tsx, WarrantyClaimForm.tsx
│   │   │
│   │   ├── 3d/                   # Three.js visualizations
│   │   │   ├── Scene.tsx, Tesla3DViewer.tsx, TeslaModel.tsx
│   │   │
│   │   ├── skeletons/            # Loading skeleton components
│   │   └── theme-provider.tsx, theme-toggle.tsx, Icons.tsx
│   │
│   ├── hooks/                    # Zustand state management stores
│   │   ├── useCart.ts            # Shopping cart state (persisted)
│   │   ├── useCheckoutState.ts   # Checkout flow state (ephemeral)
│   │   └── useSupportStore.ts    # Support form state (persisted)
│   │
│   ├── lib/                      # Utilities and API layer
│   │   ├── utils.ts              # Helper functions (cn/cx classname utils)
│   │   ├── analytics.ts, products.ts, gradients.ts, faqData.ts
│   │   │
│   │   ├── api/                  # API service layer
│   │   │   ├── medusa.ts         # Medusa backend integration
│   │   │   ├── billing.ts, orders.ts, easypost.ts
│   │   │   ├── email.ts, compatibility.ts, tintingLaws.ts
│   │   │
│   │   ├── cart/                 # Cart utilities
│   │   │   ├── types.ts, utils.ts
│   │   │   └── utils.test.ts     # Cart tests (Vitest)
│   │   │
│   │   └── email/templates/      # Email templates
│   │
│   └── types/                    # TypeScript type definitions
│       ├── checkout.ts, stripe-checkout.ts
│
├── services/medusa/              # Medusa v2 backend workspace
│   ├── scripts/                  # 9+ automation scripts
│   │   ├── generate-secrets.ts, health-check.ts
│   │   ├── setup-publishable-key.ts, import-products.ts
│   │   ├── verify-catalog.ts, smoke-test.ts
│   │   ├── utils/ (auth.ts, retry.ts)
│   │
│   ├── medusa-config.ts          # Medusa v2 configuration
│   ├── ecosystem.config.js       # PM2 process management
│   ├── docker-compose.yml        # Local development database
│   ├── .medusa/                  # Generated Medusa internals
│   │   ├── client/ (admin dashboard assets)
│   │   └── types/ (generated type definitions)
│   ├── src/                      # Medusa source code
│   └── logs/                     # Service logs
│
├── infrastructure/ansible/       # Infrastructure-as-Code (IaC)
│   ├── playbooks/                # Ansible playbooks
│   │   ├── medusa-provision.yml  # Full infrastructure provision
│   │   ├── medusa-deploy.yml     # Code update deployment
│   │   └── medusa-destroy.yml    # Infrastructure teardown
│   │
│   ├── roles/                    # Ansible roles
│   │   ├── infrastructure/, postgresql/, redis/
│   │   ├── nodejs/, medusa/, cloudflared/
│   │
│   ├── inventory/production.ini  # Hetzner node inventory
│   ├── group_vars/               # all.yml, secrets.yml
│   ├── scripts/                  # Helper scripts
│   │   └── generate-secrets-from-infisical.sh
│   └── ansible.cfg               # Ansible configuration
│
├── platform/                     # Community & Documentation platforms
│   ├── docs-site/                # Hugo documentation site (Phase 3)
│   │   ├── hugo.toml, netlify.toml
│   │   └── content/
│   │
│   └── forum/                    # Discourse forum (DEPRECATED - replaced by Discord)
│
├── docs/                         # Documentation (source of truth)
│   ├── DEPLOYMENT_GUIDE.md       # ⭐ Infrastructure provisioning
│   ├── CONTRIBUTORS.md           # ⭐ SSH access, dev workflow
│   ├── KEY_MANAGEMENT.md         # ⭐ Infisical secrets (CRITICAL)
│   ├── PHASE2_VALIDATION_REPORT.md  # ⭐ Phase 2 infrastructure validation
│   ├── PHASE2_RECREATION_GUIDE.md   # ⭐ Recreate validated Phase 2 state
│   ├── PHASE3_PLAN.md            # ⭐ Complete e-commerce integration plan
│   ├── INTEGRATION_GUIDE.md      # Storefront-Backend integration
│   ├── CODEBASE_EXPLANATION.md   # Architecture deep dive
│   ├── STATE_MANAGEMENT.md       # Zustand patterns
│   ├── STRIPE_INTEGRATION.md     # Checkout implementation
│   ├── API_STUBS.md, API_ARCHITECTURE.md, CI.md
│   │
│   ├── api/                      # API documentation
│   │   └── medusa-integration.md
│   ├── marketing/                # Marketing & content docs
│   ├── third-party/              # Third-party integration docs
│   ├── issues/                   # Issue tracking & notes
│   │
│   └── archived/                 # Deprecated documentation
│       ├── MIGRATION_PLAN.md, IMPLEMENTATION_GUIDE.md
│       ├── INFISICAL_SETUP.md (superseded by KEY_MANAGEMENT.md)
│       └── RFD-004.md, RFD-005.md, RFD-006.md (resolved)
│
├── public/                       # Static assets
│   ├── fonts/                    # Web fonts (Colfax, Feature Flat, Barlow)
│   └── images/                   # Image assets
│
├── scripts/                      # Root-level automation scripts
│   └── pull-infisical-secrets.sh # Infisical secret sync
│
├── .devcontainer/                # GitHub Codespaces configuration
│   ├── devcontainer.json, Dockerfile
│   └── post-create.sh            # Secret sync hook
│
├── .vscode/                      # VS Code workspace settings
├── archive/                      # Archived code & dependencies
│
├── .env.template                 # Storefront environment variables
├── pnpm-workspace.yaml           # Monorepo workspace config
├── package.json                  # Workspace root dependencies
├── next.config.ts                # Next.js 15 configuration
├── tailwind.config.js            # Tailwind CSS 4 configuration
├── tsconfig.json                 # TypeScript configuration
├── vitest.config.ts              # Vitest test runner config
└── CLAUDE.md / AGENTS.md / README.md
```

## Secret Management (Infisical)

**All secrets are managed via Infisical** - no manual `.env` editing required.

### Codespaces Setup (Automatic)

1. Add `INFISICAL_SERVICE_TOKEN` to GitHub Codespaces repository secrets
2. Devcontainer post-create script auto-syncs `.env.local` on startup
3. Ready to develop immediately

### Local Development

```bash
# 1. Get Infisical service token from team
export INFISICAL_SERVICE_TOKEN=st.xxxxx

# 2. Pull secrets (writes .env.local)
pnpm run secrets:pull

# 3. Verify secrets loaded
cat .env.local | grep NEXT_PUBLIC_MEDUSA_BASE_URL
```

### What's in Infisical

**Complete Variable Inventory**: See `docs/KEY_MANAGEMENT.md` for the definitive list of all ~50 variables organized by service (Medusa, Stripe, Cloudflare, Analytics, etc.), their Infisical paths, rotation schedules, and usage notes.

**Key Variable Categories**:
- **Storefront** (environment: `development` | `staging` | `production`, path: `/`):
  - Medusa integration, Stripe payments, Email, Cloudflare R2/Images
  - Analytics (GA4), Optional: EasyPost, AI/MCP, Supabase

- **Backend** (environment: `production` | `staging`, path: `/medusa`):
  - Database (`DATABASE_URL`), Redis, Auth (`JWT_SECRET`, `COOKIE_SECRET`)
  - Admin credentials, Stripe, CORS configuration

- **Infrastructure** (environment: `production`, path: `/infrastructure`):
  - `POSTGRES_PASSWORD`, Cloudflare Tunnel, Hetzner API token

**Key Management:**
- Secrets auto-rotate: Backend monthly, storefront quarterly/yearly
- Never commit `.env.local` or `services/medusa/.env` to Git
- Use Infisical web UI to add/update secrets for team access
- See `docs/KEY_MANAGEMENT.md` for rotation schedules and procedures

## Development Workflow

### Component Guidelines

**Tier 1 (Shadcn):** Use `cn()` helper, focus on accessibility primitives
```tsx
import { cn } from "@/lib/utils"
<Button className={cn("bg-primary", className)} />
```

**Tier 2 (Marketing):** Use `cx()` helper, premium styling, Framer Motion
```tsx
import { cx } from "@/lib/utils"
<div className={cx("glass-gradient cinematic-reveal", className)} />
```

### State Management (Zustand)

- **`useCart`** - Persisted to localStorage, cart items + totals
- **`useSupportStore`** - Persisted to localStorage, warranty draft state
- **`useCheckoutState`** - Ephemeral, Stripe session + payment status

All stores in `src/hooks/`. See `docs/STATE_MANAGEMENT.md` for patterns.

### API Integration Modes

**Legacy Mode** (`NEXT_PUBLIC_MEDUSA_ENABLED=false`):
- Static products from `src/lib/products.ts`
- Direct Stripe checkout via `src/app/api/stripe/*`

**Medusa Mode** (`NEXT_PUBLIC_MEDUSA_ENABLED=true`):
- Dynamic products from `https://api.optic.works/store/products`
- Cart sessions via Medusa
- Stripe integration via Medusa backend

Toggle in `.env.local` (synced from Infisical).

## Production Deployment

### Backend (Hetzner + Ansible)

**Status:** ✅ LIVE since 2025-11-18

**Infrastructure:**
- Server: Hetzner Cloud (3 vCPU, 4GB RAM)
- Database: PostgreSQL 17
- Cache: Redis 7.x
- Runtime: Node.js 22, pnpm 9.x
- Process Manager: PM2 (running `medusa-dev`)
- Tunnel: Cloudflare Tunnel → `api.optic.works`

**Deployment:**
```bash
cd infrastructure/ansible

# Full provisioning (first time)
ansible-playbook playbooks/medusa-provision.yml

# Code updates only
ansible-playbook playbooks/medusa-deploy.yml

# Teardown for rebuild
ansible-playbook playbooks/medusa-destroy.yml
```

See `docs/DEPLOYMENT_GUIDE.md` for complete provisioning guide.

**Health Check:**
```bash
curl https://api.optic.works/health
# Expected: OK
```

**Admin Access:**
- URL: `https://api.optic.works/app`
- Credentials: See Infisical (`MEDUSA_ADMIN_EMAIL`, `MEDUSA_ADMIN_PASSWORD`)

### Storefront (Cloudflare Pages)

**Status:** 🔜 Phase 4 (pending)

Deployment will use:
- Build command: `pnpm run build`
- Output directory: `.next`
- Environment variables: Auto-synced from Infisical
- Custom domain: `optic.works`

## Testing

```bash
# Unit tests (cart logic, utilities)
pnpm run test

# Type checking
pnpm run build  # Strict TypeScript validation

# Linting
pnpm run lint
```

**Coverage Focus:**
- Cart state normalization
- Stripe checkout flows
- Product variant selection
- Support form persistence

## Contributing

### Before Opening PRs

1. ✅ Run `pnpm run lint` (must pass)
2. ✅ Run `pnpm run test` (must pass)
3. ✅ Run `pnpm run build` (must compile)
4. 📝 Reference RFD if architectural change

### Development Environment

**Codespaces (Recommended):**
- Pre-configured with pnpm, Hugo, SSH keys
- Infisical auto-sync on startup
- Hetzner SSH access verified (`ssh hetzner-node`)

**Local:**
- Install Node.js 18+, pnpm, Infisical CLI
- Export `INFISICAL_SERVICE_TOKEN` before `pnpm run secrets:pull`
- See `docs/CONTRIBUTORS.md` for SSH setup

## Documentation

### Active Guides

**Infrastructure & Deployment:**
- **[DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)** - Infrastructure provisioning via Ansible
- **[CONTRIBUTORS.md](docs/CONTRIBUTORS.md)** - Dev setup, SSH access, Hetzner workflow
- **[KEY_MANAGEMENT.md](docs/KEY_MANAGEMENT.md)** - Secret rotation and Infisical strategy

**Development & Integration:**
- **[INTEGRATION_GUIDE.md](docs/INTEGRATION_GUIDE.md)** - Storefront-Backend integration walkthrough
- **[CODEBASE_EXPLANATION.md](docs/CODEBASE_EXPLANATION.md)** - Architecture patterns
- **[STATE_MANAGEMENT.md](docs/STATE_MANAGEMENT.md)** - Zustand store design
- **[STRIPE_INTEGRATION.md](docs/STRIPE_INTEGRATION.md)** - Checkout implementation
- **[API_STUBS.md](docs/API_STUBS.md)** - API design patterns

**Phase Documentation:**
- **[PHASE2_VALIDATION_REPORT.md](docs/PHASE2_VALIDATION_REPORT.md)** - Phase 2 validation results and infrastructure proof
- **[PHASE2_RECREATION_GUIDE.md](docs/PHASE2_RECREATION_GUIDE.md)** - How to recreate validated Phase 2 state
- **[PHASE3_PLAN.md](docs/PHASE3_PLAN.md)** - Complete e-commerce integration plan (7 tracks)

### Archived Guides

- **[archived/MIGRATION_PLAN.md](docs/archived/)** - Deprecated manual deployment plan
- **[archived/IMPLEMENTATION_GUIDE.md](docs/archived/)** - Deprecated manual runbooks
- **[archived/DEVELOPMENT_SCORECARD.md](docs/archived/)** - Deprecated progress tracker
- **[archived/INFISICAL_SETUP.md](docs/archived/)** - Deprecated (Infisical now active)
- **[archived/RFD-004.md](docs/archived/)** - Infrastructure automation (resolved, archived)
- **[archived/RFD-005.md](docs/archived/)** - JWT authentication (implemented, archived)
- **[archived/RFD-006.md](docs/archived/)** - Deployment drift (resolved via Ansible, archived)

## Roadmap

### ✅ Phase 1: Backend Infrastructure (COMPLETE - 2025-11-18)
- ✅ Ansible Infrastructure-as-Code
- ✅ Hetzner backend provisioned
- ✅ PostgreSQL 17 + Redis operational
- ✅ Medusa v2 serving at `api.optic.works`
- ✅ Admin dashboard accessible
- ✅ Product catalog synced (7 products)

### ✅ Phase 2: Infrastructure & Backend Deployment (COMPLETE - 2025-11-20)
- ✅ Backend deployed and accessible at `api.optic.works`
- ✅ Database operational (proven via API queries)
- ✅ Medusa Store API serving products
- ✅ Admin API authenticated and working
- ✅ Cloudflare Tunnel routing traffic
- ✅ Infisical secret management integrated
- ✅ Ansible automation preventing drift
- ✅ Next.js storefront builds successfully
- ✅ E2E validation suite created

**Note**: Phase 2 focused on infrastructure deployment and operational readiness. E-commerce configuration (cart/checkout, regions, payments) is Phase 3 scope.

### 📋 Phase 3: Complete E-Commerce Integration (IN PLANNING)
**7 Implementation Tracks** (see `docs/PHASE3_PLAN.md` for details):
- [ ] **Track 1**: Medusa e-commerce configuration (regions, payments, shipping)
- [ ] **Track 2**: Cart & checkout integration (full customer purchase flow)
- [ ] **Track 3**: Hookdeck webhook infrastructure (Stripe → Hookdeck → Medusa)
- [ ] **Track 4**: Customer authentication & portal (Medusa CIAM)
- [ ] **Track 5**: Discord integration (community server + bot)
- [ ] **Track 6**: Hugo documentation site (`docs.optic.works`)
- [ ] **Track 7**: CI/CD hardening (E2E tests, deployment automation)

**Estimated Effort**: ~15-20 implementation sessions

### 📋 Phase 4: Production Optimization
- [ ] Migrate storefront from Vercel to Cloudflare Pages
- [ ] Performance optimization (Core Web Vitals)
- [ ] SEO finalization
- [ ] International expansion (EU region, multi-currency)
- [ ] Advanced features (subscriptions, bundles, pre-orders)

## Key Contacts & Resources

- **Repository:** https://github.com/r-mccarty/opticworks-store
- **Backend API:** https://api.optic.works
- **Admin Dashboard:** https://api.optic.works/app
- **Infisical Project:** OpticWorks (production + development environments)
- **Ansible Inventory:** `infrastructure/ansible/inventory/production.ini`

## License

Proprietary - OpticWorks, Inc.
