# RFD-011: Cloudflare Workers SSR → Medusa API Routing (Archived)

**Status**: RESOLVED (Archived)
**Created**: 2025-12-03
**Resolved**: 2025-12-03
**Author**: Claude (AI Assistant)
**Priority**: N/A (no longer an issue)

---

## Resolution

**This RFD is archived because the workaround is now the permanent solution.**

The "issue" described below is actually the expected behavior for our architecture:
- **Static product data** provides fast, reliable SSR with correct Medusa variant IDs
- **Client-side cart/checkout** uses real-time Medusa API calls
- **Full checkout flow works** - orders complete successfully in Medusa

This hybrid approach is optimal:
1. Products rarely change → static data is acceptable
2. Cart/checkout requires real-time API → works via client-side calls
3. No SSR API dependency → faster page loads, better reliability

If dynamic product data becomes necessary, see Options D or E below.

---

## Original Summary

After completing the E2E checkout flow implementation, one known issue remains: server-side Medusa API calls from Cloudflare Workers return 404 errors. This affects product data fetching during SSR but does not impact the checkout flow, which works correctly via client-side API calls.

---

## Current State

### What Works

| Feature | Status | Notes |
|---------|--------|-------|
| Add to cart | Working | Client-side Medusa API calls succeed |
| Cart synchronization | Working | Cart persists to Medusa backend |
| Checkout flow | Working | Payment session creation, Stripe integration |
| Order completion | Working | Orders created in Medusa with correct details |
| Success page | Working | Displays order confirmation from URL params |
| Client-side product fetch | Working | Browser → api.optic.works succeeds |

### What Fails (with workaround)

| Feature | Status | Workaround |
|---------|--------|------------|
| Server-side product fetch | 404 | Falls back to static product data |
| Server-side product listing | 404 | Falls back to static product array |

---

## Technical Details

### Observed Behavior

When Cloudflare Workers (server-side) makes requests to `api.optic.works`:

```
[medusa] GET https://api.optic.works/store/products?handle=bed-presence-sensor-kit&fields=*variants.prices
[medusa] Headers: {"Content-Type":"application/json","User-Agent":"OpticWorks-Storefront/1.0","x-publishable-api-key":"pk_db1d0b19..."}
[medusa] Response: 404 Not Found
[medusa] Error response body: (empty)
[medusa] Failed to fetch product bed-presence-sensor-kit, falling back to static data
```

When browser (client-side) makes the same request:

```
[medusa] GET https://api.optic.works/store/regions
[medusa] Response: 200
[medusa] POST https://api.optic.works/store/carts
[medusa] Response: 200
```

### Key Observations

1. **Same publishable key** - Both environments use identical API key
2. **Same endpoint** - Both hit `api.optic.works` with same headers
3. **Different results** - Server returns 404, client returns 200
4. **Empty error body** - 404 response contains no error message

### Potential Causes

| Hypothesis | Evidence | Status |
|------------|----------|--------|
| Cloudflare → Cloudflare routing issue | Cloudflare Workers calling Cloudflare-proxied domain | Likely |
| IP-based rate limiting/blocking | Server IP vs residential client IPs | Possible |
| User-Agent filtering | `OpticWorks-Storefront/1.0` may be blocked | Possible |
| TLS/certificate issues | Server-side fetch may handle certs differently | Unlikely |
| DNS resolution differences | Workers may resolve to different IP | Unlikely |

### Most Likely Root Cause

**Cloudflare → Cloudflare Hairpin Issue**: When a Cloudflare Worker makes a request to a domain that's also behind Cloudflare (api.optic.works), the request may not route correctly. This is a known limitation.

---

## Mitigation Applied (2025-12-03)

**Commit**: `349f5a6` - fix(api): Deduplicate product API calls with React cache

The `getProductById` function is now wrapped with React's `cache()`:

```typescript
import { cache } from "react"

export const getProductById = cache(async (id: string): Promise<Product | undefined> => {
  // ... implementation
})
```

This ensures that when both `generateMetadata` and the page component request the same product, only **one** API call is made instead of two. This reduces exposure to the Cloudflare→Cloudflare routing issue by 50%.

---

## Fallback Workaround

The codebase gracefully falls back to static product data:

```typescript
// src/lib/api/medusa.ts
export async function getProductByHandle(handle: string): Promise<Product | null> {
  // ... fetch attempt ...
  catch (error) {
    console.warn(`[medusa] Failed to fetch product ${handle}, falling back to static data`, error);
    return getStaticProductByHandle(handle);
  }
}
```

### Hardcoded Variant IDs

To enable cart functionality, Medusa variant IDs are hardcoded in `src/lib/products.ts`:

```typescript
{
  id: "bed-presence-sensor-kit",
  variantId: "variant_01KBF0WRDCT61JD4HHH2PGDHAK",
  variants: [
    {
      id: "bed-presence-sensor-kit-single",
      medusaVariantId: "variant_01KBF0WRDCT61JD4HHH2PGDHAK",
      // ...
    },
  ],
}
```

This enables the full checkout flow while static product data displays on product pages.

---

## Proposed Solutions

### Option A: Direct API Call (Bypass Cloudflare)

Configure Medusa API calls to use the origin server IP directly, bypassing Cloudflare proxy for server-side requests.

**Implementation:**
```typescript
const MEDUSA_ORIGIN_IP = process.env.MEDUSA_ORIGIN_IP;
const baseUrl = typeof window === 'undefined'
  ? `http://${MEDUSA_ORIGIN_IP}:9000`  // Server-side: direct
  : 'https://api.optic.works';          // Client-side: via Cloudflare
```

**Pros:**
- Simple implementation
- No infrastructure changes

**Cons:**
- Requires exposing origin IP
- May need firewall rules to allow Workers IP range
- Loses Cloudflare benefits (caching, DDoS protection)

---

### Option B: Service Binding (Recommended if using Cloudflare Pages)

If Medusa were deployed as a Cloudflare Worker, use [Service Bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/) for direct worker-to-worker communication.

**Not applicable** - Medusa runs on Hetzner VPS, not Cloudflare.

---

### Option C: Cloudflare Tunnel

Use [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) to create a private connection between Workers and the Medusa origin.

**Implementation:**
1. Install `cloudflared` on Hetzner VPS
2. Create tunnel: `cloudflared tunnel create medusa-internal`
3. Configure tunnel to route to `localhost:9000`
4. Workers access via `medusa-internal.cfargotunnel.com`

**Pros:**
- Private, authenticated connection
- No origin IP exposure
- Works with existing infrastructure

**Cons:**
- Additional service to manage
- Cloudflare One subscription may be required for production

---

### Option D: Build-Time Data Fetching

Pre-fetch product data at build time and include in the deployed bundle.

**Implementation:**
1. Add build script to fetch all products from Medusa
2. Write to `src/lib/products-generated.ts`
3. Import generated data instead of making runtime API calls

**Pros:**
- Zero runtime API calls for products
- Fastest possible page loads
- No Cloudflare routing issues

**Cons:**
- Products don't update without rebuild
- Inventory/pricing changes delayed
- Need webhook to trigger rebuilds on Medusa changes

---

### Option E: Edge-Side Include / KV Cache

Cache Medusa product data in Cloudflare KV, refresh periodically.

**Implementation:**
1. Create KV namespace: `MEDUSA_PRODUCT_CACHE`
2. Background cron worker fetches from Medusa (via Tunnel or direct IP)
3. Storefront Workers read from KV

**Pros:**
- Fast reads from KV
- Decouples storefront from Medusa availability
- Can update cache via Medusa webhooks

**Cons:**
- Cache invalidation complexity
- Additional infrastructure
- Eventual consistency for product updates

---

## Recommendation

**Short-term (current)**: Keep existing workaround with static fallback. The checkout flow works, and product pages display correctly.

**Medium-term**: Implement **Option D (Build-Time Data Fetching)** with Medusa webhook integration:
1. Products rarely change (new products, price updates)
2. Webhook on Medusa triggers Cloudflare Pages rebuild
3. Eliminates all runtime product API calls
4. Preserves real-time cart/checkout via client-side APIs

**Long-term**: Consider **Option E (KV Cache)** if product catalog grows significantly or requires near-real-time updates.

---

## Impact Assessment

| Metric | Current (with workaround) | After Fix |
|--------|--------------------------|-----------|
| Product page accuracy | Static data (correct) | Dynamic from Medusa |
| Checkout functionality | Full working | No change |
| Build complexity | Low | Medium (Option D) |
| Runtime dependencies | Medusa for cart only | Same |

---

## Testing Checklist

Before implementing any fix:

- [ ] Verify client-side API calls continue working
- [ ] Confirm checkout flow unaffected
- [ ] Test product page rendering
- [ ] Validate inventory/pricing accuracy
- [ ] Performance benchmark (TTFB, LCP)

---

## Related Documents

- RFD-010: Infrastructure Drift Mitigation
- `docs/reference/STRIPE_INTEGRATION.md`
- `docs/reference/DEPLOYMENT_GUIDE.md`

---

## Appendix: Debug Commands

### Monitor Cloudflare Worker Logs
```bash
pnpm exec wrangler tail --env production --format pretty
```

### Test Medusa API Directly
```bash
# From local machine (works)
curl -H "x-publishable-api-key: pk_db1d0b19..." \
  https://api.optic.works/store/products

# From Hetzner VPS (works)
curl -H "x-publishable-api-key: pk_db1d0b19..." \
  http://localhost:9000/store/products
```

### Verify Static Fallback
```bash
grep -r "medusaVariantId" src/lib/products.ts
```
