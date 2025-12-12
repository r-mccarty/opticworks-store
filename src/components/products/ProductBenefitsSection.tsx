"use client"

import { FadeContainer, FadeDiv } from "@/components/Fade"
import { Card, CardContent } from "@/components/ui/card"
import type { Product } from "@/lib/products"

interface ProductBenefitsSectionProps {
  product: Product
}

export function ProductBenefitsSection({ product }: ProductBenefitsSectionProps) {
  const benefits =
    product.keyBenefits?.map((benefit) => ({
      title: benefit.title,
      description: benefit.description,
    })) ??
    product.highlights?.map((highlight) => ({
      title: highlight,
      description: undefined,
    })) ??
    []

  if (benefits.length === 0) {
    return null
  }

  return (
    <section className="px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <FadeContainer className="space-y-8">
          <FadeDiv className="text-center">
            <h2 className="text-3xl font-semibold text-foreground">
              Built for real spaces
            </h2>
            <p className="mt-3 text-muted-foreground">
              Calm sensing, readable intelligence, and local‑first privacy.
            </p>
          </FadeDiv>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <FadeDiv key={benefit.title}>
                <Card className="h-full">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground">
                      {benefit.title}
                    </h3>
                    {benefit.description && (
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {benefit.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </FadeDiv>
            ))}
          </div>
        </FadeContainer>
      </div>
    </section>
  )
}

