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
| `X-Hookdeck-Signature` | Hookdeck's own signature |
| `X-Hookdeck-Verified` | `true` if Hookdeck validated the webhook |

When these headers are present, the webhook route skips Stripe signature verification (Hookdeck already validated).

---

## Webhook Route

**File**: `src/app/api/stripe/webhook/route.ts`

### Signature Verification

```typescript
// Check if request is from Hookdeck
const hookdeckSignature = request.headers.get('x-hookdeck-signature')
const hookdeckVerified = request.headers.get('x-hookdeck-verified')

if (hookdeckSignature || hookdeckVerified === 'true') {
  // Hookdeck validated - parse directly
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
# Production (Stripe Dashboard)
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Development (Stripe CLI)
STRIPE_WEBHOOK_SECRET_DEV=whsec_xxx
```

The route automatically selects based on `NODE_ENV`.

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
📡 Request from Hookdeck detected
✅ Hookdeck event processed: checkout.session.completed (ID: evt_xxx)
🔄 Processing webhook event: checkout.session.completed
✅ Processing completed checkout for customer@example.com
```

---

## Common Issues

### 401 Signature Verification Failed

- Check `STRIPE_WEBHOOK_SECRET` is set correctly
- Verify Hookdeck is configured in Stripe dashboard
- Ensure webhook endpoint URL is correct

### Events Not Received

- Check Hookdeck dashboard for delivery status
- Verify Stripe webhook configuration
- Check Cloudflare Workers are deployed

### Duplicate Processing

- Events include `event.id` for idempotency
- Store processed event IDs if needed
