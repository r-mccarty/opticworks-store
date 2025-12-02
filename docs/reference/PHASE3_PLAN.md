# Phase 3: Medusa E-Commerce Migration

**Status**: 🚧 IN PROGRESS (Tracks 1-4 Complete, 5-7 Pending)
**Updated**: 2025-12-02

---

## Quick Status

| Track | Status | Description |
|-------|--------|-------------|
| 1 | ✅ Complete | Backend config (US region, Stripe provider) |
| 2 | ✅ Complete | Products API integration with fallback |
| 3 | ✅ Complete | Cart API (hybrid local + Medusa) |
| 4 | ✅ Complete | Checkout flow (Medusa payment sessions) |
| 5 | 📋 Pending | Webhook documentation (Hookdeck configured) |
| 6 | 📋 Pending | Customer authentication |
| 7 | 📋 Pending | E2E testing |

**Blockers Resolved**:
- ✅ Email system stubbed (react-email/Next.js 15 conflict)
- ✅ Lazy Stripe initialization pattern applied
- ✅ Product pages use force-dynamic

---

## Architecture

### Current State (Phase 3 Partial)

```
┌──────────────┐
│  Storefront  │
└──────┬───────┘
       │
       ├─→ Medusa Store API (/store/products) ✅
       │
       ├─→ Hybrid Cart
       │   ├─ Zustand (optimistic UI) ✅
       │   └─ Medusa Cart API (persistence) ✅
       │
       ├─→ Medusa Checkout ✅
       │   └─ Payment Sessions → Stripe
       │
       └─→ Stripe Webhooks
           └─ Hookdeck → Medusa backend ✅ (configured, needs docs)

┌─────────────────┐
│ Medusa Backend  │ → api.optic.works
├─────────────────┤
│ PostgreSQL 17   │
│ Redis 7.x       │
│ Stripe Provider │
│ US Region       │
└─────────────────┘
```

### Target State (Phase 3 Complete)

Same as above, plus:
- Customer authentication (login/register)
- Customer portal (order history)
- E2E test coverage

---

## Track Details

### Track 1: Backend Configuration ✅ COMPLETE

**What was done**:
- Created US region in Medusa Admin
- Assigned Stripe payment provider to region
- Verified region API returns correctly

**Key endpoints**:
```bash
# Verify region
curl -H "x-publishable-api-key: $PUBKEY" \
  https://api.optic.works/store/regions | jq '.regions[0].id'
```

---

### Track 2: Products API ✅ COMPLETE

**What was done**:
- Fixed auth header (`x-publishable-api-key` not `Authorization: Bearer`)
- Added fallback to static products when API unavailable
- Products load dynamically from Medusa

**Key file**: `src/lib/api/medusa.ts`

**Fallback behavior**: During builds or when API key missing, falls back to `src/lib/products.ts`

---

### Track 3: Cart API ✅ COMPLETE

**What was done**:
- Implemented hybrid cart (Zustand + Medusa)
- Cart functions: createCart, addLineItem, updateLineItem, removeLineItem, getCart
- Optimistic updates with server sync
- Cart ID persisted to localStorage

**Key file**: `src/hooks/useCart.ts`

**Cart flow**:
1. User adds item → instant Zustand update
2. Background: create/update Medusa cart
3. On error: rollback optimistic update

---

### Track 4: Checkout Flow ✅ COMPLETE

**What was done**:
- Medusa payment session creation
- Stripe Elements integration via Medusa
- Cart completion on payment success
- Lazy Stripe initialization (build fix)

**Key files**:
- `src/lib/api/medusa.ts` - createPaymentSession, completeCart
- `src/components/checkout/CheckoutForm.tsx`
- `src/components/checkout/CheckoutWrapper.tsx`

**Payment flow**:
1. Initialize payment sessions on cart
2. Select Stripe provider
3. Get client_secret for Stripe Elements
4. User completes payment
5. Call completeCart to finalize order

---

### Track 5: Webhook Documentation 📋 PENDING

**Current state**: Hookdeck configured and routing webhooks to Medusa

**Needs**:
- [ ] Document Hookdeck setup
- [ ] Document webhook events configured
- [ ] Verify Medusa processes webhooks correctly
- [ ] Test order creation via webhook

**Hookdeck dashboard**: https://hookdeck.com (check team account)

---

### Track 6: Customer Authentication 📋 PENDING

**Needs**:
- [ ] Registration page (`/auth/register`)
- [ ] Login page (`/auth/login`)
- [ ] Auth API routes (proxy to Medusa)
- [ ] useAuth hook for client state
- [ ] Session management (httpOnly cookies)

**Medusa endpoints**:
- POST `/store/auth/customer` - Register
- POST `/store/auth` - Login
- DELETE `/store/auth` - Logout
- GET `/store/customers/me` - Current customer

---

### Track 7: E2E Testing 📋 PENDING

**Needs**:
- [ ] Install Playwright
- [ ] Checkout flow test
- [ ] Authentication flow test
- [ ] Email delivery test (Mailosaur)

**Test scenarios**:
1. Browse → Add to cart → Checkout → Payment → Confirmation
2. Register → Login → View orders → Logout

---

## Known Issues

### Email System Stubbed

**Issue**: @react-email conflicts with Next.js 15 SSG
**Workaround**: Email functions log and return success (no actual sending)
**Plan**: Restore via Medusa notification module in Phase 4

**Files affected**:
- `src/lib/api/email.ts` - Stubbed
- `src/app/api/email/send/route.ts` - Stubbed
- `src/lib/email/templates/*.tsx.disabled` - Disabled

### Build Workarounds

| Issue | Solution |
|-------|----------|
| NODE_ENV in Codespaces | `unset NODE_ENV && pnpm run build` |
| Stripe SDK at build time | Lazy initialization with getStripe() |
| Medusa API at build time | Fallback to static products |
| Product SSG fails | `export const dynamic = 'force-dynamic'` |

---

## Success Criteria

### Complete ✅
- [x] Products from Medusa API
- [x] Cart persists in Medusa
- [x] Checkout via Medusa payment sessions
- [x] Stripe integration working

### Pending 📋
- [ ] Customer can register/login
- [ ] Customer can view order history
- [ ] E2E tests pass
- [ ] Webhooks documented

---

## Next Steps

1. **Track 5**: Document Hookdeck setup
2. **Track 6**: Implement customer auth pages
3. **Track 7**: Add Playwright E2E tests
4. **Phase 4**: Restore email via Medusa notifications

---

## Reference Commands

```bash
# Development
pnpm run dev

# Pre-commit
pnpm run lint && pnpm run test && unset NODE_ENV && pnpm run build

# Verify Medusa API
curl -H "x-publishable-api-key: pk_xxx" https://api.optic.works/store/products

# SSH to backend
ssh hetzner-node
pm2 logs medusa-dev
```
