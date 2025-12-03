# OpticWorks Store

Next.js 15 storefront + Medusa v2 backend for mmWave presence sensors.

**Live**: [optic.works](https://optic.works) | [API](https://api.optic.works) | [Admin](https://api.optic.works/app)

## Quick Start

```bash
pnpm install
pnpm run secrets:pull    # Pulls from Infisical (needs INFISICAL_SERVICE_TOKEN)
pnpm run dev             # localhost:3000
```

## Pre-Commit (Required)

```bash
pnpm run lint
pnpm run test
unset NODE_ENV && pnpm run build   # unset required in Codespaces
```

## Repository Structure

```
src/                    # Next.js 15 storefront
├── app/                # Pages + API routes
├── components/         # React components (ui/, checkout/, products/)
├── hooks/              # Zustand stores (useCart, useAuth, useCheckoutState)
└── lib/api/            # Backend integration (medusa.ts)

backend/                # Medusa v2 (standalone, not workspace)
├── medusa-config.ts    # Medusa configuration
└── src/                # Custom modules (resend notifications)

infrastructure/ansible/ # IaC for Hetzner deployment
├── playbooks/          # provision, deploy, destroy
└── inventory/          # production.ini
```

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  optic.works    │     │ api.optic.works │     │    Hookdeck     │
│  (Cloudflare    │     │ (Cloudflare     │     │   (Webhooks)    │
│   Workers)      │     │  Tunnel)        │     │                 │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │  SSR uses             │                       │
         │  medusa.optic.works   │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────┐
                    │   Hetzner Cloud     │
                    │   Medusa + PG + Redis│
                    └─────────────────────┘
```

| Hostname | Purpose |
|----------|---------|
| `optic.works` | Storefront (Cloudflare Workers + OpenNext) |
| `api.optic.works` | Medusa API (client-side requests) |
| `medusa.optic.works` | Medusa API (SSR requests, bypasses hairpin) |

## Deployment

### Storefront (Cloudflare Workers)

```bash
unset NODE_ENV && pnpm run cf:build
pnpm exec wrangler deploy --env production
```

### Backend (Medusa on Hetzner)

**Backend is immutable** - all changes via Ansible only:

```bash
cd infrastructure/ansible
ansible-playbook playbooks/medusa-deploy.yml    # Deploy code changes
ansible-playbook playbooks/medusa-provision.yml # Full rebuild
```

**Never SSH and edit files directly** - prevents drift.

### SSH Access (Codespaces)

```bash
ssh hetzner-node        # Pre-configured in Codespaces
pm2 status              # Check Medusa process
pm2 logs medusa-dev     # View logs
```

## Secrets

All secrets in Infisical. See [docs/SECRETS.md](docs/SECRETS.md) for details.

```bash
pnpm run secrets:pull   # Writes .env.local
```

Never commit `.env.local` or `backend/.env`.

## Build Workarounds

| Issue | Workaround |
|-------|------------|
| Codespaces sets NODE_ENV | `unset NODE_ENV && pnpm run build` |
| Medusa API unavailable at build | Products fallback to static data |
| Product pages SSG fails | `force-dynamic` on product routes |
| Stripe SDK at build time | Lazy initialization with getStripe() |

## Project Status

| Phase | Status | Description |
|-------|--------|-------------|
| 0 | ✅ Done | Next.js storefront with static products |
| 1 | ✅ Done | Medusa backend deployed to Hetzner |
| 2 | ✅ Done | Storefront integrated with Medusa API |
| 3 | ✅ Done | Full e-commerce (cart, checkout, payments, auth) |
| 4 | 📋 Planned | Docs site, Discord, CI/CD hardening |

**Phase 3 Complete**: All tracks done - products, cart, checkout, payments, customer auth, E2E tests, Cloudflare Workers deployment.

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4, Shadcn UI
- **Backend**: Medusa v2, PostgreSQL 17, Redis 7
- **Payments**: Stripe (via Medusa payment provider)
- **Email**: Resend (via Medusa notification provider)
- **Hosting**: Cloudflare Workers (storefront), Hetzner Cloud (backend)
- **Infra**: Cloudflare Tunnel, Ansible, Infisical

## Reference Docs

For deep dives, see [docs/reference/](docs/reference/):
- [ARCHITECTURE.md](docs/reference/ARCHITECTURE.md) - System architecture
- [PHASE3_PLAN.md](docs/reference/PHASE3_PLAN.md) - Implementation tracks
- [DEPLOYMENT_GUIDE.md](docs/reference/DEPLOYMENT_GUIDE.md) - Ansible playbooks
- [STRIPE_INTEGRATION.md](docs/reference/STRIPE_INTEGRATION.md) - Payment flow

## License

Proprietary - OpticWorks, Inc.
