# Checkout Flow Documentation

This document traces the complete checkout flow from cart to order completion, including all API calls, component interactions, and known workarounds.

## High-Level Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   CartPage.tsx  │────►│CheckoutWrapper   │────►│ CheckoutForm    │
│   (Entry point) │     │(Stripe Elements) │     │ (Payment UI)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                              │                         │
                              ▼                         ▼
                        ┌───────────┐           ┌─────────────────┐
                        │  Medusa   │           │  Stripe API     │
                        │  Backend  │           │  (Payment)      │
                        └───────────┘           └─────────────────┘
                              │
                              ▼
                        ┌───────────────────────────────────────┐
                        │  EasyPost Fulfillment Provider        │
                        │  (calculatePrice → real-time rates)   │
                        └───────────────────────────────────────┘
```

## Shipping Architecture (Updated Dec 2024)

Shipping rates are calculated through **Medusa's fulfillment module** with a custom EasyPost provider:

```
Customer enters address
       │
       ▼
GET /store/shipping-options?cart_id=xxx
       │
       ▼
Medusa calls EasyPost provider's calculatePrice()
       │
       ▼
Provider creates EasyPost shipment, returns rates
       │
       ▼
Display shipping options with calculated prices
       │
       ▼
POST /store/carts/{id}/shipping-methods (add selected option)
       │
       ▼
Cart total includes shipping → Payment Intent updated
```

See `docs/reference/FULFILLMENT.md` for full fulfillment architecture details.

## Component Hierarchy

```
/store/cart (page)
└── CartPage.tsx
    ├── Cart Items Display
    ├── Order Summary Card
    └── CheckoutWrapper (shown on "Proceed to Payment")
        └── <Elements> (Stripe provider)
            └── CheckoutForm
                ├── Email Input
                ├── AddressElement (Stripe)
                ├── ShippingSelector
                │   └── Medusa shipping options API
                ├── PaymentElement (Stripe)
                ├── Order Summary
                └── Pay Button
```

---

## Step-by-Step Flow

### Step 1: Cart Page Initialization

**File**: `src/components/store/CartPage.tsx`

1. User views cart at `/store/cart`
2. `CartPage` component mounts
3. Hydration guard prevents SSR mismatch:
   ```tsx
   const [isMounted, setIsMounted] = useState(false);
   useEffect(() => setIsMounted(true), []);
   if (!isMounted) return <Loading />; // Prevents hydration error
   ```
4. Cart items loaded from Zustand store (`useCart` hook)
5. User clicks "Proceed to Payment" button

### Step 2: CheckoutWrapper Initialization

**File**: `src/components/checkout/CheckoutWrapper.tsx`

When "Proceed to Payment" is clicked:

1. `CartPage` sets `showPaymentForm = true`
2. `CheckoutWrapper` component mounts
3. **Environment check** (lines 108-115):
   ```tsx
   if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
     setError('Stripe publishable key not configured.');
     return;
   }
   ```
   > **KLUDGE**: `NEXT_PUBLIC_*` variables must be inlined at BUILD time, not runtime.
   > Solution: `.env.production` file with public keys (safe to commit).

4. `initializeCheckout()` is called:
   - Get or create Medusa cart via `getCartId()` / `initializeCart()`
   - Calculate initial cart amount (subtotal without shipping)
   - **No PaymentIntent created yet** (deferred intent pattern)

5. Render Stripe `<Elements>` provider with `mode: 'payment'` options:
   ```tsx
   const elementsOptions: StripeElementsOptions = {
     mode: 'payment',
     amount: cartSubtotal,  // in cents
     currency: 'usd',
     appearance: { ... },
   };
   ```

> **IMPORTANT**: We use Stripe's [Deferred Intent Pattern](https://docs.stripe.com/payments/accept-a-payment-deferred)
> where Elements is initialized with `mode/amount/currency` instead of `clientSecret`.
> This allows the cart total to change (e.g., shipping added) without remounting
> Elements, which would destroy form state.
>
> See `docs/postmortems/2025-12-09-checkout-form-reset.md` for the bug this solved.

### Step 3: CheckoutForm Rendering

**File**: `src/components/checkout/CheckoutForm.tsx`

The form renders in this order:
1. **Email Input** - Manual text input
2. **AddressElement** - Stripe's address autocomplete
3. **ShippingSelector** - Real-time shipping rates
4. **PaymentElement** - Stripe's payment method UI
5. **Order Summary** - Line items, subtotal, shipping, total
6. **Pay Button** - Disabled until shipping selected

### Step 4: Address Entry & Shipping Rate Calculation

**Address Flow**:

1. User fills out Stripe `AddressElement`
2. `onChange` handler extracts address fields (lines 76-92):
   ```tsx
   const handleAddressChange = (event: StripeAddressElementChangeEvent) => {
     if (event.complete && event.value?.address) {
       setShippingAddress({
         line1: addr.line1,
         city: addr.city,
         state: addr.state,
         postal_code: addr.postal_code,
         country: addr.country || 'US',
       });
     }
   };
   ```

**Shipping Rates Flow** (Medusa Fulfillment Provider):

3. When address is complete, fetch shipping options from Medusa
4. **API Call**: `GET /store/shipping-options?cart_id=xxx`
   - Medusa internally calls the EasyPost fulfillment provider
   - Provider's `calculatePrice()` creates EasyPost shipment, gets rates
   - Returns shipping options with calculated prices

5. Display options in ShippingSelector, auto-select cheapest

6. When user selects option:
   **API Call**: `POST /store/carts/{id}/shipping-methods`
   - Adds shipping method to cart
   - Cart total automatically includes shipping

> **Architecture Note**: Shipping rates are now calculated server-side through
> Medusa's fulfillment provider, not via custom storefront API routes.
> See `docs/reference/FULFILLMENT.md` for implementation details.

### Step 5: Shipping Rate Selection & Elements Update

When shipping option is selected:

1. **API Call**: `POST /store/carts/{id}/shipping-methods`
   ```json
   {
     "option_id": "so_xxx"
   }
   ```

2. Medusa automatically:
   - Adds shipping method to cart
   - Updates cart total (includes shipping)
   - The fulfillment provider's `validateFulfillmentData()` validates the address

3. **Update Elements amount** (no remount!):
   ```tsx
   // In CheckoutForm.handleSelectRate()
   if (elements) {
     const newAmount = Math.round((subtotal + rate.amount) * 100);
     elements.update({ amount: newAmount });
   }
   ```

> **IMPORTANT**: With the deferred intent pattern, we call `elements.update({amount})`
> instead of refreshing the payment session. This updates the displayed amount
> without remounting Elements, preserving form state.
>
> The PaymentIntent is created at submit time with the final amount (Step 6).

### Step 6: Payment Submission (Deferred Intent Pattern)

**File**: `src/components/checkout/CheckoutForm.tsx` (lines 112-246)

When user clicks "Pay $X":

1. **Validation checks**:
   - Stripe/Elements ready
   - Email provided
   - Cart ID exists
   - Shipping selected (for physical products)

2. **Step 1: Validate form with `elements.submit()`**:
   ```typescript
   const { error: submitError } = await elements.submit();
   if (submitError) {
     setMessage(submitError.message);
     return;
   }
   ```
   > This triggers Stripe's form validation and collects payment method details

3. **Step 2: Update cart with customer info**:
   ```typescript
   await updateCart(cartId, { email, shipping_address: shippingAddress });
   ```

4. **Step 3: Create PaymentIntent NOW** (deferred intent pattern):
   ```typescript
   // Create PaymentIntent with final amount (including shipping)
   const session = await createMedusaPaymentSession(cartId, true);
   ```
   - **API Call**: `POST /store/payment-collections` → Creates payment collection
   - **API Call**: `POST /store/payment-collections/{id}/payment-sessions` → Creates Stripe PaymentIntent
   - Returns `clientSecret` for confirmation

5. **Step 4: Confirm payment with Stripe**:
   ```typescript
   const { error, paymentIntent } = await stripe.confirmPayment({
     elements,
     clientSecret: session.clientSecret,  // Pass clientSecret here, not to Elements
     confirmParams: {
       return_url: `${window.location.origin}/store/cart/success`,
       receipt_email: email,
     },
     redirect: 'if_required',
   });
   ```

6. **Handle payment result**:
   - If `succeeded` or `requires_capture`: Complete Medusa cart
   - If error: Display error message

> **Note**: The key difference from the old pattern is that `clientSecret` is
> obtained at submit time (step 4) and passed to `confirmPayment()` (step 5),
> rather than being passed to `<Elements>` at mount time.

### Step 7: Order Completion

**File**: `src/components/checkout/CheckoutForm.tsx` (lines 180-201)

On successful payment:

1. **API Call**: `POST /store/carts/{cartId}/complete`
   - Finalizes the cart into an order in Medusa
   - Triggers order confirmation email

2. Clear local cart state
3. Call `onSuccess(orderId)` callback

**Fallback behavior** (lines 193-200):
```typescript
} catch (completeError) {
  // Payment succeeded but order creation failed
  // The order should be created by webhook, so redirect anyway
  setMessage('Payment successful! Finalizing your order...');
  setTimeout(() => {
    window.location.href = `/store/cart/success?payment_intent=${paymentIntent.id}`;
  }, 2000);
}
```
> **KLUDGE**: If Medusa cart completion fails, we still redirect to success
> because Stripe webhook should create the order. The 2-second delay gives
> time for the webhook to process.

### Step 8: Success Page

User is redirected to `/store/cart/success` with order details.

---

## API Call Sequence (Deferred Intent Pattern)

```
1. GET  /store/carts                    (get existing cart or create)
2. POST /store/carts/{id}/line-items    (if syncing local items)
   └── No PaymentIntent created yet (deferred pattern)
3. GET  /store/shipping-options?cart_id=xxx (when address entered)
   └── Medusa calls EasyPost provider's calculatePrice() for each option
4. POST /store/carts/{id}/shipping-methods (when shipping selected)
   └── Adds shipping method, updates cart total
   └── elements.update({amount}) called to update displayed amount
5. [On Submit] elements.submit()        (validate form)
6. POST /store/carts/{id}               (update with email, shipping address)
7. POST /store/payment-collections      (create payment collection)
8. POST /store/payment-collections/{id}/payment-sessions (create Stripe session)
   └── Returns: clientSecret (now with final amount including shipping)
9. [Stripe] confirmPayment(clientSecret)  (client-side)
10. POST /store/carts/{id}/complete      (finalize order)
```

> **Note**: With the deferred intent pattern, the PaymentIntent (steps 7-8) is
> created at submit time rather than at checkout initialization. This allows
> the cart total to change (shipping added) without remounting Stripe Elements.
>
> Steps 3-4 use Medusa's native shipping APIs. The EasyPost fulfillment
> provider handles rate calculation transparently.

---

## Known Kludges & Workarounds

### 1. 20-Second Pay Button Timeout (E2E Tests)

**File**: `e2e/fixtures/page-objects/checkout-page.ts`

```typescript
async submitPayment(): Promise<void> {
  await expect(this.payButton).toBeEnabled({ timeout: 20000 });
  await this.payButton.click();
}
```

**Why**: The Pay button is disabled until:
1. Stripe Elements are fully loaded
2. Shipping address is entered
3. Shipping rates are fetched from API
4. A shipping rate is selected (auto or manual)
5. Payment Intent is updated with shipping cost

This chain of async operations can take several seconds, especially with:
- Slow network/API responses
- Cold starts on serverless functions
- EasyPost rate calculation latency

**Better Solution**: Add loading states with skeleton UI, or show the pay button
but with "Calculating shipping..." indicator. The 20s timeout is a test workaround,
not a UX solution.

### 2. EasyPost Fulfillment Provider

**File**: `backend/src/modules/easypost-fulfillment/service.ts`

Shipping rates are now calculated through Medusa's fulfillment module:

```typescript
// In the EasyPost provider's calculatePrice() method:
const shipment = await this.client.createShipment(
  this.originAddress,
  toAddress,
  parcel,
  carrierConfig.carriers
)
return {
  calculated_amount: Math.round(parseFloat(matchingRate.rate) * 100),
  is_calculated_price_tax_inclusive: false,
}
```

**Why**: Moving shipping logic to the backend:
- Prevents infinite loop bugs from complex frontend state
- Enables admin visibility in Medusa dashboard
- Proper separation of concerns (fulfillment belongs in backend)
- EasyPost API key stays in backend, not exposed to Workers

See `docs/reference/FULFILLMENT.md` for full architecture.

### 3. Build-Time Environment Variables

**File**: `.env.production`

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxx
```

**Why**: `NEXT_PUBLIC_*` variables are inlined by Next.js at build time, not
available at runtime. Cloudflare Workers runtime secrets don't work for these.

**Solution**: Created `.env.production` with public keys (safe to commit).

### 4. Cart Completion Fallback

**File**: `src/components/checkout/CheckoutForm.tsx` (lines 193-200)

```typescript
} catch (completeError) {
  // Payment succeeded but order creation failed
  setMessage('Payment successful! Finalizing your order...');
  setTimeout(() => {
    window.location.href = `/store/cart/success?payment_intent=${paymentIntent.id}`;
  }, 2000);
}
```

**Why**: Medusa cart completion can fail due to network issues, but the payment
has already succeeded in Stripe. The webhook will eventually create the order.

### 5. Hydration Guard in CartPage

**File**: `src/components/store/CartPage.tsx` (lines 25-69)

```typescript
const [isMounted, setIsMounted] = useState(false);
useEffect(() => setIsMounted(true), []);
if (!isMounted) return <Loading />;
```

**Why**: Zustand cart state comes from localStorage, which differs between
server (empty) and client (populated). Without this guard, React throws a
hydration mismatch error.

### 6. Previous Infinite Loop Bug (Resolved)

The previous storefront-based shipping implementation had an infinite loop bug
where unstable React dependencies caused repeated API calls. This maxed out
Cloudflare Workers request limits.

**Resolution**: Shipping is now handled by the backend EasyPost fulfillment
provider, eliminating the complex frontend state management that caused the bug.

See the git history for commit `5a66f33` for the original fix attempt, and
the subsequent migration to Medusa fulfillment provider for the proper solution.

---

## State Management

### Zustand Stores

| Store | File | Purpose |
|-------|------|---------|
| `useCart` | `src/hooks/useCart.ts` | Cart items, quantities, Medusa cart ID |
| `useCheckoutState` | `src/hooks/useCheckoutState.ts` | Tax calculation state |
| `useAuth` | `src/hooks/useAuth.ts` | Customer authentication |

### Local Component State

| Component | State | Purpose |
|-----------|-------|---------|
| CheckoutWrapper | `cartId`, `isLoading`, `error`, `cartSubtotal` | Checkout initialization |
| CheckoutForm | `email`, `shippingAddress`, `isProcessing`, `message` | Form state |
| ShippingSelector | `shippingOptions`, `selectedOption`, `isLoading` | Shipping (from Medusa API) |

> **Note**: With the deferred intent pattern, `clientSecret` is no longer stored
> in component state. It's obtained at submit time and passed directly to
> `stripe.confirmPayment()`.

---

## Error Handling

### User-Facing Errors

| Scenario | Message | Recovery |
|----------|---------|----------|
| Empty cart | "Your cart is empty" | Link to store |
| No Stripe key | "Stripe publishable key not configured" | Retry button |
| Payment session failed | "Failed to initialize payment" | Retry button |
| Shipping rates failed | Error shown in ShippingSelector | Enter valid address |
| Card declined | Stripe error message | Try different card |
| Cart completion failed | "Payment successful! Finalizing..." | Auto-redirect |

### Logging

All checkout operations log to console with `[checkout]` prefix:
```
[checkout] initializePayment called
[checkout] Current cart ID: cart_xxx
[checkout] Creating Medusa payment session...
[checkout] Payment session result: { sessionId, provider, hasClientSecret }
[checkout] Shipping rate selected: { carrier, service, rate }
[checkout] Starting payment confirmation...
[checkout] Confirming payment with Stripe...
[checkout] Payment intent status: succeeded
[checkout] Order created: ord_xxx Display ID: 123
```

---

## Testing

### E2E Tests

**File**: `e2e/tests/checkout-flow.spec.ts`

Key test scenarios:
1. Complete checkout with test card
2. Declined card shows error
3. Debug test for initialization issues
4. **Form state preserved when changing shipping method** - Critical test added to verify the deferred intent pattern fix

> **Test Coverage Improvement**: The "form state preserved" test was added after
> discovering that the old pattern destroyed form state on shipping changes.
> It verifies that email remains filled after selecting/changing shipping methods.
>
> See `docs/postmortems/2025-12-09-checkout-form-reset.md` for details.

### Test Helpers

| Helper | File | Purpose |
|--------|------|---------|
| `CheckoutPage` | `e2e/fixtures/page-objects/checkout-page.ts` | Page object for checkout |
| `captureDebugInfo` | `e2e/helpers/debug-utils.ts` | Screenshot + logs on failure |
| `testCards` | `e2e/fixtures/test-data.ts` | Stripe test card numbers |
| `testAddress` | `e2e/fixtures/test-data.ts` | Valid US address for testing |

---

## Future Improvements

1. **Progressive disclosure**: Show email first, then address, then shipping, then payment
2. **Skeleton loading**: Replace 20s timeout with proper loading states
3. **Address validation**: Show validation feedback before rate calculation (EasyPost provider validates)
4. **Retry logic**: Exponential backoff for failed API calls
5. **Offline support**: Queue cart changes when offline
6. **Free shipping rules**: Implement price-based rules in Medusa admin for free shipping threshold
