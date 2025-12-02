# OpticWorks Presence Intelligence Platform

**Production e-commerce platform** for OpticWorks' mmWave presence sensing hardware. Built with Next.js 15, Medusa v2, and deployed via Ansible Infrastructure-as-Code.

## Overview

This monorepo powers the complete OpticWorks commercial presence:

- **Storefront** (`src/`): Next.js 15 app with cinematic product storytelling, Stripe checkout, and warranty/support flows
- **Backend** (`services/medusa/`): Medusa v2 e-commerce engine with product catalog API (✅ operational, e-commerce config in Phase 3)
- **Infrastructure** (`infrastructure/ansible/`): Fully automated provisioning playbooks for production deployment (✅ deployed)
- **Platform** (`platform/`): Hugo docs site and Discord community (Deferred to Phase 4)

**Live Production Endpoints:**
- 🌐 Backend API: `https://api.optic.works` (✅ OPERATIONAL)
- 🛠️ Admin Dashboard: `https://api.optic.works/app` (✅ ACCESSIBLE)
- ✅ Health Check: `https://api.optic.works/health` (✅ LIVE)
- 📦 Store API: `https://api.optic.works/store/*` (✅ 7 PRODUCTS)

**Current Status**: Phase 2 storefront-backend integration complete. Phase 3 Medusa e-commerce migration ready for implementation (docs site + Discord deferred to Phase 4).

## Quick Start

### Prerequisites

- **Node.js** 18+ (20+ recommended, 22 in production)
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
pnpm run lint                     # ✅ REQUIRED pre-commit
pnpm run test                     # ✅ REQUIRED pre-commit
unset NODE_ENV && pnpm run build  # ✅ REQUIRED pre-commit (2-3 min)
```

**Note:** The `unset NODE_ENV` is required in Codespaces. See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for build quirks and workarounds.

## Roadmap (Phases 0-4)

**Current Status**: Phase 3 in progress. Tracks 1-4 complete (regions, products, cart, checkout). Tracks 5-7 pending (webhooks docs, auth, testing).

### ✅ Phase 0: Storefront Foundation (COMPLETE - 2025-11-15)
- Next.js 15 storefront with App Router and cinematic marketing pages
- Static product catalog and direct Stripe checkout (no backend)
- Shadcn + Tailwind UI/UX, Three.js product visualizations
- Support pages and installation guides

### ✅ Phase 1: Backend Infrastructure Deployment (COMPLETE - 2025-11-18)
- Manual deployment of Medusa v2.11.3 to Hetzner (PostgreSQL 17, Redis 7.x, Node.js 22, PM2)
- Cloudflare Tunnel configured → `https://api.optic.works` with admin dashboard at `/app`
- Initial product catalog API serving 7 products
- Ansible Infrastructure-as-Code retrofit for provisioning, deploy, and destroy playbooks

### ✅ Phase 2: Storefront-Backend Integration (COMPLETE - 2025-11-20)
- Next.js storefront integrated with Medusa Store API (dynamic products)
- Build optimizations and TypeScript configuration tuned for 46-page production builds
- Infisical CLI workflow for secrets; Supabase made optional
- Infrastructure validation and E2E coverage for the integrated stack

### 🚧 Phase 3: Complete E-Commerce Migration (IN PROGRESS)

**Completed (2025-12-02):**
- ✅ **Track 1: Backend Configuration** – US region with Stripe payment provider
- ✅ **Track 2: Products API Integration** – Dynamic products with static fallback
- ✅ **Track 3: Cart API Integration** – Hybrid local + Medusa cart sync
- ✅ **Track 4: Checkout Flow Migration** – Medusa payment sessions, cart completion

**Pending:**
- 📋 **Track 5: Webhook Documentation** – Hookdeck configured, needs documentation
- 📋 **Track 6: Customer Authentication** – RFD-008 drafted, implementation pending
- 📋 **Track 7: E2E Testing** – Blocked on Track 6

**Known Issues:** Email system stubbed due to @react-email/Next.js conflict ([RFD-009](docs/RFD-009-nextjs-build-ssg-error.md)). Will restore via Medusa notifications in Phase 4.

### 📋 Phase 4: Platform & Production Optimization (PLANNED)
- Discord community + bot, Hugo docs site
- CI/CD hardening beyond checkout, performance and SEO optimization
- Cloudflare Pages migration and internationalization

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
         │                    ┌───────────────────────────┐
         │                    │  HETZNER CLOUD            │
         │                    │  (3 vCPU, 4GB RAM)        │
         │                    │  Ansible-managed          │
         │                    ├───────────────────────────┤
         │                    │  • PostgreSQL 17          │
         │                    │  • Redis 7.x              │
         │                    │  • Node.js 22             │
         │                    │  • Medusa v2.11.3         │
         │                    │  • PM2 (dev mode)         │
         │                    │  • Cloudflared            │
         │                    └───────────────────────────┘
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

**Current Mode: Medusa (Production)** (`NEXT_PUBLIC_MEDUSA_ENABLED=true`):
- ✅ Dynamic products from `https://api.optic.works/store/products`
- ✅ Cart sessions via Medusa
- ✅ Stripe integration via Medusa backend
- **Status**: Active since Phase 2 (2025-11-20)

**Legacy Mode** (`NEXT_PUBLIC_MEDUSA_ENABLED=false`) - *Deprecated*:
- Static products from `src/lib/products.ts`
- Direct Stripe checkout via `src/app/api/stripe/*`
- **Status**: Maintained for reference only, use Medusa mode

Configuration managed in `.env.local` (synced from Infisical).

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

### Core References
- **[PROJECT_TIMELINE_AUDIT.md](docs/PROJECT_TIMELINE_AUDIT.md)** – Source of truth for Phases 0-4 definitions and evidence
- **[PHASE3_PLAN.md](docs/PHASE3_PLAN.md)** – Complete Phase 3 migration plan and track breakdown
- **[PHASE2_VALIDATION_REPORT.md](docs/PHASE2_VALIDATION_REPORT.md)** – Infrastructure and integration validation proof
- **[PHASE2_RECREATION_GUIDE.md](docs/PHASE2_RECREATION_GUIDE.md)** / **[PHASE2_INTEGRATION_SUMMARY.md](docs/PHASE2_INTEGRATION_SUMMARY.md)** – How to recreate the validated Phase 2 state and lessons learned

### Operations & Security
- **[KEY_MANAGEMENT.md](docs/KEY_MANAGEMENT.md)** – Infisical inventory, rotation policy, and usage
- **[DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)** – Ansible workflows for provisioning, deploy, and teardown
- **[CONTRIBUTORS.md](docs/CONTRIBUTORS.md)** – Local/Codespaces setup, SSH access, and team workflows
- **[INFISICAL_AUTOMATION.md](docs/INFISICAL_AUTOMATION.md)** / **[KEY_MANAGEMENT_AUDIT.md](docs/KEY_MANAGEMENT_AUDIT.md)** – Secret automation steps and audit trail

### Development & Integration
- **[INTEGRATION_GUIDE.md](docs/INTEGRATION_GUIDE.md)** – Storefront ↔ Medusa integration walkthrough
- **[STRIPE_INTEGRATION.md](docs/STRIPE_INTEGRATION.md)** – Checkout flow implementation
- **[STATE_MANAGEMENT.md](docs/STATE_MANAGEMENT.md)** – Zustand patterns for cart/support flows
- **[CODEBASE_EXPLANATION.md](docs/CODEBASE_EXPLANATION.md)** / **[API_ARCHITECTURE.md](docs/API_ARCHITECTURE.md)** / **[API_STUBS.md](docs/API_STUBS.md)** – Architecture and API design references
- **[BUILD_CONFIGURATION.md](docs/BUILD_CONFIGURATION.md)** / **[MEDUSA_MODULES_REVIEW.md](docs/MEDUSA_MODULES_REVIEW.md)** – Build tuning notes and Medusa module decisions

### Archived (Deprecated)
- **[archived/DOCUMENTATION_CLEANUP_2025-11-19.md](docs/archived/DOCUMENTATION_CLEANUP_2025-11-19.md)** – Historical documentation cleanup log (archived)
- **[archived/MIGRATION_PLAN.md](docs/archived/MIGRATION_PLAN.md)** and **[archived/IMPLEMENTATION_GUIDE.md](docs/archived/IMPLEMENTATION_GUIDE.md)** – Deprecated manual deployment/runbooks
- **[archived/INFISICAL_SETUP.md](docs/archived/INFISICAL_SETUP.md)** and **[archived/INFISICAL_SECRETS_INVENTORY.md](docs/archived/INFISICAL_SECRETS_INVENTORY.md)** – Superseded by `KEY_MANAGEMENT.md`
- **[archived/DEVELOPMENT_SCORECARD.md](docs/archived/DEVELOPMENT_SCORECARD.md)** – Deprecated progress tracker
- **[archived/RFD-004.md](docs/archived/RFD-004.md)** / **[archived/RFD-005.md](docs/archived/RFD-005.md)** / **[archived/RFD-006.md](docs/archived/RFD-006.md)** – Resolved RFCs archived for reference

> Deprecated documents have been relocated to `docs/archived/` to reduce confusion; rely on the core references above for current workflows and roadmap context.

## Key Contacts & Resources

- **Repository:** https://github.com/r-mccarty/opticworks-store
- **Backend API:** https://api.optic.works
- **Admin Dashboard:** https://api.optic.works/app
- **Infisical Project:** OpticWorks (production + development environments)
- **Ansible Inventory:** `infrastructure/ansible/inventory/production.ini`

## License

Proprietary - OpticWorks, Inc.
