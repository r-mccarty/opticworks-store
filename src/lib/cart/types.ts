import type { Product } from "@/lib/products"

export interface CartItem extends Product {
  quantity: number
}

export interface PaymentSession {
  sessionId: string
  items: CartItem[]
}
