# Store frontend

Status as of **2026-10-30**. The store is built and tested, but it is **off on optic.works**.

## What it does

- **Product pages** (`/products/vmc`, `/products/mach-1`) show a buy box with the price and
  "Add to bag". The page stays static; the buy box loads through a server action and renders
  nothing while the store is off.
- **`/store`** lists the offered products. **`/cart`** is the bag (quantity 1–5 per product,
  update, remove). The header shows a bag link with a count.
- **`/checkout`** has three steps:
  1. Contact and US shipping address (validated).
  2. Shipping method, with live rates in `medusa` mode.
  3. Review and place order.
- **`/checkout/confirmation`** shows the result. In `mock` mode it says plainly that the order
  was simulated.

Every store page carries a notice: in mock mode, that prices are provisional and checkout is
simulated; in backend mode, that it's a test store and checkout stops before payment. Store
pages are `noindex`.

## `STORE_MODE`

| Mode | Where by default | Prices | Checkout |
|------|------------------|--------|----------|
| `off` | `optic.works`, `www.optic.works` (no `STORE_MODE` set) | none | `/store`, `/cart`, `/checkout` return 404 |
| `mock` | `localhost` and `*.workers.dev` previews | `MOCK_PRICES` in `src/lib/store/mock.ts` | simulated: no network, no payment, `MOCK-…` reference |
| `medusa` | only when set explicitly | the backend's variant prices | real cart on the backend with address, Stripe Tax and EasyPost rates; stops before payment |

An explicit `STORE_MODE` always wins (`src/lib/store/mode.ts`). An unknown value means `off`.
`medusa` also needs the variables in [SECRETS.md](../SECRETS.md#website); without them the
store stays off and logs why.

## Design

```
product page ─ BuyBox ─┐
header ─ BagLink ──────┼─ server actions (src/lib/store/actions.ts) ─ StoreBackend
/cart, /checkout ──────┘        │                                       ├─ mock.ts
                                ├─ ow_bag cookie: [{handle, quantity}]   └─ medusa.ts ─► backend.optic.works
                                └─ ow_checkout cookie: Medusa cart id      (Store API, server-side,
                                   (or mock state)                          publishable key + Access token)
```

- **Prices are never stored client-side.** The bag cookie holds handles and quantities only;
  every page re-prices from the backend's offers.
- **No `/api/*`.** Server actions post to the page URL, so the offline Worker that answers
  `optic.works/api/*` doesn't affect them. The browser never talks to Medusa.
- **The backend cart is created at checkout, with the address first.** The backend's Stripe
  Tax provider fails closed: it can't price an item for a cart that knows only its region
  (no ZIP code), so adding items to an address-less cart returns
  `500 Tax could not be calculated`. Creating the cart with the full address avoids that.
- Products map to programs by handle (`Program.commerce.productHandle` === slug === Medusa
  handle). Marketing copy stays in `src/content/`; price and availability come from the
  store backend.

## Prices

Owner-provided on 2026-10-30, **subject to change**:

| Product | Price |
|---------|-------|
| Compact VMC (`vmc`) | $5,999.00 |
| Mach 1 (`mach-1`) | $5,999.00 |

- **Backend:** `OFFERS` in `infrastructure/ansible/scripts/catalog_offers.py`. Edit the
  value, then run the script (dry run first, then `--apply`). It sets each product's USD
  price and publishes it. Applied to the dark backend on 2026-10-30: both products are
  published at 5999 USD.
- **Mock:** `MOCK_PRICES` in `src/lib/store/mock.ts`. Keep it in step with the backend.

## Testing

- Unit tests: `src/lib/store/store.test.ts` covers mode resolution, money, bag parsing,
  validation, the mock checkout, and the Medusa adapter against a fake Store API.
- Verified on 2026-10-30 in a browser (headless Chromium):
  - **Mock mode:** add both products, change quantity, remove, validation errors, shipping,
    place order, confirmation, bag cleared.
  - **Medusa mode, against `backend.optic.works`:** prices from Medusa; Stripe Tax $929.84 on
    2 × VMC to San Diego; three EasyPost rates; "Place order" disabled with the payment note.
  - **Built Worker (`pnpm cf:preview`):** `optic.works` returns 404 for the store routes and
    shows no price; `*.workers.dev` and `localhost` show the mock store.

## Before turning it on in production

1. **Payment.** Create a payment collection and a Stripe payment session for the cart,
   confirm it with Stripe Elements (publishable key), then complete the cart. A real webhook
   is also needed (#138). Until then `medusa` mode can't place orders.
2. **Shipping data.** The products have no weight or dimensions, so EasyPost quotes a
   parcel-sized rate by USPS (about $6–20) for a machine. Set real weights and dimensions,
   or use freight or manual shipping options, before showing rates.
3. **Backend launch readiness** (#138): live keys, removing the email allowlist and making
   the backend public, or keeping it behind Access with the Worker's service token.
4. **Copy and legal.** Both products are in development (prototype and early development).
   Decide what an order means (a pre-order, a deposit, or a reservation), then align the
   terms, refunds and warranty (#126) and the confirmation email.
5. Set the Worker variables from [SECRETS.md](../SECRETS.md#website) in the dashboard,
   check a preview, then set `STORE_MODE=medusa` for production. **Merging to `main` deploys
   production.**
