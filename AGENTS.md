# AGENTS.md

This file provides comprehensive guidance for AI coding agents working on the **OpticWorks Window Tinting E-commerce Platform**.

## Project Overview

**OpticWorks Window Tinting E-commerce Platform** is a specialized, production-ready e-commerce solution focusing on DIY window tinting for Tesla and automotive applications.

### Key Business Context
- **Target Market**: Tesla owners, automotive enthusiasts, DIY installers
- **Products**: Pre-cut ceramic films (CyberShade IRX™), installation kits, professional tools
- **Specialization**: Tesla Model Y focus with "Foolproof DIY" methodology
- **Legal Compliance**: Built-in state tinting law checker and VLT compliance system
- **Revenue Model**: Premium DIY kits with "Oops Protection" warranty program

### Technology Architecture
- **Framework**: Next.js 15.5.0 with App Router + React 19.1.1
- **Language**: TypeScript 5.9.2 (strict mode - NO `any` types allowed)
- **Styling**: Tailwind CSS 4.1.12 with two-tier component system
- **State Management**: Zustand 5.0.8 with localStorage persistence
- **Package Manager**: pnpm (REQUIRED - not npm/yarn)

## Critical Development Commands

```bash
# ALWAYS use pnpm - never npm or yarn
pnpm install        # Install dependencies
pnpm run dev        # Development server (http://localhost:3000)
pnpm run build      # Production build (REQUIRED before commits)
pnpm run lint       # Code quality check (REQUIRED before commits)
pnpm run start      # Production server
```

**🚨 CRITICAL RULE**: Always run `pnpm run lint` AND `pnpm run build` before making any commits. The project has strict TypeScript and ESLint rules that must pass.

## Codebase Architecture

### Directory Structure & Purpose

```
src/
├── app/                          # Next.js App Router (20 pages + 12 API routes)
│   ├── api/                     # Backend API endpoints
│   │   ├── stripe/              # ✅ PRODUCTION: Payment processing 
│   │   ├── email/               # ✅ PRODUCTION: Email service
│   │   ├── shipping/            # 🔄 STUB: Shipping rates
│   │   └── analytics/           # 🔄 STUB: User tracking
│   ├── store/                   # E-commerce pages (cart, checkout, success)
│   ├── products/                # Product catalog with dynamic routes
│   ├── support/                 # Customer service system (8 routes)
│   ├── install-guides/          # Installation tutorials
│   └── page.tsx                 # Tesla-focused landing page
├── components/                   # Two-tier component architecture
│   ├── ui/                      # Mixed: Shadcn/ui + Custom components
│   ├── checkout/                # ✅ PRODUCTION: Stripe payment flow
│   ├── store/                   # E-commerce components
│   ├── support/                 # Customer service components
│   ├── products/                # Tesla-specific components
│   └── 3d/                      # Three.js Tesla 3D viewer
├── hooks/                       # 3 Zustand stores with persistence
│   ├── useCart.ts              # Shopping cart state (persistent)
│   ├── useCheckoutState.ts     # Payment flow state (ephemeral)
│   └── useSupportStore.ts      # Customer service state (persistent)
├── lib/                         # Utilities and business logic
│   ├── api/                     # Service layer functions
│   ├── email/                   # ✅ PRODUCTION: React Email templates
│   ├── utils.ts                 # cx(), cn() utilities
│   └── products.ts              # Product catalog (11 Tesla-focused items)
└── docs/                        # Developer documentation
    ├── CODEBASE_EXPLANATION.md  # Architecture deep dive
    ├── STATE_MANAGEMENT.md      # Zustand patterns
    ├── API_STUBS.md            # Complete API documentation
    └── STRIPE_INTEGRATION.md   # Payment processing guide
```

## Component Architecture: Two-Tier System

### CRITICAL: Understanding the Component Hierarchy

**Tier 1: Shadcn/ui Components** (Accessibility-First)
- **Location**: `src/components/ui/` (mixed with Tier 2)
- **Purpose**: Forms, dialogs, buttons, inputs - ACCESSIBILITY REQUIRED
- **Pattern**: Radix UI primitives + class-variance-authority + `cn()` utility
- **Examples**: `button.tsx`, `form.tsx`, `input.tsx`, `dialog.tsx`

```typescript
// CORRECT: Shadcn component pattern
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Form, FormField } from "@/components/ui/form"

// Use cn() for Shadcn components
<Button className={cn("base-styles", isActive && "active-variant")}>
```

**Tier 2: Custom Business Components** (Brand-First)
- **Location**: `src/components/ui/` (mixed with Tier 1) 
- **Purpose**: Marketing, Tesla-specific features, business logic
- **Pattern**: Custom styling + `cx()` utility + Framer Motion
- **Examples**: `Hero.tsx`, `Features.tsx`, `Navbar.tsx`, `Tesla3DViewer.tsx`

```typescript
// CORRECT: Custom component pattern
import { cx } from "@/lib/utils"
import { FadeContainer, FadeDiv } from "@/components/Fade"

// Use cx() for custom components
<section className={cx("custom-styles", isVisible && "fade-in")}>
```

### CRITICAL DISTINCTION: When to Use Which Tier

**Use Shadcn (Tier 1) for:**
- All forms and form inputs
- Dialogs, modals, dropdowns
- Buttons with semantic meaning
- Data tables and lists
- Accessibility-critical UI

**Use Custom (Tier 2) for:**
- Marketing sections and landing pages
- Tesla-specific visualizations
- Product displays and galleries
- Navigation and branding
- Complex interactive elements

## State Management: Zustand with Persistence

### Shopping Cart (`src/hooks/useCart.ts`) - PERSISTENT
```typescript
const { addToCart, items, getTotalPrice, clearCart, paymentSession } = useCart()

// Key features:
// - localStorage persistence ('cart-storage' key)
// - Optimistic UI updates with Sonner toast
// - Payment session tracking for Stripe
// - Automatic cart clearing after successful payment
```

### Checkout State (`src/hooks/useCheckoutState.ts`) - EPHEMERAL
```typescript
const { taxAmount, isCalculatingTax, shippingAddress, total, updateTotal } = useCheckoutState()

// Key features:
// - NO persistence (Stripe manages session state)
// - Real-time tax calculation
// - Address validation integration
// - Reactive total calculations
```

### Support System (`src/hooks/useSupportStore.ts`) - PERSISTENT
```typescript
const { tickets, submitTicket, contactForm, warrantyForm, currentSession } = useSupportStore()

// Key features:
// - In-memory ticket system with CRUD
// - Form data persistence (prevent data loss)
// - Session analytics (page views, searches)
// - User preference persistence
```

## Checkout Flow: Hybrid Stripe Integration

### CRITICAL: Understanding the Payment Architecture

The checkout system uses a **sophisticated hybrid approach**:
1. **Stripe Checkout Sessions** → Tax calculation, backend processing, invoice generation
2. **Stripe Elements** → Custom UI control, brand consistency, UX optimization

### Payment Flow Stages

1. **Cart Review** (`/store/cart`)
   - Adaptive layouts (single item enhanced, multi-item compact)
   - "Calculated at checkout" for tax display
   - Real-time quantity updates with persistence

2. **Checkout Initialization** (`CheckoutWrapper.tsx`)
   - Creates Stripe session via `/api/stripe/create-checkout-session`
   - Custom font loading (Colfax) via Stripe Elements
   - Environment validation and error handling

3. **Address & Tax Collection** (`CheckoutForm.tsx`)
   - Stripe AddressElement with autocomplete
   - Real-time tax calculation via `/api/stripe/get-session-tax`
   - Email input for receipt delivery

4. **Payment Processing**
   - Stripe PaymentElement for card details
   - `checkout.confirm()` for payment submission
   - Session ID capture for success page

5. **Order Confirmation** (`/store/cart/success`)
   - Order details from paymentSession state
   - Dual email confirmation system (webhook + backup)
   - Cart clearing and state reset

### Key Checkout Components
- `CheckoutWrapper.tsx` → Stripe initialization and session management
- `CheckoutForm.tsx` → Main payment form with Elements integration
- `AddressForm.tsx` → Address collection (legacy - replaced by Elements)
- `PaymentForm.tsx` → Card processing (legacy - replaced by Elements)

## API Architecture: Production vs Stubs

### PRODUCTION-READY APIS (✅ LIVE)

**Stripe Payment Processing**
```bash
# Environment variables required
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

**Email Service (React Email + Resend)**
```bash
# FULLY FUNCTIONAL email delivery
RESEND_API_KEY=re_xxxxx
NEXT_PUBLIC_FROM_EMAIL=OpticWorks <orders@notifications.optic.works>
```

**Key Production Endpoints:**
- `POST /api/stripe/create-checkout-session` - Creates payment session
- `POST /api/stripe/webhook` - Handles payment completion + emails
- `POST /api/stripe/get-session-tax` - Real-time tax calculation
- `POST /api/email/send` - Professional email template delivery

### DEVELOPMENT STUBS (🔄 MOCK DATA)

**Characteristics of ALL stub APIs:**
- Realistic delays (300-800ms) to simulate network conditions
- Comprehensive error handling with proper HTTP status codes
- TypeScript interfaces matching production data models
- Mock data representing real business scenarios

**Key Stub Endpoints:**
- `POST /api/shipping/rates` - Multi-carrier shipping quotes
- `POST /api/inventory/check` - Stock availability checking
- `POST /api/analytics/events` - User behavior tracking

### Service Layer (`src/lib/api/`)

**Business Logic Functions:**
- `tintingLaws.ts` - Complete legal compliance system (4 states)
- `orders.ts` - Order management with tracking simulation
- `billing.ts` - Invoice handling and refund processing
- `email.ts` - ✅ PRODUCTION email template functions
- `compatibility.ts` - Vehicle compatibility checking

## Critical Business Domain Knowledge

### Tesla Specialization Context

**Primary Vehicle Focus:**
- Tesla Model Y (2025+ Juniper) - PRIMARY TARGET
- Tesla Model 3 - Secondary focus
- Tesla Model S & X - Premium market

**Legal Compliance Requirements:**
- **VLT Compliance**: Visible Light Transmission percentage validation
- **State Laws**: Real-time checking against 50 state regulations
- **Risk Assessment**: Legal violation warnings and penalties
- **Medical Exemptions**: Documentation and approval processes

**Product Categories:**
1. **Films** - Pre-cut ceramic films with VLT variants (20%, 35%, 50%, 70%)
2. **Kits** - Complete installation packages with tools
3. **Tools** - Professional squeegees, heat guns, knives
4. **Accessories** - Cleaning solutions, protective gear

### Key Products (src/lib/products.ts)
- **CyberShade IRX™ Tesla Model Y Kit** - Flagship product ($299-399)
- **CyberShade IRX™ Film Series** - VLT variants ($89-149)
- **Professional Installation Tools** - Heat guns, squeegees ($29-149)
- **Tesla-Specific Accessories** - Trim tools, cleaning kits ($15-49)

## Development Patterns & Requirements

### TypeScript Strict Mode Rules

```typescript
// ❌ NEVER ALLOWED - Will fail build
function badFunction(data: any) { ... }
const badVar: any = someData

// ✅ REQUIRED - Proper typing
interface UserData {
  name: string
  email: string
}
function goodFunction(data: UserData) { ... }
```

### Form Development Pattern (REQUIRED)

```typescript
// ALWAYS use this pattern for forms
const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10)
})

const form = useForm<FormData>({
  resolver: zodResolver(schema)
})

// Use Shadcn Form components
<Form {...form}>
  <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

### API Development Pattern (REQUIRED)

```typescript
// Standard API route structure
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.requiredField) {
      return NextResponse.json(
        { error: 'Missing required field: requiredField' },
        { status: 400 }
      )
    }
    
    // Simulate realistic delay
    await new Promise(resolve => setTimeout(resolve, 600))
    
    return NextResponse.json({
      success: true,
      data: result
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    )
  }
}
```

## Environment Configuration

### Required Environment Variables

```bash
# STRIPE (PRODUCTION READY)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx  # Public key for client
STRIPE_SECRET_KEY=sk_live_xxxxx                   # Secret key for server
STRIPE_WEBHOOK_SECRET=whsec_xxxxx                 # Webhook signature verification

# EMAIL SERVICE (PRODUCTION READY)
RESEND_API_KEY=re_xxxxx                          # Resend API key
NEXT_PUBLIC_FROM_EMAIL=OpticWorks <orders@notifications.optic.works>

# DATABASE (INTEGRATION READY)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# CDN STORAGE (INTEGRATION READY)
CLOUDFLARE_EMAIL=xxxxx
CLOUDFLARE_GLOBAL_API_KEY=xxxxx
R2_ACCESS_KEY_ID=xxxxx

# DEVELOPMENT SERVICES (FUTURE)
EASYPOST_API_KEY=EZTK_xxxxx
TAXJAR_API_KEY=xxxxx
```

## Critical Dependencies & Usage

### Core Framework Stack
```json
{
  "next": "15.5.0",              // App Router + React 19 support
  "react": "19.1.1",             // Latest stable
  "typescript": "5.9.2",         // Strict mode enabled
  "tailwindcss": "4.1.12",       // Latest v4 with minimal config
  "pnpm": "REQUIRED"             // Package manager (not npm/yarn)
}
```

### State & Forms
```json
{
  "zustand": "5.0.8",                    // Primary state management
  "react-hook-form": "7.62.0",           // Form handling (REQUIRED)
  "zod": "4.1.0",                        // Validation schemas (REQUIRED)
  "class-variance-authority": "0.7.1",   // Component variants
  "sonner": "1.5.0"                      // Toast notifications
}
```

### Business Integrations (PRODUCTION)
```json
{
  "@stripe/stripe-js": "7.9.0",         // Client-side Stripe
  "@stripe/react-stripe-js": "3.9.2",   // React Stripe components  
  "stripe": "18.4.0",                   // Server-side Stripe
  "resend": "6.0.1",                    // Email service
  "@react-email/components": "0.5.1"     // Email templates
}
```

### UI System
```json
{
  "framer-motion": "12.23.12",          // Animations (extensive use)
  "@radix-ui/react-*": "^2.x",          // Accessible primitives
  "clsx": "2.1.1",                      // Conditional classes  
  "tailwind-merge": "2.6.0",            // Class deduplication
  "lucide-react": "0.541.0"             // Icon system
}
```

## Code Quality & Testing Requirements

### Pre-Commit Checklist (REQUIRED)

```bash
# MUST pass before any commit
1. pnpm run lint    # ESLint + TypeScript validation
2. pnpm run build   # Production build verification
3. Manual testing   # Key user flows work correctly
```

### Accessibility Requirements (CRITICAL)

- **ALWAYS use Shadcn components for forms** - they have proper ARIA labels
- **Keyboard navigation must work** - test all interactive elements
- **Color contrast compliance** - use theme colors, not hardcoded values
- **Screen reader support** - proper heading hierarchy, alt text for images

### Performance Requirements

- **Next.js Image optimization** - ALWAYS use `<Image>` component
- **Lazy loading** - Heavy components should use React.lazy()  
- **Error boundaries** - Especially for 3D Tesla viewer components
- **Loading states** - All async operations need loading feedback

## Business Logic Implementation Guidelines

### Tesla-Specific Features

When implementing vehicle-related features:

```typescript
// ALWAYS validate VLT compliance
const compliance = await checkTintCompliance(
  stateCode,      // US state code (CA, TX, FL, NY supported)
  vltPercentage,  // 20, 35, 50, 70
  windowType      // 'front-side' | 'back-side' | 'rear'
)

// Product data structure
interface Product {
  teslaCompatible: boolean        // Tesla-specific flag
  specifications: {
    vlt?: string                 // Required for films
    difficulty: 'Beginner' | 'Intermediate' | 'Professional'
    warranty: string             // Warranty coverage
  }
}
```

### Legal Compliance Integration

```typescript
// State law checking (REQUIRED for all film products)
interface TintingLaw {
  state: string
  frontSideWindows: { minVlt: number; maxVlt: number }
  backSideWindows: { minVlt: number; maxVlt: number }
  rearWindow: { minVlt: number; maxVlt: number }
  penalties: { firstOffense: string; repeatOffense: string }
  medicalExemptions: boolean
}
```

## Email System (PRODUCTION READY) ✅

### Template Usage

```typescript
// Order confirmation (PRODUCTION READY)
await sendOrderConfirmation({
  customerEmail: "customer@example.com",
  orderNumber: "OP-2024-001",
  items: [{ name: "CyberShade IRX Model Y", quantity: 1, price: 299 }],
  subtotal: 299,
  tax: 26.91,
  total: 325.91,
  shippingAddress: { /* complete address */ }
})

// Templates available:
// - OrderConfirmation.tsx (✅ PRODUCTION)
// - PaymentFailed.tsx (✅ PRODUCTION)  
// - ShippingNotification.tsx (🔄 TEMPLATE READY)
// - SupportResponse.tsx (🔄 TEMPLATE READY)
```

## Common Pitfalls & Solutions

### ❌ COMMON MISTAKES

```typescript
// DON'T - Wrong utility function
import { cn } from "@/lib/utils"
<div className={cn("custom-hero-styles")}>  // cn is for Shadcn only

// DON'T - Any types
function processData(data: any) { ... }

// DON'T - Non-persistent checkout state
const checkoutStore = persist(...)  // Checkout state should be ephemeral

// DON'T - Direct API calls without stubs
await fetch('/real-external-api')  // Use stub patterns
```

### ✅ CORRECT PATTERNS

```typescript
// DO - Correct utility function
import { cx } from "@/lib/utils"
<div className={cx("custom-hero-styles")}>  // cx for custom components

// DO - Proper TypeScript
interface OrderData {
  orderNumber: string
  items: CartItem[]
}
function processOrder(data: OrderData) { ... }

// DO - Proper state management
const cartStore = persist(...)     // Cart state IS persistent
const checkoutStore = create(...) // Checkout state is NOT persistent

// DO - Use stub patterns
await new Promise(resolve => setTimeout(resolve, 600))
return mockData
```

## Working with Existing Code

### When Adding Features

1. **Check existing patterns first** - Look for similar implementations
2. **Use established stores** - Don't create new state unless necessary
3. **Follow component tiers** - Shadcn for forms, custom for business logic
4. **Maintain Tesla focus** - New features should align with automotive specialization
5. **Update related documentation** - Keep docs/ folder current

### When Fixing Bugs

1. **Understand data flow** - Check both client state (Zustand) and API layer
2. **Test across all 20 routes** - Ensure changes don't break other pages
3. **Verify TypeScript compilation** - Fix any type errors introduced
4. **Test mobile responsiveness** - All components must work on mobile
5. **Check email integration** - Ensure order confirmations still work

### When Integrating APIs

1. **Start with stubs** - All endpoints have development stubs
2. **Follow existing patterns** - Look at production Stripe integration
3. **Maintain mock data quality** - Keep realistic business scenarios
4. **Plan for production transition** - Comment production integration points
5. **Test error handling** - Stubs should simulate various error conditions

## Documentation References

### Essential Reading (docs/ folder)

- **`CODEBASE_EXPLANATION.md`** - Architecture overview and development patterns
- **`STATE_MANAGEMENT.md`** - Detailed Zustand implementation with persistence
- **`API_STUBS.md`** - Complete API catalog with integration points
- **`STRIPE_INTEGRATION.md`** - Production-ready payment processing guide

### Configuration Files

- **`next.config.ts`** - Image optimization, Three.js support, shader loading
- **`tailwind.config.js`** - Minimal v4 configuration
- **`src/app/siteConfig.ts`** - Route definitions and metadata
- **`package.json`** - Dependency management and scripts

This OpticWorks platform represents a sophisticated, production-ready e-commerce solution optimized for Tesla automotive specialization, complete payment integration, and modern development practices. When working on this codebase, always maintain the high-quality standards, Tesla community focus, and production-ready architecture that defines this platform.