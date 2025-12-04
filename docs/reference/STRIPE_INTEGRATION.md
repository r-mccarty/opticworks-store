# Stripe Integration

Payment flow using Medusa v2 with Stripe Elements.

---

## Payment Flow

```
Add to cart --> Medusa Cart created
                    |
Checkout --> Payment Collection created
                    |
             --> Stripe PaymentIntent created
                    |
             --> client_secret returned
                    |
             --> Stripe Elements rendered
                    |
User pays --> stripe.confirmPayment()
                    |
Success --> completeCart() --> Medusa Order
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/api/medusa.ts` | Payment collection/session API |
| `src/components/checkout/CheckoutWrapper.tsx` | Stripe Elements provider |
| `src/components/checkout/CheckoutForm.tsx` | Payment form |

---

## Creating Payment Sessions

Medusa v2 uses Payment Collections (not direct cart payment):

```typescript
// 1. Create payment collection
const paymentCollection = await medusaFetch(
  "/store/payment-collections",
  { method: "POST", body: JSON.stringify({ cart_id: cartId }) }
)

// 2. Create Stripe session
const session = await medusaFetch(
  `/store/payment-collections/${paymentCollection.id}/payment-sessions`,
  { method: "POST", body: JSON.stringify({ provider_id: "pp_stripe_stripe" }) }
)

// 3. Get client_secret
const clientSecret = session.payment_sessions[0].data.client_secret
```

---

## Stripe Elements

```tsx
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, AddressElement } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

<Elements stripe={stripePromise} options={{ clientSecret }}>
  <AddressElement options={{ mode: 'shipping', allowedCountries: ['US'] }} />
  <PaymentElement options={{ layout: 'tabs' }} />
</Elements>
```

---

## Payment Confirmation

```typescript
const { error, paymentIntent } = await stripe.confirmPayment({
  elements,
  confirmParams: {
    return_url: `${window.location.origin}/store/cart/success`,
    receipt_email: email,
  },
  redirect: 'if_required',
})

if (paymentIntent?.status === 'succeeded') {
  await completeCart(cartId)  // Creates Medusa order
}
```

---

## Test Cards

| Card | Scenario |
|------|----------|
| `4242424242424242` | Success |
| `4000000000000002` | Declined |
| `4000002500003155` | 3D Secure |

---

## Webhooks

```
Stripe --> Hookdeck --> api.optic.works/hooks/payment/stripe --> Medusa
```

Medusa handles `payment_intent.succeeded` and `payment_intent.payment_failed`.

---

## Environment Variables

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx  # Client
STRIPE_SECRET_KEY=sk_xxx                    # Backend only
STRIPE_WEBHOOK_SECRET=whsec_xxx             # Webhook verification
```
