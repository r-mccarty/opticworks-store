import { Metadata } from "next"
import { notFound } from "next/navigation"

import { ProductDetailView } from "@/components/products/ProductDetailView"
import { getProductById, listProducts } from "@/lib/api/medusa"

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const catalog = await listProducts()
  return catalog.map((product) => ({
    slug: product.id,
  }))
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductById(slug)

  if (!product) {
    return {
      title: "Product Not Found - OpticWorks Presence Lab",
      description: "The requested product could not be found.",
    }
  }

  return {
    title: `${product.name} - OpticWorks Presence Lab`,
    description: product.description,
    openGraph: {
      title: `${product.name} - OpticWorks Presence Lab`,
      description: product.description,
      images: [product.image],
      type: "website",
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductById(slug)

  if (!product) {
    notFound()
  }

  return <ProductDetailView product={product} />
}
