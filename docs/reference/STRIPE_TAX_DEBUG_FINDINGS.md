# Stripe Tax Integration Debug Findings

> **Status: RESOLVED** - All issues identified and fixed. See [STRIPE_TAX.md](./STRIPE_TAX.md) for implementation documentation.

## Executive Summary

The Stripe Tax integration had several bugs that prevented tax calculation from working end-to-end. All issues have been identified and resolved.

## Issues Found & Resolved

### Issue 1: Shipping-Only Tax Calls Failing ✅ FIXED

**Symptom**: Error `Missing required param: line_items` in logs

**Cause**: Medusa calls the tax provider separately for items and shipping. When called with 0 items and 1 shipping line, we were calling Stripe Tax with an empty `line_items` array, which Stripe rejects.

**Fix**: Return empty array for shipping-only calls instead of calling Stripe (commit `e74b0dd`).

### Issue 2: Line Items Not Expanded in Stripe Response ✅ FIXED

**Symptom**: `Returning 0 tax lines: []` despite successful calculation with `tax_amount: 3480`

**Cause**: The Stripe Tax API doesn't return `line_items` by default. We were checking `calculation.line_items.data` which was empty/null.

**Fix**: Added `expand: ["line_items"]` to the Stripe API call (commit `f18a6b0`).

### Issue 3: Redundant Zero-Tax Lines ✅ FIXED

**Symptom**: Two tax entries in UI - one with actual rate, one with 0%

**Cause**: Shipping-only calls were returning `"No Tax"` lines with 0% rate, which were being stored alongside the actual product tax lines.

**Fix**: Return empty array for shipping-only calls (commit `9a3075d`).

### Issue 4: Commit Subscriber Not Finding Calculation IDs ✅ FIXED

**Symptom**: `No Stripe calculation IDs found for order XX, skipping commit`

**Cause**: Medusa's tax line normalization in `setTaxLinesForItemsStep` drops the `metadata` field. Our `stripe_calculation_id` was being lost before storage.

**Fix**: Encode the calculation ID in the `code` field as `stripe-tax:taxcalc_xxx` and parse it in the commit subscriber (commit `cf03ce9`).

## Resolution Verification

After all fixes, the complete flow works:

```
[stripe-tax] getTaxLines called with 1 items, 0 shipping lines, address: us/CA
[stripe-tax] Creating calculation for 1 items, 0 shipping lines
[stripe-tax] Calculation created: taxcalc_xxx, tax_amount: 3929, line_items: 1
[stripe-tax] Returning 1 tax lines: [{"id":"...","rate":8.75,"name":"Sales Tax"}]

[stripe-tax-commit] Processing order: order_xxx
[stripe-tax-commit] Order 61: 1 items with 1 tax lines, 1 shipping methods with 0 tax lines
[stripe-tax-commit] Found 1 calculation(s) to commit for order 61
[stripe-tax-commit] Committed calculation taxcalc_xxx for order 61
```

## Commits

| Commit | Description |
|--------|-------------|
| `e74b0dd` | Fix shipping-only tax calculation, add debug logging |
| `3bda52d` | Wire up frontend tax display in checkout flow |
| `f18a6b0` | Expand line_items in Stripe Tax calculation response |
| `9a3075d` | Return empty array for shipping-only tax calls |
| `cf03ce9` | Store calculation ID in code field for commit subscriber |

## Lessons Learned

1. **Always expand Stripe API responses**: Many Stripe objects have nested data that isn't returned by default.

2. **Medusa normalizes tax lines**: The `setTaxLinesForItemsStep` transforms tax lines and drops `metadata`. Use preserved fields (like `code`) for critical data.

3. **Medusa calls providers separately**: Items and shipping are calculated in separate calls. Design providers to handle partial data.

4. **Add extensive logging**: The debug logging added during investigation was crucial for identifying root causes.

## Related Documentation

- [STRIPE_TAX.md](./STRIPE_TAX.md) - Full implementation documentation
- [STRIPE_TAX_PLAN.md](./STRIPE_TAX_PLAN.md) - Original design plan
