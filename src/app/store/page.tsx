import { Metadata } from "next"
import { ProductGrid } from "@/components/store/ProductGrid"
import { FadeContainer, FadeDiv } from "@/components/Fade"

export const metadata: Metadata = {
  title: "Store - OpticWorks Window Tinting",
  description: "Browse our complete range of window tinting films, DIY kits, and professional installation tools.",
}

export default function StorePage() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Gradient overlays for visual depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.05),transparent_50%)]" />
      
      <FadeContainer className="relative px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <FadeDiv className="text-center mb-16">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Window Tinting Store
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              Professional-grade window tinting films and DIY installation kits. 
              Complete solutions for automotive, residential, and commercial applications.
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