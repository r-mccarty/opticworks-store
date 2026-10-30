# Website while commerce is offline

Status as of **2026-10-30**. This describes the running website (`optic.works`) and what it
depends on. For the backend, see [`infrastructure/ansible/README.md`](../../infrastructure/ansible/README.md).
For the retired legacy backend, see [LEGACY_BACKEND_SNAPSHOT.md](LEGACY_BACKEND_SNAPSHOT.md) and
[LEGACY_BACKEND_API.md](LEGACY_BACKEND_API.md).

## Summary

- The site is a **company and product website with no backend dependency** in production.
  It has no account, auth or API code, and it needs no secrets or environment variables.
- A new **store frontend** is switched on for testing (`STORE_MODE=medusa`). It calls the dark
  backend server-side, in test mode, and stops before payment. See
  [STORE_FRONTEND.md](STORE_FRONTEND.md).
- Routes: `/`, `/products`, `/products/vmc`, `/products/mach-1`, `/platform`, `/technology`,
  `/journal` (+ `/journal/[slug]`, `/journal/feed.xml`), `/about`, `/contact`, `/support`,
  `/support/legal/privacy`, `/support/legal/terms`. Store routes: `/store`, `/cart`, `/checkout`
  and `/checkout/confirmation`. Anything else is a 404.
- `/legal/privacy` and `/legal/terms` redirect (temporarily) to `/support/legal/*` until the
  legal review (#126). These are the only redirects (`next.config.ts`).
- Support is by email to **support@optic.works**. The site has no forms.
- Company identity: **OpticWorks, Inc.**, 3077B Clairemont Dr. #201, San Diego, CA 92117.
  Canonical origin `https://optic.works`. Every page emits a self-canonical URL.
- The new Medusa backend runs **dark** at `backend.optic.works` (Cloudflare Access only). The
  website doesn't call it. Launch readiness: #138.

## Edge routing

| Pattern | Served by | Behaviour |
|---------|-----------|-----------|
| `optic.works`, `www.optic.works` | Worker `opticworks-store` (this repo) | Website |
| `optic.works/api/*`, `www.optic.works/api/*` | Worker `opticworks-backend-offline-20261029` ([source](../../infrastructure/workers/backend-offline/)) | `503 {"code":"BACKEND_OFFLINE"}` |
| `api.optic.works/*`, `medusa.optic.works/*` | same | `503 {"code":"BACKEND_OFFLINE"}` |
| `backend.optic.works` | Cloudflare Access → tunnel → new backend | Owners/service token only |
| `docs.optic.works` | Nothing | Taken down on 2026-10-30: Pages project `opticworks-docs`, its custom domain and DNS record deleted. The hostname doesn't resolve |

Don't remove or change the four offline routes, and don't resume the paused Hookdeck
connections, as part of website work. Route IDs are recorded in
`legacy-api/snapshot-preparation-state.json`.

## Removed on 2026-10-30

The repository was scrubbed of the previous product line and the legacy commerce frontend.
Nothing was archived in-tree; git history has it. The removals:

- **Presence/CyberShade/OW-1:** the 410-Gone middleware and retired-path list
  (`/products/ow-1-dev-kit`, `/install-guides/*`, `/support/{faq,warranty,compatibility}`,
  `/support/legal/tinting-laws`), and the old support redirects (`/support/{contact,orders,billing,legal}`).
  These URLs now 404. Also removed: the OW-1 static catalog and image, the Hugo docs site
  (`platform/docs-site`), and the Presence community forum scaffold (`platform/forum`).
- **Legacy commerce frontend:** store, cart, checkout, account and auth routes (they now 404),
  every `src/app/api/*` handler, the Medusa client, cart/auth stores, the commerce kill switch,
  the Playwright E2E suite, and the commerce environment variables (`.env.production`,
  `wrangler.jsonc` vars and the shipping-rates KV binding; the KV namespace itself was not deleted).
- **Dependencies:** `stripe`, `@stripe/*`, `@supabase/supabase-js`, `zustand`, `sonner`,
  `lucide-react`, `@heroicons/react`, `use-debounce`, `tailwind-variants`, three unused
  `@radix-ui/*` packages, `dotenv`, `@playwright/test` and `mailosaur`.
- **Docs and tooling:** reference docs for the retired backend, checkout, payments, tax,
  fulfillment, webhooks, E2E and devices; postmortems and archived RFDs; Hookdeck
  transformations; storefront secrets scripts; the stale `hammer` review-bot config; and the
  Codespaces devcontainer (`.devcontainer/`).
- **Cloudflare:** the docs.optic.works Pages project, custom domain and DNS record; the
  storefront's Worker secrets (in a new, undeployed version); the shipping-rates KV namespace;
  and the legacy `/api/shipping|checkout` rate-limit ruleset.

The legacy API catalog ([LEGACY_BACKEND_API.md](LEGACY_BACKEND_API.md), `legacy-api/`) stays as
the record of the old contract. When commerce returns, build against the new backend rather than
restoring the old frontend.

## Open issues

1. **Legal pages need owner/legal review (#126).** Privacy Policy and Terms still name
   "OpticWorks LLC", give `privacy@opticworks.com` / `legal@opticworks.com` (a domain we don't
   control) and contain an `[Address]` placeholder.
2. **`next lint` is deprecated** (removed in Next 16). Migrate to the ESLint CLI flat config.
3. **Analytics:** Google Analytics (`G-ZVKN68R4Y7`) loads on every page. Check that consent
   and privacy-policy coverage match the new policy.
4. **Sentry isn't initialised.** `sentry.client.config.ts` is never imported (that convention
   belongs to `@sentry/nextjs`, not `@sentry/browser`), so `global-error.tsx`'s
   `captureException` sends nothing.
5. **No smoke tests.** CI runs lint, typecheck, unit tests and the build. Add browser smoke
   tests for the public routes (nav, legal, contact, no `/api/*` calls).
6. **Social links** (X, GitHub org, YouTube, Discord) stay off until there are verified accounts.

## Re-enabling commerce (later)

The storefront exists (see [STORE_FRONTEND.md](STORE_FRONTEND.md) for the remaining steps).
Finish backend launch readiness (#138), connect payment, review purchase copy and legal terms,
then set `STORE_MODE=medusa` in production. The offline `/api/*` routes can stay: the store
doesn't use `/api/*`.
