# Architecture Overview

**Updated**: 2025-12-02

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
│     Pages       │  │     Tunnel      │  │   (Webhooks)    │
│  (optic.works)  │  │(api.optic.works)│  │                 │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                    │
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                       HETZNER CLOUD                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Medusa Backend                        │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │    │
│  │  │   Store     │  │   Admin     │  │  Webhooks   │      │    │
│  │  │   API       │  │   API       │  │   Handler   │      │    │
│  │  │ /store/*    │  │ /admin/*    │  │ /webhooks/* │      │    │
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

## Components

### Storefront (Next.js 15)

**URL**: https://optic.works (Phase 4: Cloudflare Pages)
**Dev**: http://localhost:3000

**Technology**:
- Next.js 15.5 (App Router)
- React 19
- Tailwind CSS 4
- Shadcn UI components
- Zustand (state management)
- Stripe Elements (payment UI)

**Key directories**:
```
src/
├── app/              # Pages and API routes
├── components/       # React components
├── hooks/            # Zustand stores
└── lib/api/          # Backend integration
```

### Medusa Backend (v2.11.3)

**URL**: https://api.optic.works
**Admin**: https://api.optic.works/app

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
Stripe → Hookdeck (buffer/retry) → Medusa /webhooks/stripe
                                          ↓
                                   Order status updated
```

---

## Key Integration Points

### Storefront ↔ Medusa

**File**: `src/lib/api/medusa.ts`

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

- **Cloudflare Tunnel**: Backend not directly exposed
- **Hookdeck**: Webhook gateway with retry/logging
- **HTTPS**: All traffic encrypted

### Authentication

- **Customers**: Medusa CIAM (pending Track 6)
- **Admin**: Medusa admin dashboard login
- **API**: Publishable key (public), Secret key (server-only)

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

---

## Related Docs

- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Ansible playbooks
- [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) - Zustand patterns
- [STRIPE_INTEGRATION.md](STRIPE_INTEGRATION.md) - Payment flow
- [PHASE3_PLAN.md](PHASE3_PLAN.md) - Implementation status
