# Architecture Overview

System architecture for the OpticWorks e-commerce platform.

---

## System Diagram

```
                          INTERNET
                             |
         +-------------------+-------------------+
         |                   |                   |
         v                   v                   v
   Cloudflare Workers   Cloudflare Tunnel     Hookdeck
   (optic.works)        (api.optic.works)    (webhooks)
   OpenNext + Next.js   (medusa.optic.works)
         |                   |                   |
         |                   |                   |
         +-------------------+-------------------+
                             |
                             v
                      HETZNER CLOUD
               +-------------------------+
               |     Medusa Backend      |
               |   PostgreSQL 17         |
               |   Redis 7.x             |
               +-------------------------+
                             |
                             v
                         Stripe
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

## Related Docs

- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Ansible playbooks
- [STRIPE_INTEGRATION.md](STRIPE_INTEGRATION.md) - Payment flow
- [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) - Zustand patterns
