# Architecture Overview

System architecture for the OpticWorks e-commerce platform.

---

## System Diagram

```
                          INTERNET
                             |
                    +--------+--------+
                    |                 |
                    v                 v
             Cloudflare WAF      Hookdeck
             (Rate Limiting)     (webhooks)
                    |
         +-------------------+-------------------+
         |                   |                   |
         v                   v                   v
   Cloudflare Workers   Cloudflare Tunnel    Cloudflare KV
   (optic.works)        (api.optic.works)    (shipping cache)
   OpenNext + Next.js   (medusa.optic.works)
         |                   |
         |                   |
         +-------------------+-------------------+
         |                                       |
         v                                       v
   HETZNER CLOUD                            Upstash QStash
   +-------------------------+              (background jobs)
   |     Medusa Backend      |
   |   PostgreSQL 17         |
   |   Redis 7.x             |
   +-------------------------+
         |           |
         v           v
      Stripe     EasyPost
               (shipping rates)
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
Stripe --> Hookdeck --> optic.works/api/stripe/webhook
```

### Shipping Rates

```
User enters address --> useShippingRates (500ms debounce)
                                |
                                v
                    POST /api/shipping/rates
                                |
                    +-----------+-----------+
                    |                       |
                    v                       v
              KV Cache HIT?           KV Cache MISS
              Return cached      Circuit Breaker Check
                    |                       |
                    |           +-----------+-----------+
                    |           |                       |
                    |           v                       v
                    |    Circuit OPEN            Circuit CLOSED
                    |    Return mock rates       Call EasyPost (3s timeout)
                    |                                   |
                    |                       +-----------+-----------+
                    |                       |                       |
                    |                       v                       v
                    |                   Success                  Timeout
                    |                   Cache in KV              Return mock
                    |                   Return rates             rates
                    v                       |                       |
              +-----+-----------------------+-----------------------+
              |
              v
         Return to frontend
```

**Protection Layers**:
1. **Cloudflare WAF** - 5 req/10s per IP on `/api/shipping` + `/api/checkout`
2. **Frontend Debouncing** - 500ms delay before API call
3. **In-Memory Rate Limit** - 20 req/min per IP
4. **KV Cache** - 10-minute TTL for shipping rates
5. **Circuit Breaker** - Opens after 5 failures, resets after 5 minutes
6. **API Timeout** - 3 seconds max for EasyPost calls

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
| **EasyPost** | Real-time shipping rates | Mock rates |
| **Stripe** | Payment processing | N/A |
| **Hookdeck** | Webhook routing | N/A |
| **Upstash QStash** | Background jobs (future) | Sync processing |

---

## Related Docs

- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Ansible playbooks
- [STRIPE_INTEGRATION.md](STRIPE_INTEGRATION.md) - Payment flow
- [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) - Zustand patterns
- [CLOUDFLARE_API.md](CLOUDFLARE_API.md) - API access, WAF rules, KV
- [FULFILLMENT.md](FULFILLMENT.md) - Shipping rates, EasyPost integration
