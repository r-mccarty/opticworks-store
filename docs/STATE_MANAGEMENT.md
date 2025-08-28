# State Management

This document explains how state management works in the OpticWorks e-commerce platform.

## Architecture Overview

The application uses **Zustand** with **persistence middleware** for client-side state management. This provides a simple, TypeScript-friendly alternative to Redux with built-in persistence capabilities.

## What "Persistence Middleware" Actually Means

**Important Distinction**: The persistence mentioned in this codebase is **client-side browser persistence**, not server-side persistence.

### Client-Side Persistence (What We Use)
- **Storage**: Browser's `localStorage` 
- **Scope**: Single device/browser only
- **Use Case**: Maintain user state across browser sessions
- **Implementation**: Zustand's `persist` middleware

### Server-Side Persistence (What We Don't Use)
- **Storage**: Services like Cloudflare Workers KV, Redis, database
- **Scope**: Cross-device, multi-user
- **Use Case**: Shared state, user accounts, cross-device sync
- **Implementation**: Would require API endpoints and authentication

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
      name: 'cart-storage',           // localStorage key
      partialize: (state) => ({ 
        items: state.items           // Only persist cart items
      })
    }
  )
)
```

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
- **Cart items**: Products and quantities
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

## Future Considerations

### When to Add Server-Side State
- **User authentication**: Login/logout state
- **Cross-device sync**: Logged-in user cart sync
- **Real-time features**: Live support chat
- **Analytics**: User behavior tracking

### Potential Upgrades
- **Supabase integration**: User accounts and cloud sync
- **Redis sessions**: Server-side cart management
- **WebSocket state**: Real-time updates
- **Optimistic updates**: Better UX for API calls

## Debugging State

### Browser DevTools
1. **Application tab** → Storage → Local Storage
2. **Keys**: `cart-storage`, `support-storage`
3. **Values**: JSON-serialized state objects

### Zustand DevTools
```typescript
// Add to store for development debugging
import { devtools } from 'zustand/middleware'

export const useStore = create<Store>()(
  devtools(
    persist(/* store config */),
    { name: 'store-name' }
  )
)
```

This client-side persistence approach provides excellent UX for anonymous users while keeping the architecture simple and performant.