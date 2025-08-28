"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FadeDiv } from "@/components/Fade"
import { ShoppingCartIcon } from "@heroicons/react/24/outline"
import { products, Product } from "@/lib/products"
import { useCart } from "@/hooks/useCart"
import Image from "next/image"
import Link from "next/link"

export function ProductGrid() {
  const { addToCart } = useCart()

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>, product: Product) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
  }

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <FadeDiv key={product.id}>
          <Link href={`/products/${product.id}`} className="block h-full">
            <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <div className="aspect-square relative overflow-hidden rounded-t-lg bg-gray-100">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  {product.badge && (
                    <Badge className="absolute top-3 left-3 bg-orange-500 hover:bg-orange-600">
                      {product.badge}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {product.description}
                  </p>

                  <div className="space-y-1 text-xs text-gray-500">
                    {product.specifications.vlt && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">VLT:</span>
                        <span>{product.specifications.vlt}</span>
                      </div>
                    )}
                    {product.specifications.heatRejection && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Heat Rejection:</span>
                        <span>{product.specifications.heatRejection}</span>
                      </div>
                    )}
                    {product.specifications.warranty && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Warranty:</span>
                        <span>{product.specifications.warranty}</span>
                      </div>
                    )}
                    {product.specifications.difficulty && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Difficulty:</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          product.specifications.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                          product.specifications.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {product.specifications.difficulty}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0 flex flex-col gap-3">
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-gray-900">
                      ${product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>
                  {product.reviews && (
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">★{product.reviews.rating}</span>
                        <span className="text-xs text-gray-500">({product.reviews.count})</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 w-full">
                  <Button asChild variant="outline" className="flex-1">
                    <span className="w-full text-center">View Details</span>
                  </Button>
                  <Button
                    onClick={(e) => handleAddToCart(e, product)}
                    className="flex items-center gap-2 flex-1"
                    disabled={!product.inStock}
                  >
                    <ShoppingCartIcon className="w-4 h-4" />
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </Link>
        </FadeDiv>
      ))}
    </div>
  )
}