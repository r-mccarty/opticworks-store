import type { Stripe } from "@stripe/stripe-js"

export type StripeCheckoutRedirectBehavior = "always" | "if_required" | "never"

export interface StripeCheckoutConfirmOptions {
  redirect?: StripeCheckoutRedirectBehavior
  returnUrl?: string
}

export interface StripeCheckoutConfirmResult {
  error?: {
    message?: string
    type?: string
  }
  session?: {
    id: string
  }
}

export interface StripeCheckoutAddress {
  line1?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
}

export interface StripeCheckoutAddressChangeEvent {
  complete: boolean
  value?: {
    address?: StripeCheckoutAddress
  }
}

export interface StripeCheckoutMountable {
  mount(domTarget: string | HTMLElement): void
  unmount(): void
}

export interface StripeCheckoutAddressElement extends StripeCheckoutMountable {
  on(event: "change", handler: (event: StripeCheckoutAddressChangeEvent) => void): void
}

export type StripeCheckoutPaymentElement = StripeCheckoutMountable

export interface StripeCheckoutSession {
  id: string
}

export interface UpdateEmailError {
  message?: string
  type?: string
}

export type StripeCheckoutUpdateEmailResult =
  | { type: "success"; session: StripeCheckoutSession }
  | { type: "error"; error: UpdateEmailError }

export interface StripeCheckoutInstance {
  createPaymentElement(): StripeCheckoutPaymentElement
  createShippingAddressElement(): StripeCheckoutAddressElement
  updateEmail(email: string): Promise<StripeCheckoutUpdateEmailResult>
  confirm(options?: StripeCheckoutConfirmOptions): Promise<StripeCheckoutConfirmResult>
}

export interface StripeCheckoutFont {
  family: string
  src: string
  style?: string
  weight?: string
  display?: string
}

export interface StripeCheckoutElementsOptions {
  appearance?: Record<string, unknown>
  fonts?: StripeCheckoutFont[]
}

export interface StripeCheckoutInitOptions {
  fetchClientSecret: () => Promise<string>
  elementsOptions?: StripeCheckoutElementsOptions
}

export type StripeWithCheckout = Stripe & {
  initCheckout(options: StripeCheckoutInitOptions): Promise<StripeCheckoutInstance>
}
