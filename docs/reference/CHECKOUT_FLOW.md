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

### Step 1: Cart Page Initialization (SSR-Enabled)

**Files**:
- `src/app/store/cart/page.tsx` (Server Component)
- `src/components/store/CartPage.tsx` (Client Component)

1. User views cart at `/store/cart`
2. **Server Component** (`page.tsx`) fetches cart via SSR:
   ```tsx
   // Server Component - fetches cart before render
   const initialCart = await getCartSSR();  // Uses cart ID from cookie
   return <CartPage initialCart={initialCart} />;
   ```
3. **Client Component** (`CartPage.tsx`) hydrates from server data:
   ```tsx
   // No more hydration guard needed - cart data from SSR
   useEffect(() => {
     if (initialCart) {
       hydrateFromServer(initialCart);  // Sync Zustand with SSR data
     }
     setIsHydrated(true);
   }, [initialCart]);
   ```
4. Cart items displayed immediately (no loading spinner)
5. User clicks "Proceed to Payment" button

> If SSR returns no cart (e.g., missing/expired cookie), the client now initializes
> a fresh Medusa cart and fetches totals before marking itself hydrated, preventing
> stale localStorage carts from rendering.

> **Architecture Note (Dec 2024)**: Cart page now uses SSR pattern. The server
> component fetches the cart using a cookie-stored cart ID, eliminating the
> previous hydration mismatch issues that required a loading guard.

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

3. When address is complete, update cart with shipping address:
   **API Call**: `POST /store/carts/{id}` with `shipping_address`

4. Fetch available shipping options:
   **API Call**: `GET /store/shipping-options?cart_id=xxx`
   - Returns shipping options, but `calculated_price: null` for calculated pricing

5. **For each option with `price_type: "calculated"`**, fetch real-time price:
   **API Call**: `POST /store/shipping-options/{option_id}/calculate`
   ```json
   { "cart_id": "cart_xxx" }
   ```
   - Medusa calls EasyPost provider's `calculatePrice()`
   - Provider creates EasyPost shipment, gets rates
   - Returns `calculated_amount` in **cents** (e.g., 621 = $6.21)

6. Display options in ShippingSelector with calculated prices, auto-select cheapest

7. When user selects option:
   **API Call**: `POST /store/carts/{id}/shipping-methods`
   - Adds shipping method to cart
   - Cart total automatically includes shipping

> **⚠️ CRITICAL**: The `/store/shipping-options` endpoint does NOT return prices for
> calculated options. You MUST call `/store/shipping-options/{id}/calculate` for each
> option to get actual prices. Skipping this step causes NaN or $0 prices in the UI.
>
> See `docs/reference/FULFILLMENT.md` for full implementation details.

### Order Summary Display (Cart Page)

- The Cart page now displays **Medusa-authoritative totals** when available (SSR cart or a fresh fetch after hydration), instead of hardcoded "Free" shipping or purely local math.
- If totals are not yet calculated (no shipping selected), the UI shows "Calculated at checkout" rather than optimistic values. This keeps presentation aligned with backend truth and prevents split-brain totals.

### Order Finalization & Polling (No More Blind Redirect)

After Stripe confirms payment:

1. `POST /store/carts/{id}/complete` is called.
2. If `completeCart` fails but payment succeeded, the frontend **polls the cart** for order creation (webhook eventual consistency).
3. If the order appears during polling, we clear cart state and redirect to success.
4. If polling exhausts without an order, we **stop and show an informative message** (no auto-redirect). Users stay on the page with instructions; support can reconcile using Stripe PI + webhook logs.

This replaces the previous 2-second blind redirect. It is safer, matches the roadmap, and avoids falsely signaling success when Medusa has not produced an order yet.

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

### Step 7: Order Completion (with Polling)

**Files**:
- `src/components/checkout/CheckoutForm.tsx`
- `src/lib/api/order-polling.ts`

On successful payment:

1. **API Call**: `POST /store/carts/{cartId}/complete`
   - Finalizes the cart into an order in Medusa
   - Triggers order confirmation email

2. Clear local cart state
3. Call `onSuccess(orderId)` callback

**Polling Fallback** (if completeCart fails but payment succeeded):
```typescript
} catch (completeError) {
  // Payment succeeded but completeCart failed
  // Poll for order creation by webhook (up to 30 seconds)
  setMessage('Payment received! Finalizing your order...');

  const pollResult = await pollForOrder(cartId, paymentIntent.id, {
    maxAttempts: 10,
    intervalMs: 3000,
    onProgress: (attempt, max) => {
      setMessage(`Finalizing your order... (${attempt}/${max})`);
    },
  });

  if (pollResult.found) {
    // Webhook created the order - redirect to success
    window.location.href = `/store/cart/success?order_id=${pollResult.orderId}`;
  } else {
    // Order still processing - inform user and redirect
    setMessage('Your order is being processed. Check email for confirmation.');
    window.location.href = `/store/cart/success?payment_intent=${paymentIntent.id}&status=pending`;
  }
}
```

> **Architecture Note (Dec 2024)**: The previous 2-second blind redirect was
> replaced with a deterministic polling mechanism. This polls the cart's
> `completed_at` field to detect when the webhook has created the order,
> providing better user feedback and reliability.

### Step 8: Success Page

User is redirected to `/store/cart/success` with order details.

---

## API Call Sequence (Deferred Intent Pattern)

```
1.  GET  /store/carts                    (get existing cart or create)
2.  POST /store/carts/{id}/line-items    (if syncing local items)
    └── No PaymentIntent created yet (deferred pattern)
3.  POST /store/carts/{id}               (update with shipping address)
4.  GET  /store/shipping-options?cart_id=xxx (fetch available options)
    └── Returns options with calculated_price: null for calculated pricing
5.  POST /store/shipping-options/{id}/calculate (for EACH calculated option)
    └── Request: { "cart_id": "cart_xxx" }
    └── Response: { calculated_price: { calculated_amount: 621 } } (cents)
    └── Medusa calls EasyPost provider's calculatePrice()
6.  POST /store/carts/{id}/shipping-methods (when shipping selected)
    └── Adds shipping method, updates cart total
    └── elements.update({amount}) called to update displayed amount
7.  [On Submit] elements.submit()        (validate form)
8.  POST /store/carts/{id}               (update with email)
9.  POST /store/payment-collections      (create payment collection)
10. POST /store/payment-collections/{id}/payment-sessions (create Stripe session)
    └── Returns: clientSecret (now with final amount including shipping)
11. [Stripe] confirmPayment(clientSecret)  (client-side)
12. POST /store/carts/{id}/complete      (finalize order)
```

> **Note**: With the deferred intent pattern, the PaymentIntent (steps 9-10) is
> created at submit time rather than at checkout initialization. This allows
> the cart total to change (shipping added) without remounting Stripe Elements.
>
> **⚠️ CRITICAL (Step 5)**: For `price_type: "calculated"` options, you MUST call
> the calculate endpoint to get actual prices. The shipping-options endpoint
> returns `calculated_price: null`. Skipping step 5 causes NaN prices in UI.

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

### 2a. Calculated Pricing Requires Separate API Call

**Files**:
- `src/hooks/useMedusaShipping.ts` - Frontend hook that fetches and calculates rates
- `src/lib/api/medusa.ts` - `calculateShippingOptionPrice()` function

**What**: For `price_type: "calculated"` shipping options, the Medusa
`/store/shipping-options` endpoint returns `calculated_price: null`. The
frontend must call a **separate endpoint** for each option to get actual prices:

```typescript
// In useMedusaShipping.ts fetchRates():
const transformedRates = await Promise.all(
  options.map(async (option) => {
    if (option.price_type === 'calculated') {
      const calculated = await calculateShippingOptionPrice(option.id, cartId);
      return transformShippingOption(option, calculated.calculated_amount);
    }
    return transformShippingOption(option);
  })
);
```

**Why**: Medusa v2's calculated pricing is a two-step process:
1. `GET /store/shipping-options` - Returns available options (prices null)
2. `POST /store/shipping-options/{id}/calculate` - Returns actual price from provider

**⚠️ Regression Risk**: Removing or breaking the calculate calls causes NaN prices.
This was fixed on 2024-12-09 after shipping rates showed NaN in the UI.
See git commit `d155b6b` for the fix implementation.

### 3. Build-Time Environment Variables

**File**: `.env.production`

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxx
```

**Why**: `NEXT_PUBLIC_*` variables are inlined by Next.js at build time, not
available at runtime. Cloudflare Workers runtime secrets don't work for these.

**Solution**: Created `.env.production` with public keys (safe to commit).

### 4. ~~Cart Completion Fallback~~ (RESOLVED - Dec 2024)

**Status**: Replaced with order polling mechanism.

The previous 2-second blind redirect has been replaced with a deterministic
polling mechanism that checks for order creation up to 30 seconds. See Step 7
above for the new implementation.

**Files**:
- `src/components/checkout/CheckoutForm.tsx` - Uses polling
- `src/lib/api/order-polling.ts` - Polling utility

### 5. ~~Hydration Guard in CartPage~~ (RESOLVED - Dec 2024)

**Status**: Replaced with SSR cart loading.

The hydration guard is no longer needed because the cart page now uses
Server-Side Rendering to fetch the cart before the client component mounts.

**Files**:
- `src/app/store/cart/page.tsx` - Server component fetches cart
- `src/lib/api/medusa-server.ts` - SSR cart fetching
- `src/lib/cart/cookies.server.ts` - Cart ID cookie (server-side)
- `src/lib/cart/cookies.ts` - Cart ID cookie (client-side)

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
| `useCart` | `src/hooks/useCart.ts` | Cart items, quantities, Medusa cart ID, SSR hydration |
| `useCheckoutState` | `src/hooks/useCheckoutState.ts` | Tax display state (simplified) |
| `useAuth` | `src/hooks/useAuth.ts` | Customer authentication |

### useCart SSR Support (Dec 2024)

The cart store now supports SSR hydration:
```typescript
// New methods added:
hydrateFromServer(cart: MedusaCart)  // Hydrate Zustand from SSR data

// Cookie sync for SSR:
setCartIdCookieClient(cartId)        // Syncs cart ID to cookie
clearCartIdCookieClient()            // Clears cart ID cookie
```

### useCheckoutState (Simplified Dec 2024)

The checkout state store was simplified to remove unused fields:
```typescript
// Current state (simplified):
interface CheckoutState {
  taxAmount: number
  isCalculatingTax: boolean
  setTaxAmount: (amount: number) => void
  setIsCalculatingTax: (calculating: boolean) => void
  reset: () => void
}

// Removed fields (never used):
// - subtotal, total (calculated from Medusa cart)
// - shippingAddress (stored in component state)
// - setSubtotal(), updateTotal() (never called)
```

### Local Component State

| Component | State | Purpose |
|-----------|-------|---------|
| CheckoutWrapper | `cartId`, `isLoading`, `error`, `cartSubtotal` | Checkout initialization |
| CheckoutForm | `email`, `shippingAddress`, `isProcessing`, `message` | Form state |
| ShippingSelector | `shippingOptions`, `selectedOption`, `isLoading` | Shipping (from Medusa API) |

> **Note**: With the deferred intent pattern, `clientSecret` is no longer stored
> in component state. It's obtained at submit time and passed directly to
> `stripe.confirmPayment()`.

### Single Source of Truth (Dec 2024)

Totals are now sourced from Medusa's authoritative values:
```typescript
// In CheckoutForm - use Medusa cart values when available
const shippingCost = medusaCart?.shipping_total ?? selectedRate?.amount ?? 0;
const displaySubtotal = medusaCart?.subtotal ?? subtotal;
const displayTax = medusaCart?.tax_total ?? taxAmount;
const total = medusaCart?.total ?? (subtotal + shippingCost + taxAmount);
```

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

## Tax Integration

Sales tax is calculated automatically via Stripe Tax when a shipping address is provided.

### Tax Flow

1. **Address entered**: Customer completes shipping address in Stripe AddressElement
2. **Shipping selected**: `addShippingMethod()` updates cart with shipping
3. **Cart fetched**: `getCart()` returns updated cart with `tax_total` (calculated by Stripe Tax provider)
4. **Tax displayed**: `taxAmount` state updated in CheckoutForm Order Summary
5. **Elements updated**: `elements.update({amount})` includes subtotal + shipping + tax
6. **Order placed**: `stripe-tax-commit` subscriber commits transaction to Stripe Tax dashboard

### Tax Display States

| State | Display | Trigger |
|-------|---------|---------|
| No address | "Enter address" | Before address entered |
| Calculating | "Calculating..." | During shipping rate fetch |
| Tax calculated | "$XX.XX" | After cart.tax_total received |
| Zero tax | "$0.00" | Tax-free state (Oregon, Delaware) |

### State Flow

```
Address complete → useMedusaShipping.fetchRates()
                   ↓
              selectRate() → addShippingMethod() → getCart()
                                                   ↓
                                            cart.tax_total
                                                   ↓
                            setTaxAmount() → CheckoutForm displays tax
                                                   ↓
                              elements.update({amount: subtotal + shipping + tax})
```

### Order Summary Verification

The Order Summary displays subtotal, shipping, tax, and total. These should satisfy:

```
total = subtotal + shipping + tax
```

Tests verify this math using `checkoutPage.verifyOrderSummaryMath()`.

### Cross-References

- [STRIPE_TAX.md](./STRIPE_TAX.md) - Backend Stripe Tax provider implementation
- [E2E_TESTING.md](./E2E_TESTING.md#tax-calculation-tests) - Tax integration E2E tests

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
