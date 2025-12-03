"use client"

import { create } from 'zustand'
import { persist, type PersistOptions } from 'zustand/middleware'
import { toast } from "sonner"
import type { Product } from '@/lib/products'
import type { CartItem, PaymentSession, CartSyncStatus } from '@/lib/cart/types'
import { normalizeCartItem, normalizeCartItems } from '@/lib/cart/utils'
import {
  medusaConfig,
  createCart as medusaCreateCart,
  getCart as medusaGetCart,
  addLineItem as medusaAddLineItem,
  updateLineItem as medusaUpdateLineItem,
  removeLineItem as medusaRemoveLineItem,
  getDefaultRegionId,
  type MedusaLineItem,
} from '@/lib/api/medusa'

interface CartStore {
  // State
  items: CartItem[]
  isOpen: boolean
  paymentSession: PaymentSession | null

  // Medusa cart state
  cartId: string | null
  regionId: string | null
  syncStatus: CartSyncStatus
  syncError: string | null

  // Actions
  addToCart: (product: Product, variantId?: string) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  setIsOpen: (open: boolean) => void
  setPaymentSession: (sessionId: string) => void

  // Medusa cart actions
  initializeCart: () => Promise<void>
  syncWithMedusa: () => Promise<void>
  getCartId: () => string | null
}

const CART_STORAGE_VERSION = 2 // Bumped for Medusa cart support

// Transform Medusa line item to local CartItem
// Medusa v2 stores prices in MAJOR units (dollars), not cents
const transformMedusaLineItem = (item: MedusaLineItem, fallbackProducts: Map<string, Product>): CartItem => {
  const fallback = fallbackProducts.get(item.product_id)
  return {
    id: item.product_id,
    name: item.title,
    description: item.description ?? fallback?.description ?? "",
    price: item.unit_price,
    image: item.thumbnail ?? fallback?.image ?? "",
    category: fallback?.category ?? "sensor",
    specifications: fallback?.specifications ?? [],
    inStock: true,
    quantity: item.quantity,
    lineItemId: item.id,
    variantId: item.variant_id,
  }
}

// Build a map of products for fallback data
const productCache: Map<string, Product> = new Map()

const persistOptions: PersistOptions<CartStore, Pick<CartStore, "items" | "paymentSession" | "cartId" | "regionId">> = {
  name: 'cart-storage',
  version: CART_STORAGE_VERSION,
  partialize: (state) => ({
    items: state.items,
    paymentSession: state.paymentSession,
    cartId: state.cartId,
    regionId: state.regionId,
  }),
  migrate: (persistedState: unknown) => {
    const state = persistedState as Pick<CartStore, "items" | "paymentSession" | "cartId" | "regionId"> | undefined
    if (!state) {
      return {
        items: [],
        paymentSession: null,
        cartId: null,
        regionId: null,
      }
    }

    return {
      ...state,
      items: normalizeCartItems(state.items),
      paymentSession: state.paymentSession
        ? {
            ...state.paymentSession,
            items: normalizeCartItems(state.paymentSession.items),
          }
        : null,
      cartId: state.cartId ?? null,
      regionId: state.regionId ?? null,
    }
  },
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      isOpen: false,
      paymentSession: null,
      cartId: null,
      regionId: null,
      syncStatus: "idle" as CartSyncStatus,
      syncError: null,

      // Initialize cart (get or create Medusa cart)
      initializeCart: async () => {
        if (!medusaConfig.enabled) {
          return
        }

        const { cartId, regionId } = get()
        set({ syncStatus: "syncing", syncError: null })

        try {
          // If we have a cart ID, try to restore it
          if (cartId) {
            try {
              const cart = await medusaGetCart(cartId)
              const items = cart.items.map((item) => transformMedusaLineItem(item, productCache))
              set({
                items,
                regionId: cart.region_id,
                syncStatus: "synced"
              })
              return
            } catch (error) {
              console.warn("[cart] Failed to restore cart, creating new one:", error)
            }
          }

          // Get or create region
          let activeRegionId = regionId
          if (!activeRegionId) {
            activeRegionId = await getDefaultRegionId()
          }

          // Create new cart
          const newCart = await medusaCreateCart(activeRegionId)
          set({
            cartId: newCart.id,
            regionId: activeRegionId,
            items: [],
            syncStatus: "synced"
          })
        } catch (error) {
          console.error("[cart] Failed to initialize cart:", error)
          set({
            syncStatus: "error",
            syncError: error instanceof Error ? error.message : "Failed to initialize cart"
          })
        }
      },

      // Sync local state with Medusa (fetch latest cart state)
      syncWithMedusa: async () => {
        if (!medusaConfig.enabled) {
          return
        }

        const { cartId } = get()
        if (!cartId) {
          await get().initializeCart()
          return
        }

        set({ syncStatus: "syncing", syncError: null })

        try {
          const cart = await medusaGetCart(cartId)
          const items = cart.items.map((item) => transformMedusaLineItem(item, productCache))
          set({ items, syncStatus: "synced" })
        } catch (error) {
          console.error("[cart] Failed to sync with Medusa:", error)
          set({
            syncStatus: "error",
            syncError: error instanceof Error ? error.message : "Failed to sync cart"
          })
        }
      },

      addToCart: async (product, variantId) => {
        // Get variant ID from parameter or product (Medusa products include variantId)
        const productVariantId = variantId ?? product.variantId

        // Require variant ID for Medusa integration
        if (!productVariantId) {
          console.error("[cart] No variant ID available for product:", product.id)
          toast.error("Unable to add to cart", {
            description: "This product is missing required data. Please refresh the page.",
          })
          return
        }

        const items = get().items
        const existingItem = items.find(item => item.id === product.id)

        // Cache product for later use
        productCache.set(product.id, product)

        // Optimistic update
        if (existingItem) {
          set({
            items: items.map(item =>
              item.id === product.id
                ? normalizeCartItem(item, item.quantity + 1)
                : normalizeCartItem(item)
            )
          })
        } else {
          const newItem = normalizeCartItem(product)
          newItem.variantId = productVariantId
          set({
            items: [...items.map(normalizeCartItem), newItem]
          })
        }

        toast.success("Added to cart", {
          description: `${product.name} has been added to your cart.`,
          action: {
            label: "View cart",
            onClick: () => {
              window.location.href = "/store/cart"
            },
          },
        })

        // Sync with Medusa (required for checkout)
        try {
          let { cartId, regionId } = get()

          // Initialize cart if needed
          if (!cartId) {
            if (!regionId) {
              regionId = await getDefaultRegionId()
            }
            const newCart = await medusaCreateCart(regionId)
            cartId = newCart.id
            set({ cartId, regionId })
          }

          // Add to Medusa cart
          const updatedCart = await medusaAddLineItem(cartId, productVariantId, 1)
          const syncedItems = updatedCart.items.map((item) => transformMedusaLineItem(item, productCache))
          set({ items: syncedItems, syncStatus: "synced" })
        } catch (error) {
          console.error("[cart] Failed to add item to Medusa cart:", error)
          // Keep optimistic update but mark sync as failed
          set({ syncStatus: "error", syncError: "Failed to sync cart with server" })
        }
      },

      removeFromCart: async (productId) => {
        const items = get().items
        const itemToRemove = items.find(item => item.id === productId)

        // Optimistic update
        set({
          items: items.filter(item => item.id !== productId)
        })

        // Sync with Medusa if enabled and we have a line item ID
        if (medusaConfig.enabled && itemToRemove?.lineItemId) {
          try {
            const { cartId } = get()
            if (cartId) {
              const updatedCart = await medusaRemoveLineItem(cartId, itemToRemove.lineItemId)
              const syncedItems = updatedCart.items.map((item) => transformMedusaLineItem(item, productCache))
              set({ items: syncedItems, syncStatus: "synced" })
            }
          } catch (error) {
            console.error("[cart] Failed to remove item from Medusa cart:", error)
          }
        }
      },

      updateQuantity: async (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId)
          return
        }

        const items = get().items
        const itemToUpdate = items.find(item => item.id === productId)

        // Optimistic update
        set({
          items: items.map(item =>
            item.id === productId
              ? normalizeCartItem(item, quantity)
              : normalizeCartItem(item)
          )
        })

        // Sync with Medusa if enabled and we have a line item ID
        if (medusaConfig.enabled && itemToUpdate?.lineItemId) {
          try {
            const { cartId } = get()
            if (cartId) {
              const updatedCart = await medusaUpdateLineItem(cartId, itemToUpdate.lineItemId, quantity)
              const syncedItems = updatedCart.items.map((item) => transformMedusaLineItem(item, productCache))
              set({ items: syncedItems, syncStatus: "synced" })
            }
          } catch (error) {
            console.error("[cart] Failed to update item in Medusa cart:", error)
          }
        }
      },

      clearCart: () => {
        set({ items: [], cartId: null, syncStatus: "idle" })
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
      },

      setIsOpen: (open) => {
        set({ isOpen: open })
      },

      setPaymentSession: (sessionId) => {
        const currentItems = get().items
        if (currentItems.length > 0) {
          const sessionItems = normalizeCartItems(currentItems)
          set({
            paymentSession: {
              sessionId,
              items: sessionItems
            },
            items: [] // Clear the cart
          })
        }
      },

      getCartId: () => {
        return get().cartId
      },
    }),
    persistOptions
  )
)

export type { CartItem, PaymentSession }
