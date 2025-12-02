# Agent Context

E-commerce platform: Next.js 15 storefront + Medusa v2 backend + Stripe payments.

## Commands

```bash
pnpm run dev                        # Dev server (localhost:3000)
pnpm run lint && pnpm run test      # Pre-commit checks
unset NODE_ENV && pnpm run build    # Production build (unset required in Codespaces)
```

## Repository Structure

```
src/
├── app/                # Next.js App Router
│   ├── api/            # API routes (stripe/, email/, analytics/)
│   ├── products/       # Product pages ([slug] is dynamic)
│   ├── store/cart/     # Shopping cart
│   └── support/        # Customer support flows
├── components/
│   ├── ui/             # Shadcn primitives (use cn() helper)
│   ├── checkout/       # Stripe Elements integration
│   └── products/       # Product marketing components
├── hooks/
│   ├── useCart.ts      # Cart state (persisted to localStorage)
│   ├── useCheckoutState.ts  # Checkout flow (ephemeral)
│   └── useSupportStore.ts   # Support forms (persisted)
└── lib/
    ├── api/medusa.ts   # Medusa backend integration
    ├── products.ts     # Static product fallback
    └── utils.ts        # cn/cx helpers

backend/                # Medusa v2 (standalone package, not in workspace)
infrastructure/ansible/ # Deployment playbooks (provision, deploy, destroy)
```

## Constraints

- **pnpm only** - no npm/yarn
- **No `any` types** - strict TypeScript
- **Never commit secrets** - .env.local, backend/.env
- **Backend changes via Ansible only** - no direct SSH edits (prevents drift)
- **Build timeout** - 2-3 minutes, use 240s timeout

## Build Workarounds

These are known issues with documented fixes:

1. **`unset NODE_ENV`** - Codespaces sets NODE_ENV=development, breaks Next.js build
2. **Email stubbed** - react-email conflicts with Next.js 15 SSG, emails log only
3. **`force-dynamic` on products** - SSG fails without Medusa API at build time
4. **Lazy Stripe init** - Stripe SDK throws at build if key missing, use getStripe() pattern

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/api/medusa.ts` | All Medusa API calls (products, cart, checkout) |
| `src/hooks/useCart.ts` | Cart state management (hybrid local + Medusa) |
| `src/app/api/stripe/webhook/route.ts` | Stripe webhook handler |
| `backend/medusa-config.ts` | Medusa backend configuration |
| `infrastructure/ansible/playbooks/medusa-deploy.yml` | Deploy backend changes |

## Current State

- **Backend**: Live at api.optic.works (Medusa v2, PostgreSQL, Redis)
- **Phase 3**: Cart/checkout code complete, needs runtime testing
- **Email**: Stubbed (will restore via Medusa notifications)
- **SSG**: Disabled for product pages (force-dynamic)

## Deployment

```bash
# Deploy backend code changes
cd infrastructure/ansible
ansible-playbook playbooks/medusa-deploy.yml

# SSH for debugging only (don't edit files!)
ssh hetzner-node
pm2 status
pm2 logs medusa-dev
```

## Secrets

Pull from Infisical: `pnpm run secrets:pull`

Key variables:
- `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` - Store API access
- `STRIPE_SECRET_KEY` - Server-side payments
- `STRIPE_WEBHOOK_SECRET` - Webhook verification

See `docs/SECRETS.md` for full list.
