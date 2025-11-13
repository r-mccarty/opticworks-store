"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from "sonner"
import { Product } from '@/lib/products'

export interface CartItem extends Product {
  quantity: number
}

interface PaymentSession {
  sessionId: string;
  items: CartItem[];
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  paymentSession: PaymentSession | null;
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  setIsOpen: (open: boolean) => void
  setPaymentSession: (sessionId: string) => void;
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
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          })
        } else {
          set({
            items: [...items, { ...product, quantity: 1 }]
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
              ? { ...item, quantity }
              : item
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
        const currentItems = get().items;
        if (currentItems.length > 0) {
          set({
            paymentSession: {
              sessionId: sessionId,
              items: currentItems
            },
            items: [] // Clear the cart
          });
        }
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        paymentSession: state.paymentSession
      })
    }
  )
)