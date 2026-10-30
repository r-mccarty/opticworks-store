# Frontend while the backend is offline

Status as of **2026-10-29**, with a backend update on **2026-10-30**. This describes the running
website. For the legacy backend archive, the snapshot runbook and the legacy API catalog, see
[LEGACY_BACKEND_SNAPSHOT.md](LEGACY_BACKEND_SNAPSHOT.md) and [LEGACY_BACKEND_API.md](LEGACY_BACKEND_API.md) (PR #124).

> **Backend update (2026-10-30).** The legacy server was rebuilt in place, so the legacy backend
> no longer runs anywhere (snapshot `449822273` keeps its state). A new Medusa 2.21 backend
> runs **dark** at `backend.optic.works` (Cloudflare Access only, test-mode keys, two draft
> products). See [`infrastructure/ansible/README.md`](../../infrastructure/ansible/README.md).
> Nothing below changes: the website still doesn't call any backend, and the offline routes stay.

## Summary

- Commerce is offline. `COMMERCE_ENABLED = false` in `src/lib/commerce.ts` is the code-level
  kill switch. `NEXT_PUBLIC_MEDUSA_ENABLED=false` in `.env.production` and `wrangler.jsonc` is
  a second guard. The Medusa client refuses to send requests unless **both** are on
  (`src/lib/commerce.test.ts`).
- Store, cart, checkout, order confirmation, sign-in and account routes render
  `ServiceUnavailable` (HTTP 200, `noindex`). Their original implementations are kept
  in `src/components/legacy/`.
- Support, orders, billing, warranty and compatibility pages are email-only
  (support@optic.works). None of the site's forms submit anything.
- Company identity: **OpticWorks, Inc.**, 3077B Clairemont Dr. #201, San Diego, CA 92117.
- Canonical origin: `https://optic.works`. Every page now emits a self-canonical URL.

## Edge routing

| Pattern | Served by | Behaviour |
|---------|-----------|-----------|
| `optic.works`, `www.optic.works` | Worker `opticworks-store` (this repo) | Website |
| `optic.works/api/*`, `www.optic.works/api/*` | Worker `opticworks-backend-offline-20261029` | `503 {"code":"BACKEND_OFFLINE"}` |
| `api.optic.works/*`, `medusa.optic.works/*` | Worker `opticworks-backend-offline-20261029` | `503 {"code":"BACKEND_OFFLINE"}` |

The more specific `/api/*` routes take precedence over the custom domain, so **every
`src/app/api/*` handler is unreachable on the production hostnames**, including the Stripe
webhook. They still respond on `*.workers.dev` preview URLs, which the offline routes don't
cover. Rules:

- Don't add client code that calls `/api/*`, `api.optic.works` or `medusa.optic.works`.
- Don't add new same-origin API routes. They would fail silently in production.
- Don't remove or change the four offline routes, and don't reconnect Medusa or resume
  Hookdeck, as part of frontend work. Route IDs are recorded in PR #124
  (`snapshot-preparation-state.json`).

## Route inventory: before and after

"Before" is production on 2026-10-29 (version `690cf649`). "After" is this branch's build. Both
were crawled with headless Chromium, with a leftover cart ID and auth cookie/localStorage from
the old site present. "Legacy calls" counts requests to `/api/*`, `api.optic.works` or
`medusa.optic.works`.

| Route | Before | After |
|-------|--------|-------|
| `/` | Price `$89`, "Add to Cart" and "Ships Q4 2025" card. Pre-order CTA. Newsletter form that accepted email and discarded it | Product details link, "Not currently available to order". No newsletter. No forms |
| `/products` | Prices, "Shop hardware" / "Shop now" | "Not currently available to order". Contact CTA |
| `/products/ow-1-dev-kit` | Price, ADD TO CART, made-up 4.97★ (312 reviews), four "Verified Purchase" testimonials, "Free Shipping" / "Ships in 2 business days" | Product info plus an availability notice with the support email. No price, reviews, testimonials or shipping claims |
| `/store` | Product grid with Add to Cart. ISR fetched Medusa every 5 min (fell back to the static catalog) | Unavailable page. Static, no Medusa call |
| `/store/cart` | SSR cart fetch. **4 calls to `api.optic.works/store/carts` → 503**, 15 console errors | Unavailable page. Static |
| `/store/cart/success` | "Thank you for your order!" for any `session_id` | Unavailable page |
| `/account` | Redirect to login. **Calls `/api/auth/me` and `/api/account/payment-methods` → 503**, never settles | Unavailable page. No redirect |
| `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password` | Live forms posting to `/api/auth/*` (503 in prod) | Unavailable page |
| `/support/contact` | Form posting to a stub that returned fake success (and 503s in prod). **Calls `/api/turnstile/site-key` → 503**, never settles. "Respond within 2 hours" | Email instructions (support@optic.works) |
| `/support/warranty` | Fake claim form (2 s delay, then "submitted"). "Lifetime coverage" / "24 hours" claims | Email instructions. Warranty claims removed (see legal review) |
| `/support/orders` | Order lookup returning **mock orders** | Email instructions |
| `/support/billing` | Invoice lookup and refund request returning **mock data / fake success** | Email instructions |
| `/support/compatibility` | Vehicle checker returning **mock results** for non-existent products | Email instructions |
| `/support/faq` | Shipping-time, international-shipping, HIPAA/clinic-approval and Discord/2-hour-response answers | Those answers removed or redirected to email (see below) |
| `/support`, `/install-guides/*`, `/support/legal*` | Rendered | Rendered. CTAs no longer link to the store |
| Global nav | Cart icon, Log In, "Pre-order OW-1" | "Contact us". Cart/account only when commerce is enabled |
| Footer | "OpticWorks Inc., San Francisco", broken `github.com/opticworks`, unverified X/YouTube, Careers/Discord → contact page | OpticWorks, Inc., San Diego address, support email, working links only |
| Metadata | `metadataBase` `https://opticworks.com` (an unrelated live site), no canonical, `@opticworks` Twitter creator | `https://optic.works`, self-canonical on every page, no unverified handle |

After the change, 27 routes were crawled with **zero legacy calls** and zero page/console
errors (apart from the expected 404 resource on `/does-not-exist`).

## Code kept vs removed

**Kept for future commerce:** reachable only when `COMMERCE_ENABLED` is true.
`src/components/legacy/*` (account, auth, order success), `src/components/store/*`,
`src/components/checkout/{CheckoutForm,CheckoutWrapper,ShippingSelector}.tsx`,
`src/components/account/SavedPaymentMethods.tsx`, `src/components/products/FinalCTA.tsx`,
`src/hooks/{useCart,useAuth,useCheckoutState,useMedusaShipping}.ts`, `src/lib/api/medusa*.ts`,
`src/lib/cart/*`, `src/lib/api/{easypost,order-polling,payment-methods}.ts`,
`src/middleware.ts`, and all `src/app/api/*` handlers listed in PR #124's frontend route
catalog except the two removed below. Treat these as reference for the new backend, not a
contract to preserve.

**Removed:** unreachable in every configuration, or misleading.
- Fake behavior: newsletter form, contact form + `/api/email/send` stub (fake success),
  `/api/turnstile/site-key` (only used by that form), warranty claim form, order/billing/
  compatibility mock "API" stubs (`src/lib/api/{orders,billing,compatibility}.ts`), disabled
  email templates, made-up reviews and "Verified Purchase" testimonials.
- Template/marketing leftovers never imported by any route (81 files: unused
  `components/ui/*`, `components/products/*` sections for products not in the catalog, Solar
  template logos, `XaiLanding`, `Navbar`, `Map`, tinting-law data, gradients, analytics,
  QStash, circuit breaker, unused checkout sub-components and types). 94 files deleted in total.
- Dependencies: `@easypost/api` (Workers use REST), `@hookform/resolvers`,
  `react-hook-form`, `zod`, `@marsidev/react-turnstile`, `@radix-ui/react-{dialog,select,switch}`,
  `@upstash/qstash`, `framer-motion`, `@tailwindcss/forms`.
- `useAuthInit` (never called).

Fixed rather than removed: `/api/easypost/validate-address` imported rate-limit helpers that
didn't exist (`checkRateLimit`, `RATE_LIMITS`, ...). It now uses `rateLimit`/`buildRateLimitKey`.

## Engineering baseline

| Check | Before | After |
|-------|--------|-------|
| `pnpm lint` | Pass, 2 warnings | Pass, `--max-warnings=0` |
| `pnpm typecheck` (`tsc --noEmit`) | **144 errors**: 136 in standalone `backend/` (deps not installed at root), 8 in `src/` (missing rate-limit exports, Footer `external` typing, ContactForm Turnstile props) | 0 errors. `backend/` and `platform/` excluded (standalone projects) |
| `pnpm test` | 5 tests | 8 tests (adds the commerce kill-switch suite) |
| `pnpm cf:build` | Pass **only because** `ignoreBuildErrors`/`ignoreDuringBuilds` hid the errors above ("Attempted import error" warnings). Called Medusa at build time | Pass with build-time lint and type checking enabled (~2 min; no hang). No backend calls at build |
| CI | Only the agent review bots (hammer/anvil/forge) | `.github/workflows/ci.yml`: lint, typecheck, test, `cf:build` on every PR and on pushes to `main` |

## Hugo docs audit

`platform/docs-site` (docs.optic.works) has 12 Markdown pages. Findings:

- **Product mismatch.** The docs describe a "Bed Presence Sensor" with sleep-stage and
  breathing-rate monitoring (±2 BPM), 24 GHz radar, Wi-Fi + BLE, Matter, and a mobile
  "OpticWorks app (iOS/Android)" used for setup, calibration and sensitivity. The website
  describes the OW-1 developer kit (60 GHz, Thread, Home Assistant entities). Breathing/sleep
  monitoring reads as a health claim. Verify it or remove it.
- **Unverified hardware details:** LED colour codes, factory-reset sequence, included power
  adapter and mounting hardware, 2.4 GHz-only setup network `OpticWorks-XXXX`.
- **Empty stubs:** `support/`, `products/` and `troubleshooting/` index pages have no
  content. The "Support" section promises warranty and contact info that isn't there.
- **Architecture docs:** the docs-site README described a Geekdoc theme, `hugo.toml` and a
  `/docs` mount that don't exist. It has been corrected (`hugo.yaml`, local `opticboot`
  theme, Pages project `opticworks-docs`).
- No commerce or Medusa assumptions were found in the docs content itself.

The docs content was not rewritten in this cleanup. It belongs to the product redesign.

## Company website redesign

The redesign branch (`feat/company-website-redesign`) replaces the Presence storefront with
the company site described in the README:

- Retired with **410 Gone** (`src/middleware.ts`): `/products/ow-1-dev-kit`, `/install-guides`
  and everything under it, `/support/faq`, `/support/warranty`, `/support/compatibility`,
  `/support/legal/tinting-laws`. None of that hardware shipped with an ongoing support obligation.
- Redirected (`next.config.ts`): `/support/contact` → `/contact`; `/support/orders`,
  `/support/billing`, `/support/legal` → `/support` (permanent); `/legal/privacy` and
  `/legal/terms` → `/support/legal/*` (temporary until #126).
- Legacy store/auth/account routes render only `ServiceUnavailable`; their components are no
  longer bundled.
- Items 3, 7 and 9 below are resolved by the redesign. Item 1 (legal) is unchanged: the legal
  page bodies were not edited, only their page titles.

## Remaining issues (for the redesign, in priority order)

1. **Legal pages need owner/legal review (not edited here).** Privacy Policy and Terms name
   "OpticWorks LLC", give `privacy@opticworks.com` / `legal@opticworks.com` (a domain we don't
   control, which serves an unrelated live site) and a `[Address]` placeholder. Warranty
   terms are inconsistent across the site: "2 years hardware" (product spec, FAQ), earlier
   "lifetime" (removed from the warranty page), and a 30-day return policy (FAQ). Decide on
   the actual obligations, then update the legal pages, the FAQ and the product spec together.
2. **Product truth.** Reconcile the OW-1 claims (60 GHz, NPU, Matter over Thread, "months of
   battery life", 5-person tracking, sub-100 ms) with real hardware. The docs site (above)
   contradicts them.
3. **Template leftovers still routed:** `/install-guides/cybershade-irx-tesla-model-y`
   (window-tint film), `/support/legal/tinting-laws` (titled "Presence compliance by
   region"), `/install-guides/presence-duo-pack` and `adjustable-base` (products not in the
   catalog). Remove or redirect during the redesign.
4. **Stripe webhook logs full Checkout Session objects** (`src/app/api/stripe/webhook/route.ts`,
   including customer details) and the Medusa client logs request URLs. Fix before
   re-enabling commerce.
5. **E2E suite** (`e2e/`) covers only the legacy commerce flow. Replace it with smoke tests for
   the new site (nav, legal, contact, no `/api/*` calls). The crawl used for this PR is a
   starting point.
6. **`next lint` is deprecated** (removed in Next 16). Migrate to the ESLint CLI flat config.
7. **Unused UI kit and fonts:** several font families (Barlow, Colfax, Feature, Inter, Space
   Grotesk, Geist Mono) are loaded globally. Trim them with the new visual language.
8. **Analytics:** Google Analytics (`G-ZVKN68R4Y7`) is loaded on every page. Check that
   consent and privacy-policy coverage match the new policy.
9. **`package.json` name** is still `template-solar`.
10. **Removed social links** (X, GitHub org, YouTube, Discord): add them back only with
    verified accounts.

## Re-enabling commerce (later)

1. ~~Stand up the new backend~~ (done 2026-10-30, dark: core Store/Auth/Admin APIs only, no
   custom routes). Finish launch readiness (#138), then decide the frontend's API surface. Don't
   assume the legacy Medusa contract.
2. Remove or re-point the offline Worker routes deliberately (see PR #124).
3. Set `COMMERCE_ENABLED = true` and the env flag. Review `src/components/legacy/*`, purchase
   copy and legal terms before deploying.
4. Restore CI-covered E2E tests for checkout.
