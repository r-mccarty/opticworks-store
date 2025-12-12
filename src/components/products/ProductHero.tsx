"use client"

import { useState } from "react"
import { Product, type ProductVariant } from "@/lib/products"
import { FadeDiv } from "@/components/Fade"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/hooks/useCart"
import { StarIcon, TruckIcon, ShieldCheckIcon, CheckCircleIcon } from "@heroicons/react/24/solid"
import { ShoppingCartIcon } from "@heroicons/react/24/outline"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ProductHeroProps {
  product: Product
  selectedVariant?: ProductVariant | null
  onVariantChange?: (variant: ProductVariant) => void
}

export function ProductHero({ product, selectedVariant, onVariantChange }: ProductHeroProps) {
  const { addToCart } = useCart()
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    // Add the main product or selected variant
    const productToAdd = selectedVariant
      ? {
          ...product,
          id: selectedVariant.id,
          name: `${product.name} - ${selectedVariant.name}`,
          price: selectedVariant.price,
          // Use the Medusa variant ID if available, fall back to product's default variantId
          variantId: selectedVariant.medusaVariantId ?? product.variantId,
        }
      : product

    addToCart(productToAdd)

    // Brief loading state for UX
    setTimeout(() => setIsAddingToCart(false), 500)
  }

  const currentPrice = selectedVariant?.price || product.price

  return (
    <section className="relative px-6 pt-28 pb-20 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
          {/* Product Images */}
          <FadeDiv>
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {product.badge && (
                <Badge className="absolute left-6 top-6 bg-primary text-primary-foreground text-sm px-3 py-1 shadow-elevation-1">
                  {product.badge}
                </Badge>
              )}
            </div>
            
            {/* Additional product images could go here */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              {/* Placeholder for additional images */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square rounded-md bg-muted" />
              ))}
            </div>
          </FadeDiv>

          {/* Product Details */}
          <FadeDiv>
            {product.reviews && (
              <div className="mb-4 flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.reviews!.rating)
                          ? "text-primary"
                          : "text-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-foreground">
                  ({product.reviews.rating.toFixed(2)}/5)
                </span>
                <span className="text-sm text-muted-foreground">
                  | {product.reviews.count} reviews
                </span>
              </div>
            )}

            <h1 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {product.name}
            </h1>

            {product.heroIntro ? (
              <div className="mb-6 space-y-2">
                <h2 className="text-2xl font-semibold text-foreground">
                  {product.heroIntro.headline}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {product.heroIntro.subheading}
                </p>
              </div>
            ) : (
              <p className="mb-6 text-lg text-muted-foreground">
                {product.description}
              </p>
            )}

            {product.keyBenefits && (
              <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {product.keyBenefits.map((benefit) => (
                  <div key={benefit.title} className="flex items-start gap-3">
                    <CheckCircleIcon className="mt-0.5 h-6 w-6 flex-shrink-0 text-secondary" />
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Variant Selector */}
            {product.variants && onVariantChange && (
              <div className="mb-6">
                <h3 className="mb-3 text-lg font-semibold text-foreground">
                  Choose your configuration:
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {product.variants.map((variant) => (
                    <Card 
                      key={variant.id}
                      className={cn(
                        "cursor-pointer border-2 transition-colors",
                        selectedVariant?.id === variant.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-muted-foreground/40"
                      )}
                      onClick={() => onVariantChange(variant)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-foreground">
                              {variant.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {variant.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-foreground">
                              ${variant.price}
                            </div>
                            {variant.badge && (
                              <Badge
                                variant="secondary"
                                className="text-xs"
                              >
                                {variant.badge}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-foreground">
                  ${currentPrice}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
            </div>

            {/* Add to Cart */}
            <div className="mb-8">
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock || isAddingToCart}
                className="w-full h-12 text-lg"
                size="lg"
                data-testid="add-to-cart-button"
                data-product-id={product.id}
              >
                <ShoppingCartIcon className="w-5 h-5 mr-2" />
                {isAddingToCart ? 'Adding...' : product.inStock ? 'ADD TO CART' : 'OUT OF STOCK'}
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <TruckIcon className="h-5 w-5 text-foreground" />
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5 text-foreground" />
                <span>2‑Year Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-foreground" />
                <span>Local Processing</span>
              </div>
            </div>

            {/* Install Guide Link */}
            {product.installGuide && (
              <div className="mt-6">
                <Button asChild variant="outline" className="w-full">
                  <Link href={product.installGuide}>
                    View Installation Guide
                  </Link>
                </Button>
              </div>
            )}
          </FadeDiv>
        </div>
      </div>
    </section>
  )
}
