# Stripe Integration Documentation

**Updated**: 2025-12-03

## Current Architecture: Medusa + Stripe Elements

The checkout flow uses **Medusa v2** as the payment orchestrator with **Stripe Elements** for the frontend payment UI. Medusa creates PaymentIntents via its Stripe provider, and we use Stripe's `PaymentElement` and `AddressElement` to collect payment details.

### Payment Flow Diagram

```
User adds to cart
       ↓
Medusa Cart created (POST /store/carts)
       ↓
Line items synced to Medusa (POST /store/carts/{id}/line-items)
       ↓
User clicks "Proceed to Checkout"
       ↓
Payment Collection created (POST /store/payment-collections)
       ↓
Payment Session created with Stripe (POST /store/payment-collections/{id}/payment-sessions)
       ↓
Stripe PaymentIntent created → client_secret returned
       ↓
Stripe Elements rendered with client_secret
       ↓
User fills address + payment → stripe.confirmPayment()
       ↓
Payment succeeds → completeCart(cartId) → Medusa Order created
       ↓
Redirect to success page
```

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/api/medusa.ts` | All Medusa API calls including payment collection/session |
| `src/components/checkout/CheckoutWrapper.tsx` | Initializes payment, renders Stripe Elements provider |
| `src/components/checkout/CheckoutForm.tsx` | Payment and address forms, handles confirmPayment |
| `src/hooks/useCart.ts` | Cart state with Medusa sync |

---

## Medusa v2 Payment API

### Creating Payment Sessions

In Medusa v2, payment sessions are created through **Payment Collections**, not directly on carts:

```typescript
// 1. Create payment collection for the cart
const paymentCollection = await medusaFetch<{ payment_collection: MedusaPaymentCollection }>(
  "/store/payment-collections",
  {
    method: "POST",
    body: JSON.stringify({ cart_id: cartId }),
  }
)

// 2. Create payment session with Stripe provider
const collectionWithSession = await medusaFetch<{ payment_collection: MedusaPaymentCollection }>(
  `/store/payment-collections/${paymentCollection.id}/payment-sessions`,
  {
    method: "POST",
    body: JSON.stringify({ provider_id: "pp_stripe_stripe" }),
  }
)

// 3. Extract client_secret from the Stripe payment session
const stripeSession = collectionWithSession.payment_sessions.find(
  (s) => s.provider_id === "pp_stripe_stripe"
)
const clientSecret = stripeSession.data.client_secret
```

### Completing Orders

After payment confirmation, complete the cart to create a Medusa order:

```typescript
const { order } = await completeCart(cartId)
// order.id = "order_01KBH..."
// order.display_id = 1234
```

---

## Stripe Elements Integration

### Provider Setup

```tsx
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

<Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
  <CheckoutForm />
</Elements>
```

### Form Components

```tsx
import { PaymentElement, AddressElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Address collection
<AddressElement
  options={{
    mode: 'shipping',
    allowedCountries: ['US'],
  }}
/>

// Payment collection
<PaymentElement options={{ layout: 'tabs' }} />
```

### Payment Confirmation

```typescript
const { error, paymentIntent } = await stripe.confirmPayment({
  elements,
  confirmParams: {
    return_url: `${window.location.origin}/store/cart/success`,
    receipt_email: email,
  },
  redirect: 'if_required',
});

if (paymentIntent?.status === 'succeeded') {
  await completeCart(cartId);  // Creates Medusa order
}
```

---

## CORS Proxy Worker

A Cloudflare Worker handles CORS preflight for the Medusa API. This is necessary because Medusa's publishable API key middleware rejects OPTIONS requests (browsers don't send custom headers on preflight).

### Architecture

```
Browser → api.optic.works (Worker) → medusa.optic.works (Cloudflare Tunnel) → Medusa
```

### Worker Location

`infrastructure/workers/api-cors/`

### How It Works

1. **OPTIONS requests**: Worker responds with 204 + CORS headers (never reaches Medusa)
2. **Other requests**: Proxied to `medusa.optic.works` with CORS headers added to response

### Deployment

```bash
cd infrastructure/workers/api-cors
pnpm exec wrangler deploy --config wrangler.toml --env production
```

---

## Environment Variables

### Required

```bash
# Stripe (client-side)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

# Medusa
NEXT_PUBLIC_MEDUSA_ENABLED=true
NEXT_PUBLIC_MEDUSA_BASE_URL=https://api.optic.works
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxxxx

# Backend (for Medusa server)
STRIPE_API_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### Cloudflare Worker Variables

Set in `wrangler.toml`:
```toml
[env.production.vars]
MEDUSA_ORIGIN = "https://medusa.optic.works"
ALLOWED_ORIGINS = "https://optic.works,https://www.optic.works"
```

---

## Testing

### Test Cards

| Card | Scenario |
|------|----------|
| `4242424242424242` | Successful payment |
| `4000000000000002` | Card declined |
| `4000002500003155` | Requires 3D Secure |

### Local Development

1. Start Medusa backend: `cd backend && pnpm dev`
2. Start storefront: `pnpm dev`
3. For webhooks, use Stripe CLI: `stripe listen --forward-to localhost:9000/hooks/payment/stripe`

### Production Testing

1. Use test mode keys in Stripe
2. Verify webhook delivery in Hookdeck dashboard
3. Check Medusa admin for order creation

---

## Webhook Integration

Stripe webhooks are handled by Medusa's Stripe provider. The flow is:

```
Stripe → Hookdeck → api.optic.works/hooks/payment/stripe → Medusa processes webhook
```

Medusa handles:
- `payment_intent.succeeded` - Marks payment session as authorized
- `payment_intent.payment_failed` - Marks payment session as failed

The storefront calls `completeCart()` after payment confirmation to create the order.

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid client secret` | Using Checkout Session secret with PaymentIntent API | Ensure Medusa creates PaymentIntent (current implementation) |
| `CORS error on OPTIONS` | Publishable API key middleware | Use CORS Worker proxy |
| `404 on payment-sessions` | Using v1 API endpoints | Use v2 payment collections API |
| `Payment collection not found` | Cart doesn't exist | Ensure cart is created before checkout |

### Debugging

```typescript
// Logging is built into medusa.ts
console.log("[medusa] Creating payment collection for cart:", cartId)
console.log("[medusa] Payment session created:", session.id)
console.log("[checkout] Payment intent status:", paymentIntent?.status)
```

---

## Migration Notes

### From Stripe Checkout Sessions to Medusa

The previous implementation used Stripe's Custom Checkout (`initCheckout()`) which requires Checkout Sessions. Medusa creates PaymentIntents instead, so we switched to standard Stripe Elements:

**Before (Checkout Sessions)**:
```typescript
const checkout = await stripe.initCheckout({ fetchClientSecret })
await checkout.confirm()  // Requires cs_xxx secret
```

**After (PaymentIntent via Medusa)**:
```typescript
const { error, paymentIntent } = await stripe.confirmPayment({ elements })
// Uses pi_xxx_secret_xxx from Medusa
```

### Key Differences

| Aspect | Checkout Sessions | PaymentIntent (Medusa) |
|--------|-------------------|------------------------|
| Secret format | `cs_xxx` | `pi_xxx_secret_xxx` |
| Confirmation method | `checkout.confirm()` | `stripe.confirmPayment()` |
| Order creation | Stripe webhook | `completeCart()` call |
| Tax calculation | Stripe Tax | Medusa Tax Provider |
| Shipping | Stripe collects | Medusa + AddressElement |

---

## Security

- **PCI Compliance**: Stripe Elements handles all card data; never touches our servers
- **Webhook Verification**: Hookdeck validates webhooks before forwarding to Medusa
- **HTTPS**: All payment flows over TLS
- **API Keys**: Publishable key for frontend, secret key only on Medusa server
