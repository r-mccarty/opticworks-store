# State Management

Zustand-based state management with hybrid local + server persistence.

---

## Architecture

| Layer | Storage | Scope |
|-------|---------|-------|
| UI state | Zustand (memory) | Single session |
| Cart items | Zustand + localStorage + Medusa | Cross-device |
| Customer session | Medusa + httpOnly cookies | Cross-device |

---

## Cart Store

**File**: `src/hooks/useCart.ts`

```typescript
export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: async (product) => {
        // 1. Optimistic update
        set({ items: [...items, product] })

        // 2. Sync to Medusa
        await medusaApi.addLineItem(cartId, { variant_id: product.variantId })
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
)
```

### Persistence Rules

**Persisted**: Cart items, cart ID, payment session
**Not persisted**: `isOpen`, loading states, UI flags

---

## Auth Store

**File**: `src/hooks/useAuth.ts`

```typescript
export const useAuth = create<AuthStore>()((set) => ({
  customer: null,
  isAuthenticated: false,
  login: async (email, password) => { /* ... */ },
  logout: async () => { /* ... */ },
}))
```

Sessions stored in httpOnly cookies by Medusa.

---

## Debugging

**Browser DevTools** > Application > Local Storage:
- `cart-storage` - Cart state
- `support-storage` - Support forms

**Clear state**:
```javascript
localStorage.clear()
```

---

## Best Practices

1. **Selective persistence** - Only persist necessary data
2. **Optimistic updates** - Zustand first, then server
3. **Handle hydration** - Account for SSR/client differences
4. **Exclude UI state** - Don't persist modals, loading flags
