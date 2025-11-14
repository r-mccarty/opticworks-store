"use client"

import { useState } from "react"
import { Product } from "@/lib/products"
import { FadeContainer, FadeDiv } from "@/components/Fade"
import { ProductHero } from "./ProductHero"
import { ProblemSolution } from "./ProblemSolution"
import { InstallProcess } from "./InstallProcess"
import { TechnologyComparison } from "./TechnologyComparison"
import { KitContents } from "./KitContents"
import { SocialProofFAQ } from "./SocialProofFAQ"
import { FinalCTA } from "./FinalCTA"

interface ProductDetailViewProps {
  product: Product
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants ? product.variants[0] : null
  )

  const isFlagshipBedSensor = product.id === "bed-presence-sensor-kit"

  return (
    <main className="relative">
      <FadeContainer className="relative">
        {/* Hero Section */}
        <ProductHero 
          product={product} 
          selectedVariant={selectedVariant}
          onVariantChange={setSelectedVariant}
        />

        {isFlagshipBedSensor && (
          <>
            <ProblemSolution />
            <InstallProcess />
            <TechnologyComparison />
            <KitContents />
            <SocialProofFAQ />
            <FinalCTA 
              product={product}
              selectedVariant={selectedVariant}
            />
          </>
        )}

        {!isFlagshipBedSensor && (
          <div className="px-6 pb-16 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <FadeDiv className="mt-16">
                <div className="prose prose-lg mx-auto">
                  <h2>Product Details</h2>
                  <p className="text-gray-600">{product.description}</p>
                  
                  <h3>Specifications</h3>
                  <div className="not-prose grid grid-cols-1 gap-4 md:grid-cols-2 mb-8">
                    {product.specifications.map((item) => (
                      <div
                        key={item.label}
                        className="flex justify-between border-b border-gray-200 py-2"
                      >
                        <span className="font-medium text-gray-900">
                          {item.label}
                        </span>
                        <span className="text-gray-600 text-right">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  
                  {product.installGuide && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mt-8">
                      <h3 className="text-lg font-semibold text-orange-800 mb-2">
                        Installation Guide Available
                      </h3>
                      <p className="text-orange-700 text-sm mb-4">
                        Get step-by-step instructions for installing this product.
                      </p>
                      <a 
                        href={product.installGuide}
                        className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                      >
                        View Installation Guide
                      </a>
                    </div>
                  )}
                </div>
              </FadeDiv>
            </div>
          </div>
        )}
      </FadeContainer>
    </main>
  )
}
