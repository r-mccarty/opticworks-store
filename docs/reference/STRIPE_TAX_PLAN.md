# Stripe Tax Integration Plan (Medusa v2)

## Current State
- Tax module not registered in `backend/medusa-config.ts`.
- Tax regions seeded with default `tp_system` provider (`backend/src/scripts/seed.ts`, `seed-us-region.ts`).
- No Stripe Tax provider or commit logic; no tax workflows.

## Goals
- Add Medusa v2 Tax module with a Stripe Tax provider.
- Return tax lines that carry Stripe `calculation.id` metadata.
- Commit transactions to Stripe on order placement so Stripe Tax reports populate.
- Keep secrets in Infisical; no hardcoded keys.

## Design Overview
- Module: Register `Modules.TAX` with `@medusajs/tax`; supply providers array including a new Stripe Tax provider (`resolve: "./src/modules/stripe-tax"`, `id: "stripe"`). Optionally keep `tp_system` as fallback.
- Provider responsibilities:
  - Calculate tax via `stripe.tax.calculations.create`.
  - Map Medusa line items/shipping to Stripe calc payload (major units).
  - Return Medusa tax lines with `metadata` carrying `stripe_calculation_id` (and per-line Stripe line item ids for traceability).
  - Handle idempotency/retries and logging.
- Commit step:
  - Subscriber on `order.placed` (or `order.completed`) loads order tax lines, extracts `stripe_calculation_id`, and calls `stripe.tax.transactions.createFromCalculation`.
  - Idempotency: treat “already exists” as success; skip gracefully if metadata missing.
  - Optionally wrap the commit call in a small workflow for observability (similar to EasyPost inbound pattern).

## Provider Implementation (./backend/src/modules/stripe-tax)
- `index.ts`: export provider config class.
- `types.ts`: strong typing for provider options (e.g., nexus country/state/postal, default tax codes).
- `service.ts`:
  - Inject Stripe SDK with `STRIPE_API_KEY`.
  - Build `calculations.create` payload from cart/order context:
    - Customer + shipping address (phone optional).
    - Line items: quantity, amount in major units, tax code (from product/shipping metadata or defaults).
    - Shipping: treat as shipping line with its own code.
    - Nexus: use provider options for registration address.
  - Call `stripe.tax.calculations.create`.
  - Return tax lines array with fields required by Medusa plus:
    - `metadata: { stripe_calculation_id: calc.id, stripe_line_item_id: calcLine.id, stripe_scope: "line|shipping" }`.
  - If Stripe unavailable and `allow_fallback` option is set, return zero taxes with log.

## Commit Subscriber / Workflow
- Location: `backend/src/subscribers/stripe-tax-commit.ts`.
- Event: `order.placed` (ensure order loaded with `summary.tax_lines`).
- Flow:
  1) Gather unique `stripe_calculation_id` values from tax lines (prefer summary tax lines; fallback to item/shipping tax lines).
  2) If none → log warn and exit.
  3) For each calculation id, call `stripe.tax.transactions.createFromCalculation({ calculation: id, reference: order.id, metadata: { order_id: order.id, display_id: order.display_id } })`.
  4) Catch idempotent/duplicate errors and treat as success; rethrow unexpected errors.
- Optional: replace direct call with a workflow `commit-stripe-tax` that performs the above for observability.

## Config Changes
- `backend/medusa-config.ts`:
  - Add `Modules.TAX` block with providers array including the Stripe provider.
  - Wire provider options from env (see below).
- Seeds:
  - Update `createTaxRegionsWorkflow` inputs to use provider id `tp_stripe` (matching Stripe provider id) instead of `tp_system`.

## Environment & Secrets (Infisical)
- `STRIPE_API_KEY` (already used for payments; reuse).
- Provider options via env:
  - `STRIPE_TAX_NEXUS_COUNTRY`, `STRIPE_TAX_NEXUS_STATE`, `STRIPE_TAX_NEXUS_POSTAL`.
  - Optional defaults: `STRIPE_TAX_PRODUCT_TAX_CODE`, `STRIPE_TAX_SHIPPING_TAX_CODE`.
  - Optional flag: `STRIPE_TAX_SKIP_COMMIT` for local dev.

## Testing
- Unit: provider maps items to Stripe payload; returns tax lines with metadata; zero/negative path when Stripe errors (with fallback).
- Unit/Integration: subscriber commits once per calculation id; ignores missing metadata; tolerates duplicate transaction errors.
- End-to-end (optional): create cart/order in test mode, ensure tax lines carry calculation id, and commit call fires on order placement (mock Stripe in CI).

## Rollout Steps
1) Implement provider module and register `Modules.TAX`.
2) Update seeds to attach tax regions to Stripe provider.
3) Add subscriber (or workflow + subscriber) for commit.
4) Add tests.
5) Local/CI run: `pnpm lint && pnpm test` (backend).
6) Deploy; verify Stripe Tax dashboard shows committed transactions for new orders.
