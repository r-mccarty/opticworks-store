# Storefront-Backend Integration Guide

**Version**: 1.0
**Last Updated**: 2025-11-18
**Phase**: 2 - Storefront Integration
**Prerequisites**: Phase 1 complete (Medusa backend deployed and operational)

---

## Overview

This guide covers integrating the Next.js storefront with the Medusa v2 backend. Phase 1 (infrastructure deployment) is **complete** - this guide focuses on connecting the application layers.

**What you'll do:**
- Configure storefront to use Medusa API
- Verify product catalog integration
- Test cart and checkout flows
- Validate Stripe payment processing through Medusa
- Ensure all secrets are synced to Infisical

---

## Prerequisites Checklist

Before starting integration, verify these Phase 1 deliverables:

**Backend Status:**
```bash
# Health check
curl https://api.optic.works/health
# Expected: OK

# Admin dashboard
open https://api.optic.works/app
# Should load login page

# PM2 status (via SSH)
ssh hetzner-node "pm2 status"
# Should show medusa-dev online
```

**Infisical Access:**
- [ ] You have `INFISICAL_TOKEN` access
- [ ] Can run `pnpm run secrets:pull` successfully
- [ ] `.env.local` contains `NEXT_PUBLIC_MEDUSA_BASE_URL`

**Admin Dashboard:**
- [ ] Can log in to `https://api.optic.works/app`
- [ ] Products are visible in admin
- [ ] Publishable API key exists

---

## Step 1: Verify Backend Configuration

### 1.1 Check Product Catalog

**Via Admin Dashboard:**
1. Navigate to `https://api.optic.works/app`
2. Log in (credentials in Infisical: `MEDUSA_ADMIN_EMAIL`, `MEDUSA_ADMIN_PASSWORD`)
3. Go to Products section
4. Verify all OpticWorks sensors are listed

**Via Store API:**
```bash
# Get publishable key from Infisical or admin dashboard
export MEDUSA_KEY=pk_xxx

# Test Store API
curl -s -H "x-publishable-api-key: $MEDUSA_KEY" \
  https://api.optic.works/store/products | jq '.products[].title'

# Expected: List of product titles
```

### 1.2 Verify Publishable API Key

**Create if missing:**
1. Admin Dashboard → Settings → API Key Management
2. Create API Key:
   - Name: "Storefront Production"
   - Type: Publishable
   - Sales Channel: "Default Sales Channel"
3. Copy key immediately (format: `pk_xxx`)
4. Add to Infisical:
   - Environment: `production`
   - Path: `/`
   - Key: `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`
   - Value: `pk_xxx`

---

## Step 2: Configure Storefront

### 2.1 Pull Latest Secrets

```bash
# Pull secrets from Infisical
pnpm run secrets:pull

# Verify Medusa configuration
cat .env.local | grep MEDUSA
# Should show:
# NEXT_PUBLIC_MEDUSA_ENABLED=true
# NEXT_PUBLIC_MEDUSA_BASE_URL=https://api.optic.works
# NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxx
```

### 2.2 Enable Medusa Integration

If not already enabled, update in Infisical:
```bash
# Via Infisical web UI:
Environment: development
Path: /
Key: NEXT_PUBLIC_MEDUSA_ENABLED
Value: true

# Then pull locally
pnpm run secrets:pull
```

### 2.3 Start Development Server

```bash
pnpm run dev
# Should start on http://localhost:3000
```

---

## Step 3: Test Product Integration

### 3.1 Product Listing Page

**Navigate to:** `http://localhost:3000/products`

**Verify:**
- [ ] Products load from Medusa API (not static data)
- [ ] Product cards show correct titles, prices, images
- [ ] Clicking product navigates to detail page

**Debug if failing:**
```bash
# Check browser console for API errors
# Check Network tab for failed requests to /store/products

# Test API directly
curl -s -H "x-publishable-api-key: $MEDUSA_KEY" \
  http://localhost:3000/api/medusa/products | jq
```

### 3.2 Product Detail Page

**Navigate to:** `http://localhost:3000/products/bed-presence-sensor`

**Verify:**
- [ ] Product details load from Medusa
- [ ] Variants (if any) are selectable
- [ ] "Add to Cart" button appears
- [ ] Price updates based on variant selection

---

## Step 4: Test Cart Integration

### 4.1 Add to Cart

1. On product detail page, click "Add to Cart"
2. Open cart (click cart icon in header)

**Verify:**
- [ ] Item appears in cart with correct details
- [ ] Quantity can be updated
- [ ] Subtotal calculates correctly
- [ ] Cart persists on page reload (localStorage)

### 4.2 Cart Session (Medusa)

**Check browser DevTools:**
```javascript
// In console:
localStorage.getItem('cart-storage')
// Should show Medusa cart ID

// Check Medusa cart API
fetch('http://localhost:3000/api/medusa/cart', {
  headers: { 'x-publishable-api-key': 'pk_xxx' }
}).then(r => r.json()).then(console.log)
```

---

## Step 5: Test Checkout Flow

### 5.1 Initialize Checkout

1. Click "Proceed to Checkout" in cart
2. Should navigate to `/store/checkout`

**Verify:**
- [ ] Cart items display correctly
- [ ] Subtotal and totals match cart
- [ ] Stripe Elements form loads
- [ ] Address form appears

### 5.2 Complete Test Payment

**Use Stripe test card:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Fill out:**
1. Email address
2. Shipping address
3. Payment details (test card above)
4. Click "Place Order"

**Verify:**
- [ ] Payment processes successfully
- [ ] Redirects to success page (`/store/success`)
- [ ] Order confirmation appears
- [ ] Cart clears after successful order

### 5.3 Verify in Medusa Admin

1. Log in to `https://api.optic.works/app`
2. Navigate to Orders
3. Find your test order

**Verify:**
- [ ] Order appears with correct items
- [ ] Payment status: "Captured" or "Authorized"
- [ ] Customer email matches
- [ ] Shipping address correct

---

## Step 6: End-to-End Validation

### 6.1 Full User Journey

Simulate a complete purchase flow:

1. **Browse** → Visit `/products`
2. **Select** → Click on Bed Presence Sensor
3. **Configure** → Choose variant if applicable
4. **Add to Cart** → Click "Add to Cart"
5. **Review** → Open cart, verify items
6. **Checkout** → Proceed to checkout
7. **Fill Forms** → Enter shipping + payment (test card)
8. **Submit** → Place order
9. **Confirm** → Verify success page
10. **Admin Check** → Confirm order in Medusa admin

**Success Criteria:**
- [ ] No errors at any step
- [ ] Order appears in Medusa admin
- [ ] Payment captured in Stripe dashboard
- [ ] Email confirmation sent (if configured)

### 6.2 Error Scenarios

Test failure cases:

**Invalid Payment:**
1. Use test card `4000 0000 0000 0002` (decline)
2. Verify error message displays
3. Verify user can retry

**Empty Cart Checkout:**
1. Clear cart completely
2. Try navigating to `/store/checkout`
3. Verify redirect or error message

**Network Issues:**
1. With DevTools, block network request to Medusa
2. Verify graceful error handling
3. Verify loading states appear

---

## Step 7: Sync Production Secrets

### 7.1 Audit Current Secrets

**Required in Infisical:**
```bash
# Storefront (environment: development + production)
NEXT_PUBLIC_MEDUSA_ENABLED=true
NEXT_PUBLIC_MEDUSA_BASE_URL=https://api.optic.works
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx  # Or pk_live_xxx for production
STRIPE_SECRET_KEY=sk_test_xxx       # Or sk_live_xxx for production
RESEND_API_KEY=re_xxx

# Plus any missing variables from .env.template
```

### 7.2 Add Missing Secrets

**Check what's missing:**
```bash
# Compare .env.template with Infisical
diff <(grep -E '^[A-Z_]+=' .env.template | cut -d= -f1 | sort) \
     <(cat .env.local | grep -E '^[A-Z_]+=' | cut -d= -f1 | sort)

# Any variables only in .env.template need to be added to Infisical
```

**Add to Infisical:**
1. Open Infisical web UI
2. Select environment (development / production)
3. Add missing variables
4. Pull secrets locally: `pnpm run secrets:pull`

### 7.3 Rotate Staging Keys (if needed)

**Generate new Stripe keys:**
1. Log in to Stripe Dashboard
2. Developers → API keys
3. Create restricted key for development
4. Update in Infisical (environment: `development`)

---

## Troubleshooting

### Products Not Loading

**Symptom:** Product pages show empty or loading state

**Debug:**
```bash
# 1. Check Medusa API is accessible
curl -s https://api.optic.works/health
# Should return: OK

# 2. Test Store API with publishable key
curl -s -H "x-publishable-api-key: pk_xxx" \
  https://api.optic.works/store/products

# 3. Check browser console for CORS errors
# Should see requests to https://api.optic.works/store/products
```

**Solutions:**
- Verify `NEXT_PUBLIC_MEDUSA_ENABLED=true` in `.env.local`
- Verify `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` is valid
- Check CORS configuration in `services/medusa/medusa-config.ts`

### Cart Not Persisting

**Symptom:** Cart clears on page reload

**Debug:**
```javascript
// Browser console:
localStorage.getItem('cart-storage')
// Should contain cart state
```

**Solutions:**
- Check Zustand store configuration in `src/hooks/useCart.ts`
- Verify localStorage isn't blocked (private mode)
- Clear localStorage and try adding item again

### Checkout Payment Fails

**Symptom:** Payment errors or "Something went wrong"

**Debug:**
```bash
# 1. Check Stripe configuration in Medusa
ssh hetzner-node "cat /opt/opticworks/medusa-backend/services/medusa/.env | grep STRIPE"

# 2. Verify test mode keys
# Should start with pk_test_ or sk_test_
```

**Solutions:**
- Verify Stripe keys in Infisical match Medusa backend
- Check Stripe dashboard for error logs
- Ensure test card is used: `4242 4242 4242 4242`

### 502 Bad Gateway

**Symptom:** All Medusa API requests fail with 502

**Debug:**
```bash
# Check Medusa is running
ssh hetzner-node "pm2 status"
# Should show medusa-dev online

# Check local health
ssh hetzner-node "curl -s http://localhost:9000/health"
# Should return: OK

# Check Cloudflare Tunnel
ssh hetzner-node "systemctl status cloudflared"
# Should show active (running)
```

**Solutions:**
- Restart Medusa: `ssh hetzner-node "pm2 restart medusa-dev"`
- Restart Cloudflare Tunnel: `ssh hetzner-node "sudo systemctl restart cloudflared"`
- Check logs: `ssh hetzner-node "pm2 logs medusa-dev --lines 50"`

---

## Post-Integration Checklist

Once integration is complete and tested:

**Development:**
- [ ] All products load from Medusa API
- [ ] Cart sessions work correctly
- [ ] Checkout flow completes successfully
- [ ] Test orders appear in Medusa admin
- [ ] Stripe payments process (test mode)

**Secrets:**
- [ ] All required variables in Infisical (dev + prod)
- [ ] `.env.local` syncs via `pnpm run secrets:pull`
- [ ] No hardcoded keys in codebase
- [ ] Test vs production keys properly separated

**Documentation:**
- [ ] Update `CLAUDE.md` / `AGENTS.md` with integration status
- [ ] Document any custom API integration in `docs/api/`
- [ ] Note any known issues or limitations

**Next Steps:**
- [ ] Deploy storefront to Cloudflare Pages (Phase 4)
- [ ] Set up webhook buffering (Durable Objects)
- [ ] Configure production Stripe keys
- [ ] Enable order confirmation emails

---

## Related Documentation

- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Infrastructure provisioning (Phase 1)
- **[CODEBASE_EXPLANATION.md](CODEBASE_EXPLANATION.md)** - Storefront architecture
- **[STATE_MANAGEMENT.md](STATE_MANAGEMENT.md)** - Zustand cart patterns
- **[STRIPE_INTEGRATION.md](STRIPE_INTEGRATION.md)** - Checkout flow details
- **[services/medusa/README.md](../services/medusa/README.md)** - Backend automation scripts

---

**Last Updated**: 2025-11-18
**Next Review**: After Phase 2 completion
