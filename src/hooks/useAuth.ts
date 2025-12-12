"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MedusaCustomer } from '@/lib/api/medusa'
import { updateCart } from '@/lib/api/medusa'
import { useCart } from './useCart'

interface AuthState {
  // State
  customer: MedusaCustomer | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  setCustomer: (customer: MedusaCustomer | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => void

  // Auth flow actions (call API routes, not direct Medusa)
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<boolean>
  fetchCustomer: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AUTH_STORAGE_KEY = "opticworks-auth"

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      customer: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Basic setters
      setCustomer: (customer) => set({
        customer,
        isAuthenticated: customer !== null,
        error: null
      }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error, isLoading: false }),

      logout: async () => {
        try {
          // Call logout API route to clear httpOnly cookie
          await fetch('/api/auth/logout', { method: 'POST' })
        } catch (error) {
          console.error('[useAuth] Logout error:', error)
        }
        set({
          customer: null,
          isAuthenticated: false,
          error: null
        })
      },

      // Login via API route (handles httpOnly cookie)
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })

        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })

          const data = await response.json()

          if (!response.ok) {
            set({
              error: data.error || 'Login failed',
              isLoading: false
            })
            return false
          }

          set({
            customer: data.customer,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })

          // Link existing cart to customer for order history/pricing
          const cartId = useCart.getState().getCartId()
          if (cartId && data.customer?.id) {
            try {
              await updateCart(cartId, { customer_id: data.customer.id, email: data.customer.email })
            } catch (linkError) {
              console.warn("[useAuth] Failed to link cart to customer:", linkError)
            }
          }

          return true
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Login failed'
          set({ error: message, isLoading: false })
          return false
        }
      },

      // Register via API route
      register: async (
        email: string,
        password: string,
        firstName?: string,
        lastName?: string
      ) => {
        set({ isLoading: true, error: null })

        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              password,
              first_name: firstName,
              last_name: lastName
            }),
          })

          const data = await response.json()

          if (!response.ok) {
            set({
              error: data.error || 'Registration failed',
              isLoading: false
            })
            return false
          }

          set({
            customer: data.customer,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })

          // Link existing cart to customer for order history/pricing
          const cartId = useCart.getState().getCartId()
          if (cartId && data.customer?.id) {
            try {
              await updateCart(cartId, { customer_id: data.customer.id, email: data.customer.email })
            } catch (linkError) {
              console.warn("[useAuth] Failed to link cart to customer:", linkError)
            }
          }

          return true
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Registration failed'
          set({ error: message, isLoading: false })
          return false
        }
      },

      // Refresh session via API (renews JWT cookie)
      refreshSession: async () => {
        try {
          const response = await fetch('/api/auth/refresh', { method: 'POST' })
          if (!response.ok) {
            // Refresh failed; treat as unauthenticated
            set({ isAuthenticated: false, customer: null })
          }
        } catch (error) {
          console.warn("[useAuth] Refresh session error:", error)
        }
      },

      // Fetch current customer from session
      fetchCustomer: async () => {
        const { isAuthenticated } = get()
        if (!isAuthenticated) return

        set({ isLoading: true })

        try {
          const response = await fetch('/api/auth/me')

          if (!response.ok) {
            // Session expired or invalid
            set({
              customer: null,
              isAuthenticated: false,
              isLoading: false
            })
            return
          }

          const data = await response.json()
          set({
            customer: data.customer,
            isLoading: false
          })
        } catch (error) {
          console.error('[useAuth] Fetch customer error:', error)
          set({ isLoading: false })
        }
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      version: 1,
      // Only persist minimal auth state, not loading/error
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        // Don't persist customer data - fetch fresh on load
      }),
    }
  )
)

// Hook to check auth status on mount
export function useAuthInit() {
  const { isAuthenticated, fetchCustomer, refreshSession } = useAuth()

  // Fetch customer on mount if authenticated
  if (typeof window !== 'undefined' && isAuthenticated) {
    refreshSession().finally(() => {
      fetchCustomer()
    })
  }
}
