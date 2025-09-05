import { Metadata } from "next"
import { ProductGrid } from "@/components/store/ProductGrid"
import { FadeContainer, FadeDiv } from "@/components/Fade"

export const metadata: Metadata = {
  title: "All Products - OpticWorks Window Tinting",
  description: "Browse our complete range of professional-grade window tinting films, DIY kits, and installation tools. Premium ceramic films with lifetime warranties.",
}

export default function ProductsPage() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50">
      {/* Gradient overlays for visual depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(147,51,234,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(124,58,237,0.05),transparent_50%)]" />
      
      <FadeContainer className="relative px-7 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="mx-auto max-w-6xl">
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