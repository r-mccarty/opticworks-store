# Postmortem: Infinite Loop Causing Cloudflare Workers Rate Limit Exhaustion

**Date**: December 7, 2025
**Author**: Claude Code + Ryan
**Severity**: High (Service Degradation)
**Status**: Resolved

---

## Summary

A React hook dependency bug caused an infinite loop in the shipping rates API, exhausting the Cloudflare Workers free tier daily limit (100K requests) by generating ~580K requests in a 2-hour window. The site experienced `ERR_QUIC_PROTOCOL_ERROR` responses as Cloudflare rate-limited the account.

---

## Timeline (All times UTC)

| Time | Event |
|------|-------|
| Dec 6, 23:10 | Initial infinite loop fix deployed (commit `5a66f33`) |
| Dec 7, 05:00 | Request spike begins: 197,308 requests in one hour |
| Dec 7, 06:00 | Peak hour: 235,825 requests |
| Dec 7, ~06:30 | Users report `ERR_QUIC_PROTOCOL_ERROR` |
| Dec 7, 06:31 | Rate limiting + EasyPost SDK fix deployed (commit `7af17f9`) |
| Dec 7, 14:20 | Latest deployment with all fixes |
| Dec 8, 00:00 | Cloudflare daily limit resets |

---

## Impact

| Metric | Value |
|--------|-------|
| Total requests (Dec 1-7) | 622,814 |
| Requests on Dec 7 | 433,366 |
| Subrequests on Dec 7 | 15,696 |
| Free tier daily limit | 100,000 |
| Overage factor | ~4.3x daily limit |

**User Impact**: Site returned Cloudflare protocol errors for several hours until daily limit reset.

---

## Root Cause Analysis

### Primary Cause: React useEffect Dependency Loop

The bug was in `src/hooks/useShippingRates.ts`:

```typescript
// BUGGY CODE (before fix)
const fetchRates = useCallback(async () => {
  // ... fetch logic ...
  if (data.rates.length > 0 && !selectedRate) {
    const cheapest = data.rates.reduce((a, b) => a.rate < b.rate ? a : b);
    setSelectedRate(cheapest);  // This updates selectedRate
  }
}, [address, items, subtotal, selectedRate]);  // selectedRate in deps!

useEffect(() => {
  if (enabled && address && items.length > 0) {
    fetchRates();
  }
}, [..., fetchRates]);  // fetchRates changes when selectedRate changes
```

**The Loop Mechanism:**

1. User enters checkout page with valid address
2. `useEffect` triggers `fetchRates()`
3. API returns rates (or error)
4. `setSelectedRate(cheapest)` updates state
5. `selectedRate` change causes `fetchRates` callback to be recreated
6. New `fetchRates` reference triggers the `useEffect` again
7. Repeat infinitely

### Contributing Factor: Missing EasyPost API Key

The EasyPost API key wasn't configured in production Workers secrets. This caused:

- Every API call returned a 500 error
- The error path didn't break the loop
- No graceful fallback to mock rates

### Contributing Factor: EasyPost SDK Incompatibility

The EasyPost Node.js SDK uses the `https` module, which isn't supported in Cloudflare Workers runtime. This caused additional errors even when the API key was present.

---

## Request Volume Analysis

```
Daily Breakdown:
Dec 2:      12 requests (normal)
Dec 3:  38,193 requests (initial deployment)
Dec 4:   1,903 requests (normal)
Dec 5:   1,999 requests (normal)
Dec 6: 147,341 requests (loop triggered)
Dec 7: 433,366 requests (loop at scale, rate limited)
```

**Hourly breakdown on Dec 7:**
- 00:00-04:00 UTC: ~230 requests (normal overnight traffic)
- 05:00 UTC: 197,308 requests (loop begins)
- 06:00 UTC: 235,825 requests (peak, then rate limited)

---

## Resolution

### Immediate Fixes (Deployed)

1. **Fixed dependency loop** (commit `5a66f33`):
   ```typescript
   // Removed selectedRate from fetchRates dependencies
   }, [address, items, subtotal]);  // No selectedRate!

   // Moved auto-selection to separate useEffect
   useEffect(() => {
     if (rates.length > 0) {
       setSelectedRate(prevSelected => {
         if (!prevSelected) return rates.reduce((a, b) => ...);
         // ... rest of logic
       });
     }
   }, [rates]);  // Only depends on rates, not selectedRate
   ```

2. **Added graceful fallback** (commit `5a66f33`):
   ```typescript
   try {
     ratesResponse = await getShippingRates(...);
   } catch (easypostError) {
     console.error('EasyPost API error, falling back to mock rates');
     ratesResponse = getMockShippingRates(easypostAddress);
   }
   ```

3. **Replaced EasyPost SDK with fetch** (commit `7af17f9`):
   - Removed `easypost` npm package
   - Implemented direct API calls using `fetch()`
   - Compatible with Cloudflare Workers runtime

4. **Added in-memory rate limiting** (commit `7af17f9`):
   ```typescript
   // src/lib/rate-limit.ts
   RATE_LIMITS = {
     shipping: { limit: 20, windowSeconds: 60 },
     checkout: { limit: 10, windowSeconds: 60 },
     addressValidation: { limit: 30, windowSeconds: 60 },
   }
   ```

---

## Prevention Measures

### Already Implemented

| Measure | Description | Status |
|---------|-------------|--------|
| Dependency fix | Removed `selectedRate` from callback deps | Done |
| Fallback rates | Mock rates when EasyPost fails | Done |
| SDK replacement | Fetch-based API for Workers compatibility | Done |
| In-memory rate limiting | Per-IP limits on API routes | Done |
| Rate limit headers | X-RateLimit-* headers on responses | Done |

### Planned (Track 7 in Phase 4)

| Measure | Description | Priority |
|---------|-------------|----------|
| Cloudflare WAF rate limiting | Edge-level protection before Workers | High |
| Upstash Qstash | Queue/buffer for EasyPost API calls | High |
| Request debouncing | 500ms debounce in useShippingRates | Medium |
| Circuit breaker | Stop calling EasyPost after N failures | Medium |
| Workers Paid plan | 10M requests/month included | Consider |

---

## Lessons Learned

### What Went Well

1. The initial fix (commit `5a66f33`) was deployed quickly
2. Fallback to mock rates allowed checkout to continue working
3. Rate limiting was added within hours of detection

### What Went Wrong

1. React hook dependency arrays are error-prone
2. No edge-level rate limiting to catch runaway loops
3. Missing production secrets weren't caught in deployment
4. No alerting on abnormal request volumes

### Action Items

| Item | Owner | Due |
|------|-------|-----|
| Implement Cloudflare WAF rate limiting | Ryan | Dec 14 |
| Set up Upstash Qstash for EasyPost | Ryan | Dec 14 |
| Add request volume alerting | Ryan | Dec 21 |
| Consider Workers Paid plan | Ryan | Dec 21 |
| Add exhaustive-deps ESLint rule enforcement | Ryan | Dec 14 |

---

## Appendix: Cloudflare Workers Limits

| Plan | Daily Requests | Reset Time |
|------|----------------|------------|
| Free | 100,000 | 00:00 UTC |
| Paid | 10,000,000/month | N/A |

**Note**: Subrequests (Worker-to-Worker or Worker-to-origin) don't count against the limit. Static assets are also free.

---

## Related Documentation

- [Cloudflare Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [React useCallback Dependencies](https://react.dev/reference/react/useCallback)
- [Upstash Qstash](https://upstash.com/docs/qstash/overall/getstarted)
- Phase 4 Plan: `docs/reference/PHASE4_PLAN.md`
