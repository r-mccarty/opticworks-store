# OpticWorks Store

Next.js 15 storefront + Medusa v2 backend for mmWave presence sensors.

**Live**: [api.optic.works](https://api.optic.works) | [Admin](https://api.optic.works/app)

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
├── hooks/              # Zustand stores (useCart, useCheckoutState)
└── lib/api/            # Backend integration (medusa.ts)

backend/                # Medusa v2 (standalone, not workspace)
├── medusa-config.ts    # Medusa configuration
└── src/scripts/        # Automation scripts

infrastructure/ansible/ # IaC for Hetzner deployment
├── playbooks/          # provision, deploy, destroy
└── inventory/          # production.ini
```

## Deployment

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
| react-email breaks SSG | Email system stubbed (logging only) |
| Medusa API unavailable at build | Products fallback to static data |
| Product pages SSG fails | `force-dynamic` on product routes |

## Project Phases

| Phase | Status | Description |
|-------|--------|-------------|
| 0 | ✅ Done | Next.js storefront with static products |
| 1 | ✅ Done | Medusa backend deployed to Hetzner |
| 2 | ✅ Done | Storefront integrated with Medusa API |
| 3 | 🚧 In Progress | Full e-commerce (cart, checkout, payments) |
| 4 | 📋 Planned | Docs site, Discord, CI/CD hardening |

**Phase 3 Status**: Tracks 1-4 complete (regions, products, cart, checkout code). Needs runtime testing. Email stubbed, will restore via Medusa notifications.

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind, Shadcn UI
- **Backend**: Medusa v2, PostgreSQL 17, Redis 7
- **Payments**: Stripe
- **Infra**: Hetzner Cloud, Cloudflare Tunnel, Ansible
- **Secrets**: Infisical

## License

Proprietary - OpticWorks, Inc.
