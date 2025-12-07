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
# EasyPost API key (production or test)
EASYPOST_API_KEY=EZAK...

# Origin warehouse address
SHIP_FROM_NAME="OpticWorks"
SHIP_FROM_STREET1="123 Commerce St"
SHIP_FROM_CITY="Los Angeles"
SHIP_FROM_STATE="CA"
SHIP_FROM_ZIP="90001"
```

### Setting Up EasyPost

1. Create an account at [easypost.com](https://www.easypost.com)
2. Get your API key from the dashboard
3. (Optional) Add carrier accounts for production rates:
   - USPS: Automatic (included)
   - FedEx: Requires FedEx account connection

## Checkout Flow

### 1. Customer Enters Address

When the customer enters their shipping address in checkout, the storefront calls Medusa's shipping options endpoint:

```
GET /store/shipping-options?cart_id=cart_xxx
```

### 2. Medusa Calculates Prices

Medusa calls the EasyPost provider's `calculatePrice()` method for each shipping option. The provider:

1. Creates an EasyPost shipment with origin + destination addresses
2. Gets rates from EasyPost
3. Returns the calculated price in cents

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

### Labels Not Generating

1. Verify EasyPost API key is production key (not test)
2. Check carrier account is connected in EasyPost
3. Review EasyPost dashboard for transaction logs

## Related Documentation

- [Checkout Flow](./CHECKOUT_FLOW.md) - Full checkout process
- [Medusa Fulfillment Docs](https://docs.medusajs.com/resources/commerce-modules/fulfillment)
- [EasyPost API Docs](https://www.easypost.com/docs)
