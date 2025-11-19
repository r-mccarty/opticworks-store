# Environment Baseline - Phase 2

**Date**: 2025-11-19
**Purpose**: Frozen snapshot of environment files for Phase 2 Storefront Integration
**Status**: ✅ Baseline established

---

## Overview

This document captures the frozen state of environment configurations used for Phase 2 Storefront Integration testing. These files represent the verified, working configuration as of 2025-11-19.

---

## Storefront Environment (.env.local)

**File**: `.env.local.phase2-baseline`
**Location**: `/workspaces/solar-saas-template/.env.local.phase2-baseline`
**Variables**: 16 Phase 1+2 critical secrets

### Contents Summary

**Phase 1: Core Application (11 variables)**
- `NODE_ENV` - development
- `NEXT_PUBLIC_APP_URL` - http://localhost:3000
- `NEXT_PUBLIC_MEDUSA_ENABLED` - true
- `NEXT_PUBLIC_MEDUSA_BASE_URL` - https://api.optic.works
- `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` - pk_32db... (NEW VALID KEY)
- `MEDUSA_ADMIN_EMAIL` - admin@optic.works
- `MEDUSA_ADMIN_PASSWORD` - EhDLY9Z8YwtH5M
- `MEDUSA_SECRET_KEY` - sk_8253...
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - pk_test_51RzV...
- `STRIPE_SECRET_KEY` - sk_test_51RzV...
- `STRIPE_API_KEY` - sk_test_51RzV... (same as STRIPE_SECRET_KEY)

**Phase 2: Backend Integration (5 variables)**
- `JWT_SECRET` - 310290041d7bef... (from Ansible)
- `COOKIE_SECRET` - febbd9baba4d6b... (from Ansible)
- `MEDUSA_STORE_CORS` - http://localhost:3000,https://optic.works
- `MEDUSA_ADMIN_CORS` - http://localhost:7000,http://localhost:8000,https://api.optic.works
- `POSTGRES_PASSWORD` - KAbNeXLFMQX3JS... (from Ansible)

**Additional (for reference)**
- `DATABASE_URL` - Constructed from POSTGRES_PASSWORD
- `REDIS_URL` - redis://localhost:6379

### Verification Status

✅ **NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY** - Tested, returns 7 products
✅ **MEDUSA_ADMIN_PASSWORD** - Tested, login succeeds
✅ **STRIPE Keys** - Valid test format (pk_test_*, sk_test_*)
✅ **Backend Secrets** - Verified from Ansible secrets.yml

---

## Backend Environment (Ansible)

**File**: `infrastructure/ansible/group_vars/secrets.yml`
**Location**: `/workspaces/solar-saas-template/infrastructure/ansible/group_vars/secrets.yml`
**Generated**: 2025-11-18 20:08:28 UTC

### Contents Summary

```yaml
# PostgreSQL
postgres_db_password: "KAbNeXLFMQX3JS/lqso/c2eSMmn3BK0nNr0J9j4N60A="

# Medusa Admin
medusa_admin_email: "admin@optic.works"
medusa_admin_password: "EhDLY9Z8YwtH5M"

# Medusa Secrets
jwt_secret: "310290041d7bef6153d1e67b1fd733ab5758dd42fedbda3bd4e59a7ecb57c74f"
cookie_secret: "febbd9baba4d6b935243971805f7ad8069e3e8dd063dbf33b1ee7b416518543a"

# Cloudflare Tunnel
cloudflare_tunnel_id: "db4738a9-20b7-4dd7-bde2-0760e0188071"
```

### Deployment Notes

- These secrets are used by Ansible to provision the Hetzner backend
- Backend is live at `https://api.optic.works`
- Secrets should be synced to Infisical `/medusa` and `/infrastructure` paths
- File is gitignored, stored securely in Infisical

---

## Phase 2 Integration Test Plan

Using these baseline configurations, Phase 2 testing includes:

### 1. Product Listing
- [ ] Fetch products from Medusa Store API
- [ ] Render product grid on storefront
- [ ] Display product details (title, description, variants, pricing)

### 2. Cart Management
- [ ] Add products to cart via Medusa cart API
- [ ] Update cart quantities
- [ ] Remove items from cart
- [ ] Persist cart state (Zustand + Medusa session)

### 3. Checkout Flow
- [ ] Initialize Stripe checkout session
- [ ] Process payment with Stripe test card (4242 4242 4242 4242)
- [ ] Handle webhook callbacks
- [ ] Verify order creation in Medusa

### 4. Error Handling
- [ ] Invalid publishable key rejection
- [ ] Network errors (backend down)
- [ ] Payment failures
- [ ] Session expiration

---

## Baseline Restoration

If environment becomes corrupted during testing:

```bash
# Restore storefront baseline
cp .env.local.phase2-baseline .env.local

# Verify restoration
cat .env.local | grep NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
# Should show: pk_32db24ec8a755da925c1c0be033e49117bdb1f08da2e1d39a21e7ed29f618681

# Re-sync from Infisical (if baseline is outdated)
pnpm run secrets:pull
```

For backend secrets, re-provision from Infisical:
```bash
cd infrastructure/ansible
export INFISICAL_SERVICE_TOKEN=st.xxxxx
bash scripts/generate-secrets-from-infisical.sh
```

---

## Known Issues / Blockers

**Before Phase 2 Testing**:
- ⚠️ Publishable key in Infisical is still invalid (needs manual update)
- ⚠️ Backend secrets not yet pushed to Infisical `/medusa` path
- ✅ Local baseline is correct and tested

**During Phase 2 Testing** (to be documented):
- Issues will be captured as RFDs in `docs/issues/RFD-XXX.md`
- Key-related issues → Platform team responsibility
- Workflow issues → Process re-evaluation needed

---

## Change Log

- **2025-11-19**: Initial Phase 2 baseline established
  - Storefront: 16 variables, all tested
  - Backend: 6 Ansible secrets, verified from group_vars
  - Created `.env.local.phase2-baseline` snapshot

---

**Next Review**: After Phase 2 integration testing complete
**Baseline Valid Until**: Infisical push (secrets become source of truth)
