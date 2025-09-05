"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
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
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <FadeDiv key={product.id}>
          <Link href={`/products/${product.id}`} className="block h-full">
            <Card className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
              <div className="relative aspect-[4/3] bg-gray-100">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                {product.badge && (
                  <Badge className="absolute top-3 left-3 bg-orange-500 text-white">
                    {product.badge}
                  </Badge>
                )}
              </div>

              <CardContent className="flex flex-1 flex-col p-5">
                <h3 className="line-clamp-2 text-lg font-semibold text-gray-900">
                  {product.name}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                  {product.description}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-gray-500">
                  {product.specifications.vlt && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">VLT:</span>
                      <span>{product.specifications.vlt}</span>
                    </div>
                  )}
                  {product.specifications.heatRejection && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Heat Rejection:</span>
                      <span>{product.specifications.heatRejection}</span>
                    </div>
                  )}
                  {product.specifications.warranty && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Warranty:</span>
                      <span>{product.specifications.warranty}</span>
                    </div>
                  )}
                  {product.specifications.difficulty && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Difficulty:</span>
                      <span
                        className={`rounded px-2 py-0.5 text-xs ${
                          product.specifications.difficulty === 'Beginner'
                            ? 'bg-green-100 text-green-800'
                            : product.specifications.difficulty === 'Intermediate'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.specifications.difficulty}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="mt-auto flex flex-col items-stretch gap-4 border-t p-5">
                <div className="flex w-full items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-gray-900">
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
                <div className="flex gap-2">
                  <Button asChild variant="outline" className="flex-1">
                    <span className="w-full text-center">View Details</span>
                  </Button>
                  <Button
                    onClick={(e) => handleAddToCart(e, product)}
                    className="flex flex-1 items-center gap-2"
                    disabled={!product.inStock}
                  >
                    <ShoppingCartIcon className="h-4 w-4" />
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