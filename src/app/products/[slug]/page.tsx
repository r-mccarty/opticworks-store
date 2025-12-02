import { Metadata } from "next"
import { notFound } from "next/navigation"

import { ProductDetailView } from "@/components/products/ProductDetailView"
import { getProductById } from "@/lib/api/medusa"

// Force dynamic rendering to avoid SSG build errors when Medusa API
// is unavailable at build time. See RFD-009 for details.
export const dynamic = 'force-dynamic'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

// Commented out: SSG causes build failures when Medusa API key isn't
// available at build time. The error cascades to 404 page generation
// with a misleading "<Html> import" error. See RFD-009.
//
// export async function generateStaticParams() {
//   const catalog = await listProducts()
//   return catalog.map((product) => ({
//     slug: product.id,
//   }))
// }

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
