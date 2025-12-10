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
| `POSTGRES_PASSWORD` | Raw PostgreSQL password (URL-encoded in DATABASE_URL) |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | Auth token signing |
| `COOKIE_SECRET` | Session cookie encryption |
| `MEDUSA_SECRET_KEY` | Medusa backend secret key |
| `MEDUSA_ADMIN_EMAIL` | Admin dashboard login |
| `MEDUSA_ADMIN_PASSWORD` | Admin dashboard password |
| `MEDUSA_ADMIN_CORS` | Allowed origins for admin API |
| `MEDUSA_STORE_CORS` | Allowed origins for store API |

### Cloudflare

| Variable | Purpose |
|----------|---------|
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account identifier |
| `CLOUDFLARE_API_TOKEN` | Scoped API token for automation |
| `CLOUDFLARE_EMAIL` | Account email |
| `CLOUDFLARE_GLOBAL_API_KEY` | Global API key (legacy, prefer token) |
| `CLOUDFLARE_API_BASE_URL` | API endpoint URL |
| `CLOUDFLARE_TUNNEL_ID` | Tunnel identifier for backend |
| `CLOUDFLARE_TUNNEL_CREDENTIALS` | JSON credentials for tunnel |

### R2 Storage

| Variable | Purpose |
|----------|---------|
| `R2_ACCESS_KEY_ID` | R2 access key for public bucket |
| `R2_SECRET_ACCESS_KEY` | R2 secret for public bucket |
| `R2_BUCKET_NAME` | Public assets bucket name |
| `R2_ENDPOINT_URL` | R2 S3-compatible endpoint |
| `R2_PUBLIC_URL` | Public CDN URL for assets |
| `R2_BACKUP_ACCESS_KEY_ID` | R2 access key for backups |
| `R2_BACKUP_SECRET_ACCESS_KEY` | R2 secret for backups |
| `R2_BACKUP_BUCKET_NAME` | Backup bucket name |

### Fulfillment (EasyPost)

| Variable | Purpose |
|----------|---------|
| `EASYPOST_API_KEY` | Production API key (starts with `EZAK`) |
| `EASYPOST_TEST_API_KEY` | Test API key (starts with `EZTK`) - for development/testing |
| `EASYPOST_MODE` | Mode toggle: `production` or `test` (controls which key is used) |
| `SHIP_FROM_NAME` | Origin warehouse name (e.g., `OpticWorks`) |
| `SHIP_FROM_STREET1` | Origin street address |
| `SHIP_FROM_CITY` | Origin city |
| `SHIP_FROM_STATE` | Origin state (2-letter code) |
| `SHIP_FROM_ZIP` | Origin ZIP code |
| `SHIP_FROM_PHONE` | Origin phone (required for FedEx rates) |

**Note:** Set `EASYPOST_MODE=test` during development to generate VOID labels without charges. See `docs/reference/FULFILLMENT.md` for full configuration details.

### Email

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Resend API for transactional email |
| `RESEND_FROM_EMAIL` | From address (e.g., `OpticWorks <notifications@notifications.optic.works>`) |

### Webhooks (Hookdeck)

| Variable | Purpose |
|----------|---------|
| `HOOKDECK_WEBHOOK_SECRET` | Signing secret for verifying Hookdeck signatures (Settings > Project > Secrets in Hookdeck dashboard) |
| `HOOKDECK_API_KEY` | Admin API key for querying events/deliveries (used in E2E tests) |

**Note:** Hookdeck sits between Stripe/EasyPost and our webhook endpoints, providing retry logic, logging, and validation. The signing secret verifies that webhook requests genuinely originate from Hookdeck. The API key enables E2E tests to verify webhook delivery.

#### Hookdeck Transformation Environment

The EasyPost verification transformation requires `EASYPOST_WEBHOOK_SECRET` to be set in the Hookdeck transformation environment (not Infisical). This is configured in Hookdeck Dashboard > Transformations > easypost-verify > Environment Variables.

See [RFD-012](reference/RFD-012-easypost-hookdeck-verification.md) and `infrastructure/hookdeck-transformations/README.md` for details.

### Background Jobs (QStash)

| Variable | Purpose |
|----------|---------|
| `QSTASH_URL` | QStash API endpoint |
| `QSTASH_TOKEN` | QStash authentication token |
| `QSTASH_CURRENT_SIGNING_KEY` | Current webhook signature key |
| `QSTASH_NEXT_SIGNING_KEY` | Next rotation signing key |

### Backup & Recovery

| Variable | Purpose |
|----------|---------|
| `RESTIC_PASSWORD` | Encryption password for restic backups |

### Testing

| Variable | Purpose |
|----------|---------|
| `MAILOSAUR_API_KEY` | Mailosaur API key for E2E email verification |
| `MAILOSAUR_SERVER_ID` | Mailosaur server ID (e.g., `cgbbp7hh`) - emails sent to `*@{server-id}.mailosaur.net` are captured |
| `CONTEXT7_API_KEY` | Context7 API key |

**Note:** Mailosaur enables E2E tests to verify transactional emails are actually sent. See `docs/reference/E2E_TESTING.md` for usage.

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
ansible-playbook -i inventory/production.ini playbooks/medusa-deploy.yml
```

Never edit `group_vars/secrets.yml` directly - regenerate from Infisical.

## Adding New Secrets

### Via Web UI
1. Add to Infisical via web UI at https://app.infisical.com
2. For storefront: `pnpm run secrets:pull`
3. For backend: Run Ansible deploy

### Via CLI
```bash
# Add a secret to prod environment
infisical secrets set SECRET_NAME="value" \
  --env=prod \
  --projectId=42e9e77c-88fa-4cbb-925b-5064c8e3b18c \
  --token="$INFISICAL_SERVICE_TOKEN"
```

## Rotation Schedule

- **Backend secrets**: Monthly (DATABASE_URL, JWT_SECRET, COOKIE_SECRET)
- **API keys**: Quarterly (Stripe, EasyPost, Resend)
- **Cloudflare credentials**: Quarterly
- **R2 keys**: Quarterly
- **Hookdeck signing secret**: Quarterly (rotate in dashboard, update Infisical)
- **QStash keys**: As needed (NEXT_SIGNING_KEY becomes CURRENT on rotation)
- **Service tokens**: Yearly
- **Backup encryption**: Yearly (RESTIC_PASSWORD - requires re-init)

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

This issue was caused by passwords containing URL-unsafe characters (`/`, `+`, `=`).

**Prevention**: `generate-secrets-from-infisical.sh` now validates that `POSTGRES_PASSWORD` is hex-only (no special characters). If you see this error during secret generation, follow the instructions to regenerate the password.

```bash
# Generate new hex-only password
openssl rand -hex 32

# Update in Infisical
infisical secrets set POSTGRES_PASSWORD="<new-password>" --env=prod \
  --projectId=42e9e77c-88fa-4cbb-925b-5064c8e3b18c --token="$INFISICAL_SERVICE_TOKEN"

# Regenerate secrets
cd infrastructure/ansible
bash scripts/generate-secrets-from-infisical.sh

# Update PostgreSQL and redeploy
ssh hetzner-node "sudo -u postgres psql -c \"ALTER USER medusa PASSWORD '<new-password>';\""
ansible-playbook -i inventory/production.ini playbooks/medusa-deploy.yml
```

**Backend: Shell syntax error with angle brackets**
```bash
# Symptom: .env parse error "unexpected token"
# Cause: Values like "Name <email>" need quotes

# BAD:  FROM_EMAIL=Name <email@x.com>
# GOOD: FROM_EMAIL="Name <email@x.com>"
```
