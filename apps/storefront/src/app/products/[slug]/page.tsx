import { Metadata } from "next"
import { notFound } from "next/navigation"
import { products } from "@/lib/products"
import { ProductDetailView } from "@/components/products/ProductDetailView"

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.id,
  }))
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = products.find(p => p.id === slug)
  
  if (!product) {
    return {
      title: 'Product Not Found - OpticWorks',
      description: 'The requested product could not be found.'
    }
  }

  return {
    title: `${product.name} - OpticWorks Window Tinting`,
    description: product.description,
    openGraph: {
      title: `${product.name} - OpticWorks`,
      description: product.description,
      images: [product.image],
      type: 'website',
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = products.find(p => p.id === slug)
  
  if (!product) {
    notFound()
  }

  return <ProductDetailView product={product} />
}