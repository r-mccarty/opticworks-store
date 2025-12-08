# Postmortem: Payment Session 500 Error

**Date**: 2025-12-08
**Severity**: High (checkout blocked)
**Duration**: ~2 hours investigation + fix
**Author**: Claude Code

---

## Summary

Checkout was failing with a 500 error: `"Could not delete all payment sessions"`. The root cause was a combination of two issues:
1. Using a problematic field selector on the cart endpoint
2. Incorrect handling of existing payment collections

---

## Timeline

| Time | Event |
|------|-------|
| 05:00 | User reports checkout 500 error |
| 05:15 | Initial investigation - error traced to Medusa's `deletePaymentSessionsWorkflow` |
| 05:30 | First fix attempt - add check for existing payment collection |
| 05:45 | Deployed - still failing due to field selector 500 |
| 06:00 | API testing reveals `?fields=*,+payment_collection.payment_sessions` causes 500 |
| 06:10 | Simplified fix - remove field selector, use createPaymentCollection response |
| 06:20 | Deployed and verified - E2E tests passing |

---

## Root Cause

### Issue 1: Field Selector Bug

The code attempted to fetch cart with payment collection data:

```typescript
// This causes 500 in Medusa v2.12
const response = await medusaFetch(
  `/store/carts/${cartId}?fields=*,+payment_collection.payment_sessions`
)
```

The nested field selector `+payment_collection.payment_sessions` triggers an internal error in Medusa v2.12. This is a known limitation with complex field selectors.

### Issue 2: Workflow Validation Failure

When `POST /store/payment-collections` is called with a `cart_id` that already has a payment collection with active sessions, Medusa's `deletePaymentSessionsWorkflow` attempts to delete existing sessions. The `validateDeletedPaymentSessionsStep` then compares `idsToDelete` with `idsDeleted` - if they don't match (e.g., Stripe refuses to cancel an active PaymentIntent), it throws:

```
{"type":"unexpected_state","message":"Could not delete all payment sessions"}
```

---

## Resolution

Simplified the payment session initialization flow:

```typescript
export async function createMedusaPaymentSession(cartId: string) {
  // Step 1: Create/get payment collection
  // Medusa v2 returns existing collection if one exists
  const paymentCollection = await createPaymentCollection(cartId)

  // Step 2: Check for existing Stripe session
  const existingSession = paymentCollection.payment_sessions?.find(
    s => s.provider_id === "pp_stripe_stripe" && s.data?.client_secret
  )
  if (existingSession?.data?.client_secret) {
    return { clientSecret: existingSession.data.client_secret }
  }

  // Step 3: Create new session only if needed
  const session = await createPaymentSession(paymentCollection.id, "pp_stripe_stripe")
  return { clientSecret: session.payment_sessions[0].data.client_secret }
}
```

**Key insight**: `POST /store/payment-collections` with an existing `cart_id` returns the existing collection (with its sessions) rather than creating a duplicate. This eliminates the need to query the cart with field selectors.

---

## Commits

- `aaf4889` - Initial fix attempt (still had problematic field selector)
- `58594ca` - Final fix removing field selector

---

## Lessons Learned

1. **Don't use nested field selectors** on Medusa v2 cart endpoints - they can cause 500 errors
2. **Medusa returns existing resources** - `POST /store/payment-collections` is idempotent for the same cart
3. **Always check for existing sessions** before creating new payment sessions to avoid duplicate PaymentIntents
4. **Test API calls directly** with curl before assuming the issue is in application code

---

## Action Items

- [x] Fix payment session creation flow
- [x] Update STRIPE_INTEGRATION.md with troubleshooting section
- [x] Add this postmortem for future reference
- [ ] Consider adding retry logic with exponential backoff for transient Medusa errors
- [ ] Monitor for similar field selector issues in other API calls

---

## Related Documentation

- [STRIPE_INTEGRATION.md](../reference/STRIPE_INTEGRATION.md) - Payment flow and troubleshooting
- [Medusa Checkout Payment Docs](https://docs.medusajs.com/resources/storefront-development/checkout/payment)
- [GitHub Issue #11235](https://github.com/medusajs/medusa/issues/11235) - Related payment_collection array bug
