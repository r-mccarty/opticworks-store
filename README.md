# OpticWorks Store

Next.js 15 storefront + Medusa v2 backend for mmWave presence sensors.

## Quick Start

```bash
pnpm install
pnpm run secrets:pull    # Needs INFISICAL_SERVICE_TOKEN
pnpm run dev             # localhost:3000
```

## Build (Required Before Commit)

```bash
pnpm run lint
pnpm run test
unset NODE_ENV && pnpm run build   # unset required in Codespaces
```

## Deploy Backend

```bash
cd infrastructure/ansible
ansible-playbook playbooks/medusa-deploy.yml
```

## Production URLs

- API: https://api.optic.works
- Admin: https://api.optic.works/app
- Health: https://api.optic.works/health

## Secrets

All secrets in Infisical. Key variables:
- `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` - Store API
- `STRIPE_SECRET_KEY` - Payments
- `STRIPE_WEBHOOK_SECRET` - Webhooks

Pull with `pnpm run secrets:pull`. Never commit `.env.local`.

## Structure

```
src/           # Next.js storefront
backend/       # Medusa v2 (standalone)
infrastructure/ansible/  # Deployment playbooks
```

## Known Issues

- Email stubbed (react-email/Next.js 15 conflict)
- Product pages use `force-dynamic` (SSG disabled)
- Build requires `unset NODE_ENV` in Codespaces

## License

Proprietary - OpticWorks, Inc.
