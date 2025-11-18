import path from "node:path"
import { fileURLToPath } from "node:url"
import "dotenv/config"
import type { Product } from "../../../src/lib/products"
import { products } from "../../../src/lib/products"
import { retryFetch } from "./utils/retry.js"
import { getAdminAuthHeader, type AdminAuthHeader } from "./utils/auth.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ADMIN_URL = process.env.MEDUSA_ADMIN_URL ?? "http://127.0.0.1:9000"

/**
 * Enhanced API fetch with retry logic for transient failures
 * Updated for RFD-005: Prefers secret API key Basic auth with JWT fallback
 */
async function apiFetch<T>(input: URL | string, auth: AdminAuthHeader, init?: RequestInit): Promise<T> {
  const response = await retryFetch(
    input.toString(),
    {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "Authorization": auth.header,
        ...(init?.headers ?? {}),
      },
    },
    {
      maxAttempts: 3,
      initialDelay: 1000,
      onRetry: (attempt, error, delay) => {
        console.log(`    Retry ${attempt}: ${error.message} (waiting ${Math.round(delay / 1000)}s)`)
      },
    }
  )

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Request to ${input} failed: ${response.status} ${body}`)
  }

  return response.json() as Promise<T>
}

async function fetchDefaultSalesChannelId(auth: AdminAuthHeader): Promise<string> {
  const url = new URL("/admin/sales-channels", ADMIN_URL)
  url.searchParams.set("limit", "1")
  const data = await apiFetch<{ sales_channels: Array<{ id: string }> }>(url, auth)
  const channel = data.sales_channels?.[0]
  if (!channel) {
    throw new Error("No sales channels found in Medusa instance")
  }
  return channel.id
}

async function fetchProductByHandle(handle: string, auth: AdminAuthHeader) {
  const url = new URL("/admin/products", ADMIN_URL)
  url.searchParams.set("handle[]", handle)
  const data = await apiFetch<{ products: Array<{ id: string }> }>(url, auth)
  return data.products?.[0]
}

type AdminProductPayload = {
  title: string
  handle?: string
  description?: string
  status: "draft" | "published"
  collection_id?: string
  metadata?: Record<string, unknown>
  sales_channels: Array<{ id: string }>
  options?: Array<{
    title: string
    values: string[]
  }>
  variants: Array<{
    title: string
    prices: Array<{
      currency_code: string
      amount: number
    }>
    metadata?: Record<string, unknown>
    options?: Record<string, string>
  }>
}

const productToPayload = (
  product: Product,
  salesChannelId: string,
): AdminProductPayload => {
  const variantDefinitions = product.variants ?? []
  const optionValues =
    variantDefinitions.length > 0
      ? variantDefinitions.map((variant) => variant.name)
      : [`${product.name} Default`]

  return {
    title: product.name,
    handle: product.id,
    description: product.description,
    status: product.inStock ? "published" : "draft",
    metadata: {
      category: product.category,
      badge: product.badge,
      heroIntro: product.heroIntro,
      keyBenefits: product.keyBenefits,
      highlights: product.highlights,
      installGuide: product.installGuide,
    },
    sales_channels: [{ id: salesChannelId }],
    options: [
      {
        title: "Configuration",
        values: optionValues,
      },
    ],
    variants:
      variantDefinitions.length > 0
        ? variantDefinitions.map((variant) => ({
            title: variant.name,
            prices: [
              {
                currency_code: "usd",
                amount: Math.round(variant.price * 100),
              },
            ],
            metadata: {
              description: variant.description,
              badge: variant.badge,
            },
            options: {
              Configuration: variant.name,
            },
          }))
        : [
            {
              title: `${product.name} Default`,
              prices: [
                {
                  currency_code: "usd",
                  amount: Math.round(product.price * 100),
                },
              ],
              options: {
                Configuration: `${product.name} Default`,
              },
            },
          ],
  }
}

async function createProduct(payload: AdminProductPayload, auth: AdminAuthHeader) {
  const url = new URL("/admin/products", ADMIN_URL)
  return apiFetch(url, auth, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

interface ImportResult {
  product: string
  status: 'synced' | 'skipped' | 'failed'
  error?: string
}

async function main() {
  console.log(`\n📦 Medusa Catalog Import`)
  console.log('='.repeat(70))
  console.log(`Source:  ${products.length} products from src/lib/products`)
  console.log(`Target:  ${ADMIN_URL}`)
  console.log('='.repeat(70) + '\n')

  // Authenticate to admin API (prefers secret API key, falls back to JWT)
  console.log('🔐 Resolving admin authentication...')
  const auth = await getAdminAuthHeader(ADMIN_URL)
  console.log(
    auth.type === 'secret'
      ? '✓ Using Medusa secret API key\n'
      : '✓ Authentication successful (JWT)\n',
  )

  const salesChannelId = await fetchDefaultSalesChannelId(auth)
  console.log(`✓ Using sales channel: ${salesChannelId}\n`)

  const results: ImportResult[] = []
  let synced = 0
  let skipped = 0
  let failed = 0

  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    const progress = `[${i + 1}/${products.length}]`

    try {
      const existing = await fetchProductByHandle(product.id, auth)
      if (existing?.id) {
        console.log(`${progress} ⊘ Skipping ${product.name} (already exists)`)
        skipped += 1
        results.push({
          product: product.name,
          status: 'skipped',
        })
      } else {
        const payload = productToPayload(product, salesChannelId)
        await createProduct(payload, auth)
        synced += 1
        console.log(`${progress} ✓ Synced ${product.name}`)
        results.push({
          product: product.name,
          status: 'synced',
        })
      }
    } catch (error) {
      failed += 1
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.error(`${progress} ✗ Failed ${product.name}`)
      console.error(`    Error: ${errorMsg}`)
      results.push({
        product: product.name,
        status: 'failed',
        error: errorMsg,
      })
    }
  }

  // Display summary
  console.log('\n' + '='.repeat(70))
  console.log('📊 Import Summary')
  console.log('='.repeat(70))
  console.log(`✓ Synced:  ${synced} products`)
  console.log(`⊘ Skipped: ${skipped} products (already exist)`)
  console.log(`✗ Failed:  ${failed} products`)
  console.log('='.repeat(70))

  // Show failed products if any
  if (failed > 0) {
    console.log('\n❌ Failed Products:')
    results
      .filter(r => r.status === 'failed')
      .forEach(r => {
        console.log(`  • ${r.product}`)
        console.log(`    ${r.error}`)
      })
    console.log('')
  }

  if (failed > 0) {
    console.log('⚠️  Import completed with errors. Review failed products above.\n')
    process.exit(1)
  } else {
    console.log('✅ Import completed successfully!\n')
    process.exit(0)
  }
}

main().catch((error) => {
  console.error("\n❌ Import failed:", error instanceof Error ? error.message : error)
  console.error("\nTroubleshooting:")
  console.error("- Ensure Medusa service is running: pnpm run dev")
  console.error("- Provide MEDUSA_SECRET_KEY via Infisical or ensure MEDUSA_ADMIN_EMAIL and MEDUSA_ADMIN_PASSWORD are set in .env")
  console.error("- Verify MEDUSA_ADMIN_URL is correct")
  console.error("- Run health check: pnpm run health:check")
  console.error("- See RFD-005 for authentication details: docs/RFD-005.md\n")
  process.exit(1)
})
