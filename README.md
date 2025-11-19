# OpticWorks Presence Intelligence Platform

**Production e-commerce platform** for OpticWorks' mmWave presence sensing hardware. Built with Next.js 15, Medusa v2, and deployed via Ansible Infrastructure-as-Code.

## Overview

This monorepo powers the complete OpticWorks commercial presence:

- **Storefront** (`src/`): Next.js 15 app with cinematic product storytelling, Stripe checkout, and warranty/support flows
- **Backend** (`services/medusa/`): Medusa v2 e-commerce engine with product catalog, cart, and payment processing
- **Infrastructure** (`infrastructure/ansible/`): Fully automated provisioning playbooks for production deployment
- **Platform** (`platform/`): Hugo docs site and Discourse forum (Phase 3)

**Live Production:**
- 🌐 Backend API: `https://api.optic.works`
- 🛠️ Admin Dashboard: `https://api.optic.works/app`
- ✅ Health: `https://api.optic.works/health`

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
│   │   ├── api/                  # Stripe, email, webhooks
│   │   ├── products/             # Product catalog pages
│   │   ├── store/                # Cart, checkout, order success
│   │   └── support/              # Warranty, RMA, contact
│   ├── components/
│   │   ├── ui/                   # Shadcn primitives (Tier 1)
│   │   ├── checkout/             # Stripe Elements integration
│   │   ├── products/             # Product marketing components (Tier 2)
│   │   └── 3d/                   # Three.js sensor visualizations
│   ├── hooks/                    # Zustand stores (cart, checkout, support)
│   └── lib/
│       ├── api/                  # Service layer for backend calls
│       └── products.ts           # Static product catalog (fallback)
│
├── services/medusa/              # Medusa v2 backend workspace
│   ├── scripts/                  # 17 automation scripts (setup, catalog, health)
│   ├── medusa-config.ts          # Medusa configuration
│   ├── ecosystem.config.js       # PM2 process management
│   └── .env.example              # Backend credentials template
│
├── infrastructure/ansible/       # Infrastructure-as-Code
│   ├── roles/                    # postgresql, redis, nodejs, medusa, cloudflared
│   ├── playbooks/                # provision, deploy, destroy
│   ├── inventory/                # production.ini (Hetzner node)
│   └── group_vars/               # all.yml, secrets.yml
│
├── platform/
│   ├── docs-site/                # Hugo + Geekdoc (Phase 3)
│   └── forum/                    # Discourse config (Phase 3)
│
├── docs/                         # Documentation
│   ├── DEPLOYMENT_GUIDE.md       # Infrastructure deployment & provisioning
│   ├── CONTRIBUTORS.md           # SSH access, dev workflow, Hetzner setup
│   ├── CODEBASE_EXPLANATION.md   # Architecture deep dive
│   ├── STATE_MANAGEMENT.md       # Zustand patterns
│   ├── STRIPE_INTEGRATION.md     # Checkout flow
│   ├── RFD-*.md                  # Architecture decision records
│   └── archived/                 # Deprecated guides
│
├── .env.template                 # Storefront environment variables
├── pnpm-workspace.yaml           # Monorepo workspace config
└── CLAUDE.md / AGENTS.md         # AI collaboration context
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

- **[DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)** - Infrastructure provisioning via Ansible
- **[CONTRIBUTORS.md](docs/CONTRIBUTORS.md)** - Dev setup, SSH access, Hetzner workflow
- **[INTEGRATION_GUIDE.md](docs/INTEGRATION_GUIDE.md)** - Storefront-Backend integration walkthrough
- **[KEY_MANAGEMENT.md](docs/KEY_MANAGEMENT.md)** - Secret rotation and Infisical strategy
- **[CODEBASE_EXPLANATION.md](docs/CODEBASE_EXPLANATION.md)** - Architecture patterns
- **[STATE_MANAGEMENT.md](docs/STATE_MANAGEMENT.md)** - Zustand store design
- **[STRIPE_INTEGRATION.md](docs/STRIPE_INTEGRATION.md)** - Checkout implementation
- **[API_STUBS.md](docs/API_STUBS.md)** - API design patterns

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
- Ansible Infrastructure-as-Code
- Hetzner backend provisioned
- PostgreSQL 17 + Redis operational
- Medusa v2 serving at `api.optic.works`
- Admin dashboard accessible
- Product catalog synced

### 🔄 Phase 2: Storefront Integration (IN PROGRESS)
- [ ] Integrate Next.js storefront with Medusa API
- [ ] E2E checkout testing (Medusa → Stripe)
- [ ] Verify product catalog rendering
- [ ] Test cart sessions and payment flows
- [ ] Sync production secrets to Infisical

### 📋 Phase 3: Documentation & Community
- [ ] Deploy Hugo docs site
- [ ] API documentation generation
- [ ] Discourse forum setup
- [ ] CI/CD pipeline hardening

### 📋 Phase 4: Production Storefront
- [ ] Cloudflare Pages deployment
- [ ] Webhook buffering (Durable Objects)
- [ ] Performance optimization
- [ ] SEO finalization

## Key Contacts & Resources

- **Repository:** https://github.com/r-mccarty/opticworks-store
- **Backend API:** https://api.optic.works
- **Admin Dashboard:** https://api.optic.works/app
- **Infisical Project:** OpticWorks (production + development environments)
- **Ansible Inventory:** `infrastructure/ansible/inventory/production.ini`

## License

Proprietary - OpticWorks, Inc.
