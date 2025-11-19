# Publishable API Key Resolution

**Date**: 2025-11-19
**Issue**: Invalid NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY in Infisical
**Status**: ✅ RESOLVED

---

## Problem

The `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` stored in Infisical (`pk_opticworks_2025_live_c9fa7e3575be7d2fc8082e3d088bcf5d`) was **invalid** - it was never actually created in the Medusa admin dashboard via the API. This blocked Phase 2 storefront integration.

Testing showed:
```bash
curl -H 'x-publishable-api-key: pk_opticworks_2025_live_c9fa7e3575be7d2fc8082e3d088bcf5d' \
  https://api.optic.works/store/products

# Response:
{"type":"not_allowed","message":"A valid publishable key is required to proceed with the request"}
```

## Root Cause

The key was likely fabricated to match a realistic format but was never registered via the Medusa Admin API. The `pnpm run setup:keys` script failed because it was using the Medusa v1 endpoint (`/admin/publishable-api-keys`) instead of the v2 endpoint (`/admin/api-keys`).

## Resolution

### 1. Created Valid Publishable Key

Successfully created a new publishable API key using Medusa v2 Admin API:

```bash
# Get JWT token
curl -X POST https://api.optic.works/auth/user/emailpass \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@optic.works","password":"EhDLY9Z8YwtH5M"}'

# Create publishable key
curl -X POST https://api.optic.works/admin/api-keys \
  -H 'Authorization: Bearer <jwt_token>' \
  -H 'Content-Type: application/json' \
  -d '{"title":"OpticWorks Production Store","type":"publishable"}'

# Response:
{
  "api_key": {
    "id": "apk_01KAD3DAK5T2TBMC749HCJQAPQ",
    "token": "pk_32db24ec8a755da925c1c0be033e49117bdb1f08da2e1d39a21e7ed29f618681",
    "title": "OpticWorks Production Store",
    "type": "publishable"
  }
}
```

### 2. Associated with Sales Channel

```bash
curl -X POST https://api.optic.works/admin/api-keys/apk_01KAD3DAK5T2TBMC749HCJQAPQ/sales-channels \
  -H 'Authorization: Bearer <jwt_token>' \
  -H 'Content-Type: application/json' \
  -d '{"add":["sc_01KAAHM9T0P9VYX4HKB3C0AAAM"]}'

# Successfully associated with "Default Sales Channel"
```

### 3. Verified Working

```bash
curl -H 'x-publishable-api-key: pk_32db24ec8a755da925c1c0be033e49117bdb1f08da2e1d39a21e7ed29f618681' \
  https://api.optic.works/store/products

# Response: Successfully retrieved all 7 products
```

## New Valid Key

**NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY**:
```
pk_32db24ec8a755da925c1c0be033e49117bdb1f08da2e1d39a21e7ed29f618681
```

**Key Details**:
- ID: `apk_01KAD3DAK5T2TBMC749HCJQAPQ`
- Title: `OpticWorks Production Store`
- Type: `publishable`
- Sales Channel: `Default Sales Channel` (sc_01KAAHM9T0P9VYX4HKB3C0AAAM)
- Created: 2025-11-19T03:44:25.189Z

## Action Items

### Immediate
- [x] Create valid publishable key via Medusa v2 API
- [x] Associate with default sales channel
- [x] Verify Store API access works
- [x] Update local .env.local
- [ ] **Update Infisical** with new valid key:
  - Environment: `development`
  - Path: `/`
  - Variable: `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`
  - Value: `pk_32db24ec8a755da925c1c0be033e49117bdb1f08da2e1d39a21e7ed29f618681`

### Follow-up
- [ ] Update `setup-publishable-key.ts` script to use Medusa v2 endpoint (`/admin/api-keys` instead of `/admin/publishable-api-keys`)
- [ ] Add publishable key validation to smoke tests
- [ ] Document v1 vs v2 API differences for team

## Related Files

- ✅ `.env.local` - Updated with new key
- ⚠️ Infisical - Needs manual update
- 📝 `services/medusa/scripts/setup-publishable-key.ts` - Needs v2 endpoint fix
- 📋 `docs/KEY_MANAGEMENT_AUDIT.md` - References publishable key generation

---

**Lesson Learned**: Always verify API keys work via actual API calls before assuming they're valid. Format matching is not sufficient validation.
