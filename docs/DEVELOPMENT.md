# Development Guide

**Last Updated**: 2025-12-02

This document is the single source of truth for development workflows, build quirks, and known workarounds. Read this before your first commit.

---

## Quick Reference

```bash
# Development
pnpm run dev                              # Start dev server (localhost:3000)

# Pre-commit (ALL REQUIRED)
pnpm run lint                             # Linting
pnpm run test                             # Tests
unset NODE_ENV && pnpm run build          # Production build (2-3 min)
```

---

## Build Commands

### Development Server

```bash
pnpm run dev
```

- Starts on `http://localhost:3000`
- Hot reload enabled
- First compile: ~25-30s (1600+ modules)
- Subsequent: ~1-3s (incremental)

### Production Build

```bash
unset NODE_ENV && pnpm run build
```

**Why `unset NODE_ENV`?**

GitHub Codespaces sets `NODE_ENV=development` in the shell environment. Next.js expects to control this variable during builds and will warn/fail with "non-standard NODE_ENV" if it's preset.

**Expected output:**
- Compilation: ~60-90s
- Static generation: 38 pages
- Total: ~2-3 minutes
- No errors

See [BUILD_CONFIGURATION.md](./BUILD_CONFIGURATION.md) for detailed build optimization notes.

### Type Checking (Separate)

```bash
pnpm exec tsc --noEmit --incremental false
```

Type checking is disabled during build (`typescript.ignoreBuildErrors: true`) due to a Next.js 15 hang issue. Run this separately before pushing.

---

## Known Workarounds

### 1. Email System (Stubbed)

**Status**: Stubbed as of Phase 3 (2025-12-02)

**Symptom**: Build fails with `<Html> should not be imported outside of pages/_document`

**Root Cause**: `@react-email/components` exports an `Html` component that Next.js 15.5.0 incorrectly detects as the `next/document` Html during SSG.

**Workaround Applied**:
- Removed `@react-email/components`, `@react-email/render`, and `resend` from package.json
- Stubbed email API in `src/lib/api/email.ts` and `src/app/api/email/send/route.ts`
- Email functions log and return success (no actual sending)
- Template files renamed to `*.tsx.disabled`

**Files Affected**:
- `src/lib/api/email.ts` - Stubbed sendEmail function
- `src/app/api/email/send/route.ts` - Stubbed API route
- `src/app/api/stripe/webhook/route.ts` - Email calls removed
- `src/lib/email/templates/*.tsx.disabled` - Disabled templates

**Plan**: Migrate to Medusa notification system in Phase 4

**Reference**: [RFD-009](./RFD-009-nextjs-build-ssg-error.md)

---

### 2. Product Pages Force Dynamic

**Status**: Permanent workaround

**Symptom**: Build fails during 404 page generation when `generateStaticParams()` calls Medusa API

**Root Cause**: Medusa API requires publishable key at build time. When unavailable, the API returns 400, which cascades into SSG errors.

**Workaround Applied**:
```typescript
// src/app/products/[slug]/page.tsx
export const dynamic = 'force-dynamic'

// generateStaticParams commented out
```

**Trade-off**: Product pages are server-rendered on each request (minor performance impact, but acceptable for e-commerce where inventory/pricing freshness matters).

---

### 3. Lazy Stripe Initialization

**Status**: Permanent pattern

**Symptom**: Build fails with `Neither apiKey nor config.authenticator provided`

**Root Cause**: Stripe SDK throws at module initialization if `STRIPE_SECRET_KEY` is not set. During Next.js builds, environment variables may not be available for all code paths.

**Pattern**:
```typescript
// WRONG - fails at build time
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// CORRECT - lazy initialization
let stripe: Stripe | null = null;
const getStripe = () => {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { ... });
  }
  return stripe;
};

// Use in handlers
export async function POST(req: Request) {
  const stripe = getStripe();
  // ...
}
```

**Files Using This Pattern**:
- `src/app/api/order-details/route.ts`
- `src/app/api/stripe/webhook/route.ts`
- `src/app/api/stripe/create-checkout-session/route.ts`

---

### 4. Medusa API Fallback

**Status**: Intentional resilience pattern

**Behavior**: When Medusa API returns an error (e.g., 400 invalid key), the storefront falls back to static product data.

**Location**: `src/lib/api/medusa.ts`

**When It Triggers**:
- Build time (publishable key not in env)
- API unavailable
- Network errors

**Log Output**:
```
[medusa] Falling back to static products: Error: Medusa request failed (400): ...
```

This is expected during builds and doesn't cause build failure.

---

### 5. NODE_ENV in Codespaces

**Status**: Shell configuration issue

**Symptom**: Build warns about "non-standard NODE_ENV"

**Cause**: Codespaces sets `NODE_ENV=development` in the shell environment by default.

**Fix**:
```bash
unset NODE_ENV && pnpm run build
```

**Alternative** (persistent): Add to `~/.bashrc`:
```bash
unset NODE_ENV
```

---

## Environment Setup

### Required Environment Variables

Pull from Infisical:
```bash
pnpm run secrets:pull
```

Key variables (see [KEY_MANAGEMENT.md](./KEY_MANAGEMENT.md) for full inventory):

| Variable | Required For | Notes |
|----------|--------------|-------|
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | Products, Cart | Medusa Store API |
| `STRIPE_SECRET_KEY` | Checkout | Server-side only |
| `STRIPE_WEBHOOK_SECRET` | Webhooks | From Stripe Dashboard |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Checkout UI | Client-side |

### Codespaces vs Local

**Codespaces** (recommended):
- `INFISICAL_SERVICE_TOKEN` is pre-configured
- SSH to Hetzner available via `ssh hetzner-node`
- `pnpm run secrets:pull` works out of the box

**Local**:
- Export `INFISICAL_SERVICE_TOKEN` manually
- SSH config needed for Hetzner access

---

## Pre-Commit Checklist

Run all three before every commit:

```bash
# 1. Linting (fast)
pnpm run lint

# 2. Tests (fast)
pnpm run test

# 3. Production build (2-3 min)
unset NODE_ENV && pnpm run build
```

**Never skip the build** - it catches issues that lint/test don't:
- SSG errors
- Module initialization failures
- Missing environment handling

---

## Common Issues

### "non-standard NODE_ENV" warning

```bash
unset NODE_ENV
```

### "Neither apiKey nor config.authenticator provided"

Stripe SDK initializing at build time. Check that:
1. The file uses lazy initialization pattern (see Workaround #3)
2. Stripe client is not created at module level

### "<Html> should not be imported outside of pages/_document"

This was caused by @react-email. The email system has been stubbed. If you see this error:
1. Check no one re-added react-email packages
2. Check `package.json` doesn't include `@react-email/*` or `resend`

### "Medusa request failed (400)"

Normal during builds - fallback to static products will be used. If it happens at runtime:
1. Check `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` is set
2. Verify Medusa backend is running: `curl https://api.optic.works/health`

### Build hangs at "Checking validity of types"

Known Next.js 15 issue. We've disabled build-time type checking. Run `pnpm exec tsc --noEmit` separately.

---

## Testing

### Unit Tests

```bash
pnpm run test           # Run all tests
pnpm run test -- -u     # Update snapshots
```

Coverage focus: Cart utilities (`src/lib/cart/utils.test.ts`)

### Manual Testing

1. **Products**: Visit `/products` - should load from Medusa API
2. **Cart**: Add item, verify persistence across refresh
3. **Checkout**: Complete test purchase with Stripe test card `4242 4242 4242 4242`

---

## Git Workflow

### Commit Messages

Follow conventional commits:
```
feat: Add Medusa cart integration
fix: Lazy Stripe initialization for build
docs: Update development guide
refactor: Remove email dependencies
```

### Branching

- `main` - Production-ready code
- Feature branches for Phase 3 tracks

### Pre-push

Always run full pre-commit checklist. CI will catch failures, but it's faster to catch locally.

---

## Related Documentation

- [BUILD_CONFIGURATION.md](./BUILD_CONFIGURATION.md) - Detailed build optimization
- [KEY_MANAGEMENT.md](./KEY_MANAGEMENT.md) - All environment variables
- [CONTRIBUTORS.md](./CONTRIBUTORS.md) - SSH access, Codespaces setup
- [RFD-009](./RFD-009-nextjs-build-ssg-error.md) - Email system blocker details
