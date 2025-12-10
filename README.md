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

EasyPost --> Hookdeck --> api.optic.works (tracker webhooks)
Stripe   --> Hookdeck --> optic.works (payment webhooks)
```

| Component | Stack |
|-----------|-------|
| Storefront | Next.js 15, React 19, Tailwind 4, Shadcn |
| Backend | Medusa v2, PostgreSQL 17, Redis 7 |
| Payments | Stripe (deferred intent pattern) |
| Fulfillment | EasyPost (rates, labels, tracking) |
| Email | Resend |
| Hosting | Cloudflare Workers + Hetzner Cloud |

## Deployment

### Storefront

Auto-deploys on push to `main` via Cloudflare Git integration.

```bash
# Manual deploy
pnpm run cf:build
pnpm exec wrangler deploy --env production
```

### Backend

```bash
cd infrastructure/ansible
export INFISICAL_SERVICE_TOKEN=st.xxx
bash scripts/generate-secrets-from-infisical.sh
ansible-playbook -i inventory/production.ini playbooks/medusa-deploy.yml
```

## Testing

```bash
pnpm run lint && pnpm run test              # Unit tests
pnpm exec playwright test --project=chromium # E2E tests
```

E2E tests include Mailosaur (email verification) and Hookdeck (webhook verification).

## Documentation

| Document | Purpose |
|----------|---------|
| [CLAUDE.md](CLAUDE.md) | Agent context, workflows, quick reference |
| [docs/SECRETS.md](docs/SECRETS.md) | All environment variables |
| [docs/reference/](docs/reference/) | Deep-dive documentation index |

### Key Reference Docs

| Topic | Document |
|-------|----------|
| SSH, logs, Admin API | [BACKEND_OPERATIONS.md](docs/reference/BACKEND_OPERATIONS.md) |
| Shipping & fulfillment | [FULFILLMENT.md](docs/reference/FULFILLMENT.md) |
| Checkout flow | [CHECKOUT_FLOW.md](docs/reference/CHECKOUT_FLOW.md) |
| Webhooks | [WEBHOOKS.md](docs/reference/WEBHOOKS.md) |
| Ansible deployment | [DEPLOYMENT_GUIDE.md](docs/reference/DEPLOYMENT_GUIDE.md) |
| E2E testing | [E2E_TESTING.md](docs/reference/E2E_TESTING.md) |
