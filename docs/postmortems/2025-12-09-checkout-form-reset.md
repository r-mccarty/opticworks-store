# Postmortem: Checkout Form Reset on Shipping Selection

**Date**: 2025-12-09
**Severity**: High (checkout blocked for many users)
**Duration**: Investigation + fix ~2 hours
**Author**: Claude Code

---

## Summary

When users selected or changed shipping methods during checkout, the entire checkout form would reset, losing all user-entered data (email, address fields). This prevented checkout completion when users interacted with shipping options after filling form fields.

---

## Timeline

| Time | Event |
|------|-------|
| 00:00 | User reports checkout form resetting during shipping selection |
| 00:15 | Console logs reviewed: "Payment session refreshed with new client secret" |
| 00:30 | Root cause identified: `key={clientSecret}` on Elements component |
| 00:45 | Investigated Stripe docs for proper pattern |
| 01:00 | Found Deferred Intent Pattern - solution confirmed |
| 01:30 | Implementation complete - CheckoutWrapper and CheckoutForm updated |
| 01:45 | E2E test added for form state preservation |
| 02:00 | Documentation and postmortem complete |

---

## Root Cause

### The Bug: `key={clientSecret}` Causes React Remount

```tsx
// CheckoutWrapper.tsx:193 - THE BUG
<Elements key={clientSecret} stripe={stripePromise} options={elementsOptions}>
  <CheckoutForm ... />
</Elements>
```

When shipping was selected:
1. `handleShippingChange()` called `createMedusaPaymentSession(cartId, true)` to refresh the PaymentIntent with the new cart total
2. A new `clientSecret` was returned from Stripe
3. The `key={clientSecret}` on `<Elements>` caused React to completely unmount and remount the entire component tree
4. All form state (email, address) was destroyed

### Why This Happened

The original implementation followed an outdated pattern where the `clientSecret` was passed upfront to Elements, and any change to the PaymentIntent (like adding shipping) required getting a new `clientSecret`. The `key` prop was likely added to "force" Elements to reinitialize with the new secret - but this had the unintended consequence of destroying all child component state.

---

## Why E2E Tests Missed This

The existing E2E tests followed this order:
1. Fill email
2. Fill address
3. Wait for shipping rates
4. **Select shipping rate**
5. Wait 2000ms
6. Fill card details
7. Submit

The bug manifests when:
1. Fill email
2. Fill address
3. Shipping rates load with auto-selection
4. **Form resets** - email is lost
5. User doesn't notice and continues with empty email

The tests explicitly selected shipping AFTER address entry and waited before filling card details, so the form was always filled after the reset occurred.

### Test Coverage Gap

The tests only verified the **end state** (checkout success) without verifying **intermediate state** (form fields remain filled after async operations).

---

## Resolution

### Solution: Stripe's Deferred Intent Pattern

Instead of passing `clientSecret` to Elements upfront, we use `mode`, `amount`, and `currency`:

```tsx
// CheckoutWrapper.tsx - FIXED
const elementsOptions: StripeElementsOptions = {
  mode: 'payment',
  amount: cartSubtotal,  // in cents
  currency: 'usd',
  appearance: { ... },
};

return (
  // NO key prop - amount changes don't remount
  <Elements stripe={stripePromise} options={elementsOptions}>
    <CheckoutForm ... />
  </Elements>
);
```

When shipping changes, we call `elements.update({amount})` instead of remounting:

```tsx
// CheckoutForm.tsx - FIXED
const handleSelectRate = useCallback(async (rate: ShippingRate) => {
  await selectRate(rate);

  // Update Elements amount without remounting
  if (elements) {
    const newAmount = Math.round((subtotal + rate.amount) * 100);
    elements.update({ amount: newAmount });
  }
}, [selectRate, elements, subtotal]);
```

The PaymentIntent is created at submit time with the final amount:

```tsx
const handleSubmit = async (event: FormEvent) => {
  // Step 1: Validate form
  const { error: submitError } = await elements.submit();

  // Step 2: Create PaymentIntent NOW (with final amount)
  const session = await createMedusaPaymentSession(cartId, true);

  // Step 3: Confirm with clientSecret
  await stripe.confirmPayment({
    elements,
    clientSecret: session.clientSecret,  // Pass here, not to Elements
    ...
  });
};
```

---

## Commits

- `[commit-hash]` - fix(checkout): Use deferred intent pattern to preserve form state

---

## Lessons Learned

1. **Don't use `key={dynamicValue}` on wrapper components** - This forces React to unmount/remount the entire tree, destroying all child state.

2. **Test intermediate states, not just outcomes** - E2E tests should verify form field preservation after async operations, not just final success.

3. **Follow Stripe's recommended patterns** - The [Deferred Intent Pattern](https://docs.stripe.com/payments/accept-a-payment-deferred) is specifically designed for cases where the amount changes before submission.

4. **Test user flows, not developer flows** - Real users may fill fields in different orders than test scripts. The tests filled form fields after shipping selection, but users fill them before.

5. **Consider auto-selection side effects** - The `useMedusaShipping` hook auto-selects the cheapest rate, which triggered the same bug on initial rates load.

---

## Action Items

- [x] Fix checkout form using Deferred Intent Pattern
- [x] Add E2E test for form state preservation during shipping changes
- [x] Create postmortem document
- [ ] Update CHECKOUT_FLOW.md documentation
- [ ] Consider adding "intermediate state" test guidelines to testing docs
- [ ] Review other components for similar `key={dynamicValue}` anti-patterns

---

## Related Documentation

- [Stripe Deferred Intent Pattern](https://docs.stripe.com/payments/accept-a-payment-deferred)
- [Stripe elements.update() API](https://docs.stripe.com/js/elements_object/update)
- [React Stripe.js Reference](https://docs.stripe.com/sdks/stripejs-react)
- [CHECKOUT_FLOW.md](../reference/CHECKOUT_FLOW.md) - Updated checkout documentation
