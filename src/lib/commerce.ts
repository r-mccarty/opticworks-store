/**
 * Commerce (Medusa catalog, cart, checkout, customer accounts) is offline.
 *
 * The legacy Medusa backend was archived on 2026-10-29 and the edge routes
 * `optic.works/api/*`, `www.optic.works/api/*`, `api.optic.works/*` and
 * `medusa.optic.works/*` return `503 BACKEND_OFFLINE` from a separate Worker.
 * While this is `false`, the storefront must not render purchase flows or
 * call Medusa or the same-origin `/api/*` routes.
 *
 * Re-enable only together with a live backend and removal of the offline
 * Worker routes. See docs/reference/BACKEND_OFFLINE_FRONTEND.md.
 */
export const COMMERCE_ENABLED: boolean = false
