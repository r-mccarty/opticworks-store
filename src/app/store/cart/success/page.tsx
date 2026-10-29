import type { Metadata } from "next"

import { ServiceUnavailable } from "@/components/ServiceUnavailable"
import PaymentSuccessPage from "@/components/legacy/PaymentSuccessPage"
import { COMMERCE_ENABLED } from "@/lib/commerce"

export const metadata: Metadata = {
  title: "Order confirmation - OpticWorks",
  robots: { index: false },
}

export default function Page() {
  if (!COMMERCE_ENABLED) {
    return (
      <ServiceUnavailable
        title="Order confirmation unavailable"
        description="Online checkout is offline while we rebuild our online store. No new orders can be placed right now."
      />
    )
  }

  return <PaymentSuccessPage />
}
