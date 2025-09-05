import { Metadata } from "next"
import { ProductGrid } from "@/components/store/ProductGrid"
import { FadeContainer, FadeDiv } from "@/components/Fade"

export const metadata: Metadata = {
  title: "Store - OpticWorks Window Tinting",
  description: "Browse our complete range of window tinting films, DIY kits, and professional installation tools.",
}

export default function StorePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <FadeContainer className="relative mx-auto max-w-6xl px-4 pt-28 pb-16 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeDiv className="mb-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Window Tinting Store
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Professional-grade window tinting films and DIY installation kits.
            Complete solutions for automotive, residential, and commercial applications.
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