# Medusa v2 Modules Review & Recommendations

**Date**: 2025-12-01
**Reviewer**: Claude (Phase 3 Planning)
**Context**: Review of current module configuration and recommendations for production deployment

---

## Executive Summary

**Current State**: OpticWorks Medusa backend has **2 modules configured** (Payment + File)
**Recommended**: Add **4-5 additional modules** for production readiness
**Priority**: Notification module is **CRITICAL** for Phase 3 (order confirmations)

---

## Current Module Configuration

### ✅ Configured Modules

#### 1. **Payment Module** (`@medusajs/medusa/payment-stripe`)
- **Status**: ✅ Active
- **Provider**: Stripe
- **Location**: `medusa-config.ts:32-48`
- **Configuration**:
  ```typescript
  {
    id: "stripe",
    resolve: "@medusajs/medusa/payment-stripe",
    options: {
      apiKey: stripeApiKey,
      webhookSecret: stripeWebhookSecret,
      capture: true
    }
  }
  ```
- **Notes**: Properly configured with webhook secret and auto-capture enabled

#### 2. **File Module** (`@medusajs/medusa/file-s3`)
- **Status**: ✅ Active (conditional)
- **Provider**: Cloudflare R2 (S3-compatible)
- **Location**: `medusa-config.ts:51-70`
- **Configuration**:
  ```typescript
  {
    id: "r2",
    resolve: "@medusajs/medusa/file-s3",
    options: {
      access_key_id: ensure("R2_ACCESS_KEY_ID"),
      secret_access_key: ensure("R2_SECRET_ACCESS_KEY"),
      bucket: ensure("R2_BUCKET"),
      region: process.env.R2_REGION ?? "auto",
      endpoint: process.env.R2_ENDPOINT
    }
  }
  ```
- **Notes**:
  - Only enabled if R2 credentials are present
  - Aligns with Phase 4 Cloudflare migration strategy
  - Currently stores product images, admin uploads

---

## Missing Modules (Production Recommendations)

### 🔴 CRITICAL: Notification Module

**Why Critical for Phase 3**:
- Order confirmation emails
- Password reset emails
- Shipping notifications
- Customer registration confirmations

**Recommended Provider**: Resend (already in secrets inventory)

**Implementation**:
```typescript
// Add to modulesConfig in medusa-config.ts
{
  key: Modules.NOTIFICATION,
  options: {
    providers: [
      {
        id: "resend",
        resolve: "@medusajs/medusa/notification-resend",
        options: {
          api_key: ensure("RESEND_API_KEY"),
          from: process.env.FROM_EMAIL ?? "orders@optic.works"
        }
      }
    ]
  }
}
```

**Required Secrets** (already in Infisical):
- `RESEND_API_KEY` ✅
- `NEXT_PUBLIC_FROM_EMAIL` / `FROM_EMAIL` ✅

**Phase 3 Impact**:
- Track 4.3 (Complete Order) requires order confirmation emails
- Track 6.1 (Authentication) requires password reset emails
- **BLOCKER** if not implemented before Track 4 completion

**Dependencies**:
```bash
cd services/medusa
pnpm add @medusajs/medusa-notification-resend
```

---

### 🟡 HIGH PRIORITY: Fulfillment Module

**Why Important**:
- Calculate shipping rates
- Generate shipping labels
- Track shipments
- Multi-carrier support

**Recommended Provider**: EasyPost (already in secrets inventory)

**Implementation**:
```typescript
{
  key: Modules.FULFILLMENT,
  options: {
    providers: [
      {
        id: "easypost",
        resolve: "@medusajs/medusa/fulfillment-easypost",
        options: {
          api_key: ensure("EASYPOST_API_KEY")
        }
      }
    ]
  }
}
```

**Required Secrets** (already in Infisical):
- `EASYPOST_API_KEY` ✅

**Phase 3 Impact**:
- Track 1.3 (Shipping Options) currently manual
- Can upgrade to dynamic rates post-Phase 3
- **NOT A BLOCKER** for Phase 3 (manual fulfillment sufficient)

**Phase 4 Consideration**: Essential for scaling operations

**Alternative**: Manual fulfillment for MVP, add EasyPost in Phase 4

---

### 🟢 RECOMMENDED: Cache Module

**Why Important**:
- Reduce database load
- Improve API response times
- Cache product catalogs, regions, shipping options

**Recommended Provider**: Redis (already deployed)

**Implementation**:
```typescript
{
  key: Modules.CACHE,
  resolve: "@medusajs/medusa/cache-redis",
  options: {
    redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
    ttl: 300, // 5 minutes default TTL
    namespace: "medusa-cache"
  }
}
```

**Required Infrastructure**:
- Redis ✅ Already running (see Phase 2 infrastructure)
- `REDIS_URL` ✅ Already in config (`medusa-config.ts:75`)

**Phase 3 Impact**:
- Performance optimization
- **NOT A BLOCKER** for Phase 3
- Recommended to add before production traffic scales

**Benefits**:
- Faster product listing pages
- Reduced PostgreSQL query load
- Improved checkout performance under load

---

### 🟢 RECOMMENDED: Search Module

**Why Important**:
- Fast product search
- Autocomplete
- Faceted filtering (price, category, specs)
- Better UX for customers

**Recommended Providers**:

#### Option A: **Meilisearch** (Open Source, Self-Hosted)
```typescript
{
  key: Modules.SEARCH,
  resolve: "@medusajs/medusa/search-meilisearch",
  options: {
    host: process.env.MEILISEARCH_HOST ?? "http://localhost:7700",
    apiKey: process.env.MEILISEARCH_API_KEY
  }
}
```

**Pros**:
- Open source, can self-host on Hetzner
- Fast, typo-tolerant search
- Great for small-to-medium catalogs (<10k products)

**Cons**:
- Requires additional infrastructure (can deploy via Ansible)
- Need to maintain another service

#### Option B: **Algolia** (SaaS)
```typescript
{
  key: Modules.SEARCH,
  resolve: "@medusajs/medusa/search-algolia",
  options: {
    applicationId: ensure("ALGOLIA_APP_ID"),
    adminApiKey: ensure("ALGOLIA_ADMIN_KEY")
  }
}
```

**Pros**:
- Zero infrastructure management
- Excellent performance and relevance
- Great developer experience

**Cons**:
- Paid service (free tier: 10k searches/month)
- Additional dependency

**Phase 3 Impact**:
- **NOT REQUIRED** for Phase 3 (7 products, no search needed yet)
- Recommended for Phase 4 when catalog grows
- Can implement basic client-side search for MVP

**Recommendation**: Defer to Phase 4, implement basic fuzzy search in Next.js for now

---

### 🔵 OPTIONAL: Event Bus Module

**Why Optional**:
- Medusa v2 has built-in event bus (default implementation)
- Custom event bus only needed for:
  - High-volume event processing
  - External event streaming (Kafka, RabbitMQ)
  - Advanced async workflows

**Default Implementation**: In-memory (sufficient for Phase 3)

**When to Upgrade**:
- Phase 4+ when scaling to high order volumes
- When integrating with external systems (analytics, CRM, warehouse)

**Example (Redis Event Bus)**:
```typescript
{
  key: Modules.EVENT_BUS,
  resolve: "@medusajs/medusa/event-bus-redis",
  options: {
    redisUrl: process.env.REDIS_URL
  }
}
```

**Phase 3 Impact**:
- **NOT NEEDED** for Phase 3
- Default event bus handles webhooks, notifications, order workflows
- Defer to Phase 4

---

## Secrets Inventory Alignment

### ✅ Already in Infisical (from `KEY_MANAGEMENT.md`)

**Notification-Ready**:
- `RESEND_API_KEY` (line 64)
- `NEXT_PUBLIC_FROM_EMAIL` (line 65)

**Fulfillment-Ready**:
- `EASYPOST_API_KEY` (line 84)

**File Storage-Ready**:
- `R2_ACCESS_KEY_ID` (line 70)
- `R2_SECRET_ACCESS_KEY` (line 71)
- `R2_BUCKET_NAME` (line 72)
- `R2_ENDPOINT_URL` (line 73)

**Cache-Ready**:
- `REDIS_URL` (already in `medusa-config.ts:75`)

### ❌ Missing from Infisical

If implementing search:
- `MEILISEARCH_HOST` (if self-hosting)
- `MEILISEARCH_API_KEY`
- OR `ALGOLIA_APP_ID` + `ALGOLIA_ADMIN_KEY` (if using Algolia)

---

## Phase 3 Integration Plan

### Track 1.4: Add Notification Module (NEW)

**Duration**: 1 hour
**Dependencies**: None (can run in parallel with Track 1.1-1.3)
**Priority**: 🔴 CRITICAL for Track 4.3 (Order Completion)

#### Actions:

1. **Install Resend Provider**:
   ```bash
   cd services/medusa
   pnpm add @medusajs/medusa-notification-resend
   ```

2. **Update `medusa-config.ts`**:
   ```typescript
   // Add after File module configuration (line 70)
   modulesConfig.push({
     key: Modules.NOTIFICATION,
     options: {
       providers: [
         {
           id: "resend",
           resolve: "@medusajs/medusa-notification-resend",
           options: {
             api_key: ensure("RESEND_API_KEY"),
             from: process.env.FROM_EMAIL ?? "orders@optic.works"
           }
         }
       ]
     }
   })
   ```

3. **Add `FROM_EMAIL` to Infisical** (if not already there):
   - Variable: `FROM_EMAIL`
   - Value: `orders@optic.works` (or verified Resend domain)

4. **Verify Resend Domain**:
   - Ensure `optic.works` domain is verified in Resend dashboard
   - Or use Resend sandbox email for testing

5. **Deploy Configuration**:
   ```bash
   cd infrastructure/ansible
   bash scripts/generate-secrets-from-infisical.sh
   ansible-playbook playbooks/medusa-deploy.yml
   ```

6. **Verify Notification Module**:
   ```bash
   ssh hetzner-node
   pm2 logs medusa-dev | grep notification
   # Should see: "Notification module loaded: resend"
   ```

7. **Test Order Confirmation Email** (after Track 4.3):
   - Complete test order
   - Check email delivery
   - Verify Resend dashboard for logs

#### Email Templates Needed (Phase 3):

**Order Confirmation** (`order.placed`):
- Subject: "Order Confirmation - Order #{{order.display_id}}"
- Body: Order summary, items, total, tracking link
- Template: Create in `services/medusa/src/subscribers/order-placed.ts` (Medusa auto-subscribes)

**Customer Registration** (`customer.created`):
- Subject: "Welcome to OpticWorks"
- Body: Welcome message, account info
- Template: Create in `services/medusa/src/subscribers/customer-created.ts`

**Password Reset** (handled by Medusa auth):
- Built-in template (customizable)

---

### Optional: Track 1.5: Add Cache Module (RECOMMENDED)

**Duration**: 30 minutes
**Priority**: 🟢 Recommended for performance
**Can Defer**: Not blocking Phase 3

#### Quick Implementation:

```typescript
// Add to modulesConfig in medusa-config.ts
modulesConfig.push({
  key: Modules.CACHE,
  resolve: "@medusajs/medusa/cache-redis",
  options: {
    redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
    ttl: 300, // 5 minutes
    namespace: "medusa-cache"
  }
})
```

**Benefits**: Faster product API, reduced DB load
**Risk**: None (fallback to no-cache if Redis unavailable)

---

## Phase 4 Module Roadmap

### Short-Term (Phase 4A: 3-6 months)

1. **Fulfillment Module** (EasyPost)
   - Dynamic shipping rates
   - Label generation
   - Tracking integration

2. **Search Module** (Meilisearch or Algolia)
   - Product search
   - Autocomplete
   - Filtering

3. **Event Bus** (Redis)
   - Async webhook processing
   - Analytics event streaming
   - Workflow optimization

### Long-Term (Phase 4B+: 6-12 months)

4. **Tax Provider** (TaxJar or Avalara)
   - Automated sales tax calculation
   - Multi-jurisdiction compliance
   - Tax nexus management

5. **Inventory Module** (Custom or WMS Integration)
   - Multi-location inventory
   - Stock alerts
   - Reservation system

6. **Customer Insights** (Segment)
   - Customer data platform
   - Analytics integration
   - Personalization

---

## Cloudflare Workers Migration (Phase 4)

### Current Architecture (Phase 3):
```
Next.js (Vercel) → Medusa (Hetzner) → PostgreSQL + Redis
                                    → R2 (assets)
```

### Target Architecture (Phase 4):
```
Next.js (Cloudflare Workers) → Medusa (Hetzner) → PostgreSQL + Redis
                                                 → R2 (assets)
                                                 → Workers KV (edge cache)
```

### Module Considerations:

#### File Module: Already R2-Ready ✅
- Current configuration uses Cloudflare R2
- No migration needed
- Just update CORS for Workers domain

#### Cache Module: Add Workers KV
```typescript
{
  key: Modules.CACHE,
  resolve: "@medusajs/medusa/cache-cloudflare-kv",
  options: {
    namespaceId: process.env.CF_KV_NAMESPACE_ID,
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    apiToken: process.env.CLOUDFLARE_API_TOKEN
  }
}
```

**Benefits**:
- Edge caching (global)
- Reduced latency for product data
- Better Workers integration

#### Edge Compatibility:
All recommended modules are Workers-compatible:
- ✅ Notification (Resend has Workers SDK)
- ✅ Payment (Stripe has Workers SDK)
- ✅ File (R2 native to Cloudflare)
- ✅ Cache (Workers KV native)
- ✅ Fulfillment (EasyPost has REST API)

---

## Configuration Examples

### Full Production Config (Phase 4 Target)

```typescript
// services/medusa/medusa-config.ts
const modulesConfig: Array<Record<string, unknown>> = [
  // Payment (Stripe)
  {
    key: Modules.PAYMENT,
    options: {
      providers: [
        {
          id: "stripe",
          resolve: "@medusajs/medusa/payment-stripe",
          options: {
            apiKey: ensure("STRIPE_API_KEY"),
            webhookSecret: ensure("STRIPE_WEBHOOK_SECRET"),
            capture: true
          }
        }
      ]
    }
  },

  // File Storage (Cloudflare R2)
  {
    key: Modules.FILE,
    options: {
      providers: [
        {
          id: "r2",
          resolve: "@medusajs/medusa/file-s3",
          options: {
            access_key_id: ensure("R2_ACCESS_KEY_ID"),
            secret_access_key: ensure("R2_SECRET_ACCESS_KEY"),
            bucket: ensure("R2_BUCKET"),
            region: "auto",
            endpoint: ensure("R2_ENDPOINT")
          }
        }
      ]
    }
  },

  // Notification (Resend) - ADD FOR PHASE 3
  {
    key: Modules.NOTIFICATION,
    options: {
      providers: [
        {
          id: "resend",
          resolve: "@medusajs/medusa-notification-resend",
          options: {
            api_key: ensure("RESEND_API_KEY"),
            from: process.env.FROM_EMAIL ?? "orders@optic.works"
          }
        }
      ]
    }
  },

  // Cache (Redis) - RECOMMENDED FOR PHASE 3
  {
    key: Modules.CACHE,
    resolve: "@medusajs/medusa/cache-redis",
    options: {
      redisUrl: process.env.REDIS_URL,
      ttl: 300
    }
  },

  // Fulfillment (EasyPost) - PHASE 4
  {
    key: Modules.FULFILLMENT,
    options: {
      providers: [
        {
          id: "easypost",
          resolve: "@medusajs/medusa/fulfillment-easypost",
          options: {
            api_key: ensure("EASYPOST_API_KEY")
          }
        }
      ]
    }
  },

  // Search (Meilisearch) - PHASE 4
  {
    key: Modules.SEARCH,
    resolve: "@medusajs/medusa/search-meilisearch",
    options: {
      host: ensure("MEILISEARCH_HOST"),
      apiKey: ensure("MEILISEARCH_API_KEY")
    }
  }
]
```

---

## Testing Checklist

### Phase 3 Module Validation

**Notification Module**:
- [ ] Order confirmation email received
- [ ] Customer registration email received
- [ ] Password reset email received
- [ ] Email templates render correctly
- [ ] Resend dashboard shows delivery logs

**File Module (R2)**:
- [ ] Product images load from R2 CDN
- [ ] Admin uploads work
- [ ] Image transformations work (if configured)

**Payment Module (Stripe)**:
- [ ] Test payment succeeds
- [ ] Webhook processed
- [ ] Order created in Medusa

**Cache Module** (if implemented):
- [ ] Products cached (check Redis keys)
- [ ] Cache invalidation works on product update
- [ ] Performance improvement measured

---

## Recommendations Summary

### ✅ IMPLEMENT FOR PHASE 3:

1. **Notification Module (Resend)** 🔴 CRITICAL
   - Required for order confirmations
   - Required for password reset
   - All secrets already in Infisical
   - Added as **Track 1.4** in Phase 3 plan

2. **Cache Module (Redis)** 🟢 INCLUDED
   - Performance optimization
   - Infrastructure already exists (Redis deployed in Phase 2)
   - Low risk, high reward (5 minutes to configure)
   - Added as **Track 1.5** in Phase 3 plan
   - Decision: **YES, include in Phase 3** - quick win for performance

### ⏳ DEFER TO PHASE 4:

3. **Fulfillment Module (EasyPost)**
   - Not blocking for MVP
   - Manual fulfillment sufficient for Phase 3
   - Add when order volume increases

4. **Search Module (Meilisearch/Algolia)**
   - Only 7 products in catalog
   - Client-side search sufficient for now
   - Add when catalog grows >50 products

5. **Event Bus Module (Redis)**
   - Default event bus sufficient
   - Add when integrating external systems
   - Phase 4 scaling concern

---

## Action Items

### ✅ COMPLETED (Documentation):

- [x] **Update `PHASE3_PLAN.md`** to add Track 1.4 (Notification Module)
- [x] **Update `PHASE3_PLAN.md`** to add Track 1.5 (Cache Module)
- [x] **Update `PHASE3_PLAN.md`** to add Track 7.3 (Email Testing with Mailosaur)
- [x] **Create `MAILOSAUR_SETUP.md`** with E2E email testing guide
- [x] **Update `KEY_MANAGEMENT.md`** to add Mailosaur secrets

### Immediate (Before Phase 3 Track 4):

- [ ] **Install Resend notification provider** in Medusa
- [ ] **Add `FROM_EMAIL` to Infisical** (if missing)
- [ ] **Verify Resend domain** in Resend dashboard
- [ ] **Configure cache module** in medusa-config.ts
- [ ] **Deploy updated configuration** via Ansible
- [ ] **Test order confirmation email** flow

### Email Testing (Track 7.3):

- [ ] Create Mailosaur account
- [ ] Add Mailosaur secrets to Infisical
- [ ] Install mailosaur package
- [ ] Implement email test helpers
- [ ] Update E2E tests to validate email delivery

### Phase 4 Planning:

- [ ] Research fulfillment provider (EasyPost vs alternatives)
- [ ] Evaluate search provider (Meilisearch vs Algolia)
- [ ] Plan Workers KV cache migration
- [ ] Consider tax provider (TaxJar/Avalara)

---

## References

- **Medusa v2 Modules Documentation**: https://docs.medusajs.com/v2/resources/architectural-modules
- **Notification Module**: https://docs.medusajs.com/v2/resources/commerce-modules/notification
- **File Module**: https://docs.medusajs.com/v2/resources/commerce-modules/file
- **Payment Module**: https://docs.medusajs.com/v2/resources/commerce-modules/payment
- **Fulfillment Module**: https://docs.medusajs.com/v2/resources/commerce-modules/fulfillment
- **Cache Module**: https://docs.medusajs.com/v2/resources/architectural-modules/cache
- **Search Module**: https://docs.medusajs.com/v2/resources/commerce-modules/search
- **Event Bus**: https://docs.medusajs.com/v2/resources/architectural-modules/event-bus

---

**Document Status**: ✅ Complete
**Next Review**: After Phase 3 Track 1 completion
**Owner**: Platform Engineering
