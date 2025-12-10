# Webhooks

Stripe webhook handling via Hookdeck.

---

## Architecture

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
