# Cloudflare API Access

Programmatic access to Cloudflare resources for automation and infrastructure management.

---

## Authentication

### Environment Variables

These are configured in GitHub Codespaces secrets:

| Variable | Description |
|----------|-------------|
| `CLOUDFLARE_ACCOUNT_ID` | Account identifier (`39f8fd4a...`) |
| `CLOUDFLARE_EMAIL` | Account email |
| `CLOUDFLARE_GLOBAL_API_KEY` | Global API key (full access) |
| `CLOUDFLARE_API_TOKEN` | Scoped API token (limited access) |

### Using Global API Key

```bash
curl -X GET "https://api.cloudflare.com/client/v4/accounts" \
  -H "X-Auth-Email: ${CLOUDFLARE_EMAIL}" \
  -H "X-Auth-Key: ${CLOUDFLARE_GLOBAL_API_KEY}" \
  -H "Content-Type: application/json"
```

### Using API Token

```bash
curl -X GET "https://api.cloudflare.com/client/v4/accounts" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json"
```

---

## R2 Object Storage

### Create Bucket

```bash
curl -X POST "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/r2/buckets" \
  -H "X-Auth-Email: ${CLOUDFLARE_EMAIL}" \
  -H "X-Auth-Key: ${CLOUDFLARE_GLOBAL_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"name": "my-bucket", "locationHint": "enam"}'
```

Location hints: `enam` (East North America), `wnam` (West North America), `weur` (Western Europe), `eeur` (Eastern Europe), `apac` (Asia Pacific)

### List Buckets

```bash
curl -X GET "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/r2/buckets" \
  -H "X-Auth-Email: ${CLOUDFLARE_EMAIL}" \
  -H "X-Auth-Key: ${CLOUDFLARE_GLOBAL_API_KEY}"
```

### Delete Bucket

```bash
curl -X DELETE "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/r2/buckets/my-bucket" \
  -H "X-Auth-Email: ${CLOUDFLARE_EMAIL}" \
  -H "X-Auth-Key: ${CLOUDFLARE_GLOBAL_API_KEY}"
```

---

## R2 S3-Compatible Credentials

R2 uses S3-compatible API for object operations. Credentials are derived from API tokens.

### Create API Token for R2

```bash
# Get available permission groups
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/permission_groups" \
  -H "X-Auth-Email: ${CLOUDFLARE_EMAIL}" \
  -H "X-Auth-Key: ${CLOUDFLARE_GLOBAL_API_KEY}" | jq '.result[] | select(.name | test("R2"))'

# Create token with R2 read/write permissions
curl -X POST "https://api.cloudflare.com/client/v4/user/tokens" \
  -H "X-Auth-Email: ${CLOUDFLARE_EMAIL}" \
  -H "X-Auth-Key: ${CLOUDFLARE_GLOBAL_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My R2 Token",
    "policies": [{
      "effect": "allow",
      "resources": {
        "com.cloudflare.api.account.'"${CLOUDFLARE_ACCOUNT_ID}"'": "*"
      },
      "permission_groups": [
        {"id": "6a018a9f2fc74eb6b293b0c548f38b39"},
        {"id": "2efd5506f9c8494dacb1fa10a3e7d5b6"}
      ]
    }]
  }'
```

### Convert Token to S3 Credentials

```bash
# From API response:
# - Access Key ID = token.id
# - Secret Access Key = SHA-256(token.value)

TOKEN_ID="abc123..."
TOKEN_VALUE="xyz789..."

ACCESS_KEY_ID="${TOKEN_ID}"
SECRET_ACCESS_KEY=$(echo -n "${TOKEN_VALUE}" | sha256sum | cut -d' ' -f1)

echo "AWS_ACCESS_KEY_ID=${ACCESS_KEY_ID}"
echo "AWS_SECRET_ACCESS_KEY=${SECRET_ACCESS_KEY}"
```

### S3 Endpoint

```
https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com
```

---

## R2 Permission Groups

| ID | Name |
|----|------|
| `6a018a9f2fc74eb6b293b0c548f38b39` | Workers R2 Storage Bucket Item Read |
| `2efd5506f9c8494dacb1fa10a3e7d5b6` | Workers R2 Storage Bucket Item Write |
| `b4992e1108244f5d8bfbd5744320c2e1` | Workers R2 Storage Read |
| `bf7481a1826f439697cb59a20b22293e` | Workers R2 Storage Write |

---

## Cloudflare Tunnels

### List Tunnels

```bash
curl -X GET "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/cfd_tunnel" \
  -H "X-Auth-Email: ${CLOUDFLARE_EMAIL}" \
  -H "X-Auth-Key: ${CLOUDFLARE_GLOBAL_API_KEY}"
```

### Get Tunnel Token

```bash
TUNNEL_ID="db4738a9-..."

curl -X GET "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/cfd_tunnel/${TUNNEL_ID}/token" \
  -H "X-Auth-Email: ${CLOUDFLARE_EMAIL}" \
  -H "X-Auth-Key: ${CLOUDFLARE_GLOBAL_API_KEY}"
```

---

## DNS Records

### List Records

```bash
ZONE_ID="..."  # Get from dashboard or zones API

curl -X GET "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}"
```

### Create Record

```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "CNAME",
    "name": "api",
    "content": "tunnel-id.cfargotunnel.com",
    "proxied": true
  }'
```

---

## WAF Rate Limiting Rules

Rate limiting rules protect API endpoints from abuse and prevent runaway loops from exhausting Workers quota.

### Current Rules

| Ruleset ID | Rule ID | Description |
|------------|---------|-------------|
| `d88b83536001478ba826e0fe4c36bb3a` | `e6e4f40f74bf47e092b8f7f95fa45421` | Shipping + Checkout API Rate Limit |

**Rule Details:**
- **Expression**: `(http.request.uri.path contains "/api/shipping") or (http.request.uri.path contains "/api/checkout")`
- **Limit**: 5 requests per 10 seconds per IP (30/min equivalent)
- **Action**: Block for 10 seconds
- **Characteristics**: `cf.colo.id`, `ip.src` (per-colo, per-IP)

### Free Plan Limitations

The Cloudflare Free plan has significant limitations for rate limiting:

| Feature | Free Plan | Pro Plan |
|---------|-----------|----------|
| Rules per phase | 1 | 5 |
| Period options | 10s only | 10s, 1m, 2m, 5m, 10m, 1h |
| Mitigation timeout | 10s only | 10s - 1h |
| Characteristics | Limited | Full set |

**Recommendation**: Consider upgrading to Pro ($20/month) if more granular rate limiting is needed.

### Create Rate Limiting Ruleset

```bash
ZONE_ID="aa28e2b93bb6af9db7a0e95d53820b92"

curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/rulesets" \
  -H "X-Auth-Email: ${CLOUDFLARE_EMAIL}" \
  -H "X-Auth-Key: ${CLOUDFLARE_GLOBAL_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "OpticWorks API Rate Limiting",
    "description": "Rate limiting for API endpoints",
    "kind": "zone",
    "phase": "http_ratelimit",
    "rules": [{
      "action": "block",
      "expression": "(http.request.uri.path contains \"/api/shipping\") or (http.request.uri.path contains \"/api/checkout\")",
      "description": "API Rate Limit - 5 req/10s per IP",
      "ratelimit": {
        "characteristics": ["cf.colo.id", "ip.src"],
        "period": 10,
        "requests_per_period": 5,
        "mitigation_timeout": 10
      }
    }]
  }'
```

### List Rate Limiting Rules

```bash
curl -X GET "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/rulesets?kind=zone" \
  -H "X-Auth-Email: ${CLOUDFLARE_EMAIL}" \
  -H "X-Auth-Key: ${CLOUDFLARE_GLOBAL_API_KEY}"
```

### Delete Rate Limiting Ruleset

```bash
RULESET_ID="d88b83536001478ba826e0fe4c36bb3a"

curl -X DELETE "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/rulesets/${RULESET_ID}" \
  -H "X-Auth-Email: ${CLOUDFLARE_EMAIL}" \
  -H "X-Auth-Key: ${CLOUDFLARE_GLOBAL_API_KEY}"
```

---

## Cloudflare Turnstile (CAPTCHA)

Turnstile provides invisible CAPTCHA protection for the contact form to prevent spam submissions.

### How It Works

1. **Client-side**: The `@marsidev/react-turnstile` widget renders on the contact form
2. **User interaction**: Turnstile generates a token (usually invisible to the user)
3. **Form submission**: Token is sent with the form data to `/api/email/send`
4. **Server validation**: The API route validates the token with Cloudflare's siteverify endpoint
5. **Response**: If validation fails, the submission is rejected with a 400 error

### Environment Variables

| Variable | Location | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | `wrangler.jsonc` vars | Public site key for the widget (safe to commit) |
| `TURNSTILE_SECRET_KEY` | Worker secret (Dashboard) | Server-side validation (never commit) |

### Getting Keys

1. Go to **Cloudflare Dashboard** > **Turnstile** > **Add Widget**
2. Select **Managed** challenge type (recommended)
3. Add your domains: `optic.works`, `www.optic.works`, `localhost`
4. Copy the **Site Key** (public) and **Secret Key** (private)

### Testing Keys

Cloudflare provides dummy keys for development and testing:

| Key Type | Value | Behavior |
|----------|-------|----------|
| Site key (always pass) | `1x00000000000000000000AA` | Widget always succeeds |
| Site key (always block) | `2x00000000000000000000AB` | Widget always fails |
| Site key (force challenge) | `3x00000000000000000000FF` | Forces interactive challenge |
| Secret key (always pass) | `1x0000000000000000000000000000000AA` | Validation always succeeds |
| Secret key (always fail) | `2x0000000000000000000000000000000AB` | Validation always fails |

### Implementation Details

**Frontend** (`src/components/support/ContactForm.tsx`):
- Uses `@marsidev/react-turnstile` library
- Tries `process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY` first (build-time)
- Falls back to `/api/turnstile/site-key` endpoint (runtime) if env var unavailable
- Widget uses dark theme to match site design

**Site Key API** (`src/app/api/turnstile/site-key/route.ts`):
- Returns site key for runtime configuration
- Checks both `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SITE_KEY`

**Server Validation** (`src/app/api/email/send/route.ts`):
- Validates Turnstile token for `support-request` template only
- Calls `https://challenges.cloudflare.com/turnstile/v0/siteverify`
- In non-production, skips validation if `TURNSTILE_SECRET_KEY` is not set
- In production, rejects all requests if secret key is missing

### Deployment Checklist

1. Add `TURNSTILE_SECRET_KEY` to Cloudflare Worker secrets (Dashboard > Workers > Settings > Variables)
2. Verify `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is in `wrangler.jsonc` vars
3. Add both keys to Infisical for local development (`pnpm run secrets:pull`)
4. Test the contact form submission works in production

### Troubleshooting

**Widget shows "CAPTCHA unavailable"**
- Check browser console for errors
- Verify `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set (check `/api/turnstile/site-key` response)

**"CAPTCHA verification failed" on submit**
- Verify `TURNSTILE_SECRET_KEY` is set as a Worker secret
- Check if token expired (tokens are valid for ~5 minutes)
- In production, ensure the secret key matches the site key's widget

**Widget not appearing in development**
- Run `pnpm run secrets:pull` to sync keys from Infisical
- Or use testing keys in `.env.local`

---

## Workers Secrets Management

### Important: Git Integration vs CLI Secrets

When using Cloudflare's **Git integration** (auto-deploy on push to main), secrets must be configured in the **Cloudflare Dashboard**, NOT via `wrangler secret put`.

| Deployment Method | Where to Set Secrets |
|-------------------|---------------------|
| `wrangler deploy` (CLI) | `wrangler secret put SECRET_NAME` |
| Git Integration (auto-deploy) | Dashboard → Workers → Settings → Variables |

**The Problem**: `wrangler secret list` will show secrets set via CLI, but Git-deployed workers won't have access to them. They use a separate secrets store.

### Setting Secrets for Git-Deployed Workers

1. Go to **Cloudflare Dashboard** → **Workers & Pages**
2. Select **opticworks-store**
3. Go to **Settings** → **Variables**
4. Under **Environment Variables**, add secrets with "Encrypt" enabled
5. Select **Production** environment

### Current Required Secrets

| Secret | Purpose |
|--------|---------|
| `HOOKDECK_WEBHOOK_SECRET` | Verify webhook signatures from Hookdeck |
| `STRIPE_SECRET_KEY` | Stripe API authentication |
| `EASYPOST_API_KEY` | EasyPost shipping API |
| `SHIP_FROM_ZIP` | Origin ZIP for shipping calculations |
| `TURNSTILE_SECRET_KEY` | Server-side Turnstile CAPTCHA validation |

### Verifying Secrets Are Loaded

Check Worker logs for secret availability:
```bash
npx wrangler tail --env production --format pretty
```

If a secret is missing, you'll see errors like:
```
(error) ❌ HOOKDECK_WEBHOOK_SECRET not configured
```

---

## KV Namespaces

### Current Namespaces

| Binding | Namespace ID | Purpose |
|---------|--------------|---------|
| `SHIPPING_RATES_CACHE` | `e11813a7581f480ea39633e492a53222` | Cache shipping rates (10min TTL) |

### Create KV Namespace

```bash
curl -X POST "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces" \
  -H "X-Auth-Email: ${CLOUDFLARE_EMAIL}" \
  -H "X-Auth-Key: ${CLOUDFLARE_GLOBAL_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"title": "my-namespace"}'
```

### List KV Namespaces

```bash
curl -X GET "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces" \
  -H "X-Auth-Email: ${CLOUDFLARE_EMAIL}" \
  -H "X-Auth-Key: ${CLOUDFLARE_GLOBAL_API_KEY}"
```

---

## Current Resources

| Resource | Name/ID |
|----------|---------|
| **Account ID** | `39f8fd4a5b0c7558aed585facd57ec3b` |
| **Zone ID (optic.works)** | `aa28e2b93bb6af9db7a0e95d53820b92` |
| **Public Bucket** | `opticworks-public` |
| **Backup Bucket** | `opticworks-backups` |
| **Cache Bucket** | `opticworks-cache` |
| **API Tunnel** | `db4738a9-20b7-4dd7-bde2-0760e0188071` |
| **R2 Endpoint** | `https://39f8fd4a5b0c7558aed585facd57ec3b.r2.cloudflarestorage.com` |
| **Shipping Cache KV** | `e11813a7581f480ea39633e492a53222` |
| **Rate Limit Ruleset** | `d88b83536001478ba826e0fe4c36bb3a` |

---

## References

- [Cloudflare API Docs](https://developers.cloudflare.com/api/)
- [R2 Authentication](https://developers.cloudflare.com/r2/api/tokens/)
- [R2 S3 Compatibility](https://developers.cloudflare.com/r2/api/s3/api/)
- [Tunnel API](https://developers.cloudflare.com/api/operations/cloudflare-tunnel-list-cloudflare-tunnels)
