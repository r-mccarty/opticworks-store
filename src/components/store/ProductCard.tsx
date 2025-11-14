"use client"
import Image from "next/image"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/useCart"
import { type Product } from "@/lib/products"
import Link from "next/link"

export const ProductCard = ({ product, isFeatured = false }: { product: Product, isFeatured?: boolean }) => {
    const { addToCart } = useCart()

    const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        e.stopPropagation()
        addToCart(product)
    }

    const cardContent = (
        <>
            <div className="relative w-full h-48 mb-4">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {product.badge && (
                    <Badge className="absolute top-2 left-2 bg-orange-500 text-white">
                        {product.badge}
                    </Badge>
                )}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
            <p className="text-sm text-gray-400 mb-4 line-clamp-2">{product.description}</p>
            <div className="flex justify-between items-center mt-auto">
                <span className="text-xl font-bold text-white">${product.price}</span>
                <Button onClick={handleAddToCart} disabled={!product.inStock}>
                    {product.inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
            </div>
        </>
    )

    return isFeatured ? (
        <Link href={`/products/${product.id}`} className="block col-span-1 md:col-span-2">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gray-900 rounded-lg p-6 flex flex-col hover:bg-gray-800 transition-colors"
            >
                {cardContent}
            </motion.div>
        </Link>
    ) : (
        <Link href={`/products/${product.id}`} className="block">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gray-900 rounded-lg p-6 flex flex-col hover:bg-gray-800 transition-colors"
            >
                {cardContent}
            </motion.div>
        </Link>
    )
}
