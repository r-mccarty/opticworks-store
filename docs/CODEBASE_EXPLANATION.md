# OpticWorks Presence Intelligence Platform - Codebase Architecture

This document provides a comprehensive architectural overview of the OpticWorks Presence Intelligence Platform, a sophisticated Next.js application for intelligent sensing hardware and IoT solutions.

## Executive Overview

**OpticWorks** is a production-ready e-commerce platform specializing in mmWave presence sensing hardware, including bed/under-mattress sensors, bridges, integrator kits, and developer firmware programs. The platform features Apple-grade art direction, cinematic product experiences, complete payment processing, email automation, and a sophisticated component architecture designed for both accessibility and premium brand presentation.

### Core Technology Foundation

- **Framework**: Next.js 15.5.0 with App Router + React 19.1.1
- **Language**: TypeScript 5.9.2 in strict mode (zero `any` types)
- **Styling**: Tailwind CSS 4.1.12 with hybrid component system
- **State Management**: Zustand 5.0.8 with localStorage persistence
- **Package Management**: pnpm (required - not npm/yarn)
- **Backend**: Medusa v2 (Phase 1 deployed, Phase 2 integration in progress)
- **Production Integrations**: Stripe payment processing, Resend email service, Medusa e-commerce API

---

## Architectural Overview

### Next.js App Router Structure

The codebase leverages Next.js 15's App Router with a **domain-driven route organization** that mirrors business functionality rather than technical concerns:

```
src/app/
├── api/                     # Backend API routes (14 endpoints)
│   ├── stripe/              # Payment processing (4 production endpoints)
│   ├── email/               # Email automation (production-ready)
│   ├── analytics/           # Event tracking
│   ├── tax/                 # Tax calculation
│   ├── shipping/            # Shipping rates
│   ├── inventory/           # Stock management
│   └── easypost/            # Address validation
├── store/                   # E-commerce pages (3 routes)
│   ├── cart/                # Shopping cart + checkout
│   └── cart/success/        # Order confirmation
├── support/                 # Customer service system (10 routes)
│   ├── faq/                 # FAQ with search/filtering
│   ├── contact/             # Contact forms
│   ├── warranty/            # Warranty claims
│   ├── legal/               # Legal compliance pages
│   └── ...                  # Additional support routes
├── products/                # Product catalog (2+ routes)
│   └── [slug]/              # Dynamic product pages
├── install-guides/          # Educational content (2 routes)
└── page.tsx                 # Landing page (cinematic hero, 3D assets)
```

**Key Architecture Decision**: Routes are organized by **business domains** (store, support, products) rather than technical layers, improving maintainability and developer understanding of business flows.

---

## Backend Integration: Medusa v2

### Integration Status (2025-11-18)

- ✅ **Phase 1 Complete**: Medusa backend deployed on Hetzner with Cloudflare Tunnel
  - Backend URL: `https://api.optic.works`
  - Admin Dashboard: `https://api.optic.works/app`
  - Store API: `https://api.optic.works/store/*`
  - Health Endpoint: `https://api.optic.works/health`

- 🔧 **Phase 2 In Progress**: Catalog import & storefront integration
  - Product catalog automation ready (`pnpm run catalog:import`)
  - Storefront API client ready (`src/lib/api/medusa.ts`)
  - Blocked by Infisical secret management setup (30-45 min)

### Medusa API Integration Layer

```typescript
// src/lib/api/medusa.ts
import Medusa from "@medusajs/medusa-js"

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BASE_URL || 'https://api.optic.works'
const MEDUSA_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

export const medusaClient = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  maxRetries: 3,
  apiKey: MEDUSA_PUBLISHABLE_KEY
})

// Product fetching
export async function getProducts() {
  try {
    const { products } = await medusaClient.products.list()
    return products
  } catch (error) {
    console.error('Failed to fetch products from Medusa:', error)
    return []
  }
}

// Cart operations
export async function createCart() {
  const { cart } = await medusaClient.carts.create()
  return cart
}

export async function addToCart(cartId: string, variantId: string, quantity: number) {
  const { cart } = await medusaClient.carts.lineItems.create(cartId, {
    variant_id: variantId,
    quantity
  })
  return cart
}

// Checkout session
export async function createPaymentSession(cartId: string) {
  const { cart } = await medusaClient.carts.createPaymentSessions(cartId)
  return cart
}
```

### Hybrid Backend Strategy

The platform implements a **phased migration approach** with both Medusa backend and Next.js API stubs:

**Phase 2 (Current)**: Storefront integrating with Medusa
- Product catalog managed in Medusa admin
- Cart and checkout use Medusa sessions
- Stripe payments coordinated through Medusa
- Next.js API stubs remain for development/testing

**Phase 3+ (Future)**: Full Medusa integration
- All e-commerce logic migrated to Medusa
- Next.js focuses on presentation layer
- Hugo docs site + Discourse forum
- Cloudflare Pages deployment

---

## Component Architecture: Two-Tier System

The platform implements a **sophisticated hybrid component architecture** that balances accessibility requirements with premium brand presentation.

### Tier 1: Shadcn/ui Components (Accessibility-First)

**Location**: `src/components/ui/` (mixed with Tier 2)
**Purpose**: Form primitives, dialogs, interactive elements requiring accessibility compliance
**Pattern**: Radix UI primitives + class-variance-authority (cva) + `cn()` utility

```typescript
// Example: Button component with variants
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md gap-1.5 px-3",
        lg: "h-10 rounded-md gap-2 px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)
```

**Key Components**:
- `button.tsx` - Accessible button with 6 variants
- `form.tsx` - React Hook Form integration with Zod validation
- `input.tsx` - Form inputs with error states
- `dialog.tsx` - Modal dialogs with focus management
- `select.tsx` - Accessible dropdown selections
- `card.tsx` - Content containers with consistent styling

### Tier 2: Custom Business Components (Brand-First)

**Location**: `src/components/ui/` and feature folders
**Purpose**: Hardware-specific features, marketing sections, complex interactive elements
**Pattern**: Custom styling + `cx()` utility + Framer Motion animations

```typescript
// Example: Custom Hero component with premium branding
export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      <VideoBackground videoUrl="https://r2.dev/opticworks-hero-video.mp4" />
      <FadeContainer className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className={cx(
          "font-barlow mt-8 text-center text-8xl font-normal tracking-[1px] text-white drop-shadow-2xl uppercase",
          "md:text-9xl lg:text-[10rem] xl:text-[12rem]"
        )}>
          <FadeSpan>Presence</FadeSpan> <FadeSpan>Intelligence</FadeSpan>
        </h1>
        <FadeDiv className="mt-6 max-w-2xl text-center text-xl text-gray-200">
          Professional mmWave sensing hardware for intelligent presence detection
        </FadeDiv>
      </FadeContainer>
    </section>
  )
}
```

**Key Components**:
- `Hero.tsx` - Landing page hero with video background
- `Features.tsx` - Interactive feature showcase with animations
- `Navbar.tsx` - Navigation with cart integration
- `Map.tsx` - Interactive visualizations
- `ProductViewer.tsx` - Hardware product showcase components

### Component Organization Strategy

```
src/components/
├── ui/                      # Base UI system (Shadcn + Custom mixed)
├── 3d/                      # Three.js/WebGL components (optional)
│   ├── SceneViewer.tsx      # Interactive 3D viewer
│   └── ErrorBoundary.tsx    # 3D-specific error handling
├── checkout/                # Payment flow components
│   ├── CheckoutWrapper.tsx  # Stripe + Medusa session management
│   ├── CheckoutForm.tsx     # Payment form with Elements
│   ├── AddressForm.tsx      # Shipping address collection
│   └── PaymentForm.tsx      # Card payment processing
├── products/                # Product-specific components
│   ├── ProductDetailView.tsx # Product specifications
│   ├── ProductHero.tsx      # Product page headers
│   ├── InstallProcess.tsx   # Installation guides
│   └── duo-pack/            # Feature-specific folders
│       ├── DuoPackHero.tsx  # Duo Pack product hero
│       └── DuoPackFeatures.tsx
├── store/                   # E-commerce components
│   ├── CartPage.tsx         # Shopping cart interface
│   └── ProductGrid.tsx      # Product catalog display
└── support/                 # Customer service components
    ├── FAQAccordion.tsx     # Searchable FAQ system
    ├── ContactForm.tsx      # Support contact forms
    ├── WarrantyClaimForm.tsx # Warranty processing
    └── SupportCategoryGrid.tsx # Support navigation
```

**Architecture Decision**: Components are organized by **business domain** rather than technical type, making it easier for developers to locate and modify features within specific business contexts.

---

## State Management Architecture

The platform uses **Zustand with persistence middleware** implementing a **domain-separated store pattern** that mirrors business operations.

### Shopping Cart Store (`src/hooks/useCart.ts`)

```typescript
interface CartStore {
  items: CartItem[]
  isOpen: boolean
  paymentSession: PaymentSession | null

  // Cart operations
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void

  // Cart calculations
  getTotalItems: () => number
  getTotalPrice: () => number

  // UI state
  setIsOpen: (open: boolean) => void

  // Stripe integration
  setPaymentSession: (sessionId: string) => void
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      paymentSession: null,

      addToCart: (product: Product) => {
        const items = get().items
        const existingItem = items.find(item => item.id === product.id)

        if (existingItem) {
          set({
            items: items.map(item =>
              item.id === product.id
                ? normalizeCartItem(item, item.quantity + 1)
                : normalizeCartItem(item)
            ),
          })
        } else {
          set({
            items: [
              ...items.map(normalizeCartItem),
              normalizeCartItem(product),
            ],
          })
        }

        toast.success(`${product.name} added to cart`)
      },

      // ... other methods
    }),
    {
      name: 'cart-storage',
      version: 1,
      partialize: (state) => ({
        items: state.items,
        paymentSession: state.paymentSession,
      }),
      migrate: (persistedState) => ({
        items: normalizeCartItems(persistedState?.items),
        paymentSession: persistedState?.paymentSession
          ? {
              ...persistedState.paymentSession,
              items: normalizeCartItems(persistedState.paymentSession.items),
            }
          : null,
      }),
    },
  )
)
```

**Key Features**:
- **Selective persistence** - Only essential data saved to localStorage (cart + payment session)
- **Data normalization** - `src/lib/cart/utils.ts` ensures persisted specs/quantities stay valid
- **Optimistic updates** - Immediate UI feedback with toast notifications
- **Payment session tracking** - Stripe integration for checkout flow
- **Type safety** - Complete TypeScript coverage for all operations and migrations

> 📦 **Cart Normalization Utilities**
>
> The new `src/lib/cart` namespace provides `normalizeCartItem`, `normalizeCartItems`, and `summarizeSpecifications` helpers so UI components can tolerate partial data during migrations. These helpers are unit-tested with Vitest (`src/lib/cart/utils.test.ts`).

### Medusa Integration in Cart Store

When Medusa integration is enabled (`NEXT_PUBLIC_MEDUSA_ENABLED=true`), cart operations sync with Medusa backend:

```typescript
addToCart: async (product: Product) => {
  // Local state update (immediate UI feedback)
  const items = get().items
  set({ items: [...items, normalizeCartItem(product)] })

  // Sync with Medusa backend
  if (process.env.NEXT_PUBLIC_MEDUSA_ENABLED === 'true') {
    try {
      const cartId = get().medusaCartId || await createMedusaCart()
      await medusaClient.carts.lineItems.create(cartId, {
        variant_id: product.medusaVariantId,
        quantity: 1
      })
    } catch (error) {
      console.error('Failed to sync with Medusa:', error)
      // Fallback to local-only cart
    }
  }

  toast.success(`${product.name} added to cart`)
}
```

### Support System Store (`src/hooks/useSupportStore.ts`)

```typescript
interface SupportStore {
  // Form state (persisted)
  contactForm: Partial<ContactFormData>
  warrantyForm: Partial<WarrantyFormData>
  preferredContactMethod: 'email' | 'phone' | null

  // Ticket system
  tickets: SupportTicket[]

  // Search and navigation
  searchQuery: string
  selectedCategory: string | null
  searchResults: FAQ[]

  // Session tracking (not persisted)
  currentSession: {
    startTime: number | null
    pageViews: string[]
    searchQueries: string[]
    ticketsCreated: number
  }

  // Form operations
  updateContactForm: (data: Partial<ContactFormData>) => void
  submitTicket: (ticket: CreateTicketRequest) => Promise<SupportTicket>

  // Search operations
  searchFAQs: (query: string) => void
  clearSearch: () => void

  // Session tracking
  trackPageView: (page: string) => void
  trackSearch: (query: string) => void
}
```

**Architecture Decision**: **Complex customer service state** is managed in a single store but with clear domain separation, enabling sophisticated support workflows while maintaining state consistency.

### Checkout State Store (`src/hooks/useCheckoutState.ts`)

```typescript
interface CheckoutState {
  taxAmount: number
  isCalculatingTax: boolean
  shippingAddress: ShippingAddress | null
  subtotal: number
  total: number

  setTaxAmount: (amount: number) => void
  setIsCalculatingTax: (calculating: boolean) => void
  setShippingAddress: (address: ShippingAddress | null) => void
  setSubtotal: (subtotal: number) => void
  updateTotal: () => void
  reset: () => void
}

export const useCheckoutState = create<CheckoutState>((set, get) => ({
  taxAmount: 0,
  isCalculatingTax: false,
  shippingAddress: null,
  subtotal: 0,
  total: 0,

  setTaxAmount: (amount: number) => {
    set({ taxAmount: amount })
    get().updateTotal() // Reactive calculation
  },

  updateTotal: () => {
    const { subtotal, taxAmount } = get()
    set({ total: subtotal + taxAmount })
  },

  // ... other methods
}))
```

**Key Design Decision**: **No persistence for checkout state** - Stripe and Medusa manage payment session state, so local state is ephemeral and resets between sessions.

---

## API Architecture: Hybrid Medusa + Next.js Strategy

The platform implements a **dual-layer API strategy** during the Medusa migration:

### Production-Ready Medusa Integration ✅

**Backend**: `https://api.optic.works`
- Product catalog management
- Cart and checkout sessions
- Order processing
- Customer profiles
- Inventory management

**Storefront API Client**:
```typescript
// Fetch products from Medusa
export async function getProducts() {
  const { products } = await medusaClient.products.list({
    limit: 100,
    expand: 'variants,images'
  })
  return products
}

// Get single product
export async function getProduct(id: string) {
  const { product } = await medusaClient.products.retrieve(id, {
    expand: 'variants,images,options'
  })
  return product
}

// Create checkout session
export async function createCheckout(cartId: string) {
  const { cart } = await medusaClient.carts.complete(cartId)
  return cart
}
```

### Next.js API Endpoints (Production + Stubs)

#### Production-Ready Stripe Integration

**`POST /api/stripe/webhook`** - Payment processing automation
```typescript
export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  try {
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature!, webhookSecret)

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompletion(event.data.object)
        break
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object)
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }
}
```

**`POST /api/stripe/get-session-tax`** - Real-time tax calculation via Stripe Tax
```typescript
export async function POST(request: NextRequest) {
  const { items, shippingAddress } = await request.json()

  const calculation = await stripe.tax.calculations.create({
    currency: 'usd',
    line_items: items.map((item: CartItem) => ({
      amount: Math.round(item.price * item.quantity * 100),
      reference: item.id,
      tax_behavior: 'exclusive' as const,
      tax_code: 'txcd_99999999' // General tangible goods
    })),
    customer_details: {
      address: {
        line1: shippingAddress.line1,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postal_code: shippingAddress.postal_code,
        country: 'US'
      },
      address_source: 'shipping'
    },
    shipping_cost: { amount: 0, tax_behavior: 'exclusive' }
  })

  return NextResponse.json({
    success: true,
    taxAmount: calculation.tax_amount_exclusive / 100,
    subtotal: (calculation.amount_total - calculation.tax_amount_exclusive) / 100,
    total: calculation.amount_total / 100
  })
}
```

#### Email Automation System (Production)

**`POST /api/email/send`** - Resend integration
```typescript
import { render } from '@react-email/render'
import { Resend } from 'resend'
import { OrderConfirmation } from '@/lib/email/templates/OrderConfirmation'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  const { to, subject, template, data } = await request.json()

  try {
    let emailHtml: string

    switch (template) {
      case 'order-confirmation':
        emailHtml = render(<OrderConfirmation {...data} />)
        break
      case 'payment-failed':
        emailHtml = render(<PaymentFailed {...data} />)
        break
      default:
        throw new Error(`Unknown template: ${template}`)
    }

    const result = await resend.emails.send({
      from: 'OpticWorks <orders@notifications.optic.works>',
      to,
      subject,
      html: emailHtml
    })

    return NextResponse.json({
      success: true,
      messageId: result.data?.id
    })
  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
```

### Development Stubs 🔧

The platform includes **sophisticated development stubs** for features not yet migrated to Medusa:

```typescript
// src/app/api/shipping/rates/route.ts
const SHIPPING_CARRIERS = {
  'standard': { name: 'Standard Shipping', baseRate: 5.99, perItem: 1.50, days: '5-7' },
  'expedited': { name: 'Expedited Shipping', baseRate: 12.99, perItem: 2.00, days: '2-3' }
}

export async function POST(request: NextRequest) {
  const { items, shippingAddress } = await request.json()

  // Simulate realistic API delay
  await new Promise(resolve => setTimeout(resolve, 500))

  const rates = Object.entries(SHIPPING_CARRIERS).map(([key, carrier]) => ({
    carrierId: key,
    name: carrier.name,
    rate: carrier.baseRate + (carrier.perItem * items.length),
    estimatedDays: carrier.days
  }))

  return NextResponse.json({ success: true, rates })
}
```

---

## Product Architecture & Hardware Focus

### Product Catalog Structure

```typescript
// src/lib/products.ts
interface Product {
  id: string
  name: string
  category: 'sensor' | 'bridge' | 'kit' | 'accessory' | 'developer'
  price: number
  originalPrice?: number

  specifications: {
    connectivity?: string           // WiFi, Zigbee, etc.
    powerSupply?: string            // USB-C, battery, etc.
    dimensions?: string             // Physical dimensions
    warranty?: string               // Warranty coverage
    certifications?: string[]       // FCC, CE, etc.
    difficulty?: 'Beginner' | 'Intermediate' | 'Professional'
    installationTime?: string       // Estimated setup time
  }

  // Hardware variants
  variants?: Array<{
    id: string
    name: string
    sku: string
    price: number
    specifications?: Partial<Product['specifications']>
  }>

  features: string[]
  description: string
  images: string[]
  videoUrl?: string
  installationGuideUrl?: string
}

// Example: Bed Presence Sensor
export const products: Product[] = [
  {
    id: 'bed-presence-sensor',
    name: 'OpticWorks Bed Presence Sensor',
    category: 'sensor',
    price: 149,

    specifications: {
      connectivity: 'WiFi 2.4GHz + Bluetooth LE',
      powerSupply: 'USB-C (5V 1A)',
      dimensions: '120mm × 80mm × 15mm',
      warranty: '2 years',
      certifications: ['FCC', 'CE', 'RoHS'],
      difficulty: 'Beginner',
      installationTime: '5 minutes'
    },

    features: [
      'mmWave radar technology (60GHz)',
      'Under-mattress installation',
      'Real-time presence detection',
      'Privacy-first (no camera/audio)',
      'Home Assistant integration',
      'Cloud + local processing'
    ],

    description: 'Professional mmWave presence sensor designed for unobtrusive bed occupancy detection...',

    images: [
      'https://r2.dev/bed-sensor-hero.jpg',
      'https://r2.dev/bed-sensor-installed.jpg'
    ],
    videoUrl: 'https://r2.dev/bed-sensor-demo.mp4',
    installationGuideUrl: '/install-guides/bed-presence-sensor'
  }
  // ... additional hardware products
]
```

### Medusa Product Sync

Products are managed in Medusa and synced to the storefront:

```typescript
// Fetch products from Medusa with local fallback
export async function getProductCatalog() {
  if (process.env.NEXT_PUBLIC_MEDUSA_ENABLED === 'true') {
    try {
      const medusaProducts = await medusaClient.products.list()
      return medusaProducts.products
    } catch (error) {
      console.error('Failed to fetch from Medusa, using local catalog:', error)
      return products // Fallback to local catalog
    }
  }
  return products
}
```

---

## Checkout Flow Architecture

### Hybrid Stripe + Medusa Checkout

The platform integrates **Stripe Elements** with **Medusa cart sessions** for a seamless checkout experience:

```typescript
// src/components/checkout/CheckoutWrapper.tsx
export default function CheckoutWrapper({ onPaymentSuccess, onError }: CheckoutWrapperProps) {
  const [checkout, setCheckout] = useState<StripeCheckout | null>(null)
  const { items, medusaCartId } = useCart()

  useEffect(() => {
    async function initializeCheckout() {
      try {
        // Option 1: Medusa-managed checkout (Phase 2+)
        if (process.env.NEXT_PUBLIC_MEDUSA_ENABLED === 'true' && medusaCartId) {
          const paymentSession = await medusaClient.carts.createPaymentSessions(medusaCartId)
          const clientSecret = paymentSession.cart.payment_sessions[0].data.client_secret

          const checkoutInstance = await stripe.initCheckout({
            fetchClientSecret: async () => clientSecret,
            elementsOptions: { /* styling */ }
          })

          setCheckout(checkoutInstance)
        }
        // Option 2: Direct Stripe checkout (Phase 1)
        else {
          const response = await fetch('/api/stripe/create-checkout-session', {
            method: 'POST',
            body: JSON.stringify({ items })
          })
          const { clientSecret } = await response.json()

          const checkoutInstance = await stripe.initCheckout({
            fetchClientSecret: async () => clientSecret,
            elementsOptions: { /* styling */ }
          })

          setCheckout(checkoutInstance)
        }
      } catch (error) {
        console.error('Checkout initialization error:', error)
        onError('Failed to initialize checkout')
      }
    }

    initializeCheckout()
  }, [items, medusaCartId])

  return (
    <div className="checkout-container">
      {checkout ? (
        <CheckoutForm checkout={checkout} onPaymentSuccess={onPaymentSuccess} />
      ) : (
        <LoadingState />
      )}
    </div>
  )
}
```

---

## Error Handling & User Experience

### Comprehensive Error Boundary Strategy

```typescript
// src/components/3d/ErrorBoundary.tsx
export default class ThreeDErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('3D Component Error:', error, errorInfo)

    if (process.env.NODE_ENV === 'production') {
      // Track error for analytics
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
          <h3 className="text-lg font-semibold">3D Viewer Unavailable</h3>
          <p className="text-gray-600">
            The 3D viewer encountered an error. Product images are still available below.
          </p>
          <Button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </Button>
        </Card>
      )
    }

    return this.props.children
  }
}
```

### Loading States and Skeleton UI

```typescript
// src/components/skeletons/order-success-skeleton.tsx
export function OrderSuccessSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header skeleton */}
        <div className="text-center space-y-4 mb-8">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse" />
        </div>

        {/* Order details skeleton */}
        <Card>
          <CardContent className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

---

## Performance Optimization Strategies

### Next.js Configuration

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-e97850e2b6554798b4b0ec23548c975d.r2.dev', // Cloudflare R2
        pathname: '/**',
      }
    ],
  },

  transpilePackages: ['three'],

  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ['raw-loader'],
    });
    return config;
  },

  experimental: {
    optimizeCss: true,
    gzipSize: true
  }
};
```

### Component Optimization

```typescript
// Lazy load heavy 3D components
const SceneViewer = lazy(() => import('@/components/3d/SceneViewer'))

function ProductPage() {
  return (
    <div>
      <ProductHero product={product} />
      <ProductDetails product={product} />

      <Suspense fallback={<ViewerSkeleton />}>
        <ThreeDErrorBoundary>
          <SceneViewer modelId={product.id} />
        </ThreeDErrorBoundary>
      </Suspense>
    </div>
  )
}
```

---

## Security Implementation

### API Security Patterns

```typescript
// Webhook signature verification
export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    await processWebhookEvent(event)
    return NextResponse.json({ received: true })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }
}
```

### Input Validation with Zod

```typescript
import { z } from 'zod'

export const ContactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  subject: z.enum(['general', 'order', 'technical', 'warranty']),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000)
})

export type ContactFormData = z.infer<typeof ContactFormSchema>
```

### Environment Variable Management

```typescript
// Centralized environment validation
const requiredEnvVars = {
  // Stripe (Production)
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,

  // Medusa (Production)
  NEXT_PUBLIC_MEDUSA_BASE_URL: process.env.NEXT_PUBLIC_MEDUSA_BASE_URL,
  NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,

  // Email (Production)
  RESEND_API_KEY: process.env.RESEND_API_KEY
}

export function validateEnvironment() {
  const missing = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key, _]) => key)

  if (missing.length > 0 && process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}
```

---

## Development Workflow & Quality Assurance

### TypeScript Strict Mode

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Code Quality Tools

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "plugin:accessibility/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "prefer-const": "error"
  }
}
```

### Development Scripts

```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "stripe:listen": "stripe listen --forward-to localhost:3000/api/stripe/webhook"
  }
}
```

---

## Conclusion

The **OpticWorks Presence Intelligence Platform** represents a sophisticated, production-ready application that balances modern web development practices with deep hardware domain specialization. Key architectural strengths include:

### Technical Excellence
- **Type-safe architecture** with comprehensive TypeScript coverage
- **Production-ready integrations** for Medusa e-commerce, Stripe payments, and email automation
- **Sophisticated component system** balancing accessibility and premium branding
- **Performance optimization** with lazy loading, caching, and efficient state management
- **Error resilience** with comprehensive error boundaries and graceful degradation

### Business Value
- **Hardware specialization** with deep IoT and presence sensing expertise
- **Complete e-commerce flow** from product discovery to order fulfillment via Medusa
- **Premium user experience** with cinematic visuals and interactive features
- **Scalable backend** with Medusa v2 providing production-grade infrastructure
- **Privacy-first messaging** aligned with mmWave sensing value proposition

### Development Experience
- **Clear architectural patterns** enabling team productivity
- **Comprehensive documentation** for onboarding and maintenance
- **Hybrid development approach** (Medusa + stubs) allowing parallel frontend/backend work
- **Quality assurance** with strict typing, linting, and testing patterns
- **Scalable structure** supporting feature growth and team expansion

### Migration Roadmap
- ✅ **Phase 1**: Medusa backend deployed with Ansible IaC
- 🔧 **Phase 2**: Catalog import + storefront integration (in progress, blocked by Infisical setup)
- 📋 **Phase 3**: Hugo docs site + Discourse forum + CI hardening
- 📋 **Phase 4**: Cloudflare Pages production deployment + webhook buffering

This codebase serves as an excellent foundation for a specialized IoT hardware business, demonstrating how modern web technologies can be applied to create sophisticated, domain-specific applications that deliver real business value.
