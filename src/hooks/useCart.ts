"use client"

import { create } from 'zustand'
import { persist, type PersistOptions } from 'zustand/middleware'
import { toast } from "sonner"
import type { Product } from '@/lib/products'
import type { CartItem, PaymentSession } from '@/lib/cart/types'
import { normalizeCartItem, normalizeCartItems } from '@/lib/cart/utils'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  paymentSession: PaymentSession | null
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  setIsOpen: (open: boolean) => void
  setPaymentSession: (sessionId: string) => void
}

const CART_STORAGE_VERSION = 1

const persistOptions: PersistOptions<CartStore, Pick<CartStore, "items" | "paymentSession">> = {
  name: 'cart-storage',
  version: CART_STORAGE_VERSION,
  partialize: (state) => ({
    items: state.items,
    paymentSession: state.paymentSession,
  }),
  migrate: (persistedState: unknown) => {
    const state = persistedState as Pick<CartStore, "items" | "paymentSession"> | undefined
    if (!state) {
      return {
        items: [],
        paymentSession: null,
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
    }
  },
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      paymentSession: null,
      
      addToCart: (product) => {
        const items = get().items
        const existingItem = items.find(item => item.id === product.id)
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item.id === product.id
                ? normalizeCartItem(item, item.quantity + 1)
                : normalizeCartItem(item)
            )
          })
        } else {
          set({
            items: [
              ...items.map(normalizeCartItem),
              normalizeCartItem(product)
            ]
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
      },
      
      removeFromCart: (productId) => {
        set({
          items: get().items.filter(item => item.id !== productId)
        })
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId)
          return
        }
        
        set({
          items: get().items.map(item =>
            item.id === productId
              ? normalizeCartItem(item, quantity)
              : normalizeCartItem(item)
          )
        })
      },
      
      clearCart: () => {
        set({ items: [] })
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
      }
    }),
    persistOptions
  )
)

export type { CartItem, PaymentSession }
