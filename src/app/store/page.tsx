import type { Metadata } from "next"

import { ServiceUnavailable } from "@/components/ServiceUnavailable"

// Legacy commerce route: the URL is kept, but nothing from the archived storefront is rendered
// or bundled while commerce is offline (see src/lib/commerce.ts and src/components/legacy/).
export const metadata: Metadata = {
  title: "Store",
  robots: { index: false },
}

export default function Page() {
  return (
    <ServiceUnavailable
      title="Online store unavailable"
      description="Our online store is offline while we rebuild it. Products are not available to order right now."
    />
  )
}
