# Agent Context

E-commerce platform: Next.js 15 + Medusa v2 + Stripe + Cloudflare Workers.

## Quick Commands

```bash
pnpm run dev                        # Dev server (localhost:3000)
pnpm run lint && pnpm run test      # Pre-commit checks
pnpm run secrets:pull               # Pull secrets from Infisical
pnpm exec playwright test --project=chromium  # E2E tests
```

## Structure

```
src/app/              # Next.js App Router
src/components/       # React components
src/hooks/            # Zustand stores (useCart, useAuth)
src/lib/api/          # Medusa API client
backend/              # Medusa v2 backend (standalone)
infrastructure/ansible/  # Hetzner deployment
e2e/                  # Playwright tests
```

## Constraints

- **pnpm only** - no npm/yarn
- **No `any` types** - strict TypeScript
- **Never commit secrets** - use Infisical (`docs/SECRETS.md`)
- **Backend changes via Ansible** - no direct SSH edits

## Frontend Workflow

1. Develop: `pnpm dev`
2. Test: `pnpm lint && pnpm test`
3. Build: `pnpm run cf:build`
4. Deploy: Push to `main` → Cloudflare auto-deploys
5. E2E: `pnpm exec playwright test --project=chromium`

## Backend Workflow

```bash
cd infrastructure/ansible
export INFISICAL_SERVICE_TOKEN=st.xxx
bash scripts/generate-secrets-from-infisical.sh
ansible-playbook -i inventory/production.ini playbooks/medusa-deploy.yml
```

Full provisioning: `playbooks/medusa-provision.yml`
Teardown: `playbooks/medusa-destroy.yml`

## Debugging & Monitoring

| Task | Command/Method |
|------|----------------|
| Backend errors | Sentry dashboard (`opticworks-backend` project) |
| Frontend errors | Sentry dashboard (`opticworks-storefront` project) |
| Edge metrics | Cloudflare Dashboard → Workers & Pages → Analytics |
| Medusa logs (JSON) | `ssh hetzner-node "tail -f /opt/opticworks/medusa-backend/logs/medusa-app.log"` |
| Medusa logs (pretty) | `ssh hetzner-node "tail -f ..." \| pnpm pino-pretty` |
| PM2 status | `ssh hetzner-node "pm2 status"` |
| Orphaned processes | `ssh hetzner-node "ps aux \| grep medusajs/cli"` |
| Backend health | `curl https://api.optic.works/health` |
| Webhook logs | Hookdeck Admin API (`e2e/fixtures/hookdeck-utils.ts`) |
| Email delivery | Mailosaur API (`e2e/fixtures/email-utils.ts`) |
| Cloudflare resources | See `docs/reference/CLOUDFLARE_API.md` |

See `docs/reference/OBSERVABILITY.md` for full monitoring strategy.

## Architecture

```
optic.works (Workers) → api.optic.works → Medusa (Hetzner)
                      → medusa.optic.works (SSR bypass)

EasyPost → Hookdeck → Medusa webhooks (tracker.updated events)
Stripe   → Hookdeck → Storefront webhooks (checkout.session.completed)
```

## Key Integrations

| System | Purpose | Docs |
|--------|---------|------|
| EasyPost | Shipping rates, labels, tracking | `docs/reference/FULFILLMENT.md` |
| Hookdeck | Webhook gateway (Stripe + EasyPost) | `docs/reference/WEBHOOKS.md` |
| Stripe | Payments (deferred intent pattern) | `docs/reference/CHECKOUT_FLOW.md` |
| Stripe Tax | Automated sales tax calculation | `docs/reference/STRIPE_TAX.md` |
| Stripe (Saved Cards) | Customer sync, saved payment methods | `docs/reference/CUSTOMER_AUTH.md` |
| Turnstile | CAPTCHA spam prevention (contact form) | `docs/reference/CLOUDFLARE_API.md` |
| Sentry | Error tracking (backend + client-side) | `docs/reference/OBSERVABILITY.md` |
| Infisical | Secrets management | `docs/SECRETS.md` |
| Mailosaur | E2E email testing | `docs/reference/E2E_TESTING.md` |

## Reference Docs

| Document | Use When |
|----------|----------|
| `docs/reference/BACKEND_OPERATIONS.md` | SSH access, server logs, Medusa Admin API |
| `docs/reference/FULFILLMENT.md` | Shipping rates, labels, EasyPost provider |
| `docs/reference/FULFILLMENT_INBOUND.md` | Tracker webhooks, status updates |
| `docs/reference/CHECKOUT_FLOW.md` | Payment flow, Stripe integration |
| `docs/reference/STRIPE_TAX.md` | Sales tax calculation, Stripe Tax provider |
| `docs/reference/WEBHOOKS.md` | Stripe + EasyPost webhook handling |
| `docs/reference/E2E_TESTING.md` | Playwright, Mailosaur, Hookdeck testing |
| `docs/reference/E2E_DEBUGGING.md` | Debugging failed tests, correlation IDs |
| `docs/reference/DEPLOYMENT_GUIDE.md` | Ansible playbooks, backup & recovery |
| `docs/reference/CLOUDFLARE_API.md` | R2, Tunnels, DNS, rate limiting |
| `docs/reference/OBSERVABILITY.md` | Sentry setup, Cloudflare monitoring |
| `docs/reference/LOGGING.md` | Structured logging, Pino, correlation IDs |
| `docs/SECRETS.md` | All environment variables |
