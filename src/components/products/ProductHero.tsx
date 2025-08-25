"use client"

import { useState } from "react"
import { Product } from "@/lib/products"
import { FadeDiv } from "@/components/Fade"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/hooks/useCart"
import { StarIcon, TruckIcon, ShieldCheckIcon, CheckCircleIcon } from "@heroicons/react/24/solid"
import { ShoppingCartIcon } from "@heroicons/react/24/outline"
import Image from "next/image"
import Link from "next/link"

interface ProductHeroProps {
  product: Product
  selectedVariant?: { id: string; name: string; price: number; vlt: string; description: string } | null
  onVariantChange?: (variant: { id: string; name: string; price: number; vlt: string; description: string }) => void
}

export function ProductHero({ product, selectedVariant, onVariantChange }: ProductHeroProps) {
  const { addToCart } = useCart()
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    // Add the main product or selected variant
    const productToAdd = selectedVariant ? {
      ...product,
      id: selectedVariant.id,
      name: `${product.name} - ${selectedVariant.name}`,
      price: selectedVariant.price,
      specifications: {
        ...product.specifications,
        vlt: selectedVariant.vlt
      }
    } : product
    
    addToCart(productToAdd)
    
    // Brief loading state for UX
    setTimeout(() => setIsAddingToCart(false), 500)
  }

  const currentPrice = selectedVariant?.price || product.price

  return (
    <div className="px-6 pt-28 pb-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Product Images */}
          <FadeDiv>
            <div className="aspect-square relative rounded-2xl overflow-hidden bg-gray-100">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {product.badge && (
                <Badge className="absolute top-6 left-6 bg-orange-500 hover:bg-orange-600 text-lg px-3 py-1">
                  {product.badge}
                </Badge>
              )}
            </div>
            
            {/* Additional product images could go here */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              {/* Placeholder for additional images */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-lg"></div>
              ))}
            </div>
          </FadeDiv>

          {/* Product Details */}
          <FadeDiv>
            {/* Reviews */}
            {product.reviews && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.reviews!.rating)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">
                  ({product.reviews.rating}/5)
                </span>
                <span className="text-sm text-gray-500">
                  | {product.reviews.count} Reviews
                </span>
                <span className="text-sm text-gray-500">
                  | &ldquo;As seen on Tesla Motors Club&rdquo;
                </span>
              </div>
            )}

            {/* Product Title */}
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
              {product.name}
            </h1>

            {/* Headlines for CyberShade IRX */}
            {product.id === 'cybershade-irx-tesla-model-y' && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Professional Tint. Foolproof DIY.
                </h2>
                <p className="text-lg text-gray-600">
                  Get a flawless, heat-blocking ceramic tint on your Model Y in under an hour. 
                  Our all-in-one kit with precision pre-cut film and revolutionary installation 
                  tools makes it effortless.
                </p>
              </div>
            )}

            {/* Regular product description */}
            {product.id !== 'cybershade-irx-tesla-model-y' && (
              <p className="text-lg text-gray-600 mb-6">{product.description}</p>
            )}

            {/* Key Benefits for CyberShade IRX */}
            {product.id === 'cybershade-irx-tesla-model-y' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Perfect Fit, Guaranteed</h3>
                    <p className="text-sm text-gray-600">Precision-cut and pre-shrunk for the 2025+ Model Y front windows.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Superior Heat Rejection</h3>
                    <p className="text-sm text-gray-600">Advanced ceramic film blocks up to 99% of infrared rays, keeping your cabin cool.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">The Easiest Install Ever</h3>
                    <p className="text-sm text-gray-600">Our complete kit with unique tools eliminates the guesswork and mess.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Save Hundreds vs. Pro Shops</h3>
                    <p className="text-sm text-gray-600">Achieve a professional finish without the professional price tag.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Variant Selector */}
            {product.variants && onVariantChange && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Choose Your VLT (Visual Light Transmission):
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {product.variants.map((variant) => (
                    <Card 
                      key={variant.id}
                      className={`cursor-pointer border-2 transition-colors ${
                        selectedVariant?.id === variant.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => onVariantChange(variant)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{variant.name}</h4>
                            <p className="text-sm text-gray-600">{variant.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">
                              ${variant.price}
                            </div>
                            {variant.id === 'cybershade-irx-tesla-35' && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                Recommended
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
                <span className="text-3xl font-bold text-gray-900">
                  ${currentPrice}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">
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
              >
                <ShoppingCartIcon className="w-5 h-5 mr-2" />
                {isAddingToCart ? 'Adding...' : product.inStock ? 'ADD TO CART' : 'OUT OF STOCK'}
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <TruckIcon className="w-5 h-5" />
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5" />
                <span>Lifetime Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5" />
                <span>Perfect Fit Guarantee</span>
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
    </div>
  )
}