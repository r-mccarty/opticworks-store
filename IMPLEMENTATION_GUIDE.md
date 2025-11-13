# OpticWorks Migration Implementation Guide

**Last Updated**: 2025-11-13
**Status**: Phase 1 Complete - Foundation Established

## Overview

This guide provides step-by-step instructions for continuing the OpticWorks platform migration from a Next.js monolith to a distributed monorepo architecture with Cloudflare Workers, MedusaJS, and Ory Hydra.

## What Has Been Completed

### ✅ Phase 1: Foundation & Planning

**Completed Items**:
1. **Migration Plan** (`docs/MIGRATION_PLAN.md`)
   - Comprehensive 11-phase migration roadmap
   - Architecture diagrams and decision records
   - Risk assessment and mitigation strategies

2. **Monorepo Structure** (pnpm workspaces)
   - `apps/storefront/` - Next.js frontend (ready for OpenNext)
   - `apps/docs/` - Hugo documentation site (stub)
   - `apps/medusa-backend/` - MedusaJS e-commerce backend (stub)
   - `apps/auth/` - Ory Hydra authentication (stub)
   - `apps/forum/` - Discourse integration (stub)
   - `packages/design-system/` - Token-based design system (implemented)
   - `packages/shared-types/` - TypeScript shared types (stub)
   - `packages/cms-sdk/` - GitOps CMS SDK (stub)
   - `packages/medusa-plugins/` - Custom MedusaJS plugins (stub)

3. **Design System Foundation** (`packages/design-system/`)
   - Color tokens (lime green theme inspired by Work Louder/Modal)
   - Typography tokens (Geist font with modular scale)
   - Spacing tokens (8px baseline grid)
   - Animation tokens (including Lenis-style smooth easing)
   - Grid system tokens (12-column with overlay support)
   - Utility functions (cn, cx for class merging)

4. **404 Page** (`apps/storefront/src/app/not-found.tsx`)
   - ASCII art bitmask animation (Oxide Computer inspired)
   - Canvas-based bit pattern visualization
   - Lime green accent colors
   - Responsive design

## Repository Structure

```
opticworks-store/
├── apps/
│   ├── storefront/              ✅ Next.js app (current implementation)
│   ├── docs/                    📋 Hugo docs (stub with README)
│   ├── medusa-backend/          📋 MedusaJS backend (stub with README)
│   ├── auth/                    📋 Ory Hydra (stub with README)
│   └── forum/                   📋 Discourse config (stub)
├── packages/
│   ├── design-system/           ✅ Token-based design system (implemented)
│   ├── shared-types/            📋 Shared TypeScript types (stub)
│   ├── cms-sdk/                 📋 GitOps CMS SDK (stub)
│   └── medusa-plugins/          📋 Custom plugins (stub)
├── infrastructure/
│   ├── cloudflare/              📋 CF Workers/Queues config (stub)
│   ├── hetzner/                 📋 Server provisioning (stub)
│   └── github-actions/          📋 CI/CD workflows (stub)
├── docs/
│   └── MIGRATION_PLAN.md        ✅ Comprehensive migration plan
├── pnpm-workspace.yaml          ✅ Monorepo configuration
├── package.json                 ✅ Root package.json
└── IMPLEMENTATION_GUIDE.md      ✅ This file

Legend:
✅ = Implemented
📋 = Stub/Documentation only
⚠️ = Partial implementation
```

## Next Steps: Phase 2 - Design System & UI Refactoring

### Prerequisites

```bash
# Install dependencies for all workspaces
pnpm install

# Verify monorepo setup
pnpm run lint
```

### Step 1: Integrate Design System into Storefront

**Goal**: Replace hard-coded styles with design tokens

**Tasks**:

1. **Update storefront to use design system package**:
   ```bash
   cd apps/storefront
   ```

2. **Import design tokens in global styles** (`src/app/globals.css`):
   ```css
   @import '@opticworks/design-system/tokens';

   :root {
     --color-primary: theme('colors.brand.lime.400');
     --color-secondary: theme('colors.brand.modal.500');
     /* ... more token mappings */
   }
   ```

3. **Update Tailwind config** to use design system preset:
   ```typescript
   // apps/storefront/tailwind.config.js
   import { preset } from '@opticworks/design-system/tailwind'

   export default {
     presets: [preset],
     content: [
       './src/**/*.{ts,tsx}',
       '../../packages/design-system/src/**/*.{ts,tsx}',
     ],
   }
   ```

4. **Refactor components to use tokens**:
   ```typescript
   // Before
   className="bg-blue-500 text-white"

   // After
   import { cn } from '@opticworks/design-system/utils'
   className={cn("bg-primary text-primary-foreground")}
   ```

### Step 2: Create Tailwind Preset

**File**: `packages/design-system/src/tailwind/preset.ts`

```typescript
import type { Config } from 'tailwindcss'
import { colors } from '../tokens/colors'
import { typography } from '../tokens/typography'
import { spacing } from '../tokens/spacing'

export const preset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        brand: colors.brand,
        primary: colors.primary,
        secondary: colors.secondary,
        // ... map all color tokens
      },
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      spacing: spacing,
      // ... map all tokens
    },
  },
}

export default preset
```

### Step 3: Implement Lime Green Color Scheme

**Goal**: Replace current color scheme with lime green brand colors

**Files to Update**:

1. **Primary CTAs**:
   - Change from blue/amber to lime green (`brand.lime.400`)
   - File: `src/components/ui/button.tsx`

2. **Links and accents**:
   - Update hover states to lime green
   - Files: Navigation, product cards, footer

3. **Focus states**:
   - Update focus rings to lime green
   - Pattern: `focus:ring-brand-lime-400`

4. **404 page** (already updated):
   - Uses lime green (`rgba(163, 230, 53, ...)`)
   - Example reference for other pages

### Step 4: Create Menu-Style Navigation

**Goal**: Replace current navigation with expandable menu system

**File**: `apps/storefront/src/components/navigation/MenuNav.tsx`

```typescript
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@opticworks/design-system/utils'

interface MenuItem {
  label: string
  href: string
  description?: string
  submenu?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    label: 'Products',
    href: '/products',
    submenu: [
      { label: 'Films', href: '/products?category=films', description: 'Pre-cut ceramic films' },
      { label: 'Kits', href: '/products?category=kits', description: 'Complete installation kits' },
      { label: 'Tools', href: '/products?category=tools', description: 'Professional tools' },
    ]
  },
  {
    label: 'Support',
    href: '/support',
    submenu: [
      { label: 'FAQ', href: '/support/faq' },
      { label: 'Contact', href: '/support/contact' },
      { label: 'Warranty', href: '/support/warranty' },
    ]
  },
  // ... more menu items
]

export function MenuNav() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <nav className="flex items-center gap-8">
      {menuItems.map((item, index) => (
        <div
          key={item.label}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          className="relative"
        >
          <Link
            href={item.href}
            className={cn(
              "text-sm font-medium transition-colors",
              hoveredIndex === index
                ? "text-brand-lime-400"
                : "text-neutral-700 hover:text-neutral-900"
            )}
          >
            {item.label}
          </Link>

          {/* Submenu dropdown */}
          <AnimatePresence>
            {item.submenu && hoveredIndex === index && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "absolute top-full left-0 mt-2 w-64",
                  "bg-white rounded-lg shadow-lg border border-neutral-200",
                  "p-2"
                )}
              >
                {item.submenu.map((subitem) => (
                  <Link
                    key={subitem.label}
                    href={subitem.href}
                    className={cn(
                      "block px-4 py-3 rounded-md",
                      "hover:bg-brand-lime-400/10 transition-colors"
                    )}
                  >
                    <div className="font-medium text-neutral-900">{subitem.label}</div>
                    {subitem.description && (
                      <div className="text-xs text-neutral-600 mt-0.5">
                        {subitem.description}
                      </div>
                    )}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </nav>
  )
}
```

### Step 5: Integrate Lenis Smooth Scrolling

**Goal**: Add smooth scrolling to landing page

**Installation**:
```bash
cd apps/storefront
pnpm add lenis
```

**Implementation** (`src/app/page.tsx`):
```typescript
'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

export default function HomePage() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth easing
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  return (
    <div>
      {/* Page content */}
    </div>
  )
}
```

## Next Steps: Phase 3 - Monorepo Workspace Setup

### Step 1: Set Up Hugo Documentation

**Prerequisites**:
```bash
# Install Hugo
brew install hugo  # macOS
# OR
sudo apt-get install hugo  # Linux
```

**Setup**:
```bash
cd apps/docs

# Add Geekdocs theme
git submodule add https://github.com/thegeeklab/hugo-geekdoc themes/geekdocs
git submodule update --init --recursive

# Create Hugo config
mkdir config
```

**Create config file** (`apps/docs/config/config.toml`):
```toml
baseURL = "https://docs.opticworks.com/"
languageCode = "en-us"
title = "OpticWorks Documentation"
theme = "geekdocs"

[params]
  description = "OpticWorks E-commerce Platform Documentation"
  geekdocRepo = "https://github.com/opticworks/opticworks"
  geekdocEditPath = "edit/main/apps/docs/content"
  geekdocSearch = true
```

**Test locally**:
```bash
hugo server -D
# Visit http://localhost:1313
```

### Step 2: Set Up MedusaJS Backend

**Prerequisites**:
- Docker and Docker Compose
- PostgreSQL (or use Docker)

**Installation**:
```bash
cd apps/medusa-backend

# Install Medusa CLI
pnpm install -g @medusajs/medusa-cli

# Create new MedusaJS project
medusa new . --skip-db

# Install dependencies
pnpm install
```

**Database setup** (docker-compose.yml):
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: medusa
      POSTGRES_PASSWORD: medusa
      POSTGRES_DB: medusa
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

**Start services**:
```bash
docker-compose up -d

# Run migrations
pnpm run migrate

# Seed data (optional)
pnpm run seed

# Start dev server
pnpm run dev
```

### Step 3: Set Up Ory Hydra

**Prerequisites**:
- Docker and Docker Compose

**Setup**:
```bash
cd apps/auth

# Create docker-compose.yml (see apps/auth/README.md for full config)
docker-compose up -d postgres

# Run Hydra migrations
docker-compose run hydra migrate sql -e --yes

# Start Hydra
docker-compose up -d hydra
```

**Create OAuth2 clients**:
```bash
# Storefront client
docker exec hydra \
  hydra clients create \
    --endpoint http://localhost:4445 \
    --id opticworks-storefront \
    --secret $(openssl rand -hex 32) \
    --grant-types authorization_code,refresh_token \
    --response-types code \
    --scope openid,offline_access,profile,email \
    --callbacks https://opticworks.com/auth/callback
```

## Next Steps: Phase 4 - Cloudflare Workers Deployment

### Step 1: Install OpenNext Adapter

```bash
cd apps/storefront
pnpm add -D opennext-cloudflare
```

### Step 2: Configure OpenNext

**Update** `apps/storefront/next.config.ts`:
```typescript
import type { NextConfig } from 'next'

const config: NextConfig = {
  output: 'standalone',  // Required for OpenNext

  // Optimize for edge runtime
  experimental: {
    runtime: 'edge',
  },

  // ... rest of config
}

export default config
```

### Step 3: Create Cloudflare Worker

**Create** `infrastructure/cloudflare/wrangler.toml`:
```toml
name = "opticworks-storefront"
main = "worker.js"
compatibility_date = "2024-01-01"

[env.production]
name = "opticworks-storefront"
route = "opticworks.com/*"

[env.staging]
name = "opticworks-storefront-staging"
route = "staging.opticworks.com/*"
```

### Step 4: Build and Deploy

```bash
# Build for production
cd apps/storefront
pnpm run build

# Deploy to Cloudflare Workers
npx wrangler deploy
```

## Missing Context / TODO Items

Based on the migration requirements, here are items that need more context or implementation:

### 1. Cloudflare Queues for Webhooks

**Status**: Stub only
**Needed**:
- Cloudflare Queue configuration
- Worker to consume webhook events
- Dead letter queue setup
- Integration with existing Stripe webhooks

**Location**: `infrastructure/cloudflare/queues.ts` (to be created)

### 2. Discourse Forum Setup

**Status**: Stub only
**Needed**:
- Docker configuration for Discourse
- Custom theme matching OpticWorks brand
- SSO plugin configuration for Ory Hydra
- Deployment scripts for Hetzner

**Location**: `apps/forum/` (to be created)

### 3. GitOps CMS Workflow

**Status**: Stub only
**Needed**:
- Content schema definitions
- GitHub API integration for PR creation
- Content editor UI
- MDX/Markdown parsing

**Location**: `packages/cms-sdk/` (to be created)

### 4. Gmail/PubSub for Support Notifications

**Status**: Not started
**Needed**:
- Google Cloud Pub/Sub setup
- Gmail API integration
- Email template system
- Replace Resend for support emails (keep for orders)

**Location**: New API route in `apps/storefront/src/app/api/support/` (to be created)

### 5. Turnstile Integration

**Status**: Not started
**Needed**:
- Cloudflare Turnstile site key
- Client-side widget
- Server-side verification
- Integration with support form

**Location**: `apps/storefront/src/components/support/ContactForm.tsx` (to be updated)

### 6. Social Media Links

**Status**: Not started
**Needed**:
- GitHub, Discord, X (Twitter), Forums, YouTube URLs
- Footer component update
- Navigation update

**Location**: Various components (footer, navigation)

### 7. GitHub Actions Workflows

**Status**: Stub only
**Needed**:
- Test workflow (.github/workflows/test.yml)
- Build workflow (.github/workflows/build.yml)
- Deploy storefront (.github/workflows/deploy-storefront.yml)
- Deploy docs (.github/workflows/deploy-docs.yml)
- Deploy backend (.github/workflows/deploy-backend.yml)

**Location**: `.github/workflows/` (to be created)

## Common Commands

```bash
# Development
pnpm run dev                    # Start storefront dev server
pnpm run dev:all                # Start all apps in parallel
pnpm run dev:docs               # Start Hugo docs server

# Building
pnpm run build                  # Build all apps
pnpm run build:storefront       # Build storefront only
pnpm run build:docs             # Build docs only

# Testing
pnpm run test                   # Run all tests
pnpm run lint                   # Lint all workspaces
pnpm run typecheck              # Type check all workspaces

# Cleaning
pnpm run clean                  # Clean all build artifacts
```

## Environment Variables

### Required for Development

Create `.env.local` in each workspace:

**Storefront** (`apps/storefront/.env.local`):
```bash
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Resend (email)
RESEND_API_KEY=re_xxxxx
NEXT_PUBLIC_FROM_EMAIL=orders@opticworks.com

# MedusaJS
MEDUSA_BACKEND_URL=http://localhost:9000

# Ory Hydra
HYDRA_URL=http://localhost:4444
OAUTH_CLIENT_ID=opticworks-storefront
OAUTH_CLIENT_SECRET=xxxxx
```

**MedusaJS** (`apps/medusa-backend/.env`):
```bash
DATABASE_URL=postgresql://medusa:medusa@localhost:5432/medusa
REDIS_URL=redis://localhost:6379
JWT_SECRET=xxxxx
STRIPE_API_KEY=sk_test_xxxxx
```

**Ory Hydra** (`apps/auth/.env`):
```bash
DSN=postgres://hydra:hydra@localhost:5432/hydra
SECRETS_SYSTEM=xxxxx
SECRETS_COOKIE=xxxxx
```

## Troubleshooting

### Monorepo Issues

**Problem**: Workspace not found
```bash
# Solution: Reinstall dependencies
pnpm install
```

**Problem**: Type errors in design system
```bash
# Solution: Build design system first
cd packages/design-system
pnpm run typecheck
```

### Storefront API Routes

**Problem**: `next build` fails because Stripe credentials are unavailable
```bash
# Solution: API routes now fall back to mock Stripe order data when
# STRIPE_SECRET_KEY is not configured. The build will succeed with
# placeholder responses so long as the environment variable is defined
# in production deployments.
```

### Hugo Issues

**Problem**: Theme not found
```bash
# Solution: Update submodules
git submodule update --init --recursive
```

### MedusaJS Issues

**Problem**: Database connection failed
```bash
# Solution: Check PostgreSQL is running
docker-compose ps
docker-compose up -d postgres
```

## Support & Resources

- **Migration Plan**: `/docs/MIGRATION_PLAN.md`
- **Design System**: `/packages/design-system/README.md`
- **MedusaJS Setup**: `/apps/medusa-backend/README.md`
- **Ory Hydra Setup**: `/apps/auth/README.md`
- **Hugo Docs**: `/apps/docs/README.md`

## Appendix: Quick Reference

### Design Tokens

```typescript
// Import tokens
import { colors, typography, spacing } from '@opticworks/design-system/tokens'

// Use in components
<div style={{ color: colors.brand.lime[400] }}>Lime green text</div>

// Use with Tailwind
<div className="bg-brand-lime-400 text-white">Button</div>
```

### Component Patterns

```typescript
// Shadcn/ui components (accessibility)
import { Button } from '@opticworks/design-system/components/ui'

// Custom components (brand)
import { Hero } from '@opticworks/design-system/components/custom'

// Utilities
import { cn, cx } from '@opticworks/design-system/utils'
```

### Animation

```typescript
// Framer Motion variants
import { animations } from '@opticworks/design-system/tokens'

<motion.div
  variants={animations.framerVariants.slideUp}
  initial="initial"
  animate="animate"
/>
```

---

**Last Updated**: 2025-11-13
**Next Review**: When Phase 2 is 50% complete
