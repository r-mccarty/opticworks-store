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
│   ├── api/            # API routes (stripe/, auth/, analytics/)
│   ├── products/       # Product pages ([slug] is dynamic)
│   ├── store/cart/     # Shopping cart and checkout
│   ├── auth/           # Login/register pages
│   ├── account/        # Customer account dashboard
│   └── support/        # Customer support flows
├── components/
│   ├── ui/             # Shadcn primitives (use cn() helper)
│   ├── checkout/       # Stripe Elements integration
│   └── products/       # Product marketing components
├── hooks/
│   ├── useCart.ts      # Cart state (hybrid local + Medusa)
│   ├── useAuth.ts      # Customer authentication
│   ├── useCheckoutState.ts  # Checkout flow (ephemeral)
│   └── useSupportStore.ts   # Support forms (persisted)
└── lib/
    ├── api/medusa.ts   # Medusa backend integration (SSR-aware)
    ├── products.ts     # Static product fallback
    └── utils.ts        # cn/cx helpers

backend/                # Medusa v2 (standalone package, not in workspace)
infrastructure/ansible/ # Deployment playbooks (provision, deploy, destroy)
e2e/                    # Playwright E2E tests
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
2. **`force-dynamic` on products** - SSG fails without Medusa API at build time
3. **Lazy Stripe init** - Stripe SDK throws at build if key missing, use getStripe() pattern

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/api/medusa.ts` | All Medusa API calls (SSR uses medusa.optic.works) |
| `src/hooks/useCart.ts` | Cart state management (hybrid local + Medusa) |
| `src/hooks/useAuth.ts` | Customer authentication (httpOnly cookies) |
| `src/app/api/stripe/webhook/route.ts` | Stripe webhook handler |
| `backend/medusa-config.ts` | Medusa backend configuration |
| `wrangler.jsonc` | Cloudflare Workers configuration |
| `infrastructure/ansible/playbooks/medusa-deploy.yml` | Deploy backend changes |

## Current State

- **Storefront**: Live at optic.works (Cloudflare Workers via OpenNext)
- **Backend**: Live at api.optic.works (Medusa v2, PostgreSQL, Redis)
- **SSR API**: medusa.optic.works (bypasses Cloudflare hairpin issue)
- **Phase 3**: Complete - all tracks done
- **Email**: Handled by Medusa backend via Resend
- **Webhooks**: Stripe → Hookdeck → optic.works/api/stripe/webhook
- **CORS**: Handled natively by Medusa (no proxy worker)

## Architecture

```
optic.works (Workers) ──┐
                        │
Browser ────────────────┼── api.optic.works ──┐
                        │                     │
SSR requests ───────────┴── medusa.optic.works┼── Tunnel ── Medusa (Hetzner)
```

Both `api.optic.works` and `medusa.optic.works` route to the same Medusa backend via Cloudflare Tunnel. SSR uses `medusa.optic.works` to bypass the Cloudflare edge hairpin issue.

## Deployment

### Storefront (Cloudflare Workers)

```bash
# Build and deploy to production
unset NODE_ENV && pnpm run cf:build
pnpm exec wrangler deploy --env production

# Preview deployment (workers.dev)
unset NODE_ENV && pnpm run cf:deploy
```

### Backend (Medusa on Hetzner)

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

## Reference Docs (Deep Dives)

For detailed context, see `docs/reference/`:

| Document | Use When |
|----------|----------|
| ARCHITECTURE.md | Understanding system architecture |
| PHASE3_PLAN.md | Understanding implementation tracks |
| DEPLOYMENT_GUIDE.md | Debugging Ansible, full provisioning |
| KEY_MANAGEMENT.md | Full secrets inventory (~50 vars) |
| STATE_MANAGEMENT.md | Modifying Zustand stores |
| STRIPE_INTEGRATION.md | Payment flow debugging |
