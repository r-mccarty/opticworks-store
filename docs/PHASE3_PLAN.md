# Phase 3: Complete E-Commerce Integration

**Status**: 📋 Planning Complete, Ready for Implementation
**Start Date**: 2025-11-20
**Prerequisites**: ✅ Phase 2 Infrastructure Complete

---

## Table of Contents

1. [Overview](#overview)
2. [Scope Changes from Original Plan](#scope-changes-from-original-plan)
3. [Architecture](#architecture)
4. [Implementation Tracks](#implementation-tracks)
5. [Success Criteria](#success-criteria)
6. [Dependencies](#dependencies)
7. [Testing Strategy](#testing-strategy)

---

## Overview

Phase 3 transforms the deployed Medusa infrastructure into a **fully functional e-commerce platform** with complete cart/checkout flow, customer authentication, webhook processing, and community/documentation infrastructure.

### Phase 2 Delivered (Infrastructure)

✅ Hetzner backend operational at `https://api.optic.works`
✅ PostgreSQL 17 + Redis 7.x deployed
✅ Medusa v2.11.3 serving Store/Admin APIs
✅ Cloudflare Tunnel routing traffic
✅ Infisical secret management
✅ Ansible automation preventing drift

### Phase 3 Will Deliver (E-Commerce)

🎯 **Complete customer purchase flow** (browse → cart → checkout → order)
🎯 **Customer authentication portal** (login, order history, warranty claims)
🎯 **Production webhook infrastructure** (Stripe → Hookdeck → Medusa)
🎯 **Community platform** (Discord server + bot)
🎯 **Public documentation** (Hugo docs site)
🎯 **Automated testing** (E2E checkout flow validation)

---

## Scope Changes from Original Plan

### Original Phase 3 Scope
- ❌ **Discourse forum** → Replaced with Discord (simpler, less overhead)
- ✅ Hugo docs site (kept)
- ✅ CI/CD hardening (kept)

### Revised Phase 3 Scope
- ✅ **Medusa complete configuration** (NEW - regions, payments, shipping)
- ✅ **Full cart/checkout integration** (MOVED from Phase 2)
- ✅ **Hookdeck webhook infrastructure** (NEW - buffering/logging layer)
- ✅ **Customer authentication (Medusa CIAM)** (EXPANDED - was just admin auth)
- ✅ **Customer portal** (NEW - order history, warranty, tracking)
- ✅ **Discord integration** (NEW - replaces Discourse)
- ✅ Hugo documentation site (kept from original)
- ✅ CI/CD with E2E testing (kept from original)

---

## Architecture

### Overall System Architecture (Phase 3 Complete)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CUSTOMER JOURNEY                             │
└─────────────────────────────────────────────────────────────────────┘

  [Customer Browser]
         │
         ├─→ optic.works (Cloudflare Pages)
         │    └─→ Next.js 15 Storefront
         │         ├─→ Browse Products
         │         ├─→ Add to Cart
         │         ├─→ Checkout (Stripe Elements)
         │         └─→ Customer Portal (Login, Orders, Warranty)
         │
         ├─→ api.optic.works (Cloudflare Tunnel → Hetzner)
         │    └─→ Medusa v2 Backend
         │         ├─→ Store API (products, carts, checkout)
         │         ├─→ Customer Auth API (login, registration)
         │         └─→ Admin API (order management)
         │
         ├─→ docs.optic.works (Cloudflare Pages)
         │    └─→ Hugo Documentation Site
         │
         └─→ Discord Community
              └─→ Support, announcements, developer chat

┌─────────────────────────────────────────────────────────────────────┐
│                      PAYMENT & WEBHOOK FLOW                          │
└─────────────────────────────────────────────────────────────────────┘

  [Stripe Payment]
         │
         ├─→ Customer pays via Stripe Elements
         │
         └─→ Stripe Webhooks
              │
              └─→ [Hookdeck Gateway]
                   ├─→ Buffer & queue webhooks
                   ├─→ Retry with exponential backoff
                   ├─→ Log all events
                   └─→ Route to Medusa
                        │
                        └─→ api.optic.works/webhooks/stripe
                             └─→ Medusa processes:
                                  - payment_intent.succeeded
                                  - payment_intent.payment_failed
                                  - charge.refunded

┌─────────────────────────────────────────────────────────────────────┐
│                     DATA & INFRASTRUCTURE                            │
└─────────────────────────────────────────────────────────────────────┘

  [Hetzner Cloud - Dedicated Server]
   ├─→ PostgreSQL 17 (Medusa data, orders, customers)
   ├─→ Redis 7.x (sessions, caching)
   ├─→ Node.js 22 + PM2 (Medusa process management)
   └─→ Cloudflare Tunnel (public access)

  [Infisical - Secret Management]
   └─→ Single source of truth for all secrets

  [GitHub Actions - CI/CD]
   ├─→ Automated E2E tests on PR
   ├─→ Deployment to Cloudflare Pages (storefront)
   └─→ Ansible deployment to Hetzner (backend)
```

---

## Implementation Tracks

Phase 3 is organized into 7 parallel implementation tracks that can progress simultaneously.

### Track 1: Medusa E-Commerce Configuration

**Owner**: Backend
**Duration**: ~2-3 implementation sessions
**Dependencies**: None (can start immediately)

#### 1.1 Configure Regions

**Task**: Set up geographic regions for cart/checkout functionality.

**Actions**:
- [ ] Access Admin dashboard: `https://api.optic.works/app`
- [ ] Create **US Region**:
  - Currency: USD
  - Countries: United States
  - Tax provider: Default (manual tax rates)
  - Payment providers: Stripe
  - Fulfillment providers: Manual (for now)
- [ ] Create **EU Region** (optional, for future expansion):
  - Currency: EUR
  - Countries: EU member states
  - Tax provider: Default
  - Payment providers: Stripe
- [ ] Configure tax rates:
  - US sales tax (state-specific)
  - EU VAT (if EU region created)

**Validation**:
```bash
curl -H "x-publishable-api-key: $PUBKEY" \
  https://api.optic.works/store/regions | jq '.regions | length'
# Expected: 1 or 2 (depending on EU region)
```

**Documentation**: Update `docs/MEDUSA_CONFIGURATION.md` with region setup steps.

---

#### 1.2 Configure Payment Providers

**Task**: Integrate Stripe payment provider in Medusa.

**Actions**:
- [ ] Add Stripe payment provider to US region
- [ ] Configure Stripe test mode keys:
  - `STRIPE_API_KEY` (secret key) - already in Infisical
  - Test mode enabled
- [ ] Configure Stripe payment methods:
  - Card payments (Visa, Mastercard, Amex)
  - Apple Pay / Google Pay (optional)
- [ ] Test payment provider connection

**Validation**:
```bash
# Check payment providers
curl -H "Authorization: Basic $MEDUSA_SECRET_KEY" \
  https://api.optic.works/admin/regions/<region-id> \
  | jq '.region.payment_providers'
```

**Documentation**: Update `docs/STRIPE_INTEGRATION.md` with Medusa payment provider setup.

---

#### 1.3 Configure Shipping Providers

**Task**: Set up fulfillment/shipping options.

**Actions**:
- [ ] Create shipping profiles:
  - **Standard Shipping**: 5-7 business days ($9.99)
  - **Express Shipping**: 2-3 business days ($19.99)
  - **Free Shipping**: Orders over $100
- [ ] Assign shipping profiles to products
- [ ] Configure shipping zones (US states)

**Validation**:
```bash
# Check shipping options
curl -H "x-publishable-api-key: $PUBKEY" \
  https://api.optic.works/store/shipping-options \
  | jq '.shipping_options'
```

**Documentation**: Create `docs/SHIPPING_CONFIGURATION.md`.

---

#### 1.4 Complete Product Seeding

**Task**: Ensure all 7 products have complete metadata, variants, and images.

**Actions**:
- [ ] Audit existing 7 products for completeness:
  - Title, description, handle
  - Variants (size, color, etc.)
  - Prices (USD, future: EUR)
  - Images (product photos)
  - Metadata (technical specs, compatibility)
  - Inventory levels
- [ ] Upload product images to Cloudflare R2 or Medusa media storage
- [ ] Update product descriptions with marketing copy
- [ ] Ensure all products associated with correct sales channel

**Products to Validate**:
1. bed-presence-sensor
2. presence-duo-pack
3. adjustable-base-developer-firmware
4. spare-sensor
5. development-dashboard
6. enclosure-integrator-kit
7. lab-subscription

**Validation**:
```bash
# Verify all products have images and variants
pnpm exec tsx scripts/verify-catalog.ts --full
```

**Documentation**: Update `docs/PRODUCT_CATALOG.md`.

---

### Track 2: Cart & Checkout Integration

**Owner**: Full-stack
**Duration**: ~3-4 implementation sessions
**Dependencies**: Track 1.1 (regions must exist)

#### 2.1 Cart Functionality (Storefront)

**Task**: Implement full cart management in Next.js storefront.

**Actions**:
- [ ] Update `useCart` Zustand store to use Medusa Cart API
- [ ] Implement cart session management:
  - Create cart on first add-to-cart
  - Persist cart ID in localStorage
  - Restore cart on page reload
- [ ] Implement cart operations:
  - Add item to cart
  - Update item quantity
  - Remove item from cart
  - Clear cart
- [ ] Display cart totals (subtotal, shipping, tax, total)
- [ ] Handle cart errors (out of stock, price changes)

**Files**:
- `src/hooks/useCart.ts` - Cart state management
- `src/lib/api/medusa.ts` - Cart API calls
- `src/components/store/CartPage.tsx` - Cart UI
- `src/components/ui/AddToCartButton.tsx` - Add to cart action

**Validation**:
- [ ] Can create cart
- [ ] Can add product to cart
- [ ] Cart persists across page reloads
- [ ] Can update quantities
- [ ] Can remove items
- [ ] Totals calculate correctly

**Documentation**: Update `docs/INTEGRATION_GUIDE.md` with cart integration details.

---

#### 2.2 Checkout Flow (Storefront)

**Task**: Complete checkout flow from cart → payment → order confirmation.

**Actions**:
- [ ] Update checkout state management (`useCheckoutState`)
- [ ] Implement checkout steps:
  1. **Shipping Address** - collect customer address
  2. **Shipping Method** - select shipping option
  3. **Payment** - Stripe Elements integration
  4. **Review** - confirm order details
- [ ] Integrate Stripe Payment Intents API
- [ ] Handle payment success/failure
- [ ] Complete order and redirect to confirmation
- [ ] Send order confirmation email (via Resend)

**Files**:
- `src/hooks/useCheckoutState.ts` - Checkout state
- `src/app/checkout/page.tsx` - Checkout page
- `src/components/checkout/CheckoutFlow.tsx` - Multi-step checkout
- `src/components/checkout/PaymentForm.tsx` - Stripe Elements
- `src/app/api/stripe/create-payment-intent/route.ts` - Payment intent API

**Validation**:
- [ ] Can navigate through all checkout steps
- [ ] Can complete purchase with Stripe test card (4242 4242 4242 4242)
- [ ] Order created in Medusa
- [ ] Confirmation email sent
- [ ] Inventory decremented

**Documentation**: Update `docs/STRIPE_INTEGRATION.md` with checkout flow.

---

#### 2.3 Order Management

**Task**: Order confirmation, tracking, and history.

**Actions**:
- [ ] Create order confirmation page (`/orders/[id]/confirmation`)
- [ ] Display order details:
  - Order number
  - Items purchased
  - Shipping address
  - Payment method
  - Total paid
- [ ] Implement order status tracking
- [ ] Email notifications (order placed, shipped, delivered)

**Files**:
- `src/app/orders/[id]/confirmation/page.tsx`
- `src/app/orders/[id]/page.tsx` - Order detail view
- `src/lib/api/orders.ts` - Order API calls

**Validation**:
- [ ] Order confirmation displays after checkout
- [ ] Can view order details
- [ ] Email notifications sent

**Documentation**: Create `docs/ORDER_MANAGEMENT.md`.

---

### Track 3: Hookdeck Webhook Infrastructure

**Owner**: Backend/DevOps
**Duration**: ~1-2 implementation sessions
**Dependencies**: Track 1.2 (Stripe payment provider)

#### 3.1 Hookdeck Setup

**Task**: Configure Hookdeck as webhook gateway for Stripe → Medusa.

**Actions**:
- [ ] Create Hookdeck account: https://hookdeck.com
- [ ] Create Hookdeck connection:
  - **Source**: Stripe
  - **Destination**: Medusa (`https://api.optic.works/webhooks/stripe`)
  - **Transformations**: None (pass-through)
  - **Rate limiting**: 100 requests/minute
  - **Retry policy**: Exponential backoff (3 retries)
- [ ] Configure Hookdeck webhook endpoint
- [ ] Add Hookdeck endpoint to Stripe webhooks
- [ ] Configure webhook events:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `charge.refunded`
  - `checkout.session.completed`
- [ ] Store Hookdeck webhook signing secret in Infisical

**Validation**:
```bash
# Trigger test webhook from Stripe dashboard
# Verify appears in Hookdeck logs
# Verify delivered to Medusa
```

**Documentation**: Create `docs/HOOKDECK_SETUP.md`.

---

#### 3.2 Medusa Webhook Handler

**Task**: Implement Stripe webhook processing in Medusa.

**Actions**:
- [ ] Create webhook endpoint: `src/api/webhooks/stripe/route.ts`
- [ ] Verify Hookdeck signature
- [ ] Process webhook events:
  - `payment_intent.succeeded` → Complete order, send confirmation email
  - `payment_intent.payment_failed` → Mark payment failed, notify customer
  - `charge.refunded` → Process refund, update order status
- [ ] Log all webhook events to database
- [ ] Handle idempotency (duplicate webhook protection)

**Files**:
- `services/medusa/src/api/webhooks/stripe/route.ts`
- `services/medusa/src/subscribers/stripe-webhook.ts`

**Validation**:
- [ ] Webhook signature verification works
- [ ] Payment success triggers order completion
- [ ] Payment failure sends notification
- [ ] Refunds processed correctly
- [ ] Duplicate webhooks handled gracefully

**Documentation**: Update `docs/HOOKDECK_SETUP.md` with handler implementation.

---

#### 3.3 Webhook Monitoring

**Task**: Set up monitoring and alerting for webhook processing.

**Actions**:
- [ ] Configure Hookdeck alerts:
  - Failed deliveries (> 3 retries)
  - High latency (> 5 seconds)
  - Rate limit exceeded
- [ ] Set up notification channels (email, Discord)
- [ ] Create webhook dashboard for monitoring
- [ ] Document troubleshooting procedures

**Validation**:
- [ ] Alerts trigger on failed webhooks
- [ ] Dashboard shows webhook status
- [ ] Can replay failed webhooks

**Documentation**: Update `docs/HOOKDECK_SETUP.md` with monitoring section.

---

### Track 4: Customer Authentication (Medusa CIAM)

**Owner**: Full-stack
**Duration**: ~3-4 implementation sessions
**Dependencies**: None (can start immediately)

#### 4.1 Customer Registration & Login

**Task**: Implement customer authentication using Medusa Customer API.

**Actions**:
- [ ] Create customer registration page (`/auth/register`)
  - Email, password, name
  - Email verification (optional)
  - Privacy policy consent
- [ ] Create customer login page (`/auth/login`)
  - Email/password authentication
  - "Remember me" functionality
  - Password reset link
- [ ] Implement session management:
  - Store JWT token in httpOnly cookie
  - Refresh token handling
  - Auto-logout on expiration
- [ ] Create protected route wrapper (`withAuth` HOC)
- [ ] Implement password reset flow

**Files**:
- `src/app/auth/register/page.tsx`
- `src/app/auth/login/page.tsx`
- `src/app/auth/reset-password/page.tsx`
- `src/lib/auth/session.ts` - Session management
- `src/middleware.ts` - Protected route middleware

**Validation**:
- [ ] Can register new customer
- [ ] Can log in with email/password
- [ ] Session persists across page reloads
- [ ] Can log out
- [ ] Can reset password

**Documentation**: Create `docs/AUTHENTICATION_GUIDE.md`.

---

#### 4.2 Customer Portal - Order History

**Task**: Customer dashboard showing past orders.

**Actions**:
- [ ] Create customer portal layout (`/account`)
- [ ] Implement order history page (`/account/orders`)
  - List all customer orders
  - Order status (pending, processing, shipped, delivered)
  - Order totals
  - Link to order details
- [ ] Implement order detail view (`/account/orders/[id]`)
  - Items purchased
  - Shipping address
  - Tracking number
  - Invoice download (PDF)

**Files**:
- `src/app/account/layout.tsx` - Portal layout
- `src/app/account/orders/page.tsx` - Order history
- `src/app/account/orders/[id]/page.tsx` - Order details

**Validation**:
- [ ] Customer can view all orders
- [ ] Order details display correctly
- [ ] Order statuses update in real-time

**Documentation**: Create `docs/CUSTOMER_PORTAL_GUIDE.md`.

---

#### 4.3 Customer Portal - Warranty Claims

**Task**: Allow customers to submit warranty claims for products.

**Actions**:
- [ ] Create warranty claim submission form (`/account/warranty`)
  - Select product from order
  - Upload photos of issue
  - Describe problem
  - Contact information
- [ ] Implement warranty claim tracking
  - View claim status
  - Communication with support
- [ ] Admin view for warranty claims (Medusa admin)

**Files**:
- `src/app/account/warranty/page.tsx`
- `src/app/account/warranty/new/page.tsx`
- `src/lib/api/warranty.ts`

**Validation**:
- [ ] Customer can submit warranty claim
- [ ] Can upload photos
- [ ] Can track claim status
- [ ] Admin can view and respond to claims

**Documentation**: Update `docs/CUSTOMER_PORTAL_GUIDE.md` with warranty section.

---

#### 4.4 Customer Portal - Account Settings

**Task**: Customer profile and settings management.

**Actions**:
- [ ] Create account settings page (`/account/settings`)
  - Update profile (name, email)
  - Change password
  - Manage addresses (shipping, billing)
  - Email preferences (marketing, transactional)
  - Delete account (GDPR compliance)
- [ ] Implement address book
  - Add/edit/delete addresses
  - Set default shipping/billing address

**Files**:
- `src/app/account/settings/page.tsx`
- `src/app/account/addresses/page.tsx`

**Validation**:
- [ ] Can update profile information
- [ ] Can change password
- [ ] Can manage addresses
- [ ] Can update email preferences

**Documentation**: Update `docs/CUSTOMER_PORTAL_GUIDE.md` with settings section.

---

### Track 5: Discord Integration

**Owner**: Community/DevOps
**Duration**: ~2 implementation sessions
**Dependencies**: None (can start immediately)

#### 5.1 Discord Server Setup

**Task**: Create and configure OpticWorks Discord community.

**Actions**:
- [ ] Create Discord server: "OpticWorks Community"
- [ ] Configure server settings:
  - Verification level: Medium
  - Content filter: Medium
  - 2FA requirement for moderators
- [ ] Create channels:
  - **#general** - General discussion
  - **#support** - Customer support
  - **#announcements** - Product updates, releases
  - **#development** - Developer community
  - **#showcase** - Customer installations
  - **#feedback** - Product feedback
- [ ] Create roles:
  - **Customer** - Verified customers
  - **Developer** - Developer program members
  - **Moderator** - Community moderators
  - **Team** - OpticWorks team
- [ ] Set up moderation:
  - AutoMod rules (spam, profanity)
  - Moderation log channel
  - Community guidelines

**Validation**:
- [ ] Server accessible via invite link
- [ ] Channels organized and functional
- [ ] Roles assigned correctly

**Documentation**: Create `docs/DISCORD_INTEGRATION.md`.

---

#### 5.2 Discord Bot Development

**Task**: Create Discord bot for notifications and automation.

**Actions**:
- [ ] Create Discord application: https://discord.com/developers
- [ ] Set up bot workspace: `services/discord-bot/`
  - Discord.js v14
  - TypeScript
  - Environment configuration
- [ ] Implement bot features:
  - **Order notifications** - New order → #team channel
  - **Support tickets** - Create ticket threads in #support
  - **Deployment notifications** - GitHub Actions → #announcements
  - **Role verification** - Verify customer email → assign Customer role
- [ ] Deploy bot to Hetzner (PM2 process)

**Files**:
- `services/discord-bot/src/index.ts` - Bot entry point
- `services/discord-bot/src/commands/` - Bot commands
- `services/discord-bot/src/webhooks/` - Webhook listeners

**Validation**:
- [ ] Bot online and responding
- [ ] Order notifications working
- [ ] Support tickets created correctly
- [ ] Deployment notifications sent

**Documentation**: Update `docs/DISCORD_INTEGRATION.md` with bot setup.

---

### Track 6: Hugo Documentation Site

**Owner**: Documentation/DevOps
**Duration**: ~2-3 implementation sessions
**Dependencies**: None (can start immediately)

#### 6.1 Hugo Site Configuration

**Task**: Configure and deploy Hugo documentation site.

**Actions**:
- [ ] Complete Hugo configuration (`platform/docs-site/hugo.toml`)
- [ ] Set up Geekdoc theme:
  ```bash
  cd platform/docs-site
  git submodule add https://github.com/thegeeklab/hugo-geekdoc.git themes/geekdoc
  ```
- [ ] Configure site structure:
  - Getting Started
  - Installation Guides
  - API Documentation
  - Product Specifications
  - Troubleshooting
  - Developer Docs
- [ ] Configure search (Algolia or built-in)
- [ ] Configure versioning (future: v2.0, v2.1, etc.)

**Files**:
- `platform/docs-site/hugo.toml`
- `platform/docs-site/content/` - Documentation content

**Validation**:
- [ ] Hugo builds successfully: `hugo`
- [ ] Site renders correctly: `hugo server`
- [ ] Search works
- [ ] Navigation functional

**Documentation**: Create `docs/HUGO_DOCS_DEPLOYMENT.md`.

---

#### 6.2 Content Migration

**Task**: Migrate documentation from `/docs` to Hugo content directory.

**Actions**:
- [ ] Map existing docs to Hugo structure:
  - `/docs/DEPLOYMENT_GUIDE.md` → `content/guides/deployment.md`
  - `/docs/KEY_MANAGEMENT.md` → `content/guides/secrets.md`
  - `/docs/INTEGRATION_GUIDE.md` → `content/guides/integration.md`
  - Install guides → `content/installation/`
- [ ] Convert markdown to Hugo format (front matter, shortcodes)
- [ ] Add images and diagrams
- [ ] Create API reference pages (auto-generated)

**Validation**:
- [ ] All docs migrated
- [ ] Links work correctly
- [ ] Images render
- [ ] Code blocks syntax-highlighted

**Documentation**: Update `docs/HUGO_DOCS_DEPLOYMENT.md` with content structure.

---

#### 6.3 Deploy to Cloudflare Pages

**Task**: Deploy Hugo site to production.

**Actions**:
- [ ] Create Cloudflare Pages project
- [ ] Configure build settings:
  - Build command: `hugo --minify`
  - Build output directory: `public`
  - Environment variables: `HUGO_VERSION=0.140.0` (Extended version)
- [ ] Configure custom domain: `docs.optic.works`
- [ ] Set up automatic deployments from GitHub
- [ ] Configure redirects and 404 page

**Validation**:
- [ ] Site deployed at https://docs.optic.works
- [ ] Auto-deploys on git push
- [ ] Custom domain works
- [ ] HTTPS enabled

**Documentation**: Update `docs/HUGO_DOCS_DEPLOYMENT.md` with deployment steps.

---

### Track 7: CI/CD Hardening

**Owner**: DevOps
**Duration**: ~2 implementation sessions
**Dependencies**: Track 2 (cart/checkout must be implemented)

#### 7.1 Automated E2E Testing

**Task**: Set up Playwright E2E tests in CI/CD pipeline.

**Actions**:
- [ ] Install Playwright: `pnpm add -D @playwright/test`
- [ ] Create E2E test suite:
  - Browse products
  - Add to cart
  - Complete checkout with Stripe test card
  - Verify order created
  - Customer registration/login
  - View order history
- [ ] Configure GitHub Actions workflow:
  - Run E2E tests on PR
  - Use Stripe test mode
  - Seed test data before tests
  - Clean up after tests
- [ ] Create test reports (HTML, JSON)

**Files**:
- `tests/e2e/checkout.spec.ts`
- `tests/e2e/auth.spec.ts`
- `.github/workflows/e2e-tests.yml`

**Validation**:
- [ ] E2E tests pass locally
- [ ] Tests run in CI on PR
- [ ] Test reports generated

**Documentation**: Update `docs/E2E_TEST_GUIDE.md` with Playwright tests.

---

#### 7.2 Deployment Automation

**Task**: Automate deployments for storefront and backend.

**Actions**:
- [ ] **Storefront deployment** (Cloudflare Pages):
  - Auto-deploy on push to `main`
  - Preview deployments for PRs
  - Environment-specific builds (staging, production)
- [ ] **Backend deployment** (Hetzner via Ansible):
  - GitHub Actions workflow triggers Ansible
  - Deploy on merge to `main`
  - Run migrations before deployment
  - Health checks after deployment
- [ ] **Rollback strategy**:
  - Tag deployments
  - Ability to rollback to previous version
  - Database backup before migrations

**Files**:
- `.github/workflows/deploy-storefront.yml`
- `.github/workflows/deploy-backend.yml`

**Validation**:
- [ ] Storefront deploys automatically
- [ ] Backend deploys via Ansible
- [ ] Rollback works
- [ ] Health checks pass

**Documentation**: Update `docs/CI.md` with deployment automation.

---

#### 7.3 Monitoring & Observability

**Task**: Set up error tracking and performance monitoring.

**Actions**:
- [ ] Set up error tracking (Sentry or similar):
  - Frontend errors
  - Backend errors
  - Webhook failures
- [ ] Configure performance monitoring:
  - Core Web Vitals (Cloudflare Analytics)
  - API response times
  - Database query performance
- [ ] Set up uptime monitoring:
  - Health endpoint checks (every 1 min)
  - Alert on downtime
- [ ] Create monitoring dashboard

**Validation**:
- [ ] Errors tracked and reported
- [ ] Performance metrics collected
- [ ] Uptime alerts working

**Documentation**: Create `docs/MONITORING.md`.

---

## Success Criteria

Phase 3 is complete when ALL of the following criteria are met:

### E-Commerce Functionality ✅

- [ ] Customer can browse 7 products
- [ ] Customer can add products to cart
- [ ] Cart persists across sessions
- [ ] Customer can complete checkout with Stripe test card
- [ ] Order is created in Medusa
- [ ] Confirmation email sent
- [ ] Order appears in customer portal

### Customer Authentication ✅

- [ ] Customer can register account
- [ ] Customer can log in/out
- [ ] Customer can view order history
- [ ] Customer can submit warranty claims
- [ ] Customer can update profile/addresses

### Webhook Infrastructure ✅

- [ ] Stripe webhooks route through Hookdeck
- [ ] Webhooks buffered and retried on failure
- [ ] All webhook events logged
- [ ] Payment success triggers order completion
- [ ] Payment failure sends notification

### Community & Documentation ✅

- [ ] Discord server active with channels and roles
- [ ] Discord bot sending order notifications
- [ ] Hugo docs site deployed at docs.optic.works
- [ ] All documentation migrated and current

### CI/CD ✅

- [ ] E2E tests run on every PR
- [ ] Storefront auto-deploys to Cloudflare Pages
- [ ] Backend deploys via Ansible on merge to main
- [ ] Error tracking and monitoring active

---

## Dependencies

### External Services Required

| Service | Purpose | Cost | Setup Required |
|---------|---------|------|----------------|
| **Hookdeck** | Webhook gateway | Free tier (100k events/month) | Account + connection |
| **Cloudflare Pages** | Docs/storefront hosting | Free tier | Project setup |
| **Discord** | Community platform | Free | Server + bot app |
| **GitHub Actions** | CI/CD | Free (public repo) | Workflow files |
| **Sentry** (optional) | Error tracking | Free tier | Account + integration |

### Internal Prerequisites

| Prerequisite | Status | Notes |
|-------------|--------|-------|
| Medusa regions configured | ⏳ Pending | Blocks cart/checkout |
| Stripe test mode enabled | ✅ Complete | Already configured |
| Infisical secrets | ✅ Complete | All backend secrets ready |
| Hetzner backend | ✅ Complete | api.optic.works operational |

---

## Testing Strategy

### Development Testing

**Local Development**:
```bash
# Storefront
pnpm run dev              # http://localhost:3000
pnpm run build            # Production build test
pnpm run test             # Unit tests (Vitest)

# Backend (Medusa)
cd services/medusa
pnpm run dev              # http://localhost:9000
pnpm run test:smoke       # Smoke tests
pnpm run test:e2e         # Full E2E validation

# E2E Tests (Playwright)
pnpm run test:e2e         # Full checkout flow
pnpm run test:e2e --ui    # Interactive test runner
```

### Staging Testing

**Staging Environment** (future):
- Deploy to staging Cloudflare Pages + staging Medusa instance
- Run full E2E suite against staging
- Manual QA of complete user flows

### Production Testing

**Pre-Launch Checklist**:
- [ ] All E2E tests passing
- [ ] Smoke tests passing
- [ ] Stripe test purchases complete successfully
- [ ] Webhooks processed correctly
- [ ] Customer can complete full purchase flow
- [ ] Admin dashboard functional
- [ ] Documentation complete and deployed

**Post-Launch Monitoring**:
- Monitor error rates (< 1%)
- Monitor checkout conversion (track funnel)
- Monitor webhook success rate (> 99%)
- Monitor uptime (target: 99.9%)

---

## Timeline Considerations

This plan does NOT include specific dates - implementation will proceed based on available resources and priorities. However, rough effort estimates:

| Track | Estimated Sessions | Complexity |
|-------|-------------------|------------|
| **Track 1**: Medusa Configuration | 2-3 sessions | Medium |
| **Track 2**: Cart/Checkout | 3-4 sessions | High |
| **Track 3**: Hookdeck Webhooks | 1-2 sessions | Low |
| **Track 4**: Customer Auth/Portal | 3-4 sessions | High |
| **Track 5**: Discord | 2 sessions | Low |
| **Track 6**: Hugo Docs | 2-3 sessions | Medium |
| **Track 7**: CI/CD | 2 sessions | Medium |

**Total Estimated Effort**: ~15-20 implementation sessions

**Parallelization**: Tracks 1, 4, 5, 6 can all start immediately. Track 2 depends on Track 1.1. Track 3 depends on Track 1.2. Track 7 depends on Track 2.

**Critical Path**: Track 1 → Track 2 (cart/checkout is the longest pole)

---

## Next Steps

1. ✅ Review and approve this plan
2. ⏳ Create GitHub project board with all tasks
3. ⏳ Begin Track 1.1 (Configure Medusa regions)
4. ⏳ Begin Track 5.1 (Discord server setup) - can proceed in parallel
5. ⏳ Begin Track 6.1 (Hugo configuration) - can proceed in parallel

---

**Phase 3 Plan Status**: ✅ Ready for Implementation
**Last Updated**: 2025-11-20
**Next Review**: After Track 1 completion
