# AGENTS.md

Canonical guidance for the **OpticWorks Presence Intelligence Platform**. This repo remains a single Next.js application that narrates the OpticWorks intelligent sensing hardware line, runs checkout/support, and now hosts the refreshed migration docs. `CLAUDE.md` must mirror this file (hard link or identical copy).

## Platform Snapshot (Updated 2025-11-17)
- **Hardware**: Bed/under-mattress mmWave sensors, bridges, integrator kits, developer firmware program.
- **Experience**: Apple-grade art direction, cinematic landing/product flows, ASCII 404 already live.
- **Stack**: Next.js 15.5 (App Router, React 19), Tailwind 4, Shadcn Tier‑1 controls + bespoke Tier‑2 UI (`cn`/`cx` helpers), Zustand stores, Stripe + Resend APIs, Framer Motion + Three.js scenes.
- **Domain**: `optic.works` (production), `api.optic.works` (Medusa backend via Cloudflare Tunnel)
- **Deployment Model**:
  - Storefront: Cloudflare Pages (`optic.works`)
  - Backend: Hetzner node (Medusa v2 + PostgreSQL + Redis) exposed via Cloudflare Tunnel
  - Webhooks: Cloudflare Workers with Durable Objects buffer
- **Migration Status**:
  - ✅ Phase 1-2: Medusa backend deployed on Hetzner with full catalog (RFD-004 automation resolved)
  - 🚧 Phase 3: Hugo docs + Discourse forum + CI/CD in progress
  - 📋 Phase 4: Production networking (Cloudflare Tunnel) documented, pending deployment
- **Roadmap Evolution**:
  - ~~Phase 1-2~~: MedusaJS backend bootstrap **[COMPLETE]**
  - ~~RFD-004~~: Infrastructure automation suite **[RESOLVED]**
  - **Phase 3** (In Progress): Hugo docs site + Discourse forum + CI hardening
  - **Phase 4** (Documented): Cloudflare Tunnel + Pages production deployment + webhook buffering
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
  - `docs/` — Canonical documentation (MIGRATION_PLAN v4.0, IMPLEMENTATION_GUIDE, CONTRIBUTORS)
  - `.env.template` + `services/medusa/.env.example` — Environment configuration
  - `platform/` — Hugo docs + Discourse forum scaffolds
  - `workers/` — Cloudflare Workers (Phase 4)
- **In Progress**:
  - `docs/MIGRATION_PLAN.md` Phase 3-4 (docs site, forum, Cloudflare Tunnel deployment)
  - Phase 4 implementation (webhook buffer, production networking)
- **Completed**:
  - Phase 1-2: Medusa backend on Hetzner with full automation
  - RFD-004: All infrastructure gaps resolved
  - Cart normalization + test coverage
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

## Reference Documents
- `docs/CONTRIBUTORS.md` – GitHub Codespaces SSH access, dev vs prod workflow, Hetzner deployment
- `docs/MIGRATION_PLAN.md` – Bootstrap plan v4.0 (Phases 1-4: Medusa + Docs + Production Networking)
- `docs/IMPLEMENTATION_GUIDE.md` – Executable runbooks for all milestones including Cloudflare Tunnel setup
- `docs/CODEBASE_EXPLANATION.md` – Deep dive into storefront architecture, components, and API layer
- `docs/STATE_MANAGEMENT.md`, `docs/API_STUBS.md`, `docs/STRIPE_INTEGRATION.md` – Operational patterns
- `docs/RFD-004.md` – Infrastructure automation requirements (now resolved with 17 scripts)
- `docs/CI.md` – CI/CD checklist (build, lint, test commands)
- `services/medusa/README.md` – Medusa workspace setup, automation scripts, RFD-004 resolution status
- `README.md` – Quickstart plus high-level repo overview
- `.env.template` + `services/medusa/.env.example` – Environment configuration guides (see header comments)

## Collaboration Notes
- Keep AGENTS ↔ CLAUDE mirrored (recreate hard link with `ln -f AGENTS.md CLAUDE.md` if needed).
- Never bypass the mandated `pnpm run lint` + `pnpm run build` combo; CI mirrors this.
- For copy/UX tone, mirror hero messaging: confident, privacy-forward, premium hardware storytelling.
- When touching migration work, reference the MVP plan and implementation guide so new surfaces (Medusa, docs site, forum) stay aligned with the single-repo reality.
