# State Management

Zustand-based state management with hybrid local + server persistence.

---

## Architecture

| Layer | Storage | Scope |
|-------|---------|-------|
| UI state | Zustand (memory) | Single session |
| Cart | Zustand + localStorage + Medusa API | Cross-device |
| Auth | Zustand + localStorage + httpOnly cookies | Cross-device |
| Checkout | Zustand (memory) | Single session |
| Support | Zustand + localStorage | Single device |
| Shipping | React hooks (useState) | Component scope |

---

## Stores Overview

| Store | File | Persistence | Server Sync |
|-------|------|-------------|-------------|
| `useCart` | `src/hooks/useCart.ts` | localStorage v2 | Medusa Cart API |
| `useAuth` | `src/hooks/useAuth.ts` | localStorage v1 | API routes → Medusa |
| `useCheckoutState` | `src/hooks/useCheckoutState.ts` | None | None |
| `useSupportStore` | `src/hooks/useSupportStore.ts` | localStorage | None |
| `useMedusaShipping` | `src/hooks/useMedusaShipping.ts` | None (hook) | Medusa Fulfillment API |

---

## Cart Store

**File**: `src/hooks/useCart.ts`

Hybrid cart with optimistic updates and Medusa synchronization.

### State

```typescript
interface CartStore {
  items: CartItem[]
  isOpen: boolean
  paymentSession: PaymentSession | null
  cartId: string | null           // Medusa cart ID
  regionId: string | null         // Medusa region
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error'
  syncError: string | null
}
```

### Key Actions

| Action | Behavior |
|--------|----------|
| `addToCart(product, variantId)` | Optimistic update → Medusa sync |
| `removeFromCart(productId)` | Optimistic update → Medusa sync |
| `updateQuantity(productId, qty)` | Optimistic update → Medusa sync |
| `initializeCart()` | Restore or create Medusa cart |
| `syncWithMedusa()` | Fetch latest cart state |
| `clearCart()` | Clear local + reset cartId |

### Persistence

```typescript
partialize: (state) => ({
  items: state.items,
  paymentSession: state.paymentSession,
  cartId: state.cartId,
  regionId: state.regionId,
})
```

**Persisted**: `items`, `paymentSession`, `cartId`, `regionId`
**Not persisted**: `isOpen`, `syncStatus`, `syncError`

### Migration

Version 2 adds Medusa cart support. Migration normalizes items and adds `cartId`/`regionId`.

---

## Auth Store

**File**: `src/hooks/useAuth.ts`

Authentication via API routes (not direct Medusa calls). Session stored in httpOnly cookies by Medusa backend.

### State

```typescript
interface AuthState {
  customer: MedusaCustomer | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}
```

### Key Actions

| Action | Behavior |
|--------|----------|
| `login(email, password)` | POST `/api/auth/login` → set customer |
| `register(email, password, ...)` | POST `/api/auth/register` → set customer |
| `logout()` | POST `/api/auth/logout` → clear state |
| `fetchCustomer()` | GET `/api/auth/me` → refresh customer |

### Persistence

```typescript
partialize: (state) => ({
  isAuthenticated: state.isAuthenticated,
  // Customer data is NOT persisted - fetched fresh
})
```

**Persisted**: `isAuthenticated` flag only
**Not persisted**: `customer`, `isLoading`, `error`

### Session Flow

1. Login → API route creates Medusa session → httpOnly cookie set
2. On page load → `useAuthInit()` calls `fetchCustomer()` if `isAuthenticated`
3. Logout → API route clears Medusa session → cookie cleared

---

## Checkout State Store

**File**: `src/hooks/useCheckoutState.ts`

Ephemeral checkout form state. Not persisted.

### State

```typescript
interface CheckoutState {
  taxAmount: number
  isCalculatingTax: boolean
  shippingAddress: ShippingAddress | null
  subtotal: number
  total: number
}
```

### Key Actions

| Action | Behavior |
|--------|----------|
| `setTaxAmount(amount)` | Set tax → recalculate total |
| `setSubtotal(subtotal)` | Set subtotal → recalculate total |
| `setShippingAddress(address)` | Store address |
| `reset()` | Clear all state |

---

## Shipping Hook

**File**: `src/hooks/useMedusaShipping.ts`

React hook (not Zustand store) for shipping rate management. Uses Medusa's fulfillment provider for real-time EasyPost rates.

### Usage

```typescript
const {
  rates,           // ShippingRate[]
  selectedRate,    // ShippingRate | null
  isLoading,
  error,
  selectRate,      // (rate) => Promise<void>
  refetch,
} = useMedusaShipping({
  cartId: 'cart_xxx',
  address: customerAddress,
  debounceMs: 500,  // Default: 500ms
});
```

### Flow

1. Address changes → debounced (500ms)
2. Update cart with shipping address via Medusa API
3. Fetch shipping options → call calculate endpoint for each
4. Transform to `ShippingRate[]` → assign badges → auto-select cheapest
5. User selects rate → `addShippingMethod()` → cart total updated

### Protection

- **Debouncing**: 500ms delay prevents rapid requests
- **Abort controller**: Cancels stale requests
- **Address change detection**: Only updates cart when address actually changes

---

## Support Store

**File**: `src/hooks/useSupportStore.ts`

Support ticket and form state management.

### State

```typescript
interface SupportStore {
  contactForm: Partial<ContactFormData>
  warrantyForm: Partial<WarrantyClaimData>
  tickets: SupportTicket[]
  searchQuery: string
  selectedFAQCategory: string
  preferredContactMethod: 'email' | 'phone' | 'chat'
  currentSession: { startTime, pageViews, searchQueries }
}
```

### Persistence

```typescript
partialize: (state) => ({
  tickets: state.tickets,
  preferredContactMethod: state.preferredContactMethod,
  contactForm: state.contactForm,
  warrantyForm: state.warrantyForm,
})
```

---

## Debugging

### Browser DevTools > Application > Local Storage

| Key | Contents |
|-----|----------|
| `cart-storage` | Cart items, payment session, Medusa cart/region IDs |
| `opticworks-auth` | Auth flag (customer data fetched fresh) |
| `support-storage` | Support tickets, form drafts, preferences |

### Clear State

```javascript
// Clear specific store
localStorage.removeItem('cart-storage')

// Clear all
localStorage.clear()
```

### Debug Logging

All stores log to console with prefixes:
- `[cart]` - Cart operations
- `[useAuth]` - Auth operations
- `[useMedusaShipping]` - Shipping rate fetching

---

## Best Practices

1. **Selective persistence** - Only persist necessary data (not loading states)
2. **Optimistic updates** - Update Zustand first, then sync with server
3. **Handle hydration** - Account for SSR/client differences
4. **Exclude UI state** - Don't persist modals, loading flags
5. **Version migrations** - Use `version` and `migrate` for schema changes
6. **Fresh customer data** - Don't persist customer object, fetch on auth check

---

## Related Docs

- [CHECKOUT_FLOW.md](CHECKOUT_FLOW.md) - Full checkout process
- [FULFILLMENT.md](FULFILLMENT.md) - Shipping rate calculation
