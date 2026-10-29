# Agent Context

OpticWorks, Inc. company/product website: Next.js 15 on Cloudflare Workers (OpenNext).
Contact: support@optic.works. Canonical site: https://optic.works.
(`AGENTS.md` is a symlink to this file.)

## Current state: commerce offline (since 2026-10-29)

- The legacy Medusa v2 backend (Hetzner) is archived and stopped. **Do not reconnect it,
  restart it, or resume the paused Hookdeck connections** as part of frontend work.
- `COMMERCE_ENABLED = false` in `src/lib/commerce.ts` disables catalog sync, cart, checkout
  and accounts. Legacy store/account routes render `ServiceUnavailable`.
- An edge Worker (`opticworks-backend-offline-20261029`) returns `503 BACKEND_OFFLINE` for
  `optic.works/api/*`, `www.optic.works/api/*`, `api.optic.works/*`, `medusa.optic.works/*`.
  **No same-origin `/api/*` route works in production.** Don't add client features that call
  `/api/*` or Medusa. Don't remove or change those four routes here.
- No website forms deliver anything. Support is by email to support@optic.works.
- Status, route inventory and open issues: `docs/reference/BACKEND_OFFLINE_FRONTEND.md`.
  The backend archive and API catalog are in PR #124 (draft, not merged).

## Direction

The site is a **company/product website that doesn't depend on Medusa** (areas: precision
manufacturing / compact VMC, advanced imaging / Mach 1, intelligent software / platform).
E-commerce will return later on a new backend. Until then:

- Don't add prices, "add to cart", pre-order, shipping-time, review/testimonial or other
  purchase claims.
- Don't present mock data as real (order lookups, compatibility results, form "success").
- Product copy lives in `src/content/`. Label every capability with its claim status; don't
  mark anything `validated` without owner approval. Illustrations must be captioned as
  illustrations. Never present CAD renders as photographs, and never publish internal VMC
  renders, viewer links or supplier details.
- Journal entries stay `draft: true` until the owner approves them.
- Legal pages (privacy, terms, warranty/returns wording) need owner/legal approval before
  their obligations change. Flag problems instead of rewriting them.
- Company identity: **OpticWorks, Inc.**, 3077B Clairemont Dr. #201, San Diego, CA 92117.

## Quick Commands

```bash
pnpm dev            # Dev server (localhost:3000)
pnpm lint           # Zero warnings allowed
pnpm typecheck      # tsc --noEmit
pnpm test           # Vitest unit tests
pnpm cf:build       # OpenNext Cloudflare build
```

CI (`.github/workflows/ci.yml`) runs all four on PRs and on pushes to `main`. `next build` also
lints and type-checks; don't reintroduce `ignoreBuildErrors` / `ignoreDuringBuilds`.

## Structure

```
src/app/                 # App Router pages; src/app/api/* handlers are unreachable in prod
src/content/             # Programs, journal, company copy (typed data)
src/components/site/     # Header, footer, primitives, SVG illustrations
src/components/legacy/   # Archived commerce/account UI (not imported by any route)
src/lib/legacy-routes.ts # 410 Gone paths (middleware) and legacy redirects (next.config)
src/lib/commerce.ts      # Commerce kill switch
src/lib/api/medusa*.ts   # Legacy Medusa client (kept for reference)
src/hooks/               # Zustand stores (useCart, useAuth: legacy)
backend/                 # Archived Medusa backend (standalone, not built)
infrastructure/ansible/  # Legacy backend automation
platform/docs-site/      # Hugo source for docs.optic.works
e2e/                     # Playwright tests for the legacy commerce flow (need backend)
```

## Constraints

- **pnpm only**: no npm/yarn
- **No `any` types**: strict TypeScript
- **Never commit secrets**: use Infisical (`docs/SECRETS.md`)
- **Backend changes via Ansible**: no direct SSH edits
- **Merging to `main` deploys production** through Cloudflare's Git integration. Other
  branches upload preview versions only.

## Deployment

```
optic.works, www.optic.works          → Worker opticworks-store (this repo)
*.optic.works/api/*, api.*, medusa.*  → Worker opticworks-backend-offline-20261029 (503)
docs.optic.works                      → Hugo docs site (platform/docs-site)
```

Preview URLs: `https://<version-id-prefix>-opticworks-store.ryan-39f.workers.dev`.

## Historical reference (legacy commerce)

These describe the archived Medusa/Stripe/EasyPost system. Read them for context only.
They do not describe the running site:
`docs/reference/BACKEND_OPERATIONS.md`, `DEPLOYMENT_GUIDE.md`, `CHECKOUT_FLOW.md`,
`WEBHOOKS.md`, `FULFILLMENT*.md`, `STRIPE_TAX.md`, `CUSTOMER_AUTH.md`, `MEDUSA_API.md`,
`E2E_TESTING.md`. See `docs/reference/README.md`.
