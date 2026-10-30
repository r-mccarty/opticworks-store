# OpticWorks Website

Company and product website for OpticWorks, Inc.: intelligent instruments for manufacturing,
imaging and the physical world. Built with Next.js 15 and deployed to Cloudflare Workers via
OpenNext. Public pages need no backend.

**Live**: [optic.works](https://optic.works) · **Contact**: support@optic.works

## Current state (since 2026-10-29)

**Online commerce is offline.** The legacy Medusa v2 backend has been retired. The website is
a company and product site:

- Public pages: `/`, `/products`, `/products/vmc`, `/products/mach-1`, `/platform`,
  `/technology`, `/journal` (+ `/journal/feed.xml`), `/about`, `/contact`, `/support`, and the
  legal pages under `/support/legal/*` (`/legal/*` redirects there temporarily, see #126).
- A new store (`/store`, `/cart`, `/checkout`, and a buy box on each product page) is built
  but **off on optic.works**. It runs with mock prices and a simulated checkout on local and
  preview hosts, or against the new backend with `STORE_MODE=medusa`. See
  [docs/reference/STORE_FRONTEND.md](docs/reference/STORE_FRONTEND.md).
- Anything else is a 404. There's no account, sign-in or `/api/*` code.
- Support requests go to **support@optic.works** by email. The site has no working forms.
- A separate Worker (`opticworks-backend-offline-20261029`) answers these routes with
  `503 BACKEND_OFFLINE`, without reaching any origin:
  `optic.works/api/*`, `www.optic.works/api/*`, `api.optic.works/*`, `medusa.optic.works/*`.
  Don't build features that depend on `/api/*` on `optic.works`.
- The Stripe and EasyPost Hookdeck connections are paused.

Details, route inventory and remaining issues:
[docs/reference/BACKEND_OFFLINE_FRONTEND.md](docs/reference/BACKEND_OFFLINE_FRONTEND.md).
The legacy backend archive, snapshot runbook and API catalog (PR #124) are in
[docs/reference/LEGACY_BACKEND_SNAPSHOT.md](docs/reference/LEGACY_BACKEND_SNAPSHOT.md) and
[docs/reference/LEGACY_BACKEND_API.md](docs/reference/LEGACY_BACKEND_API.md).

### New backend (dark, since 2026-10-30)

A from-scratch **Medusa 2.21** backend ([`backend/`](backend/)) is deployed but not used by the
website:

| | |
|---|---|
| Host | The original grandfathered Hetzner CPX21 (`110578382`, 40 GB, $13.99/month), rebuilt in place. Never delete, recreate or rescale it |
| Database / cache | Neon Postgres `opticworks-store` branch `main`; local Redis |
| Edge | `backend.optic.works` via Cloudflare Tunnel, **Cloudflare Access only** (no public access) |
| Catalog | Two **draft, unpriced** products (`vmc`, `mach-1`). Nothing is for sale |
| Providers | Stripe, Stripe Tax and EasyPost in **test mode**; Resend email limited to `@optic.works` |
| Backups | Hourly/daily to R2 and Tigris (restic); restore rehearsed 2026-10-30 |
| Operations | [infrastructure/ansible/README.md](infrastructure/ansible/README.md); migration record in [MIGRATION.md](infrastructure/ansible/MIGRATION.md) |

Launch readiness is tracked in **#138**: a bucket-scoped R2 token, a real Stripe webhook, a
custom file domain, live keys, and removing the email allowlist. Connecting the website is a
separate step after that (see "Re-enabling commerce" in the status doc).

The retired Presence/CyberShade/OW-1 content and the legacy commerce frontend were removed
from the repo on 2026-10-30 (see the status doc). E-commerce will return on the new backend
after launch.

## Content

Product, program and journal copy lives in `src/content/` as typed data, independent of
commerce:

- `programs.ts`: each program's stage, status note and capabilities. Every capability carries
  a claim status (`validated`, `in-development`, `objective`, `vision`). Nothing is
  `validated` until it has been demonstrated on hardware and approved.
- `journal.ts`: entries with `draft: true` are never rendered, listed, or included in the
  sitemap or RSS feed.
- `company.ts`: mission, areas of work, principles, platform pillars.

Tests in `src/content/content.test.ts` reject prices and purchase or shipping claims in program
content and check that drafts stay unpublished.

## Quick start

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

The website needs no secrets or environment variables. Locally the store runs in mock mode
(`STORE_MODE=off pnpm dev` hides it).

## Validation

CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs these on every pull request and on pushes to `main`:

```bash
pnpm lint           # next lint, zero warnings allowed
pnpm typecheck      # tsc --noEmit (excludes the standalone backend/)
pnpm test           # vitest unit tests
pnpm cf:build       # OpenNext Cloudflare build (next build also lints and type-checks)
```

## Deployment

The `opticworks-store` Worker serves `optic.works` and `www.optic.works`
(`wrangler.jsonc`, `env.production`).

- **Production:** Cloudflare's Git integration deploys pushes to `main`. **Merging to `main`
  deploys to production.**
- **Previews:** builds of other branches upload a Worker version without deploying it.
  Preview URLs are enabled:
  `https://<version-id-prefix>-opticworks-store.ryan-39f.workers.dev`.
  `workers.dev` hosts aren't covered by the offline `/api/*` route.
- **Manual:** `pnpm cf:build && pnpm exec wrangler deploy --env production`. Only deploy
  manually deliberately.

Production was still serving version `690cf649` (deployed 2026-01-22) as of 2026-10-29.

## Repository layout

| Path | Purpose |
|------|---------|
| `src/app/` | Next.js App Router pages |
| `src/content/` | Program, journal and company content (see above) |
| `src/components/site/` | Site chrome, primitives and illustrations for the current design |
| `src/lib/store/`, `src/components/store/` | Store frontend: mode gating, bag, mock and Medusa backends, checkout UI |
| `backend/` | New Medusa 2.21 backend (standalone pnpm project; deployed dark, see above) |
| `infrastructure/ansible/` | Backend host automation and runbooks (backend host changes only via Ansible) |
| `infrastructure/workers/backend-offline/` | Source of the offline `/api/*` Worker |
| `docs/reference/` | Current-state doc, Cloudflare API notes, legacy backend API record |

## Documentation

| Document | Purpose |
|----------|---------|
| [AGENTS.md](AGENTS.md) / [CLAUDE.md](CLAUDE.md) | Agent context and constraints |
| [docs/reference/BACKEND_OFFLINE_FRONTEND.md](docs/reference/BACKEND_OFFLINE_FRONTEND.md) | Current state, route inventory, remaining issues |
| [docs/reference/STORE_FRONTEND.md](docs/reference/STORE_FRONTEND.md) | Store frontend: modes, flow, prices, enabling it |
| [infrastructure/ansible/README.md](infrastructure/ansible/README.md) | New backend host: topology, secrets, deploy/restore runbook |
| [infrastructure/ansible/MIGRATION.md](infrastructure/ansible/MIGRATION.md) | Move onto the grandfathered CPX21 (gates 0–4, all complete) and legacy-pricing rules |
| [docs/reference/README.md](docs/reference/README.md) | Reference index |
| [docs/SECRETS.md](docs/SECRETS.md) | Where the backend's secrets live (the website needs none) |
