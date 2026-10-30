import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { PageIntro, Section } from "@/components/site/primitives"
import { CheckoutFlow } from "@/components/store/CheckoutFlow"
import { StoreNotice } from "@/components/store/StoreNotice"
import { getBackend, pricedBag } from "@/lib/store/server"

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
}

export default async function CheckoutPage() {
  const backend = await getBackend()
  if (!backend) notFound()
  const { lines, currency } = await pricedBag(backend)
  if (!lines.length) redirect("/cart")

  return (
    <main>
      <PageIntro label="Checkout" title="Checkout.">
        <StoreNotice mode={backend.mode} />
      </PageIntro>
      <Section>
        <CheckoutFlow lines={lines} currency={currency} />
      </Section>
    </main>
  )
}
