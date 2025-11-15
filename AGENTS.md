# AGENTS.md

Canonical guidance for the **OpticWorks Presence Intelligence Platform**. This repo remains a single Next.js application that narrates the CyberShade Presence family, runs checkout/support, and now hosts the refreshed migration docs. `CLAUDE.md` must mirror this file (hard link or identical copy).

## Platform Snapshot
- **Hardware**: Bed/under-mattress mmWave sensors, bridges, integrator kits, developer firmware program.
- **Experience**: Apple-grade art direction, cinematic landing/product flows, ASCII 404 already live.
- **Stack**: Next.js 15.5 (App Router, React 19), Tailwind 4, Shadcn Tier‑1 controls + bespoke Tier‑2 UI (`cn`/`cx` helpers), Zustand stores, Stripe + Resend APIs, Framer Motion + Three.js scenes.
- **Roadmap Pillars**: (1) Harden storefront APIs for external services, (2) Introduce MedusaJS backend, (3) Stand up Hugo/Geekdoc docs, (4) Launch Discourse forum, (5) Consolidate ops + cleanup legacy tooling.

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
│   ├── MIGRATION_PLAN.md    # MVP tracks + milestones (v2.0)
│   ├── IMPLEMENTATION_GUIDE.md
│   ├── archived/            # Legacy infra plans (Cloudflare Workers, Hetzner, GA4, etc.)
│   ├── marketing/, third-party/  # Current marketing+integration briefs
│   └── (legacy lowercase `migration-plan.md` → archive when convenient)
├── README.md / AGENTS.md / CLAUDE.md
├── aws/, google-cloud-sdk/  # Legacy CLI bundles (only keep if someone still uses them for R2/S3)
├── .credentials/, .env      # Should be replaced by per-surface `.env.example` files during Track T5
├── pnpm-lock.yaml, package.json, tailwind.config.js, etc.
└── node_modules/, .next/, .vercel/ (local artifacts; keep untracked)
```

### Active vs. Legacy Surfaces
- **Active**: `src/*`, `docs/(API_ARCHITECTURE|STATE_MANAGEMENT|STRIPE_INTEGRATION)`, README, top-level config.
- **MVP Work in Flight**: `docs/MIGRATION_PLAN.md` (tracks T1–T5), `docs/IMPLEMENTATION_GUIDE.md` (runbooks).
- **Legacy/Archive**: `docs/archived/*`, root SDK folders (`aws/`, `google-cloud-sdk/`), stray JSON specs (`openapi.json`, `cors.json`), `pnpm_output.log`. Move/delete only after confirming no current workflow depends on them.

## Common Workflows
1. **Local development**
   ```bash
   pnpm install
   pnpm run dev          # localhost:3000
   pnpm run lint         # required before PR
   pnpm run build        # required before PR
   pnpm run start        # verify production build
   ```
   Use pnpm only; keep TypeScript strict, no `any`.

2. **Tiered UI changes**
   - Tier‑1 controls (buttons, forms, dialogs) live in `src/components/ui/*` and must use `cn` and Shadcn a11y primitives.
   - Tier‑2 storytelling blocks (`Hero`, `Features`, product highlights) sit under feature folders (e.g., `src/components/products/duo-pack/*`) and rely on `cx`, gradients, and Framer Motion. Keep ARIA/keyboard support intact.

3. **State + APIs**
   - Zustand stores: `useCart` and `useSupportStore` persist to localStorage; `useCheckoutState` stays ephemeral. Any new store must follow docs/STATE_MANAGEMENT.md.
   - API stubs live in `src/app/api/*`. Follow `docs/API_STUBS.md`: simulate 300–800 ms latency, validate requests, no `any`.

4. **Checkout**
   - `src/components/checkout/CheckoutWrapper.tsx` loads Stripe Elements + custom fonts from Cloudflare R2.
   - `src/app/store/checkout/page.tsx` orchestrates Address/Payment elements; success page depends on `paymentSession` from `useCart`.
   - When Medusa integration (Track T2) lands, add a thin service layer in `src/lib/api/medusa.ts` and keep Stripe secrets on the Medusa service, not in the storefront.

5. **Docs + Knowledge**
   - Markdown truth lives in `/docs`. When Hugo site (Track T3) is scaffolded, sync content from here; do not fork knowledge elsewhere.
   - Archive superseded plans into `docs/archived/` immediately to avoid confusion.

6. **Root cleanup / ops**
   - Follow `docs/IMPLEMENTATION_GUIDE.md` §4 for what to archive/delete (aws/, google-cloud-sdk/, .credentials/, openapi.json, cors.json, pnpm_output.log, lowercase docs).
   - Track T5 adds `/config/` for env templates + GitHub Actions checks (lint, build, Medusa tests, docs build). Until then, keep secrets local and untracked.

## Reference Documents
- `docs/MIGRATION_PLAN.md` – MVP tracks T1–T5, milestones, env matrix, risks.
- `docs/IMPLEMENTATION_GUIDE.md` – Runbooks for each track + root cleanup checklist.
- `docs/CODEBASE_EXPLANATION.md` – Deep dive into architecture, components, and API story.
- `docs/STATE_MANAGEMENT.md`, `docs/API_STUBS.md`, `docs/STRIPE_INTEGRATION.md` – Operational patterns.
- `README.md` – Quickstart plus high-level repo overview.

## Collaboration Notes
- Keep AGENTS ↔ CLAUDE mirrored (recreate hard link with `ln -f AGENTS.md CLAUDE.md` if needed).
- Never bypass the mandated `pnpm run lint` + `pnpm run build` combo; CI mirrors this.
- For copy/UX tone, mirror hero messaging: confident, privacy-forward, premium hardware storytelling.
- When touching migration work, reference the MVP plan and implementation guide so new surfaces (Medusa, docs site, forum) stay aligned with the single-repo reality.
