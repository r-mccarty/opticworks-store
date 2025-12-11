# Stripe Tax Integration Debug Findings

## Executive Summary

The Stripe Tax provider **calculates taxes correctly** ($34.80 for a $499 item in California), but the tax lines **aren't being persisted to the cart**. As a result, `tax_total` remains 0 on orders.

## System Configuration

- **Medusa Version**: 2.12.0
- **Tax Provider ID**: `tp_stripe-tax_stripe-tax`
- **US Region**: `automatic_taxes: true`, `tax_rates: []` (empty - intentional for dynamic Stripe Tax)

## Evidence

### Backend Logs Show Tax Calculation Succeeds

```
[stripe-tax] Creating calculation for 1 items, 0 shipping lines
[stripe-tax] Calculation created: taxcalc_1ScyoW3wL1uKpRKE38KnLmki, tax_amount: 3480
```

Stripe returns `3480` cents ($34.80) for California sales tax. Our provider correctly calculates this.

### But Order #59 Shows Zero Tax

```json
{
  "display_id": 59,
  "total": 456.28,
  "tax_total": 0,
  "items": [{ "tax_total": 0, "tax_lines": [] }]
}
```

---

## Technical Flow Analysis

### 1. How Tax Calculation is Triggered

```
Cart Update → refreshCartItemsWorkflow → updateTaxLinesWorkflow →
  getItemTaxLinesStep → setTaxLinesForItemsStep
```

### 2. getItemTaxLinesStep (core-flows)

This step calls `taxService.getTaxLines()` **twice** sequentially:
1. First for line items (products)
2. Then for shipping methods

```javascript
// packages/core/core-flows/src/tax/steps/get-item-tax-lines.ts
if (items.length) {
  stepResponseData.lineItemTaxLines = await taxService.getTaxLines(
    normalizeLineItemsForTax(orderOrCart, filteredItems),
    taxContext
  );
}
if (shippingMethods.length) {
  stepResponseData.shippingMethodsTaxLines = await taxService.getTaxLines(
    normalizeLineItemsForShipping(orderOrCart, shippingMethods),
    taxContext
  );
}
```

**No try/catch** - if either call throws, the entire step fails silently.

### 3. Tax Module Service (getTaxLines)

```javascript
// packages/modules/tax/src/services/tax-module-service.ts
async getTaxLines(items, calculationContext) {
  // 1. Query for tax regions
  const regions = await this.taxRegionService_.list({...});
  const parentRegion = regions.find((r) => r.province_code === null);

  if (!parentRegion) {
    return [];  // SHORT-CIRCUIT if no region found
  }

  // 2. Query for applicable tax RATES (is_default: true or matching rules)
  const allCandidateRates = await this.taxRateService_.list({
    tax_region_id: regionIds,
    $or: [{ is_default: true }, { rules: {...} }]
  });

  // 3. Build items with their applicable rates
  const toReturn = items.map((item) => {
    const applicableRates = this.getTaxRatesForItem(item, candidateRates);
    return { rates: applicableRates, item };  // rates MAY BE EMPTY
  });

  // 4. Call provider
  return this.getTaxLinesFromProvider(parentRegion.provider_id, toReturn, context);
}
```

**Key Finding**: Since US region has `tax_rates: []` (empty), `allCandidateRates` returns nothing. Each item gets `rates: []`. Our provider receives items with empty `rates` arrays.

### 4. Our Stripe Tax Provider

Our provider handles empty rates correctly - it uses `rate_id: undefined` which is documented as optional for third-party providers:

```javascript
// backend/src/modules/stripe-tax/service.ts
taxLines.push({
  line_item_id: medusaItem.line_item.id,
  rate_id: medusaItem.rates[0]?.id ?? undefined,  // undefined is OK
  rate: stripeCalculatedRate,  // 6.97% for CA
  name: "Sales Tax",
  code: "stripe-tax",
  provider_id: "stripe-tax",
  metadata: { stripe_calculation_id: "taxcalc_xxx" }
});
```

### 5. setTaxLinesForItemsStep (Should Store Tax Lines)

```javascript
// packages/core/core-flows/src/cart/steps/set-tax-lines-for-items.ts
const itemsTaxLinesData = normalizeItemTaxLinesForCart(item_tax_lines);
await cartService.setLineItemTaxLines(cart.id, itemsTaxLinesData);
```

Normalization maps our fields correctly:
- `name` → `description`
- `rate_id` → `tax_rate_id`
- `line_item_id` → `item_id`
- `rate`, `code`, `provider_id` pass through

---

## Potential Root Causes

### Theory 1: Shipping Tax Call Failure Caused Complete Workflow Failure

**Before Fix**: The shipping-only call failed because Stripe requires `line_items`:
```
[stripe-tax] Creating calculation for 0 items, 1 shipping lines
[stripe-tax] Failed to calculate taxes: Missing required param: line_items.
```

Since `getItemTaxLinesStep` has **no error handling**, this failure may have caused the entire workflow to abort, rolling back the item tax lines that were calculated successfully.

**Status**: FIXED in commit `e74b0dd` - shipping-only calls now return zero tax without calling Stripe.

### Theory 2: Lock Contention

Logs show lock acquisition failures:
```
Failed to acquire lock for key "cart_01KC3D57X447ANP2YWDY6K4251"
```

The `updateTaxLinesWorkflow` uses locking. If locks fail, the workflow aborts.

### Theory 3: Empty Rates Array Causes Internal Issue

The Tax Module passes `rates: []` to our provider for each item (since no tax rates are configured in DB). While `rate_id: undefined` should be valid, there may be internal validation that fails silently.

### Theory 4: Transaction Rollback

Medusa uses `promiseAll` which has [known issues](https://github.com/medusajs/medusa/issues/5529) with transaction rollbacks when errors occur.

---

## Files for Expert Review

### Our Implementation

1. **Tax Provider Service**: `backend/src/modules/stripe-tax/service.ts`
   - `getTaxLines()` method returns correctly structured tax lines
   - Currency conversion (major → minor units) is correct
   - Error handling returns zero taxes on failure

2. **Provider Registration**: `backend/medusa-config.ts:150-170`

### Medusa Core Files

3. **getItemTaxLinesStep**: `@medusajs/core-flows/dist/tax/steps/get-item-tax-lines.js`
   - Lines 70-80: Sequential calls without error handling

4. **Tax Module Service**: `@medusajs/tax/dist/services/tax-module-service.js`
   - `getTaxLines()` method
   - `getTaxLinesFromProvider()` method

5. **setTaxLinesForItemsStep**: `@medusajs/core-flows/dist/cart/steps/set-tax-lines-for-items.js`
   - `normalizeItemTaxLinesForCart()` function
   - `cartService.setLineItemTaxLines()` call

---

## Recommended Debug Steps

1. **Add workflow-level logging** to trace if `setTaxLinesForItemsStep` is being reached
2. **Check database directly** for `line_item_tax_line` records after checkout
3. **Test with system provider** to isolate if issue is provider-specific or systemic
4. **Check if cart.tax_total** is computed from stored tax_lines or calculated on-the-fly

---

## Related GitHub Issues

- [Issue #9053: Tax not applied to item](https://github.com/medusajs/medusa/issues/9053) - Similar symptoms, marked "COMPLETED"
- [Issue #5529: Promise.all transaction rollback](https://github.com/medusajs/medusa/issues/5529) - Known promiseAll issues

---

## The Commit Dependency Chain

The tax commit (recording the transaction in Stripe for reporting) depends on successful persistence:

```
1. getTaxLines() → Provider calculates tax, returns lines with metadata
   ↓
2. setTaxLinesForItemsStep → Should store tax lines on cart
   ↓ (THIS IS BROKEN)
3. Cart completion → Tax lines copied to order
   ↓
4. order.placed event → Commit subscriber fires
   ↓
5. Subscriber reads tax_lines[].metadata.stripe_calculation_id
   ↓
6. stripe.tax.transactions.createFromCalculation() → Recorded in Stripe
```

**Current State**: Step 2 is failing, so steps 3-6 can't work.

### Commit Subscriber Log Analysis

```
[stripe-tax-commit] Processing order: order_01KC5GW2Q5PHVH9SZ3D1Q1387J
[stripe-tax-commit] No Stripe calculation IDs found for order 59, skipping commit
```

This confirms tax lines aren't being stored - the subscriber is correctly implemented but has no data to work with.

---

## Test After Fix

After deploying the shipping-only fix (`e74b0dd`), a test checkout should show:

### Expected Success Flow
1. **Backend logs - Calculation**: `[stripe-tax] Calculation created: taxcalc_xxx, tax_amount: 3480`
2. **Backend logs - Commit**: `[stripe-tax-commit] Order XX: 1 items with 1 tax lines, 1 shipping methods with 1 tax lines`
3. **Backend logs - Commit**: `[stripe-tax-commit] Committed calculation taxcalc_xxx for order XX`
4. **Medusa Admin**: Order shows `tax_total > 0`
5. **Stripe Dashboard**: Tax > Transactions shows the committed transaction

### If Still Broken
If logs show `0 items with 0 tax lines`, the persistence issue is in Medusa's workflow, not our provider.

---

## Quick Validation Checklist

| Check | Expected | Actual |
|-------|----------|--------|
| Tax calculated | `tax_amount: 3480` in logs | ✅ Yes |
| Shipping error | No `Missing required param` | ✅ Fixed |
| Tax lines stored | `1 items with 1 tax lines` in commit log | ❓ Pending test |
| tax_total > 0 | Order shows ~$35 tax | ❓ Pending test |
| Commit executed | `Committed calculation taxcalc_xxx` | ❓ Pending test |
| Stripe Dashboard | Transaction visible | ❓ Pending test |
