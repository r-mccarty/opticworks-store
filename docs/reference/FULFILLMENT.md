# Fulfillment Architecture

This document describes the shipping and fulfillment architecture for the OpticWorks store.

## Overview

Shipping rates and fulfillment are handled through Medusa's fulfillment module with a custom **EasyPost Fulfillment Provider**. This provides:

- **Dynamic shipping rate calculation** based on customer address and cart contents
- **Multi-carrier support** (USPS, FedEx) through EasyPost
- **Label generation** with tracking numbers
- **Admin visibility** in Medusa Admin dashboard

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         STOREFRONT                               │
│  Customer enters address → Medusa shipping options API          │
│  Selects shipping option → Medusa add shipping method API       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MEDUSA BACKEND                              │
│                                                                  │
│  ┌─────────────────────┐    ┌─────────────────────────────────┐ │
│  │  Fulfillment Module │───▶│  EasyPost Fulfillment Provider  │ │
│  │                     │    │                                  │ │
│  │  • Shipping Options │    │  • calculatePrice() → EasyPost  │ │
│  │  • Service Zones    │    │  • createFulfillment() → Label  │ │
│  │  • Fulfillments     │    │  • cancelFulfillment() → Void   │ │
│  └─────────────────────┘    └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        EASYPOST API                              │
│                                                                  │
│  • /shipments - Create shipments, get rates                     │
│  • /shipments/{id}/buy - Purchase labels                        │
│  • /shipments/{id}/refund - Void/refund labels                  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Components

### Backend (`backend/src/modules/easypost-fulfillment/`)

| File | Purpose |
|------|---------|
| `index.ts` | Module provider registration |
| `service.ts` | `EasyPostFulfillmentProviderService` - implements fulfillment interface |
| `client.ts` | `EasyPostClient` - fetch-based EasyPost API client |
| `types.ts` | TypeScript types for EasyPost API |

### Configuration (`backend/medusa-config.ts`)

The EasyPost provider is registered in the fulfillment module:

```typescript
{
  key: Modules.FULFILLMENT,
  resolve: "@medusajs/medusa/fulfillment",
  options: {
    providers: [
      {
        resolve: "./src/modules/easypost-fulfillment",
        id: "easypost",
        options: {
          api_key: process.env.EASYPOST_API_KEY,
          ship_from_name: process.env.SHIP_FROM_NAME,
          ship_from_street1: process.env.SHIP_FROM_STREET1,
          ship_from_city: process.env.SHIP_FROM_CITY,
          ship_from_state: process.env.SHIP_FROM_STATE,
          ship_from_zip: process.env.SHIP_FROM_ZIP,
        },
      },
    ],
  },
}
```

### Shipping Options (`backend/src/scripts/seed-us-region.ts`)

Shipping options are created with `price_type: "calculated"` to enable dynamic pricing:

| Option | Carrier | Service | Typical Delivery |
|--------|---------|---------|------------------|
| USPS Ground Advantage | USPS | GroundAdvantage | 5-7 business days |
| USPS Priority Mail | USPS | Priority | 2-3 business days |
| FedEx Ground | FedEx | FEDEX_GROUND | 3-5 business days |
| FedEx 2Day | FedEx | FEDEX_2_DAY | 2 business days |
| FedEx Standard Overnight | FedEx | FEDEX_STANDARD_OVERNIGHT | Next business day |

## Environment Variables

### Required

```bash
# EasyPost API keys
EASYPOST_API_KEY=EZAK...        # Production key (starts with EZAK)
EASYPOST_TEST_API_KEY=EZTK...   # Test key (starts with EZTK) - optional

# EasyPost mode toggle (default: "production")
# Set to "test" to use test API key for safe label testing without charges
EASYPOST_MODE=production

# Origin warehouse address
SHIP_FROM_NAME="OpticWorks"
SHIP_FROM_STREET1="123 Commerce St"
SHIP_FROM_CITY="Los Angeles"
SHIP_FROM_STATE="CA"
SHIP_FROM_ZIP="90001"
SHIP_FROM_PHONE="5551234567"  # Required for FedEx rates
```

### Test vs Production Mode

| Mode | API Key Prefix | Labels | Charges | Use Case |
|------|----------------|--------|---------|----------|
| `test` | `EZTK*` | VOID (not real) | None | Development, testing fulfillment flow |
| `production` | `EZAK*` | Real | Charged | Live orders |

To switch modes, set `EASYPOST_MODE` environment variable:
- In Infisical: Add `easypost_mode: test` or `easypost_mode: production`
- The backend logs which mode is active on startup: `[medusa-config] EasyPost mode: test (key prefix: EZTK...)`

### Setting Up EasyPost

1. Create an account at [easypost.com](https://www.easypost.com)
2. Get your API key from the dashboard
3. Carrier accounts:
   - **USPS**: Automatic (included via EasyPost Wallet)
   - **FedEx**: Use EasyPost's FedEx Wallet (pre-negotiated rates) or connect your own FedEx account

> **Note**: EasyPost's FedEx Wallet returns rates with `carrier="FedExDefault"` (not `"FedEx"`).
> The provider handles both carrier names automatically.

## Checkout Flow

### 1. Customer Enters Address

When the customer enters their shipping address in checkout, the storefront:

1. Updates the cart with the shipping address:
   ```
   POST /store/carts/cart_xxx
   { "shipping_address": { ... } }
   ```

2. Fetches available shipping options:
   ```
   GET /store/shipping-options?cart_id=cart_xxx
   ```

> **Note**: The shipping options endpoint returns options with `calculated_price: null` for
> calculated pricing. The actual prices must be fetched separately (see Step 2).

### 2. Frontend Calculates Prices (CRITICAL)

For shipping options with `price_type: "calculated"`, the storefront **must** call a separate
calculate endpoint for each option to get actual prices:

```
POST /store/shipping-options/{option_id}/calculate
{
  "cart_id": "cart_xxx"
}
```

**Response**:
```json
{
  "shipping_option": {
    "calculated_price": {
      "calculated_amount": 6.21,  // Price in DOLLARS (Medusa v2 major units)
      "is_calculated_price_tax_inclusive": false
    }
  }
}
```

This endpoint triggers the EasyPost provider's `calculatePrice()` method, which:
1. Creates an EasyPost shipment with origin + destination addresses
2. Gets real-time rates from EasyPost
3. Returns the calculated price in **dollars** (Medusa v2 uses major currency units)

> **Note**: Medusa v2 stores prices in major units (dollars), not minor units (cents).
> See: https://docs.medusajs.com/learn/introduction/from-v1-to-v2#prices-are-stored-in-major-units

> **⚠️ REGRESSION PREVENTION**: The `/store/shipping-options` endpoint does NOT return
> calculated prices for `price_type: "calculated"` options. If you see NaN or $0 prices
> in the UI, verify the frontend is calling `/store/shipping-options/{id}/calculate`
> for each calculated option.
>
> See `src/hooks/useMedusaShipping.ts` for the correct implementation.

### 3. Customer Selects Option

When the customer selects a shipping option:

```
POST /store/carts/cart_xxx/shipping-methods
{
  "option_id": "so_xxx"
}
```

### 4. Order Completion

Shipping cost is included in the cart total. When payment succeeds, the order is created with the shipping method.

### 5. Fulfillment (Admin)

When the admin creates a fulfillment in Medusa Admin:

1. Provider's `createFulfillment()` is called
2. EasyPost label is purchased
3. Tracking number and label URL are stored in fulfillment data
4. Order status updates, customer is notified

## Admin Workflow

### Viewing Shipping Information

In Medusa Admin, orders show:
- Selected shipping option
- Shipping address
- Calculated shipping cost

### Creating Fulfillments

1. Open an order in Medusa Admin
2. Click "Create Fulfillment"
3. Select items to ship
4. System purchases EasyPost label automatically
5. Tracking info is attached to the fulfillment

### Accessing Labels

Label URLs are stored in `fulfillment.data.label_url` and can be accessed from the order detail view.

## Parcel Dimensions

The provider calculates parcel dimensions from cart items:

1. Products should have `weight`, `length`, `width`, `height` metadata
2. If not present, defaults are used (8x6x4 in, 16 oz)
3. For multiple items, dimensions are combined (max length/width, summed height)

## Error Handling

### Rate Calculation Failures

If EasyPost fails to return rates:
- The shipping option shows $0 (logged as warning)
- Customer can still complete checkout
- Admin should investigate logs

### Label Purchase Failures

If label purchase fails:
- Error is thrown with EasyPost message
- Admin sees error in Medusa Admin
- Can retry or use manual fulfillment

## Development

### Testing with Mock Rates

For local development without EasyPost:
1. Use a test API key from EasyPost dashboard
2. Test addresses will return mock rates
3. Labels are not charged in test mode

### Running the Seed Script

After modifying shipping options:

```bash
cd backend
pnpm medusa exec src/scripts/seed-us-region.ts
```

Note: The script checks for existing regions and skips if already created.

## Troubleshooting

### "No shipping rates available"

1. Check EASYPOST_API_KEY is set
2. Verify address is valid (US addresses only)
3. Check EasyPost dashboard for API errors

### "Shipping options with IDs do not have a price"

1. Ensure Medusa v2.1.1+ (calculatePrice fix)
2. Verify shipping options have `price_type: "calculated"`
3. Check EasyPost provider is properly registered

### Shipping Rates Show NaN or $0

**Root Cause**: The frontend is not calling the calculate endpoint for calculated pricing options.

**Fix**: For `price_type: "calculated"` options, the storefront must call:
```
POST /store/shipping-options/{option_id}/calculate
{ "cart_id": "cart_xxx" }
```

**Verification Steps**:
1. Check browser console for `[useMedusaShipping] Calculating prices...` logs
2. Verify API calls to `/store/shipping-options/{id}/calculate` in Network tab
3. Check response contains `calculated_price.calculated_amount` (in dollars, not cents)

**Related Code**:
- `src/hooks/useMedusaShipping.ts` - Calls calculate endpoint for each option
- `src/lib/api/medusa.ts` - `calculateShippingOptionPrice()` function

### FedEx Rates Not Appearing

There are two common causes:

**Cause 1: Missing phone numbers**

FedEx requires phone numbers on both origin and destination addresses. Without phone numbers, EasyPost returns the error: `"phoneNumber: none is not an allowed value"`.

**Fix**: The EasyPost provider includes phone numbers on all addresses:
- Origin: Uses `SHIP_FROM_PHONE` env var (falls back to placeholder if not set)
- Destination: Uses customer's `shipping_address.phone` (falls back to placeholder)

**Cause 2: Carrier name mismatch**

EasyPost's FedEx Wallet returns rates with `carrier="FedExDefault"` instead of `"FedEx"`. If the carrier filter only checks for `"FedEx"`, all FedEx rates will be filtered out.

**Fix**: The provider's `CARRIER_SERVICES` config includes both `"FedEx"` and `"FedExDefault"` in the carriers array.

**Verification Steps**:
1. Check backend logs for `[EasyPost] Rates returned for fedex-*: FedExDefault/...`
2. If logs show `No rates returned by EasyPost for fedex-*`, check that phone numbers are being sent
3. If logs show USPS rates but no FedEx, verify `"FedExDefault"` is in the carriers array
4. Test directly with EasyPost API including phone on both addresses

**EasyPost Dashboard**: If you don't see API logs in the EasyPost dashboard:
- Ensure you're viewing **Production** logs (not Test)
- Check the date filter includes recent requests
- Look under "Shipments" section for created shipments

### Shipping Charged Wrong Amount (e.g., $767 instead of $7.67)

**Root Cause**: Medusa v2 stores prices in **major units (dollars)**, not minor units (cents). If the EasyPost provider returns cents, Medusa interprets it as dollars.

**Fix**: The EasyPost provider's `calculatePrice()` method must return `calculated_amount` in dollars:
```typescript
// CORRECT - Medusa v2 major units
return { calculated_amount: 7.67, ... }

// WRONG - Would charge $767.00
return { calculated_amount: 767, ... }
```

**Related**: See commit `96e3ce5` for the fix.

### Labels Not Generating

**Symptom**: Clicking "Create Fulfillment" in Medusa Admin fails or no label is generated.

**Check 1: EasyPost ID Persistence**

The provider stores `easypost_shipment_id` and `easypost_rate_id` during checkout. If these IDs don't persist to fulfillment creation, the provider falls back to creating a new shipment (which may use a different rate).

Check backend logs for:
```
[EasyPost] createFulfillment - shipmentId: NOT FOUND, rateId: NOT FOUND
[EasyPost] No pre-created shipment, creating new one for fulfillment
```

If you see this, the IDs from `calculatePrice()` aren't being persisted to the order's shipping method data.

**Check 2: API Mode**

Check logs to verify which API key is being used:
```
[medusa-config] EasyPost mode: production (key prefix: EZAK...)
```

For testing, use test mode (`EASYPOST_MODE=test`) to avoid charges.

**Check 3: EasyPost Dashboard**

1. Log into EasyPost dashboard
2. Go to Shipments section
3. Look for shipments created during checkout
4. Verify the rate was selected and can be purchased

**Debugging Steps**:
1. Create a test order through checkout
2. Check backend logs for `[EasyPost] createFulfillment` messages
3. Verify what data is passed to `createFulfillment`
4. If IDs missing, investigate Medusa's shipping_method.data persistence

## Testing Label Generation

### Prerequisites

1. Get EasyPost test API key from dashboard (starts with `EZTK`)
2. Add to Infisical: `easypost_test_api_key: EZTK...`
3. Set `easypost_mode: test` in Infisical
4. Redeploy backend

### Test Workflow

1. **Switch to test mode**:
   ```bash
   # Add to Infisical and redeploy
   easypost_mode: test
   easypost_test_api_key: EZTK...
   ```

2. **Create test order**:
   - Go through checkout with a test address
   - Complete payment (Stripe test mode)
   - Order is created

3. **Create fulfillment in Admin**:
   - Open https://api.optic.works/app
   - Find the order
   - Click "Create Fulfillment"
   - Select items to ship
   - Submit

4. **Verify label created**:
   - Check fulfillment data for `tracking_number`, `label_url`
   - Check backend logs for `[EasyPost] Label purchased: tracking=...`
   - Labels in test mode are VOID and not charged

### Test Addresses

EasyPost test mode works with any valid US address. The labels generated are marked VOID and cannot be used for actual shipping.

## Related Documentation

- [Checkout Flow](./CHECKOUT_FLOW.md) - Full checkout process
- [Medusa Fulfillment Docs](https://docs.medusajs.com/resources/commerce-modules/fulfillment)
- [EasyPost API Docs](https://www.easypost.com/docs)
