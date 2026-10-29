import { Metadata } from "next"
import { CartPage } from "@/components/store/CartPage"
import { getCartSSR } from "@/lib/api/medusa-server"
import { ServiceUnavailable } from "@/components/ServiceUnavailable"
import { COMMERCE_ENABLED } from "@/lib/commerce"

export const metadata: Metadata = {
  title: "Cart - OpticWorks Presence Sensors",
  robots: { index: false },
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
  if (!COMMERCE_ENABLED) {
    return (
      <ServiceUnavailable
        title="Cart unavailable"
        description="Online checkout is offline while we rebuild our online store. No new orders can be placed right now."
      />
    )
  }

  // Fetch cart on server (uses cart ID from cookie)
  const initialCart = await getCartSSR()

  return <CartPage initialCart={initialCart} />
}
