import { Metadata } from "next"
import { ProductGrid } from "@/components/store/ProductGrid"
import { BentoGrid } from "@/components/store/BentoGrid"
import { FadeContainer, FadeDiv } from "@/components/Fade"

export const metadata: Metadata = {
  title: "Our Products - OpticWorks Window Tinting",
  description: "Explore our curated selection of high-performance window tinting films and DIY kits. Featuring our premier CyberShade IRX line for maximum heat rejection and clarity.",
}

export default function ProductsPage() {
  return (
    <main className="relative">
      <FadeContainer className="relative px-6 pt-28 pb-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <FadeDiv className="text-center mb-16">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Our Products
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              High-performance window tinting solutions for professionals and DIYers.
            </p>
          </FadeDiv>

          {/* Featured Product Bento Grid */}
          <FadeDiv className="mb-24">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-8">
              Featured Products
            </h2>
            <BentoGrid />
          </FadeDiv>

          {/* All Products Grid */}
          <FadeDiv>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-8">
              All Products
            </h2>
            <ProductGrid />
          </FadeDiv>
        </div>
      </FadeContainer>
    </main>
  )
}