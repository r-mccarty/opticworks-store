# RFD-007: Medusa API Integration Mismatch

**Date**: 2025-11-19
**Status**: 🔴 BLOCKER - Phase 2 Integration
**Category**: API Integration / Keys
**Owner**: Platform Team + Integration Team

---

## Problem Statement

The Next.js storefront Medusa integration code (`src/lib/api/medusa.ts`) is incompatible with Medusa v2 Store API authentication. This blocks Phase 2 Storefront Integration.

### Specific Issues

**1. Environment Variable Name Mismatch**

**Code expects** (`src/lib/api/medusa.ts:18`):
```typescript
token: readEnv("MEDUSA_API_TOKEN"),
```

**We have** (`.env.local` and Infisical):
```bash
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY='pk_32db24ec8a755da925c1c0be033e49117bdb1f08da2e1d39a21e7ed29f618681'
```

**2. Authentication Header Mismatch**

**Code uses** (`src/lib/api/medusa.ts:119`):
```typescript
if (medusaEnv.token) {
  headers.Authorization = `Bearer ${medusaEnv.token}`
}
```

**Medusa v2 Store API requires** (per Medusa v2 docs):
```typescript
headers['x-publishable-api-key'] = publishableKey
```

**3. Verified Working API Call**

Direct curl with `x-publishable-api-key` header **works**:
```bash
curl -H 'x-publishable-api-key: pk_32db...' \
  https://api.optic.works/store/products
# Returns: {"products":[...], "count":7}
```

Current storefront code will **fail** because it uses wrong header format.

---

## Impact

**Severity**: 🔴 **CRITICAL BLOCKER**

- Phase 2 Storefront Integration cannot proceed
- Product listing will fail (falls back to static products)
- Cart creation will fail (falls back to direct Stripe)
- Backend API is working perfectly, but storefront can't connect

**Affected Components**:
- `src/lib/api/medusa.ts` - API integration layer
- All pages using `listProducts()` or `getProductById()`
- Checkout flow using `createPaymentSession()`

---

## Root Cause Analysis

### Historical Context

The integration code was likely written for:
1. **Medusa v1** (used `/admin/publishable-api-keys` endpoint)
2. **Different authentication** (Bearer tokens vs publishable keys)
3. **Before Medusa v2 migration** (new API structure)

### Evidence

From `KEY_MANAGEMENT_AUDIT.md` (line 534):
> **Issue**: Documentation lists `NEXT_PUBLIC_MEDUSA_API_TOKEN` in `.env.template` but references `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` in `setup-publishable-key.ts` script.

This indicates the codebase has both old and new patterns.

---

## Proposed Solution

### Option 1: Update Integration Code (RECOMMENDED)

Update `src/lib/api/medusa.ts` to use Medusa v2 Store API authentication:

```typescript
// Change environment variable name
const medusaEnv = {
  enabled: readEnv("MEDUSA_ENABLED") === "true",
  baseUrl: readEnv("MEDUSA_BASE_URL"),
  publishableKey: readEnv("MEDUSA_PUBLISHABLE_KEY"), // CHANGED
}

// Change header format
const medusaHeaders = (): HeadersInit => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (medusaEnv.publishableKey) {
    headers["x-publishable-api-key"] = medusaEnv.publishableKey // CHANGED
  }

  return headers
}
```

**Pros**:
- Aligns with Medusa v2 standards
- Uses keys we already have and tested
- Minimal code changes (2 locations)

**Cons**:
- Breaks any legacy code expecting Bearer tokens
- Requires testing all Medusa API calls

### Option 2: Update Environment Variables (NOT RECOMMENDED)

Rename `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` → `NEXT_PUBLIC_MEDUSA_API_TOKEN` everywhere.

**Pros**:
- No code changes needed

**Cons**:
- Wrong variable name (misleading - it's not a token, it's a publishable key)
- Still uses wrong authentication header (Bearer vs x-publishable-api-key)
- Doesn't solve the core authentication mismatch

---

## Recommended Action Plan

### Immediate (Unblock Phase 2)

1. **Update `src/lib/api/medusa.ts`**:
   - Change `MEDUSA_API_TOKEN` → `MEDUSA_PUBLISHABLE_KEY`
   - Change `Authorization: Bearer` → `x-publishable-api-key`
   - Update TypeScript types accordingly

2. **Test Integration**:
   ```bash
   pnpm run dev
   # Navigate to /products
   # Verify products load from Medusa (not fallback)
   ```

3. **Update Tests** (if any exist):
   - Mock headers should use `x-publishable-api-key`
   - Environment stubs should use `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`

### Short-term (Cleanup)

4. **Update `.env.template`**:
   - Remove `NEXT_PUBLIC_MEDUSA_API_TOKEN` (deprecated)
   - Document `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` as required

5. **Update Documentation**:
   - `docs/INTEGRATION_GUIDE.md` - Correct authentication method
   - `docs/KEY_MANAGEMENT.md` - Remove deprecated variable

6. **Search Codebase**:
   ```bash
   grep -r "MEDUSA_API_TOKEN" src/
   grep -r "Bearer.*medusa" src/
   ```
   Remove any remaining references to old pattern.

### Long-term (Prevent Recurrence)

7. **Add API Integration Tests**:
   - Test product fetching with real Medusa API
   - Test cart creation
   - Test payment session creation

8. **Add Environment Validation**:
   ```typescript
   // On app startup, verify required env vars exist
   if (process.env.NEXT_PUBLIC_MEDUSA_ENABLED === 'true') {
     if (!process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
       throw new Error('NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY required')
     }
   }
   ```

---

## Decision Required

**Question for Platform Team**:
1. Do we have any legacy Medusa v1 integrations that use `MEDUSA_API_TOKEN`?
2. Is there any reason to keep Bearer token authentication?
3. Should we support both authentication methods during migration?

**Question for Integration Team**:
1. Are there other files besides `medusa.ts` that directly call Medusa API?
2. Do we have any tests that mock Medusa responses?

---

## Testing Checklist

After implementing fix:

- [ ] `listProducts()` fetches from Medusa (not fallback)
- [ ] Product count matches Medusa (`"count":7`)
- [ ] Product details include Medusa fields (variants, metadata)
- [ ] `getProductById()` works for individual products
- [ ] `createPaymentSession()` uses Medusa cart API
- [ ] Error handling works (invalid key, network failure)
- [ ] Fallback to static products works if Medusa disabled

---

## Related Issues

- **RFD-004**: Infrastructure automation (resolved - backend is live)
- **RFD-005**: JWT authentication for admin API (resolved)
- **RFD-006**: Deployment drift prevention (resolved - Ansible IaC)
- **KEY_MANAGEMENT_AUDIT.md**: Identified variable name discrepancy

**Newly Created**:
- `docs/PUBLISHABLE_KEY_FIX.md`: Documents creation of valid key
- `docs/INFISICAL_PUSH_GUIDE.md`: Infisical setup instructions

---

## Timeline

**Discovered**: 2025-11-19 during Phase 2 integration testing
**Blocker Severity**: Cannot proceed with Phase 2 until resolved
**Estimated Fix Time**: 30 minutes (code) + 1 hour (testing)
**Recommended Completion**: Immediate (today)

---

## Contact

**Platform Team**: Key management and backend API configuration
**Integration Team**: Storefront Medusa integration code

---

**Last Updated**: 2025-11-19
**Next Review**: After fix implemented and tested
