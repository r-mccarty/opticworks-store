# Frontend-Backend Wiring Guide

This document outlines the integration points between the OpticWorks storefront (Next.js on Cloudflare Workers) and the Medusa v2 backend (Hetzner), with a focus on achieving full decoupling and identifying required refactoring work.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLOUDFLARE EDGE                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Next.js 15 (Cloudflare Workers)                │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │   │
│  │  │ Server          │  │ API Routes      │  │ Static      │ │   │
│  │  │ Components      │  │ /api/*          │  │ Assets      │ │   │
│  │  │ (RSC)           │  │                 │  │ (R2/CDN)    │ │   │
│  │  └────────┬────────┘  └────────┬────────┘  └─────────────┘ │   │
│  │           │                    │                            │   │
│  │           ▼                    ▼                            │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │                Edge Backend Logic                    │   │   │
│  │  │  • Auth token management (httpOnly cookies)         │   │   │
│  │  │  • Stripe webhook signature verification            │   │   │
│  │  │  • Turnstile CAPTCHA validation                     │   │   │
│  │  │  • Rate limiting                                    │   │   │
│  │  │  • Email dispatch (support requests)                │   │   │
│  │  │  • Address validation proxy                         │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                               │                                     │
└───────────────────────────────┼─────────────────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │   Cloudflare Tunnel   │
                    └───────────┬───────────┘
                                │
┌───────────────────────────────┼─────────────────────────────────────┐
│                        HETZNER SERVER                               │
│                               │                                     │
│  ┌────────────────────────────▼────────────────────────────────┐   │
│  │                    Medusa v2 Backend                         │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │   │
│  │  │ Store API       │  │ Custom Modules  │  │ Workflows   │  │   │
│  │  │ /store/*        │  │ & Providers     │  │ & Events    │  │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────┘  │   │
│  │                                                               │   │
│  │  Products │ Cart │ Orders │ Auth │ Shipping │ Payments       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  PostgreSQL  │  │    Redis     │  │   PM2        │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Backend Responsibility Matrix

### Medusa Backend (Hetzner Server)

| Capability | Endpoint/Module | Description |
|------------|-----------------|-------------|
| **Products** | `GET /store/products` | Product catalog with variants, prices, inventory |
| **Product Detail** | `GET /store/products?handle=xxx` | Single product by handle (cached via React `cache()`) |
| **Cart CRUD** | `POST/GET/DELETE /store/carts/*` | Create, read, update cart and line items |
| **Cart Completion** | `POST /store/carts/{id}/complete` | Convert cart to order after payment |
| **Shipping Options** | `GET /store/shipping-options` | List available shipping methods |
| **Shipping Rates** | `POST /store/shipping-options/{id}/calculate` | Real-time rate calculation via EasyPost |
| **Shipping Selection** | `POST /store/carts/{id}/shipping-methods` | Add shipping method to cart (triggers tax calc) |
| **Payment Collections** | `POST /store/payment-collections/*` | Create Stripe payment sessions |
| **Customer Auth** | `POST /store/auth/customer/emailpass` | Login/register, returns JWT |
| **Customer Profile** | `GET /store/customers/me` | Authenticated customer data |
| **Saved Payment Methods** | `GET/DELETE /store/customers/me/payment-methods` | Custom endpoint for card management |
| **Orders** | `GET /store/orders/{id}` | Order details and history |
| **Tax Calculation** | Automatic (Stripe Tax provider) | Calculated when shipping method is added |
| **Transactional Email** | Event subscribers (Resend) | Order confirmation, shipping notifications |
| **Webhook Processing** | `POST /webhooks/easypost` | Tracker status updates via Hookdeck |

### Edge Backend (Cloudflare Workers / Next.js API Routes)

| Capability | Endpoint | Description |
|------------|----------|-------------|
| **Auth Proxy** | `/api/auth/*` | Manages httpOnly JWT cookies, proxies to Medusa |
| **Stripe Checkout** | `/api/stripe/create-checkout-session` | Creates Stripe Checkout Session (custom UI mode) |
| **Stripe Webhooks** | `/api/stripe/webhook` | Signature verification, event processing |
| **Dynamic Shipping** | `/api/stripe/shipping-webhook` | Dynamic shipping rates for Stripe Checkout |
| **Tax Retrieval** | `/api/stripe/get-session-tax` | Fetch calculated tax from Checkout Session |
| **Address Validation** | `/api/easypost/validate-address` | EasyPost address verification |
| **Address Suggestions** | `/api/easypost/suggest-address` | Address autocomplete suggestions |
| **Email Dispatch** | `/api/email/send` | Contact form emails (stubbed, uses Turnstile) |
| **CAPTCHA Config** | `/api/turnstile/site-key` | Cloudflare Turnstile public key |
| **Payment Methods** | `/api/account/payment-methods` | Proxy to Medusa with auth token |
| **Inventory Check** | `/api/inventory/check` | Product availability verification |
| **Order Lookup** | `/api/order-details` | Fetch order by Stripe payment intent |
| **Fulfillment** | `/api/fulfillment/create-label` | Purchase shipping label (EasyPost) |
| **Analytics** | `/api/analytics/events` | Event tracking ingestion |

### Client-Side State (Zustand Stores)

| Store | Purpose | Persistence |
|-------|---------|-------------|
| `useCart` | Cart state with Medusa sync | localStorage + cookie |
| `useAuth` | Customer authentication state | localStorage (minimal) |
| `useMedusaShipping` | Real-time shipping rate fetching | None (transient) |
| `useCheckoutState` | Cross-component checkout data | None (transient) |
| `useAddressValidation` | Debounced address validation | None (transient) |
| `useSupportStore` | Support tickets and form state | localStorage |

---

## Landing Page Analysis

### Current State

The landing page (`src/app/page.tsx`) is **100% static content** with no backend data fetching.

| Section | Component | Data Source | Backend Integration |
|---------|-----------|-------------|---------------------|
| Hero | `Hero.tsx` | Hardcoded | None |
| Spatial Demo | `SpatialDemo.tsx` | Client-side animation | None (simulated data) |
| Features | `Features.tsx` | Hardcoded array | None |
| Specs | `Specs.tsx` | Hardcoded product | None |
| Newsletter | `Newsletter.tsx` | N/A | **Non-functional** (preventDefault only) |
| Menu Bar | `menu-bar.tsx` | Zustand stores | Cart count, auth status |
| Footer | `Footer.tsx` | Static links | None |

### Required Wiring for Full Integration

#### 1. Product Data in Specs Section

**Current**: Hardcoded `$89` price and product details
**Target**: Fetch from Medusa product catalog

```typescript
// Option A: Server Component (recommended for SEO)
// src/app/page.tsx
import { getProductById } from '@/lib/api/medusa';

export default async function HomePage() {
  const product = await getProductById('ow1-devkit');
  return <Specs product={product} />;
}

// Option B: Client-side fetch with SWR/React Query
// For real-time price updates without page reload
```

**Files to modify**:
- `src/components/ui/Specs.tsx` - Accept product prop, display dynamic data
- `src/app/page.tsx` - Fetch product server-side

#### 2. Newsletter Subscription

**Current**: Form submits to `event.preventDefault()` - does nothing
**Target**: Integrate with email marketing service

**Options**:

| Option | Implementation | Pros | Cons |
|--------|----------------|------|------|
| Medusa Subscriber Module | Create custom module | Unified backend | More complex |
| Resend Audience API | Direct API call | Simple, existing provider | Separate system |
| Mailchimp/ConvertKit | Edge API route | Battle-tested | Another service |

**Recommended**: Edge API route (`/api/newsletter/subscribe`) that:
1. Validates email format
2. Verifies Turnstile token
3. Calls Resend Audience API or stores in Medusa customer metadata

**Files to create/modify**:
- `src/app/api/newsletter/subscribe/route.ts` - New API route
- `src/components/ui/Newsletter.tsx` - Wire form submission

#### 3. Add to Cart from Landing Page

**Current**: "Add to Cart" button links to `/store`
**Target**: Direct add-to-cart functionality

```typescript
// src/components/ui/Specs.tsx
import { useCart } from '@/hooks/useCart';

function SpecsAddToCart({ productId, variantId }: Props) {
  const { addItem, isLoading } = useCart();

  const handleAddToCart = async () => {
    await addItem({
      productId,
      variantId,
      quantity: 1,
    });
    // Show success toast or open cart drawer
  };

  return (
    <Button onClick={handleAddToCart} disabled={isLoading}>
      {isLoading ? 'Adding...' : 'Add to Cart'}
    </Button>
  );
}
```

**Files to modify**:
- `src/components/ui/Specs.tsx` - Add cart integration
- Consider: Cart drawer/slide-out component for immediate feedback

---

## Missing Functionality

### Support Section (Not on Landing Page)

The support infrastructure exists but is **not linked from the landing page**:

| Feature | Status | Location |
|---------|--------|----------|
| Support Hub | Exists | `/support` |
| Contact Form | Exists, functional | `/support/contact` |
| FAQ | Exists | `/support/faq` |
| Warranty Claims | Exists | `/support/warranty` |
| Order Tracking | Exists | `/support/orders` |
| Billing Support | Exists | `/support/billing` |

**Required Changes**:

1. **Add Support Link to Landing Page Navigation**
   ```typescript
   // src/components/menu-bar.tsx
   // Add to navigation items array:
   { label: "Support", href: "/support" }
   ```

2. **Add Support CTA to Footer**
   - Footer already links to support via `siteConfig.baseLinks.support`
   - Verify links are working correctly

3. **Consider Adding Support Section to Landing Page**
   - Option: Add "Need Help?" section above footer
   - Links to FAQ, Contact, Documentation

### Contact Form Backend (Partially Implemented)

**Current State**:
- `ContactForm.tsx` sends to `/api/email/send`
- `/api/email/send` is **stubbed** (logs but doesn't send)
- Turnstile CAPTCHA validation works

**Required to Complete**:

```typescript
// Option A: Integrate Resend directly in API route
// src/app/api/email/send/route.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// In POST handler:
await resend.emails.send({
  from: 'support@optic.works',
  to: 'support-inbox@optic.works',
  subject: `Support: ${data.subject}`,
  react: SupportRequestEmail(data),
});
```

**Option B**: Create Medusa workflow for support tickets (enables ticket tracking in admin)

---

## Wiring Checklist

### Phase 1: Landing Page Dynamic Data

- [ ] **Product Data Integration**
  - [ ] Modify `Specs.tsx` to accept product prop
  - [ ] Fetch OW-1 product in `page.tsx` server component
  - [ ] Display dynamic price, inventory status
  - [ ] Handle Medusa unavailable gracefully (fallback to static)

- [ ] **Add to Cart Button**
  - [ ] Add `useCart` hook to Specs component
  - [ ] Implement add-to-cart handler
  - [ ] Add loading state and success feedback
  - [ ] Consider cart drawer for immediate UX

### Phase 2: Newsletter Integration

- [ ] **Create Newsletter API Route**
  - [ ] `POST /api/newsletter/subscribe`
  - [ ] Email validation
  - [ ] Turnstile verification
  - [ ] Rate limiting (prevent abuse)

- [ ] **Choose Storage Backend**
  - [ ] Option: Resend Audience API
  - [ ] Option: Medusa customer metadata
  - [ ] Option: Dedicated email service (Mailchimp, etc.)

- [ ] **Wire Newsletter Component**
  - [ ] Update form submission handler
  - [ ] Add loading and success states
  - [ ] Add error handling

### Phase 3: Navigation & Support

- [ ] **Update Menu Bar**
  - [ ] Add Support link to main navigation
  - [ ] Consider: Order status link for logged-in users

- [ ] **Landing Page Support Section** (Optional)
  - [ ] Design support/help section
  - [ ] Link to FAQ, documentation, contact

- [ ] **Complete Email Sending**
  - [ ] Integrate Resend in `/api/email/send`
  - [ ] Create email templates for support requests
  - [ ] Test end-to-end flow

### Phase 4: Advanced Integrations

- [ ] **Real-time Inventory Display**
  - [ ] Show "In Stock" / "Low Stock" / "Out of Stock"
  - [ ] Use Medusa inventory levels

- [ ] **Price with Currency Formatting**
  - [ ] Use Medusa region for currency
  - [ ] Support multiple regions/currencies

- [ ] **Pre-order / Waitlist**
  - [ ] If product unavailable, offer waitlist signup
  - [ ] Integrate with newsletter or separate list

---

## API Client Reference

### Medusa Client (`src/lib/api/medusa.ts`)

```typescript
// Environment-aware base URL
const getBaseUrl = () => {
  if (typeof window === 'undefined') {
    return process.env.MEDUSA_SSR_BASE_URL;  // Server: direct tunnel
  }
  return process.env.NEXT_PUBLIC_MEDUSA_BASE_URL;  // Client: CORS worker
};

// Key functions for landing page integration:
listProducts()           // Get all products with prices
getProductById(handle)   // Get single product (cached)
createCart(regionId)     // Initialize shopping cart
addLineItem(cartId, item) // Add product to cart
```

### Cart Hook (`src/hooks/useCart.ts`)

```typescript
const {
  items,           // Current cart items
  itemCount,       // Total item count
  total,           // Cart total (formatted)
  isLoading,       // Loading state
  addItem,         // Add item to cart
  updateQuantity,  // Update item quantity
  removeItem,      // Remove item from cart
  clearCart,       // Clear entire cart
  initializeCart,  // Create/restore cart
  syncWithMedusa,  // Force sync with backend
} = useCart();
```

---

## Data Flow Diagrams

### Product Display Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Landing Page   │────▶│  Medusa Backend  │────▶│  PostgreSQL     │
│  (RSC)          │     │  /store/products │     │  products table │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │
        ▼
┌─────────────────┐
│  Specs Section  │
│  - Price: $89   │
│  - Stock: ✓     │
│  - Add to Cart  │
└─────────────────┘
```

### Add to Cart Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  User Click  │────▶│  useCart     │────▶│  Medusa API  │
│  Add to Cart │     │  addItem()   │     │  POST /carts │
└──────────────┘     └──────────────┘     └──────────────┘
                            │                     │
                            ▼                     ▼
                     ┌──────────────┐     ┌──────────────┐
                     │  Optimistic  │     │  Persist to  │
                     │  UI Update   │     │  PostgreSQL  │
                     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  Menu Bar    │
                     │  Cart Badge  │
                     │  Updates     │
                     └──────────────┘
```

### Newsletter Subscription Flow (Proposed)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  User Enter  │────▶│  Newsletter  │────▶│  Turnstile   │
│  Email       │     │  Component   │     │  Verify      │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
                     ┌──────────────┐     ┌──────────────┐
                     │  Success UI  │◀────│  /api/news-  │
                     │  "Subscribed"│     │  letter/sub  │
                     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │  Resend      │
                                          │  Audience    │
                                          │  API         │
                                          └──────────────┘
```

---

## Environment Variables

### Required for Landing Page Integration

```bash
# Medusa Connection
NEXT_PUBLIC_MEDUSA_BASE_URL=https://api.optic.works
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxx
MEDUSA_SSR_BASE_URL=http://localhost:9000  # Or tunnel URL

# Feature Flags
NEXT_PUBLIC_MEDUSA_ENABLED=true

# CAPTCHA (for newsletter/contact)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4xxx
TURNSTILE_SECRET_KEY=0x4xxx

# Email (if implementing newsletter)
RESEND_API_KEY=re_xxx
```

---

## Testing Strategy

### Unit Tests

```typescript
// Test product data transformation
describe('Specs component', () => {
  it('displays product price from Medusa', () => {
    const product = { /* mock Medusa product */ };
    render(<Specs product={product} />);
    expect(screen.getByText('$89')).toBeInTheDocument();
  });

  it('falls back to static data when product is null', () => {
    render(<Specs product={null} />);
    expect(screen.getByText('$89')).toBeInTheDocument();
  });
});
```

### E2E Tests

```typescript
// e2e/tests/landing-page.spec.ts
test('add to cart from landing page', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="specs-add-to-cart"]');

  // Verify cart updated
  await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');
});

test('newsletter subscription', async ({ page }) => {
  await page.goto('/');
  await page.fill('[data-testid="newsletter-email"]', 'test@example.com');
  await page.click('[data-testid="newsletter-submit"]');

  await expect(page.locator('[data-testid="newsletter-success"]')).toBeVisible();
});
```

---

## Migration Notes

### Graceful Degradation

The landing page should work even if Medusa is unavailable:

```typescript
// src/app/page.tsx
export default async function HomePage() {
  let product = null;

  try {
    product = await getProductById('ow1-devkit');
  } catch (error) {
    console.error('Failed to fetch product:', error);
    // Fall back to static data
  }

  return (
    <>
      <Hero />
      <Features />
      <Specs product={product} />
      <Newsletter />
    </>
  );
}
```

### Static Data Fallback

Maintain static product data for fallback:

```typescript
// src/lib/products.ts
export const STATIC_PRODUCTS = {
  'ow1-devkit': {
    title: 'OW-1 Development Kit',
    price: 89,
    currency: 'USD',
    description: '60GHz mmWave presence sensor...',
    image: '/images/stock/ow1-devkit.webp',
  },
};
```

---

## Summary

| Component | Current State | Target State | Priority |
|-----------|---------------|--------------|----------|
| Product Price | Static $89 | Dynamic from Medusa | High |
| Add to Cart | Links to /store | Direct add-to-cart | High |
| Newsletter | Non-functional | API integration | Medium |
| Support Nav | Missing | Add to menu | Medium |
| Contact Form | Stubbed email | Full Resend integration | Medium |
| Inventory Status | None | Real-time display | Low |
| Multi-currency | None | Region-based pricing | Low |

The landing page is designed for **full decoupling** - it can operate entirely static while backend services are unavailable, progressively enhancing with dynamic data when connected.
