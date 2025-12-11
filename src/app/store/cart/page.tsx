import { Metadata } from "next"
import { CartPage } from "@/components/store/CartPage"
import { getCartSSR } from "@/lib/api/medusa-server"

export const metadata: Metadata = {
  title: "Cart - OpticWorks Presence Sensors",
  description: "Review your OpticWorks presence hardware and complete checkout.",
}

/**
 * Cart page with SSR cart loading.
 *
 * Fetches cart on server to eliminate hydration mismatch and
 * provide faster initial render (no loading spinner).
 *
 * @see Phase 4 of Architecture Audit
 */
export default async function Cart() {
  // Fetch cart on server (uses cart ID from cookie)
  const initialCart = await getCartSSR()

  return <CartPage initialCart={initialCart} />
}
