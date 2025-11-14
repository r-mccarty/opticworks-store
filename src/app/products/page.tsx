import { Metadata } from "next"
import { BentoGrid } from "@/components/store/BentoGrid"
import { ProductCard } from "@/components/store/ProductCard"
import { products } from "@/lib/products"
import { NoiseSVG } from "@/components/NoiseSVG"

export const metadata: Metadata = {
  title: "Bed Presence Sensor Lineup",
  description:
    "Explore the OpticWorks Presence Lab catalog—hardware kits, developer editions, and dashboards that make bed occupancy detection reliable.",
}

export default function ProductsPage() {
  const featuredProduct = products.find(p => p.featured)
  const otherProducts = products.filter(p => !p.featured)

  return (
    <main className="relative min-h-screen bg-black text-white">
      <NoiseSVG />
      <div className="relative px-7 pt-28 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl text-center">
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
        </div>
        <div className="mt-16">
          <BentoGrid>
            {featuredProduct && <ProductCard product={featuredProduct} isFeatured />}
            {otherProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </BentoGrid>
        </div>
      </div>
    </main>
  )
}
