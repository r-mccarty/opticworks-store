# Postmortem: EasyPost Shipment ID Not Persisting to Fulfillment

**Date**: 2025-12-09
**Severity**: Medium (workaround exists)
**Status**: Fixed (commit 6925e8c)

## Summary

When creating a fulfillment in Medusa Admin, the EasyPost provider cannot find the pre-calculated shipment and rate IDs, forcing it to create a new shipment. This results in potentially different shipping rates than what the customer selected at checkout.

## Timeline

- **22:57 UTC**: Order #35 created successfully with USPS Ground shipping
- **23:00 UTC**: Admin attempts to create fulfillment, gets 500 error
- **23:00 UTC**: Logs show `[EasyPost] createFulfillment - shipmentId: NOT FOUND, rateId: NOT FOUND`
- **23:00 UTC**: Fallback path fails with "Unable to verify address" (missing phone number)
- **23:05 UTC**: Fixed fallback by adding phone number
- **23:10 UTC**: Fulfillment creation works via fallback, but uses new rate calculation

## Root Cause

**The `calculatePrice()` method's data modifications are not persisted.**

### How Medusa v2 Fulfillment Data Flow Works

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SHIPPING METHOD CREATION                              │
│                                                                              │
│  1. validateFulfillmentData(optionData, data, context)                      │
│     └─> Returns: { easypost_address, address_validated }                    │
│     └─> STORED IN: shipping_method.data ✓                                   │
│                                                                              │
│  2. calculatePrice(optionData, data, context)                               │
│     └─> Receives: data from validateFulfillmentData                         │
│     └─> Sets: data.easypost_shipment_id, data.easypost_rate_id              │
│     └─> Returns: { calculated_amount }                                      │
│     └─> MODIFICATIONS NOT PERSISTED ✗                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ORDER COMPLETION                                      │
│                                                                              │
│  Cart → Payment → Order                                                      │
│  shipping_method.data = { easypost_address, address_validated }             │
│  (NO shipment_id or rate_id!)                                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FULFILLMENT CREATION                                  │
│                                                                              │
│  3. createFulfillment(data, items, order, fulfillment)                      │
│     └─> Receives: shipping_method.data                                      │
│     └─> Contains: { easypost_address, address_validated }                   │
│     └─> MISSING: easypost_shipment_id, easypost_rate_id                     │
│     └─> Falls back to creating new shipment                                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### The Problem

In `service.ts` line 233-236, we try to store IDs by mutating the `data` object:

```typescript
// This mutation is NOT persisted!
if (data) {
  (data as Record<string, unknown>).easypost_shipment_id = shipment.id
  (data as Record<string, unknown>).easypost_rate_id = matchingRate.id
}
```

However, `calculatePrice()` is called during cart refresh operations, and its data parameter is a copy or reference that doesn't get persisted back to `shipping_method.data`. Only the return value (`{ calculated_amount }`) is used.

### Why validateFulfillmentData's Data Persists

The `validateFulfillmentData()` method's return value IS stored in `shipping_method.data`. This is why `easypost_address` appears in `createFulfillment()` - it was returned from `validateFulfillmentData()`.

## Impact

- **User Impact**: Fulfillment creation fails without the fallback fix
- **Business Impact**: Fallback uses cheapest rate at fulfillment time, which may differ from customer-selected rate
- **Data Impact**: EasyPost shipments created during checkout are orphaned (never purchased)

## Workaround (Current)

The fallback path creates a new shipment at fulfillment time:
1. Uses order's shipping address
2. Creates new EasyPost shipment
3. Uses cheapest available rate
4. Purchases label

This works but has drawbacks:
- Rate may differ from checkout
- Original shipment/rate from checkout is abandoned
- Extra API calls to EasyPost

## Proposed Fix

Move shipment creation from `calculatePrice()` to `validateFulfillmentData()`:

```typescript
async validateFulfillmentData(
  optionData: Record<string, unknown>,
  data: Record<string, unknown>,
  context: Record<string, unknown>
): Promise<Record<string, unknown>> {
  // ... existing address validation ...

  // Create shipment and get rate during validation
  const shipment = await this.client.createShipment(...)
  const rate = this.findMatchingRate(shipment.rates, optionId)

  return {
    ...data,
    easypost_address: validation.address || address,
    address_validated: validation.success,
    easypost_shipment_id: shipment.id,        // NOW PERSISTED
    easypost_rate_id: rate?.id,               // NOW PERSISTED
  }
}
```

Then `calculatePrice()` would retrieve the rate from the pre-created shipment instead of creating a new one.

### Considerations

1. **Shipment Expiration**: EasyPost shipments/rates expire. Need to handle stale shipments.
2. **Address Changes**: If customer changes address after shipment creation, need to recreate.
3. **Cart Abandonment**: Pre-created shipments for abandoned carts are orphaned.

## Lessons Learned

1. **Read the Docs Carefully**: The [Medusa Fulfillment Provider docs](https://docs.medusajs.com/resources/references/fulfillment/provider) clearly state that `validateFulfillmentData` return value is stored, while `calculatePrice` only returns pricing.

2. **Data Flow Matters**: In Medusa v2's workflow system, understanding which method's data persists is critical.

3. **Known Framework Issues**: There are [ongoing discussions](https://github.com/medusajs/medusa/discussions/9495) about fulfillment provider behavior in v2.

## Action Items

- [x] Fix fallback path (add phone number, FedExDefault carrier)
- [x] Document the issue in postmortem
- [x] Implement proper fix: move shipment creation to `validateFulfillmentData()` (commit 6925e8c)
- [x] Update FULFILLMENT.md with correct data flow documentation
- [ ] Add shipment expiration handling (future improvement)
- [ ] Monitor for any edge cases where IDs still don't persist

## References

- [Medusa v2 Fulfillment Provider Docs](https://docs.medusajs.com/resources/references/fulfillment/provider)
- [GitHub Discussion #9495](https://github.com/medusajs/medusa/discussions/9495)
- [ShipStation Integration Guide](https://docs.medusajs.com/resources/integrations/guides/shipstation) (shows correct pattern)
