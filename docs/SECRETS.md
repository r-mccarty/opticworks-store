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
├── dev/             # Local dev secrets (all at root path /)
├── staging/         # Staging secrets (all at root path /)
└── prod/            # Production secrets (all at root path /)
```

**Note:** All secrets are stored at the root path `/` - there are no subpaths like `/medusa` or `/infrastructure`. Environment names are short: `dev`, `staging`, `prod` (not `development`, `production`).

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

**Backend: "Pg connection failed" / KnexTimeoutError**
```bash
# Likely cause: PASSWORD in DATABASE_URL contains unencoded special chars
# Passwords with '/' need URL encoding (%2F), '=' needs (%3D)

# Check current value:
ssh hetzner-node "grep DATABASE_URL /opt/opticworks/medusa-backend/.env"

# If slashes aren't encoded (/), fix with:
# BAD:  postgresql://user:abc/def=@localhost/db
# GOOD: postgresql://user:abc%2Fdef%3D@localhost/db

# Ansible template now handles this automatically via:
# {{ password | regex_replace('/', '%2F') | urlencode }}
```

**Backend: Shell syntax error with angle brackets**
```bash
# Symptom: .env parse error "unexpected token"
# Cause: Values like "Name <email>" need quotes

# BAD:  FROM_EMAIL=Name <email@x.com>
# GOOD: FROM_EMAIL="Name <email@x.com>"
```
