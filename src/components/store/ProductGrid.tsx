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
            <Card
              className="group relative flex h-full flex-col overflow-hidden border border-white/30 bg-white/20 text-slate-900 shadow-[0_22px_55px_-32px_rgba(15,23,42,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_32px_65px_-30px_rgba(15,23,42,0.65)] supports-[backdrop-filter]:bg-white/35 supports-[backdrop-filter]:backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/70 dark:text-slate-100"
            >
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

              <CardContent className="flex flex-1 flex-col gap-3 p-5">
                <h3 className="line-clamp-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {product.name}
                </h3>
                <p className="line-clamp-2 text-sm text-gray-600 dark:text-slate-300">
                  {product.description}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-slate-300">
                  {product.specifications.vlt && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-700 dark:text-white">VLT:</span>
                      <span>{product.specifications.vlt}</span>
                    </div>
                  )}
                  {product.specifications.heatRejection && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-700 dark:text-white">Heat Rejection:</span>
                      <span>{product.specifications.heatRejection}</span>
                    </div>
                  )}
                  {product.specifications.warranty && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-700 dark:text-white">Warranty:</span>
                      <span>{product.specifications.warranty}</span>
                    </div>
                  )}
                  {product.specifications.difficulty && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-700 dark:text-white">Difficulty:</span>
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

              <CardFooter className="mt-auto flex flex-col items-stretch gap-4 border-t border-white/20 p-5 text-slate-900 dark:border-slate-700/70 dark:text-slate-100">
                <div className="flex w-full items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      ${product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through dark:text-slate-400">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>
                  {product.reviews && (
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-200">★{product.reviews.rating}</span>
                        <span className="text-xs text-gray-500 dark:text-slate-400">({product.reviews.count})</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-4">
                  <Button asChild variant="secondary" className="flex-1">
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