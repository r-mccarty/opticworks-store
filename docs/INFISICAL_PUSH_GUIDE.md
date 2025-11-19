# Infisical Secrets Push Guide

**Date**: 2025-11-19
**Purpose**: Step-by-step guide to push Phase 1+2 secrets from .env.local to Infisical
**Status**: Ready to execute

---

## Overview

This guide walks through pushing all **Phase 1+2 secrets** (16 critical variables) from the local `.env.local` file to Infisical. After this push, Infisical will be the single source of truth for development.

**Current State**: 10/95 variables in Infisical (10.5%)
**Target State**: 16/95 variables in Infisical (Phase 1+2 complete)

---

## Prerequisites

1. Access to Infisical web UI (https://app.infisical.com)
2. OpticWorks project permissions
3. `.env.local` file with all Phase 1+2 secrets (generated and tested)

---

## Phase 1+2 Secrets Inventory

### Storefront Secrets (11 variables)
**Infisical Path**: `/` (root)
**Environment**: `development`

| Variable | Current in Infisical | Action |
|----------|---------------------|--------|
| `NODE_ENV` | ✅ Yes | ✅ Keep (no change) |
| `NEXT_PUBLIC_APP_URL` | ✅ Yes | ✅ Keep (no change) |
| `NEXT_PUBLIC_MEDUSA_ENABLED` | ✅ Yes | ✅ Keep (no change) |
| `NEXT_PUBLIC_MEDUSA_BASE_URL` | ✅ Yes | ✅ Keep (no change) |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | ⚠️ **INVALID** | ⚠️ **UPDATE** (new valid key) |
| `MEDUSA_ADMIN_EMAIL` | ✅ Yes | ✅ Keep (no change) |
| `MEDUSA_ADMIN_PASSWORD` | ✅ Yes | ✅ Keep (no change) |
| `MEDUSA_SECRET_KEY` | ✅ Yes | ✅ Keep (no change) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ Yes | ✅ Keep (no change) |
| `STRIPE_SECRET_KEY` | ✅ Yes | ✅ Keep (no change) |
| `STRIPE_API_KEY` | ❌ No | ➕ **ADD** (same as STRIPE_SECRET_KEY) |

### Backend Secrets (5 variables)
**Infisical Path**: `/medusa`
**Environment**: `production`

| Variable | Current in Infisical | Action |
|----------|---------------------|--------|
| `JWT_SECRET` | ❌ No | ➕ **ADD** (from Ansible) |
| `COOKIE_SECRET` | ❌ No | ➕ **ADD** (from Ansible) |
| `MEDUSA_STORE_CORS` | ❌ No | ➕ **ADD** (CORS config) |
| `MEDUSA_ADMIN_CORS` | ❌ No | ➕ **ADD** (CORS config) |
| `STRIPE_API_KEY` | ❌ No | ➕ **ADD** (same as STRIPE_SECRET_KEY) |

**Note**: Backend also needs `MEDUSA_ADMIN_EMAIL` and `MEDUSA_ADMIN_PASSWORD` (copy from storefront path)

---

## Step-by-Step Push Instructions

### Step 1: Update NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY (CRITICAL)

The current key in Infisical is **invalid**. Update it with the new working key.

1. Log in to Infisical → OpticWorks project
2. Select environment: **development**
3. Navigate to path: **/** (root)
4. Find variable: `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`
5. Click **Edit**
6. Replace value with:
   ```
   pk_32db24ec8a755da925c1c0be033e49117bdb1f08da2e1d39a21e7ed29f618681
   ```
7. Click **Save**

**Verification**:
```bash
pnpm run secrets:pull
grep NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY .env.local
# Should show: pk_32db24ec8a755da925c1c0be033e49117bdb1f08da2e1d39a21e7ed29f618681
```

---

### Step 2: Add STRIPE_API_KEY (Storefront)

1. In Infisical → OpticWorks → development → /
2. Click **Add Secret**
3. Key: `STRIPE_API_KEY`
4. Value: Copy from `.env.local` (same as `STRIPE_SECRET_KEY`)
5. Click **Save**

---

### Step 3: Add Backend Secrets to /medusa Path

1. In Infisical → OpticWorks → **production** environment
2. Navigate to path: **/medusa**
3. Add the following secrets:

#### JWT_SECRET
- Key: `JWT_SECRET`
- Value: Copy from `.env.local` (64-char hex string)
- Description: Session token signing (64-char hex)

#### COOKIE_SECRET
- Key: `COOKIE_SECRET`
- Value: Copy from `.env.local` (64-char hex string)
- Description: Cookie signing (64-char hex)

#### MEDUSA_STORE_CORS
- Key: `MEDUSA_STORE_CORS`
- Value: `http://localhost:3000,https://optic.works`
- Description: Allowed store API origins

#### MEDUSA_ADMIN_CORS
- Key: `MEDUSA_ADMIN_CORS`
- Value: `http://localhost:7000,http://localhost:8000,https://api.optic.works`
- Description: Allowed admin API origins

#### STRIPE_API_KEY (Backend)
- Key: `STRIPE_API_KEY`
- Value: Copy from `.env.local` (same as `STRIPE_SECRET_KEY`)
- Description: Stripe API key for Medusa backend

#### MEDUSA_ADMIN_EMAIL (Backend)
- Key: `MEDUSA_ADMIN_EMAIL`
- Value: Copy from `.env.local`
- Description: Admin user email

#### MEDUSA_ADMIN_PASSWORD (Backend)
- Key: `MEDUSA_ADMIN_PASSWORD`
- Value: Copy from `.env.local`
- Description: Admin user password

---

### Step 4: Verify Storefront Sync

Test that all storefront secrets pull correctly:

```bash
# Pull secrets from Infisical
pnpm run secrets:pull

# Verify all Phase 1+2 secrets are present
cat .env.local | wc -l
# Should show at least 11 non-comment lines

# Test Medusa Store API access
curl -s -H "x-publishable-api-key: $(grep NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY .env.local | cut -d= -f2 | tr -d "'")" \
  https://api.optic.works/store/products | grep -o '"count":[0-9]*'
# Should show: "count":7
```

---

### Step 5: Verify Backend Secrets (via Ansible Sync)

Backend secrets are synced via Ansible script:

```bash
cd infrastructure/ansible

# Sync secrets from Infisical to Ansible
export INFISICAL_SERVICE_TOKEN=st.xxxxx
bash scripts/generate-secrets-from-infisical.sh

# Verify secrets.yml was generated
cat group_vars/secrets.yml

# Should contain:
# - jwt_secret
# - cookie_secret
# - medusa_store_cors
# - medusa_admin_cors
# - stripe_api_key (if configured in script)
```

---

## Post-Push Checklist

After completing all steps above:

- [ ] NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY updated in Infisical
- [ ] STRIPE_API_KEY added to storefront path (/)
- [ ] All 7 backend secrets added to /medusa path
- [ ] `pnpm run secrets:pull` regenerates correct .env.local
- [ ] Medusa Store API test succeeds (returns 7 products)
- [ ] Ansible sync script pulls backend secrets correctly

---

## Summary: What Changed

### Updated (1 variable)
- `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`: Replaced invalid key with working key

### Added to Storefront (1 variable)
- `STRIPE_API_KEY`: For storefront Stripe integration

### Added to Backend (7 variables)
- `JWT_SECRET`: Session token signing
- `COOKIE_SECRET`: Cookie signing
- `MEDUSA_STORE_CORS`: CORS configuration
- `MEDUSA_ADMIN_CORS`: CORS configuration
- `STRIPE_API_KEY`: Stripe backend integration
- `MEDUSA_ADMIN_EMAIL`: Admin credentials
- `MEDUSA_ADMIN_PASSWORD`: Admin credentials

**New Total**: 16 variables in Infisical (up from 10)

---

## Troubleshooting

### Issue: `pnpm run secrets:pull` fails

**Solution**: Verify `INFISICAL_SERVICE_TOKEN` is set:
```bash
echo $INFISICAL_SERVICE_TOKEN
# Should show: st.xxxxx... (105 chars)
```

If not set, add to GitHub Codespaces secrets or export manually.

---

### Issue: Publishable key still invalid after update

**Solution**: Clear local cache and re-pull:
```bash
rm .env.local
pnpm run secrets:pull
# Verify new key is present
```

---

### Issue: Backend secrets not appearing in Ansible

**Solution**: Check Infisical path and environment:
- Path must be `/medusa` (not `/`)
- Environment must be `production` (backend secrets)
- Verify sync script reads from correct path

---

## Next Steps

After completing this push:

1. **Test E2E Flow**:
   - Start Next.js dev server: `pnpm run dev`
   - Navigate to products page
   - Add item to cart
   - Test checkout (use Stripe test card: 4242 4242 4242 4242)

2. **Update Documentation**:
   - Mark `docs/KEY_MANAGEMENT.md` status as "16/95 variables (Phase 1+2 complete)"
   - Update `INFISICAL_SECRETS_INVENTORY.md` with new counts

3. **Deploy Backend** (if needed):
   ```bash
   cd infrastructure/ansible
   bash scripts/generate-secrets-from-infisical.sh
   ansible-playbook playbooks/medusa-deploy.yml
   ```

---

**Last Updated**: 2025-11-19
**Next Review**: After Phase 3 secrets added
