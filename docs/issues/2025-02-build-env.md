# Issue: Builds require manual dummy env setup

- **Opened by**: automation (Codex)
- **Date**: 2025-02-14

## Summary
Next.js builds still hard crash when STRIPE and Supabase env vars are missing. While fixing the cart hydration bug we had to set temporary dummy values (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) just to run `pnpm run build`. Without Infisical configured this is a blocker for new contributors or CI smoke builds.

## Impact
- `pnpm run build` fails before collecting page data if the env vars are absent.
- Docs and README currently tell developers to run `pnpm run build` before PRs, so missing env defaults becomes a constant friction point.
- CI cannot run against forks without injecting secrets, shrinking the contributor pool.

## Proposed Remedies
1. **Guard the API routes** (`src/app/api/order-details`, `src/app/api/stripe/webhook`, etc.) so they short-circuit when required env vars are missing, letting builds continue.
2. **Document dummy values** in `.env.template` (or a new `docs/LOCAL_ENV.md`) so devs know the minimal placeholders to unblock builds.
3. **Provide a `scripts/setup-env-dummies.ts`** that writes non-secret defaults for local-only builds/tests.

Happy to help implement once we align on the preferred approach.
