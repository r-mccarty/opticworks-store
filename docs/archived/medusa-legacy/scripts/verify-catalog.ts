#!/usr/bin/env tsx
/**
 * Catalog Verification Script
 *
 * Verifies that products imported into Medusa match the source catalog.
 * Checks product counts, handles, prices, and metadata integrity.
 * Updated for RFD-005: Prefers Medusa secret API key auth with JWT fallback.
 *
 * Usage:
 *   pnpm run verify:catalog
 *   pnpm run verify:catalog --detailed  # Show all product details
 */

import "dotenv/config"
import { products } from "../../../src/lib/products"
import { retryFetch } from "./utils/retry.js"
import { getAdminAuthHeader, type AdminAuthHeader } from "./utils/auth.js"

const ADMIN_URL = process.env.MEDUSA_ADMIN_URL ?? "http://127.0.0.1:9000"
const STORE_URL = process.env.MEDUSA_BACKEND_URL ?? "http://localhost:9000"

interface MedusaProduct {
  id: string
  title: string
  handle: string
  status: string
  variants: Array<{
    id: string
    title: string
    prices: Array<{
      currency_code: string
      amount: number
    }>
  }>
  metadata: Record<string, any>
}

interface VerificationIssue {
  product: string
  field: string
  expected: any
  actual: any
}

const issues: VerificationIssue[] = []

/**
 * Fetch all products from Medusa Admin API
 * Updated for RFD-005: Prefers Basic auth via secret API key (JWT fallback)
 */
async function fetchMedusaProducts(auth: AdminAuthHeader): Promise<MedusaProduct[]> {
  console.log('📡 Fetching products from Medusa...')

  const allProducts: MedusaProduct[] = []
  let offset = 0
  const limit = 50

  while (true) {
    const url = new URL('/admin/products', ADMIN_URL)
    url.searchParams.set('limit', limit.toString())
    url.searchParams.set('offset', offset.toString())

    const response = await retryFetch(
      url.toString(),
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': auth.header,
        },
      },
      { maxAttempts: 3 }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch products: HTTP ${response.status}`)
    }

    const data = await response.json()
    const products = data.products || []

    allProducts.push(...products)

    if (products.length < limit) {
      break // No more products
    }

    offset += limit
  }

  console.log(`✓ Fetched ${allProducts.length} products from Medusa\n`)
  return allProducts
}

/**
 * Verify product count matches
 */
function verifyProductCount(medusaProducts: MedusaProduct[]): boolean {
  const expected = products.length
  const actual = medusaProducts.length

  console.log('📊 Product Count Verification')
  console.log('='.repeat(70))
  console.log(`Expected: ${expected}`)
  console.log(`Actual:   ${actual}`)

  if (expected !== actual) {
    console.log('✗ MISMATCH: Product count does not match\n')
    issues.push({
      product: 'ALL',
      field: 'count',
      expected,
      actual,
    })
    return false
  } else {
    console.log('✓ Product count matches\n')
    return true
  }
}

/**
 * Verify individual product data
 */
function verifyProducts(medusaProducts: MedusaProduct[], detailed: boolean): void {
  console.log('🔍 Individual Product Verification')
  console.log('='.repeat(70))

  for (const sourceProduct of products) {
    const medusaProduct = medusaProducts.find(p => p.handle === sourceProduct.id)

    if (!medusaProduct) {
      console.log(`✗ Missing: ${sourceProduct.name}`)
      issues.push({
        product: sourceProduct.name,
        field: 'existence',
        expected: 'present',
        actual: 'missing',
      })
      continue
    }

    let hasIssues = false

    // Check title
    if (medusaProduct.title !== sourceProduct.name) {
      hasIssues = true
      issues.push({
        product: sourceProduct.name,
        field: 'title',
        expected: sourceProduct.name,
        actual: medusaProduct.title,
      })
    }

    // Check status
    const expectedStatus = sourceProduct.inStock ? 'published' : 'draft'
    if (medusaProduct.status !== expectedStatus) {
      hasIssues = true
      issues.push({
        product: sourceProduct.name,
        field: 'status',
        expected: expectedStatus,
        actual: medusaProduct.status,
      })
    }

    // Check price (for single variant products)
    if (!sourceProduct.variants || sourceProduct.variants.length === 0) {
      const variant = medusaProduct.variants[0]
      const price = variant?.prices.find(p => p.currency_code === 'usd')
      const expectedAmount = Math.round(sourceProduct.price * 100)

      if (!price || price.amount !== expectedAmount) {
        hasIssues = true
        issues.push({
          product: sourceProduct.name,
          field: 'price',
          expected: `$${sourceProduct.price}`,
          actual: price ? `$${price.amount / 100}` : 'missing',
        })
      }
    }

    // Check metadata
    const expectedMetadata = ['category', 'badge', 'heroIntro', 'keyBenefits', 'highlights', 'installGuide']
    for (const key of expectedMetadata) {
      if (sourceProduct[key as keyof typeof sourceProduct] && !medusaProduct.metadata?.[key]) {
        hasIssues = true
        issues.push({
          product: sourceProduct.name,
          field: `metadata.${key}`,
          expected: 'present',
          actual: 'missing',
        })
      }
    }

    if (hasIssues) {
      console.log(`✗ ${sourceProduct.name} (has issues)`)
      if (detailed) {
        const productIssues = issues.filter(i => i.product === sourceProduct.name)
        productIssues.forEach(issue => {
          console.log(`    ${issue.field}: expected "${issue.expected}", got "${issue.actual}"`)
        })
      }
    } else {
      console.log(`✓ ${sourceProduct.name}`)
    }
  }

  console.log('')
}

/**
 * Display verification summary
 */
function displaySummary(): void {
  console.log('='.repeat(70))
  console.log('📋 Verification Summary')
  console.log('='.repeat(70))

  if (issues.length === 0) {
    console.log('✅ All verifications passed! Catalog is in sync.\n')
    process.exit(0)
  } else {
    console.log(`Found ${issues.length} issue(s):\n`)

    // Group issues by type
    const byField = issues.reduce((acc, issue) => {
      acc[issue.field] = (acc[issue.field] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    Object.entries(byField).forEach(([field, count]) => {
      console.log(`  • ${field}: ${count} issue(s)`)
    })

    console.log('\n❌ Verification failed. Review issues above.\n')
    process.exit(1)
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🔍 Medusa Catalog Verification\n')

  const args = process.argv.slice(2)
  const detailed = args.includes('--detailed')

  try {
    // Authenticate to admin API
    console.log('🔐 Resolving admin authentication...')
    const auth = await getAdminAuthHeader(ADMIN_URL)
    console.log(
      auth.type === 'secret'
        ? '✓ Using Medusa secret API key\n'
        : '✓ Authentication successful (JWT)\n',
    )

    // Fetch products from Medusa
    const medusaProducts = await fetchMedusaProducts(auth)

    // Run verifications
    verifyProductCount(medusaProducts)
    verifyProducts(medusaProducts, detailed)

    // Display summary
    displaySummary()
  } catch (error) {
    console.error('\n❌ Verification error:', error instanceof Error ? error.message : error)
    console.error('\nTroubleshooting:')
    console.error('- Ensure Medusa service is running: pnpm run dev')
    console.error('- Provide MEDUSA_SECRET_KEY via Infisical or ensure MEDUSA_ADMIN_EMAIL and MEDUSA_ADMIN_PASSWORD are set in .env')
    console.error('- Run health check: pnpm run health:check')
    console.error('- See RFD-005 for authentication details: docs/RFD-005.md\n')
    process.exit(1)
  }
}

main()
