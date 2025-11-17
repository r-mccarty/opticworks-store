# OpticWorks Medusa Service (Bootstrap Phases 1–2)

This workspace hosts the MedusaJS v2 commerce backend outlined in the Phase 1–2 migration plan. It exists now so engineers can bootstrap the service without guessing about structure or environment variables.

**Status**: RFD-004 resolved ✅ — All infrastructure automation and stability improvements implemented.

## Quick Start

```bash
# 1. Install deps from repo root
pnpm install

# 2. Generate secure credentials
cd services/medusa
pnpm run generate:secrets > /tmp/medusa-secrets.env
# Review and copy credentials to .env file

# 3. Copy env template and fill in credentials
cp .env.example .env
# Edit .env with generated credentials

# 4. Start local infra (or provision Hetzner - see below)
docker compose up -d postgres redis

# 5. Run database migrations
pnpm run migrate

# 6. Build admin dashboard
pnpm run build

# 7. Setup publishable API key for Store API
pnpm run setup:keys

# 8. Launch Medusa dev server (with PM2 for stability)
pnpm run dev:pm2

# 9. Import product catalog
pnpm run catalog:import

# 10. Verify everything works
pnpm run test:smoke
```

The scripts rely on the `medusa` CLI that ships with `@medusajs/medusa`. When you run `pnpm install`, pnpm will hoist the CLI so `pnpm medusa-run ...` works from this workspace.

## Available Scripts

### Core Development
- **`pnpm dev`** — Start Medusa in development mode (may crash with esbuild errors)
- **`pnpm dev:pm2`** — Start Medusa with PM2 supervisor (auto-restarts on crash) ⭐ Recommended
- **`pnpm stop:pm2`** — Stop PM2-managed Medusa instance
- **`pnpm logs:pm2`** — View PM2 logs in real-time
- **`pnpm build`** — Build admin dashboard (required before production start)
- **`pnpm start`** — Start Medusa in production mode (runs validation checks first)
- **`pnpm start:pm2`** — Start production Medusa with PM2 supervisor
- **`pnpm migrate`** — Run database migrations

### Infrastructure Setup
- **`pnpm run generate:secrets`** — Generate secure credentials for PostgreSQL, Redis, JWT, admin token
- **`pnpm run setup:keys`** — Create publishable API key and associate with sales channel
- **`pnpm run validate:build`** — Validate build prerequisites (admin dashboard, env vars, DB/Redis)

### Health & Diagnostics
- **`pnpm run health:check`** — Check all infrastructure components (PostgreSQL, Redis, APIs)
- **`pnpm run health:wait`** — Wait for Medusa service to become ready
- **`pnpm run test:smoke`** — Run comprehensive smoke test suite

### Catalog Management
- **`pnpm run catalog:import`** — Import products from `src/lib/products` into Medusa
- **`pnpm run catalog:verify`** — Verify imported products match source catalog

## Files & Responsibilities

| File | Purpose |
| --- | --- |
| `package.json` | Workspace definition with 17+ automation scripts for dev/ops workflows. |
| `medusa-config.ts` | Source of truth for project config (DB/Redis URLs, CORS) and module overrides (Stripe payments, R2 uploads). |
| `.env.example` | Canonical env vars template with credential placeholders. Copy to `.env` after running `generate:secrets`. |
| `ecosystem.config.js` | PM2 configuration for process supervision (addresses RFD-004 Issue #1). |
| `docker-compose.yml` | Local Postgres + Redis for Medusa core. |
| `scripts/generate-secrets.ts` | Generate all required credentials (addresses RFD-004 credential gaps). |
| `scripts/hetzner-provision.sh` | Provision PostgreSQL + Redis on Hetzner remote node (addresses RFD-004 Issue #6). |
| `scripts/setup-publishable-key.ts` | Automate publishable key creation (addresses RFD-004 Issue #4). |
| `scripts/health-check.ts` | Infrastructure health checks with retry logic (addresses RFD-004 Issue #3). |
| `scripts/import-products.ts` | Syncs `src/lib/products.ts` into Medusa Admin with retry/progress (addresses RFD-004 Issue #5). |
| `scripts/verify-catalog.ts` | Validate imported catalog integrity. |
| `scripts/validate-build.ts` | Pre-start validation checks (addresses RFD-004 Issue #2). |
| `scripts/smoke-test.ts` | End-to-end test suite for entire stack. |
| `scripts/utils/retry.ts` | Retry utility with exponential backoff (used across all scripts). |
| `src/` (future) | Custom modules, loaders, plugins. |
| `README.md` | This file. |

## API Contract Expectations

The storefront already calls into `src/lib/api/medusa.ts` (Phase 2 integration) for data and checkout helpers. Your Medusa service must expose:

- `GET /store/products` (list) and `GET /store/products/:id`
- `POST /store/carts` with line items (returns cart + payment session)
- Stripe provider configured so `payment_session.client_secret` is populated
- Webhook(s) to sync orders/shipping back to the storefront once ready

See `docs/api/medusa-integration.md` for the complete storefront view.

## Local Development Checklist

1. Generate credentials: `pnpm run generate:secrets`
2. Copy `.env.example` → `.env` and fill with generated secrets
3. Run `docker compose up -d` (PostgreSQL + Redis)
4. Run database migrations: `pnpm run migrate`
5. Build admin dashboard: `pnpm run build`
6. Setup publishable key: `pnpm run setup:keys`
7. Start Medusa with PM2: `pnpm run dev:pm2`
8. Import catalog: `pnpm run catalog:import`
9. Verify health: `pnpm run health:check`
10. Run smoke tests: `pnpm run test:smoke`

## Hetzner Deployment

### Prerequisites
- SSH access to Hetzner node (see `docs/CONTRIBUTORS.md`)
- `sudo` permissions on remote node
- Generated credentials from `pnpm run generate:secrets`

### Provisioning Steps

```bash
# 1. Generate credentials locally
cd services/medusa
pnpm run generate:secrets > /tmp/medusa-secrets.env

# 2. Review and source credentials
cat /tmp/medusa-secrets.env
source /tmp/medusa-secrets.env

# 3. Provision remote PostgreSQL + Redis
POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
REDIS_PASSWORD=$REDIS_PASSWORD \
ssh hetzner-node 'bash -s' < scripts/hetzner-provision.sh

# 4. Store credentials in Infisical
# (Manual step - add credentials to your secrets manager)

# 5. Deploy Medusa service to Hetzner
# (Future: Add deployment automation here)
```

### What the Provisioning Script Does
- Installs PostgreSQL 15 (if not present)
- Creates `medusa_db` database and `medusa_user` with generated password
- Configures PostgreSQL password authentication
- Installs Redis (if not present)
- Configures Redis with `requirepass` authentication
- Verifies all connections work
- Outputs connection strings for `.env` file

## Deployment Notes

- Production Medusa lives on Hetzner (per migration plan)
- Credentials stored in Infisical and synced to `/config/medusa.env` during Phase 3 hardening
- Stripe secret/publishable keys live in this service; storefront only needs publishable key via Medusa responses
- PM2 recommended for production deployment (use `pnpm run start:pm2`)

## Verification

### Quick Verification
```bash
# Check infrastructure health
pnpm run health:check

# Run comprehensive smoke tests
pnpm run test:smoke

# Verify catalog import
pnpm run catalog:verify
```

### Manual Verification
1. Generate and configure credentials (see Quick Start)
2. Start infrastructure: `docker compose up -d`
3. Start Medusa with PM2: `pnpm run dev:pm2`
4. Import catalog: `pnpm run catalog:import`
5. Test Admin API: `curl http://localhost:9000/admin/sales-channels -H "Authorization: Bearer $MEDUSA_ADMIN_TOKEN"`
6. Test Store API: `curl http://localhost:9000/store/products`
7. Integrate with storefront:
   - Set `MEDUSA_ENABLED=true` and `NEXT_PUBLIC_MEDUSA_ENABLED=true` in storefront `.env`
   - Set `MEDUSA_BASE_URL=http://localhost:9000`
   - Test add-to-cart → checkout flow
   - Verify Stripe Elements uses Medusa-provided `client_secret`

## Troubleshooting

### Dev Server Crashes (RFD-004 Issue #1)
**Problem**: `pnpm dev` crashes with esbuild stack traces
**Solution**: Use PM2 supervisor
```bash
pnpm run dev:pm2    # Auto-restarts on crash
pnpm run logs:pm2   # Monitor logs
```

### Connection Refused Errors (RFD-004 Issue #3)
**Problem**: `ECONNREFUSED` when scripts try to connect to Medusa
**Solution**: All scripts now use retry logic with exponential backoff
```bash
# Wait for service to become ready
pnpm run health:wait

# Then run your script
pnpm run catalog:import
```

### Missing Publishable Key (RFD-004 Issue #4)
**Problem**: Store API returns 401
**Solution**: Run the setup automation
```bash
pnpm run setup:keys
# Copy the output key to storefront .env as NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
```

### Build Validation Failures (RFD-004 Issue #2)
**Problem**: `pnpm start` fails with missing admin build
**Solution**: Run build and validation
```bash
pnpm run build
pnpm run validate:build
pnpm run start
```

### Hetzner Provisioning Issues (RFD-004 Issue #6)
**Problem**: PostgreSQL/Redis not configured on remote node
**Solution**: Run provisioning script
```bash
source /tmp/medusa-secrets.env
ssh hetzner-node 'bash -s' < scripts/hetzner-provision.sh
```

### Catalog Import Failures (RFD-004 Issue #5)
**Problem**: Products fail to import or data is incorrect
**Solution**: Use enhanced import with verification
```bash
pnpm run catalog:import      # Now includes retry logic and progress
pnpm run catalog:verify      # Verify imported data matches source
```

## RFD-004 Resolution Status

✅ **Issue #1**: Dev server instability → **Resolved** with PM2 ecosystem config
✅ **Issue #2**: Admin build requirement → **Resolved** with validate-build script
✅ **Issue #3**: Fetch inconsistencies → **Resolved** with retry utility
✅ **Issue #4**: Missing publishable key → **Resolved** with setup-publishable-key script
✅ **Issue #5**: Catalog importer issues → **Resolved** with enhanced import + verification
✅ **Issue #6**: Hetzner provisioning gaps → **Resolved** with provisioning script

Keep this README updated as the backend matures (plugins, modules, CI steps, etc.).
