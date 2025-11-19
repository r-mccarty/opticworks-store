# Infisical Secrets Inventory

**Generated**: 2025-11-19
**Purpose**: Track current state vs target state for Infisical secret management

---

## Current State Summary

| Source | Count | Status |
|--------|-------|--------|
| **Infisical (actual)** | 10 | ⚠️ Minimal - missing 85 documented variables |
| **Ansible secrets.yml** | 6 | ✅ Available, needs push to Infisical |
| **.env.template** | 95 | ✅ Comprehensive template |
| **KEY_MANAGEMENT.md** | ~22 critical | 📋 Documented but not in Infisical |

---

## Phase 1: Critical Secrets (18 Variables) - PRIORITY

### Currently in Infisical ✅ (10 vars)

| Variable | Source | Status | Notes |
|----------|--------|--------|-------|
| `MEDUSA_ADMIN_EMAIL` | .env.local | ✅ Valid | admin@optic.works |
| `MEDUSA_ADMIN_PASSWORD` | .env.local | ⚠️ **CONFLICT** | Differs from Ansible - see below |
| `MEDUSA_SECRET_KEY` | .env.local | ⚠️ **UNCLEAR** | Not in KEY_MANAGEMENT.md, may be redundant |
| `NEXT_PUBLIC_APP_URL` | .env.local | ✅ Valid | http://localhost:3000 (dev) |
| `NEXT_PUBLIC_MEDUSA_BASE_URL` | .env.local | ✅ Valid | https://api.optic.works |
| `NEXT_PUBLIC_MEDUSA_ENABLED` | .env.local | ✅ Valid | true |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | .env.local | ❌ **INVALID** | Not created in admin yet |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | .env.local | ✅ Valid | pk_test_* format OK |
| `NODE_ENV` | .env.local | ✅ Valid | development |
| `STRIPE_SECRET_KEY` | .env.local | ✅ Valid | sk_test_* format OK |

### In Ansible secrets.yml - Needs Push 🔧 (6 vars)

| Variable | Ansible Key | Value | Notes |
|----------|-------------|-------|-------|
| `DATABASE_URL` | `postgres_db_password` | (encrypted) | Constructed: postgresql://medusa_user:{password}@localhost:5432/medusa_db |
| `REDIS_URL` | N/A (all.yml) | redis://localhost:6379 | No password (local-only) |
| `JWT_SECRET` | `jwt_secret` | 310290041d7bef615... (64 chars) | Session tokens |
| `COOKIE_SECRET` | `cookie_secret` | febbd9baba4d6b935... (64 chars) | Cookie signing |
| `MEDUSA_STORE_CORS` | N/A (template) | http://localhost:3000,https://optic.works | Hardcoded in template |
| `MEDUSA_ADMIN_CORS` | N/A (template) | http://localhost:7000,http://localhost:8000,https://api.optic.works | Hardcoded in template |

### Missing - Needs Creation 📋 (2 vars)

| Variable | How to Get | Priority | Notes |
|----------|------------|----------|-------|
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | **Create in Medusa admin** | ⚠️ BLOCKER | Required for Phase 2 storefront |
| `STRIPE_WEBHOOK_SECRET` | Stripe dashboard | ⚠️ CRITICAL | Required for payment processing |

---

## Conflict Resolution Required

### MEDUSA_ADMIN_PASSWORD Mismatch

**Current .env.local**: `EhDLY9Z8YwtH5M`
**Ansible secrets.yml**: `ZpgJf6vpjyPM0ByZz77fag==` (base64/encrypted)

**Resolution needed**:
1. Determine which password is actually configured on production backend
2. Test login at `https://api.optic.works/app`
3. Use whichever works, update Infisical with correct value
4. Sync Ansible secrets.yml to match

### MEDUSA_SECRET_KEY vs JWT_SECRET

**.env.local has**: `MEDUSA_SECRET_KEY='sk_8253...'`
**KEY_MANAGEMENT.md documents**: `JWT_SECRET` (no mention of MEDUSA_SECRET_KEY)
**Ansible has**: Both `jwt_secret` and optional `medusa_secret_key`

**Resolution needed**:
1. Check Medusa v2 docs - is MEDUSA_SECRET_KEY still used?
2. Likely redundant with JWT_SECRET - confirm and deprecate
3. Update KEY_MANAGEMENT.md if MEDUSA_SECRET_KEY is still needed

---

## Phase 2: Additional Critical Secrets (Pending)

### Analytics & Monitoring (4 vars)
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog project key
- `NEXT_PUBLIC_POSTHOG_HOST` - https://app.posthog.com
- `SENTRY_DSN` - Error tracking
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics

### Cloudflare Infrastructure (11 vars)
- `R2_ACCOUNT_ID` - Cloudflare R2 account
- `R2_ACCESS_KEY_ID` - R2 API credentials
- `R2_SECRET_ACCESS_KEY` - R2 API secret
- `R2_BUCKET_NAME` - opticworks-assets
- `R2_PUBLIC_URL` - CDN URL
- `CLOUDFLARE_API_TOKEN` - Account management
- `CLOUDFLARE_ZONE_ID` - DNS zone
- `CLOUDFLARE_IMAGES_ACCOUNT_ID` - Image optimization
- `CLOUDFLARE_IMAGES_API_TOKEN` - Images API
- `CLOUDFLARE_TUNNEL_ID` - Already in Ansible: db4738a9-20b7-4dd7-bde2-0760e0188071
- `CLOUDFLARE_TUNNEL_CREDENTIALS` - JSON file (TODO in KEY_MANAGEMENT.md)

### Email & Logistics (3 vars)
- `RESEND_API_KEY` - Email delivery
- `RESEND_FROM_EMAIL` - Default sender
- `EASYPOST_API_KEY` - Shipping labels

---

## Phase 3: Remaining Template Variables (60 vars)

See `.env.template` for full list. Categorized as:
- Developer tools (Context7, Gemini) - 3 vars
- Feature flags - ~5 vars
- Additional integrations - ~52 vars

**Strategy**: Document these as optional, implement as needed per feature roadmap

---

## Recommended Next Steps

### Immediate (Today)
1. ✅ **Resolve password conflict** - Test which MEDUSA_ADMIN_PASSWORD works
2. ✅ **Create publishable key** - Login to `https://api.optic.works/app` and generate
3. ✅ **Get Stripe webhook secret** - From Stripe dashboard → Webhooks
4. ✅ **Prepare consolidated .env** - Merge current + Ansible secrets
5. ✅ **Push to Infisical** - Upload 18 critical variables

### Short-term (This Week)
6. ⏩ **Update KEY_MANAGEMENT.md** - Reflect actual inventory (18/95 = 19%)
7. ⏩ **Add validation script** - Compare .env.local against .env.template
8. ⏩ **Document Cloudflare setup** - R2 bucket creation, API tokens
9. ⏩ **Add analytics secrets** - PostHog, Sentry, GA tokens

### Medium-term (Next Sprint)
10. 📅 **Phase 4 prep** - All Cloudflare secrets for production deployment
11. 📅 **Ansible Vault** - Encrypt secrets.yml (currently plaintext)
12. 📅 **Rotation schedule** - Set up reminders per KEY_MANAGEMENT.md

---

## Validation Checklist

Before pushing to Infisical, verify:
- [ ] MEDUSA_ADMIN_PASSWORD resolves conflict (test login)
- [ ] NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY created in admin
- [ ] STRIPE_WEBHOOK_SECRET retrieved from dashboard
- [ ] DATABASE_URL correctly URL-encodes password
- [ ] All 18 variables present in staging .env file
- [ ] Pull test succeeds and regenerates .env.local
- [ ] Storefront connects to Medusa Store API (HTTP 200)

---

**Last Updated**: 2025-11-19
**Next Review**: After Phase 1 push complete
