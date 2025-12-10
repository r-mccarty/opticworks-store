# Webhooks

Webhook handling for Stripe and EasyPost via Hookdeck.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         HOOKDECK GATEWAY                             │
│  (Buffering, retries, logging, signature verification)               │
└─────────────────────────────────────────────────────────────────────┘
          ▲                                        ▲
          │                                        │
    ┌─────┴─────┐                           ┌──────┴──────┐
    │  Stripe   │                           │  EasyPost   │
    │ Dashboard │                           │  Trackers   │
    └───────────┘                           └─────────────┘
          │                                        │
          ▼                                        ▼
┌─────────────────────┐               ┌─────────────────────────────┐
│ Storefront Workers  │               │   Medusa Backend            │
│ /api/stripe/webhook │               │ /webhooks/easypost-tracker  │
│                     │               │                             │
│ checkout.session.*  │               │ tracker.updated events      │
│ payment_intent.*    │               │ → Update fulfillment status │
└─────────────────────┘               └─────────────────────────────┘
```

---

## Stripe Webhooks

### Architecture

```
Stripe Dashboard
       |
       v
   Hookdeck (webhook gateway)
       |
       | (validates, retries, logs)
       v
optic.works/api/stripe/webhook
       |
       v
   Event Processing
       |
       +-- checkout.session.completed --> Store order, send email
       +-- checkout.session.expired --> Log abandonment
       +-- payment_intent.succeeded --> (legacy handler)
       +-- payment_intent.payment_failed --> (legacy handler)
```

---

## Hookdeck Configuration

Hookdeck provides:
- **Retry logic**: Automatic retries on failure
- **Logging**: Full request/response visibility
- **Validation**: Stripe signature verification
- **Buffering**: Protection against endpoint downtime

### Headers Added by Hookdeck

| Header | Purpose |
|--------|---------|
| `X-Hookdeck-Signature` | HMAC SHA256 signature (base64 encoded) |
| `X-Hookdeck-Signature-2` | Secondary signature during key rotation |
| `X-Hookdeck-Verified` | `true` if Hookdeck validated the Stripe signature |

### Signature Verification

**Important:** The `X-Hookdeck-Signature` header is verified using `HOOKDECK_WEBHOOK_SECRET` (from Hookdeck dashboard > Settings > Project > Secrets).

**Implementation:** `src/lib/webhook-verification.ts`

```typescript
// Uses Web Crypto API for Cloudflare Workers compatibility
export async function verifyHookdeckSignature(
  body: string,
  signature: string | null,
  signature2: string | null
): Promise<boolean> {
  const secret = process.env.HOOKDECK_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  // Use Web Crypto API (SubtleCrypto) for Cloudflare Workers
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const computedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

  // Check both signatures for key rotation support
  return computedSignature === signature || computedSignature === signature2;
}
```

When verification passes, you can trust the webhook came from Hookdeck (which already validated Stripe's signature).

---

## Webhook Route

**File**: `src/app/api/stripe/webhook/route.ts`

### Current Implementation

```typescript
// Check if request is from Hookdeck
const hookdeckSignature = request.headers.get('x-hookdeck-signature')
const hookdeckSignature2 = request.headers.get('x-hookdeck-signature-2')

if (hookdeckSignature) {
  // Verify Hookdeck signature using HOOKDECK_WEBHOOK_SECRET
  const isValid = verifyHookdeckSignature(body, hookdeckSignature, hookdeckSignature2)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid Hookdeck signature' }, { status: 401 })
  }
  // Hookdeck validated Stripe's signature - parse directly
  event = JSON.parse(body) as Stripe.Event
} else {
  // Direct from Stripe - verify signature
  event = await stripe.webhooks.constructEventAsync(
    body,
    signature,
    webhookSecret,
    undefined,
    cryptoProvider  // Web Crypto API for Cloudflare Workers
  )
}
```

### Cloudflare Workers Compatibility

Stripe SDK requires special configuration for Workers:

```typescript
import Stripe from 'stripe'

// Use FetchHttpClient instead of Node's http
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
  httpClient: Stripe.createFetchHttpClient(),
})

// Use SubtleCryptoProvider for signature verification
const cryptoProvider = Stripe.createSubtleCryptoProvider()
```

---

## Event Handlers

### checkout.session.completed (Active)

Primary handler for successful payments.

```typescript
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  // 1. Extract customer info
  const customerEmail = session.customer_details?.email

  // 2. Get line items
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id)

  // 3. Calculate totals
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingCost = (session.shipping_cost?.amount_total || 0) / 100
  const total = (session.amount_total || 0) / 100

  // 4. Generate order number
  const orderNumber = `ORD-${Date.now()}-${session.id.slice(-8).toUpperCase()}`

  // 5. Store in database (if Supabase configured)
  // 6. Email handled by Medusa backend
}
```

### checkout.session.expired

Handles abandoned checkouts for analytics/recovery.

### payment_intent.succeeded/failed (Legacy)

Legacy handlers for backward compatibility. Not used in active flow.

---

## Environment Variables

```bash
# Hookdeck (required for production)
HOOKDECK_WEBHOOK_SECRET=xxx  # From Hookdeck dashboard > Settings > Project > Secrets

# Stripe (for direct webhook verification, fallback when not via Hookdeck)
STRIPE_WEBHOOK_SECRET=whsec_xxx       # Production (Stripe Dashboard)
STRIPE_WEBHOOK_SECRET_DEV=whsec_xxx   # Development (Stripe CLI)
```

The route:
1. If `x-hookdeck-signature` header present → Verify with `HOOKDECK_WEBHOOK_SECRET`
2. Otherwise → Verify Stripe signature with `STRIPE_WEBHOOK_SECRET` (or `_DEV` in development)

---

## Local Development

```bash
# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# The CLI provides a webhook secret (whsec_xxx)
# Set as STRIPE_WEBHOOK_SECRET_DEV
```

---

## Debugging

### Hookdeck Dashboard

- View all webhook deliveries
- See request/response bodies
- Check retry attempts
- Manual replay failed webhooks

### Cloudflare Workers Logs

```bash
# View recent logs
wrangler tail --env production
```

### Event Logging

The webhook route logs extensively:

```
🔔 Stripe webhook received
📡 Request from Hookdeck detected, verifying Hookdeck signature...
✅ Hookdeck signature verified for event: checkout.session.completed (ID: evt_xxx)
🔄 Processing webhook event: checkout.session.completed
✅ Processing completed checkout for customer@example.com
```

---

## Common Issues

### 401 Invalid Hookdeck Signature

- Verify `HOOKDECK_WEBHOOK_SECRET` is set correctly in environment
- Get the secret from Hookdeck dashboard > Settings > Project > Secrets
- If rotating keys, both `x-hookdeck-signature` and `x-hookdeck-signature-2` are checked

### 401 Stripe Signature Verification Failed

- Check `STRIPE_WEBHOOK_SECRET` is set correctly (for direct Stripe webhooks)
- Verify Hookdeck is configured in Stripe dashboard
- Ensure webhook endpoint URL is correct

### Events Not Received

- Check Hookdeck dashboard for delivery status
- Verify Stripe webhook configuration
- Check Cloudflare Workers are deployed

### Duplicate Processing

- Events include `event.id` for idempotency
- Store processed event IDs if needed

---

## EasyPost Webhooks

EasyPost sends tracker events when shipment status changes. These events flow through Hookdeck to the Medusa backend.

### Architecture

```
EasyPost Tracker
       |
       | tracker.updated events
       v
   Hookdeck
       |
       | 1. Verify EasyPost signature (transformation)
       | 2. Sign with HOOKDECK_WEBHOOK_SECRET
       v
api.optic.works/webhooks/easypost-tracker
       |
       v
   Medusa Workflow (handle-easypost-event)
       |
       +-- pre_transit    --> No action (label created)
       +-- in_transit     --> Mark shipped
       +-- out_for_delivery --> No action (future: SMS)
       +-- delivered      --> Mark delivered
       +-- failure        --> Log error
```

### Hookdeck Transformation

EasyPost webhook signature verification is handled by a **Hookdeck transformation** (not the Medusa backend). This prevents invalid events from ever reaching our backend.

**Location**: `infrastructure/hookdeck-transformations/easypost-verify-signature.js`

**How it works**:
1. EasyPost sends event with `x-easypost-hmac-sha256` header
2. Hookdeck transformation verifies signature using `EASYPOST_WEBHOOK_SECRET`
3. If valid, event is forwarded to Medusa
4. If invalid, event is rejected (never reaches backend)

**Configuration**: The `EASYPOST_WEBHOOK_SECRET` is set in Hookdeck Dashboard > Transformations > easypost-verify > Environment Variables (NOT in Infisical).

See `infrastructure/hookdeck-transformations/README.md` and [RFD-012](./RFD-012-easypost-hookdeck-verification.md) for details.

### Payload Structure

```json
{
  "description": "tracker.updated",
  "mode": "test",
  "result": {
    "tracking_code": "EZ1000000001",
    "status": "in_transit",
    "shipment_id": "shp_xxx",
    "carrier": "USPS",
    "public_url": "https://track.easypost.com/..."
  }
}
```

### Medusa Backend Route

**File**: `backend/src/api/webhooks/easypost-tracker/route.ts`

The route:
1. Verifies `x-hookdeck-signature` header (trusts Hookdeck validated EasyPost)
2. Filters for `tracker.updated` events only
3. Looks up fulfillment by `tracking_code` or `shipment_id`
4. Triggers workflow to update fulfillment status

### Idempotency

The backend handles duplicate events gracefully:
- Checks `fulfillment.shipped_at` before marking as shipped
- Checks `fulfillment.data.delivery_status` before marking as delivered
- If `delivered` arrives before `in_transit`, handles both sequentially

### Testing with Magic Codes

In `EASYPOST_MODE=test`, use magic tracking codes that automatically cycle through statuses:

| Code | Behavior |
|------|----------|
| `EZ1000000001` | Transitions to `delivered` |
| `EZ2000000002` | Transitions to `in_transit` |
| `EZ3000000003` | Transitions to `failure` |
| `EZ4000000004` | Stays in `pre_transit` |
| `EZ5000000005` | Transitions to `out_for_delivery` |

### Environment Variables

| Variable | Location | Purpose |
|----------|----------|---------|
| `EASYPOST_WEBHOOK_SECRET` | **Hookdeck transformation env** | EasyPost signature verification |
| `HOOKDECK_WEBHOOK_SECRET` | **Infisical** | Hookdeck signature verification (Medusa) |
| `EASYPOST_MODE` | **Infisical** | `test` or `production` |

### Debugging

```bash
# View recent EasyPost events in Hookdeck
source .env.local && curl -s "https://api.hookdeck.com/2024-03-01/events?limit=5" \
  -H "Authorization: Bearer $HOOKDECK_API_KEY" | jq '.models[] | {id, response_status, created_at}'

# Check Medusa logs for webhook processing
ssh hetzner-node "grep easypost /opt/opticworks/medusa-backend/logs/medusa-app.log | tail -20"

# Verify fulfillment status in Medusa Admin
curl -s "https://api.optic.works/admin/fulfillments/{id}" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.fulfillment.data'
```

### Common Issues

**401 from Medusa (but Hookdeck shows delivered)**
- Verify `HOOKDECK_WEBHOOK_SECRET` is set in Medusa environment
- Check transformation is passing the signed payload correctly

**Fulfillment Not Found**
- Backend returns `200 OK` to prevent Hookdeck retries
- Check tracking code matches `fulfillment.data.tracking_number`
- Check shipment ID matches `fulfillment.data.easypost_shipment_id`

**Events Not Received**
- Check Hookdeck dashboard for delivery status
- Verify EasyPost tracker was created (check EasyPost dashboard)
- In test mode, only magic codes generate automatic events

See `docs/reference/FULFILLMENT_INBOUND.md` for full inbound architecture details.
