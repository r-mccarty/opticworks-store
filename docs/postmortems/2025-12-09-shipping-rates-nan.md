# Postmortem: Shipping Rates Showing NaN

**Date**: 2025-12-09
**Severity**: High (checkout blocked - shipping costs not displayed)
**Duration**: Investigation + fix ~3 hours
**Author**: Claude Code

---

## Summary

After integrating the EasyPost fulfillment provider with Medusa v2, shipping rates displayed as "NaN" in the checkout UI instead of actual calculated prices (e.g., "$6.21"). The root cause was a misunderstanding of Medusa v2's two-step calculated pricing API: the frontend was expecting prices from the shipping options endpoint, but calculated pricing requires a separate API call per option.

---

## Timeline

| Time | Event |
|------|-------|
| 00:00 | User reports shipping rates showing "NaN" in checkout |
| 00:15 | Verified EasyPost provider is registered, shipping options visible |
| 00:30 | Checked database - `cart_shipping_method.amount = 0` for all entries |
| 00:45 | Backend logging added - PM2 not capturing stdout |
| 01:00 | Switched to file-based debug logging (`/tmp/easypost-debug.log`) |
| 01:15 | Confirmed `calculatePrice()` IS being called by Medusa |
| 01:30 | Discovered shipping address was empty in first test cart |
| 01:45 | Created new cart with address - EasyPost returns $6.21 correctly |
| 02:00 | Root cause identified: frontend not calling calculate endpoint |
| 02:15 | Found Medusa v2 requires `/store/shipping-options/{id}/calculate` |
| 02:30 | Added `calculateShippingOptionPrice()` to `medusa.ts` |
| 02:45 | Updated `useMedusaShipping.ts` to call calculate for each option |
| 03:00 | Backend debug logging cleaned up, deployed via Ansible |

---

## Root Cause

### The Bug: Missing Calculate Endpoint Call

Medusa v2 shipping options with `price_type: "calculated"` use a **two-step API**:

1. `GET /store/shipping-options?cart_id=xxx` - Returns available options with `calculated_price: null`
2. `POST /store/shipping-options/{option_id}/calculate` - Returns actual price from fulfillment provider

The frontend was only calling step 1 and expecting `option.amount` to contain the price:

```typescript
// useMedusaShipping.ts - THE BUG
function transformShippingOption(option: MedusaShippingOption): ShippingRate {
  return {
    // ...
    amount: option.amount,  // undefined for calculated pricing → NaN
  };
}
```

### Why This Happened

1. **API Assumption**: The initial implementation assumed `GET /store/shipping-options` would return prices for all options, similar to flat-rate shipping
2. **Medusa v2 Behavior**: For calculated pricing, Medusa deliberately returns `null` because fetching real-time rates (EasyPost API calls) for all options on every request would be expensive
3. **Documentation Gap**: The two-step flow for calculated pricing wasn't clearly documented in our codebase

---

## Debug Journey

### Challenge: Backend Logs Not Visible

PM2 was not capturing Medusa's stdout/stderr properly:

```bash
pm2 logs medusa-prod --lines 100
# No EasyPost logs visible
```

Tried multiple approaches:
- `this.logger.info()` - Not captured
- `console.log()` - Not captured

### Solution: File-Based Debug Logging

```typescript
// Temporary debug logging to file
const fs = await import("fs");
const debugLog = (msg: string) => {
  fs.appendFileSync("/tmp/easypost-debug.log", `${new Date().toISOString()} ${msg}\n`);
};
```

This revealed:
1. `calculatePrice()` WAS being called correctly
2. The shipping address passed to provider was empty for old test carts
3. With proper address, EasyPost returned correct rates: `$6.21 (621 cents)`

---

## Resolution

### Fix: Call Calculate Endpoint for Each Option

Added new function to `src/lib/api/medusa.ts`:

```typescript
export async function calculateShippingOptionPrice(
  optionId: string,
  cartId: string
): Promise<{ calculated_amount: number; is_calculated_price_tax_inclusive: boolean }> {
  const response = await medusaFetch<{
    shipping_option: {
      calculated_price: {
        calculated_amount: number;
        is_calculated_price_tax_inclusive: boolean;
      } | null;
    };
  }>(`/store/shipping-options/${optionId}/calculate`, {
    method: "POST",
    body: JSON.stringify({ cart_id: cartId }),
  });

  if (!response.shipping_option?.calculated_price) {
    throw new Error("No calculated price returned");
  }
  return response.shipping_option.calculated_price;
}
```

Updated `src/hooks/useMedusaShipping.ts`:

```typescript
const transformedRates = await Promise.all(
  options.map(async (option) => {
    if (option.price_type === 'calculated') {
      try {
        const calculated = await calculateShippingOptionPrice(option.id, cartId);
        return transformShippingOption(option, calculated.calculated_amount);
      } catch (err) {
        console.warn(`Failed to calculate price for ${option.name}:`, err);
        return transformShippingOption(option);
      }
    }
    return transformShippingOption(option);
  })
);
```

Updated price transformation to handle cents-to-dollars conversion:

```typescript
function transformShippingOption(
  option: MedusaShippingOption,
  amountInCents?: number  // New parameter
): ShippingRate {
  let amount = 0;
  if (amountInCents !== undefined) {
    amount = amountInCents / 100;  // Convert cents to dollars
  } else if (option.amount !== undefined) {
    amount = option.amount;
  }
  // ...
}
```

---

## Commits

- `d155b6b` - fix(checkout): Calculate shipping prices for EasyPost dynamic rates
- `d27ea0c` - chore(easypost): Remove debug file logging, use standard logger
- `41326a6` - docs: Document calculated pricing API flow for shipping rates

---

## Lessons Learned

1. **Medusa v2 calculated pricing is two-step** - The shipping options endpoint intentionally returns `null` prices for calculated options. Always call `/store/shipping-options/{id}/calculate` for `price_type: "calculated"` options.

2. **PM2 may not capture application logs** - When debugging Medusa issues, file-based logging (`fs.appendFileSync`) may be necessary if PM2 stdout capture fails.

3. **Test with complete data** - Initial debugging was confused by test carts with empty shipping addresses. Always verify test data is complete.

4. **Price units matter** - Backend returns cents (621), frontend displays dollars ($6.21). Conversion must happen at the right layer.

5. **Document API contracts** - The two-step calculated pricing flow should have been documented when implementing the EasyPost provider.

---

## Action Items

- [x] Fix frontend to call calculate endpoint for calculated pricing
- [x] Clean up debug logging from backend
- [x] Deploy updated backend via Ansible
- [x] Update FULFILLMENT.md with two-step API documentation
- [x] Update CHECKOUT_FLOW.md with calculate endpoint step
- [x] Create postmortem document
- [x] Configure Medusa to write logs to file via `LOG_FILE` env var (see `ecosystem.config.js`)
- [x] Add integration test for calculated shipping pricing (`e2e/tests/checkout-shipping.spec.ts`)
- [ ] Consider caching calculated prices to reduce EasyPost API calls

---

## Related Documentation

- [FULFILLMENT.md](../reference/FULFILLMENT.md) - Full fulfillment architecture
- [CHECKOUT_FLOW.md](../reference/CHECKOUT_FLOW.md) - Checkout API sequence
- [Medusa v2 Shipping Options](https://docs.medusajs.com/resources/storefront-development/checkout/shipping)
- [EasyPost API](https://www.easypost.com/docs/api)
