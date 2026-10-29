import type { Metadata } from "next"

import { ServiceUnavailable } from "@/components/ServiceUnavailable"
import RegisterPage from "@/components/legacy/RegisterPage"
import { COMMERCE_ENABLED } from "@/lib/commerce"

export const metadata: Metadata = {
  title: "Account registration - OpticWorks",
  robots: { index: false },
}

export default function Page() {
  if (!COMMERCE_ENABLED) {
    return (
      <ServiceUnavailable
        title="Account registration unavailable"
        description="Customer accounts are offline while we rebuild our online store."
      />
    )
  }

  return <RegisterPage />
}
