import type { Metadata } from "next"

import { ServiceUnavailable } from "@/components/ServiceUnavailable"
import ResetPasswordPage from "@/components/legacy/ResetPasswordPage"
import { COMMERCE_ENABLED } from "@/lib/commerce"

export const metadata: Metadata = {
  title: "Password reset - OpticWorks",
  robots: { index: false },
}

export default function Page() {
  if (!COMMERCE_ENABLED) {
    return (
      <ServiceUnavailable
        title="Password reset unavailable"
        description="Customer accounts are offline while we rebuild our online store."
      />
    )
  }

  return <ResetPasswordPage />
}
