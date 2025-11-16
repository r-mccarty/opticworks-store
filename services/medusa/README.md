# OpticWorks Medusa Service (Bootstrap Phases 1–2)

This workspace hosts the MedusaJS v2 commerce backend outlined in the Phase 1–2 migration plan. It exists now so engineers can bootstrap the service without guessing about structure or environment variables.

## Quick Start

```bash
# 1. Install deps from repo root
pnpm install

# 2. Copy env template
cp services/medusa/.env.example services/medusa/.env

# 3. Start local infra
cd services/medusa
docker compose up -d postgres redis

# 4. Launch Medusa dev server
pnpm dev
```

The scripts rely on the `medusa` CLI that ships with `@medusajs/medusa`. When you run `pnpm install`, pnpm will hoist the CLI so `pnpm medusa-run ...` works from this workspace.

## Files & Responsibilities

| File | Purpose |
| --- | --- |
| `package.json` | Workspace definition with dev/build/migrate scripts plus `catalog:import`. |
| `medusa-config.ts` | Source of truth for project config (DB/Redis URLs, CORS) and module overrides (Stripe payments, R2 uploads). |
| `.env.example` | Canonical env vars for Postgres, Redis, Stripe, R2. Copy to `.env`. |
| `docker-compose.yml` | Local Postgres + Redis for Medusa core. |
| `scripts/import-products.ts` | Syncs `src/lib/products.ts` into Medusa Admin via `pnpm catalog:import`. |
| `src/` (future) | Custom modules, loaders, plugins. |
| `README.md` | This file. Update as the bootstrap phases progress. |

## API Contract Expectations

The storefront already calls into `src/lib/api/medusa.ts` (Phase 2 integration) for data and checkout helpers. Your Medusa service must expose:

- `GET /store/products` (list) and `GET /store/products/:id`
- `POST /store/carts` with line items (returns cart + payment session)
- Stripe provider configured so `payment_session.client_secret` is populated
- Webhook(s) to sync orders/shipping back to the storefront once ready

See `docs/api/medusa-integration.md` for the complete storefront view.

## Local Development Checklist

1. Copy `.env.example` → `.env` and fill secrets.
2. Run `docker compose up -d`.
3. `pnpm install` (root) to ensure shared CLIs like `ts-node`/`tsx` are available.
4. `pnpm catalog:import` (optional) to seed products via the Admin API.
5. `pnpm dev` to start Medusa (default port 9000).
5. Use the storefront env flag `MEDUSA_ENABLED=true` with `MEDUSA_BASE_URL=http://localhost:9000` to test end-to-end.

## Deployment Notes

- Production Medusa lives on Hetzner (per migration plan). Mirror the compose stack with Terraform/Ansible once ready.
- Secrets migrate into `/config/medusa.env` during Phase 3 hardening.
- Stripe secret/publishable keys should live in this service; the storefront only needs the publishable key via Medusa responses.

## Verification

1. Copy `.env.example` to `.env` and set `MEDUSA_ADMIN_TOKEN`.
2. Start Postgres/Redis (`docker compose up -d`) and run `pnpm dev`.
3. In a separate terminal run `pnpm catalog:import` → confirm the script logs each product.
4. Hit `GET http://localhost:9000/store/products` and verify the response mirrors `src/lib/products.ts`.
5. Flip the storefront env flags (`MEDUSA_ENABLED=true`, `NEXT_PUBLIC_MEDUSA_ENABLED=true`) and run through add-to-cart → checkout. Stripe Elements should now display using the Medusa-provided `client_secret`. If Medusa is offline, the storefront falls back to legacy Stripe routes automatically.

Keep this README updated as the backend matures (plugins, modules, CI steps, etc.).
