/**
 * Product data for Medusa backend
 * TODO: This is a temporary stub. Products will be managed via Medusa's native product system.
 * Use the import-products.ts script to import these into the database.
 */

export interface ProductSpecification {
  label: string
  value: string
}

export interface ProductVariant {
  id: string
  name: string
  price: number
  description: string
  badge?: string
  vlt?: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  category: "sensor" | "bundle" | "accessory" | "software"
  badge?: string
  specifications: ProductSpecification[]
  highlights?: string[]
  keyBenefits?: Array<{
    title: string
    description: string
  }>
  heroIntro?: {
    headline: string
    subheading: string
  }
  inStock: boolean
  featured?: boolean
  variants?: ProductVariant[]
  reviews?: {
    rating: number
    count: number
  }
  installGuide?: string
}

// TODO: Import actual product data from storefront or database
// For now, this is a placeholder to allow scripts to compile
export const products: Product[] = []
