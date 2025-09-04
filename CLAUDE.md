# CLAUDE.md

This file provides comprehensive guidance for developers working on the **OpticWorks Window Tinting E-commerce Platform**.

## Project Overview

**OpticWorks Window Tinting E-commerce Platform** - A sophisticated, production-ready e-commerce solution specializing in DIY window tinting for Tesla and automotive applications.

### Business Focus
- **Target Market**: Tesla owners, automotive enthusiasts, DIY installers
- **Products**: Pre-cut ceramic films, installation kits, professional tools
- **Key Differentiator**: Tesla Model Y specialization with "Foolproof DIY" methodology
- **Legal Compliance**: Built-in state tinting law checker and VLT compliance system
- **Brand**: OpticWorks with CyberShade IRX™ featured product line

## Development Environment

### Technology Stack
- **Framework**: Next.js 15.5.0 with App Router
- **React**: 19.1.1 (latest stable)
- **TypeScript**: 5.9.2 (strict mode enabled)
- **Styling**: Tailwind CSS 4.1.12
- **Package Manager**: pnpm
- **State Management**: Zustand 5.0.8 with persistence

### Development Commands

```bash
# Install dependencies
pnpm install

# Development server (http://localhost:3000)
pnpm run dev

# Production build
pnpm run build

# Production server
pnpm run start

# Lint code (REQUIRED before commits)
pnpm run lint
```

**Critical**: Always run `pnpm run lint` and `pnpm run build` before committing. The project uses strict TypeScript and ESLint rules.

## Repository Organization

### Directory Structure

```
src/
├── app/                          # Next.js App Router pages and API routes
│   ├── api/                     # API endpoints (14 routes)
│   │   ├── stripe/              # Payment processing (production-ready)
│   │   ├── email/               # Email service (production-ready)
│   │   ├── tax/                 # Tax calculation
│   │   └── shipping/            # Shipping rates
│   ├── store/                   # E-commerce pages
│   ├── products/                # Product catalog
│   ├── support/                 # Customer service
│   └── page.tsx                 # Landing page
├── components/                   # React components (two-tier system)
│   ├── ui/                      # Shadcn/ui + Custom components
│   ├── checkout/                # Payment flow components
│   ├── store/                   # E-commerce components
│   ├── support/                 # Customer service components
│   ├── products/                # Product-specific components
│   └── 3d/                      # Three.js Tesla 3D viewer
├── hooks/                       # Custom React hooks (3 total)
│   ├── useCart.ts              # Shopping cart state
│   ├── useCheckoutState.ts     # Payment flow state
│   └── useSupportStore.ts      # Customer service state
├── lib/                         # Utility functions and services
│   ├── api/                     # Business logic layer
│   ├── email/                   # React Email templates
│   ├── utils.ts                 # Core utilities (cx, cn functions)
│   └── products.ts              # Product catalog data
└── docs/                        # Developer documentation
    ├── CODEBASE_EXPLANATION.md  # Architecture overview
    ├── STATE_MANAGEMENT.md      # Zustand patterns
    ├── API_STUBS.md            # Complete API documentation
    └── STRIPE_INTEGRATION.md   # Payment integration guide
```

### Configuration Files
- `next.config.ts` - Image optimization, Three.js support, GLSL shader loading
- `tailwind.config.js` - Minimal Tailwind v4 configuration
- `src/app/siteConfig.ts` - Centralized site metadata and route definitions
- `package.json` - Dependencies and scripts

## Website Architecture

### Page Routes (20 Total)

**E-commerce Core:**
- `/` - Tesla-focused landing page with 3D viewer
- `/products` - Product catalog with filtering (11+ products)
- `/products/[slug]` - Dynamic product details with specifications
- `/store` - Storefront with cart integration
- `/store/cart` - Shopping cart with Stripe checkout
- `/store/cart/success` - Payment confirmation with email system

**Support System:**
- `/support` - Customer service hub
- `/support/faq` - FAQ with search/filtering (15 FAQs)
- `/support/contact` - Contact form with file upload
- `/support/warranty` - Warranty claim processing
- `/support/oops` - "Oops Protection" replacement program
- `/support/orders` - Order lookup and tracking
- `/support/billing` - Invoice and payment management
- `/support/compatibility` - Vehicle compatibility checker

**Legal & Compliance:**
- `/support/legal` - Legal hub page
- `/support/legal/tinting-laws` - Interactive state law checker
- `/support/legal/privacy` - GDPR/CCPA privacy policy
- `/support/legal/terms` - Terms of service

**Installation Support:**
- `/install-guides` - Installation tutorial hub
- `/install-guides/cybershade-irx-tesla-model-y` - Tesla Model Y guide

### API Routes (14 Total)

**Production-Ready:**
- `POST /api/stripe/create-checkout-session` - Payment processing
- `POST /api/stripe/webhook` - Order confirmation automation
- `POST /api/email/send` - Email delivery (React Email + Resend)

**Development Stubs:**
- `POST /api/shipping/rates` - Multi-carrier shipping
- `POST /api/inventory/check` - Stock availability
- `POST /api/analytics/events` - User tracking
- And 7 additional support/utility endpoints

## Component Architecture

### Two-Tier Component System

**Tier 1: Shadcn/ui Components** (`src/components/ui/` - accessibility-focused)
- **Purpose**: Forms, dialogs, buttons, inputs - anything requiring accessibility
- **Pattern**: Radix UI primitives + class-variance-authority + `cn()` utility
- **Examples**: `button.tsx`, `form.tsx`, `input.tsx`, `dialog.tsx`

```typescript
// Example Shadcn component usage
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

className={cn("base-styles", conditional && "variant")}
```

**Tier 2: Custom Business Components** (`src/components/ui/` - brand-focused)
- **Purpose**: Marketing sections, Tesla-specific features, business logic
- **Pattern**: Custom styling + `cx()` utility + Framer Motion
- **Examples**: `Hero.tsx`, `Features.tsx`, `Navbar.tsx`, `Tesla3DViewer.tsx`

```typescript
// Example custom component usage
import { cx } from "@/lib/utils"
import { FadeContainer, FadeDiv } from "@/components/Fade"

className={cx("custom-styles", conditional && "variant")}
```

### Specialized Component Categories

**3D Components** (`src/components/3d/`)
- `Tesla3DViewer.tsx` - Interactive Model Y visualization
- `TeslaModel.tsx` - Three.js model rendering
- `Scene.tsx` - Three.js scene setup
- `ErrorBoundary.tsx` - 3D component error handling

**Checkout Components** (`src/components/checkout/`)
- `CheckoutWrapper.tsx` - Stripe initialization
- `CheckoutForm.tsx` - Payment form with Elements
- `AddressForm.tsx` - Shipping address collection
- `PaymentForm.tsx` - Card payment processing

## State Management Architecture

### Zustand with Persistence

All client-side state uses Zustand with localStorage persistence middleware for seamless user experience.

**Shopping Cart State** (`src/hooks/useCart.ts`)
```typescript
interface CartStore {
  items: CartItem[]
  isOpen: boolean
  paymentSession: PaymentSession | null
  // Methods: addToCart, removeFromCart, updateQuantity, clearCart, etc.
}

// Usage
const { addToCart, items, getTotalPrice } = useCart()
```

**Features:**
- Persistent across browser sessions (`cart-storage` key)
- Optimistic UI updates with toast notifications
- Payment session tracking for Stripe integration
- Selective persistence (UI state excluded)

**Checkout State** (`src/hooks/useCheckoutState.ts`)
```typescript
interface CheckoutState {
  taxAmount: number
  isCalculatingTax: boolean
  shippingAddress: ShippingAddress | null
  subtotal: number
  total: number
}
```

**Features:**
- Non-persistent (Stripe manages session state)
- Real-time tax calculation
- Address validation integration
- Reactive total calculations

**Support System State** (`src/hooks/useSupportStore.ts`)
```typescript
interface SupportStore {
  tickets: Ticket[]
  contactForm: ContactFormData
  warrantyForm: WarrantyFormData
  currentSession: SessionData
  // 15+ methods for customer service operations
}
```

**Features:**
- In-memory ticket system with CRUD operations
- Form data persistence to prevent data loss
- Session analytics tracking (page views, searches)
- User preference persistence

## Checkout Flow Architecture

### Hybrid Stripe Integration

The checkout system uses a sophisticated hybrid approach combining **Stripe Checkout Sessions** (for tax calculation and backend processing) with **Stripe Elements** (for custom UI control).

### Payment Flow Steps

1. **Cart Review** → User reviews items, sees "Calculated at checkout" for tax
2. **Checkout Initialization** → `CheckoutWrapper` creates Stripe session
3. **Address Collection** → Stripe AddressElement with autocomplete
4. **Tax Calculation** → Real-time calculation via `/api/stripe/get-session-tax`
5. **Payment Processing** → Stripe PaymentElement with card details
6. **Order Confirmation** → Success page with automatic email delivery

### Key Features
- Custom UI with Stripe's security and compliance
- Real-time tax calculation using Stripe Tax API
- Automatic invoice generation
- Dual email confirmation system (webhook + backup)
- Professional React Email templates with Tesla branding

## API Integrations

### Production-Ready Services

**Stripe Payment Processing** ✅
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

**Email Service (React Email + Resend)** ✅
```bash
RESEND_API_KEY=re_xxxxx
NEXT_PUBLIC_FROM_EMAIL=OpticWorks <orders@notifications.optic.works>
```

**Database (Supabase)** - Integration Ready
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

**CDN Storage (Cloudflare R2)** - Integration Ready
```bash
CLOUDFLARE_EMAIL=xxxxx
CLOUDFLARE_GLOBAL_API_KEY=xxxxx
R2_ACCESS_KEY_ID=xxxxx
```

### Development Stubs

All API endpoints in `src/app/api/` are **production-ready stubs** with:
- Realistic delays (300-800ms)
- Comprehensive error handling
- TypeScript interface definitions
- Mock data that matches production models

## Utility Functions and Libraries

### Core Utilities (`src/lib/utils.ts`)

```typescript
// For custom business components (Tremor-inspired)
export function cx(...args: ClassValue[]) {
  return twMerge(clsx(...args))
}

// For Shadcn accessibility components
export const cn = cx  // Alias for consistency

// Accessibility helper utilities
export const focusInput = [
  "focus:ring-2",
  "focus:ring-blue-200 dark:focus:ring-blue-700/30"
]
```

### Business Logic Libraries

**Product Management** (`src/lib/products.ts`)
- 11 Tesla-focused products across 4 categories
- VLT percentage variants for legal compliance
- Installation difficulty ratings
- Dynamic pricing with sale prices

**Legal Compliance** (`src/lib/api/tintingLaws.ts`)
- Complete state-by-state tinting law database
- VLT compliance checking
- Risk assessment and penalty information
- Medical exemption handling

**Email Templates** (`src/lib/email/templates/`)
- Professional React Email templates
- Tesla-specific branding and content
- Order confirmation with complete details
- Payment failure notifications

## Key Dependencies

### Framework and Core
```json
{
  "next": "15.5.0",              // App Router, React 19
  "react": "19.1.1",
  "typescript": "5.9.2",         // Strict mode
  "tailwindcss": "4.1.12"        // Latest v4
}
```

### State Management and Forms
```json
{
  "zustand": "5.0.8",                    // Primary state management
  "react-hook-form": "7.62.0",           // Form handling
  "zod": "4.1.0",                        // Schema validation
  "class-variance-authority": "0.7.1"    // Component variants
}
```

### UI and Animation
```json
{
  "framer-motion": "12.23.12",          // Animations
  "@radix-ui/react-*": "^2.x",          // Accessible primitives
  "clsx": "2.1.1",                      // Conditional classes
  "tailwind-merge": "2.6.0",            // Class deduplication
  "sonner": "1.5.0"                     // Toast notifications
}
```

### Business Integrations
```json
{
  "@stripe/stripe-js": "7.9.0",         // Client-side Stripe
  "@stripe/react-stripe-js": "3.9.2",   // React Stripe components
  "stripe": "18.4.0",                   // Server-side Stripe
  "@supabase/supabase-js": "2.56.0",    // Database
  "resend": "6.0.1",                    // Email service
  "@react-email/components": "0.5.1"     // Email templates
}
```

### 3D Visualization
```json
{
  "@react-three/fiber": "9.3.0",        // Three.js React integration
  "@react-three/drei": "10.7.4",        // Three.js utilities
  "three": "0.179.1"                    // Tesla 3D viewer
}
```

## Development Patterns

### TypeScript Requirements
- **Strict mode enabled** - No `any` types allowed
- **Complete interface definitions** for all data structures
- **Form validation** using Zod schemas with React Hook Form
- **Error boundaries** especially for 3D components

### Component Development Guidelines
1. Use **Shadcn components** for forms, dialogs, accessibility-focused UI
2. Use **custom components** for marketing, Tesla-specific features
3. Follow **responsive-first design** - mobile to desktop
4. Implement **proper loading states** and error handling
5. Use **semantic HTML** and proper ARIA labels

### API Development Patterns
1. **Consistent error responses** using NextResponse.json
2. **Realistic development delays** to simulate network conditions
3. **Comprehensive input validation** for all endpoints
4. **Production-ready function signatures** with TypeScript interfaces

### State Management Patterns
1. **Selective persistence** - Only persist necessary data
2. **Optimistic updates** - Update UI immediately, sync later
3. **Business logic in stores** - Keep components focused on rendering
4. **Form state persistence** - Prevent data loss during navigation

## Business Domain Knowledge

### Tesla Specialization
- **Primary Focus**: Model Y (2025+ Juniper), Model 3, Model S, Model X
- **VLT Compliance**: Built-in state law checking for legal compliance
- **Installation Support**: Difficulty ratings and video guide integration
- **Community Focus**: Tesla owner testimonials and case studies

### Legal Compliance System
- **State-by-state tinting laws** with real-time compliance checking
- **VLT percentage validation** against local regulations
- **Risk assessment** with violation details and penalties
- **Medical exemption** handling and documentation

### Product Categories
1. **Films**: Pre-cut ceramic films with VLT variants
2. **Kits**: Complete installation packages with tools
3. **Tools**: Professional installation equipment
4. **Accessories**: Squeegees, heat guns, trim tools

## Available Documentation

The `docs/` folder contains comprehensive developer documentation:

- **`CODEBASE_EXPLANATION.md`** - Architecture overview and patterns
- **`STATE_MANAGEMENT.md`** - Detailed Zustand implementation patterns
- **`API_STUBS.md`** - Complete catalog of all API endpoints
- **`STRIPE_INTEGRATION.md`** - Production-ready payment processing guide
- **`Payment_Architectures.md`** - Payment system design decisions

## Development Workflow

### Getting Started
1. **Environment Setup**: Configure Stripe and email service keys
2. **Development**: `pnpm run dev` for hot-reload development
3. **Testing**: Use Stripe test cards and `stripe listen` for webhooks
4. **Building**: `pnpm run build` to verify production compatibility
5. **Linting**: `pnpm run lint` for code quality validation

### Code Quality Standards
- **ESLint + Prettier** for consistent formatting
- **TypeScript strict mode** for type safety
- **Accessibility compliance** using Shadcn/ui components
- **Performance optimization** with Next.js best practices
- **Error boundaries** for robust user experience

### Git Workflow
- **Feature branches** for all development work
- **Descriptive commits** following established patterns
- **Pre-commit validation** with lint and build checks
- **Pull request reviews** for code quality

This OpticWorks platform represents a sophisticated, production-ready e-commerce solution with deep automotive industry specialization, complete payment integration, and modern development practices optimized for Tesla community needs.