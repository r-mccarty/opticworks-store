import { Metadata } from "next"

import { FadeContainer, FadeDiv } from "@/components/Fade"
import { ProductGrid } from "@/components/store/ProductGrid"

export const metadata: Metadata = {
  title: "Bed Presence Sensor Lineup",
  description:
    "Explore the OpticWorks Presence Lab catalog—hardware kits, developer editions, and dashboards that make bed occupancy detection reliable.",
}

export default function ProductsPage() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.18),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(149,114,252,0.12),transparent_55%)]" />

      <FadeContainer className="relative px-7 pt-28 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <FadeDiv className="mb-16 text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-white/60">
              Presence Lab Catalog
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Hardware, software, and kits for rock-solid occupancy detection
            </h1>
            <p className="mt-6 text-lg leading-8 text-white/70">
              Every product in this collection feeds the same Bed Presence Sensor
              engine—local processing, privacy by design, and fully tunable from
              Home Assistant.
            </p>
          </FadeDiv>

          <FadeDiv>
            <ProductGrid />
          </FadeDiv>
        </div>
      </FadeContainer>
    </main>
  )
}
