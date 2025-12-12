# Medusa v2 Stripe Tax Integration – Canonical Snapshot (Jan 2025)

This document summarizes the **current, canonical implementation** of Stripe Tax, shipping, and checkout. Historical workarounds (hydration guards, blind redirects, frontend shipping) have been removed.

## Current Architecture (front-to-back)

- **Cart & State:** Cart source of truth is Medusa. Zustand caches cart ID/items; SSR cart fetch (`getCartSSR`) hydrates the Cart page to avoid hydration hacks.
- **Shipping:** EasyPost fulfillment provider in Medusa. Frontend fetches `/store/shipping-options` + `/calculate`, then adds shipping via `/store/carts/{id}/shipping-methods`. No client-side carrier calls.
- **Tax:** Custom Stripe Tax provider. Medusa’s double-call (items then shipping) is handled by returning empty shipping lines on the shipping-only call; commit happens via `order.placed` subscriber using Stripe `transactions.createFromCalculation`.
- **Payments:** Stripe Elements deferred intent. Amount updates via `elements.update`; PaymentIntent created at submit via Medusa payment collections. Order completion uses `completeCart`, with webhook-aware polling fallback (no blind redirect).
- **SSR/Bypass:** Frontend uses publishable key + public base URL; SSR uses `MEDUSA_SSR_BASE_URL` bypass to avoid tunnel hairpinning.

## Known Platform Quirks

- Medusa tax provider is invoked twice (items, then shipping). Combined calculation isn’t supported today; provider returns empty on shipping-only call.
- Calculated shipping requires per-option `calculate` calls; raw `shipping-options` won’t include carrier prices.

## Practices to Keep Canonical

- Keep all commerce rules (tax, shipping, totals) in Medusa; frontend only displays Medusa responses.
- Reuse payment collections to avoid duplicate PaymentIntents; refresh Elements amount instead of remounting.
- Keep Stripe Tax commit async/idempotent; failures must not block order placement.
- Use SSR cart fetch to avoid hydration drift; validate cached cart IDs and start fresh if missing/complete.

## Watchlist / Future

- If Medusa adds combined tax calculation, update provider to compute items + shipping in one call.
- Consider React Query/TanStack for cart fetching to simplify client state further.
- Monitor EasyPost/Stripe rate limits; add caching only if needed (do not reintroduce client-side pricing).

## References

- Backend modules: `backend/src/modules/stripe-tax`, `backend/src/subscribers/stripe-tax-commit.ts`, `backend/src/modules/easypost-fulfillment`
- Frontend flows: `src/hooks/useMedusaShipping.ts`, `src/components/checkout/CheckoutForm.tsx`, `src/lib/api/medusa.ts`, `src/app/store/cart/page.tsx`
