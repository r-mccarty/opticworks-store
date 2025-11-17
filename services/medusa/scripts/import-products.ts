import path from "node:path"
import { fileURLToPath } from "node:url"
import "dotenv/config"
import type { Product } from "../../../src/lib/products"
import { products } from "../../../src/lib/products"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ADMIN_URL = process.env.MEDUSA_ADMIN_URL ?? "http://127.0.0.1:9000"
const ADMIN_TOKEN = process.env.MEDUSA_ADMIN_TOKEN

if (!ADMIN_TOKEN) {
  console.warn("[medusa] MEDUSA_ADMIN_TOKEN is not set. Requests will fail unless server allows anonymous access.")
}

async function apiFetch<T>(input: URL | string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(ADMIN_TOKEN ? { Authorization: `Bearer ${ADMIN_TOKEN}` } : {}),
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Request to ${input} failed: ${response.status} ${body}`)
  }

  return response.json() as Promise<T>
}

async function fetchDefaultSalesChannelId(): Promise<string> {
  const url = new URL("/admin/sales-channels", ADMIN_URL)
  url.searchParams.set("limit", "1")
  const data = await apiFetch<{ sales_channels: Array<{ id: string }> }>(url)
  const channel = data.sales_channels?.[0]
  if (!channel) {
    throw new Error("No sales channels found in Medusa instance")
  }
  return channel.id
}

async function fetchProductByHandle(handle: string) {
  const url = new URL("/admin/products", ADMIN_URL)
  url.searchParams.set("handle[]", handle)
  const data = await apiFetch<{ products: Array<{ id: string }> }>(url)
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

async function createProduct(payload: AdminProductPayload) {
  const url = new URL("/admin/products", ADMIN_URL)
  return apiFetch(url, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

async function main() {
  console.log(`[medusa] Importing ${products.length} products into ${ADMIN_URL}`)
  const salesChannelId = await fetchDefaultSalesChannelId()

  let synced = 0
  for (const product of products) {
    const payload = productToPayload(product, salesChannelId)
    try {
      const existing = await fetchProductByHandle(product.id)
      if (existing?.id) {
        console.log(`  • Skipping ${product.name} (already exists)`)
      } else {
        await createProduct(payload)
        synced += 1
        console.log(`  • Synced ${product.name}`)
      }
    } catch (error) {
      console.error(`  ✖ Failed to sync ${product.name}`, error)
    }
  }

  console.log(`[medusa] Synced ${synced}/${products.length} products`)
}

main().catch((error) => {
  console.error("[medusa] Import failed", error)
  process.exit(1)
})
