# OpticWorks Migration Implementation Guide (MVP Edition)

**Last updated**: 2025-03-14  
**Scope**: Practical steps for delivering the MVP migration plan (Medusa backend, Hugo docs, Discourse forum) while the storefront stays live.

This guide deprecates the earlier multi-app monorepo instructions. Follow the tracks below in order; each track ships independently but shares the same approval gate.

## 1. What Exists Today

```
/ (repo root)
├── src/                      # Next.js storefront (App Router)
├── public/                   # Assets
├── docs/                     # Markdown knowledge base
│   └── archived/             # Legacy infra plans already shelved
├── AGENTS.md / README.md     # Up-to-date platform overview
├── aws/, google-cloud-sdk/   # Legacy SDKs (see cleanup table)
├── .credentials/, .env       # Ad-hoc secrets (needs consolidation)
└── misc config files (tailwind.config.js, tsconfig.json, etc.)
```

Key truth: this is still a single Next.js package managed with pnpm. No `apps/` or `packages/` directories exist yet.

## 2. Migration Track Cheat Sheet

| Track | Summary | Dependencies | Output |
| --- | --- | --- | --- |
| T1 | Storefront hardening | None | Service layer + env template |
| T2 | MedusaJS service | T1 abstraction | `/services/medusa/` workspace |
| T3 | Hugo/Geekdoc docs | None | `/platform/docs-site/` workspace |
| T4 | Discourse forum | Docs theme + base infra | `/platform/forum/` workspace |
| T5 | Ops & cleanup | After T2/T3 scaffolds | CI + env consolidation |

## 3. Track Runbooks

### Track T1 – Storefront Hardening
1. **Inventory API usage**: catalog every place products/carts/orders are touched: `src/lib/products.ts`, `src/app/api/stripe/*`, `src/hooks/useCart.ts`, etc. Record required fields in `docs/api/medusa-integration.md`.
2. **Add service layer**:
   - Create `src/lib/api/medusa.ts`.
   - Export typed functions (`listProducts`, `createCart`, `completeCheckout`) that currently read from local data or call the existing Stripe routes.
   - Inject base URL and API token via new envs: `MEDUSA_BASE_URL`, `MEDUSA_API_TOKEN`.
3. **Refactor consumers**:
   - Update hooks/components to use the service layer.
   - Provide a feature flag `MEDUSA_ENABLED=false` to keep mocked data running until T2 is ready.
4. **Documentation**: Update `README.md` and `docs/STATE_MANAGEMENT.md` with the new abstraction and env expectations.

### Track T2 – MedusaJS Backend
1. **Workspace setup**:
   - Create `/services/medusa/` with its own `package.json`, `.env.example`, and pnpm workspace entry (add `pnpm-workspace.yaml` once ready).
   - Initialize Medusa v2 project (`pnpm dlx @medusajs/create medusa .` or manual install).
2. **Local infra**:
   - Add `docker-compose.yml` hosting PostgreSQL 15, Redis 7.
   - Provide scripts: `pnpm services:medusa:dev`, `pnpm services:medusa:migrate`.
3. **Catalog migration**:
   - Create a script (`scripts/import-products.ts`) that reads `src/lib/products.ts` and posts to Medusa via Admin API.
   - Once validated, replace TS source with generated JSON to avoid dual maintenance.
4. **Stripe ownership**:
   - Move Stripe secret/publishable keys to Medusa envs. Storefront should only need the publishable key forwarded by Medusa.
5. **API contract**:
   - Document REST endpoints (products, carts, checkout) in `services/medusa/README.md`.
   - Optionally export OpenAPI spec using Medusa CLI for reference.

### Track T3 – Hugo/Geekdoc Docs Site
1. **Scaffold**:
   - Create `/platform/docs-site/`.
   - Add Hugo config (`hugo.toml`) with Geekdoc theme (git submodule pointing to `themes/geekdoc`).
2. **Content sync**:
   - Point `content/` to the existing markdown files under `/docs`. Either symlink or copy during build via script.
   - Ensure `docs/archived/*` stays excluded.
3. **Commands**:
   - Add root-level scripts: `pnpm docs:dev` → `hugo server -s platform/docs-site`, `pnpm docs:build` → `hugo -s platform/docs-site`.
4. **Deployment**:
   - Generate `platform/docs-site/netlify.toml` or Cloudflare Pages config.
   - Document env requirements (e.g., `BASE_URL`).

### Track T4 – Discourse Forum
1. **Bootstrap**:
   - Create `/platform/forum/` with `docker-compose.yml` referencing the official Discourse image.
   - Provide `forum.env.example` for SMTP + admin credentials.
2. **Theme**:
   - Store SCSS/JS bundles under `/platform/forum/theme/`.
   - Add `README` instructions for applying the theme via Discourse Admin or API.
3. **SSO placeholder**:
   - Document how Discourse would integrate with a future Ory Hydra deployment but keep default local login for MVP.
4. **Content**:
   - Seed categories (Announcements, Integrator Lounge, Support) using Discourse rake tasks documented in the README.

### Track T5 – Ops, CI, and Cleanup
1. **Env consolidation**:
   - Move `.env`, `.env.local`, `.credentials` entries into clearly named files under `/config/`.
   - Add `.env.example` for each workspace (storefront, Medusa, docs, forum).
2. **CI pipeline**:
   - Extend GitHub Actions (or preferred CI) to run:
     - `pnpm run lint`
     - `pnpm run build`
     - `pnpm --filter services/medusa test` (or equivalent)
     - `pnpm docs:build`
3. **Deployment scripts**:
   - Document manual rollback steps for storefront (Vercel), Medusa (Hetzner/Docker), docs (static hosting), forum (Docker).
4. **Observability**:
   - Add lightweight health checks for storefront and Medusa.
   - Capture log aggregation requirements for future Hydra/Workers work but keep out of MVP scope.

## 4. Root Directory Cleanup (Recommend Before T5)

| Item | Current State | Action |
| --- | --- | --- |
| `aws/` | Legacy AWS CLI installer + binaries (unused since move to Vercel) | Remove or move to `archive/aws-sdk/` after confirming infra no longer depends on it |
| `google-cloud-sdk/` | Full GCloud SDK checked in; not used by current deployment | Remove; rely on dev machines or CI images instead |
| `.credentials/` | Unknown secrets in plain text | Inventory contents, migrate to `.env.local` or secret manager, then delete directory |
| `.env` | Possibly outdated env file | Regenerate per-track `.env.example` files; avoid committing secrets |
| `.next/`, `.vercel/` | Build artifacts | Delete locally; ensure `.gitignore` already covers them |
| `openapi.json` | No references in codebase | Archive unless Medusa service reuses it |
| `cors.json` | No references in repo | Archive or delete |
| `pnpm_output.log` | CLI artifact | Delete (developer-specific) |
| `docs/migration-plan.md` (lowercase) | Outdated Medusa report unrelated to current repo | Move to `docs/archived/` or delete |

Record any removals in the PR description for visibility.

## 5. Approval Checklist (per PR)

- [ ] References this guide + `docs/MIGRATION_PLAN.md`.
- [ ] Introduces or updates `.env.example` files for any new workspace.
- [ ] Documents rollback instructions for the deployed surface it touches.
- [ ] Runs `pnpm run lint` + `pnpm run build` (storefront) and any new workspace-specific checks.
- [ ] Updates README if developer ergonomics change.

## 6. Communication Cadence

- Weekly migration stand-up → review progress per track.
- Docs + Implementation Guide pair review every other week to keep instructions accurate.
- Archive outdated artifacts immediately after approval to avoid future confusion.

Following this guide keeps the MVP grounded in the current codebase while opening clear paths for Medusa, Hugo, and Discourse integration without surprise dependencies.
