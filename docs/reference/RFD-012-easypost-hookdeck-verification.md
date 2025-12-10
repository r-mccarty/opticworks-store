# RFD-012: EasyPost Webhook Signature Verification via Hookdeck

**Status**: Accepted - Implementing Revised Option A
**Created**: 2025-12-10
**Author**: Claude (AI Assistant)

---

## Summary

EasyPost webhook signature verification is failing at the Hookdeck layer due to a header format mismatch. This document explores the problem, options considered, and tradeoffs for each approach.

---

## Problem Statement

### Current Architecture

```
EasyPost ──[X-Hmac-Signature]──> Hookdeck ──[X-Hookdeck-Signature]──> Medusa Backend
                                    ↑
                            VERIFICATION_FAILED
```

Hookdeck acts as a webhook gateway, providing:
- Retry logic and buffering
- Request logging and observability
- Source signature verification (EasyPost → Hookdeck)
- Destination signature signing (Hookdeck → Backend)

### The Format Mismatch

EasyPost sends the HMAC signature with a prefix:

```
X-Hmac-Signature: hmac-sha256-hex=ec94026ccdc8027afb9b0ab2eea0888c1a65207e89dba3ce0cafb89b68061785
```

Hookdeck's HMAC verification expects the raw signature value:

```
Expected: ec94026ccdc8027afb9b0ab2eea0888c1a65207e89dba3ce0cafb89b68061785
Received: hmac-sha256-hex=ec94026ccdc8027afb9b0ab2eea0888c1a65207e89dba3ce0cafb89b68061785
```

### Verification

We confirmed the secret is correct by computing the HMAC locally:

```bash
# Using EASYPOST_WEBHOOK_SECRET from Infisical
$ echo -n '<request_body>' | openssl dgst -sha256 -hmac "$EASYPOST_WEBHOOK_SECRET"
ec94026ccdc8027afb9b0ab2eea0888c1a65207e89dba3ce0cafb89b68061785  # Matches EasyPost

```

The signature is valid - Hookdeck just can't parse it due to the `hmac-sha256-hex=` prefix.

### Impact

- **25 of 27** EasyPost webhook requests rejected with `VERIFICATION_FAILED`
- **2 requests** passed through during a brief window when verification was disabled
- Tracking updates not reaching the Medusa backend
- No fulfillment status updates for shipped orders

---

## Options Considered

### Option A: Hookdeck Transformation (**SELECTED**)

**Concept**: Use Hookdeck's transformation feature to implement custom HMAC verification.

**Status**: ✅ **Accepted** - Implementation in progress.

**Key Finding**: Hookdeck executes Source Verification *before* Transformations. We cannot strip the prefix to make native verification pass. Instead, we:
1. Disable native Source Verification
2. Implement HMAC verification manually in a transformation using `crypto-js`
3. Throw an error on invalid signature (marks event as Failed, stops delivery)

**Architecture**:
```
EasyPost ──[X-Hmac-Signature]──> Hookdeck (Verification: None)
                                     │
                                     ▼
                              Transformation
                              (Custom HMAC Check)
                                     │
                            ┌────────┴────────┐
                            │                 │
                      Valid Signature    Invalid Signature
                            │                 │
                            ▼                 ▼
                    Deliver to Backend   Mark Failed
```

**Implementation**: `infrastructure/hookdeck-transformations/easypost-verify/`

**Advantages**:
- Keeps verification at the edge (Hookdeck layer)
- Clean logs - invalid requests marked as Failed before delivery
- No additional infrastructure (no Cloudflare Worker needed)
- Full control over verification logic

**Disadvantages**:
- Requires bundling `crypto-js` (Hookdeck runtime lacks Node.js crypto)
- Slightly more complex deployment (webpack build step)

---

### Option B: Cloudflare Worker Proxy

**Concept**: Insert a Cloudflare Worker between EasyPost and Hookdeck to strip the prefix.

```
EasyPost → worker.optic.works → hkdk.events → optic.works → Backend
               ↑
         Strip prefix here
```

**Implementation**:

```typescript
// workers/easypost-proxy/index.ts
export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const hookdeckUrl = `https://hkdk.events/g45xw535haf483${url.pathname}`;

    const headers = new Headers(request.headers);
    const hmacHeader = headers.get('X-Hmac-Signature');

    if (hmacHeader?.startsWith('hmac-sha256-hex=')) {
      headers.set('X-Hmac-Signature', hmacHeader.replace('hmac-sha256-hex=', ''));
    }

    return fetch(hookdeckUrl, {
      method: request.method,
      headers,
      body: request.body,
    });
  }
};
```

**Advantages**:
- Keeps verification at Hookdeck layer
- Clean Hookdeck logs
- Minimal code (~20 lines)

**Disadvantages**:
- Additional infrastructure to maintain
- Extra network hop (latency)
- Another potential point of failure
- Need to update EasyPost webhook URL

---

### Option C: Backend Verification (Not Preferred)

**Concept**: Disable Hookdeck source verification and verify EasyPost signature in Medusa.

```
EasyPost ──[unverified]──> Hookdeck ──[X-Hookdeck-Signature]──> Backend
                                                                   ↓
                                                           Verify BOTH:
                                                           1. Hookdeck signature
                                                           2. EasyPost signature
```

**Implementation**:

```typescript
// backend/src/api/webhooks/easypost/route.ts
import crypto from 'crypto';

function verifyEasyPostSignature(body: string, signature: string | null): boolean {
  const secret = process.env.EASYPOST_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  // Strip prefix if present
  const rawSignature = signature.replace('hmac-sha256-hex=', '');

  const computed = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(rawSignature),
    Buffer.from(computed)
  );
}
```

**Advantages**:
- Simple implementation
- No additional infrastructure
- Full control over verification logic

**Disadvantages**:
- **Tainted Hookdeck logs** - spoofed/invalid requests logged before rejection
- Verification happens late in the chain
- Backend receives unverified payloads (even if it rejects them)
- Debugging harder - can't tell at Hookdeck level if request was valid

---

### Option D: Native Hookdeck Integration

**Concept**: Request Hookdeck add EasyPost as a native verification type (like Stripe).

**Status**: Would require Hookdeck product change.

**Advantages**:
- Best long-term solution
- Zero configuration once supported

**Disadvantages**:
- Depends on Hookdeck roadmap
- Unknown timeline

**Action Item**: Submit feature request to Hookdeck.

---

## Tradeoff Matrix

| Option | Verification Location | Clean Logs | Infrastructure | Complexity |
|--------|----------------------|------------|----------------|------------|
| **A. Hookdeck Transform** | **Edge** | **Yes** | **None** | **Medium** |
| B. Cloudflare Proxy | Edge | Yes | Worker | Medium |
| C. Backend Verify | Backend | No | None | Low |
| D. Native Integration | Edge | Yes | None | None (if available) |

**Note**: Option A complexity increased from "Low" to "Medium" due to required webpack bundling for crypto-js.

---

## Decision

**Selected**: Option A (Revised) - Custom Verification Transformation

We implement HMAC verification in a Hookdeck transformation using bundled `crypto-js`. This keeps verification at the edge while avoiding the log pollution concern of Option C.

**Deployment Steps**:
1. Build transformation: `cd infrastructure/hookdeck-transformations/easypost-verify && npm install && npm run build`
2. In Hookdeck Dashboard:
   - Set EasyPost source verification to "None"
   - Create transformation with bundled code from `dist/index.js`
   - Set `EASYPOST_WEBHOOK_SECRET` environment variable
   - Attach transformation to EasyPost → Backend connection

See `infrastructure/hookdeck-transformations/README.md` for detailed instructions.

---

## Resolved Questions

1. ~~Does Hookdeck support pre-verification transformations?~~ **No** - Transformations run after verification
2. ~~Could we strip the prefix before verification?~~ **No** - But we can implement custom verification in a transformation
3. ~~Are there other EasyPost users on Hookdeck?~~ **Unknown** - But our custom solution works regardless

---

## Related Documents

- `docs/reference/FULFILLMENT_INBOUND.md` - Inbound webhook architecture spec
- `docs/reference/WEBHOOKS.md` - Stripe webhook handling (working reference)
- `backend/src/api/webhooks/easypost/route.ts` - Current webhook handler
- `backend/src/lib/hookdeck-verification.ts` - Hookdeck signature verification

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-12-10 | RFD created | Document verification failure and options |
| 2025-12-10 | Source verification temporarily disabled | Allow webhooks to flow while investigating |
| 2025-12-10 | Option A (Revised) selected | Hookdeck transforms run after verification; implement custom HMAC check in transformation layer |
| 2025-12-10 | Implementation created | `infrastructure/hookdeck-transformations/easypost-verify/` with crypto-js bundling |
