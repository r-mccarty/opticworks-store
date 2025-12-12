import { Metadata } from "next"
import { notFound } from "next/navigation"

import { ProductDetailView } from "@/components/products/ProductDetailView"
import { getProductById } from "@/lib/api/medusa"
import { siteConfig } from "@/app/siteConfig"

// Force dynamic rendering - Medusa API unavailable at build time
export const dynamic = 'force-dynamic'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

// SSG disabled - Medusa API requires publishable key unavailable at build time
// export async function generateStaticParams() {
//   const catalog = await listProducts()
//   return catalog.map((product) => ({ slug: product.id }))
// }

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductById(slug)

  if (!product) {
    return {
      title: `Product Not Found - ${siteConfig.name}`,
      description: "The requested product could not be found.",
    }
  }

  return {
    title: `${product.name} - ${siteConfig.name}`,
    description: product.description,
    openGraph: {
      title: `${product.name} - ${siteConfig.name}`,
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
