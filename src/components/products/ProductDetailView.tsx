"use client"

import { useState } from "react"

import { FadeContainer } from "@/components/Fade"
import type { Product, ProductVariant } from "@/lib/products"

import { ProductHero } from "./ProductHero"
import { ProductBenefitsSection } from "./ProductBenefitsSection"
import { ProductSpecificationsSection } from "./ProductSpecificationsSection"
import { SocialProofFAQ } from "./SocialProofFAQ"
import { FinalCTA } from "./FinalCTA"

interface ProductDetailViewProps {
  product: Product
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants ? product.variants[0] : null
  )

  return (
    <main className="relative bg-background text-foreground">
      <FadeContainer className="relative">
        <ProductHero
          product={product}
          selectedVariant={selectedVariant}
          onVariantChange={setSelectedVariant}
        />

        <ProductBenefitsSection product={product} />
        <ProductSpecificationsSection product={product} />

        <SocialProofFAQ />

        <FinalCTA product={product} selectedVariant={selectedVariant} />
      </FadeContainer>
    </main>
  )
}

