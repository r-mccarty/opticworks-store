# OpticWorks Presence Intelligence Platform

This repo contains the production web experience for OpticWorks’ mmWave bed and ambient presence sensors. The site narrates the OpticWorks Presence Intelligence hardware family, manages the Stripe checkout flow, and powers support/warranty tooling for integrators and smart-home enthusiasts. It is a pure Next.js + Tailwind + TypeScript stack with a heavy emphasis on cinematic UI polish.

## Why This Exists
- **Presence-first storytelling**: Hero, Features, and product pages highlight how our intelligent sensing stack delivers room-level presence, respiration, and sleep-quality signals with Apple-grade industrial design.
- **Hybrid commerce**: Persistent cart + Stripe Elements checkout to sell sensors, bridges, and calibration bundles.
- **Support + Ops**: Warranty, "Oops Protection," lifecycle maintenance, and installation guides for sleep clinics, integrators, and DIY installers.

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

# 3. Create environment file (.env.local) and provide Stripe + Resend keys
cp .env.example .env.local  # adjust values for Stripe, Resend, Supabase, etc.

# 4. Run the dev server
pnpm run dev  # http://localhost:3000
```

## Required Workflow Commands
```bash
pnpm run lint   # REQUIRED pre-commit (strict TS + ESLint)
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
- `services/medusa/` – MedusaJS backend scaffold (Track T2). Run `pnpm --filter @opticworks/medusa-service dev`.
- `platform/docs-site/` – Hugo + Geekdoc site (Track T3). Use `pnpm docs:dev` / `pnpm docs:build`.
- `platform/forum/` – Discourse configuration (Track T4, currently scaffolding).

See `pnpm-workspace.yaml` for the full list and `docs/MIGRATION_PLAN.md` for roadmap context.

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
- **Environment**: Requires Stripe publishable/secret keys, Stripe webhook secret, Resend key, Supabase + Cloudflare storage credentials.

## Development Standards
1. No `any`—TypeScript strict mode must stay clean.
2. Use Next.js `<Image>` and lazy loading for heavy visuals / 3D assets.
3. Provide skeleton/loading states whenever data fetches occur.
4. Accessibility first: keyboard nav, ARIA labels, semantic headings.
5. Run `pnpm run lint` and `pnpm run build` locally before opening PRs or commits.

## Documentation

Core guidance and architectural details are centralized in the `/docs` directory:

- **`docs/CONTRIBUTORS.md`** – GitHub Codespaces SSH access to Hetzner development node, infrastructure setup, troubleshooting.
- **`docs/MIGRATION_PLAN.md`** – MVP tracks (T1–T5), milestones, env matrix, risks, and roadmap.
- **`docs/IMPLEMENTATION_GUIDE.md`** – Runbooks for each track + root cleanup checklist.
- **`docs/CODEBASE_EXPLANATION.md`** – Deep dive into architecture, components, and API story.
- **`docs/STATE_MANAGEMENT.md`** – Zustand store patterns and localStorage persistence.
- **`docs/API_STUBS.md`** – API endpoint stubs and latency simulation guidelines.
- **`docs/STRIPE_INTEGRATION.md`** – Stripe Elements, checkout flow, and webhook handling.
- **`docs/API_ARCHITECTURE.md`** – Service-layer utilities, contracts, and error handling.

For development workflows and collaboration notes, see `AGENTS.md` (mirrored in `CLAUDE.md`).

## Environment Variables
Create `.env.local` (not committed) with the following:

```bash
# Stripe / email
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
RESEND_API_KEY=re_xxx

# Medusa integration (optional during Track T1/T2)
MEDUSA_ENABLED=false
MEDUSA_BASE_URL=http://localhost:9000
MEDUSA_API_TOKEN= # optional bearer for authenticated requests
NEXT_PUBLIC_MEDUSA_ENABLED=false
NEXT_PUBLIC_MEDUSA_BASE_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_API_TOKEN=
```

When `MEDUSA_ENABLED` / `NEXT_PUBLIC_MEDUSA_ENABLED` remain `false`, the storefront pulls from the static catalog (`src/lib/products.ts`) and keeps using the internal Stripe API routes. Flip the flags to `true` (with a reachable `MEDUSA_BASE_URL`) to exercise the new service layer defined in `src/lib/api/medusa.ts`. See `docs/api/medusa-integration.md` for the complete contract map. Canonical env templates now live under `/config/`; copy from there rather than keeping ad-hoc `.credentials/` files.
