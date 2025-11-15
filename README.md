# OpticWorks Presence Intelligence Platform

This repo contains the production web experience for OpticWorks’ mmWave bed and presence sensors. The site narrates the CyberShade Presence hardware family, manages the Stripe checkout flow, and powers support/warranty tooling for integrators and smart-home enthusiasts. It is a pure Next.js + Tailwind + TypeScript stack with a heavy emphasis on cinematic UI polish.

## Why This Exists
- **Presence-first storytelling**: Hero, Features, and product pages highlight "Built to fix every pain point smart homes have with bed sensors" and the Apple-grade industrial design language.
- **Hybrid commerce**: Persistent cart + Stripe Elements checkout to sell sensors, bridges, and calibration bundles.
- **Support + Compliance**: Warranty, "Oops Protection," tint-law legacy info, and installation guides for sleep clinics, integrators, and DIY installers.

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
│  ├─ api/          # Service-layer utilities (tinting laws, orders, billing, compatibility)
│  ├─ products.ts   # Sensor catalog metadata
│  └─ utils.ts      # `cn`, `cx`, helpers
└─ docs/            # CODEBASE_EXPLANATION, STATE_MANAGEMENT, API_STUBS, STRIPE_INTEGRATION
```
Key rules:
- Tier 1 Shadcn components use `cn` and focus on accessibility; Tier 2 business components use `cx` + premium styling.
- Zustand: cart + support stores persist via localStorage, checkout store stays ephemeral.
- Heavy visual blocks leverage Framer Motion and blur/glass gradients to hit the Apple-like art direction.

## Feature Pillars
- **CyberShade Presence Catalog**: Sensor highlights, specs, heatmap demos, integrator kits.
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

See `AGENTS.md` (mirrored in `CLAUDE.md`) plus the docs in `docs/` for deeper architectural guidance, state diagrams, and API contracts.

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

When `MEDUSA_ENABLED` / `NEXT_PUBLIC_MEDUSA_ENABLED` remain `false`, the storefront pulls from the static catalog (`src/lib/products.ts`) and keeps using the internal Stripe API routes. Flip the flags to `true` (with a reachable `MEDUSA_BASE_URL`) to exercise the new service layer defined in `src/lib/api/medusa.ts`. See `docs/api/medusa-integration.md` for the complete contract map.
