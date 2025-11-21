# State Management

This document explains how state management works in the OpticWorks Presence Intelligence Platform.

## Architecture Overview

The application uses a **hybrid state management approach**:

1. **Zustand + localStorage**: Client-side UI state and optimistic updates
2. **Medusa API + Redis/PostgreSQL**: Server-side persistent state (cart, auth, orders)

This provides both instant UX (optimistic updates) and reliable persistence (server-side sessions).

## Phase 2 vs Phase 3 Architecture

### Phase 2 (Current - Anonymous Shopping)
- **Zustand + localStorage**: All state stored client-side
- **Use case**: Anonymous users browsing and adding to cart
- **Limitation**: Single-device only, no multi-device sync

### Phase 3 (Planned - Authenticated E-Commerce)
- **Hybrid approach**: Zustand for UI state, Medusa for persistent data
- **Use case**: Authenticated users with multi-device cart sync, order history
- **Implementation**: Server-side cart sessions via Medusa Cart API + Redis

## Persistence Architecture

### Client-Side Persistence (Zustand + localStorage)
- **Storage**: Browser's `localStorage`
- **Scope**: Single device/browser only
- **Use Case**: UI state, optimistic updates, temporary data
- **Implementation**: Zustand's `persist` middleware

### Server-Side Persistence (Medusa + Redis + PostgreSQL)
- **Storage**: Redis (sessions, cart) + PostgreSQL (orders, customers)
- **Scope**: Cross-device, multi-user
- **Use Case**: Cart sessions, customer accounts, order history
- **Implementation**: Medusa API endpoints (already deployed at api.optic.works)

### Why Medusa Instead of Cloudflare KV/D1?

**We use Medusa's built-in session management instead of adding Cloudflare KV/D1 because:**

1. **Already deployed**: Medusa backend includes Redis (sessions) + PostgreSQL (data)
2. **CIAM included**: Customer Identity & Access Management (login, registration, sessions)
3. **Cart API ready**: Server-side cart with inventory validation
4. **No extra cost**: Redis/PostgreSQL already provisioned (services/medusa/medusa-config.ts:75)
5. **Less complexity**: One source of truth instead of syncing multiple storage systems

**Exception**: Cloudflare R2 is used for product images (already configured in medusa-config.ts:51-70)

## Current Store Implementation

### Cart Store (`src/hooks/useCart.ts`)

```typescript
export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (product) => { /* implementation */ },
      // ... other methods
    }),
    {
      name: 'cart-storage',              // localStorage key
      version: 1,                        // hydrate through migrations
      partialize: (state) => ({ 
        items: state.items,
        paymentSession: state.paymentSession
      }),
      migrate: (persistedState) => ({
        // normalize old cart payloads from legacy storage
        items: normalizeCartItems(persistedState?.items),
        paymentSession: persistedState?.paymentSession
          ? {
              ...persistedState.paymentSession,
              items: normalizeCartItems(persistedState.paymentSession.items),
            }
          : null,
      })
    }
  )
)
```

`normalizeCartItems` and other helpers live in `src/lib/cart/utils.ts`. They prune invalid spec entries and clamp quantities so hydration never crashes if older browsers stored incomplete data.

**Persistence Behavior**:
- Cart items saved to `localStorage` under key `'cart-storage'`
- Persists across browser sessions on same device
- `isOpen` state intentionally NOT persisted (resets on page load)

### Support Store (`src/hooks/useSupportStore.ts`)

```typescript
export const useSupportStore = create<SupportStore>()(
  persist(
    (set, get) => ({
      contactForm: {},
      warrantyForm: {},
      tickets: [],
      // ... implementation
    }),
    {
      name: 'support-storage',
      partialize: (state) => ({
        tickets: state.tickets,
        preferredContactMethod: state.preferredContactMethod,
        contactForm: state.contactForm,
        warrantyForm: state.warrantyForm
      })
    }
  )
)
```

**Persistence Behavior**:
- Support tickets and forms saved to `localStorage`
- Session tracking (`currentSession`) intentionally NOT persisted
- User preferences persist across visits

## State Flow Examples

### Shopping Cart Flow
1. User adds product → `addToCart()` called
2. State updated in memory → Component re-renders  
3. Zustand persist middleware → Saves to `localStorage['cart-storage']`
4. User closes browser → State remains in localStorage
5. User returns → Store automatically hydrates from localStorage

### Form State Flow
1. User fills contact form → `setContactForm()` called
2. Form data persisted in real-time → Prevents data loss
3. User navigates away → Form data retained
4. User returns to form → Previous input restored

## Persistence Strategy

### What Gets Persisted
- **Cart items**: Products and quantities (normalized via `src/lib/cart/utils.ts`)
- **Support tickets**: Customer service history
- **Form data**: In-progress contact/warranty forms
- **User preferences**: Contact method preferences

### What Doesn't Get Persisted
- **UI state**: Modal open/closed, loading states
- **Session data**: Current support session tracking
- **Temporary state**: Search queries, filter selections

### Selective Persistence with `partialize`

The `partialize` function controls exactly what gets saved:

```typescript
partialize: (state) => ({
  // Only these fields are saved to localStorage
  items: state.items,
  paymentSession: state.paymentSession,
  preferredContactMethod: state.preferredContactMethod
  // isOpen, searchQuery, etc. are NOT saved
})
```

## Browser Storage Limitations

### Storage Limits
- **localStorage**: ~5-10MB per domain
- **Current usage**: Minimal (product objects + metadata)
- **Risk**: Very low for this use case

### Storage Behavior
- **Private browsing**: Data cleared when session ends
- **Clear site data**: User can manually clear localStorage
- **Storage full**: Old entries may be evicted (FIFO)

## Development Patterns

### Creating a New Store
```typescript
interface MyStore {
  data: SomeType[]
  actions: () => void
}

export const useMyStore = create<MyStore>()(
  persist(
    (set, get) => ({
      data: [],
      actions: () => { /* implementation */ }
    }),
    {
      name: 'my-store-storage',
      partialize: (state) => ({
        data: state.data  // Only persist data, not UI state
      })
    }
  )
)
```

### Best Practices
1. **Selective persistence**: Only persist necessary data
2. **Clear naming**: Use descriptive localStorage keys
3. **Type safety**: Always use TypeScript interfaces
4. **Partialize wisely**: Exclude UI state and temporary data
5. **Handle hydration**: Account for SSR/client differences

## Phase 3 Migration Strategy

### What Changes in Phase 3

**Cart Management (Phase 3 Track 2.1)**:
```typescript
// BEFORE (Phase 2 - localStorage only)
addToCart: (product) => {
  set({ items: [...items, product] })  // ← Only in localStorage
}

// AFTER (Phase 3 - hybrid approach)
addToCart: async (product) => {
  // 1. Optimistic update (instant UI feedback)
  set({ items: [...items, product] })

  // 2. Persist to Medusa backend (reliable, cross-device)
  const cart = await medusaApi.addLineItem(cartId, {
    variant_id: product.id,
    quantity: 1
  })

  // 3. Sync server response (inventory validation)
  set({ items: cart.items, cartId: cart.id })
}
```

**Customer Authentication (Phase 3 Track 4)**:
- **Phase 2**: No authentication (anonymous only)
- **Phase 3**: Medusa Customer API (`/store/auth`, `/store/customers/me`)
- **Sessions**: Stored in Redis via Medusa (httpOnly cookies)
- **Order history**: PostgreSQL via Medusa Orders API

### State Ownership Matrix

| State Type | Phase 2 (Current) | Phase 3 (Planned) |
|------------|-------------------|-------------------|
| **Cart items** | Zustand + localStorage | Medusa Cart API + Redis |
| **Cart UI (isOpen)** | Zustand (ephemeral) | Zustand (ephemeral) |
| **Customer session** | N/A | Medusa Auth API + Redis |
| **Order history** | N/A | Medusa Orders API + PostgreSQL |
| **Warranty claims** | Zustand + localStorage | Medusa Admin API + PostgreSQL |
| **Support tickets** | Zustand + localStorage | Medusa Admin API + PostgreSQL |
| **Form drafts** | Zustand + localStorage | Zustand + localStorage (backup) |
| **UI preferences** | Zustand + localStorage | Zustand + localStorage |

### Migration Checklist (Phase 3)

**Track 2.1 - Cart Migration**:
- [ ] Add `cartId` to Zustand state (store server cart ID)
- [ ] Update `addToCart` to call Medusa `/store/carts/:id/line-items`
- [ ] Update `updateQuantity` to sync with Medusa
- [ ] Update `removeFromCart` to sync with Medusa
- [ ] Implement cart hydration on page load (fetch from Medusa by cartId)
- [ ] Handle offline mode (queue mutations, sync when online)

**Track 4.1 - Customer Auth Migration**:
- [ ] Create auth store (`useAuth`) with Medusa Customer API
- [ ] Implement login/logout via Medusa `/store/auth`
- [ ] Store session token in httpOnly cookie (Medusa handles this)
- [ ] Migrate support tickets to Medusa database
- [ ] Migrate warranty claims to Medusa database
- [ ] Implement order history page (`/account/orders`)

### Hybrid Architecture Pattern

**Keep in Zustand (Client-Side)**:
- ✅ UI state (modals, drawers, loading indicators)
- ✅ Optimistic updates (instant feedback before server confirmation)
- ✅ Form drafts (as backup in case server fails)
- ✅ User preferences (theme, language, contact method)
- ✅ Temporary search/filter state

**Move to Medusa (Server-Side)**:
- ✅ Cart sessions (multi-device sync)
- ✅ Customer authentication (login, registration)
- ✅ Order history (persistent, queryable)
- ✅ Warranty claims (requires admin review)
- ✅ Support tickets (customer service integration)

### Why Not Add Custom Session Storage?

**Avoid adding these services (complexity without benefit)**:
- ❌ **Cloudflare KV** for sessions → Use Medusa's Redis instead
- ❌ **Cloudflare D1** for cart data → Use Medusa's PostgreSQL instead
- ❌ **Custom Redis client** → Use Medusa's Cart API (abstracts Redis)
- ❌ **Supabase Auth** → Use Medusa's Customer API (purpose-built for e-commerce)

**Reason**: Medusa already provides production-ready session management, CIAM, and cart APIs backed by the Redis + PostgreSQL infrastructure deployed in Phase 2. Adding separate storage creates sync complexity and duplicate state.

## Data Flow Examples

### Phase 2 Flow (Current - Client-Only)
```
User clicks "Add to Cart"
  ↓
Zustand updates state (in-memory)
  ↓
Persist middleware saves to localStorage
  ↓
Component re-renders with new cart
  ↓
User closes browser → Cart persists in localStorage
  ↓
User returns → Zustand hydrates from localStorage
```

### Phase 3 Flow (Planned - Hybrid)
```
User clicks "Add to Cart"
  ↓
1. Zustand updates state (optimistic, instant UI)
  ↓
2. POST /store/carts/:id/line-items (persist to Medusa)
  ↓
3. Medusa validates inventory & saves to Redis + PostgreSQL
  ↓
4. Medusa returns updated cart
  ↓
5. Zustand syncs with server response
  ↓
User switches devices → Fetches cart from Medusa by cartId
  ↓
Cart synced across all devices
```

### Offline Mode Handling (Phase 3)
```typescript
// Queue mutations when offline, sync when reconnected
addToCart: async (product) => {
  // Optimistic update
  set({ items: [...items, product] })

  if (navigator.onLine) {
    // Online: sync immediately
    await medusaApi.addLineItem(cartId, { variant_id: product.id })
  } else {
    // Offline: queue for later
    queueMutation({ type: 'ADD_ITEM', payload: product })
  }
}

// On reconnect
window.addEventListener('online', async () => {
  await syncQueuedMutations()
})
```

## Debugging State

### Client-Side State (Zustand + localStorage)

**Browser DevTools**:
1. **Application tab** → Storage → Local Storage
2. **Keys**: `cart-storage`, `support-storage`
3. **Values**: JSON-serialized state objects

**Zustand DevTools** (add for development):
```typescript
import { devtools } from 'zustand/middleware'

export const useCart = create<CartStore>()(
  devtools(
    persist(/* store config */),
    { name: 'cart-store' }
  )
)
```

**Clear state**: `localStorage.clear()` or delete specific keys

### Server-Side State (Medusa + Redis + PostgreSQL)

**Check Redis cart sessions** (via SSH to Hetzner):
```bash
ssh hetzner-node
redis-cli
> KEYS cart:*                    # List all cart sessions
> GET cart:abc123                # View specific cart
> TTL cart:abc123                # Check session expiry
```

**Check PostgreSQL data**:
```bash
ssh hetzner-node
psql -U medusa -d medusa
> SELECT * FROM cart WHERE id = 'cart_abc123';
> SELECT * FROM customer WHERE email = 'user@example.com';
> SELECT * FROM "order" WHERE customer_id = 'cus_abc123';
```

**Check Medusa API directly**:
```bash
# Get cart
curl -H "x-publishable-api-key: $PUBKEY" \
  https://api.optic.works/store/carts/cart_abc123

# Get customer orders
curl -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  https://api.optic.works/store/customers/me/orders
```

## Performance Considerations

### Client-Side Performance
- **localStorage limit**: 5-10MB per domain (current usage < 100KB)
- **Hydration delay**: ~10ms on page load (acceptable)
- **Optimistic updates**: Instant UI feedback (0ms perceived latency)

### Server-Side Performance (Phase 3)
- **Redis latency**: < 5ms (local network to Hetzner)
- **PostgreSQL query**: < 50ms (indexed queries)
- **Full cart sync**: < 100ms total (acceptable for cross-device sync)
- **Offline queue**: Sync on reconnect (non-blocking)

## Summary

**Phase 2 (Current)**:
- Simple client-side persistence via Zustand + localStorage
- Perfect for anonymous browsing and single-device shopping
- No backend calls for cart operations

**Phase 3 (Planned)**:
- Hybrid architecture: Zustand for UI, Medusa for persistence
- Multi-device cart sync via Redis sessions
- Customer authentication via Medusa CIAM
- Order history and warranty claims in PostgreSQL
- Optimistic updates for instant UX + server validation

**Key Principle**: Use the infrastructure already deployed (Medusa + Redis + PostgreSQL) instead of adding new storage services (Cloudflare KV/D1). Zustand remains for UI state and optimistic updates.
