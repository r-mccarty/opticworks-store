import { Metadata } from "next"
import { ProductGrid } from "@/components/store/ProductGrid"
import { FadeContainer, FadeDiv } from "@/components/Fade"

export const metadata: Metadata = {
  title: "Store - OpticWorks Window Tinting",
  description: "Browse our complete range of window tinting films, DIY kits, and professional installation tools.",
}

export default function StorePage() {
  return (
    <main className="relative">
      <FadeContainer className="relative px-6 pt-20 pb-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
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