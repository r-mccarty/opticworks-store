# Customer Authentication (CIAM)

Customer Identity and Access Management using Medusa v2 auth system.

---

## Architecture

```
Browser                    Next.js API Routes              Medusa Backend
   |                              |                              |
   |-- POST /api/auth/login ----->|                              |
   |                              |-- POST /store/auth/customer/emailpass -->|
   |                              |<-- JWT token ------------------|
   |                              |                              |
   |                              |-- Set httpOnly cookie ------->|
   |<-- { customer } -------------|                              |
   |                              |                              |
   |-- GET /api/auth/me --------->|                              |
   |   (cookie sent auto)         |-- GET /store/customers/me --->|
   |                              |   (Bearer token)              |
   |<-- { customer } -------------|<-- customer data -------------|
```

---

## Session Management

| Aspect | Implementation |
|--------|----------------|
| Token storage | httpOnly cookie (`medusa_auth_token`) |
| Token type | JWT from Medusa |
| Expiry | 7 days |
| Refresh | Not implemented (re-login required) |
| Cookie flags | `httpOnly`, `secure` (prod), `sameSite: lax` |

### Why httpOnly Cookies?

- **XSS protection**: JavaScript cannot access the token
- **Automatic sending**: Browser includes cookie in all requests
- **Server-side validation**: API routes read cookie, call Medusa with Bearer token

---

## API Routes

### POST /api/auth/register

Creates a new customer account.

```typescript
// Request
{ email: string, password: string, first_name?: string, last_name?: string }

// Response (200)
{ success: true, customer: MedusaCustomer }

// Errors
400: "Email and password are required"
400: "Password must be at least 8 characters"
409: "An account with this email already exists"
```

**Flow**:
1. Validate email format and password strength
2. Call Medusa `POST /store/auth/customer/emailpass/register`
3. Create customer profile with name
4. Set httpOnly cookie with JWT
5. Return customer data

### POST /api/auth/login

Authenticates existing customer.

```typescript
// Request
{ email: string, password: string }

// Response (200)
{ success: true, customer: MedusaCustomer }

// Errors
400: "Email and password are required"
401: "Invalid email or password"
```

### POST /api/auth/logout

Clears the auth cookie.

```typescript
// Request (no body)

// Response (200)
{ success: true }
```

### GET /api/auth/me

Returns current authenticated customer.

```typescript
// Response (200)
{ customer: MedusaCustomer }

// Errors
401: "Not authenticated"
```

### POST /api/auth/forgot-password

Initiates password reset flow.

```typescript
// Request
{ email: string }

// Response (200)
{ success: true, message: "If an account exists, a reset email has been sent" }
```

### POST /api/auth/reset-password

Completes password reset with token.

```typescript
// Request
{ token: string, password: string }

// Response (200)
{ success: true }

// Errors
400: "Invalid or expired reset token"
```

---

## Client-Side State

**File**: `src/hooks/useAuth.ts`

```typescript
interface AuthState {
  customer: MedusaCustomer | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, firstName?, lastName?) => Promise<boolean>
  logout: () => void
  fetchCustomer: () => Promise<void>
}
```

### Persistence

- Only `isAuthenticated` flag persisted to localStorage
- Customer data fetched fresh on page load via `fetchCustomer()`
- Prevents stale data while maintaining quick auth checks

### Usage

```tsx
import { useAuth } from '@/hooks/useAuth'

function LoginForm() {
  const { login, isLoading, error } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const success = await login(email, password)
    if (success) {
      router.push('/account')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="text-red-500">{error}</p>}
      {/* form fields */}
    </form>
  )
}
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/hooks/useAuth.ts` | Zustand auth store |
| `src/app/api/auth/login/route.ts` | Login endpoint |
| `src/app/api/auth/register/route.ts` | Registration endpoint |
| `src/app/api/auth/logout/route.ts` | Logout endpoint |
| `src/app/api/auth/me/route.ts` | Current customer endpoint |
| `src/app/api/auth/refresh/route.ts` | Refresh JWT cookie |
| `src/app/api/auth/forgot-password/route.ts` | Password reset request |
| `src/app/api/auth/reset-password/route.ts` | Password reset completion |
| `src/app/auth/login/page.tsx` | Login UI |
| `src/app/auth/register/page.tsx` | Registration UI |
| `src/app/account/page.tsx` | Account dashboard |
| `src/middleware.ts` | Server-side guard for protected routes |
| `src/lib/rate-limit.ts` | Lightweight rate limiter for auth routes |

---

## Audit Status (Jan 2025)

**Aligned**
- Auth is proxied through Next API routes and stored in httpOnly cookies (no tokens in JS).
- Password reset routes avoid email enumeration and enforce minimum length.
- Customer data is fetched on demand (`/api/auth/me`) instead of persisting PII in localStorage.

**Gaps vs canonical architecture**
- Cart–customer linking is now implemented in `useAuth` (login/register success calls `updateCart` with `customer_id` + `email`), but server-side cart linking would be stronger if we later move it to API routes.
- Token refresh is supported via `/api/auth/refresh` and invoked by `useAuthInit` on boot to renew the httpOnly JWT.
- Rate limiting added to auth routes via lightweight in-memory limiter (`src/lib/rate-limit.ts`), but not distributed across instances.
- `/account` now has server-side protection via middleware; still consider expanding to other protected routes.
- Auth bootstrap revalidates on start (`useAuthInit` uses refresh + `/api/auth/me`) to avoid stale persisted auth flags.

**Near-term fixes**
1. Consider moving cart linking into the auth API routes (server-side) to guarantee linkage even if client-side code is bypassed.  
2. If running multiple instances, swap the in-memory limiter for a shared store (KV/Redis) to enforce global rate limits.  
3. Expand middleware protection to any new protected routes (orders, profile edit) as they are added.  
4. Add optional complexity checks for passwords (currently only length 8).  
5. Explore Medusa-native session refresh cadence vs. cookie TTL to balance UX and security.

---

## Medusa Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `POST /store/auth/customer/emailpass` | Login |
| `POST /store/auth/customer/emailpass/register` | Register auth identity |
| `POST /store/customers` | Create customer profile |
| `GET /store/customers/me` | Get current customer |

---

## Security Considerations

### Password Requirements

- Minimum 8 characters (enforced in register route)
- No complexity requirements (consider adding)

### Rate Limiting

- Not currently implemented
- Consider adding for login/register endpoints

### Token Security

- JWTs stored in httpOnly cookies (XSS safe)
- Tokens not exposed to client JavaScript
- CSRF protection via `sameSite: lax`

---

## Protected Routes

Routes requiring authentication should check auth state:

```tsx
// src/app/account/page.tsx
'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AccountPage() {
  const { isAuthenticated, isLoading, customer } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/account')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>
  }

  return <div>Welcome, {customer?.first_name}</div>
}
```

---

## Cart-Customer Linking

When a customer logs in, their anonymous cart should be linked:

```typescript
// After successful login
const { cartId } = useCart()
if (cartId) {
  await updateCart(cartId, {
    customer_id: customer.id,
    email: customer.email
  })
}
```

This enables:
- Order history association
- Cart recovery across devices
- Personalized pricing (future)
