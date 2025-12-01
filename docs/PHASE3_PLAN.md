# Phase 3: Medusa E-Commerce Migration

**Status**: 📋 Planning Complete, Ready for Implementation
**Updated**: 2025-12-01
**Prerequisites**: ✅ Phase 2 Infrastructure Complete

---

## Table of Contents

1. [Overview](#overview)
2. [Scope](#scope)
3. [Architecture](#architecture)
4. [Implementation Tracks](#implementation-tracks)
5. [Success Criteria](#success-criteria)
6. [Timeline](#timeline)

---

## Overview

Phase 3 **replaces static product placeholders with full Medusa integration** for cart, checkout, orders, and customer authentication. This migration transforms the storefront from a static prototype into a production e-commerce platform backed entirely by Medusa.

### Phase 2 Delivered (Infrastructure)

✅ Hetzner backend operational at `https://api.optic.works`
✅ PostgreSQL 17 + Redis 7.x deployed
✅ Medusa v2.11.3 serving Store/Admin APIs
✅ Cloudflare Tunnel routing traffic
✅ Stripe payment provider configured in Medusa
✅ Ansible automation preventing drift

### Phase 3 Will Deliver (Medusa Migration)

🎯 **Products API enabled** (replace static products with Medusa Store API)
🎯 **Cart API integration** (replace Zustand localStorage with Medusa Cart API)
🎯 **Checkout via Medusa** (replace direct Stripe with Medusa Stripe provider)
🎯 **Orders in Medusa** (replace Supabase with Medusa Orders API)
🎯 **Webhooks to Medusa** (route Stripe webhooks to Medusa backend via Hookdeck)
🎯 **Customer authentication** (Medusa CIAM for login/register/portal)
🎯 **E2E testing** (validate complete purchase flow)

### Deferred to Phase 4

- Discord community integration
- Hugo documentation site
- CI/CD hardening
- Performance optimization
- International expansion (EU region)

---

## Scope

**IN SCOPE** (Phase 3):
- ✅ Enable existing Products API integration (fix auth header, enable flag)
- ✅ Implement Medusa Cart API (replace Zustand)
- ✅ Migrate checkout to Medusa Stripe provider
- ✅ Configure Medusa regions + payment providers
- ✅ Move webhook handlers to Medusa backend
- ✅ Basic customer authentication (login/register)
- ✅ Customer portal (order history, profile)
- ✅ E2E testing (Playwright checkout flow)

**OUT OF SCOPE** (Phase 4+):
- ❌ Discord server/bot
- ❌ Hugo docs site deployment
- ❌ Advanced CI/CD automation
- ❌ Performance optimization
- ❌ International regions (EU, CA, etc.)
- ❌ Warranty claims portal (future enhancement)
- ❌ Advanced customer features (wishlists, reviews, etc.)

---

## Architecture

### Current Architecture (Phase 2)

```
┌──────────────┐
│  Storefront  │
└──────┬───────┘
       │
       ├─→ Static Products (src/lib/products.ts) ← REPLACE
       │
       ├─→ Zustand Cart (localStorage) ← REPLACE
       │
       ├─→ Stripe API (direct) ← REPLACE
       │   └─ Checkout Sessions
       │
       └─→ Stripe Webhooks → Storefront → Supabase ← REPLACE
```

**Issues:**
- Products hardcoded in JavaScript
- Cart state client-only (single device)
- Checkout bypasses Medusa
- Orders stored in Supabase instead of Medusa
- Webhooks handled in wrong location

---

### Target Architecture (Phase 3)

```
┌──────────────┐
│  Storefront  │
└──────┬───────┘
       │
       ├─→ Medusa Store API
       │   └─ GET /store/products
       │
       ├─→ Medusa Cart API
       │   ├─ POST /store/carts
       │   ├─ POST /store/carts/{id}/line-items
       │   └─ GET /store/carts/{id}
       │
       ├─→ Medusa Checkout
       │   └─ POST /store/carts/{id}/payment-sessions
       │       └─ Medusa Stripe Provider
       │           └─ Stripe API
       │
       └─→ Medusa Customer API
           ├─ POST /store/auth (login)
           ├─ POST /store/auth/customer (register)
           └─ GET /store/customers/me/orders

┌─────────────────┐
│ Stripe Webhooks │
└────────┬────────┘
         │
         ├─→ Hookdeck (gateway)
         │   └─ Buffer, retry, log
         │
         └─→ Medusa Backend
             └─ /webhooks/stripe
                 └─ Process checkout.session.completed
                     └─ Create order in Medusa PostgreSQL
```

**Benefits:**
- ✅ Single source of truth (Medusa)
- ✅ Multi-device cart sync (Redis sessions)
- ✅ Order history available via API
- ✅ Customer authentication built-in
- ✅ Production-ready webhook infrastructure
- ✅ Inventory management via Medusa Admin

---

## Implementation Tracks

### Track 1: Backend Configuration (BLOCKER)

**Duration**: 1-2 hours
**Dependencies**: None (start immediately)

#### 1.1 Configure Medusa Regions

**Task**: Create geographic regions for cart/checkout functionality.

**Actions**:
- [ ] Access Admin dashboard: `https://api.optic.works/app`
- [ ] Navigate to Settings → Regions
- [ ] Create **US Region**:
  - Name: "United States"
  - Currency: USD
  - Countries: United States
  - Tax provider: Default (manual rates)
  - Payment providers: Stripe (assign after creation)
  - Fulfillment providers: Manual
- [ ] Configure tax rates (optional):
  - US sales tax: 0% (can add state-specific later)

**Validation**:
```bash
curl -H "x-publishable-api-key: $PUBKEY" \
  https://api.optic.works/store/regions | jq '.regions'
# Expected: Array with at least 1 region
```

**Files**: None (admin dashboard only)

**Why This Blocks Everything**: Cart creation requires `region_id` parameter. No regions = no carts = no checkout.

---

#### 1.2 Assign Stripe Payment Provider to Region

**Task**: Link Stripe payment provider to US region.

**Actions**:
- [ ] In Medusa Admin, edit US region
- [ ] Add payment provider: Select "Stripe" from dropdown
- [ ] Save region configuration

**Validation**:
```bash
curl -H "x-publishable-api-key: $PUBKEY" \
  https://api.optic.works/store/regions/<region-id> \
  | jq '.region.payment_providers'
# Expected: [{"id": "stripe", ...}]
```

**Files**: None (admin dashboard only)

---

#### 1.3 Configure Shipping Options (Optional)

**Task**: Set up basic shipping for checkout.

**Actions**:
- [ ] Create shipping profiles:
  - **Standard Shipping**: $9.99 flat rate
  - **Free Shipping**: $0.00 (orders > $100 threshold)
- [ ] Assign shipping profiles to US region
- [ ] Assign products to shipping profiles

**Validation**:
```bash
curl -H "x-publishable-api-key: $PUBKEY" \
  https://api.optic.works/store/shipping-options \
  | jq '.shipping_options | length'
# Expected: 1 or more
```

**Files**: None (admin dashboard only)

**Note**: Can start with manual fulfillment and add shipping calculations later.

---

#### 1.4 Configure Notification Module (Resend)

**Task**: Add email notification module for order confirmations and customer communications.

**Priority**: 🔴 CRITICAL - Required for Track 4.3 (Order Completion)

**Actions**:
- [ ] Install Resend notification provider:
  ```bash
  cd services/medusa
  pnpm add @medusajs/medusa-notification-resend
  ```
- [ ] Update `services/medusa/medusa-config.ts`:
  ```typescript
  // Add after File module configuration (line 70)
  modulesConfig.push({
    key: Modules.NOTIFICATION,
    options: {
      providers: [
        {
          id: "resend",
          resolve: "@medusajs/medusa-notification-resend",
          options: {
            api_key: ensure("RESEND_API_KEY"),
            from: process.env.FROM_EMAIL ?? "orders@optic.works"
          }
        }
      ]
    }
  })
  ```
- [ ] Add `FROM_EMAIL` to Infisical (if not already present):
  - Variable: `FROM_EMAIL`
  - Value: `orders@optic.works`
- [ ] Verify Resend domain at https://resend.com/domains
  - Ensure `optic.works` domain is verified
  - Or use Resend sandbox for testing
- [ ] Deploy configuration:
  ```bash
  cd infrastructure/ansible
  bash scripts/generate-secrets-from-infisical.sh
  ansible-playbook playbooks/medusa-deploy.yml
  ```

**Validation**:
```bash
ssh hetzner-node
pm2 logs medusa-dev | grep notification
# Expected: "Notification module loaded: resend"

# Test email sending (after Track 4.3)
# Complete test order and verify email delivery in Resend dashboard
```

**Files**:
- `services/medusa/medusa-config.ts` (add notification module)
- `services/medusa/package.json` (new dependency)

**Email Templates Needed**:
- Order confirmation (`order.placed` event)
- Customer registration (`customer.created` event)
- Password reset (handled by Medusa auth)

**Note**: This is a **BLOCKER** for Track 4.3. Order completion requires email confirmations.

---

#### 1.5 Configure Cache Module (Redis)

**Task**: Add Redis cache module for API performance optimization.

**Priority**: 🟢 RECOMMENDED - Performance enhancement (not blocking)

**Actions**:
- [ ] Update `services/medusa/medusa-config.ts`:
  ```typescript
  // Add after Notification module configuration
  modulesConfig.push({
    key: Modules.CACHE,
    resolve: "@medusajs/medusa/cache-redis",
    options: {
      redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
      ttl: 300, // 5 minutes default TTL
      namespace: "medusa-cache"
    }
  })
  ```
- [ ] Deploy configuration (same Ansible playbook as Track 1.4)

**Validation**:
```bash
ssh hetzner-node
pm2 logs medusa-dev | grep cache
# Expected: "Cache module loaded: redis"

# Check Redis for cache keys
redis-cli KEYS "medusa-cache:*"
# Expected: Keys created on first API requests
```

**Files**:
- `services/medusa/medusa-config.ts` (add cache module)

**Benefits**:
- Faster product catalog API responses
- Reduced PostgreSQL query load
- Improved checkout performance under load

**Note**: Leverages existing Redis infrastructure (no new deployment needed). Zero risk, quick win.

---

### Track 2: Products API Integration

**Duration**: 1-2 hours
**Dependencies**: Track 1.1 complete

#### 2.1 Fix Products API Authentication

**Task**: Fix auth header bug per RFD-007.

**Issue**: Code uses wrong env var and wrong header format.

**Current Code** (`src/lib/api/medusa.ts:18, 119`):
```typescript
// WRONG
const medusaApiToken = readEnv("MEDUSA_API_TOKEN")  // ← Wrong env var
headers: { 'Authorization': `Bearer ${medusaApiToken}` }  // ← Wrong header
```

**Fixed Code**:
```typescript
// CORRECT
const medusaPublishableKey = readEnv("MEDUSA_PUBLISHABLE_KEY")  // ← Correct var
headers: { 'x-publishable-api-key': medusaPublishableKey }  // ← Correct header
```

**Actions**:
- [ ] Update `src/lib/api/medusa.ts`:
  - Line 18: Change `MEDUSA_API_TOKEN` → `MEDUSA_PUBLISHABLE_KEY`
  - Line 22: Add `medusaPublishableKey` to `medusaEnv` interface
  - Line 119: Change `Authorization: Bearer` → `x-publishable-api-key`
- [ ] Remove `MEDUSA_API_TOKEN` from type definitions

**Files**:
- `src/lib/api/medusa.ts` (lines 18, 22, 119)

**Validation**:
```bash
# Test products endpoint
curl -H "x-publishable-api-key: $PUBKEY" \
  https://api.optic.works/store/products | jq '.products | length'
# Expected: 7 (or number of products in catalog)
```

---

#### 2.2 Enable Medusa Products Mode

**Task**: Enable Medusa integration in environment config.

**Actions**:
- [ ] Update Infisical environment variables:
  - `NEXT_PUBLIC_MEDUSA_ENABLED=true`
  - `NEXT_PUBLIC_MEDUSA_BASE_URL=https://api.optic.works`
  - `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxx` (get from Admin → API Keys)
- [ ] Pull secrets: `pnpm run secrets:pull`
- [ ] Rebuild storefront: `pnpm run build`
- [ ] Restart dev server: `pnpm run dev`

**Validation**:
- [ ] Visit `http://localhost:3000/store`
- [ ] Open browser console
- [ ] Look for `[medusa]` log messages indicating API calls
- [ ] Verify products load from Medusa (check Network tab)

**Files**:
- `.env.local` (updated via Infisical)

---

#### 2.3 Verify Product Data Completeness

**Task**: Ensure all 7 products have required metadata.

**Actions**:
- [ ] Run catalog verification script:
  ```bash
  cd services/medusa
  pnpm exec tsx scripts/verify-catalog.ts --full
  ```
- [ ] Fix any missing fields:
  - Product handle (URL slug)
  - At least 1 variant per product
  - USD price on each variant
  - Inventory levels

**Validation**: Script should report all products valid.

**Files**:
- `services/medusa/scripts/verify-catalog.ts` (already exists)

---

### Track 3: Cart API Integration

**Duration**: 6-8 hours
**Dependencies**: Track 1.1 complete (regions exist)

#### 3.1 Add Medusa Cart API Functions

**Task**: Implement cart API functions in `src/lib/api/medusa.ts`.

**New Functions**:
```typescript
// Create new cart with region
export async function createCart(regionId: string): Promise<{ id: string }> {
  const response = await medusaFetch<{ cart: { id: string } }>(
    "/store/carts",
    { method: "POST", body: JSON.stringify({ region_id: regionId }) }
  )
  return response.cart
}

// Add item to cart
export async function addLineItem(
  cartId: string,
  variantId: string,
  quantity: number
): Promise<Cart> {
  const response = await medusaFetch<{ cart: Cart }>(
    `/store/carts/${cartId}/line-items`,
    { method: "POST", body: JSON.stringify({ variant_id: variantId, quantity }) }
  )
  return response.cart
}

// Update line item quantity
export async function updateLineItem(
  cartId: string,
  lineItemId: string,
  quantity: number
): Promise<Cart> {
  const response = await medusaFetch<{ cart: Cart }>(
    `/store/carts/${cartId}/line-items/${lineItemId}`,
    { method: "POST", body: JSON.stringify({ quantity }) }
  )
  return response.cart
}

// Remove line item
export async function removeLineItem(
  cartId: string,
  lineItemId: string
): Promise<Cart> {
  const response = await medusaFetch<{ cart: Cart }>(
    `/store/carts/${cartId}/line-items/${lineItemId}`,
    { method: "DELETE" }
  )
  return response.cart
}

// Retrieve cart
export async function getCart(cartId: string): Promise<Cart> {
  const response = await medusaFetch<{ cart: Cart }>(`/store/carts/${cartId}`)
  return response.cart
}
```

**Actions**:
- [ ] Define `Cart` TypeScript interface (based on Medusa response)
- [ ] Add above functions to `src/lib/api/medusa.ts`
- [ ] Add error handling for 404 (cart not found)

**Files**:
- `src/lib/api/medusa.ts` (new functions)

**Validation**: Unit tests (optional) or manual testing with curl.

---

#### 3.2 Update useCart to Hybrid Approach

**Task**: Migrate `src/hooks/useCart.ts` to use Medusa Cart API with optimistic updates.

**Strategy**: Hybrid approach (STATE_MANAGEMENT.md:14-24)
- Zustand for instant UI updates (optimistic)
- Medusa API for persistence (server-side sessions)
- localStorage for cart ID persistence
- Logged-in customers sync cart server-side for cross-device continuity

**Updated Store**:
```typescript
interface CartStore {
  // State
  cartId: string | null
  items: CartItem[]
  region: string | null

  // Actions
  initializeCart: () => Promise<void>
  addToCart: (product: Product) => Promise<void>
  updateQuantity: (lineItemId: string, quantity: number) => Promise<void>
  removeFromCart: (lineItemId: string) => Promise<void>
  clearCart: () => Promise<void>
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      cartId: null,
      items: [],
      region: null,

      initializeCart: async () => {
        const { cartId } = get()

        // Try to restore cart from server
        if (cartId) {
          try {
            const cart = await getCart(cartId)
            set({ items: cart.items, region: cart.region_id })
            return
          } catch (error) {
            console.warn('[cart] Failed to restore cart, creating new one')
          }
        }

        // Create new cart
        const newCart = await createCart(DEFAULT_REGION_ID)
        set({ cartId: newCart.id, items: [], region: DEFAULT_REGION_ID })
      },

      addToCart: async (product) => {
        const { cartId, items } = get()

        // Optimistic update (instant UI)
        set({ items: [...items, { product, quantity: 1 }] })

        try {
          // Ensure cart exists
          if (!cartId) {
            await get().initializeCart()
          }

          // Add to Medusa cart
          const cart = await addLineItem(
            get().cartId!,
            product.variants[0].id,
            1
          )

          // Sync server response
          set({ items: cart.items })
        } catch (error) {
          console.error('[cart] Failed to add item:', error)
          // Revert optimistic update
          set({ items })
        }
      },

      // Similar for updateQuantity, removeFromCart, clearCart
    }),
    { name: 'cart-storage', partialize: (state) => ({ cartId: state.cartId }) }
  )
)
```

**Actions**:
- [ ] Refactor `useCart` to above structure
- [ ] Add `DEFAULT_REGION_ID` constant (get from env or hardcode US region ID)
- [ ] Implement optimistic updates with rollback on error
- [ ] Persist only `cartId` to localStorage (not full items array)

**Files**:
- `src/hooks/useCart.ts` (major refactor)

**Validation**:
- [ ] Can add item to cart (persists in Medusa)
- [ ] Cart survives page reload (hydrates from Medusa)
- [ ] Can update quantity
- [ ] Can remove item
- [ ] Optimistic updates feel instant

---

#### 3.3 Update Cart UI Components

**Task**: Update cart components to use new cart structure.

**Components to Update**:
- `src/components/store/ProductGrid.tsx` - Use `addToCart` with Product object
- `src/components/store/CartPage.tsx` - Display cart items with line_item IDs
- `src/components/ui/AddToCartButton.tsx` - Handle async addToCart

**Key Changes**:
- Cart items now have `line_item.id` (Medusa ID) instead of just `product.id`
- Need to pass `line_item.id` to `updateQuantity` and `removeFromCart`
- Handle loading states for async operations

**Actions**:
- [ ] Update `ProductGrid` to use new `addToCart`
- [ ] Update `CartPage` to use `line_item.id` for operations
- [ ] Add loading spinners for cart operations
- [ ] Handle error states (item out of stock, cart expired, etc.)
- [ ] After customer login/registration, attach cart to Medusa customer (update cart with `customer_id` + `email`)
- [ ] Persist cart ID to customer metadata so new devices can restore server cart on login
- [ ] On login, if no local cart exists, fetch cart ID from customer metadata and hydrate from Medusa

**Files**:
- `src/components/store/ProductGrid.tsx`
- `src/components/store/CartPage.tsx`
- `src/components/ui/AddToCartButton.tsx`

**Validation**:
- [ ] Can add product from store page
- [ ] Cart page displays correctly
- [ ] Can update quantities from cart page
- [ ] Loading states appear during operations

---

### Track 4: Checkout Flow Migration

**Duration**: 4-6 hours
**Dependencies**: Track 3 complete (cart working)

#### 4.1 Implement Medusa Payment Session Creation

**Task**: Replace direct Stripe integration with Medusa payment sessions.

**Current Flow** (`src/lib/api/medusa.ts:180-229`):
```typescript
// INCOMPLETE - falls back to direct Stripe
export async function createPaymentSession(items: CheckoutLineItem[]) {
  // TODO: Implement properly
  return { sessionId, clientSecret, provider: "stripe" }
}
```

**New Implementation**:
```typescript
export async function createPaymentSession(cartId: string): Promise<PaymentSessionResult> {
  try {
    // 1. Initialize payment sessions on cart
    const initResponse = await medusaFetch<{ cart: Cart }>(
      `/store/carts/${cartId}/payment-sessions`,
      { method: "POST" }
    )

    // 2. Select Stripe payment provider
    const selectResponse = await medusaFetch<{ cart: Cart }>(
      `/store/carts/${cartId}/payment-session`,
      {
        method: "POST",
        body: JSON.stringify({ provider_id: "stripe" })
      }
    )

    // 3. Extract client_secret from Stripe session
    const stripeSession = selectResponse.cart.payment_session

    return {
      sessionId: stripeSession.id,
      clientSecret: stripeSession.data.client_secret,  // Stripe PaymentIntent client_secret
      provider: "medusa-stripe",
    }
  } catch (error) {
    console.error('[medusa] Payment session creation failed:', error)
    throw error
  }
}
```

**Actions**:
- [ ] Replace stub in `src/lib/api/medusa.ts` with above implementation
- [ ] Remove fallback to direct Stripe (force Medusa path)
- [ ] Add proper error handling

**Files**:
- `src/lib/api/medusa.ts` (lines 180-229 replacement)

**Validation**:
```bash
# Test payment session creation
curl -X POST -H "x-publishable-api-key: $PUBKEY" \
  https://api.optic.works/store/carts/{cartId}/payment-sessions | jq
# Expected: cart with payment_session array
```

---

#### 4.2 Update CheckoutWrapper Component

**Task**: Refactor checkout to use Medusa payment sessions.

**Current Flow** (`src/components/checkout/CheckoutWrapper.tsx`):
```typescript
// Calls /api/stripe/create-checkout-session (direct Stripe)
const { clientSecret } = await fetch("/api/stripe/create-checkout-session", {...})
```

**New Flow**:
```typescript
// Use Medusa payment session
import { createPaymentSession } from '@/lib/api/medusa'

const { cartId } = useCart()
const { clientSecret } = await createPaymentSession(cartId!)
```

**Actions**:
- [ ] Update `CheckoutWrapper` to call `createPaymentSession` instead of fetch
- [ ] Pass `cartId` from `useCart` instead of items array
- [ ] Update Stripe Elements to use PaymentIntent client_secret (not Checkout Session)
- [ ] Handle payment confirmation via Stripe confirmPayment API

**Files**:
- `src/components/checkout/CheckoutWrapper.tsx`
- `src/components/checkout/CheckoutForm.tsx` (Stripe Elements integration)

**Note**: Medusa Stripe provider uses **Payment Intents API**, not Checkout Sessions API. Need to update Stripe Elements integration accordingly.

**Validation**:
- [ ] Checkout page loads without errors
- [ ] Stripe Elements render correctly
- [ ] Payment form accepts test card (4242 4242 4242 4242)

---

#### 4.3 Complete Order on Payment Success

**Task**: Complete Medusa order after successful payment.

**Flow**:
1. Customer submits payment via Stripe Elements
2. Stripe confirms PaymentIntent
3. Frontend calls Medusa to complete order
4. Medusa creates order record
5. Redirect to order confirmation

**New Function**:
```typescript
export async function completeCart(cartId: string): Promise<Order> {
  const response = await medusaFetch<{ order: Order }>(
    `/store/carts/${cartId}/complete`,
    { method: "POST" }
  )
  return response.order
}
```

**Integration**:
```typescript
// In CheckoutForm after confirmPayment success
const order = await completeCart(cartId)
router.push(`/orders/${order.id}/confirmation`)
```

**Actions**:
- [ ] Add `completeCart` function to `src/lib/api/medusa.ts`
- [ ] Update `CheckoutForm` to call `completeCart` after payment confirmation
- [ ] Create order confirmation page at `/orders/[id]/confirmation`

**Files**:
- `src/lib/api/medusa.ts` (new function)
- `src/components/checkout/CheckoutForm.tsx` (update payment success handler)
- `src/app/orders/[id]/confirmation/page.tsx` (new page)

**Validation**:
- [ ] Can complete checkout with test card
- [ ] Order created in Medusa (visible in Admin dashboard)
- [ ] Redirects to confirmation page
- [ ] Confirmation page displays order details

---

### Track 5: Webhook Migration

**Duration**: 2-3 hours
**Dependencies**: Track 4 complete (checkout working)

#### 5.1 Configure Hookdeck

**Task**: Set up Hookdeck as webhook gateway.

**Actions**:
- [ ] Create Hookdeck account: https://hookdeck.com
- [ ] Create connection:
  - **Source**: Stripe
  - **Destination**: `https://api.optic.works/webhooks/stripe`
  - **Transformations**: None (pass-through)
  - **Retry policy**: Exponential backoff, 3 retries
- [ ] Configure webhook events:
  - `payment_intent.succeeded` (Medusa uses Payment Intents, not Checkout Sessions)
  - `payment_intent.payment_failed`
  - `charge.refunded` (optional)
- [ ] Get Hookdeck webhook URL
- [ ] Add Hookdeck endpoint to Stripe dashboard (replace direct webhook)

**Validation**:
- [ ] Trigger test webhook from Stripe dashboard
- [ ] Verify appears in Hookdeck logs
- [ ] Verify delivered to Medusa backend

**Files**: None (external service setup)

**Documentation**: Create `docs/HOOKDECK_SETUP.md` with setup steps.

---

#### 5.2 Verify Medusa Webhook Handler

**Task**: Ensure Medusa backend processes Stripe webhooks.

**Note**: Medusa v2 has built-in webhook handlers for Stripe payment provider. Should work automatically once Stripe provider is configured.

**Actions**:
- [ ] Check Medusa logs for webhook processing:
  ```bash
  ssh hetzner-node
  pm2 logs medusa-dev | grep webhook
  ```
- [ ] Trigger test payment and verify webhook processed
- [ ] Check order created in Medusa admin dashboard

**Validation**:
- [ ] Webhook received by Medusa
- [ ] Order status updated to "completed"
- [ ] Inventory decremented (if configured)

**Files**: None (Medusa handles internally)

**If Not Working**: May need to create custom webhook subscriber in `services/medusa/src/subscribers/stripe-webhook.ts` (refer to Medusa v2 docs).

---

#### 5.3 Deprecate Storefront Webhook Handler

**Task**: Remove or disable storefront webhook handler.

**Actions**:
- [ ] Rename `src/app/api/stripe/webhook/route.ts` → `route.ts.deprecated`
- [ ] Or keep for backward compatibility but update to log only (no order processing)
- [ ] Remove Supabase order insertion code
- [ ] Update Stripe dashboard to point webhooks at Hookdeck URL (not storefront)

**Files**:
- `src/app/api/stripe/webhook/route.ts` (deprecate or remove)

**Validation**:
- [ ] Webhooks no longer hit storefront endpoint
- [ ] Orders only created in Medusa (not Supabase)

---

### Track 6: Customer Authentication

**Duration**: 8-12 hours
**Dependencies**: None (can work in parallel)

#### 6.1 Implement Authentication Pages

**Task**: Create login and registration pages using Medusa Customer API.

**Pages to Create**:

**Registration** (`src/app/auth/register/page.tsx`):
```typescript
const handleRegister = async (email: string, password: string, firstName: string, lastName: string) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName })
  })

  if (response.ok) {
    router.push('/auth/login?registered=true')
  }
}
```

**Login** (`src/app/auth/login/page.tsx`):
```typescript
const handleLogin = async (email: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })

  if (response.ok) {
    router.push('/account')
  }
}
```

**API Routes** (`src/app/api/auth/`):
- `register/route.ts` - POST to `/store/auth/customer`
- `login/route.ts` - POST to `/store/auth`
- `logout/route.ts` - DELETE to `/store/auth`

**Actions**:
- [ ] Create registration page with form
- [ ] Create login page with form
- [ ] Create password reset page (optional)
- [ ] Create auth API routes
- [ ] Implement session management (httpOnly cookies)
- [ ] Add `useAuth` hook for client state

**Files**:
- `src/app/auth/register/page.tsx` (new)
- `src/app/auth/login/page.tsx` (new)
- `src/app/api/auth/register/route.ts` (new)
- `src/app/api/auth/login/route.ts` (new)
- `src/hooks/useAuth.ts` (new)

**Validation**:
- [ ] Can register new customer
- [ ] Can login with email/password
- [ ] Session persists across page reloads
- [ ] Can logout

---

#### 6.2 Create Customer Portal

**Task**: Build customer account dashboard.

**Pages to Create**:

**Account Layout** (`src/app/account/layout.tsx`):
- Protected route wrapper (redirect to login if not authenticated)
- Navigation sidebar (Orders, Profile, Settings, Logout)

**Order History** (`src/app/account/orders/page.tsx`):
```typescript
const { data: orders } = await fetch('/api/customer/orders')

return (
  <div>
    <h1>Order History</h1>
    {orders.map(order => (
      <OrderCard key={order.id} order={order} />
    ))}
  </div>
)
```

**Order Details** (`src/app/account/orders/[id]/page.tsx`):
- Order items, totals, shipping address, tracking (future)

**Profile Settings** (`src/app/account/settings/page.tsx`):
- Update name, email, password
- Manage addresses

**Actions**:
- [ ] Create account layout with protected route check
- [ ] Create order history page
- [ ] Create order details page
- [ ] Create profile settings page
- [ ] Add API route for customer orders (`/api/customer/orders/route.ts`)

**Files**:
- `src/app/account/layout.tsx` (new)
- `src/app/account/orders/page.tsx` (new)
- `src/app/account/orders/[id]/page.tsx` (new)
- `src/app/account/settings/page.tsx` (new)
- `src/app/api/customer/orders/route.ts` (new)

**Validation**:
- [ ] Customer can view order history
- [ ] Can click order to see details
- [ ] Can update profile information
- [ ] Unauthenticated users redirected to login

---

### Track 7: E2E Testing

**Duration**: 4-6 hours
**Dependencies**: Tracks 2-6 complete (full flow working)

#### 7.1 Setup Playwright

**Task**: Install and configure Playwright for E2E testing.

**Actions**:
- [ ] Install Playwright: `pnpm add -D @playwright/test`
- [ ] Initialize config: `pnpm exec playwright install`
- [ ] Create `playwright.config.ts` with base URL, test mode settings
- [ ] Create `tests/e2e/` directory

**Files**:
- `playwright.config.ts` (new)
- `package.json` (add test scripts)

**Validation**:
```bash
pnpm exec playwright test --ui
# Should open Playwright UI with no tests yet
```

---

#### 7.2 Write Checkout E2E Test

**Task**: Create complete purchase flow test.

**Test Scenario** (`tests/e2e/checkout.spec.ts`):
```typescript
test('complete purchase flow', async ({ page }) => {
  // 1. Browse products
  await page.goto('/store')
  await expect(page.locator('h2:has-text("Products")')).toBeVisible()

  // 2. Add to cart
  await page.click('[data-testid="add-to-cart-bed-presence-sensor"]')
  await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1')

  // 3. View cart
  await page.click('[data-testid="cart-icon"]')
  await expect(page).toHaveURL('/store/cart')

  // 4. Proceed to checkout
  await page.click('[data-testid="checkout-button"]')

  // 5. Fill shipping info
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="name"]', 'Test Customer')
  await page.fill('[name="address"]', '123 Main St')
  await page.fill('[name="city"]', 'San Francisco')
  await page.fill('[name="state"]', 'CA')
  await page.fill('[name="zip"]', '94102')

  // 6. Enter payment info (Stripe test card)
  const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]')
  await stripeFrame.locator('[name="cardnumber"]').fill('4242424242424242')
  await stripeFrame.locator('[name="exp-date"]').fill('12/34')
  await stripeFrame.locator('[name="cvc"]').fill('123')

  // 7. Submit payment
  await page.click('[data-testid="submit-payment"]')

  // 8. Verify order confirmation
  await expect(page).toHaveURL(/\/orders\/.*\/confirmation/)
  await expect(page.locator('h1:has-text("Order Confirmed")')).toBeVisible()
})
```

**Actions**:
- [ ] Write checkout flow test
- [ ] Add test data-testid attributes to components
- [ ] Configure test environment (Stripe test mode)
- [ ] Seed test products if needed

**Files**:
- `tests/e2e/checkout.spec.ts` (new)

**Validation**:
```bash
pnpm exec playwright test tests/e2e/checkout.spec.ts
# Should pass with green checkmark
```

---

#### 7.3 Email Delivery Testing (Mailosaur)

**Task**: Implement E2E testing for email notifications using Mailosaur.

**Priority**: 🔴 CRITICAL - Validates production email delivery

**Actions**:
- [ ] Create Mailosaur account at https://mailosaur.com
- [ ] Create test server (e.g., "opticworks-test")
- [ ] Add secrets to Infisical:
  - `MAILOSAUR_API_KEY`: API key from Mailosaur dashboard
  - `MAILOSAUR_SERVER_ID`: Server ID from Mailosaur dashboard
- [ ] Pull secrets: `pnpm run secrets:pull`
- [ ] Install Mailosaur package:
  ```bash
  pnpm add -D mailosaur
  ```
- [ ] Create email test helper (`tests/helpers/email.ts`):
  ```typescript
  import MailosaurClient from 'mailosaur'

  const mailosaur = new MailosaurClient(process.env.MAILOSAUR_API_KEY!)
  const serverId = process.env.MAILOSAUR_SERVER_ID!

  export async function getTestEmail() {
    return `test-${Date.now()}@${serverId}.mailosaur.net`
  }

  export async function waitForEmail(sentTo: string, timeout = 30000) {
    return await mailosaur.messages.get(serverId, {
      sentTo,
      timeout
    })
  }

  export function verifyEmailContent(email: any, expectations: {
    subject?: string
    bodyContains?: string[]
    linksContain?: string[]
  }) {
    if (expectations.subject) {
      expect(email.subject).toContain(expectations.subject)
    }

    if (expectations.bodyContains) {
      expectations.bodyContains.forEach(text => {
        expect(email.html.body).toContain(text)
      })
    }

    if (expectations.linksContain) {
      expectations.linksContain.forEach(href => {
        const hasLink = email.html.links.some(link => link.href.includes(href))
        expect(hasLink).toBe(true)
      })
    }
  }
  ```
- [ ] Update `tests/e2e/checkout.spec.ts` to include email verification:
  ```typescript
  import { getTestEmail, waitForEmail, verifyEmailContent } from '../helpers/email'

  test('complete purchase flow with email confirmation', async ({ page }) => {
    const testEmail = await getTestEmail()

    // Complete checkout (existing flow, use testEmail for customer email)
    await completeCheckout(page, testEmail)

    // Verify order confirmation page
    await expect(page).toHaveURL(/\/orders\/.*\/confirmation/)

    // Wait for confirmation email
    const email = await waitForEmail(testEmail)

    // Verify email content
    verifyEmailContent(email, {
      subject: 'Order Confirmation',
      bodyContains: [
        'Thank you for your order',
        'OpticWorks',
        '$199.99' // Or actual order total
      ],
      linksContain: [
        '/orders/',
        '/account/orders'
      ]
    })
  })
  ```

**Test Coverage**:
- [ ] **Order Confirmation**: Email sent on successful purchase
- [ ] **Customer Registration**: Welcome email sent on account creation
- [ ] **Password Reset**: Reset link email sent (optional)
- [ ] **Email Template Rendering**: HTML/plain text rendering correct
- [ ] **Links Validation**: All CTAs link to correct URLs

**Files**:
- `tests/helpers/email.ts` (new)
- `tests/e2e/checkout.spec.ts` (update)
- `tests/e2e/registration-email.spec.ts` (new)
- `playwright.config.ts` (add Mailosaur env vars)
- `package.json` (new dependency)

**Validation**:
```bash
pnpm exec playwright test tests/e2e/checkout.spec.ts
# Should pass with email verification included

# Check Mailosaur dashboard for captured emails
# https://mailosaur.com/app/servers/<server-id>/messages
```

**Cost**: Free tier (100 emails/month) - sufficient for E2E testing

**Benefits**:
- Real email delivery testing (not mocked)
- Verify template rendering in actual email clients
- Catch broken links, missing variables, formatting issues
- Production-like validation before launch

**Note**: See `docs/MAILOSAUR_SETUP.md` for detailed setup instructions.

---

#### 7.4 Write Authentication E2E Test

**Task**: Test customer registration and login flow.

**Test Scenario** (`tests/e2e/auth.spec.ts`):
```typescript
test('customer registration and login', async ({ page }) => {
  const testEmail = `test-${Date.now()}@example.com`

  // 1. Register
  await page.goto('/auth/register')
  await page.fill('[name="email"]', testEmail)
  await page.fill('[name="password"]', 'Password123!')
  await page.fill('[name="firstName"]', 'Test')
  await page.fill('[name="lastName"]', 'User')
  await page.click('[data-testid="register-button"]')

  // 2. Should redirect to login
  await expect(page).toHaveURL('/auth/login?registered=true')

  // 3. Login
  await page.fill('[name="email"]', testEmail)
  await page.fill('[name="password"]', 'Password123!')
  await page.click('[data-testid="login-button"]')

  // 4. Should redirect to account
  await expect(page).toHaveURL('/account')
  await expect(page.locator('h1:has-text("My Account")')).toBeVisible()
})
```

**Actions**:
- [ ] Write auth flow test
- [ ] Test password reset flow (optional)
- [ ] Test protected route redirect

**Files**:
- `tests/e2e/auth.spec.ts` (new)

**Validation**:
```bash
pnpm exec playwright test tests/e2e/auth.spec.ts
```

---

## Success Criteria

Phase 3 is complete when **ALL** of the following are verified:

### Products ✅
- [ ] Products load from Medusa Store API (not static files)
- [ ] Product detail pages render Medusa data
- [ ] Product images display correctly
- [ ] Inventory levels shown (if configured)

### Cart ✅
- [ ] Can add product to cart
- [ ] Cart persists in Medusa (not just localStorage)
- [ ] Cart survives page reload
- [ ] Logged-in customer cart restores on new device/session (server cart linked to account)
- [ ] Can update item quantities
- [ ] Can remove items from cart
- [ ] Cart totals calculate correctly (subtotal, tax, shipping)

### Checkout ✅
- [ ] Can proceed to checkout from cart
- [ ] Shipping address form works
- [ ] Stripe Elements render via Medusa payment session
- [ ] Can complete payment with test card (4242 4242 4242 4242)
- [ ] Order created in Medusa (visible in Admin dashboard)
- [ ] Inventory decremented after purchase

### Webhooks ✅
- [ ] Stripe webhooks route through Hookdeck
- [ ] Webhooks delivered to Medusa backend
- [ ] `payment_intent.succeeded` creates order
- [ ] Order confirmation email sent (optional)

### Authentication ✅
- [ ] Customer can register account
- [ ] Customer can login with email/password
- [ ] Session persists across page reloads
- [ ] Can logout

### Customer Portal ✅
- [ ] Customer can view order history
- [ ] Can view individual order details
- [ ] Can update profile information
- [ ] Protected routes redirect to login if not authenticated

### Testing ✅
- [ ] E2E checkout test passes
- [ ] E2E auth test passes
- [ ] Manual QA of complete flow successful

---

## Timeline

**Estimated Total Effort**: 25-30 hours (8-10 implementation sessions)

### Critical Path

```
Track 1 (Backend Config) → Track 2 (Products) → Track 3 (Cart) → Track 4 (Checkout) → Track 7 (Testing)
```

**Can Work in Parallel**:
- Track 5 (Webhooks) - anytime after Track 4
- Track 6 (Auth) - anytime (independent)

### Week-by-Week Breakdown

**Week 1**: Backend + Products
- Day 1: Configure Medusa regions (Track 1)
- Day 2: Fix and enable Products API (Track 2)

**Week 2**: Cart Implementation
- Days 3-5: Implement Medusa Cart API integration (Track 3)

**Week 3**: Checkout Migration
- Days 6-8: Migrate checkout to Medusa Stripe provider (Track 4)

**Week 4**: Webhooks + Auth
- Day 9: Configure Hookdeck webhooks (Track 5)
- Days 10-12: Implement customer authentication (Track 6)

**Week 5**: Testing + Polish
- Days 13-14: E2E testing (Track 7)
- Day 15: Bug fixes and polish

**Completion Target**: ~3-4 weeks with consistent progress

---

## Dependencies

### External Services

| Service | Purpose | Cost | Setup Required |
|---------|---------|------|----------------|
| **Hookdeck** | Webhook gateway | Free tier (100k events/month) | Account + connection config |
| **Stripe** | Payment processing | Test mode (free) | Already configured |
| **Medusa Admin** | Backend configuration | Free | Already accessible |
| **Infisical** | Secrets management | Free tier | Already configured |

### Internal Prerequisites

| Prerequisite | Status | Blocking |
|-------------|--------|----------|
| Medusa backend operational | ✅ Complete | None |
| Stripe provider configured | ✅ Complete | None |
| **Medusa regions created** | ❌ **BLOCKER** | Tracks 3, 4 |
| Products in catalog | ✅ Complete (7 products) | None |
| Infisical secrets | ✅ Complete | None |

---

## Testing Strategy

### Development Testing

```bash
# Storefront
pnpm run dev              # http://localhost:3000
pnpm run build            # Production build test
pnpm run test             # Unit tests (Vitest)

# E2E Tests
pnpm run test:e2e         # Full checkout flow
pnpm run test:e2e --ui    # Interactive test runner

# Backend verification
ssh hetzner-node
pm2 logs medusa-dev       # Check for errors
curl https://api.optic.works/health  # Health check
```

### Manual QA Checklist

**Pre-Launch Checklist**:
- [ ] Products load from Medusa
- [ ] Can complete full purchase with test card
- [ ] Order appears in Medusa Admin dashboard
- [ ] Webhook processed successfully (check Hookdeck logs)
- [ ] Customer can register and login
- [ ] Customer can view order in portal
- [ ] Cart persists across devices (if logged in)

---

## Next Steps

1. ✅ Review and approve this plan
2. ⏳ **START HERE**: Configure Medusa regions (Track 1.1) - **BLOCKER**
3. ⏳ Fix Products API auth header (Track 2.1)
4. ⏳ Enable Medusa products mode (Track 2.2)
5. ⏳ Implement Cart API integration (Track 3)

---

**Phase 3 Plan Status**: ✅ Ready for Implementation
**Last Updated**: 2025-12-01
**Next Review**: After Track 1 completion (regions configured)
