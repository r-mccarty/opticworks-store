import path from "node:path"
import { fileURLToPath } from "node:url"
import "dotenv/config"
import type { Product } from "../../../src/lib/products"
import { products } from "../../../src/lib/products"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ADMIN_URL = process.env.MEDUSA_ADMIN_URL ?? "http://localhost:9000"
const ADMIN_TOKEN = process.env.MEDUSA_ADMIN_TOKEN

if (!ADMIN_TOKEN) {
  console.warn("[medusa] MEDUSA_ADMIN_TOKEN is not set. Requests will fail unless server allows anonymous access.")
}

type AdminProductPayload = {
  id?: string
  title: string
  handle: string
  description?: string
  status: "draft" | "published"
  collection_id?: string
  metadata?: Record<string, unknown>
  variants: Array<{
    id?: string
    title: string
    prices: Array<{
      currency_code: string
      amount: number
    }>
    metadata?: Record<string, unknown>
  }>
}

const productToPayload = (product: Product): AdminProductPayload => {
  return {
    id: product.id,
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
    variants:
      product.variants?.map((variant) => ({
        id: variant.id,
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
      })) ??
      [
        {
          title: `${product.name} Default`,
          prices: [
            {
              currency_code: "usd",
              amount: Math.round(product.price * 100),
            },
          ],
        },
      ],
  }
}

async function upsertProduct(payload: AdminProductPayload) {
  const url = new URL(`/admin/products${payload.id ? `/${payload.id}` : ""}`, ADMIN_URL)

  const response = await fetch(url, {
    method: payload.id ? "POST" : "POST",
    headers: {
      "Content-Type": "application/json",
      ...(ADMIN_TOKEN ? { Authorization: `Bearer ${ADMIN_TOKEN}` } : {}),
    },
    body: JSON.stringify({ product: payload }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Failed to upsert product ${payload.title}: ${response.status} ${body}`)
  }

  return response.json()
}

async function main() {
  console.log(`[medusa] Importing ${products.length} products into ${ADMIN_URL}`)

  let created = 0
  for (const product of products) {
    const payload = productToPayload(product)
    try {
      await upsertProduct(payload)
      created += 1
      console.log(`  • Synced ${product.name}`)
    } catch (error) {
      console.error(`  ✖ Failed to sync ${product.name}`, error)
    }
  }

  console.log(`[medusa] Synced ${created}/${products.length} products`)
}

main().catch((error) => {
  console.error("[medusa] Import failed", error)
  process.exit(1)
})
