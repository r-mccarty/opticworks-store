# Architecture Overview

System architecture for the OpticWorks e-commerce platform.

---

## System Diagram

```
                              INTERNET
                                 |
                    +------------+------------+
                    |            |            |
                    v            v            v
             Cloudflare WAF   Hookdeck    EasyPost
             (Rate Limiting)  (webhooks)  (shipping)
                    |            |            |
         +---------+    +-------+-------+    |
         |              |               |    |
         v              v               v    v
   Cloudflare Workers   |         Cloudflare Tunnel
   (optic.works)        |         (api.optic.works)
   OpenNext + Next.js   |         (medusa.optic.works)
         |              |               |
         |   Stripe webhooks    EasyPost webhooks
         |   (checkout.*)       (tracker.updated)
         |              |               |
         v              v               v
   HETZNER CLOUD ←------+---------------+
   +------------------------------------------+
   |              Medusa Backend              |
   |   PostgreSQL 17  |  Redis 7.x  |  PM2   |
   |                                         |
   |   EasyPost Fulfillment Provider         |
   |   (rates, labels, tracking)             |
   +------------------------------------------+
                    |
         +---------+---------+
         v                   v
      Stripe              EasyPost
   (payments)        (rates, labels)
```

---

## Hostnames

| Hostname | Purpose |
|----------|---------|
| `optic.works` | Storefront (Cloudflare Workers) |
| `api.optic.works` | Medusa API (client requests) |
| `medusa.optic.works` | Medusa API (SSR requests, bypasses hairpin) |

---

## Components

### Storefront

- **URL**: https://optic.works
- **Platform**: Cloudflare Workers (OpenNext adapter)
- **Stack**: Next.js 15, React 19, Tailwind 4, Shadcn, Zustand

**Deployment**:
```bash
unset NODE_ENV && pnpm run cf:build
pnpm exec wrangler deploy --env production
```

### Medusa Backend

- **URL**: https://api.optic.works
- **Admin**: https://api.optic.works/app
- **Stack**: Medusa v2, PostgreSQL 17, Redis 7, PM2

**Key APIs**:
- `/store/products` - Product catalog
- `/store/carts` - Cart management
- `/store/auth` - Customer authentication

---

## Data Flow

### Checkout

```
User adds to cart --> Zustand (optimistic) --> Medusa Cart API
                                                    |
User clicks checkout --> Payment Collection created
                                                    |
                       --> Stripe PaymentIntent created
                                                    |
User pays --> stripe.confirmPayment() --> completeCart()
                                                    |
                                              Medusa Order
```

### Webhooks

```
Stripe   --> Hookdeck --> optic.works/api/stripe/webhook
                          (checkout.session.completed, payment_intent.*)

EasyPost --> Hookdeck --> api.optic.works/webhooks/easypost-tracker
             (transformation verifies signature)
                          (tracker.updated → update fulfillment status)
```

See [WEBHOOKS.md](WEBHOOKS.md) for full webhook architecture.

### Shipping Rates (Medusa Backend Provider)

```
User enters address --> useMedusaShipping (500ms debounce)
                                |
                                v
               POST /store/carts/{id} (update address)
                                |
                                v
               GET /store/shipping-options?cart_id=xxx
                                |
                                v
               Backend EasyPost Provider
               (calculatePrice with caching)
                                |
                                v
               Return shipping options to frontend
                                |
                                v
               User selects shipping method
                                |
                                v
               POST /store/carts/{id}/shipping-methods
                                |
                                v
               Cart total includes shipping
```

**Protection Layers**:
1. **Cloudflare WAF** - Rate limiting on API routes
2. **Frontend Debouncing** - 500ms delay before API call
3. **Backend Rate Limiting** - Medusa middleware
4. **EasyPost Circuit Breaker** - Backend provider fallback to flat rates

### Fulfillment (Outbound)

```
Admin creates fulfillment in Medusa Admin
                |
                v
EasyPost Provider createFulfillment()
                |
                v
EasyPost API: Buy label with pre-created rate
                |
                v
Store tracking_number, label_url in fulfillment.data
                |
                v
EasyPost creates Tracker automatically
```

See [FULFILLMENT.md](FULFILLMENT.md) for outbound fulfillment details.

### Tracking Updates (Inbound)

```
EasyPost Tracker status changes
                |
                v
EasyPost fires tracker.updated webhook
                |
                v
Hookdeck receives, transformation verifies signature
                |
                v
api.optic.works/webhooks/easypost-tracker
                |
                v
Medusa workflow: handle-easypost-event
                |
    +-----------+-----------+
    |           |           |
    v           v           v
in_transit   delivered   failure
(mark shipped) (mark delivered) (log error)
```

See [FULFILLMENT_INBOUND.md](FULFILLMENT_INBOUND.md) for inbound architecture.

---

## Key Integration Points

### Storefront --> Medusa

**File**: `src/lib/api/medusa.ts`

```typescript
const getBaseUrl = () => {
  if (typeof window === 'undefined' && process.env.MEDUSA_SSR_BASE_URL) {
    return process.env.MEDUSA_SSR_BASE_URL  // medusa.optic.works
  }
  return process.env.NEXT_PUBLIC_MEDUSA_BASE_URL  // api.optic.works
}
```

**Auth**: `x-publishable-api-key` header

---

## Cloudflare Resources

| Resource | ID/Name | Purpose |
|----------|---------|---------|
| **Zone** | `aa28e2b93bb6af9db7a0e95d53820b92` | optic.works domain |
| **Workers** | `opticworks-store` | Storefront application |
| **R2 Bucket** | `opticworks-cache` | ISR/SSG incremental cache |
| **KV Namespace** | `e11813a7581f480ea39633e492a53222` | Shipping rates cache |
| **WAF Ruleset** | `d88b83536001478ba826e0fe4c36bb3a` | Rate limiting rules |
| **Tunnel** | `db4738a9-20b7-4dd7-bde2-0760e0188071` | Medusa API access |

See [CLOUDFLARE_API.md](CLOUDFLARE_API.md) for programmatic access.

---

## External Services

| Service | Purpose | Fallback |
|---------|---------|----------|
| **EasyPost** | Shipping rates, labels, tracking | Mock rates (test mode) |
| **Stripe** | Payment processing | N/A |
| **Hookdeck** | Webhook gateway (Stripe + EasyPost) | N/A |
| **Resend** | Transactional email | N/A |
| **Infisical** | Secrets management | N/A |
| **Mailosaur** | E2E email testing | Skip email tests |

---

## Related Docs

- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Ansible playbooks, backup & recovery
- [CHECKOUT_FLOW.md](CHECKOUT_FLOW.md) - Payment flow, Stripe deferred intent
- [FULFILLMENT.md](FULFILLMENT.md) - Shipping rates, labels (outbound)
- [FULFILLMENT_INBOUND.md](FULFILLMENT_INBOUND.md) - Tracker webhooks (inbound)
- [WEBHOOKS.md](WEBHOOKS.md) - Stripe + EasyPost webhook handling
- [E2E_TESTING.md](E2E_TESTING.md) - Playwright, Mailosaur, Hookdeck testing
- [CLOUDFLARE_API.md](CLOUDFLARE_API.md) - API access, WAF rules, KV
- [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) - Zustand patterns
