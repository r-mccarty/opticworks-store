# OpticWorks Store

E-commerce platform for mmWave presence sensors. Next.js 15 storefront + Medusa v2 backend.

**Live**: [optic.works](https://optic.works) | [Admin](https://api.optic.works/app)

## Quick Start

```bash
pnpm install
pnpm run secrets:pull    # Requires INFISICAL_SERVICE_TOKEN
pnpm run dev             # localhost:3000
```

## Architecture

```
optic.works (Cloudflare Workers)
       |
       |-- Browser requests --> api.optic.works --|
       |                                          |--> Medusa (Hetzner)
       |-- SSR requests ------> medusa.optic.works|
```

| Component | Stack |
|-----------|-------|
| Storefront | Next.js 15, React 19, Tailwind 4, Shadcn |
| Backend | Medusa v2, PostgreSQL 17, Redis 7 |
| Payments | Stripe via Medusa |
| Email | Resend via Medusa |
| Hosting | Cloudflare Workers + Hetzner Cloud |

## Deployment

### Storefront

```bash
unset NODE_ENV && pnpm run cf:build
pnpm exec wrangler deploy --env production
```

### Backend

```bash
cd infrastructure/ansible
ansible-playbook playbooks/medusa-deploy.yml
```

## Project Status

| Phase | Status |
|-------|--------|
| 1-3 | Complete (full e-commerce functional) |
| 4 | In Progress (production polish, fulfillment, docs site) |

See [docs/reference/PHASE4_PLAN.md](docs/reference/PHASE4_PLAN.md) for current work.

## Reference

| Document | Purpose |
|----------|---------|
| [CLAUDE.md](CLAUDE.md) | AI agent context |
| [docs/SECRETS.md](docs/SECRETS.md) | Environment variables |
| [docs/reference/](docs/reference/) | Deep-dive documentation |
