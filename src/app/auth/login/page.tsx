import type { Metadata } from "next"

import { ServiceUnavailable } from "@/components/ServiceUnavailable"
import LoginPage from "@/components/legacy/LoginPage"
import { COMMERCE_ENABLED } from "@/lib/commerce"

export const metadata: Metadata = {
  title: "Sign in - OpticWorks",
  robots: { index: false },
}

export default function Page() {
  if (!COMMERCE_ENABLED) {
    return (
      <ServiceUnavailable
        title="Sign in unavailable"
        description="Customer accounts are offline while we rebuild our online store."
      />
    )
  }

  return <LoginPage />
}
