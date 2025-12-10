# Medusa API Reference

Storefront integration with Medusa v2 backend.

---

## Configuration

**File**: `src/lib/api/medusa.ts`

### Base URL Selection

```typescript
const getBaseUrl = (): string | undefined => {
  // Server-side: use direct tunnel (bypasses Cloudflare hairpin)
  if (typeof window === 'undefined' && process.env.MEDUSA_SSR_BASE_URL) {
    return process.env.MEDUSA_SSR_BASE_URL  // medusa.optic.works
  }
  // Client-side: use public API
  return process.env.NEXT_PUBLIC_MEDUSA_BASE_URL  // api.optic.works
}
```

### Authentication

All requests include the publishable API key:

```typescript
headers: {
  'Content-Type': 'application/json',
  'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
}
```

---

## Products

### List Products

```typescript
const products = await listProducts()
// GET /store/products?fields=*variants.prices
```

Returns array of `Product` objects with prices from Medusa, merged with static product metadata (descriptions, images, specs).

### Get Product by Handle

```typescript
const product = await getProductById('bed-presence-sensor-kit')
// GET /store/products?handle=bed-presence-sensor-kit&fields=*variants.prices
```

Wrapped with React `cache()` to deduplicate SSR requests.

### Fallback Behavior

When Medusa is unavailable or disabled, returns static products from `src/lib/products.ts`.

---

## Regions

### Get Regions

```typescript
const regions = await getRegions()
// GET /store/regions
```

### Get Default Region

```typescript
const regionId = await getDefaultRegionId()
// Returns US region ID or first available
```

---

## Cart

### Create Cart

```typescript
const cart = await createCart(regionId)
// POST /store/carts
// Body: { region_id: 'reg_xxx' }
```

### Get Cart

```typescript
const cart = await getCart(cartId)
// GET /store/carts/{id}
```

### Add Line Item

```typescript
const cart = await addLineItem(cartId, variantId, quantity)
// POST /store/carts/{id}/line-items
// Body: { variant_id: 'variant_xxx', quantity: 1 }
```

### Update Line Item

```typescript
const cart = await updateLineItem(cartId, lineItemId, quantity)
// POST /store/carts/{id}/line-items/{lineItemId}
// Body: { quantity: 2 }
```

### Remove Line Item

```typescript
const cart = await removeLineItem(cartId, lineItemId)
// DELETE /store/carts/{id}/line-items/{lineItemId}
```

### Update Cart (email, addresses)

```typescript
const cart = await updateCart(cartId, {
  email: 'customer@example.com',
  shipping_address: { ... },
  customer_id: 'cus_xxx'
})
// POST /store/carts/{id}
```

---

## Shipping

### Get Shipping Options

```typescript
const options = await getShippingOptions(cartId)
// GET /store/shipping-options?cart_id={id}
```

Requires cart to have a shipping address set first.

### Add Shipping Method

```typescript
const cart = await addShippingMethod(cartId, optionId)
// POST /store/carts/{id}/shipping-methods
// Body: { option_id: 'so_xxx' }
```

---

## Payments

### Payment Collection Flow

Medusa v2 uses Payment Collections (separate from carts):

```typescript
// 1. Create payment collection
const collection = await createPaymentCollection(cartId)
// POST /store/payment-collections
// Body: { cart_id: 'cart_xxx' }

// 2. Create payment session with Stripe
const collectionWithSession = await createPaymentSession(
  collection.id,
  'pp_stripe_stripe'
)
// POST /store/payment-collections/{id}/payment-sessions
// Body: { provider_id: 'pp_stripe_stripe' }

// 3. Extract client_secret
const clientSecret = collectionWithSession.payment_sessions[0].data.client_secret
```

### Convenience Function

```typescript
const { sessionId, clientSecret, provider } = await createMedusaPaymentSession(cartId)
// Combines all steps above
```

### Complete Cart

```typescript
const { order } = await completeCart(cartId)
// POST /store/carts/{id}/complete
// Returns: { order: { id: 'order_xxx', display_id: 123 } }
```

---

## Orders

### Get Order

```typescript
const order = await getOrder(orderId)
// GET /store/orders/{id}
```

---

## Authentication

See [CUSTOMER_AUTH.md](CUSTOMER_AUTH.md) for full details.

### Register

```typescript
const { token } = await registerCustomer(email, password)
// POST /auth/customer/emailpass/register
```

### Login

```typescript
const { token } = await loginCustomer(email, password)
// POST /auth/customer/emailpass
```

### Get Current Customer

```typescript
const { customer } = await getCurrentCustomer(token)
// GET /store/customers/me
// Header: Authorization: Bearer {token}
```

### Create Customer Profile

```typescript
await createCustomerProfile(token, { email, first_name, last_name })
// POST /store/customers
// Header: Authorization: Bearer {token}
```

---

## Price Handling

Medusa v2 stores prices in **major units** (dollars), not cents.

```typescript
// Medusa returns: amount: 239 (meaning $239.00)
// No division needed - use directly
const normalizePrice = (amount?: number) => amount
```

**Exception**: Stripe always uses cents, so webhook handlers divide by 100.

---

## Type Definitions

### MedusaCart

```typescript
interface MedusaCart {
  id: string
  region_id: string
  email?: string
  customer_id?: string
  shipping_address?: MedusaAddress
  items: MedusaLineItem[]
  subtotal: number
  total: number
  tax_total: number
  shipping_total: number
}
```

### MedusaLineItem

```typescript
interface MedusaLineItem {
  id: string
  cart_id: string
  title: string
  quantity: number
  variant_id: string
  product_id: string
  unit_price: number
  subtotal: number
  total: number
}
```

### MedusaAddress

```typescript
interface MedusaAddress {
  first_name?: string
  last_name?: string
  address_1?: string
  city?: string
  province?: string
  postal_code?: string
  country_code?: string
  phone?: string
}
```

---

## Error Handling

All API functions throw on error:

```typescript
try {
  const cart = await getCart(cartId)
} catch (error) {
  // Error message includes status code and response body
  console.error('Failed to fetch cart:', error.message)
}
```

Common errors:
- `400`: Invalid request (missing required fields)
- `401`: Invalid/missing publishable key
- `404`: Resource not found
- `500`: Medusa backend error
