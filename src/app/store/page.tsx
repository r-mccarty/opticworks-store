import { Metadata } from "next"

import { FadeContainer, FadeDiv } from "@/components/Fade"
import { ProductGrid } from "@/components/store/ProductGrid"
import { listProducts } from "@/lib/api/medusa"
import { siteConfig } from "@/app/siteConfig"

export const metadata: Metadata = {
  title: `Store - ${siteConfig.name}`,
  description:
    "Shop presence sensors, accessories, and dashboards for real‑time spatial awareness.",
}

// Revalidate product data every 5 minutes to pick up image/price changes
export const revalidate = 300

export default async function StorePage() {
  const products = await listProducts()

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,oklch(0.75_0.18_55/0.12),transparent_60%),radial-gradient(circle_at_10%_70%,oklch(0.7_0.12_240/0.14),transparent_55%)]" />

      <FadeContainer className="relative px-7 pt-28 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <FadeDiv className="mb-16 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.4em] text-muted-foreground">
              OpticWorks Store
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Build automations that see your world
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Kits arrive flashed, calibrated, and paired with the same presence
              engine you see in our demos. Add mounts, dashboards, and modules to
              expand coverage across every room.
            </p>
          </FadeDiv>

          <FadeDiv>
            <ProductGrid products={products} />
          </FadeDiv>
        </div>
      </FadeContainer>
    </main>
  )
}
