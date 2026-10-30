/**
 * Store domain types shared by the mock and Medusa backends.
 *
 * Money is always integer minor units (cents). Medusa v2 returns major units;
 * the Medusa backend converts at the boundary.
 */

export type StoreMode = "off" | "mock" | "medusa"

/** A purchasable product: one per program, keyed by `Program.commerce.productHandle`. */
export interface Offer {
  handle: string
  title: string
  variantId: string
  /** Unit price in minor units. */
  price: number
  currency: string
}

/** A line in the pre-checkout bag (kept in a cookie). Prices are never stored. */
export interface BagLine {
  handle: string
  quantity: number
}

export interface CheckoutContact {
  email: string
  firstName: string
  lastName: string
  address1: string
  address2?: string
  city: string
  /** Two-letter US state code. */
  state: string
  postalCode: string
  phone?: string
}

export interface ShippingChoice {
  id: string
  name: string
  amount: number
}

export interface QuoteLine {
  handle: string
  title: string
  quantity: number
  unitPrice: number
  total: number
}

export interface CheckoutQuote {
  currency: string
  lines: QuoteLine[]
  shippingOptions: ShippingChoice[]
  selectedShippingId?: string
  subtotal: number
  shipping: number
  tax: number
  total: number
  /** Present when the order can't be placed yet, with the reason to show. */
  placeOrderBlocked?: string
}

export interface OrderConfirmation {
  id: string
  email: string
  currency: string
  total: number
  lines: QuoteLine[]
  /** True when no real order exists (mock mode). */
  simulated: boolean
}

/**
 * A checkout is identified by an opaque token the caller stores in a cookie:
 * the Medusa cart id, or the encoded mock state.
 */
export interface StoreBackend {
  mode: Exclude<StoreMode, "off">
  listOffers(): Promise<Offer[]>
  startCheckout(lines: BagLine[], contact: CheckoutContact): Promise<{ token: string; quote: CheckoutQuote }>
  selectShipping(token: string, optionId: string): Promise<{ token: string; quote: CheckoutQuote }>
  placeOrder(token: string): Promise<OrderConfirmation>
}

/** An error whose message is safe to show to the shopper. */
export class StoreError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "StoreError"
  }
}
