# OpticWorks Platform - Agent Context

**Quick Context**: Production e-commerce platform for mmWave presence sensors. Next.js 15 storefront + Medusa v2 backend on Hetzner (Ansible-managed). Phase 2 complete (infrastructure operational), Phase 3 planned (e-commerce integration).

**Live Endpoints**: `api.optic.works` (backend), `api.optic.works/app` (admin), `api.optic.works/health` (status)

---

## Critical Constraints

### Must Follow
- **Package Manager**: pnpm only (no npm/yarn)
- **Pre-Commit**: `pnpm run lint && pnpm run test && pnpm run build` (all must pass)
- **Build Timeout**: Next.js builds take 2-3 min, use 240s timeout
- **TypeScript**: Strict mode, no `any` types
- **Secrets**: Never commit `.env.local`, `services/medusa/.env`, or `infrastructure/ansible/group_vars/secrets.yml`
- **Infrastructure**: All backend changes via Ansible playbooks (prevent drift)

### Deployment
- **Backend**: Ansible only (`infrastructure/ansible/playbooks/medusa-deploy.yml`)
- **Secrets**: Infisical is source of truth (see `docs/KEY_MANAGEMENT.md`)
- **SSH**: Available via GitHub Codespaces (`ssh hetzner-node`)

---

## Repository Map

```
/
├── src/                          # Next.js 15 storefront
│   ├── app/                      # App Router (pages + API routes)
│   │   ├── api/                  # Backend integration (stripe, email, analytics)
│   │   ├── products/             # Product catalog pages
│   │   ├── store/cart/           # Shopping cart
│   │   └── support/              # Customer support flows
│   ├── components/
│   │   ├── ui/                   # Tier 1: Shadcn + marketing (use cn() helper)
│   │   ├── products/             # Tier 2: Product marketing (use cx() helper)
│   │   ├── checkout/             # Stripe Elements
│   │   └── 3d/                   # Three.js visualizations
│   ├── hooks/                    # Zustand stores
│   │   ├── useCart.ts            # Cart state (persisted)
│   │   ├── useCheckoutState.ts   # Checkout flow (ephemeral)
│   │   └── useSupportStore.ts    # Support forms (persisted)
│   └── lib/
│       ├── utils.ts              # cn/cx helpers
│       ├── api/medusa.ts         # Medusa backend integration
│       └── cart/utils.test.ts    # Cart tests (Vitest)
│
├── services/medusa/              # Medusa v2 backend
│   ├── scripts/                  # Automation (health-check, import-products, etc.)
│   ├── medusa-config.ts          # Medusa configuration
│   └── ecosystem.config.js       # PM2 process management
│
├── infrastructure/ansible/       # IaC for Hetzner deployment
│   ├── playbooks/
│   │   ├── medusa-provision.yml  # Full infrastructure setup
│   │   ├── medusa-deploy.yml     # Code updates (run after Medusa changes)
│   │   └── medusa-destroy.yml    # Teardown
│   └── scripts/generate-secrets-from-infisical.sh  # Sync secrets before deploy
│
├── docs/                         # Documentation (source of truth)
│   ├── DEPLOYMENT_GUIDE.md       # ⭐ Ansible provisioning
│   ├── KEY_MANAGEMENT.md         # ⭐ Infisical secrets (~50 vars)
│   ├── CONTRIBUTORS.md           # ⭐ Dev setup, SSH access
│   ├── PHASE3_PLAN.md            # ⭐ Next implementation phase
│   ├── INTEGRATION_GUIDE.md      # Storefront-Backend integration
│   ├── STATE_MANAGEMENT.md       # Zustand patterns
│   └── archived/                 # Deprecated docs (ignore these)
│
└── platform/
    ├── docs-site/                # Hugo docs (Phase 3)
    └── forum/                    # Discourse (deprecated, using Discord)
```

---

## Development Patterns

### Component Styling
```tsx
// Tier 1 (Shadcn primitives)
import { cn } from "@/lib/utils"
<Button className={cn("bg-primary", className)} />

// Tier 2 (Marketing/premium)
import { cx } from "@/lib/utils"
<div className={cx("glass-gradient cinematic-reveal", className)} />
```

### State Management (Zustand)
- `useCart` - Cart items, persisted to localStorage
- `useCheckoutState` - Stripe session, ephemeral
- `useSupportStore` - Warranty forms, persisted

See `docs/STATE_MANAGEMENT.md` for patterns.

### API Integration Modes
Toggle via `NEXT_PUBLIC_MEDUSA_ENABLED` in `.env.local`:
- `false` - Legacy mode (static products, direct Stripe)
- `true` - Medusa mode (dynamic products, Medusa cart/checkout)

---

## Common Workflows

### Local Development
```bash
pnpm install
pnpm run secrets:pull           # Pull from Infisical (Codespaces auto-syncs)
pnpm run dev                    # localhost:3000
pnpm run lint && pnpm run test && pnpm run build  # Pre-commit checks
```

### Backend Deployment (After Medusa Code Changes)
```bash
cd infrastructure/ansible
bash scripts/generate-secrets-from-infisical.sh  # Sync secrets
ansible-playbook playbooks/medusa-deploy.yml     # Deploy changes
```

### SSH to Hetzner (from Codespaces)
```bash
ssh hetzner-node
pm2 status                      # Check service
pm2 logs medusa-dev             # View logs
pm2 restart medusa-dev          # Restart
curl https://api.optic.works/health  # Health check
```

### Secret Management
- **Source of Truth**: Infisical (see `docs/KEY_MANAGEMENT.md` for all ~50 variables)
- **Storefront**: `pnpm run secrets:pull` → `.env.local`
- **Backend**: `generate-secrets-from-infisical.sh` → `group_vars/secrets.yml`
- **Never commit**: `.env.local`, `services/medusa/.env`, `group_vars/secrets.yml`

---

## Project Status

### ✅ Phase 2 Complete (2025-11-20)
- Backend operational at `api.optic.works` (PostgreSQL 17, Redis 7.x, Medusa v2.11.3)
- Ansible IaC preventing drift
- Store API serving 7 products
- Admin dashboard accessible
- Next.js storefront builds (46 pages)

**Not in Phase 2**: Full e-commerce config (cart/checkout, regions, payments) → Phase 3

### 📋 Phase 3 Planned (E-Commerce Integration)
- Medusa regions, Stripe payments, shipping
- Full cart/checkout flow
- Customer authentication (Medusa CIAM)
- Hookdeck webhook infrastructure
- Discord community + bot
- Hugo docs site
- E2E testing + CI/CD

See `docs/PHASE3_PLAN.md` for details (7 tracks, ~15-20 sessions).

---

## Quick Reference

### Key Commands
```bash
# Development
pnpm run dev                    # Start storefront
pnpm run lint                   # Linting (required)
pnpm run test                   # Tests (required)
pnpm run build                  # Production build (required, 240s timeout)

# Secrets
pnpm run secrets:pull           # Pull from Infisical

# Backend (SSH)
ssh hetzner-node                # Access Hetzner
pm2 status                      # Service status

# Deployment
cd infrastructure/ansible
ansible-playbook playbooks/medusa-deploy.yml
```

### Key Files
- `src/app/siteConfig.ts` - Site configuration
- `src/lib/api/medusa.ts` - Medusa integration
- `services/medusa/medusa-config.ts` - Backend config
- `docs/KEY_MANAGEMENT.md` - All secrets inventory
- `docs/PHASE3_PLAN.md` - Next implementation phase

### Documentation Priority
1. **Start Here**: `README.md` (this file mirrors it)
2. **Phase Context**: `docs/PHASE3_PLAN.md`
3. **Dev Setup**: `docs/CONTRIBUTORS.md`
4. **Secrets**: `docs/KEY_MANAGEMENT.md`
5. **Deployment**: `docs/DEPLOYMENT_GUIDE.md`
6. **Integration**: `docs/INTEGRATION_GUIDE.md`
7. **Ignore**: `docs/archived/*` (deprecated)

---

## Anti-Patterns (Avoid)

❌ Manual backend changes (use Ansible playbooks)
❌ Committing `.env.local` or secret files
❌ Using npm/yarn (pnpm required)
❌ Bypassing `lint + test + build` pre-commit
❌ Using `any` in TypeScript
❌ Following guides in `docs/archived/`
❌ Editing secrets directly (use Infisical UI)

---

## Stack Summary

- **Frontend**: Next.js 15 (App Router, React 19), Tailwind 4, Shadcn UI, Framer Motion, Three.js
- **Backend**: Medusa v2.11.3, PostgreSQL 17, Redis 7.x, Node.js 22
- **State**: Zustand (localStorage persistence)
- **Payments**: Stripe (Elements + API)
- **Email**: Resend
- **Infrastructure**: Hetzner Cloud, Ansible IaC, Cloudflare Tunnel
- **Secrets**: Infisical
- **Dev Env**: GitHub Codespaces (recommended)

---

**Note**: `AGENTS.md` mirrors this file. Update both or recreate hard link: `ln -f CLAUDE.md AGENTS.md`
