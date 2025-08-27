# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**OpticWorks Window Tinting E-commerce Platform** - A comprehensive DIY window tinting solution specializing in Tesla and automotive applications. This is a full-featured e-commerce platform, not just a marketing website template.

**Business Context:**
- **Target Market**: Tesla owners, automotive enthusiasts, DIY installers
- **Products**: Pre-cut ceramic tinting films, installation kits, professional tools
- **USP**: "Foolproof DIY" - Professional results with guided installation system
- **Key Features**: State-specific tinting law compliance, Tesla Model Y specialization, comprehensive support system

## Development Commands

This is a Next.js 15 project with TypeScript. Use pnpm as the package manager.

```bash
# Install dependencies
pnpm install

# Development server
pnpm run dev

# Build for production
pnpm run build

# Start production server
pnpm run start

# Lint code
pnpm run lint
```

## Complete Tech Stack

### Core Framework
- **Framework**: Next.js 15.5.0 with App Router
- **Runtime**: React 19.1.1 
- **Language**: TypeScript 5.9.2
- **Package Manager**: pnpm

### Styling & UI System
- **CSS Framework**: Tailwind CSS 4.1.12 (stable release)
- **UI Components**: Hybrid system combining:
  - **Shadcn/ui**: 10 modern, accessible base components
  - **Custom Tremor-inspired**: 16 business-specific components
- **Component Variants**: class-variance-authority (cva)
- **Utility Functions**: clsx + tailwind-merge
- **Animations**: Motion 12.23.12

### UI Primitives & Forms
- **Base Primitives**: Radix UI components (@radix-ui/react-*)
- **Form Handling**: React Hook Form 7.62.0
- **Validation**: Zod 4.1.0
- **Form Components**: Shadcn form primitives with custom styling

### State Management
- **Global State**: Zustand 5.0.8 with persistence middleware
- **Cart Management**: Persistent shopping cart with local storage
- **Support System**: Ticket management and form state

### Icons & Typography
- **Icon Libraries**: Remix Icons (@remixicon/react), Heroicons, Lucide React
- **Typography**: Four custom font families via next/font/local:
  - Barlow (headings): 400, 500, 700 weights
  - Colfax (body): Regular, Medium weights
  - Feature (display): Headline, Condensed variants
- **Font System**: CSS variables with fallbacks

### Build & Development
- **Bundler**: Next.js built-in (Turbopack in dev)
- **Linting**: ESLint with Next.js config
- **Code Formatting**: Prettier with Tailwind plugin
- **TypeScript**: Strict mode enabled

## Architecture Overview

### Site Structure (16 Pages)

**Core E-commerce Flow:**
- `/` - Landing page with hero, features, social proof
- `/products` - Product catalog with filtering
- `/products/[slug]` - Dynamic product detail pages (11 products)
- `/store` - E-commerce storefront
- `/store/cart` - Shopping cart with Zustand state

**Support & Education:**
- `/install-guides` - Installation tutorial hub
- `/install-guides/cybershade-irx-tesla-model-y` - Tesla-specific guide
- `/support` - Customer support dashboard
- `/support/faq` - FAQ system with search/filtering
- `/support/contact` - Contact form with file upload
- `/support/warranty` - Warranty claim processing
- `/support/oops` - Oops Protection policy ($15 replacement program)

**Legal & Compliance:**
- `/support/legal` - Legal hub page
- `/support/legal/tinting-laws` - Interactive state-by-state tinting law checker
- `/support/legal/privacy` - GDPR/CCPA compliant privacy policy  
- `/support/legal/terms` - Comprehensive terms of service

### Component Architecture

**Hybrid UI System (26 components in /src/components/ui/):**

**Shadcn/ui Components (10):** Modern, accessible primitives
- `button.tsx` - cva-based button variants with focus management
- `card.tsx` - Flexible card container with slots
- `form.tsx` - React Hook Form integration with Zod validation
- `input.tsx`, `textarea.tsx`, `label.tsx` - Form input primitives
- `select.tsx` - Radix Select with custom styling
- `dialog.tsx` - Modal dialogs with Radix Dialog
- `badge.tsx` - Status and category badges
- `separator.tsx`, `collapsible.tsx` - Layout utilities

**Custom Tremor-inspired Components (16):** Business-specific UI
- **Layout**: `Navbar.tsx`, `Footer.tsx`, `Hero.tsx`, `VideoBackground.tsx`
- **Marketing**: `Features.tsx`, `CallToAction.tsx`, `Testimonial.tsx`
- **Business Logic**: `AnalyticsIllustration.tsx`, `ChipViz.tsx`, `SolarAnalytics.tsx`
- **Interactive**: `Map/` directory with SVG map components

**Domain Components:** Specialized business logic components
- **Products** (`/src/components/products/`): 7 components for product pages
- **Store** (`/src/components/store/`): Cart and product grid components  
- **Checkout** (`/src/components/checkout/`): Complete Stripe payment integration
- **Support** (`/src/components/support/`): 9 components for customer service

### Data Layer & Business Logic

**Product Management:**
- **Interface**: `Product` with variants, specifications, pricing
- **Catalog**: 11 products across film/kit/tool/accessory categories
- **Features**: VLT percentages, heat rejection, warranty info, Tesla compatibility
- **Images**: Unsplash integration with Cloudflare R2 CDN ready

**E-commerce Flow:**
- **Cart**: Zustand store with persistence, quantity management
- **Checkout**: Complete Stripe payment processing (on-site, no redirects)
- **Inventory**: Stock level tracking, availability management

**Support System:**
- **FAQ Database**: Categorized questions with search functionality
- **Ticket Management**: Contact forms, warranty claims, file uploads
- **State Management**: Support ticket tracking with Zustand

**Legal Compliance:**
- **Tinting Laws API**: State-by-state VLT requirements with compliance checking
- **Data Structure**: Complete `TintingLaw` interface with penalties, restrictions
- **Privacy**: GDPR/CCPA compliant data handling documentation

### Utility System & Patterns

**Styling Utilities:**
```typescript
// Shadcn pattern - used in form components
import { cn } from "@/lib/utils" // clsx + tailwind-merge

// Tremor pattern - used in custom components  
import { cx } from "@/lib/utils" // alias for cn function

// Focus management utilities
import { focusInput, focusRing, hasErrorInput } from "@/lib/utils"
```

**Component Patterns:**
- **Shadcn Components**: Use `cn()`, Radix primitives, cva for variants
- **Custom Components**: Use `cx()`, Motion animations, custom styling
- **Animations**: `FadeContainer`, `FadeDiv`, `FadeSpan` from `@/components/Fade`

**State Patterns:**
```typescript
// Cart management (Zustand)
const { addToCart, items, getTotalPrice } = useCartStore()

// Support tickets (Zustand)  
const { submitTicket, tickets } = useSupportStore()
```

## Configuration & Setup

### Next.js Configuration
```typescript
// next.config.ts
- Image optimization for Unsplash, Cloudflare R2, placeholders
- Remote patterns for external image sources
- Production-ready build configuration
```

### Tailwind Configuration
```javascript
// tailwind.config.js - Minimal v4 setup
- Content paths for all TypeScript/JSX files
- No custom theme (using v4 defaults)
- Form plugin integration (@tailwindcss/forms)
```

### Site Configuration
```typescript
// src/app/siteConfig.ts - Centralized configuration
- Site metadata and SEO settings
- All internal route definitions (20+ routes)
- Consistent linking across components
```

## Development Workflow & Best Practices

### Component Development
1. **Choose UI Pattern**: Shadcn for primitives/forms, custom for business logic
2. **Styling**: Use `cn()` for Shadcn components, `cx()` for custom components
3. **Animations**: Apply Fade components for page transitions
4. **TypeScript**: Strict typing with proper interfaces
5. **Accessibility**: Leverage Radix primitives for keyboard/screen reader support

### Form Handling
```typescript
// Standard pattern with Shadcn + React Hook Form + Zod
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem } from "@/components/ui/form"

// Validation schema
const schema = z.object({
  email: z.string().email(),
  message: z.string().min(10)
})
```

### State Management
```typescript
// Zustand pattern with persistence
interface Store {
  items: Item[]
  addItem: (item: Item) => void
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((state) => ({ 
        items: [...state.items, item] 
      }))
    }),
    { name: 'store-name' }
  )
)
```

### Image Handling
- **Development**: Unsplash images with Next.js Image optimization
- **Production Ready**: Cloudflare R2 CDN configuration
- **Formats**: WebP/AVIF optimization via Next.js Image component
- **Responsive**: Multiple breakpoints with proper sizing

### Build Process
- **Pages**: 16 static pages + dynamic product pages
- **Build Size**: Optimized bundle splitting with Next.js
- **Performance**: Motion animations, image optimization, font loading
- **SEO**: Proper metadata, Open Graph, structured data ready

## API Integration & Backend Services

### Configured API Integrations
The repository includes fully configured API keys and connection details for the following services:

**Cloudflare R2 Storage:**
- **Connection Type**: S3-compatible API with dedicated access keys
- **Usage**: File storage, image hosting, CDN delivery
- **Available Operations**: Upload, download, list buckets/objects
- **Endpoints**: Direct R2 storage + public CDN URLs

**Supabase Backend:**
- **Connection Types**: 
  - REST API (anon + service role keys for application access)
  - Direct PostgreSQL (session pooler for database operations)
- **Usage**: Database operations, authentication, real-time subscriptions
- **Available Operations**: Full CRUD, user management, file storage
- **Database**: PostgreSQL 17.4 with automatic REST API generation

**Cloudflare API:**
- **Connection Type**: Global API key with email authentication
- **Usage**: DNS management, zone configuration, analytics
- **Available Operations**: Domain management, cache purging, security settings

**Stripe Payments:**
- **Status**: ✅ Production-ready integration (see `STRIPE_INTEGRATION.md`)
- **Components**: `CheckoutWrapper.tsx`, `PaymentForm.tsx` in `/src/components/checkout/`
- **APIs**: `/api/stripe/create-payment-intent`, `/api/stripe/webhook`
- **Features**: Card/Apple Pay/Google Pay, tax calculation, email notifications

### Current API Layer
```typescript
// src/lib/api/ - Production-ready integrations
- tintingLaws.ts: State law database with compliance checking
- Stripe integration: Complete payment processing (see `STRIPE_INTEGRATION.md`)
- Future: Enhanced Supabase utilities, R2 upload helpers
```

### Database Architecture
**Supabase PostgreSQL (Configured):**
- **Test Tables**: Products, orders, support tickets with full CRUD
- **Connection**: IPv4 session pooler for direct SQL access
- **REST API**: Automatic endpoint generation from schema
- **Real-time**: WebSocket subscriptions available

### Environment Variables
All API integrations are configured via environment variables in `.env`:
```bash
# Cloudflare R2 (S3-compatible storage)
R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_ENDPOINT_URL, R2_PUBLIC_URL

# Cloudflare API (DNS, analytics, cache management)  
CLOUDFLARE_EMAIL, CLOUDFLARE_GLOBAL_API_KEY, CLOUDFLARE_API_BASE_URL

# Supabase (Database + Auth)
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DB_URL, SUPABASE_DB_PASSWORD

# Stripe (Payments - production ready)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
```

### Deployment Configuration
- **Vercel Ready**: Optimized for Vercel deployment with environment variables
- **API Keys**: All services configured with production-ready credentials
- **Performance**: Edge functions, ISR for product pages, CDN integration
- **Monitoring**: Error tracking and performance monitoring setup

## Component Conventions & Standards

### File Organization
```
src/
├── app/                    # Next.js app router pages
├── components/
│   ├── ui/                # Shadcn + custom UI components
│   ├── products/          # Product-specific components  
│   ├── support/           # Support system components
│   └── store/             # E-commerce components
├── lib/
│   ├── api/               # API layer and integrations
│   └── utils.ts           # Utility functions
└── hooks/                 # Custom React hooks
```

### Naming Conventions
- **Components**: PascalCase (`ProductGrid.tsx`)
- **Hooks**: camelCase with `use` prefix (`useCartStore.ts`)
- **Utilities**: camelCase (`siteConfig.ts`)
- **API**: camelCase with descriptive names (`tintingLaws.ts`)

### Code Standards
- **TypeScript**: Strict mode, proper interface definitions
- **ESLint**: Next.js configuration with accessibility rules
- **Prettier**: Tailwind plugin for class sorting
- **Comments**: Minimal comments, self-documenting code preferred

This documentation reflects the current state of a sophisticated, production-ready e-commerce platform with comprehensive business logic, legal compliance, and modern development practices.