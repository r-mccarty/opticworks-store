# OpticWorks Platform Migration Plan (MVP Refresh)

**Document version**: 2.0  
**Last updated**: 2025-03-14  
**Maintainers**: Platform Engineering (storefront), Commerce Services (Medusa), Knowledge Systems (Docs/Forum)

This refresh replaces the speculative multi-app monorepo plan. It captures the current single Next.js storefront, highlights completed UX work, and lays out the incremental MVP needed to introduce the MedusaJS backend, Hugo/Geekdoc docs, and Discourse forum without destabilizing production.

## 1. Current Snapshot

- **Storefront**: `/src` Next.js 15 App Router app with Stripe checkout, Zustand stores, Framer Motion visuals, and the deployed ASCII 404 page. Runs on Vercel + Resend today.
- **Backend**: No Medusa service yet; all product/catalog data lives in `src/lib/products.ts`. API stubs exist under `src/app/api/*`.
- **Docs**: Markdown references in `/docs`. No Hugo site checked in; some legacy infra docs are archived in `docs/archived/`.
- **Community**: No Discourse deployment. Developer support is handled manually.
- **Tooling**: pnpm workspace (single package), Tailwind, strict TypeScript. Root directory contains historical artifacts (`aws/`, `google-cloud-sdk/`, etc.) that need triage.

### Completed Wins (keep)
- Tiered component refactor, presence-first copy, and gradient treatments across landing/product pages.
- Animated ASCII 404 experience (already live).
- Updated README/AGENTS guidance that reflects the presence pivot.

### Guardrails
1. **MedusaJS** remains the target commerce backend (Stripe integration via Medusa payments module).
2. **Hugo + Geekdoc** will power docs, generated under a dedicated directory but deployed via existing CI for now.
3. **Discourse** stays the community stack with OIDC-ready auth (later hooked into Hydra once available).

## 2. Migration Tracks

| Track | Goal | Owner | Status |
| --- | --- | --- | --- |
| T0 | Freeze storefront UX scope (already met) | Storefront | ✅ Complete |
| T1 | Prepare storefront for external commerce services (env parity, API boundaries) | Storefront | 🚧 In progress |
| T2 | Stand up MedusaJS backend + sync catalog/orders | Commerce Services | ⏳ Not started |
| T3 | Launch Hugo/Geekdoc docs site fed from `/docs` | Knowledge Systems | ⏳ Not started |
| T4 | Provision Discourse forum with OpticWorks theming | Knowledge Systems | ⏳ Not started |
| T5 | Platform ops (env secrets, CI, observability) | Platform Eng | ⏳ Not started |

### Track T1 – Storefront Hardening (Weeks 1–2)
- Audit `src/lib/products.ts`, `src/app/api/*`, and hooks to catalog every Medusa touchpoint.
- Introduce typed service layer (`lib/api/medusa.ts`) that reads base URLs from env (`MEDUSA_BASE_URL`, `MEDUSA_API_TOKEN`).
- Move product metadata to a temporary JSON feed so storefront can switch providers without touching UI components.
- Deliverable: storefront can run against either local mock JSON or Medusa HTTP client toggled via env.

### Track T2 – MedusaJS Service (Weeks 2–5)
1. **Bootstrap**: Create `/services/medusa/` directory (pnpm workspace) with Medusa v2, PostgreSQL, and Redis docker-compose.
2. **Catalog Migration**: Script to ingest `src/lib/products.ts` into Medusa via SDK. Preserve presence-specific metadata (sensor modes, Bed compatibility).
3. **Checkout Integration**: Replace `/api/stripe/*` routes with Medusa cart/checkout workflow; keep Stripe keys in Medusa service.
4. **Webhooks**: Use Medusa events to post to existing analytics stub (latency simulated).
5. **Deliverable**: Swagger/OpenAPI spec + `.env.example` for Medusa service, plus storefront env toggles to hit it.

### Track T3 – Hugo/Geekdoc Docs (Weeks 3–4)
- Create `/platform/docs-site/` with Hugo 0.125+, Geekdoc theme as git submodule.
- Source content from `/docs` markdown; keep canonical docs in markdown to avoid drift.
- Add npm/pnpm script `pnpm docs:dev` and `pnpm docs:build`.
- Deploy to Cloudflare Pages or Vercel static export (decision pending). Provide `README` runbook.

### Track T4 – Discourse Forum (Weeks 4–5)
- Add `/platform/forum/` with docker-compose, Discourse theme assets, and integration README.
- Configure SSO integration placeholder (initially local admin login, later Hydra).
- Define content seeding plan (FAQ, release channels) and moderation workflow.

### Track T5 – Platform Ops (Weeks 5–6)
- Secrets inventory: consolidate `.env`, `.env.local`, `.credentials` into `/config/.env.*` with doppler/1password plan.
- CI updates: run `pnpm run lint`, `pnpm run build`, Medusa tests, docs build.
- Observability: Cloudflare Workers not yet required; keep Vercel + simple uptime monitor for now.

## 3. Milestones & Deliverables

| Milestone | Window | Exit Criteria |
| --- | --- | --- |
| M1 – Storefront Ready | Week 2 | Service layer abstraction merged, env template updated, API stubs documented |
| M2 – Medusa Alpha | Week 5 | Medusa service boots locally, catalog migrated, storefront can fetch live products & carts |
| M3 – Knowledge Surfaces | Week 6 | Hugo docs deploy preview + Discourse docker image themed |
| M4 – Ops Ready | Week 7 | CI pipeline covers storefront + services, envs consolidated, rollback steps documented |

## 4. Environment Matrix

| Variable | Storefront | Medusa | Docs | Forum |
| --- | --- | --- | --- | --- |
| `MEDUSA_BASE_URL` | ✅ | n/a | n/a | n/a |
| `RESEND_API_KEY` | ✅ | n/a | n/a | n/a |
| `STRIPE_SECRET_KEY` | ✅ (temporary) | ✅ (final owner) | n/a | n/a |
| `POSTGRES_URL` | n/a | ✅ | n/a | Optional (analytics) |
| `REDIS_URL` | n/a | ✅ | n/a | n/a |
| `DOCS_BASE_URL` | Optional | n/a | ✅ | n/a |
| `DISCOURSE_SMTP_*` | n/a | n/a | n/a | ✅ |

Document each env in `.env.example` per workspace as they are created. Archive ad-hoc secrets stored in `.credentials/` once the new layout is active.

## 5. Risks & Mitigations

- **Scope drift**: Legacy migration plan included Hydra, CF Workers, etc. Those are postponed until Medusa/Hugo/Discourse are stable.
  - *Mitigation*: This document is the single source. Anything not listed here requires a new RFC.
- **Data divergence**: Maintaining catalog in both `lib/products.ts` and Medusa risks drift.
  - *Mitigation*: Introduce a script that exports JSON once per deploy; delete the TS source once Medusa is production-ready.
- **Root clutter**: Residual directories (`aws/`, `google-cloud-sdk/`, unused `openapi.json`) confuse contributors.
  - *Mitigation*: See implementation guide for the triage list; move deprecated assets into `archive/` before adding new services.

## 6. Approval & Change Management

- **Stakeholders**: Storefront lead, Commerce lead, Docs lead.
- **Approval flow**: Update this file via PR; include checklist verifying tracks and environment matrix.
- **Review cadence**: Weekly during migration; lock a new version once M4 ships.

This MVP plan intentionally narrows focus to the Medusa backend, Hugo docs, and Discourse forum. Cloudflare Worker deployment, Ory Hydra auth, and other stretch goals return to backlog until these foundations are in place.
