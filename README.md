# OpticWorks Website

Company and product website for OpticWorks, Inc.: intelligent instruments for manufacturing,
imaging and the physical world. Built with Next.js 15 and deployed to Cloudflare Workers via
OpenNext. Public pages need no backend.

**Live**: [optic.works](https://optic.works) · **Docs**: [docs.optic.works](https://docs.optic.works)
· **Contact**: support@optic.works

## Current state (since 2026-10-29)

**Online commerce is offline.** The legacy Medusa v2 backend on Hetzner has been archived and
stopped. The website is a company and product site:

- Public pages: `/`, `/products`, `/products/vmc`, `/products/mach-1`, `/platform`,
  `/technology`, `/journal` (+ `/journal/feed.xml`), `/about`, `/contact`, `/support`, and the
  legal pages under `/support/legal/*` (`/legal/*` redirects there temporarily, see #126).
- Store, cart, order confirmation, sign-in and account routes keep their URLs but render only an
  "unavailable" page; the legacy components are not bundled. Commerce is hard-disabled in code by `COMMERCE_ENABLED = false`
  in [`src/lib/commerce.ts`](src/lib/commerce.ts).
- Support requests go to **support@optic.works** by email. The site has no working forms.
- A separate Worker (`opticworks-backend-offline-20261029`) answers these routes with
  `503 BACKEND_OFFLINE`, without reaching any origin:
  `optic.works/api/*`, `www.optic.works/api/*`, `api.optic.works/*`, `medusa.optic.works/*`.
  This means **every same-origin `/api/*` route in this app is unreachable in production**.
  Don't build features that depend on `/api/*` on `optic.works`.
- The Stripe and EasyPost Hookdeck connections are paused.

Details, route inventory and remaining issues:
[docs/reference/BACKEND_OFFLINE_FRONTEND.md](docs/reference/BACKEND_OFFLINE_FRONTEND.md).
The backend archive, the snapshot runbook and the legacy API catalog are in PR #124.

Retired Presence/CyberShade pages (OW-1 product, install guides, FAQ, warranty,
compatibility, tinting laws) answer **410 Gone** from `src/middleware.ts`; old support URLs
redirect (`src/lib/legacy-routes.ts`). E-commerce will return later on a new backend.

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

No secrets are needed for the website while commerce is disabled.

## Validation

CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs these on every pull request and on pushes to `main`:

```bash
pnpm lint           # next lint, zero warnings allowed
pnpm typecheck      # tsc --noEmit (excludes the standalone backend/)
pnpm test           # vitest unit tests
pnpm cf:build       # OpenNext Cloudflare build (next build also lints and type-checks)
```

The Playwright E2E suite in `e2e/` targets the legacy commerce flow and needs the backend.
It isn't part of CI while commerce is offline.

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
| `src/app/` | Next.js App Router pages and (currently unreachable) `/api/*` route handlers |
| `src/content/` | Program, journal and company content (see above) |
| `src/components/site/` | Site chrome, primitives and illustrations for the current design |
| `src/lib/legacy-routes.ts` | Retired (410) paths and legacy redirects |
| `src/components/legacy/`, `src/components/store/` | Archived commerce/account UI; not imported by any route |
| `src/lib/commerce.ts` | Commerce kill switch |
| `src/lib/api/medusa*.ts`, `src/hooks/useCart.ts`, `src/hooks/useAuth.ts` | Legacy Medusa client and stores, kept for reference |
| `backend/` | Archived Medusa v2 backend source (standalone; not built or deployed) |
| `infrastructure/ansible/` | Legacy Hetzner backend automation (backend changes only via Ansible) |
| `platform/docs-site/` | Hugo source for docs.optic.works (see audit in the status doc) |
| `docs/reference/` | Reference docs. Backend/checkout docs are historical |

## Documentation

| Document | Purpose |
|----------|---------|
| [AGENTS.md](AGENTS.md) / [CLAUDE.md](CLAUDE.md) | Agent context and constraints |
| [docs/reference/BACKEND_OFFLINE_FRONTEND.md](docs/reference/BACKEND_OFFLINE_FRONTEND.md) | Current state, route inventory, remaining issues |
| [docs/reference/README.md](docs/reference/README.md) | Reference index (legacy backend docs marked historical) |
| [docs/SECRETS.md](docs/SECRETS.md) | Environment variables (mostly legacy commerce) |
