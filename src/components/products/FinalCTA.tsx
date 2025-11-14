"use client"

import { useState } from "react"
import { Product, type ProductVariant } from "@/lib/products"
import { FadeDiv } from "@/components/Fade"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/useCart"
import { 
  ShoppingCartIcon, 
  TruckIcon, 
  ShieldCheckIcon, 
  CheckCircleIcon 
} from "@heroicons/react/24/outline"

interface FinalCTAProps {
  product: Product
  selectedVariant?: ProductVariant | null
}

export function FinalCTA({ product, selectedVariant }: FinalCTAProps) {
  const { addToCart } = useCart()
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    
    const productToAdd = selectedVariant
      ? {
          ...product,
          id: selectedVariant.id,
          name: `${product.name} - ${selectedVariant.name}`,
          price: selectedVariant.price,
        }
      : product
    
    addToCart(productToAdd)
    
    setTimeout(() => setIsAddingToCart(false), 500)
  }

  const currentPrice = selectedVariant?.price || product.price

  return (
    <div className="py-16">
      <div className="px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <FadeDiv>
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white overflow-hidden">
              <CardContent className="p-12 text-center">
                <h2 className="text-4xl font-bold mb-4">
                  Ready to trust your bedtime automations?
                </h2>
                <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
                  The Bed Presence Sensor kit ships flashed, calibrated, and paired with
                  our dashboards so you can stop hunting for reliable occupancy hacks.
                </p>

                {/* Variant Selector (if applicable) */}
                {product.variants && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-orange-100">
                      Selected Option:
                    </h3>
                    <div className="bg-white/10 rounded-lg p-4 max-w-md mx-auto">
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <div className="font-medium">
                            {selectedVariant?.name || product.variants[0].name}
                          </div>
                          <div className="text-sm text-orange-100">
                            {selectedVariant?.description || product.variants[0].description}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            ${currentPrice}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Price */}
                {!product.variants && (
                  <div className="mb-8">
                    <div className="text-4xl font-bold mb-2">
                      ${currentPrice}
                    </div>
                    {product.originalPrice && (
                      <div className="text-xl text-orange-200 line-through">
                        ${product.originalPrice}
                      </div>
                    )}
                  </div>
                )}

                {/* CTA Button */}
                <div className="mb-8">
                  <Button
                    onClick={handleAddToCart}
                    disabled={!product.inStock || isAddingToCart}
                    size="lg"
                    className="bg-white text-orange-600 hover:bg-orange-50 h-14 px-8 text-lg font-semibold"
                  >
                    <ShoppingCartIcon className="w-6 h-6 mr-3" />
                    {isAddingToCart ? 'Adding to Cart...' : 'ADD TO CART'}
                  </Button>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center justify-center gap-6 text-orange-100">
                  <div className="flex items-center gap-2">
                    <TruckIcon className="w-5 h-5" />
                    <span>Ships in 2 business days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="w-5 h-5" />
                    <span>2-year hardware warranty</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>Local-only processing</span>
                  </div>
                </div>

                {/* Additional Benefits */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="font-semibold mb-1">15-minute setup</div>
                    <div className="text-orange-100">From unboxing to calibration</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="font-semibold mb-1">4-state engine</div>
                    <div className="text-orange-100">Debounce, hysteresis, z-scores</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="font-semibold mb-1">100% local processing</div>
                    <div className="text-orange-100">No cameras. No cloud.</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Secondary Actions */}
            <div className="text-center mt-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="outline" size="lg">
                  <a href="#setup-process">
                    See setup walkthrough
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href={product.installGuide || '#'}>
                    View Complete Guide
                  </a>
                </Button>
              </div>
              
              <div className="mt-6 text-sm text-gray-600">
                <p>
                  Still have questions?{" "}
                  <a href="#faq" className="text-orange-600 hover:text-orange-700 font-medium">
                    Check our FAQ
                  </a>{" "}
                  or
                  <a
                    href="/support"
                    className="text-orange-600 hover:text-orange-700 font-medium ml-1"
                  >
                    contact our support team
                  </a>
                  .
                </p>
              </div>
            </div>
          </FadeDiv>
        </div>
      </div>
    </div>
  )
}
