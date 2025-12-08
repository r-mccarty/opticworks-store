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
// 1. Create payment collection (returns existing if one exists)
const paymentCollection = await medusaFetch(
  "/store/payment-collections",
  { method: "POST", body: JSON.stringify({ cart_id: cartId }) }
)

// 2. Check for existing Stripe session (avoid duplicates)
const existingSession = paymentCollection.payment_sessions?.find(
  s => s.provider_id === "pp_stripe_stripe" && s.data?.client_secret
)
if (existingSession) {
  return existingSession.data.client_secret
}

// 3. Create new Stripe session
const session = await medusaFetch(
  `/store/payment-collections/${paymentCollection.id}/payment-sessions`,
  { method: "POST", body: JSON.stringify({ provider_id: "pp_stripe_stripe" }) }
)

// 4. Get client_secret
const clientSecret = session.payment_sessions[0].data.client_secret
```

**Important**: Medusa v2.12+ returns the existing payment collection if one already exists for the cart. Always check for an existing Stripe session before creating a new one to avoid duplicate PaymentIntents.

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

---

## Troubleshooting

### "Could not delete all payment sessions" (500 Error)

**Cause**: This error occurs when `createPaymentCollection` is called on a cart that already has a payment collection with active payment sessions. Medusa's `deletePaymentSessionsWorkflow` tries to delete existing sessions but fails if they have active Stripe PaymentIntents.

**Solution**:
1. Call `POST /store/payment-collections` with `cart_id` - Medusa returns existing collection if one exists
2. Check the returned collection for an existing Stripe session with `client_secret`
3. Only create a new payment session if none exists

**Code**: See `src/lib/api/medusa.ts` → `createMedusaPaymentSession()`

### Cart Field Selector 500 Error

**Cause**: The `?fields=*,+payment_collection.payment_sessions` query parameter on cart endpoints causes 500 errors in Medusa v2.12. This is a known issue with nested relation field selectors.

**Solution**: Don't use field selectors to fetch payment collection data. Instead, call `POST /store/payment-collections` which returns the collection with its sessions.

### "No shipping method selected" Error

**Cause**: Cart completion requires a shipping method for physical items.

**Solution**: Ensure `POST /store/carts/{id}/shipping-methods` is called with a valid shipping option ID before completing the cart.

### Empty Cart Total (0) Payment Error

**Cause**: Stripe requires a non-zero amount to create a PaymentIntent.

**Solution**: Only initialize payment sessions when `cart.total > 0`. For zero-amount orders (100% discount), use the Manual Payment Provider instead.
