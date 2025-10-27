# OpticWorks Medusa Backend Workspace

This workspace hosts the Medusa v2 backend configuration for the OpticWorks store migration. It encapsulates the Stripe payment
provider registration, region enablement automation, and verification tooling described in `../docs/migration-plan.md`.

## Structure

- `medusa-config.ts` – Central Medusa configuration that wires the Stripe provider via `STRIPE_API_KEY` and `STRIPE_WEBHOOK_SECRET`.
- `src/seeds/ensure-stripe-us-region.ts` – Automation script that enables Stripe for US regions using the Medusa Admin API.
- `scripts/verify-stripe-payment.ts` – Integration probe that exercises the Payment Collection API and verifies a Stripe session ID.
- `test/` – Jest-based configuration and automation tests.

## Usage

```bash
# Install workspace dependencies from the monorepo root
pnpm install

# Run automated configuration tests
pnpm --filter @opticworks/medusa-backend test

# Seed Stripe as the payment provider for US regions
pnpm --filter @opticworks/medusa-backend seed:stripe-region

# Validate Payment Collection ↔ Stripe wiring against a running Medusa server
MEDUSA_BACKEND_URL=http://localhost:9000 \
MEDUSA_REGION_ID=reg_us \
STRIPE_API_KEY=sk_test_... \
pnpm --filter @opticworks/medusa-backend test:integration:stripe
```

Copy `.env.example` into `.env` and supply production credentials before deploying the Medusa backend.
