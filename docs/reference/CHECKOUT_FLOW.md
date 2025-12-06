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
```

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
                │   └── useShippingRates hook
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
3. **Environment check** (lines 124-131):
   ```tsx
   if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
     setError('Stripe publishable key not configured.');
     return;
   }
   ```
   > **KLUDGE**: `NEXT_PUBLIC_*` variables must be inlined at BUILD time, not runtime.
   > Solution: `.env.production` file with public keys (safe to commit).

4. `initializePayment()` is called:

   a. Get or create Medusa cart via `getCartId()` / `initializeCart()`

   b. Call `createMedusaPaymentSession(cartId)`:
      - **API Call**: `POST /store/payment-collections` → Creates payment collection
      - **API Call**: `POST /store/payment-collections/{id}/payment-sessions` → Creates Stripe session
      - Returns `clientSecret` for Stripe Elements

5. Once `clientSecret` is available, render Stripe `<Elements>` provider

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

**Shipping Rates Flow**:

**File**: `src/hooks/useShippingRates.ts`

3. `useShippingRates` hook triggers when address is complete
4. **API Call**: `POST /api/shipping/rates`
   - Request body: `{ address, items, subtotal }`
   - Uses EasyPost API (or mock fallback)
   - Returns: `{ rates[], shipmentId, isDigitalOnly, freeShippingEligible }`

5. Auto-selection logic (lines 137-153):
   ```tsx
   useEffect(() => {
     if (rates.length > 0 && !selectedRate) {
       const cheapest = rates.reduce((a, b) => a.rate < b.rate ? a : b);
       setSelectedRate(cheapest);
     }
   }, [rates, selectedRate]);
   ```

> **FIXED BUG**: Previously had `selectedRate` in `fetchRates` dependencies, causing
> infinite loop when API returned errors. Fixed by separating fetch from auto-select.

### Step 5: Shipping Rate Selection & Payment Update

**File**: `src/components/checkout/CheckoutWrapper.tsx` (lines 86-121)

When shipping rate is selected (or auto-selected):

1. `handleShippingChange` callback is triggered
2. **API Call**: `POST /api/checkout/update-shipping`
   ```json
   {
     "cartId": "cart_xxx",
     "shippingRate": { "carrier": "USPS", "rate": 8.50, ... },
     "shipmentId": "shp_xxx"
   }
   ```

**Update Shipping API Flow** (`src/app/api/checkout/update-shipping/route.ts`):

3. Get available Medusa shipping options
4. Add first shipping option to cart (placeholder for fulfillment)
5. Store EasyPost details in cart metadata:
   ```typescript
   await updateCart(cartId, {
     metadata: {
       easypost_shipment_id: shipmentId,
       easypost_rate_id: shippingRate.id,
       shipping_carrier: shippingRate.carrier,
       shipping_rate: shippingRate.rate,
       // ...
     },
   });
   ```
6. Create new payment session to update Stripe Payment Intent amount
7. Return new `clientSecret` if Payment Intent was recreated

### Step 6: Payment Submission

**File**: `src/components/checkout/CheckoutForm.tsx` (lines 99-215)

When user clicks "Pay $X":

1. **Validation checks**:
   - Stripe/Elements ready
   - Email provided
   - Cart ID exists
   - Shipping selected (for physical products)

2. **Update cart with customer info**:
   ```typescript
   await updateCart(cartId, { email, shipping_address: shippingAddress });
   ```

3. **Confirm payment with Stripe**:
   ```typescript
   const { error, paymentIntent } = await stripe.confirmPayment({
     elements,
     confirmParams: {
       return_url: `${window.location.origin}/store/cart/success`,
       receipt_email: email,
     },
     redirect: 'if_required',
   });
   ```

4. **Handle payment result**:
   - If `succeeded` or `requires_capture`: Complete Medusa cart
   - If error: Display error message

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

## API Call Sequence

```
1. GET  /store/carts                    (get existing cart or create)
2. POST /store/carts/{id}/line-items    (if syncing local items)
3. POST /store/payment-collections      (create payment collection)
4. POST /store/payment-collections/{id}/payment-sessions (create Stripe session)
   └── Returns: clientSecret
5. POST /api/shipping/rates             (when address entered)
   └── Backend calls EasyPost API (or returns mock rates)
6. POST /api/checkout/update-shipping   (when shipping selected)
   ├── GET /store/shipping-options
   ├── POST /store/carts/{id}/shipping-methods
   ├── POST /store/carts/{id} (update metadata)
   └── POST /store/payment-collections/{id}/payment-sessions (refresh)
7. [Stripe] confirmPayment              (client-side)
8. POST /store/carts/{id}/complete      (finalize order)
```

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

### 2. Mock Shipping Rates Fallback

**File**: `src/app/api/shipping/rates/route.ts`

```typescript
if (!hasEasyPostKey) {
  console.log('📦 Using mock shipping rates (EASYPOST_API_KEY not configured)');
  ratesResponse = getMockShippingRates(easypostAddress);
} else {
  try {
    ratesResponse = await getShippingRates(easypostAddress, parcel, ['USPS', 'FedEx']);
  } catch (easypostError) {
    console.error('📦 EasyPost API error, falling back to mock rates:', easypostError);
    ratesResponse = getMockShippingRates(easypostAddress);
  }
}
```

**Why**: EasyPost API key not configured as Cloudflare Workers secret.
This allows checkout to work in development and tests without real shipping rates.

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

### 6. Infinite Loop Prevention in useShippingRates

**File**: `src/hooks/useShippingRates.ts`

**Previous bug**:
```typescript
// BAD: selectedRate in dependencies caused infinite loop on API errors
const fetchRates = useCallback(async () => {
  // ... if API fails, state changes, callback recreated, effect re-runs
}, [address, items, subtotal, selectedRate]);
```

**Fix**: Separate auto-selection into its own useEffect:
```typescript
// fetchRates only depends on inputs, not state it sets
const fetchRates = useCallback(async () => { ... }, [address, items, subtotal]);

// Auto-select in separate effect
useEffect(() => {
  if (rates.length > 0 && !selectedRate) {
    const cheapest = rates.reduce((a, b) => a.rate < b.rate ? a : b);
    setSelectedRate(cheapest);
  }
}, [rates, selectedRate]);
```

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
| CheckoutWrapper | `clientSecret`, `cartId`, `isLoading`, `error` | Payment session |
| CheckoutForm | `email`, `shippingAddress`, `isProcessing`, `message` | Form state |
| useShippingRates | `rates`, `selectedRate`, `shipmentId`, `isLoading` | Shipping |

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
3. **Real EasyPost integration**: Configure EASYPOST_API_KEY in production
4. **Address validation**: Show validation feedback before rate calculation
5. **Retry logic**: Exponential backoff for failed API calls
6. **Offline support**: Queue cart changes when offline
