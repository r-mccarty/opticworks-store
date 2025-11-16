# OpticWorks Migration Implementation Guide (Bootstrap Edition)

**Last updated**: 2025-11-16
**Companion to**: `docs/MIGRATION_PLAN.md` v3.0

This guide provides **executable commands, scripts, and verification steps** for each milestone in the bootstrap migration plan. Copy-paste these commands directly into your terminal or use them as templates for automation scripts.

---

## Prerequisites

### Tools Required
- **SSH access** to Hetzner node (see `docs/CONTRIBUTORS.md`)
- **pnpm** v8+ installed locally and on Hetzner
- **Docker** + **Docker Compose** on Hetzner node
- **Git** configured with repo access
- **Playwright** for E2E tests (installed via pnpm)

### Secrets Inventory
Before starting, gather these credentials:
- Hetzner SSH key and IP address
- Stripe test/live API keys (`sk_test_*`, `sk_live_*`)
- Resend API key for transactional emails
- PostgreSQL/Redis passwords (generate secure values)

---

## Phase 1: Hetzner Deployment & Single Product Validation

### Milestone B1: Medusa Running on Hetzner

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

#### Step 3: Configure Environment
```bash
# Create environment file
cd /opt/opticworks/medusa-backend/services/medusa
cp .env.example .env

# Edit .env with production values
nano .env
```

**Required environment variables**:
```bash
# services/medusa/.env
NODE_ENV=development  # Use 'production' when ready
PORT=9000

# Database
POSTGRES_USER=medusa
POSTGRES_PASSWORD=<generate-secure-password>
POSTGRES_DB=medusa
DATABASE_URL=postgres://medusa:<password>@postgres:5432/medusa

# Redis
REDIS_URL=redis://redis:6379

# Stripe
STRIPE_API_KEY=sk_test_51xxxxx  # Start with test key
STRIPE_WEBHOOK_SECRET=whsec_xxx # Set up later

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=<generate-secure-secret>

# Admin
MEDUSA_ADMIN_ONBOARDING_TYPE=default
MEDUSA_ADMIN_ONBOARDING_NEXTJS=true
```

#### Step 4: Start Infrastructure
```bash
# From /opt/opticworks/medusa-backend/services/medusa
docker compose up -d postgres redis

# Verify containers are running
docker ps
# Should show:
# - medusa-postgres (port 5432)
# - medusa-redis (port 6379)

# Check logs
docker compose logs postgres
docker compose logs redis
```

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

#### Step 7: Start Medusa Service
```bash
# Development mode (with auto-reload)
pnpm dev

# Or production mode
pnpm build
pnpm start

# Expected output:
# ✔ Medusa is running on http://localhost:9000
```

#### Step 8: Verify Health Check
```bash
# From local machine, test Hetzner Medusa
curl http://<hetzner-ip>:9000/health

# Expected response:
# {"status":"ok"}

# Test Admin UI (in browser)
# Navigate to: http://<hetzner-ip>:9000/app
# Should see Medusa Admin login screen
```

#### Troubleshooting B1
| Issue | Symptom | Solution |
|-------|---------|----------|
| Port 9000 not accessible | `curl` times out | Check firewall: `ufw allow 9000/tcp` |
| Database connection error | Medusa won't start | Verify `DATABASE_URL` matches docker-compose settings |
| Redis connection error | Medusa hangs on startup | Check Redis container: `docker compose logs redis` |
| Permission denied | Can't write to `/opt` | Run as root or fix permissions: `chown -R $USER:$USER /opt/opticworks` |

**Milestone B1 Exit Criteria**:
- [x] Medusa health endpoint returns 200 OK
- [x] Admin UI accessible at `http://<hetzner-ip>:9000/app`
- [x] Postgres + Redis containers healthy

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

#### Step 2: Create Product via Admin UI (Manual Verification)
```bash
# Navigate to Medusa Admin in browser
# http://<hetzner-ip>:9000/app

# 1. Create admin user (first time only)
#    - Email: admin@opticworks.io
#    - Password: <secure-password>

# 2. Login and navigate to Products > Add Product

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

#### Step 3: Test Product API
```bash
# List all products
curl http://<hetzner-ip>:9000/store/products

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
curl http://<hetzner-ip>:9000/store/products/<product-id>
```

#### Step 4: Configure Stripe Payment Provider
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
# Create a cart with Bed Presence Sensor
curl -X POST http://<hetzner-ip>:9000/store/carts \
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
- [x] Bed Presence Sensor visible in Medusa Admin
- [x] `GET /store/products` returns 1 product with correct data
- [x] Can create cart via API with Bed Sensor variant
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
HETZNER_MEDUSA_URL=http://<hetzner-ip>:9000
NEXT_PUBLIC_MEDUSA_ENABLED=true
NEXT_PUBLIC_MEDUSA_BASE_URL=http://<hetzner-ip>:9000
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
    const adminToken = process.env.MEDUSA_ADMIN_TOKEN;

    const response = await request.get(`${medusaUrl}/admin/orders`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
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

# Create .env.local pointing to Hetzner
cat > .env.local <<EOF
NEXT_PUBLIC_MEDUSA_ENABLED=true
NEXT_PUBLIC_MEDUSA_BASE_URL=http://<hetzner-ip>:9000
MEDUSA_API_TOKEN=<admin-token>
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
const ADMIN_TOKEN = process.env.MEDUSA_ADMIN_TOKEN;

async function importProducts() {
  for (const product of products) {
    console.log(`Importing ${product.name}...`);

    const response = await fetch(`${MEDUSA_URL}/admin/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
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
export MEDUSA_ADMIN_TOKEN=<your-admin-token>

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
curl -H "Authorization: Bearer <admin-token>" \
  http://<hetzner-ip>:9000/admin/products

# Count products
curl -s -H "Authorization: Bearer <admin-token>" \
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
          MEDUSA_ADMIN_TOKEN: ${{ secrets.MEDUSA_ADMIN_TOKEN }}
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
