# OpticWorks Medusa Service (Track T2)

This workspace hosts the future MedusaJS v2 commerce backend. It exists now so engineers can bootstrap the service without guessing about structure or environment variables.

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
| `package.json` | Workspace definition with dev/build/migrate scripts. |
| `.env.example` | Canonical env vars for Postgres, Redis, Stripe, R2. Copy to `.env`. |
| `docker-compose.yml` | Local Postgres + Redis for Medusa core. |
| `src/` (create later) | Custom modules, loaders, plugins. |
| `README.md` | This file. Update as Track T2 progresses. |

## API Contract Expectations

Track T1 introduced `src/lib/api/medusa.ts` with helper methods consumed by the storefront. Your Medusa service must expose:

- `GET /store/products` (list) and `GET /store/products/:id`
- `POST /store/carts` with line items (returns cart + payment session)
- Stripe provider configured so `payment_session.client_secret` is populated
- Webhook(s) to sync orders/shipping back to the storefront once ready

See `docs/api/medusa-integration.md` for the complete storefront view.

## Local Development Checklist

1. Copy `.env.example` → `.env` and fill secrets.
2. Run `docker compose up -d`.
3. `pnpm dev` to start Medusa (default port 9000).
4. Use the storefront env flag `MEDUSA_ENABLED=true` with `MEDUSA_BASE_URL=http://localhost:9000` to test end-to-end.

## Deployment Notes

- Production Medusa lives on Hetzner (per migration plan). Mirror the compose stack with Terraform/Ansible once ready.
- Secrets migrate into `/config/medusa.env` during Track T5.
- Stripe secret/publishable keys should live in this service; the storefront only needs the publishable key via Medusa responses.

Keep this README updated as the backend matures (plugins, modules, CI steps, etc.).
