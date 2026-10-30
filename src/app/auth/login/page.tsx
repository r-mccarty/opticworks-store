import type { Metadata } from "next"

import { ServiceUnavailable } from "@/components/ServiceUnavailable"

// Legacy commerce route: the URL is kept, but nothing from the archived storefront is rendered
// or bundled while commerce is offline (see src/lib/commerce.ts and src/components/legacy/).
export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
}

export default function Page() {
  return (
    <ServiceUnavailable
      title="Sign in unavailable"
      description="Customer accounts are offline while we rebuild our online store."
    />
  )
}
