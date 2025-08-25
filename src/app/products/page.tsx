import { Metadata } from "next"
import { ProductGrid } from "@/components/store/ProductGrid"
import { FadeContainer, FadeDiv } from "@/components/Fade"

export const metadata: Metadata = {
  title: "All Products - OpticWorks Window Tinting",
  description: "Browse our complete range of professional-grade window tinting films, DIY kits, and installation tools. Premium ceramic films with lifetime warranties.",
}

export default function ProductsPage() {
  return (
    <main className="relative">
      <FadeContainer className="relative px-6 pt-28 pb-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <FadeDiv className="text-center mb-16">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              All Products
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Professional-grade window tinting solutions designed for DIY enthusiasts. 
              From precision-cut kits to professional tools, everything you need for 
              flawless results.
            </p>
          </FadeDiv>

          {/* Product Grid */}
          <FadeDiv>
            <ProductGrid />
          </FadeDiv>
        </div>
      </FadeContainer>
    </main>
  )
}