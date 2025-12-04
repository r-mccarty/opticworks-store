# Phase 4: Production Launch

**Status**: Planning
**Target**: Production-ready store with real products, polished UI, and fulfillment automation

---

## Quick Status

| Track | Status | Description |
|-------|--------|-------------|
| 1 | Pending | Production product catalog (real products, images, pricing) |
| 2 | Pending | Design system + UI overhaul (Shadcn/Radix theming) |
| 3 | Pending | Fulfillment module (FedEx integration + address validation) |
| 4 | Pending | Consumer documentation site (docs.optic.works) |
| 5 | Pending | Usability testing + accessibility audit |
| 6 | Pending | CI/CD hardening + monitoring |

---

## Phase 3 Summary (Complete)

Phase 3 established a fully functional e-commerce platform:

- **Products**: Medusa catalog with 7 products, variant support
- **Cart**: Hybrid local + Medusa persistence
- **Checkout**: Stripe Elements via Medusa payment sessions
- **Auth**: Customer registration/login with httpOnly cookies
- **Email**: Resend integration with order confirmations
- **Deployment**: Cloudflare Workers (storefront) + Hetzner (backend)
- **Testing**: Playwright E2E suite covering critical flows

See `docs/reference/archived/PHASE3_PLAN.md` for full implementation details.

---

## Track 1: Production Product Catalog

**Goal**: Replace placeholder products with real OpticWorks inventory.

### Tasks

- [ ] Product photography (high-res images for all 7 products)
- [ ] Upload images to Cloudflare R2 via Medusa Admin
- [ ] Finalize product descriptions and specifications
- [ ] Set production pricing (verify Medusa v2 major units)
- [ ] Configure inventory levels and SKUs
- [ ] Add product categories and collections
- [ ] SEO metadata (descriptions, keywords)

### Key Files

- `backend/src/scripts/seed-opticworks-products.ts` - Update with final data
- Medusa Admin UI - Product editing

### Verification

```bash
curl -H "x-publishable-api-key: $PUBKEY" \
  https://api.optic.works/store/products | jq '.products[].thumbnail'
# All products should have R2 image URLs
```

---

## Track 2: Design System + UI Overhaul

**Goal**: Professional, cohesive visual design with consistent component library.

### Design System Components

| Component | Current | Target |
|-----------|---------|--------|
| Color palette | Ad-hoc Tailwind | Defined brand tokens |
| Typography | Geist font | Typography scale + hierarchy |
| Spacing | Inconsistent | 4px grid system |
| Components | Mixed Shadcn/custom | Unified Radix + Shadcn |
| Dark mode | Partial | Complete implementation |

### Tasks

- [ ] Define brand color palette (primary, secondary, accent, semantic)
- [ ] Create typography scale in `tailwind.config.ts`
- [ ] Audit and standardize all Shadcn components
- [ ] Implement consistent spacing system
- [ ] Complete dark mode support
- [ ] Design product cards, CTAs, and hero sections
- [ ] Mobile-first responsive polish
- [ ] Loading states and skeleton screens

### Key Files

- `src/app/globals.css` - CSS variables and base styles
- `src/components/ui/` - Shadcn components
- `tailwind.config.ts` - Theme configuration

### Deliverables

- Style guide document
- Component storybook (optional)
- Before/after screenshots

---

## Track 3: Fulfillment Module (FedEx + Address Validation)

**Goal**: Automated shipping label generation and address validation.

### Architecture

```
Order Placed
    |
    v
Address Validation (EasyPost or Shippo)
    |
    v
FedEx Rate Calculation (checkout)
    |
    v
Order Confirmed
    |
    v
FedEx Label Generation (fulfillment)
    |
    v
Tracking Email Sent
```

### FedEx Integration

Using [`@igorppbr/medusa-v2-fedex-fulfillment`](https://github.com/igorppbr/medusa-fedex-fulfillment):

**Requirements**:
- Medusa v2.4.0+ (current: v2.11.3)
- FedEx Developer Account (Client ID, Secret, Account Number)

**Features**:
- Real-time rate calculation during checkout
- Automated label generation
- Tracking number integration
- PDF label downloads from admin

### Address Validation Options

| Provider | Pros | Cons |
|----------|------|------|
| EasyPost | Already have API key | Additional service |
| Shippo | Free tier | New integration |
| FedEx Address API | Same account | Limited features |
| SmartyStreets | High accuracy | Paid only |

**Recommendation**: EasyPost (already in secrets inventory)

### Tasks

- [ ] Install and configure medusa-v2-fedex-fulfillment
- [ ] Set up FedEx developer account (sandbox first)
- [ ] Configure FedEx credentials in Medusa
- [ ] Implement address validation in checkout flow
- [ ] Add shipping rate calculation to cart
- [ ] Test fulfillment workflow end-to-end
- [ ] Configure production FedEx credentials
- [ ] Add tracking page for customers

### Key Files

- `backend/medusa-config.ts` - FedEx provider config
- `backend/src/modules/fedex/` - Custom module (if needed)
- `src/app/account/orders/[id]/page.tsx` - Tracking display

### Environment Variables

```bash
# FedEx
FEDEX_CLIENT_ID=xxx
FEDEX_CLIENT_SECRET=xxx
FEDEX_ACCOUNT_NUMBER=xxx
FEDEX_SANDBOX=true  # false for production

# Address Validation (EasyPost)
EASYPOST_API_KEY=xxx  # Already in Infisical
```

---

## Track 4: Consumer Documentation Site

**Goal**: Launch docs.optic.works with product guides and support content.

**Design Reference**: [docs.crossplane.io](https://docs.crossplane.io) - Clone their "Geekboot" theme styling.

### Architecture

```
platform/docs-site/
├── content/
│   ├── getting-started/      # Setup guides
│   ├── products/             # Product documentation
│   ├── troubleshooting/      # Common issues
│   └── support/              # Contact info, warranty
├── themes/
│   └── opticboot/            # Custom theme (based on Crossplane's Geekboot)
│       ├── assets/
│       │   ├── scss/         # Custom SCSS (variables, components)
│       │   └── js/           # Search, navigation
│       ├── layouts/
│       │   ├── _default/     # Base templates
│       │   ├── partials/     # Header, footer, sidebar
│       │   └── shortcodes/   # Callouts, tabs, hints
│       └── static/           # Fonts, images
├── config.yaml               # Hugo configuration
└── package.json              # PostCSS, dependencies
```

### Theme Reference: Crossplane Geekboot

Source: [github.com/crossplane/docs](https://github.com/crossplane/docs/tree/master/themes/geekboot)

**Key Features to Adopt**:

| Feature | Crossplane Implementation |
|---------|---------------------------|
| Color System | 16-shade grayscale (fog-0 to fog-1000) + accent colors |
| Typography | Avenir font family, 1.125rem base, 1.8 line-height |
| Dark Mode | Separate `dark-mode.scss` and `light-mode.scss` |
| Navigation | Dark navbar (#0A1111), white links, 17px font |
| Sidebar | Collapsible sections, version selector |
| Code Blocks | Light/dark themes, line numbers, copy button |
| Callouts | Info, warning, danger variants with icons |
| Search | Client-side search with results overlay |

**SCSS Structure** (from Crossplane):
```
assets/scss/
├── _variables.scss      # Colors, fonts, spacing
├── _navbar.scss         # Top navigation
├── _sidebar.scss        # Left navigation
├── _content.scss        # Main content area
├── _code-theme-*.scss   # Syntax highlighting
├── _callouts.scss       # Admonition blocks
├── _hints.scss          # Inline hints
├── _toc.scss            # Table of contents
├── dark-mode.scss       # Dark theme overrides
├── light-mode.scss      # Light theme
└── docs.scss            # Main entry point
```

**Color Palette** (Crossplane variables):
```scss
// Grayscale
$fog-0: #FFFFFF;     // Background
$fog-100: #E8E9E9;   // Borders
$fog-200: #CECFCF;   // Muted text
$fog-800: #1A2222;   // Text
$fog-1000: #0A1111;  // Navbar background

// Accent (adapt for OpticWorks brand)
$aqua-500: #23B89A;  // Primary accent (Crossplane teal)
```

### OpticWorks Customizations

Adapt Crossplane's theme with OpticWorks branding:

| Element | Crossplane | OpticWorks |
|---------|------------|------------|
| Primary accent | Teal (#23B89A) | Brand blue (TBD) |
| Logo | Crossplane | OpticWorks |
| Fonts | Avenir | Geist or Inter |
| Favicon | Crossplane | OpticWorks |

### Deployment

- **Host**: Cloudflare Pages
- **Domain**: docs.optic.works
- **Build**: `pnpm docs:build`

### Content Plan

| Section | Content |
|---------|---------|
| Getting Started | Unboxing, initial setup, Home Assistant integration |
| Bed Presence Sensor | Installation, configuration, calibration |
| Presence Engine | API docs, developer guide |
| Dashboard Pack | Template installation, customization |
| Troubleshooting | FAQ, common issues, reset procedures |
| Support | Contact, warranty, returns |

### Tasks

- [ ] Clone Crossplane's Geekboot theme as starting point
- [ ] Rename to `opticboot`, update branding
- [ ] Adapt color palette for OpticWorks brand
- [ ] Configure hugo.yaml (based on Crossplane's config.yaml)
- [ ] Set up PostCSS pipeline for SCSS compilation
- [ ] Write Getting Started guide
- [ ] Write product documentation (per product)
- [ ] Add troubleshooting section
- [ ] Configure Cloudflare Pages deployment
- [ ] Set up docs.optic.works DNS
- [ ] Verify dark mode works correctly

### Commands

```bash
# Development
pnpm docs:dev

# Build
pnpm docs:build

# Deploy (Cloudflare Pages)
# Configured via dashboard or wrangler
```

### Reference

- [Crossplane Docs Repo](https://github.com/crossplane/docs)
- [Crossplane Geekboot Theme](https://github.com/crossplane/docs/tree/master/themes/geekboot)
- [Live Example](https://docs.crossplane.io)

---

## Track 5: Usability Testing + Accessibility

**Goal**: Validate user experience and ensure WCAG 2.1 AA compliance.

### Usability Testing

| Test Type | Method | Participants |
|-----------|--------|--------------|
| Task completion | Moderated sessions | 5-8 users |
| First-click | Unmoderated (Maze/Lyssna) | 20+ users |
| Checkout flow | A/B testing (optional) | Traffic-based |

### Key Flows to Test

1. Browse products and add to cart
2. Complete checkout as guest
3. Register account and view order history
4. Find product documentation
5. Contact support

### Accessibility Audit

| Area | Tool |
|------|------|
| Automated scan | axe DevTools, Lighthouse |
| Keyboard navigation | Manual testing |
| Screen reader | NVDA/VoiceOver testing |
| Color contrast | WebAIM Contrast Checker |
| Focus management | Manual testing |

### Tasks

- [ ] Run Lighthouse accessibility audit
- [ ] Fix critical accessibility issues
- [ ] Conduct 5-8 moderated usability sessions
- [ ] Document findings and recommendations
- [ ] Implement high-priority fixes
- [ ] Verify keyboard navigation throughout
- [ ] Test with screen reader

### Deliverables

- Accessibility audit report
- Usability test findings
- Prioritized fix list

---

## Track 6: CI/CD Hardening + Monitoring

**Goal**: Reliable deployments and production observability.

### CI/CD Improvements

| Current | Target |
|---------|--------|
| Manual Cloudflare deploy | GitHub Actions auto-deploy |
| Ansible for backend | Ansible + Terraform hybrid |
| No staging environment | Staging on workers.dev |
| Manual E2E runs | E2E in CI pipeline |

### Monitoring Stack

| Layer | Tool |
|-------|------|
| Uptime | Cloudflare Health Checks |
| Errors | Sentry (frontend + backend) |
| Logs | Cloudflare Workers Logs + PM2 |
| Analytics | Cloudflare Analytics + GA4 |
| APM | Cloudflare Workers Analytics |

### Tasks

- [ ] Set up GitHub Actions for storefront deploy
- [ ] Configure staging environment (workers.dev)
- [ ] Add E2E tests to CI pipeline
- [ ] Implement Sentry for error tracking
- [ ] Configure Cloudflare health checks
- [ ] Set up alerting (Slack/email)
- [ ] Document runbooks for common issues
- [ ] Add Terraform for Hetzner infrastructure (per RFD-010)

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test

  e2e:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm exec playwright install --with-deps
      - run: pnpm exec playwright test --project=chromium

  deploy:
    needs: e2e
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm run cf:build
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: deploy --env production
```

---

## Success Criteria

### Track 1: Products
- [ ] All 7 products have production images
- [ ] Prices match marketing materials
- [ ] Inventory tracking enabled

### Track 2: Design
- [ ] Consistent visual language across all pages
- [ ] Dark mode fully functional
- [ ] Mobile experience polished

### Track 3: Fulfillment
- [ ] FedEx rates shown in checkout
- [ ] Labels generated automatically
- [ ] Tracking emails sent

### Track 4: Docs
- [ ] docs.optic.works live
- [ ] Product guides complete
- [ ] Search functional

### Track 5: Usability
- [ ] WCAG 2.1 AA compliant
- [ ] Usability issues documented
- [ ] Critical fixes implemented

### Track 6: CI/CD
- [ ] Automated deployments working
- [ ] E2E tests in CI
- [ ] Monitoring and alerting active

---

## Reference

### Previous Phases

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Static Next.js storefront | Complete |
| 1 | Medusa backend deployment | Complete |
| 2 | Medusa API integration | Complete |
| 3 | Full e-commerce functionality | Complete |

### Key Documentation

- `CLAUDE.md` - Agent context and commands
- `docs/SECRETS.md` - Environment variables
- `docs/reference/ARCHITECTURE.md` - System overview
- `docs/reference/archived/PHASE3_PLAN.md` - Previous phase details

### External Resources

- [Medusa FedEx Fulfillment](https://github.com/igorppbr/medusa-fedex-fulfillment)
- [Crossplane Docs (theme reference)](https://github.com/crossplane/docs)
- [docs.crossplane.io (live example)](https://docs.crossplane.io)
- [EasyPost API](https://www.easypost.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
