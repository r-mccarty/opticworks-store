# Secrets

All secrets stored in Infisical. Never commit `.env.local`.

## Pull Secrets

```bash
export INFISICAL_SERVICE_TOKEN=st.xxx  # Not needed in Codespaces
pnpm run secrets:pull
```

## Key Variables

### Storefront (.env.local)
- `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` - Medusa Store API
- `NEXT_PUBLIC_MEDUSA_BASE_URL` - https://api.optic.works
- `STRIPE_SECRET_KEY` - Server-side payments
- `STRIPE_WEBHOOK_SECRET` - Webhook verification
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Client-side Stripe

### Backend (via Ansible)
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `JWT_SECRET` - Auth tokens
- `COOKIE_SECRET` - Session cookies

## Rotation

Backend secrets: Monthly
Storefront secrets: Quarterly

Use Infisical web UI to update. Run `pnpm run secrets:pull` after changes.
