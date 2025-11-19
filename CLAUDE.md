# CLAUDE.md

Canonical guidance for the **OpticWorks Presence Intelligence Platform**. This monorepo powers the complete OpticWorks e-commerce platform with Next.js storefront and Medusa v2 backend. `AGENTS.md` must mirror this file (hard link or identical copy).

## Platform Snapshot (Updated 2025-11-19)

**Hardware**: Bed/under-mattress mmWave presence sensors, bridges, integrator kits, developer firmware program.

**Experience**: Apple-grade art direction, cinematic landing/product flows, Three.js sensor visualizations, premium checkout.

**Stack**: Next.js 15 (App Router, React 19), Tailwind 4, Shadcn Tier‑1 controls + bespoke Tier‑2 UI (`cn`/`cx` helpers), Zustand stores, Stripe + Resend APIs, Framer Motion + Three.js scenes.

**Production Architecture**:
- **Storefront**: Currently on Vercel, migrating to Cloudflare Pages (Phase 4)
- **Backend**: Hetzner Cloud (✅ LIVE at `api.optic.works`)
  - PostgreSQL 17, Redis 7.x, Node.js 22, Medusa v2.11.3, PM2
  - Provisioned via Ansible Infrastructure-as-Code
  - Cloudflare Tunnel for public API access
- **Development**: GitHub Codespaces (full network access, SSH to Hetzner)
- **Secrets**: Infisical (active, source of truth for all environment variables)
- **Deployment**: Ansible playbooks prevent infrastructure drift

**Critical: Preventing Drift**
- Backend infrastructure is managed by Ansible (`infrastructure/ansible/`)
- When Medusa code changes are pushed to GitHub, run `ansible-playbook playbooks/medusa-deploy.yml` to sync the Hetzner node
- Never manually modify production services - always use Ansible to maintain consistency

## Live Production Endpoints

- 🌐 Backend API: `https://api.optic.works`
- 🛠️ Admin Dashboard: `https://api.optic.works/app`
- ✅ Health Check: `https://api.optic.works/health`
- 📦 Store API: `https://api.optic.works/store/*`

## Repository Structure

```
/
├── src/                          # Next.js 15 storefront application
│   ├── app/                      # App Router (pages + API routes)
│   ├── components/
│   │   ├── ui/                   # Shadcn primitives (Tier 1)
│   │   ├── checkout/             # Stripe Elements integration
│   │   ├── products/             # Product marketing components (Tier 2)
│   │   └── 3d/                   # Three.js sensor visualizations
│   ├── hooks/                    # Zustand stores (cart, checkout, support)
│   └── lib/                      # API service layer, utilities
│
├── services/medusa/              # Medusa v2 backend workspace
│   ├── scripts/                  # 17 automation scripts
│   ├── medusa-config.ts          # Medusa configuration
│   └── ecosystem.config.js       # PM2 process management
│
├── infrastructure/ansible/       # Infrastructure-as-Code (IaC)
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
│   ├── DEPLOYMENT_GUIDE.md       # ⭐ Current infrastructure guide
│   ├── CONTRIBUTORS.md           # ⭐ SSH access, dev workflow
│   ├── CODEBASE_EXPLANATION.md   # Architecture deep dive
│   ├── STATE_MANAGEMENT.md       # Zustand patterns
│   ├── STRIPE_INTEGRATION.md     # Checkout flow
│   ├── RFD-*.md                  # Architecture decision records
│   └── archived/                 # Deprecated guides (see below)
│
├── .env.template                 # Storefront env vars (Infisical-managed)
└── README.md / AGENTS.md / CLAUDE.md
```

### Active vs. Archived Documentation

**Active Guides** (use these):
- `docs/DEPLOYMENT_GUIDE.md` - Infrastructure provisioning via Ansible
- `docs/CONTRIBUTORS.md` - Dev setup, SSH access, Hetzner workflow
- `docs/INTEGRATION_GUIDE.md` - Storefront-Backend integration walkthrough
- `docs/KEY_MANAGEMENT.md` - Secret rotation and Infisical strategy
- `docs/CODEBASE_EXPLANATION.md` - Architecture patterns
- `docs/STATE_MANAGEMENT.md` - Zustand store design
- `docs/STRIPE_INTEGRATION.md` - Checkout implementation
- `docs/API_STUBS.md` - API design patterns
- `infrastructure/ansible/README.md` - Ansible deployment guide

**Archived Guides** (historical reference only):
- `docs/archived/MIGRATION_PLAN.md` - Deprecated manual deployment plan
- `docs/archived/IMPLEMENTATION_GUIDE.md` - Deprecated manual runbooks
- `docs/archived/DEVELOPMENT_SCORECARD.md` - Deprecated progress tracker
- `docs/archived/INFISICAL_SETUP.md` - Deprecated (Infisical now active)
- `docs/archived/CLOUDFLARE_ACCESS_SETUP.md` - Deprecated (not implemented)
- `docs/archived/RFD-004.md` - Infrastructure automation (resolved)
- `docs/archived/RFD-005.md` - JWT authentication (implemented)
- `docs/archived/RFD-006.md` - Deployment drift (resolved via Ansible)

## Development Environment

**Primary: GitHub Codespaces** (Recommended)
- Pre-configured devcontainer with pnpm, Hugo, SSH keys, Infisical CLI
- Full network access (can SSH to Hetzner node)
- Auto-syncs secrets from Infisical on startup via `INFISICAL_SERVICE_TOKEN`
- Hetzner SSH access verified automatically (`ssh hetzner-node`)
- Zero configuration required for team members

**Local Development**:
```bash
# 1. Clone repository
git clone https://github.com/r-mccarty/opticworks-store.git
cd opticworks-store

# 2. Install dependencies
pnpm install

# 3. Pull secrets from Infisical
# Get INFISICAL_SERVICE_TOKEN from team, then:
export INFISICAL_SERVICE_TOKEN=st.xxxxx
pnpm run secrets:pull  # Writes .env.local

# 4. Start development server
pnpm run dev  # http://localhost:3000
```

**Required Before Commits**:
```bash
pnpm run lint   # ✅ Must pass
pnpm run test   # ✅ Must pass
pnpm run build  # ✅ Must pass (use 240s timeout)
```

## Secret Management (Infisical)

**Status**: ✅ Active and adopted (source of truth for all secrets)

All environment variables are managed via Infisical - no manual `.env` editing required.

**What's in Infisical**:

**Storefront** (environment: `development`, path: `/`):
- Medusa integration: `NEXT_PUBLIC_MEDUSA_BASE_URL`, `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`
- Stripe: `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`
- Email: `RESEND_API_KEY`
- ~25 more environment-specific variables

**Backend** (environment: `production`, path: `/medusa`):
- Database: `DATABASE_URL` (PostgreSQL connection)
- Auth: `JWT_SECRET`, `COOKIE_SECRET`
- Admin: `MEDUSA_ADMIN_EMAIL`, `MEDUSA_ADMIN_PASSWORD`
- Services: Stripe, Redis, CORS configuration

**Team Workflow**:
1. Add `INFISICAL_SERVICE_TOKEN` to GitHub Codespaces repository secrets
2. Codespaces auto-syncs `.env.local` via post-create script
3. Update secrets via Infisical web UI for team access
4. Never commit `.env.local` or `services/medusa/.env` to Git

## Production Deployment

### Backend (Hetzner + Ansible IaC)

**Status**: ✅ LIVE since 2025-11-18

**Infrastructure**:
- Server: Hetzner Cloud (3 vCPU, 4GB RAM)
- Database: PostgreSQL 17
- Cache: Redis 7.x
- Runtime: Node.js 22, pnpm 9.x
- Process Manager: PM2 (running `medusa-dev`)
- Public Access: Cloudflare Tunnel → `api.optic.works`

**Deployment Commands**:
```bash
cd infrastructure/ansible

# Full provisioning (first time or clean rebuild)
ansible-playbook playbooks/medusa-provision.yml

# Code updates only (CRITICAL: run this when Medusa code changes)
ansible-playbook playbooks/medusa-deploy.yml

# Complete teardown (for rebuilds)
ansible-playbook playbooks/medusa-destroy.yml
```

**Preventing Drift**:
- All infrastructure changes MUST go through Ansible playbooks
- When Medusa code is pushed to GitHub, sync to Hetzner with `medusa-deploy.yml`
- Never manually modify services on the Hetzner node
- See `docs/DEPLOYMENT_GUIDE.md` and `infrastructure/ansible/README.md`

**SSH Access** (via GitHub Codespaces):
```bash
# Check service status
ssh hetzner-node
pm2 status                # Check service status
pm2 logs medusa-dev       # View logs
pm2 restart medusa-dev    # Restart service

# Health check
curl https://api.optic.works/health
```

See `docs/CONTRIBUTORS.md` for SSH setup and troubleshooting.

### Storefront Deployment

**Current**: Vercel (temporary)
**Planned**: Cloudflare Pages (Phase 4)

Phase 4 migration will include:
- Build command: `pnpm run build`
- Environment variables: Auto-synced from Infisical
- Custom domain: `optic.works`
- Webhook buffering: Cloudflare Workers with Durable Objects

## Common Workflows

### 1. Local Development
```bash
pnpm install
pnpm run dev          # localhost:3000 (needs .env.local from Infisical)
pnpm run lint         # Required before PR
pnpm run test         # Vitest cart coverage
pnpm run build        # Required before PR (240s timeout recommended)
pnpm run start        # Verify production build
```

**Important**:
- Use pnpm only (no npm/yarn)
- Keep TypeScript strict, no `any`
- Next.js builds take 2-3 minutes, increase CLI timeout to ~240s

### 2. Tiered UI Components

**Tier 1 (Shadcn)**: Use `cn()` helper, focus on accessibility primitives
```tsx
import { cn } from "@/lib/utils"
<Button className={cn("bg-primary", className)} />
```

**Tier 2 (Marketing)**: Use `cx()` helper, premium styling, Framer Motion
```tsx
import { cx } from "@/lib/utils"
<div className={cx("glass-gradient cinematic-reveal", className)} />
```

### 3. State Management (Zustand)

- **`useCart`** - Persisted to localStorage, cart items + totals
- **`useSupportStore`** - Persisted to localStorage, warranty draft state
- **`useCheckoutState`** - Ephemeral, Stripe session + payment status

All stores in `src/hooks/`. See `docs/STATE_MANAGEMENT.md` for patterns.

### 4. API Integration Modes

**Legacy Mode** (`NEXT_PUBLIC_MEDUSA_ENABLED=false`):
- Static products from `src/lib/products.ts`
- Direct Stripe checkout via `src/app/api/stripe/*`

**Medusa Mode** (`NEXT_PUBLIC_MEDUSA_ENABLED=true`):
- Dynamic products from `https://api.optic.works/store/products`
- Cart sessions via Medusa
- Stripe integration via Medusa backend

Toggle in `.env.local` (synced from Infisical).

### 5. Backend Operations (SSH to Hetzner)

**Accessing the Backend** (from GitHub Codespaces):
```bash
# SSH into Hetzner node
ssh hetzner-node

# Check Medusa service status
pm2 status
pm2 logs medusa-dev

# Database operations (if needed)
sudo -u postgres psql medusa

# Update backend after code changes
exit  # Exit SSH session
cd infrastructure/ansible
ansible-playbook playbooks/medusa-deploy.yml
```

**Production Traffic Flow**:
- User traffic: `api.optic.works` → Cloudflare Tunnel → Hetzner Medusa service
- Admin access: Direct SSH for infrastructure management only
- API endpoints: `/health` (public), `/store/*` (public), `/app` (admin dashboard)

### 6. Documentation Workflow

- Markdown truth lives in `/docs` (active guides) and `/docs/archived` (historical)
- When Hugo docs site (Phase 3) is deployed, sync content from `/docs`
- Archive superseded plans immediately to avoid confusion
- Always check if a guide is in `archived/` before following it

### 7. CI/CD Requirements

CI must run these commands (see `docs/CI.md`):
```bash
pnpm run lint
pnpm run test
pnpm run build
pnpm docs:build  # Hugo docs (Phase 3)
pnpm --filter @opticworks/medusa-service build
```

## Roadmap

### ✅ Phase 1: Backend Infrastructure (COMPLETE - 2025-11-18)
- Ansible Infrastructure-as-Code
- Hetzner backend provisioned
- PostgreSQL 17 + Redis operational
- Medusa v2 serving at `api.optic.works`
- Admin dashboard accessible
- Cloudflare Tunnel configured
- Infisical secret management adopted

### 🔄 Phase 2: Storefront Integration (IN PROGRESS)
- [ ] Integrate Next.js storefront with Medusa API
- [ ] E2E checkout testing (Medusa → Stripe)
- [ ] Verify product catalog rendering
- [ ] Test cart sessions and payment flows
- [ ] Production secrets synced to Infisical

### 📋 Phase 3: Documentation & Community
- [ ] Deploy Hugo docs site (`platform/docs-site/`)
- [ ] API documentation generation
- [ ] Discourse forum setup (`platform/forum/`)
- [ ] CI/CD pipeline hardening

### 📋 Phase 4: Production Storefront
- [ ] Migrate from Vercel to Cloudflare Pages
- [ ] Webhook buffering (Durable Objects)
- [ ] Performance optimization
- [ ] SEO finalization

## Quick Commands Reference

```bash
# Storefront development (local or Codespaces)
pnpm run dev              # Start dev server
pnpm run lint             # Required before commits
pnpm run test             # Run tests
pnpm run build            # Production build (240s timeout)

# Secrets management (Infisical)
pnpm run secrets:pull     # Pull secrets from Infisical (writes .env.local)

# Backend operations (via SSH from Codespaces)
ssh hetzner-node          # SSH into Hetzner
pm2 status                # Check service status
pm2 logs medusa-dev       # View logs
pm2 restart medusa-dev    # Restart service

# Backend deployment (Ansible)
cd infrastructure/ansible
ansible-playbook playbooks/medusa-deploy.yml  # Update code
ansible-playbook playbooks/medusa-provision.yml  # Full rebuild

# Health checks
curl https://api.optic.works/health
curl -H "x-publishable-api-key: pk_opticworks_2025_live_c9fa7e3575be7d2fc8082e3d088bcf5d" \
  https://api.optic.works/store/products
```

## Collaboration Notes

- Keep AGENTS ↔ CLAUDE mirrored (recreate hard link with `ln -f AGENTS.md CLAUDE.md` if needed)
- Never bypass the mandated `pnpm run lint` + `pnpm run build` combo; CI mirrors this
- For copy/UX tone, mirror hero messaging: confident, privacy-forward, premium hardware storytelling
- **Prevent drift**: Always use Ansible playbooks for backend changes
- **SSH access**: GitHub Codespaces has full network access to Hetzner node (`ssh hetzner-node`)
- **Secrets**: Infisical is the single source of truth - never commit `.env.local`
- **Documentation**: Check if guides are in `docs/archived/` before following them
- **Deployment**: Current storefront on Vercel, backend on Hetzner, migrating storefront to Cloudflare Pages (Phase 4)
