import type { Product } from "@/lib/products"

export interface CartItem extends Product {
  quantity: number
  /** Medusa line item ID (set when synced with Medusa cart) */
  lineItemId?: string
  /** Medusa variant ID for the product */
  variantId?: string
}

export interface PaymentSession {
  sessionId: string
  items: CartItem[]
}

/** State persisted to localStorage */
export interface PersistedCartState {
  /** Medusa cart ID */
  cartId: string | null
  /** Medusa region ID */
  regionId: string | null
}

/** Cart sync status */
export type CartSyncStatus = "idle" | "syncing" | "synced" | "error"
