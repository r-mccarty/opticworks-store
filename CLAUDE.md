# AGENTS.md

Canonical guidance for the **OpticWorks Presence Intelligence Platform**. This repo remains a single Next.js application that narrates the OpticWorks intelligent sensing hardware line, runs checkout/support, and now hosts the refreshed migration docs. `CLAUDE.md` must mirror this file (hard link or identical copy).

## Platform Snapshot (Updated 2025-11-17)
- **Hardware**: Bed/under-mattress mmWave sensors, bridges, integrator kits, developer firmware program.
- **Experience**: Apple-grade art direction, cinematic landing/product flows, ASCII 404 already live.
- **Stack**: Next.js 15.5 (App Router, React 19), Tailwind 4, Shadcn Tier‑1 controls + bespoke Tier‑2 UI (`cn`/`cx` helpers), Zustand stores, Stripe + Resend APIs, Framer Motion + Three.js scenes.
- **Domain**: `optic.works` (production), `api.optic.works` (Medusa backend via Cloudflare Tunnel)
- **Deployment Model**:
  - **Infrastructure**: Ansible playbooks (full IaC for reproducible deployments) - **IMPLEMENTED 2025-11-18**
  - Storefront: Cloudflare Pages (`optic.works`) - Phase 4
  - Backend: Hetzner node (Medusa v2 + PostgreSQL + Redis) provisioned via Ansible
  - Tunnel: Cloudflare Tunnel (`api.optic.works`) managed by Ansible
  - Admin Auth: Cloudflare Access Zero Trust (email-based, upgradeable to SSO) - **GUIDE READY**
  - Secrets: Local secrets.yml (Ansible Vault), migrating to Infisical - **IN PROGRESS**
  - Webhooks: Cloudflare Workers with Durable Objects buffer - Phase 4
- **Production Infrastructure** (Provisioned via Ansible):
  - Backend URL: `https://api.optic.works` (configured, pending re-provisioning)
  - Admin Dashboard: `https://api.optic.works/app` (pending re-provisioning)
  - Health Endpoint: `https://api.optic.works/health` (pending re-provisioning)
  - Store API: `https://api.optic.works/store/*` (pending re-provisioning)
  - Server: Hetzner Cloud (3 vCPUs, 4GB RAM)
  - Services: PostgreSQL 17, Redis, Medusa v2, PM2, Cloudflare Tunnel (all Ansible-managed)
  - Deployment Method: `ansible-playbook playbooks/medusa-provision.yml`
  - Admin Access: Configured via Ansible secrets.yml
  - Publishable Key: Created post-provisioning via admin UI
- **Migration Status**:
  - ✅ Phase 1: Medusa backend deployed on Hetzner with Cloudflare Tunnel **[COMPLETE 2025-11-17]**
  - 🔧 Security Hardening: Cloudflare Access + Infisical setup **[IN PROGRESS]**
  - 🟡 Phase 2: Ready for catalog import & storefront integration
  - 📋 Phase 3: Hugo docs + Discourse forum + CI/CD (ready to start)
  - 📋 Phase 4: Production storefront deployment + webhook buffering (ready to start)
- **Roadmap Evolution**:
  - ~~Phase 1~~: MedusaJS backend bootstrap + Cloudflare Tunnel **[COMPLETE 2025-11-17]**
  - ~~RFD-004~~: Infrastructure automation suite **[RESOLVED]**
  - **Security Hardening** (In Progress): Cloudflare Access auth + Infisical secret management
  - **Phase 2** (Ready to Start): Full catalog import + storefront integration
  - **Phase 3** (Pending): Hugo docs site + Discourse forum + CI hardening
  - **Phase 4** (Pending): Cloudflare Pages production deployment + webhook buffering
  - **Phase 5** (Future): Developer portal, API documentation, community integrations

## Repository Navigation
```
/
├── src/                     # Active storefront code
│   ├── app/                 # Landing, products, support, store, API routes
│   ├── components/          # ui/, checkout/, products/* feature folders, 3d assets
│   ├── hooks/               # Zustand stores (useCart, useCheckoutState, useSupportStore)
│   └── lib/                 # api utilities, product catalog metadata, helpers
├── public/                  # Images, fonts, static assets (served via Next Image/R2 URLs)
├── docs/                    # Canonical documentation (see below)
│   ├── API_STUBS.md, CODEBASE_EXPLANATION.md, STATE_MANAGEMENT.md, etc.
│   ├── MIGRATION_PLAN.md    # Bootstrap plan v4.0 (Phases 1-4 complete architecture)
│   ├── IMPLEMENTATION_GUIDE.md  # Runbooks for all milestones including Cloudflare Tunnel
│   ├── CONTRIBUTORS.md      # SSH access, dev/prod workflow, Hetzner deployment
│   ├── RFD-004.md           # Infrastructure automation requirements (resolved)
│   ├── CI.md                # CI checklist (moved from legacy /config/)
│   ├── archived/            # Legacy infra plans + old migration reports
│   ├── marketing/, third-party/  # Current marketing+integration briefs
│   └── api/                 # Medusa integration specs
├── services/medusa/         # Medusa v2 workspace (17 automation scripts, PM2 supervisor)
├── infrastructure/ansible/  # Ansible IaC for Medusa backend provisioning **[NEW 2025-11-18]**
│   ├── playbooks/           # provision, deploy, destroy playbooks
│   ├── roles/               # postgresql, redis, nodejs, medusa, cloudflared
│   ├── inventory/           # production.ini (Hetzner node)
│   └── group_vars/          # configuration + secrets
├── platform/docs-site/      # Hugo + Geekdoc workspace (Phase 3 docs launch)
├── platform/forum/          # Discourse docker + theme scaffold (Phase 3 community)
├── workers/                 # Cloudflare Workers (Phase 4: webhook buffer)
├── .env.template            # Storefront environment config (Infisical-managed)
├── services/medusa/.env.example  # Backend-specific config (credentials generation)
├── README.md / AGENTS.md / CLAUDE.md
├── archive/                 # Legacy SDK bundles (aws-cli/, google-cloud-sdk/)
├── pnpm-workspace.yaml, pnpm-lock.yaml, package.json
└── node_modules/, .next/, .vercel/ (local artifacts; keep untracked)
```

### Active vs. Legacy Surfaces
- **Active**:
  - `src/*` — Storefront application (Next.js 15.5)
  - `services/medusa/` — Backend workspace with 17 automation scripts
  - `infrastructure/ansible/` — Infrastructure-as-Code for backend provisioning **[NEW]**
  - `docs/` — Canonical documentation (MIGRATION_PLAN v4.0, IMPLEMENTATION_GUIDE, CONTRIBUTORS)
  - `.env.template` + `services/medusa/.env.example` — Environment configuration
  - `platform/` — Hugo docs + Discourse forum scaffolds
  - `workers/` — Cloudflare Workers (Phase 4)
- **In Progress**:
  - 🔧 Cloudflare Access: Admin dashboard authentication (guide complete, implementation pending)
  - 🔧 Infisical: Secret management setup (guide complete, 30-45 min implementation)
  - 🟡 Phase 2: Catalog import automation ready, storefront integration pending Infisical
- **Completed**:
  - ✅ **Ansible Infrastructure-as-Code** - Full stack automation **[2025-11-18]**
  - ✅ RFD-006: Diagnosed deployment drift issues, built Ansible solution **[2025-11-18]**
  - ✅ RFD-004: All infrastructure gaps resolved (17 automation scripts)
  - ✅ Cart normalization + test coverage
  - ✅ Documentation: Cloudflare Access setup guide (docs/CLOUDFLARE_ACCESS_SETUP.md)
  - ✅ Documentation: Infisical secret management guide (docs/INFISICAL_SETUP.md)
  - ✅ Ansible roles: PostgreSQL 17, Redis, Node.js 22, Medusa v2, Cloudflare Tunnel
  - ✅ Deployment playbooks: provision, deploy (updates only), destroy (clean rebuild)
- **Deprecated/Deleted**:
  - `/config/` folder (deleted — CI checklist moved to `docs/CI.md`)
  - `docs/archived/*` — Legacy migration plans (pre-v3.0)
  - `/archive/` — SDK bundles (aws-cli, google-cloud-sdk)

## Common Workflows
1. **Local development**
   ```bash
  pnpm install
  pnpm run dev          # localhost:3000
  pnpm run lint         # required before PR
  pnpm run test         # Vitest cart coverage
  pnpm run build        # required before PR
  pnpm run start        # verify production build
  ```
   Use pnpm only; keep TypeScript strict, no `any`.
   - Next.js builds routinely exceed the default Codex CLI timeout; when running `pnpm run build` here, bump the command timeout to ~240 s (or higher) so the step can finish.
   - Next.js builds routinely exceed the default Codex CLI timeout; when running `pnpm run build` here, bump the command timeout to ~240 s (or higher) so the step can finish.

2. **Tiered UI changes**
   - Tier‑1 controls (buttons, forms, dialogs) live in `src/components/ui/*` and must use `cn` and Shadcn a11y primitives.
   - Tier‑2 storytelling blocks (`Hero`, `Features`, product highlights) sit under feature folders (e.g., `src/components/products/duo-pack/*`) and rely on `cx`, gradients, and Framer Motion. Keep ARIA/keyboard support intact.

3. **State + APIs**
  - Zustand stores: `useCart` and `useSupportStore` persist to localStorage; `useCheckoutState` stays ephemeral. `useCart` now normalizes legacy state via `src/lib/cart/utils.ts` so only valid specifications hydrate. Any new store must follow docs/STATE_MANAGEMENT.md.
   - API stubs live in `src/app/api/*`. Follow `docs/API_STUBS.md`: simulate 300–800 ms latency, validate requests, no `any`.

4. **Checkout**
   - `src/components/checkout/CheckoutWrapper.tsx` loads Stripe Elements + custom fonts from Cloudflare R2.
  - `src/app/store/checkout/page.tsx` orchestrates Address/Payment elements; success page depends on `paymentSession` from `useCart`. The success view will now gracefully handle carts that were normalized during migration.
   - During Phase 2 (storefront integration), keep `src/lib/api/medusa.ts` thin and ensure Stripe secrets remain on the Medusa service, not in the storefront.

5. **Docs + Knowledge**
   - Markdown truth lives in `/docs`. When the Hugo site (Phase 3) is scaffolded, sync content from here; do not fork knowledge elsewhere.
   - Phase 3 launches the Hugo docs site; sync here first, then publish via `platform/docs-site/`.
   - Archive superseded plans into `docs/archived/` immediately to avoid confusion.

6. **Environment configuration**
   - **Storefront**: `.env.template` (root) — Managed via Infisical, includes Stripe/Resend/Cloudflare/Medusa integration
   - **Backend**: `services/medusa/.env.example` — Backend-only secrets (PostgreSQL, Redis, JWT, admin tokens)
   - Generate Medusa credentials: `cd services/medusa && pnpm run generate:secrets`
   - Sync secrets: `pnpm run secrets:pull` (storefront) or store in Infisical for team access
   - See `.env.template` and `services/medusa/.env.example` header comments for detailed scope explanation

7. **Root cleanup / ops**
   - Follow `docs/IMPLEMENTATION_GUIDE.md` for deployment procedures (Phases 1-4)
   - Legacy `/config/` folder **deleted** — CI checklist now at `docs/CI.md`
   - Old SDKs archived under `/archive/` (do not delete without confirming no dependencies)
   - CI must run: `pnpm run lint`, `pnpm run build`, `pnpm docs:build`, `pnpm --filter @opticworks/medusa-service build`
8. **Codespaces + Hetzner SSH**
   - The devcontainer installs pnpm, Hugo, Git LFS, libssl3, and AI CLIs automatically, normalizes the Hetzner key, and runs a smoke `ssh hetzner-node` after creation.
   - `docs/CONTRIBUTORS.md` is the source of truth for SSH access, dev/prod workflow distinction, and troubleshooting (`/tmp/hetzner-ssh.log`).
   - **Development**: Direct SSH to Hetzner node for Medusa deployment/logs
   - **Production**: Traffic flows via Cloudflare Tunnel (`api.optic.works`), SSH for infrastructure management only

9. **Cloudflare Access (Admin Dashboard Auth) - IN PROGRESS**
   - **Purpose**: Protect Medusa admin dashboard (`/app*`) with Zero Trust authentication
   - **Status**: Guide complete (`docs/CLOUDFLARE_ACCESS_SETUP.md`), implementation pending
   - **Setup Time**: 10-15 minutes
   - **Quick Start**:
     1. Navigate to Cloudflare Zero Trust dashboard
     2. Create application for `api.optic.works/app*`
     3. Configure email-based authentication policy
     4. Test access in incognito window
   - **Keeps Public**: `/health`, `/store/*` (for monitoring and storefront API)
   - **Upgrade Path**: Email PIN → Google Workspace/Azure AD SSO when team grows
   - **Next**: Follow `docs/CLOUDFLARE_ACCESS_SETUP.md` step-by-step

10. **Infisical (Secret Management) - DOCUMENTED**
    - **Purpose**: Centralized secret management for 30+ environment variables (Stripe, Medusa, Cloudflare, etc.)
    - **Status**: Guide complete (`docs/INFISICAL_SETUP.md`), ready to implement
    - **Setup Time**: 30-45 minutes
    - **Quick Start**:
      1. Create Infisical account and project
      2. Add all secrets for dev/staging/prod environments
      3. Create service token for Codespaces
      4. Add `INFISICAL_TOKEN` to GitHub Codespaces secrets
      5. Codespaces auto-sync `.env.local` on creation
    - **Blockers Without Infisical**:
      - Phase 2 storefront testing (need ~7 critical env vars minimum)
      - Cloudflare Pages deployment (need all 30+ env vars)
      - Team collaboration (manual secret sharing is insecure)
    - **Manual Workaround** (temporary):
      ```bash
      cp .env.template .env.local
      # Manually add these critical variables:
      NEXT_PUBLIC_MEDUSA_ENABLED=true
      NEXT_PUBLIC_MEDUSA_BASE_URL=https://api.optic.works
      NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_opticworks_2025_live_c9fa7e3575be7d2fc8082e3d088bcf5d
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
      STRIPE_SECRET_KEY=sk_test_YOUR_KEY
      ```
    - **Recommended**: Set up before Phase 2 storefront integration (within 24-48 hours)
    - **Next**: Follow `docs/INFISICAL_SETUP.md` step-by-step

## Reference Documents

### Core Documentation
- `README.md` – Quickstart plus high-level repo overview (includes Phase 1 completion status)
- `docs/DEVELOPMENT_SCORECARD.md` – Phase-by-phase progress tracker, production credentials, action items
- `docs/MIGRATION_PLAN.md` – Bootstrap plan v4.0 (Phases 1-4: Medusa + Docs + Production Networking)
- `docs/IMPLEMENTATION_GUIDE.md` – Executable runbooks for all milestones including Cloudflare Tunnel setup
- `docs/CONTRIBUTORS.md` – GitHub Codespaces SSH access, dev vs prod workflow, Hetzner deployment

### Security & Infrastructure (NEW - 2025-11-17)
- `docs/CLOUDFLARE_ACCESS_SETUP.md` – **Zero Trust authentication for admin dashboard** (10-15 min setup)
- `docs/INFISICAL_SETUP.md` – **Centralized secret management** (30-45 min setup, required for Phase 2+)
- `.env.template` – Storefront environment config (30+ variables, managed via Infisical)
- `services/medusa/.env.example` – Backend-only secrets (PostgreSQL, Redis, JWT, admin tokens)

### Application Architecture
- `docs/CODEBASE_EXPLANATION.md` – Deep dive into storefront architecture, components, and API layer
- `docs/STATE_MANAGEMENT.md` – Zustand store patterns and localStorage persistence
- `docs/API_STUBS.md` – API endpoint stubs and latency simulation guidelines
- `docs/STRIPE_INTEGRATION.md` – Stripe Elements, checkout flow, and webhook handling
- `docs/API_ARCHITECTURE.md` – Service-layer utilities, contracts, and error handling

### Operations & Deployment
- **`infrastructure/ansible/README.md`** – **Ansible Infrastructure-as-Code guide** (complete deployment automation) **[NEW 2025-11-18]**
- `docs/RFD-006.md` – Deployment drift diagnosis + Ansible migration rationale
- `docs/RFD-004.md` – Infrastructure automation requirements (resolved with 17 scripts)
- `docs/CI.md` – CI/CD checklist (build, lint, test commands)
- `services/medusa/README.md` – Medusa workspace setup, automation scripts

## Backend Deployment (Ansible IaC)

### Infrastructure Status (2025-11-18)
- ✅ **Ansible playbooks created** - Full stack automation ready
- ⏳ **Provisioning pending** - Clean rebuild scheduled to resolve RFD-006 drift issues
- ✅ Roles: PostgreSQL 17, Redis, Node.js 22, Medusa v2, Cloudflare Tunnel, PM2
- ✅ Secrets: Generated in `infrastructure/ansible/group_vars/secrets.yml`
- ✅ Inventory: Hetzner node configured
- 📋 After provisioning: Backend live at `https://api.optic.works`

### Deployment Workflow (Ansible)

**Prerequisites**:
- Ansible installed (`pip install ansible` or `apt install ansible`)
- SSH access to Hetzner node (`ssh hetzner-node`)
- Secrets configured in `infrastructure/ansible/group_vars/secrets.yml`

**Quick Start**:
```bash
cd infrastructure/ansible

# Test connectivity
ansible all -m ping

# Full provisioning (clean install)
ansible-playbook playbooks/medusa-provision.yml

# Code updates only (no infrastructure changes)
ansible-playbook playbooks/medusa-deploy.yml

# Complete teardown (for rebuilds)
ansible-playbook playbooks/medusa-destroy.yml
```

**Time Estimate**: 8-12 minutes for full provisioning

**See**: `infrastructure/ansible/README.md` for complete guide

### Phase 2: Catalog Import & Storefront Integration

**Ready to start** - All automation scripts operational

**Step 1: Import Product Catalog**
1. Login to admin dashboard: `https://api.optic.works/app`
2. Use invitation link or create new admin user
3. **Option A** - Manual import (first product validation):
   - Products → Add Product → Fill in Bed Presence Sensor details
   - Verify Store API: `curl -H "x-publishable-api-key: pk_opticworks..." https://api.optic.works/store/products`
4. **Option B** - Automated import (all products):
   ```bash
   ssh hetzner-node
   cd /opt/opticworks/medusa-backend/services/medusa
   pnpm run catalog:import  # Imports all products from src/lib/products.ts
   pnpm run catalog:verify  # Validates import
   ```

**Step 2: Storefront Integration Testing**
1. **Set up Infisical** (recommended) OR create manual `.env.local`:
   ```bash
   # Minimum required variables:
   NEXT_PUBLIC_MEDUSA_ENABLED=true
   NEXT_PUBLIC_MEDUSA_BASE_URL=https://api.optic.works
   NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_opticworks_2025_live_c9fa7e3575be7d2fc8082e3d088bcf5d
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
   STRIPE_SECRET_KEY=sk_test_YOUR_KEY
   NODE_ENV=development
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

2. **Test storefront**:
   ```bash
   pnpm install
   pnpm run dev  # localhost:3000
   ```

3. **Verify integration**:
   - Product listing pages load from Medusa API
   - Product detail pages show Medusa data
   - Cart operations work with Medusa sessions
   - Checkout flow creates Medusa payment sessions

**Step 3: E2E Testing**
- Complete checkout with test Stripe card
- Verify order appears in Medusa admin
- Test all product variants and specifications

### Phase 3: Hugo Docs + Discourse Forum

**Prerequisites**: Phase 2 catalog complete

**Workspaces ready**:
- Hugo docs: `platform/docs-site/` (sync from `/docs` markdown)
- Discourse forum: `platform/forum/` (Docker Compose scaffold)

**Next steps**: See `docs/MIGRATION_PLAN.md` Phase 3 section

### Phase 4: Production Storefront Deployment

**Prerequisites**: Infisical setup required

**Deliverables**:
- Cloudflare Pages deployment
- Webhook buffer Workers (Durable Objects)
- Production environment variables via Infisical

**Next steps**: See `docs/MIGRATION_PLAN.md` Phase 4 section

### Quick Commands Reference

```bash
# Medusa backend operations (via SSH)
ssh hetzner-node
pm2 status                # Check service status
pm2 logs medusa-dev       # View logs
pm2 restart medusa-dev    # Restart service

# Admin dashboard
open https://api.optic.works/app

# Store API health check
curl https://api.optic.works/health
curl -H "x-publishable-api-key: pk_opticworks_2025_live_c9fa7e3575be7d2fc8082e3d088bcf5d" \
  https://api.optic.works/store/products

# Local storefront development
pnpm run dev              # Start dev server (needs .env.local)
pnpm run lint             # Required before commits
pnpm run test             # Run tests
pnpm run build            # Production build (240s timeout)

# Infisical secret management
pnpm run secrets:pull     # Pull secrets from Infisical (after setup)
infisical export --env=development > .env.local
```

## Collaboration Notes
- Keep AGENTS ↔ CLAUDE mirrored (recreate hard link with `ln -f AGENTS.md CLAUDE.md` if needed).
- Never bypass the mandated `pnpm run lint` + `pnpm run build` combo; CI mirrors this.
- For copy/UX tone, mirror hero messaging: confident, privacy-forward, premium hardware storytelling.
- When touching migration work, reference the MVP plan and implementation guide so new surfaces (Medusa, docs site, forum) stay aligned with the single-repo reality.
- **Security-first**: Cloudflare Access + Infisical guides are production-ready and should be implemented before team expansion or production storefront deployment.
