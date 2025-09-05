import { Metadata } from "next"
import { ProductGrid } from "@/components/store/ProductGrid"
import { FadeContainer, FadeDiv } from "@/components/Fade"

export const metadata: Metadata = {
  title: "All Products - OpticWorks Window Tinting",
  description: "Browse our complete range of professional-grade window tinting films, DIY kits, and installation tools. Premium ceramic films with lifetime warranties.",
}

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <FadeContainer className="relative mx-auto max-w-6xl px-4 pt-28 pb-16 xl:px-0">
        {/* Header */}
        <FadeDiv className="mb-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            All Products
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-600">
            Professional-grade window tinting solutions designed for DIY enthusiasts.
            From precision-cut kits to professional tools, everything you need for
            flawless results.
          </p>
        </FadeDiv>

        {/* Product Grid */}
        <FadeDiv>
          <ProductGrid />
        </FadeDiv>
      </FadeContainer>
    </main>
  )
}