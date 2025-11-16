# Hetzner Medusa Deployment Checklist

**Quick reference for Phase 1 deployment**
**Target**: Get MedusaJS running on Hetzner in <2 days

---

## Pre-Deployment (30 min)

### Gather Credentials
- [ ] Hetzner SSH IP address: `____________________`
- [ ] Hetzner SSH key path: `____________________`
- [ ] Stripe test secret key: `sk_test_____________________`
- [ ] Resend API key: `re_____________________`
- [ ] GitHub personal access token (for clone): `ghp_____________________`

### Generate Secrets
```bash
# PostgreSQL password
openssl rand -base64 24

# JWT secret
openssl rand -base64 32

# Note these values for .env file
```

---

## Phase 1A: Hetzner Infrastructure Setup (1-2 hours)

### Step 1: SSH Connection
```bash
ssh root@<hetzner-ip>

# Verify system
uname -a
docker --version  # Need 24.0+
pnpm --version    # Need 8.0+
```

- [ ] SSH connection successful
- [ ] Docker installed
- [ ] pnpm installed

### Step 2: Clone Repository
```bash
cd /opt
mkdir -p opticworks
cd opticworks

git clone https://github.com/r-mccarty/opticworks-store.git medusa-backend
cd medusa-backend
git checkout claude/review-medusajs-migration-01Af3q2SdKB84Pwysm9GJez2
```

- [ ] Repository cloned
- [ ] On correct branch
- [ ] `services/medusa/` directory exists

### Step 3: Configure Environment
```bash
cd services/medusa
cp .env.example .env
nano .env  # Edit with values below
```

**Required `.env` values**:
```bash
NODE_ENV=development
PORT=9000

POSTGRES_USER=medusa
POSTGRES_PASSWORD=<from-openssl-above>
POSTGRES_DB=medusa
DATABASE_URL=postgres://medusa:<password>@postgres:5432/medusa

REDIS_URL=redis://redis:6379

STRIPE_API_KEY=<stripe-test-key>
JWT_SECRET=<from-openssl-above>

MEDUSA_ADMIN_ONBOARDING_TYPE=default
```

- [ ] `.env` file created
- [ ] All secrets filled in
- [ ] `DATABASE_URL` password matches `POSTGRES_PASSWORD`

### Step 4: Start Infrastructure
```bash
docker compose up -d postgres redis

# Verify
docker ps  # Should show postgres + redis running
docker compose logs postgres
docker compose logs redis
```

- [ ] Postgres container running (port 5432)
- [ ] Redis container running (port 6379)
- [ ] No errors in logs

### Step 5: Install Dependencies
```bash
cd /opt/opticworks/medusa-backend
pnpm install

# This may take 5-10 minutes
```

- [ ] Dependencies installed
- [ ] No fatal errors

### Step 6: Run Migrations
```bash
cd services/medusa
pnpm migrate

# Expected: "Migrations completed successfully"
```

- [ ] Migrations completed
- [ ] Database schema created

### Step 7: Start Medusa
```bash
# In tmux or screen so it stays running
tmux new -s medusa
pnpm dev

# Expected output: "Medusa is running on http://localhost:9000"
# Detach from tmux: Ctrl+B, then D
```

- [ ] Medusa server started
- [ ] Listening on port 9000
- [ ] No startup errors

### Step 8: Configure Firewall
```bash
# Allow port 9000 through firewall
ufw allow 9000/tcp
ufw status
```

- [ ] Port 9000 open
- [ ] Firewall rules updated

### Step 9: Verify Health Check
```bash
# From local machine
curl http://<hetzner-ip>:9000/health

# Expected: {"status":"ok"}
```

- [ ] Health endpoint returns 200 OK
- [ ] Response is `{"status":"ok"}`

### Step 10: Access Admin UI
Open browser: `http://<hetzner-ip>:9000/app`

- [ ] Admin login screen visible
- [ ] No 404 or connection errors

---

## Phase 1B: Single Product Setup (2-3 hours)

### Step 1: Create Admin User
In browser at `http://<hetzner-ip>:9000/app`:

- [ ] Email: `admin@opticworks.io`
- [ ] Password: (secure, save in password manager)
- [ ] Admin account created successfully

### Step 2: Add Bed Presence Sensor Product

**Product Details**:
- Title: `Bed Presence Sensor`
- Handle: `bed-presence-sensor`
- Description: (copy from `src/lib/products.ts`)
- Status: `Published`

**Variant Details**:
- Title: `Default`
- SKU: `BED-SENSOR-001`
- Inventory: `100`
- Price: `19900` (cents = $199.00 USD)

**Checklist**:
- [ ] Product created
- [ ] Variant added with price
- [ ] Status set to Published
- [ ] Image uploaded or URL set

### Step 3: Test Product API
```bash
curl http://<hetzner-ip>:9000/store/products

# Should return products array with Bed Presence Sensor
```

- [ ] API returns products array
- [ ] Bed Presence Sensor present
- [ ] Price is 19900 cents
- [ ] Handle is `bed-presence-sensor`

### Step 4: Test Cart Creation
```bash
# Get variant ID from previous step
curl -X POST http://<hetzner-ip>:9000/store/carts \
  -H "Content-Type: application/json" \
  -d '{"items":[{"variant_id":"<variant-id>","quantity":1}]}'

# Should return cart with total=19900
```

- [ ] Cart created successfully
- [ ] Cart contains Bed Sensor
- [ ] Total is 19900 cents

---

## Phase 1C: Storefront Integration (1-2 hours)

### Step 1: Local Environment Setup
```bash
# On local machine
cd /home/user/opticworks-store

cat > .env.local <<EOF
NEXT_PUBLIC_MEDUSA_ENABLED=true
NEXT_PUBLIC_MEDUSA_BASE_URL=http://<hetzner-ip>:9000
MEDUSA_API_TOKEN=<admin-token-if-needed>
EOF
```

- [ ] `.env.local` created
- [ ] Hetzner IP address correct
- [ ] Medusa enabled flag set

### Step 2: Install Dependencies
```bash
pnpm install

# If Playwright not yet installed:
pnpm add -D @playwright/test
npx playwright install chromium
```

- [ ] Dependencies installed
- [ ] Playwright installed

### Step 3: Start Storefront
```bash
pnpm dev

# Open browser: http://localhost:3000
```

- [ ] Storefront starts on localhost:3000
- [ ] No build errors
- [ ] Homepage loads

### Step 4: Manual Checkout Test

**Test scenario**: Add Bed Sensor to cart → Complete checkout

1. Navigate to: `http://localhost:3000/products/bed-presence-sensor`
2. Click "Add to Cart"
3. Go to cart page
4. Proceed to checkout
5. Fill shipping address
6. Use Stripe test card: `4242 4242 4242 4242`, exp `12/25`, CVC `123`
7. Submit order

**Checklist**:
- [ ] Product page loads
- [ ] Add to cart works
- [ ] Cart shows 1 item
- [ ] Checkout page loads
- [ ] Stripe Elements loads
- [ ] Payment submission succeeds
- [ ] Redirected to success page
- [ ] Order ID displayed

### Step 5: Verify Order in Admin
Navigate to: `http://<hetzner-ip>:9000/app` → Orders

- [ ] Order appears in Medusa Admin
- [ ] Order contains Bed Presence Sensor
- [ ] Customer email captured
- [ ] Order total is $199.00

---

## Phase 1D: E2E Test Setup (1-2 hours)

### Step 1: Create Playwright Config
```bash
# Already scaffolded in repo, verify it exists
cat playwright.config.ts
```

- [ ] `playwright.config.ts` exists
- [ ] `testDir` points to `./tests/e2e`

### Step 2: Create E2E Test
```bash
mkdir -p tests/e2e
# Create checkout-bed-sensor.spec.ts per implementation guide
```

- [ ] Test file created at `tests/e2e/checkout-bed-sensor.spec.ts`
- [ ] Test includes all steps (product → cart → checkout → verify)

### Step 3: Run E2E Test
```bash
# Start storefront (terminal 1)
pnpm dev

# Run test (terminal 2)
npx playwright test tests/e2e/checkout-bed-sensor.spec.ts

# View report
npx playwright show-report
```

- [ ] Test runs without errors
- [ ] All assertions pass
- [ ] Order created in Medusa Admin
- [ ] Test report shows success

---

## Success Criteria ✅

**Phase 1 is complete when ALL of these are true**:

- [ ] Medusa running on Hetzner (health check returns 200)
- [ ] Admin UI accessible and functional
- [ ] Bed Presence Sensor product created
- [ ] Can create cart via API
- [ ] Storefront can fetch product from Hetzner
- [ ] Manual checkout completes successfully
- [ ] Order appears in Medusa Admin
- [ ] E2E test passes

**Time to complete**: 6-8 hours (can be split across 2 days)

---

## Troubleshooting

### Issue: Port 9000 not accessible
```bash
# Check firewall
ufw status
ufw allow 9000/tcp

# Check Medusa is running
tmux attach -t medusa
# or
ps aux | grep medusa
```

### Issue: Database connection error
```bash
# Check Postgres container
docker ps
docker compose logs postgres

# Verify DATABASE_URL in .env matches docker-compose
cat .env | grep DATABASE_URL
cat docker-compose.yml | grep POSTGRES
```

### Issue: Stripe Elements not loading
- Verify `STRIPE_API_KEY` is set in Medusa `.env`
- Check browser console for errors
- Ensure Stripe publishable key is in storefront env

### Issue: E2E test times out
- Increase Playwright timeout: `{ timeout: 30000 }`
- Check Medusa logs for errors
- Verify storefront can reach Hetzner (check `NEXT_PUBLIC_MEDUSA_BASE_URL`)

---

## Next Steps (After Phase 1)

Once Phase 1 is complete:

1. **Phase 2**: Import all products via `pnpm catalog:import`
2. **Phase 2**: Integrate full catalog into storefront
3. **Phase 2**: Replace legacy Stripe routes
4. **Phase 3**: Deploy Hugo docs + Discourse forum
5. **Phase 3**: Set up CI/CD pipeline

**Estimated timeline**: 3 weeks total (Phase 1 = Week 1, Phase 2 = Week 2, Phase 3 = Week 3)

---

## Quick Commands Reference

```bash
# Hetzner Medusa
ssh root@<hetzner-ip>
cd /opt/opticworks/medusa-backend/services/medusa
tmux attach -t medusa
docker compose up -d postgres redis
pnpm dev

# Local Storefront
pnpm dev
npx playwright test

# Health Checks
curl http://<hetzner-ip>:9000/health
curl http://<hetzner-ip>:9000/store/products
```
