import { Metadata } from "next"

import { FadeContainer, FadeDiv } from "@/components/Fade"
import { ProductGrid } from "@/components/store/ProductGrid"
import { listProducts } from "@/lib/api/medusa"

export const metadata: Metadata = {
  title: "Store - OpticWorks Presence Lab",
  description:
    "Shop Bed Presence Sensor kits, accessories, and dashboards. Everything ships tuned for Home Assistant power users.",
}

export default async function StorePage() {
  const products = await listProducts()

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(251,191,36,0.12),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_70%,rgba(56,189,248,0.16),transparent_55%)]" />

      <FadeContainer className="relative px-7 pt-28 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <FadeDiv className="mb-16 text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-white/60">
              OpticWorks Store
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Build the most reliable bed automations on the planet
            </h1>
            <p className="mt-6 text-lg leading-8 text-white/70">
              Kits arrive flashed, calibrated, and paired with the same statistical
              presence engine powering our demos. Add accessories and dashboards to
              extend the experience across every room.
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
