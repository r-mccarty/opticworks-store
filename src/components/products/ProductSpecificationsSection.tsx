"use client"

import { FadeContainer, FadeDiv } from "@/components/Fade"
import { Card, CardContent } from "@/components/ui/card"
import type { Product } from "@/lib/products"

interface ProductSpecificationsSectionProps {
  product: Product
}

export function ProductSpecificationsSection({
  product,
}: ProductSpecificationsSectionProps) {
  if (!product.specifications || product.specifications.length === 0) {
    return null
  }

  return (
    <section className="px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <FadeContainer className="space-y-6">
          <FadeDiv className="text-center">
            <h2 className="text-3xl font-semibold text-foreground">
              Specifications
            </h2>
          </FadeDiv>

          <FadeDiv>
            <Card>
              <CardContent className="p-6">
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {product.specifications.map((spec) => (
                    <div key={spec.label} className="space-y-1">
                      <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        {spec.label}
                      </dt>
                      <dd className="text-sm font-semibold text-foreground">
                        {spec.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          </FadeDiv>
        </FadeContainer>
      </div>
    </section>
  )
}

