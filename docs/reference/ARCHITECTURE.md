# Architecture Overview

**Updated**: 2025-12-03

High-level system architecture for the OpticWorks e-commerce platform.

---

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                 │
└──────────────────────────────┬──────────────────────────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Cloudflare    │  │   Cloudflare    │  │    Hookdeck     │
│    Workers      │  │     Tunnel      │  │   (Webhooks)    │
│  (optic.works)  │  │(api.optic.works)│  │                 │
│                 │  │(medusa.optic.   │  │                 │
│   OpenNext +    │  │    works)       │  │                 │
│   Next.js 15    │  │                 │  │                 │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                    │
         │  SSR requests use  │                    │
         │  medusa.optic.works│                    │
         │  (bypasses hairpin)│                    │
         └────────────────────┼────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       HETZNER CLOUD                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Medusa Backend                        │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │    │
│  │  │   Store     │  │   Admin     │  │    CORS     │      │    │
│  │  │   API       │  │   Panel     │  │  (native)   │      │    │
│  │  │ /store/*    │  │   /app      │  │             │      │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │    │
│  │                          │                               │    │
│  │                          ▼                               │    │
│  │  ┌─────────────┐  ┌─────────────┐                       │    │
│  │  │ PostgreSQL  │  │    Redis    │                       │    │
│  │  │     17      │  │    7.x      │                       │    │
│  │  └─────────────┘  └─────────────┘                       │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
                    ┌─────────────────┐
                    │     Stripe      │
                    │  (Payments)     │
                    └─────────────────┘
```

---

## Hostnames

| Hostname | Purpose | Routing |
|----------|---------|---------|
| `optic.works` | Storefront | Cloudflare Workers (OpenNext) |
| `www.optic.works` | Storefront alias | Cloudflare Workers (OpenNext) |
| `api.optic.works` | Client-side Medusa API | Cloudflare Tunnel → Medusa |
| `medusa.optic.works` | SSR Medusa API | Cloudflare Tunnel → Medusa |

**Note**: Both `api.optic.works` and `medusa.optic.works` point to the same Medusa backend. The SSR hostname (`medusa.optic.works`) bypasses the Cloudflare edge hairpin issue that occurs when Workers call Cloudflare-proxied domains.

---

## Components

### Storefront (Next.js 15)

**URL**: https://optic.works
**Platform**: Cloudflare Workers (via OpenNext adapter)
**Dev**: http://localhost:3000

**Technology**:
- Next.js 15.5 (App Router)
- React 19
- Tailwind CSS 4
- Shadcn UI components
- Zustand (state management)
- Stripe Elements (payment UI)
- OpenNext for Cloudflare Workers deployment
- R2 for incremental cache (ISR/SSG)

**Key directories**:
```
src/
├── app/              # Pages and API routes
├── components/       # React components
├── hooks/            # Zustand stores
└── lib/api/          # Backend integration
```

**Deployment**:
```bash
unset NODE_ENV && pnpm run cf:build
pnpm exec wrangler deploy --env production
```

### Medusa Backend (v2.11.3)

**URL**: https://api.optic.works
**Admin**: https://api.optic.works/app
**SSR URL**: https://medusa.optic.works (internal)

**Technology**:
- Medusa v2 (modular commerce)
- PostgreSQL 17 (data)
- Redis 7.x (cache, sessions)
- PM2 (process manager)
- Cloudflare Tunnel (ingress)

**Key APIs**:
- `/store/products` - Product catalog
- `/store/carts` - Cart management
- `/store/auth` - Customer authentication
- `/admin/*` - Admin dashboard API

**CORS Configuration** (in `medusa-config.ts`):
```typescript
http: {
  storeCors: process.env.STORE_CORS,   // https://optic.works,https://www.optic.works
  adminCors: process.env.ADMIN_CORS,   // https://api.optic.works
  authCors: process.env.AUTH_CORS,     // https://api.optic.works
}
```

### Infrastructure (Ansible)

**Location**: `infrastructure/ansible/`

**Playbooks**:
- `medusa-provision.yml` - Full stack deployment
- `medusa-deploy.yml` - Code updates only
- `medusa-destroy.yml` - Teardown

**Principle**: Infrastructure-as-Code. Never edit server directly.

---

## Data Flow

### Product Browsing

```
User → Storefront → Medusa Store API → PostgreSQL
                          ↓
                    Product data
                          ↓
                    Storefront renders
```

**SSR Path** (Server-side in Workers):
```
OpenNext Worker → medusa.optic.works → Tunnel → Medusa
```

**Client Path** (Browser):
```
Browser → api.optic.works → Tunnel → Medusa
```

### Add to Cart

```
User clicks "Add" → Zustand (optimistic) → Medusa Cart API
                                                  ↓
                                             Redis (session)
                                                  ↓
                                             Cart synced
```

### Checkout

```
User → Checkout Form → createPaymentSession(cartId)
                              ↓
                       Medusa → Stripe PaymentIntent
                              ↓
                       client_secret returned
                              ↓
                       Stripe Elements → User pays
                              ↓
                       completeCart(cartId) → Medusa Order
```

### Webhooks

```
Stripe → Hookdeck (buffer/retry) → optic.works/api/stripe/webhook
                                          ↓
                                   Order status updated
```

---

## Key Integration Points

### Storefront ↔ Medusa

**File**: `src/lib/api/medusa.ts`

**URL Selection**:
```typescript
const getBaseUrl = () => {
  // Server-side: use direct tunnel (avoids Cloudflare hairpin)
  if (typeof window === 'undefined' && process.env.MEDUSA_SSR_BASE_URL) {
    return process.env.MEDUSA_SSR_BASE_URL  // medusa.optic.works
  }
  // Client-side: use public API
  return process.env.NEXT_PUBLIC_MEDUSA_BASE_URL  // api.optic.works
}
```

**Functions**:
- `listProducts()` - Fetch catalog
- `createCart()` - Initialize cart
- `addLineItem()` - Add to cart
- `createPaymentSession()` - Start checkout
- `completeCart()` - Finalize order

**Auth**: `x-publishable-api-key` header

### Storefront ↔ Stripe

**File**: `src/components/checkout/CheckoutForm.tsx`

**Pattern**:
1. Get `client_secret` from Medusa
2. Initialize Stripe Elements
3. User submits payment
4. Confirm with Stripe SDK

### Medusa ↔ Stripe

**Config**: `backend/medusa-config.ts`

**Provider**: Medusa Stripe plugin handles:
- Payment intent creation
- Webhook processing
- Order completion

---

## Environment Separation

| Environment | Storefront | Backend | Database |
|-------------|------------|---------|----------|
| Development | localhost:3000 | localhost:9000 | Docker |
| Production | optic.works | api.optic.works | Hetzner |

---

## Security

### Secrets

- **Source of truth**: Infisical
- **Storefront**: `pnpm run secrets:pull` → `.env.local`
- **Backend**: Ansible pulls from Infisical

### Network

- **Cloudflare Tunnel**: Backend not directly exposed to internet
- **Hookdeck**: Webhook gateway with retry/logging
- **HTTPS**: All traffic encrypted
- **CORS**: Handled natively by Medusa (no proxy worker needed)

### Authentication

- **Customers**: Medusa customer auth (httpOnly cookies)
- **Admin**: Medusa admin dashboard login
- **API**: Publishable key (public), Secret key (server-only)

---

## Cloudflare Configuration

### Workers (wrangler.jsonc)

```jsonc
{
  "name": "opticworks-store",
  "main": ".open-next/worker.js",
  "vars": {
    "NEXT_PUBLIC_MEDUSA_BASE_URL": "https://api.optic.works",
    "MEDUSA_SSR_BASE_URL": "https://medusa.optic.works"
  },
  "r2_buckets": [
    { "binding": "NEXT_INC_CACHE_R2_BUCKET", "bucket_name": "opticworks-cache" }
  ]
}
```

### Tunnel (/etc/cloudflared/config.yml on Hetzner)

```yaml
tunnel: db4738a9-20b7-4dd7-bde2-0760e0188071
credentials-file: /root/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: api.optic.works
    service: http://localhost:9000
  - hostname: medusa.optic.works
    service: http://localhost:9000
  - service: http_status:404
```

---

## Monitoring

### Backend Health

```bash
ssh hetzner-node
pm2 status              # Process status
pm2 logs medusa-dev     # Application logs
curl https://api.optic.works/health
```

### Database

```bash
ssh hetzner-node
sudo -u postgres psql medusa
\dt                     # List tables
```

### Webhooks

Check Hookdeck dashboard for delivery status and retries.

### Cloudflare Workers

Check Cloudflare dashboard → Workers & Pages → opticworks-store → Logs

---

## Related Docs

- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Ansible playbooks
- [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) - Zustand patterns
- [STRIPE_INTEGRATION.md](STRIPE_INTEGRATION.md) - Payment flow
- [PHASE3_PLAN.md](PHASE3_PLAN.md) - Implementation status
