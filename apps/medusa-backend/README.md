# OpticWorks MedusaJS Backend

MedusaJS v2 e-commerce backend deployed on Hetzner servers.

## Overview

This workspace contains the MedusaJS v2 backend that powers the OpticWorks e-commerce platform. It handles products, orders, customers, inventory, and integrations with Stripe for payments.

## Why MedusaJS?

- **Headless Commerce**: API-first architecture for flexible frontends
- **Customizable**: Plugin system for Tesla-specific features
- **Modern Stack**: Node.js, PostgreSQL, Redis
- **Active Community**: Well-maintained with regular updates
- **Admin Dashboard**: Built-in admin UI for managing products/orders

## Technology Stack

- **Framework**: MedusaJS v2.x
- **Database**: PostgreSQL (Hetzner Cloud)
- **Cache**: Redis (Hetzner Cloud)
- **Storage**: Cloudflare R2 (product images, media)
- **Deployment**: Docker on Hetzner VPS
- **Authentication**: Integration with Ory Hydra

## Directory Structure

```
apps/medusa-backend/
├── src/
│   ├── api/              # Custom API routes
│   ├── models/           # Custom data models
│   ├── services/         # Custom services
│   ├── subscribers/      # Event subscribers
│   └── workflows/        # Custom workflows
├── data/
│   ├── products.json     # Product seed data
│   └── migrations/       # Database migrations
├── plugins/
│   ├── cloudflare-r2/   # R2 storage plugin
│   ├── tesla-compat/    # Tesla compatibility plugin
│   ├── tinting-laws/    # State law compliance plugin
│   └── oops-protection/ # Warranty program plugin
├── medusa-config.js     # MedusaJS configuration
├── Dockerfile           # Docker build
├── docker-compose.yml   # Local development
└── README.md
```

## Installation

### Prerequisites

- Node.js 18+
- pnpm
- Docker & Docker Compose
- PostgreSQL (or Docker)
- Redis (or Docker)

### Setup

```bash
# Install dependencies
cd apps/medusa-backend
pnpm install

# Create .env file
cp .env.template .env

# Start PostgreSQL and Redis (Docker)
docker-compose up -d postgres redis

# Run migrations
pnpm run migrate

# Seed data
pnpm run seed

# Start dev server
pnpm run dev
```

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://medusa:medusa@localhost:5432/medusa

# Redis
REDIS_URL=redis://localhost:6379

# Server
PORT=9000
ADMIN_PORT=7001

# JWT Secret
JWT_SECRET=your-jwt-secret-here

# Stripe
STRIPE_API_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Cloudflare R2
R2_ACCESS_KEY_ID=xxxxx
R2_SECRET_ACCESS_KEY=xxxxx
R2_BUCKET_NAME=opticworks-media
R2_ENDPOINT=https://xxxxx.r2.cloudflarestorage.com

# Ory Hydra Integration
HYDRA_URL=https://auth.opticworks.com
HYDRA_ADMIN_URL=https://auth-admin.opticworks.com

# CORS
STORE_CORS=http://localhost:3000,https://opticworks.com
ADMIN_CORS=http://localhost:7001,https://admin.opticworks.com
```

## Custom Plugins

### 1. Tesla Compatibility Plugin

**Purpose**: Check vehicle compatibility for tinting products

**Location**: `packages/medusa-plugins/tesla-compat/`

**Features**:
- Vehicle model detection (Model 3, Y, S, X)
- Year-specific compatibility checking
- Window configuration mapping
- Pre-cut film availability

**API Endpoints**:
```typescript
GET /store/compatibility/check/:vehicleId
POST /store/compatibility/validate
GET /store/compatibility/vehicles
```

### 2. State Tinting Laws Plugin

**Purpose**: Legal compliance checking for tinting regulations

**Location**: `packages/medusa-plugins/tinting-laws/`

**Features**:
- State-by-state law database
- VLT percentage compliance
- Risk assessment
- Medical exemption handling

**API Endpoints**:
```typescript
GET /store/legal/tinting-laws/:state
POST /store/legal/check-compliance
GET /store/legal/states
```

### 3. Oops Protection Plugin

**Purpose**: Warranty and replacement program management

**Location**: `packages/medusa-plugins/oops-protection/`

**Features**:
- Warranty claim submission
- Claim tracking
- Automatic approval/rejection
- Replacement order creation

**API Endpoints**:
```typescript
POST /store/warranty/claim
GET /store/warranty/claim/:id
GET /store/warranty/claims (authenticated)
```

### 4. Cloudflare R2 Storage Plugin

**Purpose**: Product image and media storage on R2

**Location**: `packages/medusa-plugins/cloudflare-r2/`

**Features**:
- Image upload to R2
- Image optimization
- CDN delivery
- Presigned URL generation

## Data Models

### Product Extensions

```typescript
// Extended product model for Tesla-specific data
interface TeslaProduct extends Product {
  // Tesla model compatibility
  compatibleModels: TeslaModel[]

  // Window-specific info
  windowType: 'windshield' | 'side' | 'rear' | 'sunroof' | 'full-kit'

  // VLT percentage
  vltPercentage: number

  // Installation difficulty
  installDifficulty: 'easy' | 'moderate' | 'advanced'

  // Pre-cut availability
  isPreCut: boolean

  // Film specifications
  filmSpecs: {
    thickness: string
    material: string
    uvProtection: number
    heatRejection: number
  }
}

type TeslaModel = 'model-3' | 'model-y' | 'model-s' | 'model-x' | 'cybertruck'
```

### Custom Order Metadata

```typescript
interface OrderMetadata {
  // Vehicle information
  vehicle?: {
    model: TeslaModel
    year: number
    vin?: string
  }

  // Tinting law compliance
  compliance?: {
    state: string
    isCompliant: boolean
    warnings?: string[]
  }

  // Installation preference
  installation?: {
    isDIY: boolean
    scheduledDate?: string
    installerNotes?: string
  }

  // Oops Protection
  oopsProtection?: {
    isActive: boolean
    expiresAt: Date
  }
}
```

## API Routes

### Store API (Public)

```typescript
// Products
GET    /store/products
GET    /store/products/:id
GET    /store/products/category/:category

// Cart
POST   /store/carts
POST   /store/carts/:id/line-items
DELETE /store/carts/:id/line-items/:line_id
POST   /store/carts/:id/complete

// Checkout
POST   /store/carts/:id/payment-sessions
POST   /store/carts/:id/payment-sessions/:provider_id

// Customers (authenticated)
GET    /store/customers/me
PUT    /store/customers/me
GET    /store/customers/me/orders
```

### Admin API (Authenticated)

```typescript
// Products
GET    /admin/products
POST   /admin/products
PUT    /admin/products/:id
DELETE /admin/products/:id

// Orders
GET    /admin/orders
GET    /admin/orders/:id
PUT    /admin/orders/:id
POST   /admin/orders/:id/fulfill

// Customers
GET    /admin/customers
GET    /admin/customers/:id

// Analytics
GET    /admin/analytics/sales
GET    /admin/analytics/products
```

## Product Migration

### Source Data

Current products are defined in `/apps/storefront/src/lib/products.ts` (11 products across 4 categories).

### Migration Steps

1. **Extract Product Data**
   ```bash
   node scripts/migration/extract-products.js
   ```
   Output: `data/products.json`

2. **Transform to MedusaJS Format**
   ```bash
   node scripts/migration/transform-products.js
   ```

3. **Import to MedusaJS**
   ```bash
   pnpm run seed:products
   ```

4. **Upload Images to R2**
   ```bash
   node scripts/migration/upload-images.js
   ```

### Product Seed Script

```typescript
// data/seed.ts
import { MedusaClient } from '@medusajs/medusa-js'
import products from './products.json'

async function seedProducts() {
  const client = new MedusaClient()

  for (const product of products) {
    await client.admin.products.create({
      title: product.name,
      description: product.description,
      handle: product.slug,
      variants: product.variants.map(v => ({
        title: v.name,
        prices: [{ amount: v.price, currency_code: 'usd' }],
        options: v.options,
      })),
      images: product.images.map(url => ({ url })),
      metadata: {
        compatibleModels: product.compatibility,
        vltPercentage: product.vlt,
        installDifficulty: product.difficulty,
      }
    })
  }
}
```

## Development Workflow

### Local Development

```bash
# Start all services
docker-compose up -d

# Run dev server with hot reload
pnpm run dev

# Admin dashboard: http://localhost:7001
# API: http://localhost:9000
```

### Database Migrations

```bash
# Create migration
pnpm run migration:create AddTeslaFields

# Run migrations
pnpm run migrate

# Rollback
pnpm run migrate:rollback
```

### Testing

```bash
# Unit tests
pnpm run test

# Integration tests
pnpm run test:integration

# E2E tests
pnpm run test:e2e
```

## Deployment

### Docker Build

```bash
# Build image
docker build -t opticworks/medusa-backend:latest .

# Push to registry
docker push opticworks/medusa-backend:latest
```

### Hetzner Deployment

```bash
# SSH to Hetzner server
ssh root@<hetzner-ip>

# Pull latest image
docker pull opticworks/medusa-backend:latest

# Restart service
docker-compose up -d medusa
```

### Environment-specific Configuration

**Development**:
- Local PostgreSQL/Redis
- Test Stripe keys
- Debug logging enabled

**Production**:
- Hetzner PostgreSQL/Redis
- Live Stripe keys
- Error logging only
- HTTPS required

## Monitoring & Logging

### Health Checks

```bash
# API health
curl http://localhost:9000/health

# Database connection
curl http://localhost:9000/health/db
```

### Logs

```bash
# View logs
docker-compose logs -f medusa

# Filter errors
docker-compose logs medusa | grep ERROR
```

### Metrics (TODO)

- Request count/latency
- Database query performance
- Cache hit rate
- Order completion rate

## TODO: Implementation Checklist

### Phase 1: MedusaJS Setup
- [ ] Initialize MedusaJS v2 project
- [ ] Configure PostgreSQL database
- [ ] Configure Redis cache
- [ ] Set up admin dashboard
- [ ] Test local development environment

### Phase 2: Custom Plugins
- [ ] Create Tesla compatibility plugin
- [ ] Create tinting laws plugin
- [ ] Create Oops Protection plugin
- [ ] Create Cloudflare R2 storage plugin
- [ ] Test all plugins locally

### Phase 3: Data Migration
- [ ] Write product extraction script
- [ ] Transform products to MedusaJS format
- [ ] Create seed script
- [ ] Upload product images to R2
- [ ] Verify all products in admin

### Phase 4: API Integration
- [ ] Integrate with Stripe
- [ ] Integrate with Ory Hydra (auth)
- [ ] Set up webhooks
- [ ] Test checkout flow
- [ ] Test order fulfillment

### Phase 5: Docker & Deployment
- [ ] Create Dockerfile
- [ ] Create docker-compose.yml
- [ ] Test Docker build locally
- [ ] Set up Hetzner VPS
- [ ] Configure nginx reverse proxy
- [ ] Deploy to production
- [ ] Set up automated backups

### Phase 6: Storefront Integration
- [ ] Update storefront to use MedusaJS API
- [ ] Replace static product data
- [ ] Update cart to use MedusaJS cart API
- [ ] Update checkout flow
- [ ] Test end-to-end order flow

## Resources

- [MedusaJS Documentation](https://docs.medusajs.com/)
- [MedusaJS v2 Guide](https://docs.medusajs.com/v2/)
- [Plugin Development](https://docs.medusajs.com/development/plugins/)
- [Admin Dashboard](https://docs.medusajs.com/admin/)
- [Cloudflare R2 API](https://developers.cloudflare.com/r2/)

## Support

For MedusaJS questions:
1. Check the official documentation
2. Review the migration plan
3. See custom plugin examples in `packages/medusa-plugins/`
