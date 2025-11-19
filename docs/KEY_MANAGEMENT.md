# OpticWorks Key Management Strategy

**Version**: 1.0
**Last Updated**: 2025-11-18
**Maintainer**: Platform Engineering

---

## Overview

This document defines the strategy for managing API keys, credentials, and secrets across the OpticWorks platform. All secrets are centralized in **Infisical** to ensure security, team access, and proper rotation.

**Key Principles:**
1. **Single Source of Truth**: Infisical is the only source for all production and development secrets
2. **Never Commit Secrets**: `.env.local` and `services/medusa/.env` are gitignored
3. **Auto-Sync**: GitHub Codespaces automatically pulls secrets on startup
4. **Audit Trail**: All secret access and changes logged in Infisical

---

## Secret Categories

### 1. Storefront Secrets (Next.js)

**Infisical Location:**
- Project: `OpticWorks`
- Environment: `development` | `staging` | `production`
- Path: `/`

**Variables:**

#### Core Application
| Variable | Type | Rotation | Critical | Notes |
|----------|------|----------|----------|-------|
| `NODE_ENV` | String | Never | ⚠️ | Environment (development/production) |
| `NEXT_PUBLIC_APP_URL` | URL | Never | ⚠️ | Canonical site URL |

#### Medusa Backend Integration
| Variable | Type | Rotation | Critical | Notes |
|----------|------|----------|----------|-------|
| `NEXT_PUBLIC_MEDUSA_ENABLED` | Boolean | Never | ⚠️ | Toggle Medusa integration |
| `NEXT_PUBLIC_MEDUSA_BASE_URL` | URL | Never | ✅ | Backend API endpoint |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | API Key | Quarterly | ✅ | Store API access (public) |
| `MEDUSA_ENABLED` | Boolean | Never | ⚠️ | Server-side Medusa toggle |
| `MEDUSA_BASE_URL` | URL | Never | ⚠️ | Server-side backend URL |
| `MEDUSA_API_TOKEN` | API Key | Quarterly | ⚠️ | Server-side API access |
| `MEDUSA_SECRET_KEY` | API Key | Quarterly | ✅ | Admin automation (secret key) |
| `MEDUSA_ADMIN_EMAIL` | Email | Never | ⚠️ | Admin login (for scripts) |
| `MEDUSA_ADMIN_PASSWORD` | Password | Monthly | ✅ | Admin login (for scripts) |

#### Stripe Payment Processing
| Variable | Type | Rotation | Critical | Notes |
|----------|------|----------|----------|-------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | API Key | Yearly | ✅ | Stripe checkout (public) |
| `STRIPE_SECRET_KEY` | API Key | Yearly | ✅ | Stripe backend (private) |
| `STRIPE_WEBHOOK_SECRET` | Secret | Yearly | ✅ | Production webhook verification |
| `STRIPE_WEBHOOK_SECRET_DEV` | Secret | Yearly | ⚠️ | Development webhook (Stripe CLI) |
| `STRIPE_SHIPPING_WEBHOOK_SECRET` | Secret | Yearly | ✅ | Production shipping webhook |
| `STRIPE_SHIPPING_WEBHOOK_SECRET_DEV` | Secret | Yearly | ⚠️ | Development shipping webhook |

#### Email & Communications
| Variable | Type | Rotation | Critical | Notes |
|----------|------|----------|----------|-------|
| `RESEND_API_KEY` | API Key | Yearly | ⚠️ | Email delivery |
| `NEXT_PUBLIC_FROM_EMAIL` | Email | Never | ⚠️ | Sender email address |

#### Cloudflare Services
| Variable | Type | Rotation | Critical | Notes |
|----------|------|----------|----------|-------|
| `R2_ACCESS_KEY_ID` | Access Key | Quarterly | ⚠️ | R2 storage access |
| `R2_SECRET_ACCESS_KEY` | Secret Key | Quarterly | ✅ | R2 storage secret |
| `R2_BUCKET_NAME` | String | Never | ⚠️ | R2 bucket name |
| `R2_ENDPOINT_URL` | URL | Never | ⚠️ | R2 API endpoint |
| `R2_PUBLIC_URL` | URL | Never | ⚠️ | R2 public CDN URL |
| `CLOUDFLARE_IMAGES_TOKEN` | API Token | Quarterly | ⚠️ | Images API access |
| `CLOUDFLARE_ACCOUNT_ID` | ID | Never | ⚠️ | Account identifier |
| `CLOUDFLARE_EMAIL` | Email | Never | ⚠️ | Account email |
| `CLOUDFLARE_GLOBAL_API_KEY` | API Key | Quarterly | ✅ | Global API access |
| `CLOUDFLARE_API_BASE_URL` | URL | Never | ⚠️ | API base endpoint |

#### Logistics & Shipping
| Variable | Type | Rotation | Critical | Notes |
|----------|------|----------|----------|-------|
| `EASYPOST_API_KEY` | API Key | Yearly | ⚠️ | Shipping rate calculation |

#### Analytics & Monitoring
| Variable | Type | Rotation | Critical | Notes |
|----------|------|----------|----------|-------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | ID | Never | ⚠️ | Google Analytics tracking |
| `GOOGLE_CLOUD_PROJECT` | ID | Never | ⚠️ | GCP project ID |
| `GA4_PROPERTY_ID` | ID | Never | ⚠️ | GA4 property ID |
| `GOOGLE_APPLICATION_CREDENTIALS` | JSON | Quarterly | ⚠️ | Service account credentials |

#### AI & MCP Integration
| Variable | Type | Rotation | Critical | Notes |
|----------|------|----------|----------|-------|
| `CONTEXT7_API_KEY` | API Key | Quarterly | ⚠️ | Context7 service |
| `CONTEXT7_MCP_URL` | URL | Never | ⚠️ | MCP endpoint |
| `CONTEXT7_API_URL` | URL | Never | ⚠️ | API endpoint |
| `GEMINI_API_KEY` | API Key | Quarterly | ⚠️ | Google Gemini API |

#### Hetzner Development Access (Development Only)
| Variable | Type | Rotation | Critical | Notes |
|----------|------|----------|----------|-------|
| `HETZNER_MEDUSA_URL` | URL | Never | ⚠️ | Direct Medusa access |
| `HETZNER_POSTGRES_URL` | Connection String | Monthly | ✅ | Direct DB access |
| `HETZNER_POSTGRES_HOST` | Hostname | Never | ⚠️ | PostgreSQL host |
| `HETZNER_POSTGRES_PORT` | Port | Never | ⚠️ | PostgreSQL port |
| `HETZNER_POSTGRES_DB` | String | Never | ⚠️ | Database name |
| `HETZNER_POSTGRES_USER` | String | Never | ⚠️ | Database user |
| `HETZNER_POSTGRES_PASSWORD` | Password | Monthly | ✅ | Database password |
| `HETZNER_REDIS_URL` | Connection String | Quarterly | ⚠️ | Direct Redis access |

#### Database & Auth (if using Supabase)
| Variable | Type | Rotation | Critical | Notes |
|----------|------|----------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL | Never | ⚠️ | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | API Key | Quarterly | ✅ | Service role access |

**Access:**
```bash
# Pull storefront secrets
pnpm run secrets:pull
# Writes to .env.local
```

### 2. Backend Secrets (Medusa)

**Infisical Location:**
- Project: `OpticWorks`
- Environment: `production` | `staging`
- Path: `/medusa`

**Variables:**

| Variable | Type | Rotation | Critical | Notes |
|----------|------|----------|----------|-------|
| `DATABASE_URL` | Connection String | Monthly | ✅ | PostgreSQL credentials |
| `REDIS_URL` | Connection String | Quarterly | ⚠️ | Redis cache |
| `JWT_SECRET` | Secret (64 chars) | Monthly | ✅ | Session tokens |
| `COOKIE_SECRET` | Secret (64 chars) | Monthly | ✅ | Cookie signing |
| `MEDUSA_ADMIN_EMAIL` | Email | Never | ⚠️ | Admin login |
| `MEDUSA_ADMIN_PASSWORD` | Password | Monthly | ✅ | Admin login |
| `STRIPE_API_KEY` | API Key | Yearly | ✅ | Stripe backend integration |
| `MEDUSA_STORE_CORS` | URLs | As needed | ⚠️ | CORS allowed origins |
| `MEDUSA_ADMIN_CORS` | URLs | As needed | ⚠️ | Admin CORS origins |

**Access:**
```bash
# Backend secrets are managed via Ansible
# See infrastructure/ansible/group_vars/secrets.yml
# Pull from Infisical manually when deploying
```

### 3. Infrastructure Secrets (Ansible)

**Infisical Location:**
- Project: `OpticWorks`
- Environment: `production`
- Path: `/infrastructure`

**Variables:**

| Variable | Type | Rotation | Critical | Notes |
|----------|------|----------|----------|-------|
| `POSTGRES_PASSWORD` | Password | Monthly | ✅ | Generated via `pnpm run generate:secrets` |
| `CLOUDFLARE_TUNNEL_ID` | UUID | Never | ✅ | Tunnel identifier |
| `CLOUDFLARE_TUNNEL_CREDENTIALS` | JSON | Never | ✅ | Tunnel authentication |
| `HETZNER_API_TOKEN` | API Key | Yearly | ⚠️ | Server management |

**Access:**
```bash
# Stored in infrastructure/ansible/group_vars/secrets.yml
# Encrypted with Ansible Vault (not yet implemented)
# Sync to Infisical after generating
```

---

## Secret Lifecycle

### 1. Generation

**When creating new secrets:**

```bash
# Backend secrets (PostgreSQL, JWT, cookies)
cd services/medusa
pnpm run generate:secrets > /tmp/medusa-secrets.env
cat /tmp/medusa-secrets.env

# Copy output to Infisical immediately
# Then delete temporary file
rm /tmp/medusa-secrets.env
```

**For API keys (Stripe, Resend, etc.):**
1. Generate in provider dashboard
2. Copy to Infisical **immediately**
3. Never store locally except in `.env.local` (gitignored)

### 2. Storage

**Primary:** Infisical web UI
- Log in to Infisical dashboard
- Navigate to OpticWorks project
- Select environment (development / staging / production)
- Add secret with descriptive name
- Tag with rotation schedule (optional)

**Secondary:** Local development (auto-synced)
```bash
# .env.local (storefront) - Auto-generated, never commit
# services/medusa/.env (backend) - Auto-generated, never commit
# infrastructure/ansible/group_vars/secrets.yml - Encrypted, gitignored
```

### 3. Access

**Team Members:**
1. Get Infisical account (invite via web UI)
2. Add to OpticWorks project
3. Access via Infisical web UI or CLI

**GitHub Codespaces (Automatic):**
1. `INFISICAL_SERVICE_TOKEN` set as repository secret
2. Devcontainer post-create script runs
3. `.env.local` automatically synced

**Local Development:**
```bash
# 1. Get service token from team
export INFISICAL_SERVICE_TOKEN=st.xxxxx

# 2. Pull secrets
pnpm run secrets:pull

# 3. Verify
cat .env.local | grep NEXT_PUBLIC_MEDUSA_BASE_URL
```

### 4. Rotation Schedule

| Secret Type | Frequency | Method |
|-------------|-----------|--------|
| Database Passwords | Monthly | Re-run `pnpm run generate:secrets`, update Infisical, reprovision |
| JWT/Cookie Secrets | Monthly | Re-run `pnpm run generate:secrets`, update Infisical, restart services |
| Stripe Keys | Yearly | Generate new in Stripe dashboard, update Infisical |
| Medusa Admin Password | Monthly | Update in Medusa admin UI, sync to Infisical |
| API Keys (general) | Yearly | Provider-specific regeneration |

**Rotation Process:**
1. Generate new secret
2. Add to Infisical (keep old version temporarily)
3. Deploy/restart services with new secret
4. Verify functionality
5. Delete old secret from Infisical
6. Update documentation if needed

### 5. Revocation

**If a secret is compromised:**

1. **Immediate:**
   - Rotate the compromised secret immediately
   - Update in Infisical
   - Deploy new version to all environments

2. **Audit:**
   - Check Infisical audit logs for unauthorized access
   - Review application logs for suspicious activity
   - Check provider dashboards (Stripe, etc.) for unusual usage

3. **Document:**
   - Create incident report in `docs/incidents/`
   - Update rotation schedule if needed
   - Notify team via Slack/email

---

## Adding New Secrets

### Checklist for New Variables

When adding a new environment variable:

1. **Determine Scope:**
   - [ ] Storefront (public or private)?
   - [ ] Backend only?
   - [ ] Infrastructure/deployment?

2. **Add to Infisical:**
   - [ ] Log in to Infisical web UI
   - [ ] Select correct project + environment + path
   - [ ] Add variable with descriptive name
   - [ ] Set value securely (paste, don't type if sensitive)

3. **Update Templates:**
   - [ ] Add to `.env.template` (with example value, not real secret)
   - [ ] Add to `services/medusa/.env.example` (if backend)
   - [ ] Update documentation in this file

4. **Sync Locally:**
   - [ ] Run `pnpm run secrets:pull`
   - [ ] Verify variable appears in `.env.local`
   - [ ] Test application works with new variable

5. **Document:**
   - [ ] Add to table in this document
   - [ ] Specify rotation schedule
   - [ ] Mark as critical if needed
   - [ ] Update `README.md` if user-facing

---

## Environment-Specific Values

### Development

**Purpose:** Local development and testing

**Characteristics:**
- Test mode API keys (Stripe: `pk_test_`, `sk_test_`)
- Local backend URL (`http://localhost:9000`) OR tunnel URL for team testing
- Relaxed CORS policies
- Verbose logging enabled

**Access:** All developers have full access via Infisical `development` environment

### Staging (Future)

**Purpose:** Pre-production testing

**Characteristics:**
- Test mode API keys (same as development)
- Staging backend URL (`https://staging.api.optic.works`)
- Production-like CORS policies
- Moderate logging

**Access:** Limited to QA and engineering team

### Production

**Purpose:** Live customer-facing application

**Characteristics:**
- Live mode API keys (Stripe: `pk_live_`, `sk_live_`)
- Production backend URL (`https://api.optic.works`)
- Strict CORS policies
- Error-level logging only

**Access:** Limited to platform engineering and authorized operators

---

## Best Practices

### ✅ Do

1. **Always use Infisical** for storing secrets
2. **Rotate secrets** according to schedule
3. **Pull before coding** to ensure latest secrets
4. **Audit regularly** via Infisical logs
5. **Document new variables** in this guide
6. **Use descriptive names** for clarity
7. **Tag secrets** with rotation info (optional in Infisical)

### ❌ Don't

1. **Never commit `.env.local`** or `services/medusa/.env`
2. **Never share secrets** via Slack/email/unencrypted channels
3. **Never hardcode secrets** in source code
4. **Never use production secrets** in development
5. **Never skip rotation** schedule for critical secrets
6. **Never store secrets** in browser localStorage/cookies
7. **Never log secrets** even in development mode

---

## Emergency Procedures

### Lost Infisical Access

**If primary Infisical account is unavailable:**

1. **Immediate Access:**
   - Contact team lead for temporary access token
   - Use emergency backup admin account (if configured)

2. **Recovery:**
   - Request new Infisical invitation
   - Regenerate `INFISICAL_SERVICE_TOKEN` for Codespaces
   - Update GitHub secrets

3. **Prevention:**
   - Keep emergency contact list updated
   - Document backup admin account location
   - Maintain offline encrypted backup (1Password/Vault)

### Production Secret Leak

**If production secrets are exposed (GitHub, logs, etc.):**

1. **Stop the Leak** (< 5 minutes):
   - Revoke exposed secret in provider dashboard
   - Remove from public location (force-push Git if needed)

2. **Rotate** (< 30 minutes):
   - Generate new secret
   - Update in Infisical (all environments)
   - Deploy new version to production
   - Verify services restart successfully

3. **Audit** (< 24 hours):
   - Check provider usage logs (Stripe, AWS, etc.)
   - Review Infisical audit trail
   - Document incident in `docs/incidents/YYYY-MM-DD-secret-leak.md`

4. **Post-Mortem** (< 1 week):
   - Root cause analysis
   - Update procedures to prevent recurrence
   - Team debrief and training

---

## Current Key Inventory (2025-11-19)

**Status:** ✅ Critical secrets in Infisical, ⚠️ Some optional integrations pending

### Storefront (Development) - Core
- [x] `NEXT_PUBLIC_MEDUSA_ENABLED=true`
- [x] `NEXT_PUBLIC_MEDUSA_BASE_URL=https://api.optic.works`
- [x] `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxx`
- [x] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx`
- [x] `STRIPE_SECRET_KEY=sk_test_xxx`
- [x] `STRIPE_WEBHOOK_SECRET`
- [x] `STRIPE_WEBHOOK_SECRET_DEV`
- [x] `RESEND_API_KEY=re_xxx`
- [x] `NEXT_PUBLIC_FROM_EMAIL`
- [x] `NEXT_PUBLIC_APP_URL`

### Storefront (Development) - Optional Services
- [ ] Cloudflare R2 (`R2_*` - 5 variables)
- [ ] Cloudflare Images (`CLOUDFLARE_*` - 5 variables)
- [ ] EasyPost shipping (`EASYPOST_API_KEY`)
- [ ] Google Analytics (`GA4_*`, `GOOGLE_*` - 4 variables)
- [ ] AI/MCP integrations (`CONTEXT7_*`, `GEMINI_API_KEY`)
- [ ] Supabase (if used) (`SUPABASE_*` - 2 variables)

### Backend (Production)
- [x] `DATABASE_URL` (URL-encoded password)
- [x] `REDIS_URL`
- [x] `JWT_SECRET` (64 chars)
- [x] `COOKIE_SECRET` (64 chars)
- [x] `MEDUSA_ADMIN_EMAIL`
- [x] `MEDUSA_ADMIN_PASSWORD`
- [x] `STRIPE_API_KEY`
- [x] `MEDUSA_STORE_CORS`
- [x] `MEDUSA_ADMIN_CORS`

### Infrastructure
- [x] `POSTGRES_PASSWORD` (in Ansible secrets.yml)
- [x] `CLOUDFLARE_TUNNEL_ID`
- [ ] `CLOUDFLARE_TUNNEL_CREDENTIALS` (TODO: add to Infisical)
- [ ] `HETZNER_API_TOKEN` (TODO: add to Infisical)

**Outstanding Tasks:**
1. Add Cloudflare Tunnel credentials to Infisical (infrastructure path)
2. Add Hetzner API token to Infisical (infrastructure path)
3. Encrypt Ansible `secrets.yml` with Ansible Vault
4. Set up monthly rotation reminders for critical secrets
5. Document emergency backup procedure
6. Audit optional service variables (R2, Analytics, etc.) and add if needed

---

## Related Documentation

- **[README.md](../README.md)** - Secret Management (Infisical) quick start
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Infrastructure secret requirements
- **[INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)** - Storefront secret configuration
- **[CONTRIBUTORS.md](CONTRIBUTORS.md)** - Development environment setup

---

**Last Updated**: 2025-11-19
**Next Review**: Monthly (align with rotation schedule)

---

**Change Log:**
- **2025-11-19**: Expanded storefront secrets with complete variable inventory (~50 variables), corrected variable names to match codebase (e.g., `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`), added categorization by service
- **2025-11-18**: Initial version with core secrets inventory
