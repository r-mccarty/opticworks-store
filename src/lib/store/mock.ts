import { programs } from "@/content/programs"

import type { BagLine, CheckoutContact, CheckoutQuote, Offer, StoreBackend } from "./types"
import { StoreError } from "./types"

/**
 * List prices for the mock store, in cents. Owner-provided 2026-10-30 and
 * subject to change; the real prices live in the backend
 * (infrastructure/ansible/scripts/catalog_offers.py). Keep the two in step.
 */
export const MOCK_PRICES: Record<string, number> = {
  vmc: 5999_00,
  "mach-1": 5999_00,
}

const MOCK_SHIPPING = [{ id: "mock-freight", name: "Freight (simulated, no charge)", amount: 0 }]

export const mockOffers: Offer[] = programs.flatMap((program) => {
  const handle = program.commerce?.productHandle
  if (!handle || MOCK_PRICES[handle] === undefined) return []
  return [
    {
      handle,
      title: program.name,
      variantId: `mock_${handle}`,
      price: MOCK_PRICES[handle],
      currency: "usd",
    },
  ]
})

interface MockCheckout {
  lines: BagLine[]
  contact: CheckoutContact
  shippingId?: string
}

function decode(token: string): MockCheckout {
  try {
    const state = JSON.parse(token) as MockCheckout
    if (Array.isArray(state.lines) && state.contact?.email) return state
  } catch {
    // fall through
  }
  throw new StoreError("Your checkout expired. Please start again.")
}

function quote(state: MockCheckout): CheckoutQuote {
  const lines = state.lines.flatMap((line) => {
    const offer = mockOffers.find((o) => o.handle === line.handle)
    if (!offer) return []
    return [
      {
        handle: offer.handle,
        title: offer.title,
        quantity: line.quantity,
        unitPrice: offer.price,
        total: offer.price * line.quantity,
      },
    ]
  })
  if (!lines.length) throw new StoreError("Your bag is empty.")
  const subtotal = lines.reduce((sum, line) => sum + line.total, 0)
  const shipping = MOCK_SHIPPING.find((option) => option.id === state.shippingId)?.amount ?? 0
  return {
    currency: "usd",
    lines,
    shippingOptions: MOCK_SHIPPING,
    selectedShippingId: state.shippingId,
    subtotal,
    shipping,
    tax: 0,
    total: subtotal + shipping,
    placeOrderBlocked: state.shippingId ? undefined : "Choose a shipping method.",
  }
}

/** In-memory store: real catalog content, mock prices, no network, no payment. */
export const mockBackend: StoreBackend = {
  mode: "mock",
  async listOffers() {
    return mockOffers
  },
  async startCheckout(lines, contact) {
    const state: MockCheckout = { lines, contact }
    return { token: JSON.stringify(state), quote: quote(state) }
  },
  async selectShipping(token, optionId) {
    const state = decode(token)
    if (!MOCK_SHIPPING.some((option) => option.id === optionId))
      throw new StoreError("That shipping method isn't available.")
    const next = { ...state, shippingId: optionId }
    return { token: JSON.stringify(next), quote: quote(next) }
  },
  async placeOrder(token) {
    const state = decode(token)
    const result = quote(state)
    if (result.placeOrderBlocked) throw new StoreError(result.placeOrderBlocked)
    return {
      id: `MOCK-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      email: state.contact.email,
      currency: result.currency,
      total: result.total,
      lines: result.lines,
      simulated: true,
    }
  },
}
