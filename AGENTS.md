# AGENTS.md

This file provides comprehensive guidance for AI coding agents working on the OpticWorks Window Tinting E-commerce Platform.

## Project Overview

**OpticWorks Window Tinting E-commerce Platform** is a specialized e-commerce solution focusing on DIY window tinting for Tesla and automotive applications.

**Key Business Focus:**
- **Target Market**: Tesla owners, automotive enthusiasts, DIY installers
- **Products**: Pre-cut ceramic films, installation kits, professional tools
- **Specialization**: Tesla Model Y with "Foolproof DIY" methodology
- **Compliance**: Built-in state tinting law checker and VLT compliance

**Architecture**: Next.js 15 with App Router, TypeScript, Tailwind CSS, Zustand state management

## Development Commands

This project uses **pnpm** as the package manager:

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

**Critical**: Always run `pnpm run lint` before making commits. The project uses strict TypeScript and ESLint rules.

## Code Style & Architecture

### Component Architecture

**Two-Tier Component System** - Follow these patterns strictly:

1. **Shadcn/ui Components** (`src/components/ui/` - primitives)
   ```typescript
   import { cn } from "@/lib/utils"
   import { Button } from "@/components/ui/button"
   
   // Use cn() utility for className merging
   className={cn("base-styles", conditional && "variant")}
   ```
   - Use for: Forms, dialogs, buttons, inputs, accessibility-focused components
   - Pattern: Radix UI primitives + cva variants + `cn()` utility

2. **Custom Business Components** (`src/components/ui/` - domain-specific)
   ```typescript
   import { cx } from "@/lib/utils"
   import { FadeContainer, FadeDiv } from "@/components/Fade"
   
   // Use cx() utility for custom styling
   className={cx("custom-styles", conditional && "variant")}
   ```
   - Use for: Marketing sections, Tesla-specific features, business logic
   - Pattern: Custom styling + `cx()` utility + Framer Motion

### TypeScript Requirements

- **Strict Mode**: Always enabled - no `any` types allowed
- **Interface Definitions**: All props and data structures must be properly typed
- **Form Validation**: Use Zod schemas with React Hook Form

```typescript
// Example form pattern
const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10)
})

const form = useForm<ContactFormData>({
  resolver: zodResolver(contactSchema)
})
```

### State Management

**Zustand with Persistence** - Follow established patterns:

```typescript
// Example store pattern
export const useExampleStore = create<ExampleStore>()(
  persist(
    (set, get) => ({
      // state and actions
    }),
    {
      name: 'example-storage',
      partialize: (state) => ({ /* only persist what's needed */ })
    }
  )
)
```

**Existing Stores:**
- `useCart` - Shopping cart with localStorage persistence
- `useSupportStore` - Customer service tickets and FAQ state

## Development Patterns

### API Development

**Two-Layer API System:**
1. **Next.js API Routes** (`src/app/api/`) - HTTP endpoints
2. **Service Functions** (`src/lib/api/`) - Business logic

**All APIs are development stubs** with realistic delays and mock data:

```typescript
// Standard API pattern
export async function fetchData(): Promise<DataType> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800))
  return mockData
}
```

**Production Integration Points:**
- Stripe (production-ready)
- Supabase (stubs with integration examples)
- Resend (email service stubs)

### Error Handling

**Consistent Error Response Pattern:**
```typescript
// API routes
return NextResponse.json(
  { error: 'Descriptive error message' },
  { status: 400 }
)

// Service functions
throw new Error('Descriptive error message')
```

### Image & Asset Management

**Current Setup:**
- Development: Gradient placeholders via `src/lib/gradients.ts`
- Production Ready: Cloudflare R2 CDN integration configured
- Always use Next.js `<Image>` component with proper optimization

## Business Logic Guidelines

### Tesla Specialization

When working on vehicle-related features:
- **Primary Focus**: Tesla Model Y (2025+ Juniper), Model 3, Model S, Model X
- **VLT Compliance**: Always check against state laws using `src/lib/api/tintingLaws.ts`
- **Installation Difficulty**: Rate as 'Beginner', 'Intermediate', or 'Professional'

### Legal Compliance

**State Tinting Laws** - Critical business requirement:
```typescript
// Always validate VLT against state laws
const compliance = await checkTintCompliance(
  stateCode,
  vltPercentage,
  windowType
)
```

**Product Data Structure:**
```typescript
interface Product {
  id: string
  name: string
  category: 'film' | 'kit' | 'tool' | 'accessory'
  price: number
  specifications: {
    vlt?: string          // Required for films
    heatRejection?: string
    warranty?: string
    difficulty?: 'Beginner' | 'Intermediate' | 'Professional'
  }
}
```

## Testing & Quality Assurance

### Pre-Commit Requirements

**Always run these before committing:**
```bash
pnpm run lint    # ESLint + TypeScript checks
pnpm run build   # Verify production build works
```

### Code Quality Standards

- **No console.log statements** in production code (development APIs excepted)
- **Proper error boundaries** - especially for 3D components
- **Accessibility compliance** - use Shadcn/ui components for forms
- **Performance optimization** - lazy loading, image optimization

## Security Considerations

### Critical Security Rules

1. **Never commit secrets** - use environment variables
2. **Input validation** - all forms must use Zod validation
3. **Email verification** - for sensitive operations (order lookup, etc.)
4. **No PII logging** - especially in development mode

### Environment Variables

```bash
# Required for Stripe integration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Required for database
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Required for file storage
CLOUDFLARE_EMAIL=
CLOUDFLARE_GLOBAL_API_KEY=
R2_ACCESS_KEY_ID=
```

## Site Architecture & Routes

**22 Total Routes** - All pages functional with mock data:

**E-commerce Core:**
- `/` - Tesla-focused landing page
- `/products` - Product catalog with filtering
- `/products/[slug]` - Dynamic product details (11+ products)
- `/store` - Storefront with cart integration
- `/store/cart` - Shopping cart + Stripe checkout

**Support System:**
- `/support` - Customer service hub
- `/support/faq` - FAQ with search functionality
- `/support/contact` - Contact form with file upload
- `/support/warranty` - Warranty claim processing
- `/support/orders` - Order lookup and tracking

**Legal Compliance:**
- `/support/legal/tinting-laws` - Interactive state law checker
- `/support/legal/privacy` - GDPR/CCPA privacy policy
- `/support/legal/terms` - Terms of service

## Commit Guidelines

**Follow established commit message patterns** (based on recent history):

```bash
# Feature additions
feat: add dark mode toggle to settings panel

# Bug fixes  
fix: resolve cart badge not updating issue

# Improvements
improve: enhance navbar transparency handling

# Documentation
docs: update API integration guidelines

# Refactoring
refactor: restructure component hierarchy
```

**Branch Naming:**
- Features: `feature/description-here`
- Fixes: `fix/issue-description`  
- Docs: `docs/update-description`

## Working with Existing Code

### When Adding Features

1. **Check existing patterns** - Look for similar implementations first
2. **Use existing libraries** - Don't add new dependencies without checking what's available
3. **Follow component patterns** - Use Shadcn for forms, custom components for business logic
4. **Maintain Tesla focus** - New features should align with automotive/Tesla specialization

### When Fixing Bugs

1. **Understand the data flow** - Check both client state (Zustand) and API stubs
2. **Test across routes** - The app has 22 routes that need to remain functional
3. **Verify mobile responsiveness** - All components should work on mobile devices
4. **Check TypeScript compilation** - Fix any type errors introduced

### Integration Points

**Ready for Production:**
- Stripe payments (fully implemented)
- Email templates (React Email + Resend integration points)
- Database schema (Supabase examples in all API stubs)

**Development Only:**
- All data is mocked but realistic
- API delays simulate real network conditions
- Error handling mimics production scenarios

## Documentation References

**Additional Technical Docs:**
- `docs/CODEBASE_EXPLANATION.md` - Detailed architecture overview
- `docs/STATE_MANAGEMENT.md` - Zustand implementation patterns
- `docs/STRIPE_INTEGRATION.md` - Payment integration guide
- `docs/API_STUBS.md` - Complete API endpoint documentation

**Key Configuration Files:**
- `next.config.ts` - Image optimization, Three.js support
- `tailwind.config.js` - Minimal Tailwind v4 setup
- `src/app/siteConfig.ts` - Site metadata and navigation

This platform represents a sophisticated, production-ready e-commerce solution with deep automotive industry specialization. When making changes, always consider the Tesla community focus and maintain the high-quality user experience standards.