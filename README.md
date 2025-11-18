# OpticWorks Presence Intelligence Platform

This repo contains the production web experience for OpticWorks’ mmWave bed and ambient presence sensors. The site narrates the OpticWorks Presence Intelligence hardware family, manages the Stripe checkout flow, and powers support/warranty tooling for integrators and smart-home enthusiasts. It is a pure Next.js + Tailwind + TypeScript stack with a heavy emphasis on cinematic UI polish.

## Why This Exists
- **Presence-first storytelling**: Hero, Features, and product pages highlight how our intelligent sensing stack delivers room-level presence, respiration, and sleep-quality signals with Apple-grade industrial design.
- **Hybrid commerce**: Persistent cart + Stripe Elements checkout to sell sensors, bridges, and calibration bundles.
- **Support + Ops**: Warranty, "Oops Protection," lifecycle maintenance, and installation guides for sleep clinics, integrators, and DIY installers.
- **Production Backend**: MedusaJS v2 backend at `api.optic.works` (Hetzner + Cloudflare Tunnel, Ansible-managed) **[LIVE via IaC - 2025-11-18]**

## Prerequisites
- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) (required package manager)

## Getting Started
```bash
# 1. Clone
git clone https://github.com/your-username/opticworks-presence.git
cd opticworks-presence

# 2. Install deps (pnpm only)
pnpm install

# 3. Pull secrets (Infisical recommended)
# Codespaces/devcontainer: set INFISICAL_TOKEN as a secret and the post-create script writes .env.local automatically.
# Local fallback:
# INFISICAL_TOKEN=st.xxxxx pnpm run secrets:pull
# or copy .env.template if Infisical is not available:
# cp .env.template .env.local && edit the values manually.

# 4. Run the dev server
pnpm run dev  # http://localhost:3000
```

## Required Workflow Commands
```bash
pnpm run lint   # REQUIRED pre-commit (strict TS + ESLint)
pnpm run test   # REQUIRED for cart regressions + unit coverage
pnpm run build  # REQUIRED pre-commit (ensures hybrid Stripe flow compiles)
pnpm run dev    # Local development
pnpm run start  # Preview production build
```
Never use npm/yarn scripts—tooling and lockfile are pnpm-specific.

## Architecture Overview
```
src/
├─ app/              # App Router pages + API routes (landing, store, support, install guides)
│  ├─ api/          # Stripe + email production routes, shipping/inventory stubs
│  ├─ products/     # Presence catalog + dynamic detail pages
│  ├─ store/        # Cart, checkout, success
│  └─ support/      # Warranty, oops program, compliance tools
├─ components/
│  ├─ ui/           # Tier 1 Shadcn (forms/buttons) + Tier 2 bespoke marketing components
│  ├─ checkout/     # Stripe hybrid flow (CheckoutWrapper, CheckoutForm)
│  ├─ store/, support/, products/, 3d/
├─ hooks/           # Zustand stores (useCart, useCheckoutState, useSupportStore)
├─ lib/
│  ├─ api/          # Service-layer utilities (presence analytics, orders, billing, compatibility)
│  ├─ products.ts   # Sensor catalog metadata
│  └─ utils.ts      # `cn`, `cx`, helpers
└─ docs/            # CODEBASE_EXPLANATION, STATE_MANAGEMENT, API_STUBS, STRIPE_INTEGRATION
```
Key rules:
- Tier 1 Shadcn components use `cn` and focus on accessibility; Tier 2 business components use `cx` + premium styling.
- Zustand: cart + support stores persist via localStorage, checkout store stays ephemeral.
- Heavy visual blocks leverage Framer Motion and blur/glass gradients to hit the Apple-like art direction.

### Workspaces (pnpm)
- `.` – Next.js storefront (default package)
- `services/medusa/` – MedusaJS backend workspace used throughout Phase 1 (bootstrap) and Phase 2 (catalog integration). Run `pnpm --filter @opticworks/medusa-service dev`.
- `platform/docs-site/` – Hugo + Geekdoc site for the Phase 3 docs launch. Use `pnpm docs:dev` / `pnpm docs:build`.
- `platform/forum/` – Discourse configuration for the Phase 3 community/forum deliverable.

See `pnpm-workspace.yaml` for the full list and `docs/DEPLOYMENT_GUIDE.md` for architecture and deployment workflow.

## Contributor Environment & SSH
- The Codespaces/VS Code devcontainer installs pnpm, Hugo, Git LFS, libssl, and all required AI CLIs automatically, normalizes the Hetzner SSH key, and runs a smoke SSH check the first time the container spins up.
- For SSH details, troubleshooting, and the latest verification timestamp, see `docs/CONTRIBUTORS.md`. That doc is the source of truth for the Hetzner alias (`ssh hetzner-node`), secret requirements, and `/tmp/hetzner-ssh.log` verification output.

## Feature Pillars
- **Presence Intelligence Catalog**: Sensor highlights, specs, heatmap demos, integrator kits.
- **Cart & Checkout**: Persisted cart state, Stripe session creation, Address/Payment Elements, success-state email handoff.
- **Support Center**: Warranty claims, "Oops Protection," compliance tools, contact flows with persistent form drafts.
- **Install Guides**: Installation stories for under-mattress tiles, adjustable bases, calibration with Home Assistant.

## API & Integrations
- **Production**: `POST /api/stripe/create-checkout-session`, `POST /api/stripe/webhook`, `POST /api/email/send` (Resend).
- **Stubs**: Shipping quotes, inventory checks, analytics, bed compatibility guidance. All stubs must simulate latency (300–800 ms) and validate payloads.
- **Environment**: Requires Stripe publishable/secret keys, Stripe webhook secret, Resend key, Cloudflare storage credentials, plus Hetzner/Medusa endpoints + admin tokens.

## Development Standards
1. No `any`—TypeScript strict mode must stay clean.
2. Use Next.js `<Image>` and lazy loading for heavy visuals / 3D assets.
3. Provide skeleton/loading states whenever data fetches occur.
4. Accessibility first: keyboard nav, ARIA labels, semantic headings.
5. Run `pnpm run lint` and `pnpm run build` locally before opening PRs or commits.

## Documentation

Core guidance and architectural details are centralized in the `/docs` directory:

- **`docs/CONTRIBUTORS.md`** – GitHub Codespaces SSH access, dev vs prod workflow, Hetzner deployment.
- **`docs/MIGRATION_PLAN.md`** – Bootstrap migration plan v4.0 (Phases 1-4: Medusa + Docs + Production Networking).
- **`docs/IMPLEMENTATION_GUIDE.md`** – Executable runbooks for all milestones including Cloudflare Tunnel setup.
- **`docs/RFD-004.md`** – Infrastructure automation requirements (resolved with 17 automation scripts).
- **`docs/CI.md`** – CI/CD checklist (build, lint, test commands).
- **`docs/CODEBASE_EXPLANATION.md`** – Deep dive into architecture, components, and API story.
- **`docs/STATE_MANAGEMENT.md`** – Zustand store patterns and localStorage persistence.
- **`docs/API_STUBS.md`** – API endpoint stubs and latency simulation guidelines.
- **`docs/STRIPE_INTEGRATION.md`** – Stripe Elements, checkout flow, and webhook handling.
- **`docs/API_ARCHITECTURE.md`** – Service-layer utilities, contracts, and error handling.

For development workflows and collaboration notes, see `AGENTS.md` (mirrored in `CLAUDE.md`).

## Environment Configuration Strategy

This repo uses a **two-file environment strategy** to separate storefront and backend concerns:

### 1. Storefront Configuration (`.env.template` → `.env.local`)

**Scope**: Next.js storefront + integrations (Stripe, Resend, Cloudflare, analytics, Medusa client settings)

**Management**: Populated via Infisical

**Workflow**:
- **Codespaces/devcontainer**: Add `INFISICAL_TOKEN` as a repository secret. The post-create script runs `scripts/pull-infisical-secrets.sh` and writes `.env.local` automatically.
- **Local development**: Export `INFISICAL_TOKEN` and run `pnpm run secrets:pull`.
- **Manual fallback**: Copy `.env.template` to `.env.local` if Infisical is unavailable (never commit `.env.local`).

The `.env.template` file includes header comments explaining its scope and Infisical workflow.

### 2. Backend Configuration (`services/medusa/.env.example` → `services/medusa/.env`)

**Scope**: Medusa v2 backend ONLY (PostgreSQL, Redis, JWT secrets, admin tokens, Stripe backend key)

**Management**: Manual configuration after generating credentials

**Workflow**:
```bash
# Generate secure credentials
cd services/medusa
pnpm run generate:secrets > /tmp/medusa-secrets.env

# Copy template and fill with generated values
cp .env.example .env
nano .env  # Paste credentials from /tmp/medusa-secrets.env

# Store in Infisical for team access
# Tag with: environment=development, service=medusa
```

The `services/medusa/.env.example` file includes header comments explaining the generation workflow.

### Why Two Files?

- **Separation of concerns**: Storefront secrets (public Stripe key, CDN URLs) vs backend secrets (database passwords, JWT tokens)
- **Deployment isolation**: Storefront deploys to Cloudflare Pages, backend runs on Hetzner node
- **Security**: Backend secrets never exposed to client-side code
- **Team access**: Different secret rotation schedules (backend secrets monthly, storefront keys on-demand)

## Key Environment Variables

### Medusa Integration Flags (Storefront)

Toggle Medusa integration in `.env.local` (or Infisical):

```bash
# Development (local Medusa)
NEXT_PUBLIC_MEDUSA_ENABLED=true
NEXT_PUBLIC_MEDUSA_BASE_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxx  # From `pnpm run setup:keys` in Medusa workspace

# Production (via Cloudflare Tunnel) ✅ LIVE
NEXT_PUBLIC_MEDUSA_ENABLED=true
NEXT_PUBLIC_MEDUSA_BASE_URL=https://api.optic.works
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_opticworks_2025_live_c9fa7e3575be7d2fc8082e3d088bcf5d
```

When `NEXT_PUBLIC_MEDUSA_ENABLED=false`, the storefront uses:
- Static catalog from `src/lib/products.ts`
- Legacy Stripe routes in `src/app/api/stripe/*`

When `NEXT_PUBLIC_MEDUSA_ENABLED=true`, the storefront uses:
- Product data from Medusa API (`/store/products`)
- Medusa cart API and payment sessions
- Stripe integration via Medusa backend

See `docs/api/medusa-integration.md` for the complete API contract and `services/medusa/README.md` for backend setup.

### Backend Credentials (Medusa)

Generate all required backend secrets:
```bash
cd services/medusa
pnpm run generate:secrets
```

This outputs PostgreSQL password, Redis password, JWT secret, cookie secret, and admin token. Store these in `services/medusa/.env` and Infisical.

**Important**: Never use the legacy `.credentials/` folder. All secrets now managed via:
1. Root `.env.template` for storefront (Infisical-synced)
2. `services/medusa/.env.example` for backend (generated credentials)

## Production Deployment Status

### Phase 1: Backend Infrastructure ✅ COMPLETE (2025-11-18)

The MedusaJS v2 backend is **live in production** at `https://api.optic.works`:

**Infrastructure:**
- **Backend URL:** `https://api.optic.works`
- **Admin Dashboard:** `https://api.optic.works/app`
- **Health Endpoint:** `https://api.optic.works/health` (returns "OK")
- **Store API:** `https://api.optic.works/store/*` (requires publishable key)
- **Server:** Hetzner Cloud (3 vCPUs, 4GB RAM)
- **Services:** PostgreSQL 17, Redis, Medusa v2 (dev mode), PM2, Cloudflare Tunnel
- **Deployment:** Ansible Infrastructure-as-Code (fully automated provisioning)

**Deployment Notes:**
- Running in development mode (`medusa-dev`) via PM2 due to admin bundler issue in production mode
- All infrastructure provisioned via Ansible playbooks (`infrastructure/ansible/`)
- Database credentials URL-encoded to handle special characters
- Modern GPG key management (signed-by method) for APT repositories

**Quick Verification:**
```bash
# Health check
curl https://api.optic.works/health

# Store API test
curl -H "x-publishable-api-key: pk_opticworks_2025_live_c9fa7e3575be7d2fc8082e3d088bcf5d" \
  https://api.optic.works/store/products
```

**See `docs/DEVELOPMENT_SCORECARD.md` for detailed deployment status and Phase 2+ roadmap.**

### What's Next?

- **Phase 2:** Catalog import automation + storefront integration
- **Phase 3:** Hugo docs site + Discourse forum + CI/CD
- **Phase 4:** Cloudflare Pages production deployment + webhook buffering
