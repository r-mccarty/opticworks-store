# Agent Context

E-commerce store: Next.js 15 + Medusa v2 + Stripe.

## Commands

```bash
pnpm run dev                        # Dev server
pnpm run lint && pnpm run test      # Pre-commit
unset NODE_ENV && pnpm run build    # Build (unset required in Codespaces)
```

## Structure

```
src/app/           # Pages + API routes
src/components/    # React components
src/hooks/         # Zustand stores (useCart, useCheckoutState)
src/lib/api/       # Backend integration (medusa.ts)
backend/           # Medusa v2 (separate package)
infrastructure/ansible/  # Deployment
```

## Constraints

- pnpm only (no npm/yarn)
- No `any` types
- Never commit .env.local
- Deploy backend via Ansible only

## Current State

- Medusa backend live at api.optic.works
- Email stubbed (react-email conflict)
- Product pages force-dynamic (no SSG)
