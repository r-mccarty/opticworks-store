# OpticWorks Key Management Audit

**Date**: 2025-11-19
**Auditor**: Claude
**Purpose**: Categorize secrets by generation method and identify minimum viable set for Phase 2

---

## Executive Summary

This audit categorizes all ~50 environment variables by their generation method and identifies the **minimum viable set** required for Phase 2 (Next.js ↔ Medusa integration). Currently, many optional services are documented but not strictly required for core functionality.

**Key Findings**:
- **4 secrets** generated via `pnpm run generate:secrets`
- **1 secret** generated via `pnpm run setup:keys` (Medusa script)
- **15+ secrets** from third-party dashboards (Stripe, Resend, Cloudflare, etc.)
- **20+ configuration values** (URLs, emails, toggles - not cryptographic secrets)
- **Minimum viable for Phase 2**: 15 secrets (down from 50+ total variables)

---

## Secret Categories by Generation Method

### 1. PNPM Generated Secrets (`pnpm run generate:secrets`)

**Script**: `services/medusa/scripts/generate-secrets.ts`

**Generated Secrets**:
| Secret | Length | Format | Purpose | Infisical Path | Critical |
|--------|--------|--------|---------|----------------|----------|
| `POSTGRES_PASSWORD` | 32 chars | base64url | PostgreSQL authentication | `/infrastructure` | ✅ |
| `REDIS_PASSWORD` | 32 chars | base64url | Redis authentication | `/infrastructure` | ⚠️ |
| `JWT_SECRET` | 64 chars | hex (32 bytes) | Session token signing | `/medusa` | ✅ |
| `COOKIE_SECRET` | 64 chars | hex (32 bytes) | Cookie signing | `/medusa` | ✅ |

**Workflow**:
```bash
cd services/medusa
pnpm run generate:secrets

# Output (example):
# POSTGRES_PASSWORD=abc123xyz...
# REDIS_PASSWORD=def456uvw...
# JWT_SECRET=0a1b2c3d...  (64 hex chars)
# COOKIE_SECRET=9f8e7d6c...  (64 hex chars)
#
# DATABASE_URL=postgres://medusa:abc123xyz...@localhost:5432/medusa
# REDIS_URL=redis://:def456uvw...@localhost:6379

# ✅ CRITICAL: Immediately copy to Infisical web UI
# ❌ NEVER use these values directly in deployment
```

**Notes**:
- Run once during initial infrastructure setup
- Store in Infisical immediately (NEVER commit to Git)
- Ansible pulls from Infisical before deployment
- Regenerate monthly for critical secrets (JWT, COOKIE, POSTGRES)

---

### 2. Medusa Admin API Generated (`pnpm run setup:keys`)

**Script**: `services/medusa/scripts/setup-publishable-key.ts`

**Generated Secrets**:
| Secret | Format | Purpose | Infisical Path | Critical |
|--------|--------|---------|----------------|----------|
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | `pk_*` | Store API access (public key) | `/` (storefront) | ✅ |

**Workflow**:
```bash
# Prerequisites: Medusa backend must be running
cd services/medusa
pnpm run setup:keys

# Or with custom title:
pnpm run setup:keys --title "Production Store"

# Output:
# ✅ Publishable API Key Setup Complete!
# Key ID: pk_01J1234567890ABCDEF
# Title: Storefront
# Sales Channel: Default Sales Channel
#
# Add to .env:
# NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_01J1234567890ABCDEF
```

**Technical Details**:
- Requires `MEDUSA_SECRET_KEY` OR `MEDUSA_ADMIN_EMAIL` + `MEDUSA_ADMIN_PASSWORD` for authentication
- Creates a new publishable API key via Admin API
- Associates key with default sales channel
- Safe to expose in client-side code (hence `NEXT_PUBLIC_*`)
- Rotate quarterly

**Notes**:
- Run after Medusa backend is provisioned and admin user created
- Store in Infisical under storefront environment (`development` or `production`)
- Required for all Store API calls from Next.js frontend

---

### 3. Third-Party Dashboard Generated

#### Stripe (Payment Processing)

**Dashboard**: https://dashboard.stripe.com/apikeys

| Secret | Format | Environment | Purpose | Infisical Path | Critical |
|--------|--------|-------------|---------|----------------|----------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_*` or `pk_live_*` | Public | Frontend checkout | `/` | ✅ |
| `STRIPE_SECRET_KEY` | `sk_test_*` or `sk_live_*` | Secret | Storefront API calls | `/` | ✅ |
| `STRIPE_API_KEY` | `sk_test_*` or `sk_live_*` | Secret | Medusa backend integration | `/medusa` | ✅ |
| `STRIPE_WEBHOOK_SECRET` | `whsec_*` | Secret | Production webhook verification | `/` | ✅ |
| `STRIPE_WEBHOOK_SECRET_DEV` | `whsec_*` | Secret | Development webhook (Stripe CLI) | `/` | ⚠️ |
| `STRIPE_SHIPPING_WEBHOOK_SECRET` | `whsec_*` | Secret | Production shipping webhook | `/` | ⚠️ |
| `STRIPE_SHIPPING_WEBHOOK_SECRET_DEV` | `whsec_*` | Secret | Development shipping webhook | `/` | ⚠️ |

**Workflow**:
1. Log in to Stripe dashboard
2. Navigate to Developers → API Keys
3. Copy publishable key (starts with `pk_test_` or `pk_live_`)
4. Copy secret key (starts with `sk_test_` or `sk_live_`)
5. For webhooks: Developers → Webhooks → Add endpoint → Reveal signing secret
6. Store ALL keys in Infisical immediately

**Notes**:
- Use **test mode** keys for development/staging
- Use **live mode** keys for production only
- `STRIPE_SECRET_KEY` (storefront) and `STRIPE_API_KEY` (backend) are typically the same key
- Rotate yearly

---

#### Resend (Transactional Email)

**Dashboard**: https://resend.com/api-keys

| Secret | Format | Purpose | Infisical Path | Critical |
|--------|--------|---------|----------------|----------|
| `RESEND_API_KEY` | `re_*` | Email delivery | `/` | ⚠️ |

**Workflow**:
1. Log in to Resend dashboard
2. Navigate to API Keys
3. Create new API key (full access or restricted)
4. Copy key (starts with `re_`)
5. Store in Infisical immediately

**Notes**:
- Rotate yearly
- Optional for Phase 2 (unless testing order confirmation emails)

---

#### Cloudflare (CDN, R2 Storage, Tunnel)

**Dashboard**: https://dash.cloudflare.com/

| Secret | Format | Purpose | Infisical Path | Critical |
|--------|--------|---------|----------------|----------|
| `R2_ACCESS_KEY_ID` | 32 chars | R2 storage access | `/` | ⚠️ |
| `R2_SECRET_ACCESS_KEY` | 43 chars | R2 storage secret | `/` | ⚠️ |
| `CLOUDFLARE_IMAGES_TOKEN` | API token | Images API access | `/` | ⚠️ |
| `CLOUDFLARE_GLOBAL_API_KEY` | hex string | Global API access | `/` | ⚠️ |
| `CLOUDFLARE_TUNNEL_ID` | UUID | Tunnel identifier | `/infrastructure` | ✅ |
| `CLOUDFLARE_TUNNEL_CREDENTIALS` | JSON | Tunnel authentication | `/infrastructure` | ✅ |

**Workflow**:

**For R2 Storage**:
1. Navigate to R2 → Manage R2 API Tokens
2. Create API token with R2 read/write permissions
3. Copy Access Key ID and Secret Access Key
4. Store in Infisical

**For Tunnel** (already configured):
1. Navigate to Zero Trust → Networks → Tunnels
2. Copy Tunnel ID
3. Download credentials file (JSON)
4. Store both in Infisical

**Notes**:
- R2 is optional for Phase 2 (file uploads not critical initially)
- Cloudflare Tunnel is already configured and live
- Rotate R2 keys quarterly

---

#### EasyPost (Shipping Rates)

**Dashboard**: https://www.easypost.com/account/api-keys

| Secret | Format | Purpose | Infisical Path | Critical |
|--------|--------|---------|----------------|----------|
| `EASYPOST_API_KEY` | `EZ*` | Shipping rate calculation | `/` | ⚠️ |

**Workflow**:
1. Log in to EasyPost
2. Navigate to API Keys
3. Copy test or production key
4. Store in Infisical

**Notes**:
- Optional for Phase 2 (shipping can use flat rates initially)
- Rotate yearly

---

#### Google Analytics / Cloud

**Dashboard**: https://console.cloud.google.com/

| Secret | Format | Purpose | Infisical Path | Critical |
|--------|--------|---------|----------------|----------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-*` | Google Analytics tracking | `/` | ⚠️ |
| `GA4_PROPERTY_ID` | Numeric | GA4 property ID | `/` | ⚠️ |
| `GOOGLE_CLOUD_PROJECT` | String | GCP project ID | `/` | ⚠️ |
| `GOOGLE_APPLICATION_CREDENTIALS` | JSON | Service account credentials | `/` | ⚠️ |

**Notes**:
- Optional for Phase 2 (analytics not critical for integration testing)

---

#### Hetzner Cloud

**Dashboard**: https://console.hetzner.cloud/

| Secret | Format | Purpose | Infisical Path | Critical |
|--------|--------|---------|----------------|----------|
| `HETZNER_API_TOKEN` | Long string | Server management API | `/infrastructure` | ⚠️ |

**Workflow**:
1. Log in to Hetzner Cloud Console
2. Navigate to Security → API Tokens
3. Generate new token with read/write access
4. Store in Infisical immediately

**Notes**:
- Used by Ansible for server provisioning
- Rotate yearly

---

### 4. Medusa Admin Dashboard Generated

**Dashboard**: https://api.optic.works/app → Settings → API Keys (future feature)

| Secret | Format | Purpose | Infisical Path | Critical |
|--------|--------|---------|----------------|----------|
| `MEDUSA_SECRET_KEY` | API Key | Admin automation (server-side) | `/` (storefront), `/medusa` | ⚠️ |

**Notes**:
- As of Medusa v2.11.3, API key management is limited
- Scripts fallback to `MEDUSA_ADMIN_EMAIL` + `MEDUSA_ADMIN_PASSWORD` if not available
- Future versions may expose UI for secret key generation
- For now, use admin credentials for automation

---

### 5. Manual Configuration (Not Cryptographic Secrets)

These are configuration values, not secrets requiring cryptographic generation:

**Application URLs**:
- `NODE_ENV` → `development` | `staging` | `production`
- `NEXT_PUBLIC_APP_URL` → `http://localhost:3000` | `https://optic.works`
- `NEXT_PUBLIC_MEDUSA_BASE_URL` → `http://localhost:9000` | `https://api.optic.works`
- `MEDUSA_BASE_URL` → (same as above for server-side)
- `MEDUSA_BACKEND_URL` → (same as above)

**Feature Toggles**:
- `NEXT_PUBLIC_MEDUSA_ENABLED` → `true` | `false`
- `MEDUSA_ENABLED` → `true` | `false`

**Admin Credentials** (set manually):
- `MEDUSA_ADMIN_EMAIL` → `admin@optic.works`
- `MEDUSA_ADMIN_PASSWORD` → Choose strong password (20+ chars)

**CORS Configuration**:
- `MEDUSA_STORE_CORS` → `http://localhost:3000,https://optic.works`
- `MEDUSA_ADMIN_CORS` → `http://localhost:7000,http://localhost:8000`

**Email Configuration**:
- `NEXT_PUBLIC_FROM_EMAIL` → `hello@optic.works`

**Cloudflare Configuration**:
- `R2_BUCKET_NAME` → `opticworks-assets`
- `R2_ENDPOINT_URL` → `https://<account-id>.r2.cloudflarestorage.com`
- `R2_PUBLIC_URL` → `https://assets.optic.works`
- `CLOUDFLARE_ACCOUNT_ID` → (from dashboard)
- `CLOUDFLARE_EMAIL` → (account email)
- `CLOUDFLARE_API_BASE_URL` → `https://api.cloudflare.com/client/v4`

**Database Configuration** (for direct access from storefront):
- `HETZNER_POSTGRES_HOST` → `hetzner-node` (SSH tunnel) or `<IP>` (direct)
- `HETZNER_POSTGRES_PORT` → `5432`
- `HETZNER_POSTGRES_DB` → `medusa`
- `HETZNER_POSTGRES_USER` → `medusa`
- `HETZNER_REDIS_URL` → `redis://hetzner-node:6379`

---

## Minimum Viable Secrets for Phase 2

**Goal**: Enable Next.js storefront to fetch products from Medusa backend and process test checkout.

### Critical Path Secrets (15 total)

#### 1. Backend Infrastructure (5 secrets)

| Secret | Generation Method | Infisical Path |
|--------|-------------------|----------------|
| `POSTGRES_PASSWORD` | `pnpm run generate:secrets` | `/infrastructure` |
| `JWT_SECRET` | `pnpm run generate:secrets` | `/medusa` |
| `COOKIE_SECRET` | `pnpm run generate:secrets` | `/medusa` |
| `MEDUSA_ADMIN_EMAIL` | Manual (choose) | `/medusa` |
| `MEDUSA_ADMIN_PASSWORD` | Manual (choose strong password) | `/medusa` |

**Notes**:
- `REDIS_PASSWORD` is optional (Redis can run without auth in dev)
- `DATABASE_URL` is constructed from `POSTGRES_PASSWORD`

---

#### 2. Medusa API Access (1 secret)

| Secret | Generation Method | Infisical Path |
|--------|-------------------|----------------|
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | `pnpm run setup:keys` | `/` (storefront) |

**Prerequisites**:
- Medusa backend running
- Admin user created
- Run: `cd services/medusa && pnpm run setup:keys`

---

#### 3. Stripe Payment Processing (4 secrets)

| Secret | Generation Method | Infisical Path |
|--------|-------------------|----------------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe dashboard (test mode) | `/` (storefront) |
| `STRIPE_SECRET_KEY` | Stripe dashboard (test mode) | `/` (storefront) |
| `STRIPE_API_KEY` | Stripe dashboard (test mode) | `/medusa` |
| `STRIPE_WEBHOOK_SECRET_DEV` | Stripe CLI (`stripe listen`) | `/` (storefront) |

**Notes**:
- Use **test mode** keys (`pk_test_*`, `sk_test_*`)
- `STRIPE_SECRET_KEY` and `STRIPE_API_KEY` can be the same key
- Webhook secret generated by running: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

---

#### 4. Configuration Values (5 required)

| Variable | Value | Infisical Path |
|----------|-------|----------------|
| `NEXT_PUBLIC_MEDUSA_ENABLED` | `true` | `/` |
| `NEXT_PUBLIC_MEDUSA_BASE_URL` | `https://api.optic.works` (prod) or `http://localhost:9000` (dev) | `/` |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` (dev) or `https://optic.works` (prod) | `/` |
| `MEDUSA_STORE_CORS` | `http://localhost:3000,https://optic.works` | `/medusa` |
| `MEDUSA_ADMIN_CORS` | `http://localhost:7000,http://localhost:8000` | `/medusa` |

---

### Optional for Phase 2 (Can Add Later)

**Email Notifications**:
- `RESEND_API_KEY`
- `NEXT_PUBLIC_FROM_EMAIL`

**Asset Management**:
- `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, etc. (5 variables)
- `CLOUDFLARE_IMAGES_TOKEN`, `CLOUDFLARE_GLOBAL_API_KEY`, etc. (5 variables)

**Shipping**:
- `EASYPOST_API_KEY`

**Analytics**:
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `GA4_PROPERTY_ID`, etc. (4 variables)

**AI/MCP**:
- `CONTEXT7_API_KEY`, `GEMINI_API_KEY`

---

## Phase 2 Setup Checklist

### Step 1: Generate Backend Secrets

```bash
cd services/medusa
pnpm run generate:secrets

# Copy output to Infisical:
# - POSTGRES_PASSWORD → /infrastructure environment
# - JWT_SECRET → /medusa environment
# - COOKIE_SECRET → /medusa environment
```

---

### Step 2: Set Admin Credentials

In Infisical (environment: `production`, path: `/medusa`):
- `MEDUSA_ADMIN_EMAIL=admin@optic.works`
- `MEDUSA_ADMIN_PASSWORD=<strong-password-20-chars>`

---

### Step 3: Deploy Backend Infrastructure

```bash
cd infrastructure/ansible

# Sync secrets from Infisical
export INFISICAL_SERVICE_TOKEN=st.xxxxx
bash scripts/generate-secrets-from-infisical.sh

# Provision infrastructure
ansible-playbook playbooks/medusa-provision.yml

# Verify backend is live
curl https://api.optic.works/health
```

---

### Step 4: Generate Medusa Publishable Key

```bash
# From GitHub Codespaces or local with .env configured
cd services/medusa

# Set temporary env vars for script
export MEDUSA_ADMIN_EMAIL=admin@optic.works
export MEDUSA_ADMIN_PASSWORD=<your-password>
export MEDUSA_ADMIN_URL=https://api.optic.works

# Generate key
pnpm run setup:keys

# Copy output to Infisical:
# NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxxxx
# → Environment: development, Path: /
```

---

### Step 5: Configure Stripe (Test Mode)

1. Log in to https://dashboard.stripe.com/test/apikeys
2. Copy **Publishable key** → Infisical: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Copy **Secret key** → Infisical:
   - `STRIPE_SECRET_KEY` (storefront, path: `/`)
   - `STRIPE_API_KEY` (backend, path: `/medusa`)
4. Set up webhook (optional for local testing):
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   # Copy webhook signing secret → STRIPE_WEBHOOK_SECRET_DEV
   ```

---

### Step 6: Configure Storefront

In Infisical (environment: `development`, path: `/`):

```env
NEXT_PUBLIC_MEDUSA_ENABLED=true
NEXT_PUBLIC_MEDUSA_BASE_URL=https://api.optic.works
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

In Infisical (environment: `production`, path: `/medusa`):

```env
MEDUSA_STORE_CORS=http://localhost:3000,https://optic.works
MEDUSA_ADMIN_CORS=http://localhost:7000,http://localhost:8000
```

---

### Step 7: Sync Secrets Locally

```bash
# Pull all storefront secrets from Infisical
export INFISICAL_SERVICE_TOKEN=st.xxxxx
pnpm run secrets:pull

# Verify .env.local has required keys
cat .env.local | grep NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
cat .env.local | grep NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

---

### Step 8: Test Integration

```bash
# Start Next.js dev server
pnpm run dev

# In browser:
# 1. Visit http://localhost:3000
# 2. Navigate to /products
# 3. Verify products load from Medusa API
# 4. Add product to cart
# 5. Proceed to checkout (Stripe test mode)
# 6. Use test card: 4242 4242 4242 4242
```

---

## Summary Table: Secret Generation Methods

| Method | Count | Secrets | When to Generate |
|--------|-------|---------|------------------|
| `pnpm run generate:secrets` | 4 | POSTGRES_PASSWORD, REDIS_PASSWORD, JWT_SECRET, COOKIE_SECRET | Once during infrastructure setup |
| `pnpm run setup:keys` | 1 | NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY | After backend is live |
| Stripe Dashboard | 4-7 | Publishable, Secret, API keys, Webhook secrets | Before payment testing |
| Resend Dashboard | 1 | RESEND_API_KEY | When email is needed |
| Cloudflare Dashboard | 6-10 | R2, Images, Tunnel credentials | As features are enabled |
| Manual Config | 20+ | URLs, emails, toggles, CORS settings | During setup |
| **Phase 2 Minimum** | **15** | See "Critical Path Secrets" above | **Start here** |

---

## Issues Found in KEY_MANAGEMENT.md

### 1. Incorrect Variable Name

**Issue**: Documentation lists `NEXT_PUBLIC_MEDUSA_API_TOKEN` in `.env.template` but references `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` in `setup-publishable-key.ts` script.

**Resolution**: Confirm correct variable name. Based on script output, should be:
- ✅ `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` (script output)
- ❌ `NEXT_PUBLIC_MEDUSA_API_TOKEN` (not used anywhere)

**Action**: Update `.env.template` to remove `NEXT_PUBLIC_MEDUSA_API_TOKEN`.

---

### 2. Missing `MEDUSA_SECRET_KEY` Details

**Issue**: Listed in KEY_MANAGEMENT.md but no clear generation method documented.

**Resolution**: Medusa v2.11.3 scripts use `MEDUSA_SECRET_KEY` for admin automation (see RFD-005) but fall back to email/password if not set.

**Action**: Document that this is optional and admin email/password is the primary method.

---

### 3. REDIS_PASSWORD Not Used

**Issue**: `generate:secrets` script outputs `REDIS_PASSWORD` but `medusa-config.ts` uses `REDIS_URL` without password:
```typescript
redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379"
```

**Resolution**: Confirm if Redis requires authentication. If not needed for dev, mark as optional.

---

### 4. Shipping Webhook Secrets Documented But Not Used

**Issue**: KEY_MANAGEMENT.md lists `STRIPE_SHIPPING_WEBHOOK_SECRET` and `STRIPE_SHIPPING_WEBHOOK_SECRET_DEV` but no shipping webhook endpoint exists in codebase.

**Action**: Mark as "future" or remove until shipping webhooks are implemented.

---

## Recommendations

1. **Update `.env.template`**: Remove `NEXT_PUBLIC_MEDUSA_API_TOKEN`, add `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`.

2. **Clarify REDIS_PASSWORD**: Confirm if Redis authentication is required. If not, remove from required secrets.

3. **Create Quick Start Guide**: Separate "Phase 2 Minimum" into standalone guide in `docs/PHASE_2_SECRETS_SETUP.md`.

4. **Automate Secret Generation**: Consider script that:
   - Generates secrets via `pnpm run generate:secrets`
   - Prompts for admin email/password
   - Pushes directly to Infisical via CLI (requires `INFISICAL_TOKEN`)
   - Outputs checklist for manual steps (Stripe, Medusa publishable key)

5. **Add Secret Validation Script**: Create `pnpm run secrets:validate` that checks:
   - All required Phase 2 secrets exist in Infisical
   - Secrets match expected format (e.g., `pk_test_*` for Stripe test keys)
   - URLs are reachable (e.g., `NEXT_PUBLIC_MEDUSA_BASE_URL` returns 200)

---

## Next Steps

1. Review this audit with team
2. Correct issues in KEY_MANAGEMENT.md
3. Update `.env.template` with accurate variable names
4. Create Phase 2 quick start guide
5. Test minimum viable secret set with clean environment

---

**Audit Complete**: 2025-11-19
**Total Secrets Documented**: ~50 variables
**Minimum for Phase 2**: 15 secrets + 5 config values
**Optional for Later**: 30+ variables (analytics, shipping, AI, etc.)
