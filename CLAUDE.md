# Agent Context

E-commerce platform: Next.js 15 + Medusa v2 + Stripe + Cloudflare Workers.

## Commands

```bash
pnpm run dev                        # Dev server (localhost:3000)
pnpm run lint && pnpm run test      # Pre-commit checks
pnpm run cf:build                   # Cloudflare Workers build (runs next build internally)
```

## Structure

```
src/
├── app/                # Next.js App Router (pages, API routes)
├── components/         # React components (ui/, checkout/, products/)
├── hooks/              # Zustand stores (useCart, useAuth)
└── lib/api/            # Medusa API client

backend/                # Medusa v2 (standalone, not in pnpm workspace)
infrastructure/ansible/ # Hetzner deployment
e2e/                    # Playwright tests
```

## Constraints

- **pnpm only** - no npm/yarn
- **No `any` types** - strict TypeScript
- **Never commit secrets** - `.env.local`, `backend/.env`
- **Backend changes via Ansible** - no direct SSH edits

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/api/medusa.ts` | All Medusa API calls |
| `src/hooks/useCart.ts` | Cart state (hybrid local + Medusa) |
| `src/hooks/useAuth.ts` | Customer authentication |
| `backend/medusa-config.ts` | Backend configuration |
| `wrangler.jsonc` | Cloudflare Workers config |

## Architecture

```
optic.works (Workers) --> api.optic.works --> Medusa (Hetzner)
                      --> medusa.optic.works (SSR bypass)
```

SSR uses `medusa.optic.works` to avoid Cloudflare edge hairpin issues.

## Development Workflow

1. Develop locally with `pnpm dev`
2. Run `pnpm lint && pnpm test` before committing
3. Push to feature branch → Cloudflare automatically verifies build
4. Create PR to `main` → Cloudflare build check must pass
5. Merge to `main` → Cloudflare auto-deploys to production

## Deployment

```bash
# Storefront - auto-deploys on push to main via Cloudflare
# Manual deploy (from local machine with sufficient RAM):
pnpm run cf:deploy:production

# Backend (Ansible)
cd infrastructure/ansible
ansible-playbook playbooks/medusa-deploy.yml
```

## Secrets

```bash
pnpm run secrets:pull   # Pulls from Infisical to .env.local
```

Key variables: `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

## Build Workarounds

| Issue | Solution |
|-------|----------|
| Medusa unavailable at build | Static product fallback |
| Product pages SSG fails | `force-dynamic` export |
| Stripe SDK at build | Lazy init with `getStripe()` |

## Current State

- **Phase 3 Complete**: Products, cart, checkout, auth, email, E2E tests
- **Phase 4 Active**: Production products, design system, FedEx fulfillment, docs site

See `docs/reference/PHASE4_PLAN.md` for current tracks.

## Reference Docs

| Document | Use When |
|----------|----------|
| `docs/reference/ARCHITECTURE.md` | System overview |
| `docs/reference/PHASE4_PLAN.md` | Current implementation |
| `docs/reference/DEPLOYMENT_GUIDE.md` | Ansible deployment, backup & recovery |
| `docs/reference/CLOUDFLARE_API.md` | R2, Tunnels, DNS programmatic access |
| `docs/SECRETS.md` | Environment variables |
