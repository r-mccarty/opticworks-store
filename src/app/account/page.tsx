import type { Metadata } from "next"

import { ServiceUnavailable } from "@/components/ServiceUnavailable"
import AccountPage from "@/components/legacy/AccountPage"
import { COMMERCE_ENABLED } from "@/lib/commerce"

export const metadata: Metadata = {
  title: "Account - OpticWorks",
  robots: { index: false },
}

export default function Page() {
  if (!COMMERCE_ENABLED) {
    return (
      <ServiceUnavailable
        title="Account unavailable"
        description="Customer accounts are offline while we rebuild our online store."
      />
    )
  }

  return <AccountPage />
}
