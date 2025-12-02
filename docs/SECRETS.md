# Secrets Management

All secrets stored in **Infisical**. Never commit `.env.local` or `backend/.env`.

## Quick Start

### Codespaces (Recommended)

`INFISICAL_SERVICE_TOKEN` is pre-configured. Just run:

```bash
pnpm run secrets:pull
```

### Local Development

```bash
# Get token from team or Infisical dashboard
export INFISICAL_SERVICE_TOKEN=st.xxx.xxx

# Pull secrets (writes .env.local)
pnpm run secrets:pull

# Verify
cat .env.local | head -5
```

## Key Variables

### Storefront (.env.local)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | Medusa Store API access |
| `NEXT_PUBLIC_MEDUSA_BASE_URL` | Backend URL (https://api.optic.works) |
| `STRIPE_SECRET_KEY` | Server-side Stripe operations |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client-side Stripe Elements |

### Backend (via Ansible)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | Auth token signing |
| `COOKIE_SECRET` | Session cookie encryption |
| `MEDUSA_ADMIN_EMAIL` | Admin dashboard login |
| `MEDUSA_ADMIN_PASSWORD` | Admin dashboard password |

## Infisical Structure

```
Project: OpticWorks
├── development/     # Local dev secrets
│   └── /            # Storefront variables
├── production/
│   ├── /            # Storefront variables
│   ├── /medusa      # Backend variables
│   └── /infrastructure  # Ansible variables
```

## Backend Secrets (Ansible)

Backend secrets are pulled by Ansible during deployment:

```bash
cd infrastructure/ansible
bash scripts/generate-secrets-from-infisical.sh  # Writes group_vars/secrets.yml
ansible-playbook playbooks/medusa-deploy.yml
```

Never edit `group_vars/secrets.yml` directly - regenerate from Infisical.

## Adding New Secrets

1. Add to Infisical via web UI
2. For storefront: `pnpm run secrets:pull`
3. For backend: Run Ansible deploy

## Rotation Schedule

- **Backend secrets**: Monthly (DATABASE_URL, JWT_SECRET, etc.)
- **API keys**: Quarterly (Stripe, analytics)
- **Service tokens**: Yearly

## Troubleshooting

**"INFISICAL_SERVICE_TOKEN not set"**
```bash
export INFISICAL_SERVICE_TOKEN=st.xxx.xxx
```

**"Project not found"**
- Check token has access to OpticWorks project
- Verify environment (development vs production)

**Secrets not updating**
```bash
rm .env.local
pnpm run secrets:pull
```
