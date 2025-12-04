# Key Management

Complete secrets inventory for the OpticWorks platform. All secrets stored in Infisical.

---

## Quick Start

```bash
# Storefront secrets
pnpm run secrets:pull

# Backend secrets (Ansible)
cd infrastructure/ansible
export INFISICAL_SERVICE_TOKEN=st.xxx
bash scripts/generate-secrets-from-infisical.sh
```

---

## Infisical Structure

```
Project: OpticWorks
├── dev/    # Local development
├── staging/
└── prod/   # Production
```

All secrets at root path `/` (no subpaths).

---

## Storefront Variables

### Medusa Integration

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_MEDUSA_ENABLED` | Yes | Toggle Medusa |
| `NEXT_PUBLIC_MEDUSA_BASE_URL` | Yes | https://api.optic.works |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | Yes | Store API access |
| `MEDUSA_SSR_BASE_URL` | Yes | https://medusa.optic.works |

### Stripe

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Client-side |
| `STRIPE_SECRET_KEY` | Yes | Server-side |
| `STRIPE_WEBHOOK_SECRET` | Yes | Webhook verification |

### Email

| Variable | Required | Notes |
|----------|----------|-------|
| `RESEND_API_KEY` | Yes | Email delivery |
| `RESEND_FROM_EMAIL` | Yes | Sender address |

### Cloudflare

| Variable | Required | Notes |
|----------|----------|-------|
| `CLOUDFLARE_API_TOKEN` | Optional | Workers deployment |
| `R2_ACCESS_KEY_ID` | Yes | File storage |
| `R2_SECRET_ACCESS_KEY` | Yes | File storage |
| `R2_BUCKET_NAME` | Yes | opticworks-public |

---

## Backend Variables

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | PostgreSQL (URL-encoded password) |
| `REDIS_URL` | Yes | Redis connection |
| `JWT_SECRET` | Yes | 64 chars |
| `COOKIE_SECRET` | Yes | 64 chars |
| `MEDUSA_ADMIN_EMAIL` | Yes | Admin login |
| `MEDUSA_ADMIN_PASSWORD` | Yes | Admin login |
| `STRIPE_API_KEY` | Yes | Stripe backend |
| `STORE_CORS` | Yes | Allowed origins |

---

## Infrastructure Variables

| Variable | Required | Notes |
|----------|----------|-------|
| `POSTGRES_PASSWORD` | Yes | Generated |
| `CLOUDFLARE_TUNNEL_ID` | Yes | Tunnel UUID |
| `CLOUDFLARE_TUNNEL_CREDENTIALS` | Yes | Tunnel auth JSON |

---

## Rotation Schedule

| Type | Frequency |
|------|-----------|
| Database passwords | Monthly |
| JWT/Cookie secrets | Monthly |
| API keys (Stripe, etc.) | Yearly |
| Medusa admin password | Monthly |

---

## Adding New Secrets

1. Add to Infisical via web UI
2. Update this document
3. For storefront: `pnpm run secrets:pull`
4. For backend: Run Ansible deploy
