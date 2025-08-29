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

export function BentoGrid() {
  const { addToCart } = useCart()
  const featuredProducts = products.filter(p => p.featured)

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>, product: Product) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
  }

  if (featuredProducts.length === 0) {
    return null
  }

  const getCardClass = (index: number) => {
    if (index === 0) return "bento-card-large"
    if (index === 3) return "bento-card-small col-start-3 row-start-2"
    return "bento-card-small"
  }

  return (
    <div className="bento-grid">
      {featuredProducts.slice(0, 4).map((product, index) => (
        <div key={product.id} className={`bento-card ${getCardClass(index)}`}>
          <BentoCard product={product} handleAddToCart={handleAddToCart} />
        </div>
      ))}
    </div>
  )
}

const BentoCard = ({ product, handleAddToCart }: { product: Product, handleAddToCart: (e: React.MouseEvent<HTMLButtonElement>, product: Product) => void }) => (
  <FadeDiv className="h-full">
    <Link href={`/products/${product.id}`} className="block h-full">
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
        <CardHeader className="p-0">
          <div className="aspect-video relative overflow-hidden rounded-t-lg bg-gray-100 h-full">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="flex items-center justify-between w-full">
            <span className="text-2xl font-bold text-gray-900">
              ${product.price}
            </span>
            <Button
              onClick={(e) => handleAddToCart(e, product)}
              className="flex items-center gap-2"
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
)
