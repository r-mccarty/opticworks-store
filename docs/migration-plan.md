# OpticWorks Technical Migration & Implementation Guide

## Executive Summary

This document provides a complete technical implementation plan for migrating the OpticWorks e-commerce platform from Vercel to a distributed microservices architecture:

- **Frontend**: Next.js 15 on Cloudflare Workers via OpenNext (Node.js runtime)
- **Backend**: MedusaJS v2 on GCP Compute Engine VM
- **Event Bus**: Redis Streams → Pub/Sub shim → GCP Pub/Sub
- **Webhooks**: GCP Cloud Run Functions → Pub/Sub
- **Storage**: Cloudflare R2 (assets), Cloud SQL Postgres (data)
- **Caching**: Redis (Medusa), Cloudflare KV (ISR)

---

## Part 1: Architecture Overview

### System Topology

```
┌─────────────────────────────────────────────────────────────────┐
│                    Cloudflare Edge Network                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │     WAF      │  │     DNS      │  │     CDN      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                            │                                     │
│                            ↓                                     │
│  ┌─────────────────────────────────────────────────────┐       │
│  │ Cloudflare Workers (OpenNext - Node.js Runtime)     │       │
│  │                                                      │       │
│  │  - Next.js 15 SSR/SSG                               │       │
│  │  - Shopping cart UI                                 │       │
│  │  - Product catalog                                  │       │
│  │  - Checkout pages                                   │       │
│  │                                                      │       │
│  │  Bindings:                                          │       │
│  │  - R2 Bucket (static assets)                        │       │
│  │  - KV Namespace (ISR cache)                         │       │
│  └─────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ API Calls
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Google Cloud Platform                         │
│                                                                  │
│  ┌────────────────────────────────────────────────────┐        │
│  │ Cloud Run Functions (Webhook Receivers)            │        │
│  │                                                     │        │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐│        │
│  │  │   Stripe     │  │   Resend     │  │  Other   ││        │
│  │  │   Webhook    │  │   Webhook    │  │ Webhooks ││        │
│  │  └──────────────┘  └──────────────┘  └──────────┘│        │
│  └────────────────────────────────────────────────────┘        │
│                            │                                     │
│                            ↓                                     │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              GCP Pub/Sub Topics                      │       │
│  │                                                      │       │
│  │  - stripe-events                                    │       │
│  │  - customer-events                                  │       │
│  │  - order-events                                     │       │
│  │  - inventory-events                                 │       │
│  └─────────────────────────────────────────────────────┘       │
│                            │                                     │
│                            ↓                                     │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Compute Engine VM (e2-standard-4, us-central1-a)          │ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────┐    │ │
│  │  │ MedusaJS v2 Server (Port 9000)                   │    │ │
│  │  │ - API endpoints                                  │    │ │
│  │  │ - Admin dashboard                                │    │ │
│  │  │ - Custom providers                               │    │ │
│  │  └──────────────────────────────────────────────────┘    │ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────┐    │ │
│  │  │ MedusaJS Worker (Background Jobs)               │    │ │
│  │  │ - Order processing                               │    │ │
│  │  │ - Inventory sync                                 │    │ │
│  │  │ - Email queues                                   │    │ │
│  │  └──────────────────────────────────────────────────┘    │ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────┐    │ │
│  │  │ Redis Server (Port 6379)                         │    │ │
│  │  │ - Cache provider                                 │    │ │
│  │  │ - Event bus (Redis Streams)                      │    │ │
│  │  │ - Locking provider                               │    │ │
│  │  │ - Workflow engine                                │    │ │
│  │  └──────────────────────────────────────────────────┘    │ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────┐    │ │
│  │  │ Redis→Pub/Sub Shim Service                       │    │ │
│  │  │ - Listens to Redis Streams                       │    │ │
│  │  │ - Publishes to GCP Pub/Sub                       │    │ │
│  │  │ - Enables cross-service events                   │    │ │
│  │  └──────────────────────────────────────────────────┘    │ │
│  │                                                            │ │
│  └───────────────────────────────────────────────────────────┘ │
│                            │                                     │
│                            ↓                                     │
│  ┌─────────────────────────────────────────────────────┐       │
│  │ Cloud SQL Postgres (Private IP in VPC)              │       │
│  │ - Product catalog                                   │       │
│  │ - Customer data                                     │       │
│  │ - Order history                                     │       │
│  │ - Inventory records                                 │       │
│  └─────────────────────────────────────────────────────┘       │
│                                                                  │
│  ┌─────────────────────────────────────────────────────┐       │
│  │ Microservices (Cloud Run)                           │       │
│  │                                                      │       │
│  │  - Notification Service (Email/SMS)                 │       │
│  │  - Inventory Service (SoR)                          │       │
│  │  - Analytics Service                                │       │
│  │  - Support Service                                  │       │
│  └─────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ↓
                    External Services
              (Stripe, PLM, ERP, Finance)
```

### Data Flow Examples

#### 1. User Browses Product → Add to Cart
```
User → Cloudflare Workers (Next.js) → Client-side cart (Zustand + localStorage)
```

#### 2. User Checks Out
```
User → CF Workers → Stripe Checkout Session → Stripe Payment
  ↓
Stripe Webhook → Cloud Run Function → Pub/Sub (stripe-events topic)
  ↓
Medusa VM subscribes to Pub/Sub → Processes order → Stores in Cloud SQL
  ↓
Medusa emits customer.created → Redis Stream → Shim Service → Pub/Sub (customer-events)
  ↓
Multiple subscribers: Stripe sync, Support system, Analytics
```

#### 3. Customer Event Propagation
```
Medusa creates customer → Redis Stream (medusa-events)
  ↓
Shim Service reads stream → Publishes to Pub/Sub
  ↓
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Topic:       │ Topic:       │ Topic:       │ Topic:       │
│ customer-    │ stripe-      │ support-     │ analytics-   │
│ created      │ sync         │ events       │ events       │
└──────────────┴──────────────┴──────────────┴──────────────┘
     │              │              │              │
     ↓              ↓              ↓              ↓
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ CRM      │  │ Stripe   │  │ Support  │  │ Analytics│
│ Service  │  │ Sync     │  │ Service  │  │ Service  │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

---

## Part 2: Prerequisites & Environment Setup

### Required Accounts & Access

```bash
# 1. Cloudflare Account
- Account ID: [Your Account ID]
- API Token: [Workers & R2 permissions]

# 2. Google Cloud Project
- Project ID: opticworks-prod
- Billing enabled
- APIs to enable:
  - Compute Engine API
  - Cloud SQL Admin API
  - Cloud Run API
  - Cloud Pub/Sub API
  - Secret Manager API
  - IAM API

# 3. Domain Configuration
- Domain: opticworks.com (example)
- Nameservers pointed to Cloudflare
```

### Development Environment

```bash
# Install required tools
npm install -g wrangler@latest  # Cloudflare CLI
npm install -g @medusajs/medusa-cli  # Medusa CLI

# Install Google Cloud SDK
# https://cloud.google.com/sdk/docs/install

# Authenticate
wrangler login
gcloud auth login
gcloud config set project opticworks-prod
```

### Environment Variables Structure

```
# Root .env (for local development)
.env
.env.local
.env.production

# Cloudflare Workers secrets (set via wrangler)
- MEDUSA_BACKEND_URL
- STRIPE_PUBLISHABLE_KEY

# GCP Secret Manager (for all GCP services)
- stripe-secret-key
- stripe-webhook-secret
- resend-api-key
- database-url
- redis-url
- r2-access-key-id
- r2-secret-access-key
- notification-service-token
```

---

## Part 3: Cloudflare Workers Setup

### 3.1 OpenNext Build Configuration

**File: `next.config.ts`**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CRITICAL: OpenNext requires output configuration
  output: "standalone",
  
  // Image optimization for R2
  images: {
    unoptimized: false, // Let Cloudflare handle optimization
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-*.r2.dev', // R2 public bucket
        port: '',
        pathname: '/**',
      }
    ],
  },
  
  // Three.js shader support
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ['raw-loader'],
    });
    
    // Optimize for Workers
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;
```

**File: `wrangler.toml`**

```toml
#:schema node_modules/wrangler/config-schema.json
name = "opticworks-landing"
main = ".open-next/server-function/index.mjs"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

# Workers configuration
workers_dev = true
route = { pattern = "opticworks.com/*", zone_name = "opticworks.com" }

# Resource bindings
[[r2_buckets]]
binding = "ASSETS"
bucket_name = "opticworks-static-assets"
preview_bucket_name = "opticworks-static-assets-preview"

[[kv_namespaces]]
binding = "ISR_CACHE"
id = "YOUR_KV_NAMESPACE_ID"
preview_id = "YOUR_PREVIEW_KV_NAMESPACE_ID"

# Environment variables (non-sensitive)
[vars]
NODE_ENV = "production"
MEDUSA_BACKEND_URL = "https://api.opticworks.com"

# Preview environment
[env.preview]
name = "opticworks-landing-preview"
route = { pattern = "preview.opticworks.com/*", zone_name = "opticworks.com" }
vars = { NODE_ENV = "development" }

# Build configuration
[build]
command = "npm run build"
cwd = "./"

[build.upload]
format = "modules"
dir = ".open-next"
main = "./server-function/index.mjs"

# Asset configuration
[site]
bucket = ".open-next/assets"
```

### 3.2 OpenNext Adapter Configuration

**File: `open-next.config.ts`**

```typescript
import type { OpenNextConfig } from 'open-next/types';

const config: OpenNextConfig = {
  default: {
    override: {
      wrapper: 'cloudflare-node',
      converter: 'edge',
      incrementalCache: 'cloudflare-kv',
      tagCache: 'cloudflare-kv',
      queue: 'cloudflare-queue', // For background tasks
    },
  },
  functions: {
    // API routes that need longer execution time
    api: {
      patterns: ['api/**'],
      runtime: 'node',
    },
  },
  imageOptimization: {
    loader: 'custom',
    loaderFile: './image-loader.js',
  },
  buildCommand: 'npm run build',
  packageJsonPath: './package.json',
};

export default config;
```

**File: `image-loader.js`** (Custom R2 image loader)

```javascript
export default function cloudflareR2Loader({ src, width, quality }) {
  // Cloudflare Image Resizing
  const params = new URLSearchParams({
    width: width.toString(),
    quality: (quality || 75).toString(),
    format: 'auto',
  });
  
  // If image is already on R2
  if (src.startsWith('https://pub-') && src.includes('.r2.dev')) {
    return src;
  }
  
  // For local images, prepend R2 domain
  const r2Domain = process.env.NEXT_PUBLIC_R2_DOMAIN || 'https://pub-xxx.r2.dev';
  return `${r2Domain}${src}?${params.toString()}`;
}
```

### 3.3 Build & Deployment Scripts

**File: `scripts/cloudflare/build-and-deploy.sh`**

```bash
#!/bin/bash
set -e

echo "🔨 Building OpticWorks for Cloudflare Workers..."

# 1. Clean previous builds
echo "Cleaning previous builds..."
rm -rf .next .open-next

# 2. Run Next.js build
echo "Running Next.js build..."
pnpm run build

# 3. Run OpenNext adapter
echo "Running OpenNext adapter..."
pnpm dlx open-next@latest build --cloudflare

# 4. Validate bundle size
echo "Validating bundle size..."
BUNDLE_SIZE=$(du -sb .open-next/server-function | cut -f1)
MAX_SIZE=$((10 * 1024 * 1024))  # 10MB

if [ $BUNDLE_SIZE -gt $MAX_SIZE ]; then
  echo "❌ ERROR: Bundle size ($BUNDLE_SIZE bytes) exceeds 10MB limit"
  echo "Consider:"
  echo "  - Reducing dependencies"
  echo "  - Using dynamic imports for heavy components"
  echo "  - Moving Three.js to separate Worker"
  exit 1
fi

echo "✅ Bundle size: $(numfmt --to=iec $BUNDLE_SIZE)"

# 5. Deploy to Cloudflare
echo "Deploying to Cloudflare Workers..."
if [ "$1" == "production" ]; then
  wrangler deploy --env production
else
  wrangler deploy --env preview
fi

echo "✅ Deployment complete!"
```

**File: `scripts/cloudflare/setup-infrastructure.sh`**

```bash
#!/bin/bash
set -e

echo "🚀 Setting up Cloudflare infrastructure..."

# Variables
ACCOUNT_ID="${CF_ACCOUNT_ID}"
ZONE_ID="${CF_ZONE_ID}"
API_TOKEN="${CF_API_TOKEN}"

# 1. Create R2 buckets
echo "Creating R2 buckets..."
wrangler r2 bucket create opticworks-static-assets
wrangler r2 bucket create opticworks-static-assets-preview

# 2. Create KV namespaces
echo "Creating KV namespaces..."
PROD_KV_ID=$(wrangler kv:namespace create ISR_CACHE --preview false | grep "id" | cut -d'"' -f4)
PREVIEW_KV_ID=$(wrangler kv:namespace create ISR_CACHE --preview true | grep "id" | cut -d'"' -f4)

echo "Production KV ID: $PROD_KV_ID"
echo "Preview KV ID: $PREVIEW_KV_ID"

# Update wrangler.toml with IDs
sed -i "s/YOUR_KV_NAMESPACE_ID/$PROD_KV_ID/g" wrangler.toml
sed -i "s/YOUR_PREVIEW_KV_NAMESPACE_ID/$PREVIEW_KV_ID/g" wrangler.toml

# 3. Configure WAF rules
echo "Configuring WAF rules..."
curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/firewall/rules" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{
    "filter": {
      "expression": "(http.request.uri.path contains \"/api/\" and cf.threat_score gt 10)"
    },
    "action": "challenge",
    "description": "Challenge suspicious API requests"
  }'

# 4. Set Workers secrets
echo "Setting Workers secrets..."
echo "${STRIPE_PUBLISHABLE_KEY}" | wrangler secret put STRIPE_PUBLISHABLE_KEY
echo "${MEDUSA_BACKEND_URL}" | wrangler secret put MEDUSA_BACKEND_URL

# 5. Configure DNS
echo "DNS configuration (manual step):"
echo "  1. Go to Cloudflare Dashboard → DNS"
echo "  2. Add CNAME record: opticworks.com → opticworks-landing.workers.dev"
echo "  3. Enable Cloudflare proxy (orange cloud)"

echo "✅ Cloudflare infrastructure setup complete!"
```

**File: `scripts/cloudflare/sync-assets-to-r2.sh`**

```bash
#!/bin/bash
set -e

echo "📦 Syncing static assets to R2..."

# Build assets directory
ASSETS_DIR=".open-next/assets"

if [ ! -d "$ASSETS_DIR" ]; then
  echo "❌ ERROR: Assets directory not found. Run build first."
  exit 1
fi

# Sync to R2 using wrangler
cd "$ASSETS_DIR"
for file in $(find . -type f); do
  # Remove leading ./
  key="${file#./}"
  
  echo "Uploading $key..."
  wrangler r2 object put "opticworks-static-assets/$key" \
    --file="$file" \
    --content-type="$(file --mime-type -b "$file")"
done

echo "✅ Assets synced to R2!"
```

---

## Part 4: GCP Infrastructure Setup

### 4.1 VPC and Networking

**File: `scripts/gcp/setup-vpc.sh`**

```bash
#!/bin/bash
set -e

PROJECT_ID="opticworks-prod"
REGION="us-central1"
VPC_NAME="opticworks-vpc"
SUBNET_NAME="opticworks-subnet"
SUBNET_RANGE="10.0.0.0/24"

echo "🌐 Setting up VPC network..."

# 1. Create VPC network
gcloud compute networks create $VPC_NAME \
  --project=$PROJECT_ID \
  --subnet-mode=custom \
  --bgp-routing-mode=regional

# 2. Create subnet
gcloud compute networks subnets create $SUBNET_NAME \
  --project=$PROJECT_ID \
  --network=$VPC_NAME \
  --region=$REGION \
  --range=$SUBNET_RANGE \
  --enable-private-ip-google-access

# 3. Create firewall rules
# Allow internal communication
gcloud compute firewall-rules create $VPC_NAME-allow-internal \
  --project=$PROJECT_ID \
  --network=$VPC_NAME \
  --allow=tcp,udp,icmp \
  --source-ranges=$SUBNET_RANGE

# Allow SSH from IAP
gcloud compute firewall-rules create $VPC_NAME-allow-ssh \
  --project=$PROJECT_ID \
  --network=$VPC_NAME \
  --allow=tcp:22 \
  --source-ranges=35.235.240.0/20

# Allow health checks
gcloud compute firewall-rules create $VPC_NAME-allow-health-check \
  --project=$PROJECT_ID \
  --network=$VPC_NAME \
  --allow=tcp \
  --source-ranges=130.211.0.0/22,35.191.0.0/16

echo "✅ VPC network created: $VPC_NAME"
```

### 4.2 Cloud SQL Setup

**File: `scripts/gcp/setup-cloud-sql.sh`**

```bash
#!/bin/bash
set -e

PROJECT_ID="opticworks-prod"
REGION="us-central1"
VPC_NAME="opticworks-vpc"
INSTANCE_NAME="opticworks-db"
DB_NAME="medusa"
DB_USER="medusa"

echo "🗄️ Setting up Cloud SQL..."

# 1. Create Cloud SQL instance with private IP
gcloud sql instances create $INSTANCE_NAME \
  --project=$PROJECT_ID \
  --database-version=POSTGRES_15 \
  --tier=db-custom-2-7680 \
  --region=$REGION \
  --network=projects/$PROJECT_ID/global/networks/$VPC_NAME \
  --no-assign-ip \
  --database-flags=max_connections=100 \
  --backup-start-time=03:00 \
  --enable-bin-log \
  --maintenance-window-day=SUN \
  --maintenance-window-hour=4

# 2. Wait for instance to be ready
echo "Waiting for instance to be ready..."
gcloud sql operations wait \
  $(gcloud sql operations list --instance=$INSTANCE_NAME --limit=1 --format="value(name)") \
  --project=$PROJECT_ID

# 3. Get private IP
PRIVATE_IP=$(gcloud sql instances describe $INSTANCE_NAME \
  --project=$PROJECT_ID \
  --format="value(ipAddresses[0].ipAddress)")

echo "Cloud SQL Private IP: $PRIVATE_IP"

# 4. Create database
gcloud sql databases create $DB_NAME \
  --instance=$INSTANCE_NAME \
  --project=$PROJECT_ID

# 5. Create user (password will be generated)
DB_PASSWORD=$(openssl rand -base64 32)
gcloud sql users create $DB_USER \
  --instance=$INSTANCE_NAME \
  --password="$DB_PASSWORD" \
  --project=$PROJECT_ID

# 6. Store credentials in Secret Manager
echo -n "postgresql://$DB_USER:$DB_PASSWORD@$PRIVATE_IP:5432/$DB_NAME" | \
  gcloud secrets create database-url \
    --project=$PROJECT_ID \
    --data-file=- \
    --replication-policy=automatic

echo "✅ Cloud SQL instance created: $INSTANCE_NAME"
echo "Database URL stored in Secret Manager as 'database-url'"
```

### 4.3 Pub/Sub Topics & Subscriptions

**File: `scripts/gcp/setup-pubsub.sh`**

```bash
#!/bin/bash
set -e

PROJECT_ID="opticworks-prod"

echo "📨 Setting up Pub/Sub topics and subscriptions..."

# Define topics
TOPICS=(
  "stripe-events"
  "customer-events"
  "order-events"
  "inventory-events"
  "notification-events"
  "analytics-events"
)

# Create topics
for topic in "${TOPICS[@]}"; do
  echo "Creating topic: $topic"
  gcloud pubsub topics create $topic --project=$PROJECT_ID
done

# Create subscriptions for Medusa VM
MEDUSA_SUBSCRIPTIONS=(
  "stripe-events:medusa-stripe-sub"
  "customer-events:medusa-customer-sub"
  "order-events:medusa-order-sub"
  "inventory-events:medusa-inventory-sub"
)

for sub in "${MEDUSA_SUBSCRIPTIONS[@]}"; do
  IFS=':' read -r topic subscription <<< "$sub"
  echo "Creating subscription: $subscription for topic: $topic"
  
  gcloud pubsub subscriptions create $subscription \
    --topic=$topic \
    --project=$PROJECT_ID \
    --ack-deadline=60 \
    --message-retention-duration=7d \
    --expiration-period=never
done

# Create subscriptions for other services
gcloud pubsub subscriptions create notification-service-sub \
  --topic=notification-events \
  --project=$PROJECT_ID \
  --push-endpoint=https://notification-service-XXXXX.a.run.app/webhook

gcloud pubsub subscriptions create analytics-service-sub \
  --topic=analytics-events \
  --project=$PROJECT_ID \
  --push-endpoint=https://analytics-service-XXXXX.a.run.app/webhook

echo "✅ Pub/Sub topics and subscriptions created"
```

### 4.4 IAM Service Accounts & Permissions

**File: `scripts/gcp/setup-iam.sh`**

```bash
#!/bin/bash
set -e

PROJECT_ID="opticworks-prod"

echo "🔐 Setting up IAM service accounts and permissions..."

# 1. Create service accounts
echo "Creating service accounts..."

# Webhook publisher (Cloud Run Functions)
gcloud iam service-accounts create svc-webhook-publisher \
  --display-name="Webhook Publisher Service Account" \
  --project=$PROJECT_ID

# Medusa VM
gcloud iam service-accounts create svc-medusa \
  --display-name="Medusa Backend Service Account" \
  --project=$PROJECT_ID

# Notification service
gcloud iam service-accounts create svc-notification \
  --display-name="Notification Service Account" \
  --project=$PROJECT_ID

# 2. Grant permissions to webhook publisher
echo "Granting permissions to webhook publisher..."

# Pub/Sub publisher on all topics
for topic in stripe-events customer-events order-events inventory-events; do
  gcloud pubsub topics add-iam-policy-binding $topic \
    --member="serviceAccount:svc-webhook-publisher@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/pubsub.publisher" \
    --project=$PROJECT_ID
done

# 3. Grant permissions to Medusa VM
echo "Granting permissions to Medusa VM..."

# Pub/Sub subscriber
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:svc-medusa@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/pubsub.subscriber"

# Pub/Sub publisher (for outbound events)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:svc-medusa@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/pubsub.publisher"

# Cloud SQL client
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:svc-medusa@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

# Secret Manager accessor
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:svc-medusa@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Logging writer
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:svc-medusa@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/logging.logWriter"

# Monitoring metric writer
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:svc-medusa@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/monitoring.metricWriter"

# 4. Grant permissions to notification service
echo "Granting permissions to notification service..."

# Secret Manager accessor (for API keys)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:svc-notification@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Pub/Sub subscriber
gcloud pubsub subscriptions add-iam-policy-binding notification-service-sub \
  --member="serviceAccount:svc-notification@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/pubsub.subscriber" \
  --project=$PROJECT_ID

echo "✅ IAM service accounts and permissions configured"

# Print service account emails
echo ""
echo "Service Account Emails:"
echo "  Webhook Publisher: svc-webhook-publisher@$PROJECT_ID.iam.gserviceaccount.com"
echo "  Medusa Backend: svc-medusa@$PROJECT_ID.iam.gserviceaccount.com"
echo "  Notification Service: svc-notification@$PROJECT_ID.iam.gserviceaccount.com"
```

### 4.5 Compute Engine VM Provisioning

**File: `scripts/gcp/provision-medusa-vm.sh`**

```bash
#!/bin/bash
set -e

PROJECT_ID="opticworks-prod"
REGION="us-central1"
ZONE="us-central1-a"
VPC_NAME="opticworks-vpc"
SUBNET_NAME="opticworks-subnet"
INSTANCE_NAME="medusa-vm"
MACHINE_TYPE="e2-standard-4"
BOOT_DISK_SIZE="50GB"

echo "💻 Provisioning Medusa Compute Engine VM..."

# 1. Create VM instance
gcloud compute instances create $INSTANCE_NAME \
  --project=$PROJECT_ID \
  --zone=$ZONE \
  --machine-type=$MACHINE_TYPE \
  --network-interface=subnet=$SUBNET_NAME,no-address \
  --service-account=svc-medusa@$PROJECT_ID.iam.gserviceaccount.com \
  --scopes=https://www.googleapis.com/auth/cloud-platform \
  --boot-disk-size=$BOOT_DISK_SIZE \
  --boot-disk-type=pd-balanced \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --metadata=startup-script='#!/bin/bash
# Initial system setup
apt-get update
apt-get install -y git curl wget

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install Redis
apt-get install -y redis-server
systemctl enable redis-server
systemctl start redis-server

# Create medusa user
useradd -m -s /bin/bash medusa

# Setup directories
mkdir -p /opt/medusa
chown -R medusa:medusa /opt/medusa

echo "VM initialization complete"
'

echo "Waiting for VM to be ready..."
gcloud compute instances wait-up $INSTANCE_NAME --zone=$ZONE --project=$PROJECT_ID

# 2. Get internal IP
INTERNAL_IP=$(gcloud compute instances describe $INSTANCE_NAME \
  --zone=$ZONE \
  --project=$PROJECT_ID \
  --format="value(networkInterfaces[0].networkIP)")

echo "✅ VM created: $INSTANCE_NAME"
echo "Internal IP: $INTERNAL_IP"

# 3. Create Cloud NAT for outbound internet access
echo "Setting up Cloud NAT for outbound connectivity..."

# Create Cloud Router
gcloud compute routers create opticworks-router \
  --project=$PROJECT_ID \
  --network=$VPC_NAME \
  --region=$REGION

# Create Cloud NAT
gcloud compute routers nats create opticworks-nat \
  --project=$PROJECT_ID \
  --router=opticworks-router \
  --region=$REGION \
  --auto-allocate-nat-external-ips \
  --nat-all-subnet-ip-ranges

echo "✅ Cloud NAT configured for outbound access"

# 4. Instructions for SSH
echo ""
echo "To SSH into the VM:"
echo "  gcloud compute ssh $INSTANCE_NAME --zone=$ZONE --tunnel-through-iap"
```

---

## Part 5: Medusa Backend Implementation

### 5.1 Medusa Installation & Configuration

**File: `scripts/medusa/vm-setup.sh`** (Run on VM via SSH)

```bash
#!/bin/bash
set -e

echo "🛠️ Setting up MedusaJS on VM..."

# 1. Clone Medusa repository
cd /opt/medusa
git clone https://github.com/your-org/opticworks-medusa.git .

# 2. Install dependencies
npm install

# 3. Get secrets from Secret Manager
export DATABASE_URL=$(gcloud secrets versions access latest --secret="database-url")
export REDIS_URL="redis://localhost:6379"
export STRIPE_API_KEY=$(gcloud secrets versions access latest --secret="stripe-secret-key")
export R2_ACCESS_KEY_ID=$(gcloud secrets versions access latest --secret="r2-access-key-id")
export R2_SECRET_ACCESS_KEY=$(gcloud secrets versions access latest --secret="r2-secret-access-key")

# 4. Create .env file
cat > .env << EOF
DATABASE_URL=${DATABASE_URL}
REDIS_URL=${REDIS_URL}
STRIPE_API_KEY=${STRIPE_API_KEY}
R2_ACCESS_KEY_ID=${R2_ACCESS_KEY_ID}
R2_SECRET_ACCESS_KEY=${R2_SECRET_ACCESS_KEY}
R2_ACCOUNT_ID=${R2_ACCOUNT_ID}
R2_BUCKET_NAME=opticworks-product-images
NOTIFICATION_SERVICE_URL=https://notification-service-XXXXX.a.run.app
JWT_SECRET=$(openssl rand -base64 32)
COOKIE_SECRET=$(openssl rand -base64 32)
EOF

# 5. Run database migrations
npm run build
npx medusa migrations run

# 6. Create admin user
npx medusa user -e admin@opticworks.com -p $(openssl rand -base64 16)

echo "✅ Medusa setup complete"
```

**File: `/opt/medusa/medusa-config.js`**

```javascript
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  projectConfig: {
    redis_url: process.env.REDIS_URL,
    database_url: process.env.DATABASE_URL,
    database_type: "postgres",
    store_cors: "https://opticworks.com,https://preview.opticworks.com",
    admin_cors: "https://admin.opticworks.com",
    jwt_secret: process.env.JWT_SECRET,
    cookie_secret: process.env.COOKIE_SECRET,
  },
  
  modules: {
    eventBus: {
      resolve: "@medusajs/event-bus-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
    cacheService: {
      resolve: "@medusajs/cache-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
        ttl: 30,
      },
    },
  },
  
  plugins: [
    {
      resolve: `medusa-payment-stripe`,
      options: {
        api_key: process.env.STRIPE_API_KEY,
        webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
        // Webhooks are handled by Cloud Run, not directly by Medusa
        automatic_payment_methods: true,
      },
    },
    {
      resolve: `medusa-file-r2`,
      options: {
        account_id: process.env.R2_ACCOUNT_ID,
        access_key_id: process.env.R2_ACCESS_KEY_ID,
        secret_access_key: process.env.R2_SECRET_ACCESS_KEY,
        bucket: process.env.R2_BUCKET_NAME,
        public_url: `https://pub-${process.env.R2_ACCOUNT_ID}.r2.dev`,
      },
    },
  ],
};
```

### 5.2 Custom Providers Implementation

**File: `/opt/medusa/src/services/notification-proxy.ts`**

```typescript
import { AbstractNotificationService } from "@medusajs/medusa";
import { Logger } from "@medusajs/medusa/dist/types/global";

interface NotificationRequest {
  type: 'email' | 'sms' | 'push';
  template: string;
  recipient: {
    email?: string;
    phone?: string;
  };
  data: Record<string, any>;
}

class NotificationProxyService extends AbstractNotificationService {
  static identifier = "notification-proxy";
  
  protected readonly logger_: Logger;
  protected readonly serviceUrl_: string;
  protected readonly serviceToken_: string;

  constructor(container, options) {
    super(container);
    this.logger_ = container.logger;
    this.serviceUrl_ = options.service_url || process.env.NOTIFICATION_SERVICE_URL;
    this.serviceToken_ = options.service_token || process.env.NOTIFICATION_SERVICE_TOKEN;
  }

  async sendNotification(
    event: string,
    data: any,
    attachmentGenerator: unknown
  ): Promise<{
    to: string;
    status: string;
    data: Record<string, unknown>;
  }> {
    try {
      const notification = this.mapEventToNotification(event, data);
      
      const response = await fetch(`${this.serviceUrl_}/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.serviceToken_}`,
        },
        body: JSON.stringify(notification),
      });

      if (!response.ok) {
        throw new Error(`Notification service returned ${response.status}`);
      }

      const result = await response.json();
      
      return {
        to: notification.recipient.email || notification.recipient.phone || 'unknown',
        status: 'sent',
        data: result,
      };
    } catch (error) {
      this.logger_.error(`Failed to send notification: ${error.message}`);
      throw error;
    }
  }

  async resendNotification(
    notification: unknown,
    config: unknown,
    attachmentGenerator: unknown
  ): Promise<{
    to: string;
    status: string;
    data: Record<string, unknown>;
  }> {
    // Resend uses same logic as send
    return this.sendNotification('resend', notification, attachmentGenerator);
  }

  private mapEventToNotification(event: string, data: any): NotificationRequest {
    // Map Medusa events to notification templates
    const eventMap: Record<string, { type: string; template: string }> = {
      'order.placed': { type: 'email', template: 'order-confirmation' },
      'order.shipment_created': { type: 'email', template: 'shipping-notification' },
      'order.canceled': { type: 'email', template: 'order-canceled' },
      'customer.created': { type: 'email', template: 'welcome' },
      'user.password_reset': { type: 'email', template: 'password-reset' },
    };

    const mapping = eventMap[event] || { type: 'email', template: 'generic' };

    return {
      type: mapping.type as any,
      template: mapping.template,
      recipient: {
        email: data.email || data.customer?.email,
        phone: data.phone || data.customer?.phone,
      },
      data,
    };
  }
}

export default NotificationProxyService;
```

**File: `/opt/medusa/src/modules/file-r2/index.ts`** (Custom R2 File Provider)

```typescript
import { AbstractFileService } from "@medusajs/medusa";
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import stream from "stream";

interface R2Options {
  account_id: string;
  access_key_id: string;
  secret_access_key: string;
  bucket: string;
  public_url?: string;
}

class R2FileService extends AbstractFileService {
  protected client_: S3Client;
  protected bucket_: string;
  protected publicUrl_: string;

  constructor(container, options: R2Options) {
    super(container);

    this.client_ = new S3Client({
      region: "auto",
      endpoint: `https://${options.account_id}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: options.access_key_id,
        secretAccessKey: options.secret_access_key,
      },
    });

    this.bucket_ = options.bucket;
    this.publicUrl_ = options.public_url || `https://pub-${options.account_id}.r2.dev`;
  }

  async upload(file: Express.Multer.File): Promise<{ url: string; key: string }> {
    const key = `${Date.now()}-${file.originalname}`;

    await this.client_.send(
      new PutObjectCommand({
        Bucket: this.bucket_,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    return {
      url: `${this.publicUrl_}/${key}`,
      key,
    };
  }

  async uploadProtected(file: Express.Multer.File): Promise<{ url: string; key: string }> {
    const key = `protected/${Date.now()}-${file.originalname}`;

    await this.client_.send(
      new PutObjectCommand({
        Bucket: this.bucket_,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    // Generate presigned URL valid for 1 hour
    const url = await getSignedUrl(
      this.client_,
      new GetObjectCommand({
        Bucket: this.bucket_,
        Key: key,
      }),
      { expiresIn: 3600 }
    );

    return { url, key };
  }

  async delete(file: { key: string }): Promise<void> {
    await this.client_.send(
      new DeleteObjectCommand({
        Bucket: this.bucket_,
        Key: file.key,
      })
    );
  }

  async getUploadStreamDescriptor(fileData: {
    name: string;
    ext?: string;
  }): Promise<{
    writeStream: stream.PassThrough;
    promise: Promise<any>;
    url: string;
    fileKey: string;
  }> {
    const key = `${Date.now()}-${fileData.name}${fileData.ext || ""}`;
    const writeStream = new stream.PassThrough();
    
    const uploadPromise = this.client_.send(
      new PutObjectCommand({
        Bucket: this.bucket_,
        Key: key,
        Body: writeStream,
      })
    );

    return {
      writeStream,
      promise: uploadPromise,
      url: `${this.publicUrl_}/${key}`,
      fileKey: key,
    };
  }

  async getDownloadStream(fileData: { key: string }): Promise<NodeJS.ReadableStream> {
    const response = await this.client_.send(
      new GetObjectCommand({
        Bucket: this.bucket_,
        Key: fileData.key,
      })
    );

    return response.Body as NodeJS.ReadableStream;
  }

  async getPresignedDownloadUrl(fileData: { key: string }): Promise<string> {
    return await getSignedUrl(
      this.client_,
      new GetObjectCommand({
        Bucket: this.bucket_,
        Key: fileData.key,
      }),
      { expiresIn: 3600 }
    );
  }
}

export default R2FileService;
```

### 5.3 Redis → Pub/Sub Shim Service

**File: `/opt/medusa/shim-service/redis-pubsub-shim.js`**

```javascript
const Redis = require('ioredis');
const { PubSub } = require('@google-cloud/pubsub');
const { Logger } = require('@medusajs/medusa/dist/utils');

const logger = new Logger();
const redis = new Redis(process.env.REDIS_URL);
const pubsub = new PubSub();

// Map Medusa events to Pub/Sub topics
const EVENT_TOPIC_MAP = {
  'customer.created': 'customer-events',
  'customer.updated': 'customer-events',
  'order.placed': 'order-events',
  'order.updated': 'order-events',
  'order.completed': 'order-events',
  'order.canceled': 'order-events',
  'inventory.updated': 'inventory-events',
  'product.created': 'inventory-events',
  'product.updated': 'inventory-events',
};

// Track last processed message ID for each stream
const lastIds = {};

async function processStream(streamKey) {
  try {
    // Start from last ID or beginning
    const startId = lastIds[streamKey] || '0';
    
    // Read new messages from Redis Stream
    const results = await redis.xread(
      'BLOCK', 5000,  // Block for 5 seconds
      'STREAMS', streamKey, startId
    );

    if (!results) return; // No new messages

    for (const [stream, messages] of results) {
      for (const [id, fields] of messages) {
        try {
          // Parse event data from Redis Stream
          const eventData = {};
          for (let i = 0; i < fields.length; i += 2) {
            eventData[fields[i]] = fields[i + 1];
          }

          const eventName = eventData.eventName || eventData.event;
          const data = JSON.parse(eventData.data || '{}');

          // Determine target Pub/Sub topic
          const topicName = EVENT_TOPIC_MAP[eventName];
          
          if (!topicName) {
            logger.warn(`No topic mapping for event: ${eventName}`);
            lastIds[streamKey] = id;
            continue;
          }

          // Publish to Pub/Sub
          const topic = pubsub.topic(topicName);
          const messageBuffer = Buffer.from(JSON.stringify({
            eventName,
            data,
            source: 'medusa',
            timestamp: new Date().toISOString(),
            medusaStreamId: id,
          }));

          await topic.publishMessage({
            data: messageBuffer,
            attributes: {
              eventName,
              source: 'medusa',
            },
          });

          logger.info(`Published event ${eventName} to ${topicName}`);
          lastIds[streamKey] = id;

        } catch (error) {
          logger.error(`Failed to process message ${id}: ${error.message}`);
          // Continue processing other messages
        }
      }
    }
  } catch (error) {
    logger.error(`Error processing stream ${streamKey}: ${error.message}`);
  }
}

// Main loop
async function main() {
  logger.info('Starting Redis → Pub/Sub Shim Service');
  
  const streamKey = 'medusa-events'; // Medusa's default event stream

  while (true) {
    await processStream(streamKey);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  redis.quit();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  redis.quit();
  process.exit(0);
});

main().catch((error) => {
  logger.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
```

**File: `/opt/medusa/shim-service/package.json`**

```json
{
  "name": "redis-pubsub-shim",
  "version": "1.0.0",
  "main": "redis-pubsub-shim.js",
  "dependencies": {
    "ioredis": "^5.3.2",
    "@google-cloud/pubsub": "^4.0.0"
  }
}
```

### 5.4 Systemd Service Files

**File: `/etc/systemd/system/medusa-server.service`**

```ini
[Unit]
Description=MedusaJS Server
After=network.target redis-server.service

[Service]
Type=simple
User=medusa
WorkingDirectory=/opt/medusa
EnvironmentFile=/opt/medusa/.env
ExecStart=/usr/bin/node /opt/medusa/node_modules/@medusajs/medusa/dist/bin/medusa.js start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

**File: `/etc/systemd/system/medusa-worker.service`**

```ini
[Unit]
Description=MedusaJS Worker
After=network.target redis-server.service medusa-server.service

[Service]
Type=simple
User=medusa
WorkingDirectory=/opt/medusa
EnvironmentFile=/opt/medusa/.env
ExecStart=/usr/bin/node /opt/medusa/node_modules/@medusajs/medusa/dist/bin/medusa.js worker
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

**File: `/etc/systemd/system/redis-pubsub-shim.service`**

```ini
[Unit]
Description=Redis to Pub/Sub Shim Service
After=network.target redis-server.service

[Service]
Type=simple
User=medusa
WorkingDirectory=/opt/medusa/shim-service
EnvironmentFile=/opt/medusa/.env
Environment="GOOGLE_APPLICATION_CREDENTIALS=/opt/medusa/service-account-key.json"
ExecStart=/usr/bin/node /opt/medusa/shim-service/redis-pubsub-shim.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

**Enable and start services:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable medusa-server
sudo systemctl enable medusa-worker
sudo systemctl enable redis-pubsub-shim
sudo systemctl start medusa-server
sudo systemctl start medusa-worker
sudo systemctl start redis-pubsub-shim
```

---

## Part 6: Webhook Handlers (Cloud Run Functions)

### 6.1 Stripe Webhook Handler

**File: `services/webhooks/stripe-webhook/index.js`**

```javascript
const { PubSub } = require('@google-cloud/pubsub');
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const pubsub = new PubSub();

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`Received event: ${event.type}`);

  try {
    // Publish event to Pub/Sub
    const topic = pubsub.topic('stripe-events');
    const messageBuffer = Buffer.from(JSON.stringify({
      eventType: event.type,
      eventId: event.id,
      data: event.data.object,
      created: event.created,
    }));

    const messageId = await topic.publishMessage({
      data: messageBuffer,
      attributes: {
        eventType: event.type,
        source: 'stripe-webhook',
      },
    });

    console.log(`Published message ${messageId} to stripe-events topic`);

    // Acknowledge webhook immediately
    res.status(200).json({ received: true, messageId });

  } catch (error) {
    console.error(`Failed to publish to Pub/Sub: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

**File: `services/webhooks/stripe-webhook/package.json`**

```json
{
  "name": "stripe-webhook-handler",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "@google-cloud/pubsub": "^4.0.0",
    "stripe": "^14.0.0"
  }
}
```

**File: `services/webhooks/stripe-webhook/Dockerfile`**

```dockerfile
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Cloud Run expects port 8080
ENV PORT=8080
EXPOSE 8080

CMD ["node", "index.js"]
```

### 6.2 Deploy Webhook Handlers

**File: `scripts/gcp/deploy-webhooks.sh`**

```bash
#!/bin/bash
set -e

PROJECT_ID="opticworks-prod"
REGION="us-central1"

echo "🚀 Deploying webhook handlers to Cloud Run..."

# 1. Deploy Stripe webhook handler
echo "Deploying Stripe webhook handler..."
cd services/webhooks/stripe-webhook

gcloud run deploy stripe-webhook \
  --source . \
  --project=$PROJECT_ID \
  --region=$REGION \
  --platform=managed \
  --allow-unauthenticated \
  --service-account=svc-webhook-publisher@$PROJECT_ID.iam.gserviceaccount.com \
  --set-secrets=STRIPE_SECRET_KEY=stripe-secret-key:latest,STRIPE_WEBHOOK_SECRET=stripe-webhook-secret:latest \
  --max-instances=10 \
  --memory=256Mi \
  --timeout=60s

STRIPE_WEBHOOK_URL=$(gcloud run services describe stripe-webhook \
  --project=$PROJECT_ID \
  --region=$REGION \
  --format="value(status.url)")

echo "✅ Stripe webhook URL: $STRIPE_WEBHOOK_URL"

# 2. Configure Stripe webhook endpoint
echo ""
echo "Configure this URL in Stripe Dashboard:"
echo "  $STRIPE_WEBHOOK_URL/webhook"
echo ""
echo "Events to subscribe:"
echo "  - checkout.session.completed"
echo "  - payment_intent.succeeded"
echo "  - payment_intent.payment_failed"
echo "  - customer.created"
echo "  - customer.updated"

cd ../../..

echo "✅ Webhook handlers deployed"
```

---

## Part 7: Customer Data Sync Architecture

### 7.1 Customer Event Subscriber (Medusa)

**File: `/opt/medusa/src/subscribers/customer-sync.ts`**

```typescript
import { EventBusService } from "@medusajs/medusa";
import { PubSub } from "@google-cloud/pubsub";

type SubscriberConfig = {
  event: string;
  context: {
    subscriberId: string;
  };
};

export default async function customerSyncHandler({
  data,
  eventName,
  container,
}: {
  data: { id: string };
  eventName: string;
  container: any;
}) {
  const pubsub = new PubSub();
  const customerService = container.resolve("customerService");
  const logger = container.resolve("logger");

  try {
    // Fetch full customer data
    const customer = await customerService.retrieve(data.id, {
      relations: ["orders", "addresses"],
    });

    // Prepare event payload
    const eventPayload = {
      eventName,
      customerId: customer.id,
      email: customer.email,
      firstName: customer.first_name,
      lastName: customer.last_name,
      phone: customer.phone,
      metadata: customer.metadata,
      totalOrders: customer.orders?.length || 0,
      createdAt: customer.created_at,
      updatedAt: customer.updated_at,
    };

    // Publish to customer-events topic
    const topic = pubsub.topic("customer-events");
    const messageBuffer = Buffer.from(JSON.stringify(eventPayload));

    await topic.publishMessage({
      data: messageBuffer,
      attributes: {
        eventName,
        customerId: customer.id,
        source: "medusa-direct",
      },
    });

    logger.info(`Customer event ${eventName} published for ${customer.id}`);
  } catch (error) {
    logger.error(`Failed to sync customer: ${error.message}`);
  }
}

export const config: SubscriberConfig = {
  event: [
    "customer.created",
    "customer.updated",
  ],
  context: {
    subscriberId: "customer-sync-handler",
  },
};
```

### 7.2 Stripe Customer Sync Service

**File: `services/sync/stripe-customer-sync/index.js`**

```javascript
const { PubSub } = require('@google-cloud/pubsub');
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const pubsub = new PubSub();

// Listen to customer-events topic
const subscription = pubsub.subscription('stripe-sync-sub');

subscription.on('message', async (message) => {
  const eventData = JSON.parse(message.data.toString());
  
  console.log(`Processing customer event: ${eventData.eventName}`);

  try {
    switch (eventData.eventName) {
      case 'customer.created':
        await createStripeCustomer(eventData);
        break;
      case 'customer.updated':
        await updateStripeCustomer(eventData);
        break;
    }

    message.ack();
  } catch (error) {
    console.error(`Failed to sync to Stripe: ${error.message}`);
    message.nack(); // Retry
  }
});

async function createStripeCustomer(data) {
  // Check if customer already exists
  const existing = await stripe.customers.list({
    email: data.email,
    limit: 1,
  });

  if (existing.data.length > 0) {
    console.log(`Customer already exists in Stripe: ${existing.data[0].id}`);
    return existing.data[0];
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: data.email,
    name: `${data.firstName} ${data.lastName}`.trim(),
    phone: data.phone,
    metadata: {
      medusa_customer_id: data.customerId,
      source: 'medusa',
    },
  });

  console.log(`Created Stripe customer: ${customer.id}`);
  return customer;
}

async function updateStripeCustomer(data) {
  // Find Stripe customer by Medusa ID
  const customers = await stripe.customers.search({
    query: `metadata['medusa_customer_id']:'${data.customerId}'`,
  });

  if (customers.data.length === 0) {
    console.log(`Stripe customer not found, creating...`);
    return await createStripeCustomer(data);
  }

  // Update existing customer
  const customer = await stripe.customers.update(customers.data[0].id, {
    email: data.email,
    name: `${data.firstName} ${data.lastName}`.trim(),
    phone: data.phone,
  });

  console.log(`Updated Stripe customer: ${customer.id}`);
  return customer;
}

console.log('Stripe customer sync service started');
```

---

## Part 8: Deployment Procedures

### 8.1 Complete Infrastructure Provisioning

**File: `scripts/deploy-all.sh`** (Master deployment script)

```bash
#!/bin/bash
set -e

echo "🚀 OpticWorks Complete Infrastructure Deployment"
echo "================================================"

# Check prerequisites
command -v gcloud >/dev/null 2>&1 || { echo "❌ gcloud CLI is required"; exit 1; }
command -v wrangler >/dev/null 2>&1 || { echo "❌ wrangler CLI is required"; exit 1; }

# Set project
PROJECT_ID="${GCP_PROJECT_ID:-opticworks-prod}"
gcloud config set project $PROJECT_ID

echo ""
echo "📋 Deployment Checklist:"
echo "  Project ID: $PROJECT_ID"
echo "  Cloudflare Account: $CF_ACCOUNT_ID"
echo "  Domain: opticworks.com"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Phase 1: GCP Infrastructure
echo ""
echo "Phase 1: GCP Infrastructure Setup"
echo "===================================="
bash scripts/gcp/setup-vpc.sh
bash scripts/gcp/setup-cloud-sql.sh
bash scripts/gcp/setup-pubsub.sh
bash scripts/gcp/setup-iam.sh
bash scripts/gcp/provision-medusa-vm.sh

# Phase 2: Cloudflare Setup
echo ""
echo "Phase 2: Cloudflare Infrastructure Setup"
echo "========================================="
bash scripts/cloudflare/setup-infrastructure.sh

# Phase 3: Deploy Webhooks
echo ""
echo "Phase 3: Deploy Webhook Handlers"
echo "================================="
bash scripts/gcp/deploy-webhooks.sh

# Phase 4: Medusa Setup (manual step)
echo ""
echo "Phase 4: Medusa Setup (Manual)"
echo "==============================="
echo "SSH into the VM and run:"
echo "  gcloud compute ssh medusa-vm --zone=us-central1-a --tunnel-through-iap"
echo "  sudo -u medusa bash /opt/medusa/scripts/vm-setup.sh"
echo ""
read -p "Press enter when Medusa setup is complete..."

# Phase 5: Deploy Frontend
echo ""
echo "Phase 5: Deploy Frontend to Cloudflare Workers"
echo "==============================================="
bash scripts/cloudflare/build-and-deploy.sh production

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "Next Steps:"
echo "  1. Configure Stripe webhook URL in Stripe Dashboard"
echo "  2. Test checkout flow end-to-end"
echo "  3. Monitor logs in GCP and Cloudflare"
echo "  4. Configure DNS to point to Workers"
```

### 8.2 Validation & Testing

**File: `scripts/validate-deployment.sh`**

```bash
#!/bin/bash
set -e

PROJECT_ID="opticworks-prod"
REGION="us-central1"
ZONE="us-central1-a"

echo "🔍 Validating deployment..."

# 1. Check GCP resources
echo "Checking GCP resources..."
gcloud compute instances describe medusa-vm --zone=$ZONE --project=$PROJECT_ID >/dev/null 2>&1 && echo "✅ Medusa VM running" || echo "❌ Medusa VM not found"

gcloud sql instances describe opticworks-db --project=$PROJECT_ID >/dev/null 2>&1 && echo "✅ Cloud SQL running" || echo "❌ Cloud SQL not found"

# 2. Check Pub/Sub topics
TOPICS=("stripe-events" "customer-events" "order-events")
for topic in "${TOPICS[@]}"; do
  gcloud pubsub topics describe $topic --project=$PROJECT_ID >/dev/null 2>&1 && echo "✅ Topic $topic exists" || echo "❌ Topic $topic missing"
done

# 3. Check Cloud Run services
WEBHOOK_URL=$(gcloud run services describe stripe-webhook --region=$REGION --project=$PROJECT_ID --format="value(status.url)" 2>/dev/null)
if [ -n "$WEBHOOK_URL" ]; then
  echo "✅ Stripe webhook: $WEBHOOK_URL"
else
  echo "❌ Stripe webhook not deployed"
fi

# 4. Check Medusa services (SSH required)
echo ""
echo "Checking Medusa services (requires SSH)..."
gcloud compute ssh medusa-vm --zone=$ZONE --project=$PROJECT_ID --tunnel-through-iap --command="
  systemctl is-active --quiet medusa-server && echo '✅ Medusa server running' || echo '❌ Medusa server not running'
  systemctl is-active --quiet medusa-worker && echo '✅ Medusa worker running' || echo '❌ Medusa worker not running'
  systemctl is-active --quiet redis-pubsub-shim && echo '✅ Redis shim running' || echo '❌ Redis shim not running'
  redis-cli ping >/dev/null 2>&1 && echo '✅ Redis responding' || echo '❌ Redis not responding'
"

# 5. Check Cloudflare Workers
echo ""
echo "Checking Cloudflare Workers..."
wrangler deployments list --name opticworks-landing >/dev/null 2>&1 && echo "✅ Workers deployed" || echo "❌ Workers not deployed"

echo ""
echo "✅ Validation complete"
```

### 8.3 Monitoring Setup

**File: `scripts/gcp/setup-monitoring.sh`**

```bash
#!/bin/bash
set -e

PROJECT_ID="opticworks-prod"

echo "📊 Setting up monitoring and alerting..."

# 1. Create notification channel (email)
NOTIFICATION_CHANNEL=$(gcloud alpha monitoring channels create \
  --display-name="OpticWorks Ops Team" \
  --type=email \
  --channel-labels=email_address=ops@opticworks.com \
  --project=$PROJECT_ID \
  --format="value(name)")

# 2. Create alert policy for VM health
gcloud alpha monitoring policies create \
  --notification-channels=$NOTIFICATION_CHANNEL \
  --display-name="Medusa VM Down" \
  --condition-display-name="VM Instance Down" \
  --condition-threshold-value=1 \
  --condition-threshold-duration=300s \
  --condition-threshold-comparison=COMPARISON_GT \
  --condition-threshold-aggregations=mean,900s,metric.type=\"compute.googleapis.com/instance/uptime\" \
  --project=$PROJECT_ID

# 3. Create alert for Cloud SQL
gcloud alpha monitoring policies create \
  --notification-channels=$NOTIFICATION_CHANNEL \
  --display-name="Cloud SQL High Connections" \
  --condition-display-name="Connection count > 80" \
  --condition-threshold-value=80 \
  --condition-threshold-comparison=COMPARISON_GT \
  --condition-threshold-aggregations=mean,60s,metric.type=\"cloudsql.googleapis.com/database/postgresql/num_backends\" \
  --project=$PROJECT_ID

# 4. Create uptime check for Workers
gcloud monitoring uptime create opticworks-landing-uptime \
  --display-name="OpticWorks Landing Health" \
  --resource-type=uptime-url \
  --http-check-path=/api/health \
  --host=opticworks.com \
  --project=$PROJECT_ID

echo "✅ Monitoring configured"
```

---

## Part 9: Migration Checklist

### Pre-Migration

- [ ] **Environment Variables**: All secrets in GCP Secret Manager and Cloudflare
- [ ] **Domain Access**: Cloudflare DNS configured
- [ ] **GCP APIs**: All required APIs enabled
- [ ] **Service Accounts**: Created with proper IAM roles
- [ ] **VPC & Networking**: VPC, subnets, firewall rules configured
- [ ] **Cloud SQL**: Database created, migrations ready
- [ ] **Pub/Sub**: Topics and subscriptions created
- [ ] **R2 Buckets**: Created and configured
- [ ] **KV Namespaces**: Created for ISR

### Infrastructure Deployment

- [ ] **Compute Engine VM**: Provisioned with correct specs
- [ ] **Medusa Backend**: Installed and configured on VM
- [ ] **Redis**: Running on VM, configured for Medusa
- [ ] **Shim Service**: Deployed and forwarding events
- [ ] **Systemd Services**: All services enabled and started
- [ ] **Webhook Handlers**: Deployed to Cloud Run
- [ ] **Workers**: Built and deployed to Cloudflare

### Testing

- [ ] **Health Checks**: All services responding
- [ ] **Database Connectivity**: Medusa can connect to Cloud SQL
- [ ] **Redis Connectivity**: Medusa can use Redis cache
- [ ] **Pub/Sub Flow**: Events flowing from Redis to Pub/Sub
- [ ] **Webhook Processing**: Stripe webhook → Cloud Run → Pub/Sub working
- [ ] **Customer Sync**: Customer events reaching all subscribers
- [ ] **Frontend**: Workers serving pages correctly
- [ ] **Assets**: R2 serving static files
- [ ] **ISR**: Cache invalidation working
- [ ] **Checkout Flow**: End-to-end payment processing

### Go-Live

- [ ] **DNS Cutover**: Point domain to Cloudflare Workers
- [ ] **SSL/TLS**: Certificates active
- [ ] **Monitoring**: Alerts configured
- [ ] **Logging**: Log aggregation working
- [ ] **Backup**: Database backup schedule confirmed
- [ ] **Rollback Plan**: Documented and tested

### Post-Migration

- [ ] **Performance Monitoring**: Check latency and errors
- [ ] **Cost Analysis**: Compare actual vs. estimated costs
- [ ] **User Acceptance**: Stakeholder sign-off
- [ ] **Documentation**: Update architecture docs
- [ ] **Decommission Vercel**: Cancel after stable period

---

## Part 10: Rollback Procedures

### Emergency Rollback to Vercel

If critical issues arise:

```bash
#!/bin/bash
# Emergency rollback script

echo "⚠️  EMERGENCY ROLLBACK TO VERCEL"

# 1. Update DNS back to Vercel
# (Manual in Cloudflare Dashboard)
echo "1. Update DNS CNAME to point back to Vercel"
echo "   opticworks.com → cname.vercel-dns.com"

# 2. Disable Workers route
wrangler routes delete opticworks.com/* --force

# 3. Re-enable Vercel deployment
cd /path/to/vercel-project
vercel --prod

echo "✅ Rollback initiated. Verify in 5-10 minutes."
```

---

## Part 11: Cost Estimation

### Cloudflare (Monthly)
- Workers: ~$5/mo (free tier + $0.50/million requests)
- R2: ~$15/mo (10GB storage + operations)
- KV: ~$5/mo (operations)
- **Total: ~$25/mo**

### GCP (Monthly)
- Compute Engine VM (e2-standard-4): ~$130/mo
- Cloud SQL (db-custom-2-7680): ~$100/mo
- Pub/Sub: ~$10/mo (first 10GB free)
- Cloud Run webhooks: ~$5/mo (mostly free tier)
- Egress: ~$20/mo
- **Total: ~$265/mo**

### Combined Total: **~$290/month**

Compare to Vercel Pro: $20/mo (but lacks backend capabilities)

---

## Appendix: Directory Structure

```
opticworks-landing/
├── src/                          # Next.js app (existing)
├── scripts/
│   ├── cloudflare/
│   │   ├── setup-infrastructure.sh
│   │   ├── build-and-deploy.sh
│   │   └── sync-assets-to-r2.sh
│   ├── gcp/
│   │   ├── setup-vpc.sh
│   │   ├── setup-cloud-sql.sh
│   │   ├── setup-pubsub.sh
│   │   ├── setup-iam.sh
│   │   ├── provision-medusa-vm.sh
│   │   ├── deploy-webhooks.sh
│   │   └── setup-monitoring.sh
│   ├── medusa/
│   │   └── vm-setup.sh
│   ├── deploy-all.sh
│   └── validate-deployment.sh
├── services/
│   ├── webhooks/
│   │   └── stripe-webhook/
│   │       ├── index.js
│   │       ├── package.json
│   │       └── Dockerfile
│   └── sync/
│       └── stripe-customer-sync/
│           ├── index.js
│           └── package.json
├── wrangler.toml
├── open-next.config.ts
└── docs/
    └── TECHNICAL_MIGRATION.md  # This document
```
