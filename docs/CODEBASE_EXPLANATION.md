# OpticWorks Window Tinting E-commerce Platform

## Overview

This is a full-featured e-commerce platform specializing in DIY window tinting solutions for Tesla and automotive applications. Built with Next.js 15, TypeScript, and modern web technologies, it provides a complete business solution from product catalog to payment processing.

## Architecture

### Core Technology Stack

- **Framework**: Next.js 15.5.0 with App Router and React 19
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS 4.1.12 with hybrid UI system
- **Package Manager**: pnpm
- **State Management**: Zustand with persistence
- **Payments**: Stripe integration with on-site checkout
- **Backend Services**: Supabase, Cloudflare R2, Stripe APIs

### Project Structure

```
src/
├── app/                    # Next.js app router (16+ pages)
│   ├── products/          # Product catalog and detail pages
│   ├── store/             # E-commerce storefront and cart
│   ├── support/           # Customer support system
│   └── install-guides/    # Installation tutorials
├── components/
│   ├── ui/                # 26 UI components (Shadcn + custom)
│   ├── products/          # Product-specific components
│   ├── support/           # Support system components
│   └── store/             # Shopping cart and checkout
├── lib/
│   ├── api/               # API integrations and utilities
│   └── utils.ts           # Shared utility functions
└── hooks/                 # Custom React hooks
```

## How It Works

### E-commerce Flow

1. **Product Discovery** (`/products`)
   - 11 products across film/kit/tool/accessory categories
   - Filtering by VLT percentage, Tesla compatibility
   - Product detail pages with specifications and pricing

2. **Shopping Cart** (`/store/cart`)
   - Zustand-powered state management
   - Persistent cart across sessions
   - Real-time price calculations

3. **Checkout Process** (`/store/checkout`)
   - Complete Stripe integration
   - On-site payment (no redirects)
   - Support for cards, Apple Pay, Google Pay
   - Automatic tax calculation

### UI System Architecture

The platform uses a hybrid UI approach:

**Shadcn/ui Components** (10 components)
- Modern, accessible primitives using Radix UI
- Form handling with React Hook Form + Zod validation
- Button variants, dialogs, inputs, selects

**Custom Business Components** (16 components)
- Tremor-inspired design system
- Marketing components (Hero, Features, Testimonials)
- Interactive elements (maps, analytics visualizations)

### State Management

**Zustand Stores**:
- **Cart Store**: Shopping cart items, quantities, pricing
- **Support Store**: Customer tickets, FAQ data
- **Form State**: Contact forms, warranty claims

All stores use persistence middleware to maintain state across browser sessions.

### Support System

**Customer Service Features**:
- FAQ database with search and filtering
- Contact forms with file upload capability
- Warranty claim processing
- "Oops Protection" replacement program

**Legal Compliance**:
- State-by-state tinting law checker
- GDPR/CCPA compliant privacy policy
- Comprehensive terms of service

### API Integrations

**Production-Ready Services**:
- **Stripe**: Complete payment processing with webhooks
- **Supabase**: PostgreSQL database with REST API
- **Cloudflare R2**: CDN and file storage
- **Cloudflare API**: DNS and cache management

### Data Layer

**Product Management**:
```typescript
interface Product {
  id: string
  name: string
  category: 'film' | 'kit' | 'tool' | 'accessory'
  vlt?: number // Visible Light Transmission
  teslaCompatible: boolean
  specifications: object
  pricing: object
}
```

**Business Logic**:
- VLT percentage calculations for legal compliance
- Heat rejection specifications
- Tesla Model Y specialization
- Installation difficulty ratings

## Key Features

### Tesla Specialization
- Pre-cut ceramic films for Tesla Model Y
- Model-specific installation guides
- Tesla community testimonials and case studies

### Legal Compliance System
- Interactive state law checker
- VLT requirement validation
- Penalty and restriction information
- Real-time compliance verification

### Professional Installation Support
- Step-by-step video guides
- Tool recommendations and kits
- "Foolproof DIY" methodology
- Expert support system

## Development Workflow

### Component Development Patterns

**Shadcn Components**: Use for forms and primitives
```typescript
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
```

**Custom Components**: Use for business logic
```typescript
import { cx } from "@/lib/utils"
import { FadeContainer } from "@/components/Fade"
```

### Form Handling Standard
```typescript
// React Hook Form + Zod validation pattern
const form = useForm({
  resolver: zodResolver(schema)
})
```

### State Management Pattern
```typescript
// Zustand with persistence
export const useStore = create()(
  persist((set) => ({
    // state and actions
  }), { name: 'store-name' })
)
```

## Performance & Optimization

- **Image Optimization**: Next.js Image component with WebP/AVIF
- **Bundle Splitting**: Automatic code splitting via Next.js
- **Font Loading**: Custom fonts with CSS variables and fallbacks
- **Animations**: Motion library for smooth transitions
- **CDN**: Cloudflare R2 for global asset delivery

## Security & Privacy

- **Payment Security**: PCI-compliant Stripe integration
- **Data Protection**: GDPR/CCPA compliant handling
- **API Security**: Service role keys and environment variables
- **Input Validation**: Zod schemas for all forms

## Business Model

**Target Market**: Tesla owners, automotive enthusiasts, DIY installers
**Revenue Streams**: 
- Pre-cut tinting films
- Installation kits and tools
- Professional accessories
- Installation support services

**Competitive Advantages**:
- Tesla specialization
- State law compliance automation
- Comprehensive support system
- "Foolproof DIY" positioning

This platform combines modern web development practices with specialized automotive industry knowledge to create a comprehensive e-commerce solution for the window tinting market.