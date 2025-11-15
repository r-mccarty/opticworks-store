# Medusa Integration Inventory

**Status**: Track T1 (Storefront Hardening) – in progress  
**Last updated**: 2025-03-14  
**Owner**: Platform Engineering

This note captures every storefront touchpoint that needs Medusa data so Track T1 can introduce a service layer without breaking the current experience. It complements `docs/MIGRATION_PLAN.md` and `docs/IMPLEMENTATION_GUIDE.md`.

## 1. Where Product Data Is Consumed

| File | Purpose | Data required |
| --- | --- | --- |
| `src/components/store/ProductGrid.tsx` | Storefront catalog grid (client). | Full product list for cards (name, description, price, specs, badges, reviews, inventory flag). |
| `src/app/store/page.tsx` | Server route that renders the grid. | Fetches catalog and passes to `ProductGrid`. |
| `src/app/products/[slug]/page.tsx` | Product detail route. | Fetch single product by slug/id for metadata + detail view. |
| `src/components/products/ProductDetailView.tsx` (+ `ProductHero`, `FinalCTA`, etc.) | Structured layout for individual product. | Product record passed from route; expects hero copy, key benefits, variants, specs, install guide link, etc. |
| `src/components/products/BentoProductShowcase.tsx` | Marketing highlight on `/products`. | Still uses fallback catalog for now (copy-only). |
| `src/hooks/useCart.ts` | Cart state. | Stores `Product` references (id/name/price/image/category/specs). |
| `src/components/checkout/CheckoutWrapper.tsx` | Stripe Elements integration. | Converts cart items to payment line items. |

## 2. Product Model (today)

Source of truth: `src/lib/products.ts`

```ts
export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  category: "sensor" | "bundle" | "accessory" | "software"
  badge?: string
  specifications: Array<{ label: string; value: string }>
  highlights?: string[]
  keyBenefits?: Array<{ title: string; description: string }>
  heroIntro?: { headline: string; subheading: string }
  inStock: boolean
  featured?: boolean
  variants?: Array<{ id: string; name: string; price: number; description: string; badge?: string }>
  reviews?: { rating: number; count: number }
  installGuide?: string
}
```

**Medusa parity requirements**
- Need handle/slugs (`product.id` currently doubles as slug).
- Pricing: at least one variant price (USD) so we can populate `price`/`originalPrice`.
- Inventory flag for `inStock`.
- Images: fallback gradient until R2 assets exist; Medusa should return `thumbnail` or media URLs.

## 3. Cart + Checkout Contract

`useCart` stores items shaped as `CartItem extends Product` plus `quantity`.  
`CheckoutWrapper` currently posts to `/api/stripe/create-checkout-session` with:

```ts
{
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
}
```

Desired Medusa flow:
1. `createCart` with product IDs/variants and quantities.
2. `createPaymentSession` (Stripe provider inside Medusa) → returns `client_secret` for Elements.
3. Storefront only receives `sessionId` + `clientSecret`.

## 4. Environment Toggles

| Variable | Scope | Purpose |
| --- | --- | --- |
| `MEDUSA_ENABLED` / `NEXT_PUBLIC_MEDUSA_ENABLED` | Server / client | Feature flag to prefer Medusa HTTP endpoints. Defaults to `false`. |
| `MEDUSA_BASE_URL` / `NEXT_PUBLIC_MEDUSA_BASE_URL` | Server / client | Base URL for Medusa store endpoints (e.g., `https://api.opticworks.dev`). |
| `MEDUSA_API_TOKEN` / `NEXT_PUBLIC_MEDUSA_API_TOKEN` | Server / client | Optional bearer token for authenticated requests. |

When disabled or misconfigured, the storefront falls back to the static catalog defined in `src/lib/products.ts` and posts to the internal `/api/stripe/*` routes.

## 5. Service Layer Plan

File: `src/lib/api/medusa.ts`

Responsibilities:
- Provide typed helpers:
  - `listProducts(): Promise<Product[]>`
  - `getProductById(id: string): Promise<Product | undefined>`
  - `createPaymentSession(items: CheckoutLineItem[]): Promise<{ sessionId: string; clientSecret: string | null; provider: "medusa" | "stripe" }>`
- Handle env toggles and fallback logic (warn + fallback when Medusa fails).
- Normalize Medusa response structure into the storefront `Product` interface.

Consumers:
- `store/page.tsx` fetches data server-side and passes to `ProductGrid`.
- `app/products/[slug]/page.tsx` uses `listProducts` + `getProductById` for metadata + rendering.
- `CheckoutWrapper` calls `createPaymentSession` instead of posting directly to the Stripe route.

## 6. Next Steps
1. Implement `src/lib/api/medusa.ts` with the abstractions above.
2. Update the store page + checkout flow to use the new helpers.
3. Once Medusa backend exists, flip `MEDUSA_ENABLED=true` locally to test, keeping fallback path intact.
4. Remove direct imports of `products` from UI components as we progressively wire the marketing sections to the service layer.
