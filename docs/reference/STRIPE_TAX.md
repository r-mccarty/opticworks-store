# Stripe Tax Integration

Automated sales tax calculation and reporting via Stripe Tax API, integrated with Medusa v2's tax module.

## Overview

The integration consists of two parts:

1. **Tax Calculation**: A custom Medusa tax provider (`stripe-tax`) that calls Stripe's Tax API to calculate sales tax based on shipping address
2. **Tax Reporting**: A subscriber that commits tax transactions to Stripe when orders are placed, populating Stripe Tax reports

## Architecture

```
Checkout Flow:
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  Customer enters address                                                      │
│        ↓                                                                     │
│  Medusa Tax Module calls getTaxLines()                                       │
│        ↓                                                                     │
│  Stripe Tax Provider:                                                        │
│    • Calls stripe.tax.calculations.create()                                  │
│    • Returns tax lines with rate + encoded calculation ID                    │
│        ↓                                                                     │
│  Tax lines stored on cart → included in cart.tax_total                      │
│        ↓                                                                     │
│  Order placed → order.placed event fires                                    │
│        ↓                                                                     │
│  Commit Subscriber:                                                          │
│    • Extracts calculation ID from tax line code field                       │
│    • Calls stripe.tax.transactions.createFromCalculation()                  │
│    • Transaction recorded in Stripe Tax dashboard                           │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Files

| File | Purpose |
|------|---------|
| `backend/src/modules/stripe-tax/index.ts` | Module provider registration |
| `backend/src/modules/stripe-tax/service.ts` | ITaxProvider implementation |
| `backend/src/modules/stripe-tax/types.ts` | TypeScript interfaces |
| `backend/src/subscribers/stripe-tax-commit.ts` | Order.placed subscriber for committing transactions |
| `backend/medusa-config.ts` | Tax module configuration (lines ~150-170) |

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `STRIPE_API_KEY` | Yes | Stripe secret key (shared with payments) |
| `STRIPE_TAX_FROM_COUNTRY` | Yes | Ship-from country (e.g., `US`) |
| `STRIPE_TAX_FROM_STATE` | No | Ship-from state (e.g., `MN`) |
| `STRIPE_TAX_FROM_POSTAL` | Yes | Ship-from postal code (e.g., `55401`) |
| `STRIPE_TAX_FROM_CITY` | No | Ship-from city |
| `STRIPE_TAX_SKIP_COMMIT` | No | Set `true` to skip committing transactions (dev) |

### Medusa Config

```typescript
// backend/medusa-config.ts
{
  key: Modules.TAX,
  resolve: "@medusajs/medusa/tax",
  options: {
    providers: [
      {
        resolve: "./src/modules/stripe-tax",
        id: "stripe-tax",
        options: {
          api_key: process.env.STRIPE_API_KEY,
          from_country: process.env.STRIPE_TAX_FROM_COUNTRY,
          from_state: process.env.STRIPE_TAX_FROM_STATE,
          from_postal: process.env.STRIPE_TAX_FROM_POSTAL,
          from_city: process.env.STRIPE_TAX_FROM_CITY,
          skip_commit: process.env.STRIPE_TAX_SKIP_COMMIT === "true",
        },
      },
    ],
  },
}
```

### Tax Regions

Tax regions must be configured with the Stripe Tax provider ID. The provider ID format is `tp_stripe-tax_stripe-tax` (Medusa constructs this as `tp_{module}_{id}`).

```typescript
// In seed files
await createTaxRegionsWorkflow(container).run({
  input: [
    {
      country_code: "us",
      default_tax_rate: { rate: 0, code: "tax-us", name: "US Tax" },
      provider_id: "tp_stripe-tax_stripe-tax",  // Important!
    },
  ],
})
```

## How It Works

### Tax Calculation Flow

1. **Medusa triggers calculation**: When cart is updated with shipping address, Medusa calls `taxService.getTaxLines()`

2. **Tax Module calls provider**: Medusa's Tax Module Service:
   - Queries tax regions for the shipping country/state
   - Finds the provider ID (`tp_stripe-tax_stripe-tax`)
   - Calls our provider's `getTaxLines()` method with items and context

3. **Provider calls Stripe**: Our `StripeTaxProviderService`:
   - Builds Stripe Tax API payload with line items and addresses
   - Converts Medusa major units (dollars) to Stripe minor units (cents)
   - Calls `stripe.tax.calculations.create()` with `expand: ["line_items"]`
   - Maps Stripe response to Medusa tax lines

4. **Tax lines returned**: Each tax line includes:
   - `rate`: Percentage rate (e.g., 8.75 for California)
   - `name`: "Sales Tax"
   - `code`: `stripe-tax:taxcalc_xxx` (encodes calculation ID for commit)
   - `provider_id`: `stripe-tax`

### Separate Item and Shipping Calls

Medusa calls the tax provider **twice** - once for items, once for shipping:

```
Call 1: getTaxLines(items=[product], shipping=[], context)
  → Calculate product tax, return tax lines

Call 2: getTaxLines(items=[], shipping=[method], context)
  → Return empty array (shipping tax included in Call 1 if needed)
```

We return empty array for shipping-only calls because Stripe Tax requires at least one line item, and shipping tax should be calculated with the items.

### Tax Commit Flow

1. **Order placed**: `order.placed` event fires

2. **Subscriber queries order**: Fetches order with `items.tax_lines.code`

3. **Extract calculation IDs**: Parses `stripe-tax:taxcalc_xxx` from code field

4. **Commit to Stripe**: Calls `stripe.tax.transactions.createFromCalculation()` for each unique calculation ID

5. **Idempotency**: If transaction already exists, treats as success

## Stripe Dashboard Setup

1. Go to **Stripe Dashboard** → **Tax** → **Settings**

2. **Configure tax registrations**: Add states where you have nexus (tax collection obligation)
   - e.g., Minnesota, California, Florida

3. **Enable automatic tax calculation**: Turn on "Calculate tax automatically"

4. **Verify transactions**: After orders, check **Tax** → **Transactions** for committed transactions

## Debugging

### Log Messages

```bash
# Watch tax logs
ssh hetzner-node "tail -f /opt/opticworks/medusa-backend/logs/medusa-app.log | grep stripe-tax"
```

**Successful calculation:**
```
[stripe-tax] getTaxLines called with 1 items, 0 shipping lines, address: us/CA
[stripe-tax] Creating calculation for 1 items, 0 shipping lines
[stripe-tax] Calculation created: taxcalc_xxx, tax_amount: 3929, line_items: 1
[stripe-tax] Returning 1 tax lines: [{"id":"...","rate":8.75,"name":"Sales Tax"}]
```

**Successful commit:**
```
[stripe-tax-commit] Processing order: order_xxx
[stripe-tax-commit] Order 61: 1 items with 1 tax lines, 1 shipping methods with 0 tax lines
[stripe-tax-commit] Found 1 calculation(s) to commit for order 61
[stripe-tax-commit] Committed calculation taxcalc_xxx for order 61
[stripe-tax-commit] Order 61 complete: 1 committed, 0 already existed, 0 failed
```

### Common Issues

| Symptom | Cause | Solution |
|---------|-------|----------|
| `tax_total: 0` | Tax lines not being stored | Check if region has correct provider_id |
| `line_items: 0` in logs | Missing `expand` parameter | Fixed - must use `expand: ["line_items"]` |
| `No Stripe calculation IDs found` | Metadata dropped during normalization | Fixed - calculation ID now in `code` field |
| `Missing required param: postal_code` | Incomplete shipping address | Ensure address has postal code before tax calc |
| `Missing required param: line_items` | Shipping-only call | Fixed - return empty array for shipping-only |

### Verify Tax Region Provider

```bash
# Check tax regions via Admin API
curl -s "https://api.optic.works/admin/tax-regions" \
  -H "Authorization: Bearer $TOKEN" | jq '.tax_regions[] | {country_code, provider_id}'
```

Expected: `"provider_id": "tp_stripe-tax_stripe-tax"`

## Frontend Integration

The frontend displays tax using **Medusa cart as the single source of truth** (Dec 2024 update).

### Tax Display Flow

1. **CheckoutForm.tsx**: Shows tax in Order Summary section
   ```typescript
   // Use Medusa's authoritative values when available
   const displayTax = medusaCart?.tax_total ?? taxAmount;
   const total = medusaCart?.total ?? (subtotal + shippingCost + taxAmount);
   ```

2. **useMedusaShipping hook**: Fetches tax after shipping selection
   - Adds shipping method to cart
   - Fetches updated cart with `tax_total` calculated by Stripe Tax provider
   - Updates `taxAmount` in useCheckoutState for fallback display

### Files

| File | Purpose |
|------|---------|
| `src/components/checkout/CheckoutForm.tsx` | Displays tax in Order Summary |
| `src/hooks/useMedusaShipping.ts` | Fetches cart with tax after shipping selection |
| `src/hooks/useCheckoutState.ts` | Stores `taxAmount` for display (simplified Dec 2024) |

### Single Source of Truth (Dec 2024)

Tax values come from `medusaCart.tax_total` after shipping is selected. The
frontend no longer calculates totals - all values (subtotal, tax, shipping, total)
are sourced from the Medusa cart response which includes Stripe Tax calculations.

## Testing

### Manual Test Checklist

1. [ ] Add product to cart
2. [ ] Go to checkout
3. [ ] Enter California address (or other tax-enabled state)
4. [ ] Select shipping method
5. [ ] Verify tax shows in Order Summary
6. [ ] Complete order
7. [ ] Check backend logs for successful commit
8. [ ] Verify transaction in Stripe Tax dashboard

### Verify in Stripe Dashboard

1. Go to **Stripe Dashboard** → **Tax** → **Transactions**
2. Find transaction with order reference
3. Verify tax amount matches order

## Limitations & Future Improvements

### Current Limitations

1. **Metadata not preserved**: Medusa's tax line normalization drops custom metadata. Workaround: calculation ID encoded in `code` field.

2. **Shipping tax calculated separately**: Medusa calls provider separately for items and shipping. Shipping-only calls return empty array.

3. **No tax-inclusive pricing**: Currently only supports tax-exclusive (tax added on top).

### Future Improvements

- [ ] Add product-level tax codes (via product metadata)
- [ ] Support tax-inclusive pricing for international markets
- [ ] Add tax exemption support (via customer metadata)
- [ ] Implement tax refund workflow for returns

## Related Documentation

- [Stripe Tax API Docs](https://stripe.com/docs/tax)
- [Medusa Tax Module](https://docs.medusajs.com/resources/commerce-modules/tax)
- [SECRETS.md](../SECRETS.md) - Environment variables
- [CHECKOUT_FLOW.md](./CHECKOUT_FLOW.md) - Overall checkout flow
