# Agent Context

OpticWorks, Inc. company/product website: Next.js 15 on Cloudflare Workers (OpenNext).
Contact: support@optic.works. Canonical site: https://optic.works.
(`AGENTS.md` is a symlink to this file.)

## Current state: commerce offline (since 2026-10-29); new backend running dark (2026-10-30)

- The legacy Medusa v2 backend no longer runs anywhere. Its Hetzner server (the grandfathered
  CPX21 `110578382`) was rebuilt in place on 2026-10-30. The legacy state survives only in
  snapshot `449822273` and the PR #124 docs. **Don't resume the paused Hookdeck connections**
  as part of frontend work.
- A **new Medusa 2.21 backend** (`backend/`, on Neon `main`) runs on that rebuilt CPX21 at
  `backend.optic.works`, **dark**: behind Cloudflare Access (owner + service token), with
  test-mode Stripe/EasyPost keys and an `@optic.works` email allowlist. The website does
  **not** use it yet. Don't point frontend code at it until launch (issue #138). Host
  changes go through `infrastructure/ansible/` only (`README.md`, `MIGRATION.md`). **Never
  delete, recreate or rescale that server**, or it loses its legacy price.
- The legacy commerce, account, auth and `/api/*` code was removed on 2026-10-30 with the
  retired Presence/CyberShade/OW-1 content (git history has it). Removed URLs 404.
- A **new store frontend** (`src/lib/store/`, `src/components/store/`, `/store`, `/cart`,
  `/checkout`) is gated by `STORE_MODE`: `off` (default on `optic.works`), `mock`
  (default on localhost and `*.workers.dev` previews: mock prices, simulated checkout) or
  `medusa` (the new backend's Store API; checkout stops before payment). See
  `docs/reference/STORE_FRONTEND.md`. **Don't set `STORE_MODE` in production** without
  owner approval.
- An edge Worker (`opticworks-backend-offline-20261029`) returns `503 BACKEND_OFFLINE` for
  `optic.works/api/*`, `www.optic.works/api/*`, `api.optic.works/*`, `medusa.optic.works/*`.
  **No same-origin `/api/*` route works in production.** The store uses server actions
  (posted to page URLs) and calls Medusa server-side only; never from the browser. Don't
  remove or change those four routes here.
- No website forms deliver anything. Support is by email to support@optic.works.
- Status, route inventory and open issues: `docs/reference/BACKEND_OFFLINE_FRONTEND.md`.
  The legacy backend archive and API catalog (PR #124, merged) are
  `docs/reference/LEGACY_BACKEND_SNAPSHOT.md` and `docs/reference/LEGACY_BACKEND_API.md`.

## Direction

The site is a **company/product website that doesn't depend on Medusa** (areas: precision
manufacturing / compact VMC, advanced imaging / Mach 1, intelligent software / platform).
E-commerce will return later on the new backend (dark at `backend.optic.works`). Until then:

- Prices and purchase UI live only in the gated store (`src/components/store/`). Prices come
  from the backend (`infrastructure/ansible/scripts/catalog_offers.py`) or the mock catalog
  (`src/lib/store/mock.ts`), never from `src/content/`. Don't add shipping-time,
  review/testimonial or other purchase claims.
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
src/app/                 # App Router pages
src/content/             # Programs, journal, company copy (typed data)
src/components/site/     # Header, footer, primitives, SVG illustrations
src/components/store/    # Buy box, bag link, checkout flow (gated by STORE_MODE)
src/lib/store/           # Store mode, bag, mock + Medusa backends, server actions
src/components/ui/       # shadcn primitives (badge, button, card)
backend/                 # New Medusa 2.21 backend (Neon + local Redis); dark, behind Cloudflare Access
infrastructure/ansible/  # Backend host automation (see its README)
infrastructure/workers/backend-offline/  # Offline /api/* Worker source
```

## Constraints

- **pnpm only**: no npm/yarn
- **No `any` types**: strict TypeScript
- **Never commit secrets**: the website needs none unless `STORE_MODE=medusa`; see `docs/SECRETS.md`
- **Backend changes via Ansible**: no direct SSH edits
- **Merging to `main` deploys production** through Cloudflare's Git integration. Other
  branches upload preview versions only.

## Deployment

```
optic.works, www.optic.works          → Worker opticworks-store (this repo)
*.optic.works/api/*, api.*, medusa.*  → Worker opticworks-backend-offline-20261029 (503)
backend.optic.works                   → new Medusa backend via tunnel, Cloudflare Access only (dark)
```

Preview URLs: `https://<version-id-prefix>-opticworks-store.ryan-39f.workers.dev`.
