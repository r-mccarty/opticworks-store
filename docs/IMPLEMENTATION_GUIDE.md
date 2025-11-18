# OpticWorks Migration Implementation Guide (Bootstrap Edition)

**Last updated**: 2025-11-17
**Companion to**: `docs/MIGRATION_PLAN.md` v4.1
**RFD-004 Status**: ✅ Resolved (all automation implemented)
**Deployment Philosophy**: Cloudflare Tunnel from day one, SSH for infrastructure only

This guide provides **executable commands, scripts, and verification steps** for each milestone in the bootstrap migration plan. Copy-paste these commands directly into your terminal or use them as templates for automation scripts.

---

## 🚀 Quick Start with Automation (RFD-004 Resolution)

All RFD-004 issues have been resolved with comprehensive automation. For the fastest setup:

```bash
# 1. Generate credentials
cd services/medusa
pnpm run generate:secrets > /tmp/medusa-secrets.env

# 2. Provision Hetzner infrastructure (if using remote node)
source /tmp/medusa-secrets.env
POSTGRES_PASSWORD=$POSTGRES_PASSWORD REDIS_PASSWORD=$REDIS_PASSWORD \
  ssh hetzner-node 'bash -s' < scripts/hetzner-provision.sh

# 3. Configure environment
cp .env.example .env
# Edit .env with generated credentials

# 4. Local setup
docker compose up -d
pnpm run migrate
pnpm run build
pnpm run setup:keys
pnpm run dev:pm2

# 5. Import catalog and verify
pnpm run catalog:import
pnpm run test:smoke
```

**See `services/medusa/README.md` for complete automation documentation.**

---

## Prerequisites

### Tools Required
- **SSH access** to Hetzner node (see `docs/CONTRIBUTORS.md`)
- **pnpm** v8+ installed locally and on Hetzner
- **Docker** + **Docker Compose** on Hetzner node
- **Git** configured with repo access
- **Playwright** for E2E tests (installed via pnpm)

### Secrets Inventory

**✨ NEW: Automated credential generation** - Use `pnpm run generate:secrets` to generate all required credentials.

**Manually obtained credentials:**
- Hetzner SSH key and IP address (see `docs/CONTRIBUTORS.md`)
- Stripe test/live API keys (`sk_test_*`, `sk_live_*`) - from Stripe dashboard
- Resend API key for transactional emails - from Resend dashboard
- Cloudflare R2 credentials (optional) - from Cloudflare dashboard

**Auto-generated credentials** (via `pnpm run generate:secrets`):
- PostgreSQL password (32-character secure random)
- Redis password (32-character secure random)
- JWT_SECRET (64-character hex)
- COOKIE_SECRET (64-character hex)

**Medusa admin credentials**:
- Secret API key (create via Medusa Admin → Settings → API Keys, store as `MEDUSA_SECRET_KEY` in Infisical)
- Admin email/password pair (used only as fallback when secret key unavailable)

> **Infisical workflow**: The Next.js storefront no longer commits `.env` files. Provision an `INFISICAL_TOKEN` (plus optional `INFISICAL_ENVIRONMENT`, `INFISICAL_SECRETS_PATH`, `INFISICAL_SITE_URL`) and run `pnpm run secrets:pull` or rely on the devcontainer post-create step to write `.env.local` automatically. All Medusa credentials should be added to Infisical after generation. See `.env.template` for the full key list.

---

## Phase 1: Hetzner Deployment with Cloudflare Tunnel & Single Product Validation

**Architecture Decision**: We set up Cloudflare Tunnel in Phase 1 (not Phase 4) because:
- SSH is for infrastructure management only (deployment, logs, database admin)
- Application access (Medusa Admin, Store API) uses proper SSL/TLS from day one
- No direct IP exposure or firewall port management needed
- Production-like environment from the start

### Milestone B1: Medusa Running on Hetzner with Cloudflare Tunnel

#### Step 1: SSH to Hetzner Node
```bash
# From your local machine
ssh root@<hetzner-ip>  # or use SSH key from CONTRIBUTORS.md

# Once connected, verify system requirements
docker --version       # Should be 24.0+
docker compose version # Should be 2.20+
pnpm --version        # Should be 8.0+
```

#### Step 2: Clone Repository
```bash
# On Hetzner node
cd /opt
mkdir -p opticworks
cd opticworks

# Clone repo (use deploy key or personal access token)
git clone https://github.com/r-mccarty/opticworks-store.git medusa-backend
cd medusa-backend

# Checkout the Claude migration branch if needed
git checkout claude/review-medusajs-migration-01Af3q2SdKB84Pwysm9GJez2

# Verify directory structure
ls -la services/medusa
```

#### Step 3: Generate Credentials (NEW - Automated)
```bash
# Generate secure credentials locally first
cd services/medusa
pnpm run generate:secrets > /tmp/medusa-secrets.env

# Review generated credentials
cat /tmp/medusa-secrets.env

# Output example:
# POSTGRES_PASSWORD=xyz123abc...
# REDIS_PASSWORD=abc789xyz...
# JWT_SECRET=64-char-hex...
# COOKIE_SECRET=64-char-hex...
# (Secret API key is created later via Medusa Admin UI)
```

#### Step 4: Provision Hetzner Infrastructure (NEW - Automated)
```bash
# Load generated credentials
source /tmp/medusa-secrets.env

# Run provisioning script on Hetzner node
# This will:
# - Install/configure PostgreSQL 15 with medusa_db and medusa_user
# - Install/configure Redis with password authentication
# - Verify all connections work
POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
REDIS_PASSWORD=$REDIS_PASSWORD \
ssh hetzner-node 'bash -s' < scripts/hetzner-provision.sh

# Expected output:
# ✓ PostgreSQL user 'medusa_user' and database 'medusa_db' configured
# ✓ Redis password configured
# ✓ PostgreSQL connection successful
# ✓ Redis connection successful
# DATABASE_URL=postgres://medusa_user:***@localhost:5432/medusa_db
# REDIS_URL=redis://:***@localhost:6379
```

#### Step 4b: Configure Environment
```bash
# Create environment file on Hetzner
cd /opt/opticworks/medusa-backend/services/medusa
cp .env.example .env

# Edit .env with generated credentials
nano .env
```

**Required environment variables** (use generated values from Step 3):
```bash
# services/medusa/.env
NODE_ENV=development  # Use 'production' when ready
PORT=9000
MEDUSA_BACKEND_URL=http://localhost:9000

# Database (use credentials from generate:secrets)
DATABASE_URL=postgres://medusa_user:<POSTGRES_PASSWORD>@localhost:5432/medusa_db

# Redis (use credentials from generate:secrets)
REDIS_URL=redis://:<REDIS_PASSWORD>@localhost:6379

# Stripe (get from Stripe dashboard)
STRIPE_API_KEY=sk_test_51xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Secrets (use credentials from generate:secrets)
JWT_SECRET=<JWT_SECRET>
COOKIE_SECRET=<COOKIE_SECRET>
MEDUSA_SECRET_KEY=<secret-api-key-from-admin-ui>
MEDUSA_ADMIN_EMAIL=admin@optic.works
MEDUSA_ADMIN_PASSWORD=<secure-password>  # fallback when secret key unavailable

# Admin
MEDUSA_ADMIN_URL=http://localhost:9000
```

**💡 Tip**: Store all credentials in Infisical immediately after generation.

#### Step 5: Install Dependencies
```bash
# From repo root
cd /opt/opticworks/medusa-backend
pnpm install

# Or install just Medusa workspace
pnpm install --filter @opticworks/medusa-service
```

#### Step 6: Run Database Migrations
```bash
cd /opt/opticworks/medusa-backend/services/medusa

# Run Medusa migrations
pnpm migrate

# Expected output:
# ✔ Migrations completed successfully
# Database schema is up to date
```

#### Step 7: Build and Validate (NEW - Automated)
```bash
cd /opt/opticworks/medusa-backend/services/medusa

# Build admin dashboard (required before start)
pnpm run build

# Validate build and prerequisites
pnpm run validate:build

# Expected output:
# ✓ Admin Dashboard Build
# ✓ Environment Variables
# ✓ Database Connection
# ✓ Redis Connection
```

#### Step 8: Start Medusa with PM2 (NEW - Recommended)
```bash
# Start with PM2 supervisor (auto-restarts on crash)
pnpm run dev:pm2

# Or for production mode
pnpm run start:pm2

# Monitor logs
pnpm run logs:pm2

# Expected output:
# [PM2] Process launched
# [medusa-dev] Medusa is running on http://localhost:9000
```

**Why PM2?** Addresses RFD-004 Issue #1 - dev server instability. PM2 automatically restarts Medusa when esbuild crashes, keeping the service available.

#### Step 9: Setup Publishable API Key (NEW - Automated)
```bash
# Create publishable key for Store API
pnpm run setup:keys

# Expected output:
# ✓ Found sales channel: "Default Sales Channel"
# ✓ Created publishable API key: pk_xxx
# ✓ Successfully associated key with sales channel
#
# Add this to your storefront .env:
# NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxx
```

#### Step 10: Comprehensive Health Check (NEW - Automated)
```bash
# Run health checks (tests localhost)
pnpm run health:check

# Expected output:
# ✓ PostgreSQL: Connected (v15.x)
# ✓ Redis: Connected (v7.x)
# ✓ Admin API: Accessible at http://localhost:9000
# ✓ Store API: Accessible (0 products)

# Or test manually via localhost
curl http://localhost:9000/health
curl http://localhost:9000/store/products
```

#### Step 11: Install Cloudflare Tunnel (NEW - Phase 1)
```bash
# Download and install cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb

# Verify installation
cloudflared --version
```

#### Step 12: Authenticate Tunnel
```bash
# This command will output a URL - open it in your browser to authenticate
cloudflared tunnel login

# Credentials stored at: ~/.cloudflared/cert.pem
ls -la ~/.cloudflared/
```

#### Step 13: Create and Configure Tunnel
```bash
# Create tunnel named "opticworks-medusa"
cloudflared tunnel create opticworks-medusa

# Output example:
# Tunnel credentials written to: /root/.cloudflared/<tunnel-id>.json
# Created tunnel opticworks-medusa with id <tunnel-id>

# Save the tunnel ID
TUNNEL_ID=$(cloudflared tunnel list | grep opticworks-medusa | awk '{print $1}')
echo "Tunnel ID: $TUNNEL_ID"

# Create tunnel configuration
sudo mkdir -p /etc/cloudflared
sudo tee /etc/cloudflared/config.yml > /dev/null <<EOF
tunnel: $TUNNEL_ID
credentials-file: /root/.cloudflared/${TUNNEL_ID}.json

ingress:
  - hostname: api.optic.works
    service: http://localhost:9000
    originRequest:
      noTLSVerify: false
      connectTimeout: 30s
  - service: http_status:404
EOF

# Verify config syntax
cloudflared tunnel ingress validate
```

#### Step 14: Configure DNS
```bash
# Option 1: Use cloudflared CLI to create DNS record
cloudflared tunnel route dns opticworks-medusa api.optic.works

# Expected output:
# Added CNAME api.optic.works which will route to this tunnel
```

**Or Option 2**: Configure DNS manually in Cloudflare dashboard:
1. Navigate to DNS settings for `optic.works` domain
2. Add CNAME record:
   - Name: `api`
   - Target: `<tunnel-id>.cfargotunnel.com`
   - Proxy status: Proxied (orange cloud)

#### Step 15: Install Tunnel as Systemd Service
```bash
# Install service
sudo cloudflared service install

# Enable auto-start on boot
sudo systemctl enable cloudflared

# Start service
sudo systemctl start cloudflared

# Check status
sudo systemctl status cloudflared

# View logs
sudo journalctl -u cloudflared -f
```

#### Step 16: Verify Tunnel Connectivity
```bash
# From your local machine (not Hetzner), test the tunnel
curl https://api.optic.works/health

# Expected response:
# {"status":"ok"}

# Test admin accessibility
curl -I https://api.optic.works/app

# Check tunnel metrics in Cloudflare dashboard:
# Zero Trust → Access → Tunnels → opticworks-medusa
```

#### Troubleshooting B1

| Issue | Symptom | Solution |
|-------|---------|----------|
| **Dev server crashes** (RFD-004 #1) | esbuild errors, service restarts | Use PM2: `pnpm run dev:pm2` |
| **Connection refused** (RFD-004 #3) | Scripts fail with ECONNREFUSED | Use `pnpm run health:wait` before running scripts |
| **Missing publishable key** (RFD-004 #4) | Store API returns 401 | Run `pnpm run setup:keys` |
| **Build validation fails** (RFD-004 #2) | `pnpm start` errors | Run `pnpm run build` then `pnpm run validate:build` |
| Port 9000 not accessible | `curl` times out | Check firewall: `ufw allow 9000/tcp` |
| Database connection error | Medusa won't start | Run `pnpm run health:check` to diagnose |
| Redis connection error | Medusa hangs on startup | Verify REDIS_URL password matches provisioned value |
| Permission denied | Can't write to `/opt` | Run as root or fix permissions: `chown -R $USER:$USER /opt/opticworks` |

**Comprehensive Diagnostics**:
```bash
# Run full smoke test suite
pnpm run test:smoke

# Check individual components
pnpm run health:check
pnpm run validate:build
```

**Milestone B1 Exit Criteria**:
- [x] Medusa health endpoint returns 200 OK via `https://api.optic.works/health`
- [x] Admin UI accessible at `https://api.optic.works/app`
- [x] PostgreSQL + Redis healthy on Hetzner node
- [x] Cloudflared service running (`systemctl status cloudflared`)
- [x] SSL/TLS certificate valid (Cloudflare managed)
- [x] Publishable API key created and associated with sales channel
- [x] All smoke tests passing

---

### Milestone B2: Single Product Import

#### Step 1: Extract Bed Presence Sensor Data
```bash
# From local development machine
cd /home/user/opticworks-store

# View product definition
grep -A 50 "bed-presence-sensor" src/lib/products.ts
```

**Extract these fields**:
- **ID**: `bed-presence-sensor`
- **Name**: Bed Presence Sensor
- **Description**: mmWave radar sensor for under-mattress installation
- **Price**: $199.00 USD
- **Image**: (existing CDN URL or upload to Medusa)
- **Metadata**: category, specifications, keyBenefits

#### Step 2: Admin Authentication Setup

**Note**: Medusa v2 uses JWT-based authentication via the `/auth/admin/emailpass` endpoint. See `docs/RFD-005.md` for complete technical details.

**Create Admin User** (first time only):
```bash
ssh hetzner-node
cd /opt/opticworks/medusa-backend/services/medusa
pnpm medusa user -e admin@optic.works -p '<secure-password>'
```

**Add credentials to Infisical**:
1. Navigate to Infisical project → Development environment
2. Add secrets:
   - `MEDUSA_ADMIN_EMAIL=admin@optic.works`
   - `MEDUSA_ADMIN_PASSWORD=<secure-password>`
3. Pull to local: `pnpm run secrets:pull`

**Verify Authentication**:
```bash
# Test JWT authentication endpoint
curl -X POST https://api.optic.works/auth/admin/emailpass \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@optic.works","password":"<password>"}' \
  | jq

# Expected response: {"token":"eyJhbGci..."}
```

**Automation Scripts**:
The following scripts now use JWT authentication automatically:
- `pnpm run setup:keys` - Creates publishable API keys
- `pnpm run catalog:import` - Imports products
- `pnpm run catalog:verify` - Verifies catalog integrity

All scripts read `MEDUSA_ADMIN_EMAIL` and `MEDUSA_ADMIN_PASSWORD` from environment.

#### Step 3: Create Product via Admin UI (Manual Verification)
```bash
# Navigate to Medusa Admin in browser
# https://api.optic.works/app

# 1. Login with admin@optic.works credentials

# 2. Navigate to Products > Add Product

# 3. Fill in product details:
#    - Title: Bed Presence Sensor
#    - Handle: bed-presence-sensor
#    - Description: [paste from products.ts]
#    - Status: Published

# 4. Add Variant:
#    - Title: Default
#    - SKU: BED-SENSOR-001
#    - Inventory: 100 units
#    - Price: 19900 (cents, USD)

# 5. Upload product image or set thumbnail URL

# 6. Add metadata (optional):
#    - category: sensor
#    - compatibility: bed
```

#### Step 4: Test Product API
```bash
# List all products (via tunnel)
curl https://api.optic.works/store/products

# Expected response:
# {
#   "products": [{
#     "id": "prod_xxx",
#     "title": "Bed Presence Sensor",
#     "handle": "bed-presence-sensor",
#     "variants": [...]
#   }]
# }

# Get specific product
curl https://api.optic.works/store/products/<product-id>
```

#### Step 5: Configure Stripe Payment Provider
Edit `services/medusa/medusa-config.ts`:
```typescript
// Ensure Stripe module is configured
{
  resolve: "@medusajs/medusa/payment",
  options: {
    providers: [
      {
        resolve: "@medusajs/payment-stripe",
        id: "stripe",
        options: {
          apiKey: process.env.STRIPE_API_KEY,
          webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        },
      },
    ],
  },
}
```

Restart Medusa:
```bash
# On Hetzner
cd /opt/opticworks/medusa-backend/services/medusa
pnpm dev  # Restart to apply config changes
```

#### Step 5: Test Cart Creation
```bash
# Create a cart with Bed Presence Sensor (via tunnel)
curl -X POST https://api.optic.works/store/carts \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{
      "variant_id": "<variant-id-from-step-3>",
      "quantity": 1
    }]
  }'

# Expected response:
# {
#   "cart": {
#     "id": "cart_xxx",
#     "items": [...],
#     "total": 19900
#   }
# }
```

**Milestone B2 Exit Criteria**:
- [x] Bed Presence Sensor visible in Medusa Admin at `https://api.optic.works/app`
- [x] `GET https://api.optic.works/store/products` returns 1 product with correct data
- [x] Can create cart via API with Bed Sensor variant (through tunnel)
- [x] Stripe provider configured

---

### Milestone B3: First Checkout E2E Test

#### Step 1: Install Playwright
```bash
# From local repo
cd /home/user/opticworks-store

pnpm add -D @playwright/test
npx playwright install chromium  # Install browser binaries
```

#### Step 2: Configure Test Environment
Create `playwright.config.ts`:
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

Create `.env.test`:
```bash
TEST_BASE_URL=http://localhost:3000
HETZNER_MEDUSA_URL=https://api.optic.works
NEXT_PUBLIC_MEDUSA_ENABLED=true
NEXT_PUBLIC_MEDUSA_BASE_URL=https://api.optic.works
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxx
```

#### Step 3: Write First E2E Test
Create `tests/e2e/checkout-bed-sensor.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Bed Presence Sensor Checkout', () => {
  test('should complete checkout flow via Hetzner Medusa', async ({ page }) => {
    // 1. Navigate to product page
    await page.goto('/products/bed-presence-sensor');
    await expect(page.locator('h1')).toContainText('Bed Presence Sensor');

    // 2. Add to cart
    await page.click('[data-testid="add-to-cart"]');
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');

    // 3. View cart
    await page.goto('/store/cart');
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-total"]')).toContainText('$199.00');

    // 4. Proceed to checkout
    await page.click('[data-testid="checkout-button"]');
    await expect(page).toHaveURL(/\/store\/checkout/);

    // 5. Fill shipping address
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="firstName"]', 'Test');
    await page.fill('[name="lastName"]', 'User');
    await page.fill('[name="address1"]', '123 Main St');
    await page.fill('[name="city"]', 'San Francisco');
    await page.fill('[name="state"]', 'CA');
    await page.fill('[name="zip"]', '94102');

    // 6. Fill payment (Stripe test card)
    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]');
    await stripeFrame.locator('[name="cardnumber"]').fill('4242424242424242');
    await stripeFrame.locator('[name="exp-date"]').fill('12/25');
    await stripeFrame.locator('[name="cvc"]').fill('123');

    // 7. Submit order
    await page.click('[data-testid="submit-order"]');

    // 8. Verify success page
    await expect(page).toHaveURL(/\/store\/success/, { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('Order Confirmed');

    // 9. Extract order ID
    const orderIdElement = await page.locator('[data-testid="order-id"]');
    const orderId = await orderIdElement.textContent();
    expect(orderId).toBeTruthy();

    console.log(`✅ Order created: ${orderId}`);
  });

  test('should verify order exists in Medusa Admin', async ({ request }) => {
    // This test requires Medusa Admin API access
    const medusaUrl = process.env.HETZNER_MEDUSA_URL;
    const adminSecret = process.env.MEDUSA_SECRET_KEY;

    const response = await request.get(`${medusaUrl}/admin/orders`, {
      headers: {
        'Authorization': `Basic ${adminSecret}`,
        'Content-Type': 'application/json',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.orders).toBeDefined();
    expect(data.orders.length).toBeGreaterThan(0);
  });
});
```

#### Step 4: Update Storefront to Use Hetzner Medusa
```bash
# From local repo
cd /home/user/opticworks-store

# Create .env.local pointing to Hetzner via tunnel
cat > .env.local <<EOF
NEXT_PUBLIC_MEDUSA_ENABLED=true
NEXT_PUBLIC_MEDUSA_BASE_URL=https://api.optic.works
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=<publishable-key-from-setup-keys>
MEDUSA_SECRET_KEY=<medusa-secret-api-key>
RESEND_API_KEY=<your-resend-key>
EOF

# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

#### Step 5: Run E2E Test
```bash
# Start storefront (terminal 1)
pnpm dev

# Run Playwright test (terminal 2)
npx playwright test tests/e2e/checkout-bed-sensor.spec.ts

# View test report
npx playwright show-report
```

#### Troubleshooting B3
| Issue | Solution |
|-------|----------|
| Stripe Elements not loading | Verify `STRIPE_API_KEY` is set in Medusa .env, check browser console for errors |
| Timeout on payment submission | Increase Playwright timeout: `{ timeout: 30000 }` |
| Order not appearing in Admin | Check Medusa logs for errors, verify webhook configuration |
| Test data-testid not found | Add `data-testid` attributes to storefront components |

**Milestone B3 Exit Criteria**:
- [x] E2E test passes locally
- [x] Can manually complete checkout in browser
- [x] Order appears in Medusa Admin with line items
- [x] Playwright test added to repo (`tests/e2e/`)

---

## Phase 2: Full Catalog Migration & Storefront Integration

### Milestone B4: Automated Catalog Import

#### Step 1: Review Import Script
```bash
# View existing script
cat services/medusa/scripts/import-products.ts
```

**Expected script structure**:
```typescript
import dotenv from 'dotenv';
import { products } from '../../../src/lib/products';

dotenv.config({ path: '.env' });

const MEDUSA_URL = process.env.MEDUSA_BASE_URL || 'http://localhost:9000';
const ADMIN_SECRET = process.env.MEDUSA_SECRET_KEY;

async function importProducts() {
  for (const product of products) {
    console.log(`Importing ${product.name}...`);

    const response = await fetch(`${MEDUSA_URL}/admin/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${ADMIN_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: product.name,
        handle: product.id,
        description: product.description,
        status: 'published',
        variants: [{
          title: 'Default',
          prices: [{ amount: product.price * 100, currency_code: 'usd' }],
          inventory_quantity: 100,
          manage_inventory: true,
        }],
        metadata: {
          category: product.category,
          specifications: product.specifications,
          keyBenefits: product.keyBenefits,
        },
      }),
    });

    if (response.ok) {
      console.log(`✅ Imported ${product.name}`);
    } else {
      const error = await response.text();
      console.error(`❌ Failed to import ${product.name}:`, error);
    }
  }
}

importProducts();
```

#### Step 2: Generate Admin Token
```bash
# On Hetzner, create admin API token
# Log into Medusa Admin (http://<hetzner-ip>:9000/app)
# Navigate to Settings > API Keys > Create Token
# Copy token and add to .env

# Or use Medusa CLI (if available):
pnpm medusa user --email admin@opticworks.io --password <password>
```

#### Step 3: Run Import Script
```bash
# From Hetzner or local machine
cd /opt/opticworks/medusa-backend/services/medusa

# Set environment variables
export MEDUSA_BASE_URL=http://localhost:9000
export MEDUSA_SECRET_KEY=<your-secret-api-key>

# Run import
pnpm catalog:import

# Expected output:
# Importing Bed Presence Sensor...
# ✅ Imported Bed Presence Sensor
# Importing Duo Pack Presence Sensors...
# ✅ Imported Duo Pack Presence Sensors
# ...
```

#### Step 4: Verify Products in Admin
```bash
# List all products via API
curl -H "Authorization: Basic $MEDUSA_SECRET_KEY" \
  http://<hetzner-ip>:9000/admin/products

# Count products
curl -s -H "Authorization: Basic $MEDUSA_SECRET_KEY" \
  http://<hetzner-ip>:9000/admin/products | jq '.products | length'

# Expected: 6-8 products
```

#### Step 5: Handle Product Images
**Option A: Upload to Medusa** (recommended for self-hosted)
```bash
# Use Medusa Admin UI to upload images, or configure file service
# See medusa-config.ts for S3/Cloudflare R2 integration
```

**Option B: Link to Existing CDN**
```typescript
// In import script, set thumbnail field
thumbnail: product.image,  // e.g., https://cdn.opticworks.io/...
```

**Milestone B4 Exit Criteria**:
- [x] All products imported (verify count in Admin)
- [x] Product metadata preserved (check one product in detail)
- [x] Images accessible (test product listing page)
- [x] No import errors in script output

---

### Milestone B5: Storefront Integration

#### Step 1: Update Environment Variables
```bash
# Local development (.env.local)
NEXT_PUBLIC_MEDUSA_ENABLED=true
NEXT_PUBLIC_MEDUSA_BASE_URL=http://<hetzner-ip>:9000
MEDUSA_API_TOKEN=<admin-token>

# Production (Vercel environment variables)
# Set same variables in Vercel dashboard
```

#### Step 2: Simplify Medusa Service Layer
Edit `src/lib/api/medusa.ts`:
```typescript
// Remove complex transformation logic
// Keep it simple: direct API calls with minimal mapping

export async function listProducts(): Promise<Product[]> {
  if (!medusaConfig.enabled) {
    return fallbackProducts;  // Remove this after validation
  }

  const response = await fetch(`${medusaConfig.baseUrl}/store/products`);
  const data = await response.json();

  return data.products.map((p: MedusaProduct) => ({
    id: p.id,
    name: p.title,
    description: p.description,
    price: p.variants[0]?.prices[0]?.amount / 100,
    image: p.thumbnail,
    category: p.metadata?.category || 'sensor',
    // ... map other fields as needed
  }));
}
```

#### Step 3: Test Product Listing
```bash
# Start storefront
pnpm dev

# Open browser: http://localhost:3000/products
# Verify: Products load from Hetzner Medusa
# Check: Browser devtools Network tab for API calls to Hetzner
```

#### Step 4: Test Product Detail Pages
```bash
# Navigate to: http://localhost:3000/products/bed-presence-sensor
# Verify: Product details render correctly
# Check: Price, image, description match Medusa data
```

#### Step 5: Test Cart Operations
```typescript
// Update useCart store to use Medusa cart API
// Example: src/hooks/useCart.ts

export const useCart = create<CartStore>((set, get) => ({
  items: [],

  addItem: async (product: Product, quantity: number) => {
    const medusaUrl = process.env.NEXT_PUBLIC_MEDUSA_BASE_URL;

    if (medusaUrl) {
      // Create or update Medusa cart
      const response = await fetch(`${medusaUrl}/store/carts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ variant_id: product.id, quantity }],
        }),
      });

      const { cart } = await response.json();
      set({ items: cart.items, cartId: cart.id });
    } else {
      // Legacy local cart (remove after validation)
      set({ items: [...get().items, { product, quantity }] });
    }
  },

  // ... other cart methods
}));
```

**Manual Testing Checklist**:
- [ ] Add product to cart
- [ ] Update quantity
- [ ] Remove item from cart
- [ ] Cart persists across page refreshes
- [ ] Cart badge shows correct count

**Milestone B5 Exit Criteria**:
- [x] Product listing fetches from Medusa
- [x] Product details render correctly
- [x] Cart operations work via Medusa API
- [x] No console errors in browser

---

### Milestone B6: Full Checkout Integration

#### Step 1: Update Checkout Page
Edit `src/app/store/checkout/page.tsx`:
```typescript
'use client';

import { useCart } from '@/hooks/useCart';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

export default function CheckoutPage() {
  const { cartId, items } = useCart();
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Fetch payment session from Medusa
    const initPayment = async () => {
      const medusaUrl = process.env.NEXT_PUBLIC_MEDUSA_BASE_URL;
      const response = await fetch(`${medusaUrl}/store/carts/${cartId}/payment-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider_id: 'stripe' }),
      });

      const { cart } = await response.json();
      const stripeSession = cart.payment_sessions.find(s => s.provider_id === 'stripe');
      setClientSecret(stripeSession.data.client_secret);
    };

    if (cartId) initPayment();
  }, [cartId]);

  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm cartId={cartId} />
    </Elements>
  );
}
```

#### Step 2: Handle Payment Completion
```typescript
// src/components/checkout/CheckoutForm.tsx
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();

  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: `${window.location.origin}/store/success`,
    },
  });

  if (error) {
    console.error('Payment error:', error);
    setError(error.message);
  }

  // On success, Stripe redirects to return_url
  // Medusa webhook will mark order as complete
};
```

#### Step 3: Configure Medusa Webhooks
```bash
# Set up Stripe webhook endpoint in Medusa
# medusa-config.ts should already have:
{
  resolve: "@medusajs/payment-stripe",
  options: {
    apiKey: process.env.STRIPE_API_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
}

# Create webhook in Stripe dashboard:
# URL: http://<hetzner-ip>:9000/stripe/hooks
# Events: payment_intent.succeeded, payment_intent.payment_failed
```

#### Step 4: Implement Order Confirmation
```typescript
// src/app/store/success/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    // Fetch order details from Medusa
    const fetchOrder = async () => {
      const medusaUrl = process.env.NEXT_PUBLIC_MEDUSA_BASE_URL;
      const response = await fetch(`${medusaUrl}/store/orders/${orderId}`);
      const { order } = await response.json();
      setOrder(order);
    };

    if (orderId) fetchOrder();
  }, [orderId]);

  return (
    <div>
      <h1>Order Confirmed!</h1>
      <p>Order ID: {orderId}</p>
      {/* Display order details */}
    </div>
  );
}
```

#### Step 5: Test Full Checkout Flow
```bash
# Run E2E test from Milestone B3
npx playwright test tests/e2e/checkout-bed-sensor.spec.ts

# Manually test in browser:
# 1. Add product to cart
# 2. Proceed to checkout
# 3. Fill shipping/payment
# 4. Submit order
# 5. Verify success page
# 6. Check Medusa Admin for order
```

**Milestone B6 Exit Criteria**:
- [x] Checkout completes via Medusa
- [x] Order appears in Medusa Admin
- [x] Order confirmation email sent
- [x] E2E tests pass for all products

---

## Phase 3: Knowledge Systems & Production Hardening

### Milestone B7: Hugo Docs Site

#### Step 1: Configure Hugo
```bash
cd platform/docs-site

# Initialize Hugo (if not already done)
hugo new site . --force

# Install Geekdoc theme
git submodule add https://github.com/thegeeklab/hugo-geekdoc themes/geekdoc
```

Edit `platform/docs-site/hugo.toml`:
```toml
baseURL = "https://docs.opticworks.io"
title = "OpticWorks Documentation"
theme = "geekdoc"

[params]
  geekdocRepo = "https://github.com/r-mccarty/opticworks-store"
  geekdocEditPath = "edit/main/docs"
  geekdocSearch = true
  geekdocDarkMode = true
```

#### Step 2: Sync Content from /docs
```bash
# Create symlink or copy script
ln -s ../../docs platform/docs-site/content

# Or use build script:
cat > platform/docs-site/sync-content.sh <<'EOF'
#!/bin/bash
rsync -av --exclude='archived' ../../docs/ content/
EOF

chmod +x platform/docs-site/sync-content.sh
```

#### Step 3: Test Locally
```bash
# Run Hugo dev server
hugo server -D

# Open browser: http://localhost:1313
# Verify: All markdown docs render correctly
```

#### Step 4: Deploy to Cloudflare Pages
```bash
# Build static site
hugo --minify

# Output in public/ directory
ls -la public/

# Deploy via Cloudflare Pages:
# 1. Connect GitHub repo
# 2. Build command: cd platform/docs-site && hugo --minify
# 3. Publish directory: platform/docs-site/public
```

**Milestone B7 Exit Criteria**:
- [x] `pnpm docs:dev` runs Hugo server
- [x] All docs render correctly
- [x] Search works
- [x] Deployed to `docs.opticworks.io`

---

### Milestone B8: Discourse Forum

*(Similar detailed steps for Discourse deployment - omitted for brevity, follow pattern above)*

---

### Milestone B9: Production Readiness

#### CI/CD Pipeline
Create `.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push:
    branches: [main, claude/*]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Lint
        run: pnpm run lint

      - name: Build storefront
        run: pnpm run build
        timeout-minutes: 10

      - name: Build Medusa
        run: pnpm --filter @opticworks/medusa-service build

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          HETZNER_MEDUSA_URL: ${{ secrets.HETZNER_MEDUSA_URL }}
          MEDUSA_SECRET_KEY: ${{ secrets.MEDUSA_SECRET_KEY }}
```

#### Deployment Script for Hetzner
Create `scripts/deploy-medusa.sh`:
```bash
#!/bin/bash
set -e

echo "🚀 Deploying Medusa to Hetzner..."

# SSH to Hetzner and update
ssh root@<hetzner-ip> <<'EOF'
  cd /opt/opticworks/medusa-backend
  git pull origin main
  cd services/medusa
  pnpm install
  pnpm build
  systemctl restart medusa
  echo "✅ Medusa deployed successfully"
EOF

echo "✅ Deployment complete"
```

Make executable:
```bash
chmod +x scripts/deploy-medusa.sh
```

**Milestone B9 Exit Criteria**:
- [x] CI runs on every PR
- [x] Deployment script works
- [x] Monitoring configured
- [x] Rollback procedure documented

---

## Cleanup: Delete Legacy Code

Once Phase 2 is complete and stable:

```bash
# Archive products.ts
git mv src/lib/products.ts docs/archived/static-catalog.ts

# Delete legacy Stripe routes
rm -rf src/app/api/stripe/create-payment-intent
rm -rf src/app/api/stripe/create-checkout-session

# Simplify medusa.ts (remove fallback logic)
# Edit src/lib/api/medusa.ts and remove fallbackProducts references

# Commit cleanup
git add -A
git commit -m "chore: remove legacy Stripe routes, archive static catalog"
git push
```

---

## Phase 4: Storefront Deployment & Webhook Buffering

**Note**: Cloudflare Tunnel was set up in Phase 1, so Phase 4 focuses on storefront deployment and production hardening.

### Milestone P1: Storefront Deployment to Cloudflare Pages

**Note**: Cloudflare Tunnel was configured in Phase 1, Milestone B1. See steps 11-16 above.

#### Step 1: Connect GitHub Repository
```bash
# In Cloudflare dashboard:
# 1. Navigate to Workers & Pages → Pages
# 2. Click "Create application"
# 3. Select "Connect to Git"
# 4. Authorize Cloudflare to access GitHub
# 5. Select repository: r-mccarty/opticworks-store
# 6. Click "Begin setup"
```

#### Step 2: Configure Build Settings
**Build configuration**:
- Framework preset: **Next.js**
- Build command: `pnpm run build`
- Build output directory: `.next`
- Root directory: `/`
- Node version: `20`

**Advanced settings**:
```bash
# Install command (optional override)
pnpm install

# Build caching
Enable build cache: ✓
```

#### Step 3: Set Environment Variables
Navigate to Settings → Environment Variables and add:

```bash
# Production environment
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://optic.works

# Medusa integration
NEXT_PUBLIC_MEDUSA_ENABLED=true
NEXT_PUBLIC_MEDUSA_BASE_URL=https://api.optic.works
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxx  # From Medusa setup:keys script

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx  # Server-side only

# Resend
RESEND_API_KEY=re_prod_xxx
NEXT_PUBLIC_FROM_EMAIL=noreply@optic.works

# Cloudflare R2
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=opticworks-assets
R2_ENDPOINT_URL=https://xxx.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://assets.optic.works

# Copy all other vars from .env.template
```

**💡 Tip**: Use Infisical to manage production secrets, then copy values to Cloudflare Pages.

#### Step 4: Configure Custom Domain
```bash
# In Cloudflare Pages → Custom domains
# Add domains:
1. optic.works
2. www.optic.works

# DNS records (auto-created by Cloudflare):
# A record: optic.works → Cloudflare Pages IP
# CNAME: www → optic.works
```

#### Step 5: Enable Preview Deployments
```bash
# Settings → Builds & deployments
# Enable:
- ✓ Enable automatic deployments for production branch (main)
- ✓ Enable preview deployments for pull requests
- ✓ Enable comments on pull requests
```

#### Step 6: Trigger First Deployment
```bash
# Option 1: Push to main branch
git push origin main

# Option 2: Manual deploy in dashboard
# Deployments → Create deployment → Select branch

# Monitor deployment
# Cloudflare Pages shows build logs in real-time
```

#### Step 7: Verify Production Build
```bash
# Test production site
curl -I https://optic.works
curl https://optic.works/api/health  # If health endpoint exists

# Test Medusa integration
# Navigate to https://optic.works in browser
# Verify products load from api.optic.works
# Complete test checkout with Stripe test card
```

**Milestone P1 Exit Criteria**:
- [x] Site accessible at `https://optic.works` and `https://www.optic.works`
- [x] Products load from `https://api.optic.works`
- [x] Checkout flow completes successfully
- [x] Preview deployments work for PRs
- [x] Build time under 5 minutes

---

### Milestone P2: Cloudflare Workers Webhook Buffer

#### Step 1: Create Worker Workspace
```bash
# From repo root
mkdir -p workers/webhook-buffer
cd workers/webhook-buffer

# Initialize Wrangler project
pnpm create cloudflare@latest . --type=worker --ts

# Install dependencies
pnpm add stripe
pnpm add -D @cloudflare/workers-types
```

#### Step 2: Implement Worker Logic
Create `workers/webhook-buffer/src/index.ts`:
```typescript
import Stripe from 'stripe';

export interface Env {
  STRIPE_WEBHOOK_SECRET: string;
  MEDUSA_API_URL: string;
  MEDUSA_SECRET_KEY: string;
  WEBHOOK_BUFFER: DurableObjectNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const signature = request.headers.get('stripe-signature');
    if (!signature) {
      return new Response('Missing signature', { status: 400 });
    }

    const body = await request.text();

    // Verify Stripe signature
    const stripe = new Stripe(env.STRIPE_WEBHOOK_SECRET, {
      apiVersion: '2023-10-16',
    });

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Invalid signature', { status: 400 });
    }

    // Buffer webhook in Durable Object
    const id = env.WEBHOOK_BUFFER.idFromName('default');
    const stub = env.WEBHOOK_BUFFER.get(id);

    await stub.fetch(request.clone(), {
      body: JSON.stringify(event),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${env.MEDUSA_SECRET_KEY}`,
      },
    });

    // Acknowledge receipt to Stripe
    return new Response('Received', { status: 200 });
  },
};

// Durable Object for webhook buffering with retry logic
export class WebhookBuffer {
  async fetch(request: Request): Promise<Response> {
    const event = await request.json();
    const medusaUrl = request.headers.get('Medusa-URL') || '';
    const adminToken = request.headers.get('Authorization') || '';

    // Retry with exponential backoff
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await fetch(`${medusaUrl}/stripe/hooks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': adminToken,
          },
          body: JSON.stringify(event),
        });

        if (response.ok) {
          console.log(`Webhook forwarded successfully: ${event.id}`);
          return new Response('Forwarded', { status: 200 });
        }

        console.warn(`Attempt ${attempt} failed: ${response.status}`);
      } catch (err) {
        console.error(`Attempt ${attempt} error:`, err);
      }

      if (attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    }

    console.error(`Failed to forward webhook after 3 attempts: ${event.id}`);
    return new Response('Failed after retries', { status: 500 });
  }
}
```

#### Step 3: Configure Wrangler
Edit `workers/webhook-buffer/wrangler.toml`:
```toml
name = "webhook-buffer"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[env.production]
routes = [{ pattern = "webhook.optic.works/*", zone_name = "optic.works" }]

[[durable_objects.bindings]]
name = "WEBHOOK_BUFFER"
class_name = "WebhookBuffer"
script_name = "webhook-buffer"

[env.production.vars]
MEDUSA_API_URL = "https://api.optic.works"

[[env.production.secrets]]
STRIPE_WEBHOOK_SECRET = "whsec_xxx"
MEDUSA_SECRET_KEY = "sk_live_xxx"
```

#### Step 4: Deploy Worker
```bash
cd workers/webhook-buffer

# Login to Cloudflare
pnpm wrangler login

# Deploy to production
pnpm wrangler deploy

# Expected output:
# Uploaded webhook-buffer
# Published webhook-buffer
#   https://webhook.optic.works
```

#### Step 5: Update Stripe Webhook Endpoint
```bash
# In Stripe dashboard:
# 1. Navigate to Developers → Webhooks
# 2. Add endpoint: https://webhook.optic.works
# 3. Select events:
#    - payment_intent.succeeded
#    - payment_intent.payment_failed
#    - checkout.session.completed
# 4. Copy webhook signing secret to wrangler.toml
```

#### Step 6: Test Webhook Flow
```bash
# Use Stripe CLI to test
stripe listen --forward-to https://webhook.optic.works
stripe trigger payment_intent.succeeded

# Check Worker logs
pnpm wrangler tail

# Verify Medusa received event
# Check Medusa logs: ssh hetzner-node "sudo journalctl -u medusa -f"
```

**Milestone P2 Exit Criteria**:
- [x] Worker deployed to `webhook.optic.works`
- [x] Stripe signature verification working
- [x] Webhooks forwarded to Medusa successfully
- [x] Retry logic observable in Worker logs
- [x] Order status updates in Medusa after payment

---

### Milestone P3: Production Environment Hardening

#### Step 1: Enable SSL/TLS Strict Mode
```bash
# In Cloudflare dashboard for optic.works domain:
# 1. Navigate to SSL/TLS → Overview
# 2. Select "Full (strict)" mode
# 3. Navigate to Edge Certificates
# 4. Enable:
#    - ✓ Always Use HTTPS
#    - ✓ HTTP Strict Transport Security (HSTS)
#    - ✓ Automatic HTTPS Rewrites
#    - ✓ Minimum TLS Version: 1.2
```

#### Step 2: Rotate Production Secrets
```bash
# On Hetzner node
ssh hetzner-node

cd /opt/opticworks/medusa-backend/services/medusa

# Generate new credentials
pnpm run generate:secrets > /tmp/medusa-prod-secrets.env

# Review and update .env
nano .env

# Restart Medusa with new credentials
sudo systemctl restart medusa

# Store new secrets in Infisical
# Tag with: environment=production, rotated=$(date +%Y-%m-%d)
```

**Secret rotation schedule**:
- JWT_SECRET, COOKIE_SECRET: Monthly
- MEDUSA_SECRET_KEY: Monthly (regenerate via Medusa Admin → Settings → API Keys)
- PostgreSQL passwords: Quarterly
- API keys (Stripe, Resend): On vendor recommendation

#### Step 3: Setup Automated Backups
Create `/opt/opticworks/scripts/backup-medusa.sh`:
```bash
#!/bin/bash
set -euo pipefail

BACKUP_DIR="/backups/medusa"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="medusa_${DATE}.sql.gz"
R2_BUCKET="opticworks-backups"

# Create backup
pg_dump -U medusa_user medusa_db | gzip > "${BACKUP_DIR}/${BACKUP_FILE}"

# Upload to Cloudflare R2
aws s3 cp "${BACKUP_DIR}/${BACKUP_FILE}" "s3://${R2_BUCKET}/database/" \
  --endpoint-url https://xxx.r2.cloudflarestorage.com

# Cleanup local backups older than 7 days
find "${BACKUP_DIR}" -name "medusa_*.sql.gz" -mtime +7 -delete

echo "Backup completed: ${BACKUP_FILE}"
```

Make executable and schedule:
```bash
chmod +x /opt/opticworks/scripts/backup-medusa.sh

# Add to crontab (daily at 2 AM UTC)
crontab -e
# Add line:
0 2 * * * /opt/opticworks/scripts/backup-medusa.sh >> /var/log/medusa-backup.log 2>&1
```

#### Step 4: Configure Monitoring
**UptimeRobot health checks**:
1. Add monitor: `https://api.optic.works/health`
   - Check interval: 5 minutes
   - Alert on: Down, SSL expiry
2. Add monitor: `https://optic.works`
   - Check interval: 5 minutes

**Cloudflare Analytics**:
- Enable Web Analytics for `optic.works`
- Monitor Zero Trust → Tunnels for `opticworks-medusa` metrics

**Medusa logs**:
```bash
# On Hetzner, setup log rotation
sudo tee /etc/logrotate.d/medusa > /dev/null <<EOF
/var/log/medusa.log {
  daily
  rotate 14
  compress
  delaycompress
  notifempty
  create 0644 root root
}
EOF
```

#### Step 5: Harden Firewall
```bash
# On Hetzner node
ssh hetzner-node

# UFW rules (if using UFW)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 8032/tcp comment 'SSH from Codespaces'
sudo ufw enable

# Verify Cloudflare Tunnel handles all public traffic
# Medusa port 9000 should NOT be exposed to internet
sudo netstat -tulpn | grep :9000
# Should show: 127.0.0.1:9000 (localhost only)
```

**Cloudflare WAF**:
1. Navigate to Security → WAF
2. Enable OWASP ModSecurity Core Rule Set
3. Create custom rules:
   - Rate limit: 100 requests/min per IP for `/store/*`
   - Block requests missing User-Agent header
   - Challenge suspicious IP addresses

#### Step 6: Test Backup Restoration
```bash
# Download recent backup from R2
aws s3 cp "s3://opticworks-backups/database/medusa_latest.sql.gz" /tmp/ \
  --endpoint-url https://xxx.r2.cloudflarestorage.com

# Extract
gunzip /tmp/medusa_latest.sql.gz

# Restore to test database
psql -U medusa_user -d medusa_test < /tmp/medusa_latest.sql

# Verify data integrity
psql -U medusa_user -d medusa_test -c "SELECT COUNT(*) FROM product;"

# Document restoration procedure in CONTRIBUTORS.md
```

**Milestone P3 Exit Criteria**:
- [x] SSL Full (Strict) mode enabled
- [x] All production secrets rotated and stored in Infisical
- [x] Daily PostgreSQL backups to R2
- [x] Backup restoration tested successfully
- [x] Health checks configured and passing
- [x] Firewall rules applied (SSH only)
- [x] Cloudflare WAF enabled

---

## Quick Reference Commands

```bash
# Hetzner Medusa Management
ssh root@<hetzner-ip>
cd /opt/opticworks/medusa-backend/services/medusa
docker compose up -d postgres redis
pnpm dev

# Local Development
pnpm install
pnpm dev  # Storefront
pnpm --filter @opticworks/medusa-service dev  # Medusa

# Testing
npx playwright test
pnpm run lint
pnpm run build

# Deployment
./scripts/deploy-medusa.sh
git push origin main  # Vercel auto-deploys storefront
```

---

## Success Validation

After completing all phases, verify:

1. **Phase 1**: Medusa running on Hetzner, one product checkout works
2. **Phase 2**: All products in Medusa, storefront integrated, legacy code deleted
3. **Phase 3**: Docs live, forum deployed, CI green

**Final test**: Complete a full purchase flow from product discovery to order confirmation, verify order in Medusa Admin, confirm email received.
