/**
 * Client-side API functions for managing saved payment methods.
 *
 * These functions communicate with the Next.js API proxy which forwards
 * requests to the Medusa backend with proper authentication.
 */

/**
 * Card details from Stripe
 */
export interface CardDetails {
  brand: string
  last4: string
  exp_month: number
  exp_year: number
}

/**
 * Saved payment method from Stripe via Medusa
 */
export interface SavedPaymentMethod {
  id: string
  provider_id: string
  data: {
    id: string
    card?: CardDetails
    [key: string]: unknown
  }
}

/**
 * Response from the payment methods API
 */
interface PaymentMethodsResponse {
  payment_methods: SavedPaymentMethod[]
  error?: string
}

/**
 * Fetch all saved payment methods for the authenticated customer.
 *
 * @returns Array of saved payment methods
 * @throws Error if not authenticated or request fails
 */
export async function getSavedPaymentMethods(): Promise<SavedPaymentMethod[]> {
  const response = await fetch("/api/account/payment-methods", {
    method: "GET",
    credentials: "include", // Include cookies
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || `Failed to fetch payment methods: ${response.status}`)
  }

  const data: PaymentMethodsResponse = await response.json()
  return data.payment_methods || []
}

/**
 * Delete a saved payment method.
 *
 * @param paymentMethodId - The ID of the payment method to delete
 * @throws Error if not authenticated or request fails
 */
export async function deletePaymentMethod(paymentMethodId: string): Promise<void> {
  const response = await fetch(
    `/api/account/payment-methods?id=${encodeURIComponent(paymentMethodId)}`,
    {
      method: "DELETE",
      credentials: "include", // Include cookies
    }
  )

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || `Failed to delete payment method: ${response.status}`)
  }
}

/**
 * Get a display-friendly card brand name with emoji.
 *
 * @param brand - Stripe card brand string (e.g., "visa", "mastercard")
 * @returns Formatted brand name
 */
export function getCardBrandDisplay(brand: string): string {
  const brandMap: Record<string, string> = {
    visa: "Visa",
    mastercard: "Mastercard",
    amex: "American Express",
    discover: "Discover",
    diners: "Diners Club",
    jcb: "JCB",
    unionpay: "UnionPay",
  }

  return brandMap[brand.toLowerCase()] || brand
}

/**
 * Format card expiry as MM/YY.
 *
 * @param expMonth - Expiration month (1-12)
 * @param expYear - Expiration year (4-digit)
 * @returns Formatted expiry string
 */
export function formatCardExpiry(expMonth: number, expYear: number): string {
  const month = expMonth.toString().padStart(2, "0")
  const year = expYear.toString().slice(-2)
  return `${month}/${year}`
}
