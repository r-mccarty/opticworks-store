import { products as fallbackProducts, type Product } from "@/lib/products"

type EnvKey = "MEDUSA_ENABLED" | "MEDUSA_BASE_URL" | "MEDUSA_API_TOKEN"

const isBrowser = typeof window !== "undefined"

const readEnv = (key: EnvKey): string | undefined => {
  const publicKey = `NEXT_PUBLIC_${key}` as keyof NodeJS.ProcessEnv
  if (isBrowser) {
    return process.env[publicKey]
  }
  return process.env[key] ?? process.env[publicKey]
}

const medusaEnv = {
  enabled: readEnv("MEDUSA_ENABLED") === "true",
  baseUrl: readEnv("MEDUSA_BASE_URL"),
  token: readEnv("MEDUSA_API_TOKEN"),
}

type MedusaListResponse = {
  products: MedusaProductResponse[]
}

type MedusaProductResponse = {
  id: string
  title: string
  handle?: string
  description?: string
  thumbnail?: string
  status?: "published" | "draft" | string
  collection_id?: string
  variants?: Array<{
    id: string
    title: string
    inventory_quantity?: number
    manage_inventory?: boolean
    metadata?: Record<string, unknown>
    prices?: Array<{
      currency_code: string
      amount: number
    }>
  }>
  metadata?: Record<string, unknown>
}

export interface CheckoutLineItem {
  id: string
  name: string
  price: number
  quantity: number
}

export interface PaymentSessionResult {
  sessionId: string
  clientSecret: string | null
  provider: "medusa" | "stripe"
}

const fallbackProductMap = new Map(fallbackProducts.map((product) => [product.id, product]))

const normalizePrice = (amount?: number) => {
  if (typeof amount !== "number") return undefined
  return Math.round(amount) / 100
}

const transformMedusaProduct = (raw: MedusaProductResponse): Product => {
  const fallback = fallbackProductMap.get(raw.id)
  const template: Product =
    fallback ??
    fallbackProducts[0] ?? {
      id: raw.id,
      name: raw.title ?? raw.id,
      description: raw.description ?? "",
      price: 0,
      image: raw.thumbnail ?? "",
      category: "sensor",
      specifications: [],
      inStock: true,
    }
  const firstVariant = raw.variants?.[0]
  const firstPrice = firstVariant?.prices?.find((price) => price.currency_code?.toLowerCase() === "usd")
    ?? firstVariant?.prices?.[0]

  const normalized: Product = {
    ...template,
    id: raw.id,
    name: raw.title ?? fallback?.name ?? raw.id,
    description: raw.description ?? fallback?.description ?? "",
    price: normalizePrice(firstPrice?.amount) ?? fallback?.price ?? 0,
    originalPrice: fallback?.originalPrice,
    image: raw.thumbnail ?? fallback?.image ?? "",
    category: fallback?.category ?? "sensor",
    badge: fallback?.badge,
    specifications: fallback?.specifications ?? [],
    keyBenefits: fallback?.keyBenefits,
    heroIntro: fallback?.heroIntro,
    highlights: fallback?.highlights,
    variants: fallback?.variants,
    reviews: fallback?.reviews,
    installGuide: fallback?.installGuide,
    inStock:
      (raw.variants?.some((variant) => {
        if (variant.manage_inventory === false) return true
        return (variant.inventory_quantity ?? 0) > 0
      })) ?? fallback?.inStock ?? true,
    featured: fallback?.featured,
  }

  return normalized
}

const medusaHeaders = (): HeadersInit => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (medusaEnv.token) {
    headers.Authorization = `Bearer ${medusaEnv.token}`
  }

  return headers
}

const medusaFetch = async <T>(path: string, init?: RequestInit): Promise<T> => {
  if (!medusaEnv.baseUrl) {
    throw new Error("MEDUSA_BASE_URL is not configured")
  }

  const url = `${medusaEnv.baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`
  const response = await fetch(url, {
    ...init,
    headers: {
      ...medusaHeaders(),
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Unknown error")
    throw new Error(`Medusa request failed (${response.status}): ${errorBody}`)
  }

  return response.json() as Promise<T>
}

export const medusaConfig = {
  enabled: medusaEnv.enabled && Boolean(medusaEnv.baseUrl),
  baseUrl: medusaEnv.baseUrl,
}

export async function listProducts(): Promise<Product[]> {
  if (!medusaConfig.enabled) {
    return fallbackProducts
  }

  try {
    const response = await medusaFetch<MedusaListResponse>("/store/products")
    return response.products.map(transformMedusaProduct)
  } catch (error) {
    console.warn("[medusa] Falling back to static products:", error)
    return fallbackProducts
  }
}

export async function getProductById(id: string): Promise<Product | undefined> {
  if (!medusaConfig.enabled) {
    return fallbackProductMap.get(id)
  }

  try {
    const product = await medusaFetch<{ product: MedusaProductResponse }>(`/store/products/${id}`)
    return transformMedusaProduct(product.product)
  } catch (error) {
    console.warn(`[medusa] Failed to fetch product ${id}, falling back to static data`, error)
    return fallbackProductMap.get(id)
  }
}

export async function createPaymentSession(items: CheckoutLineItem[]): Promise<PaymentSessionResult> {
  if (!items.length) {
    throw new Error("Cannot create payment session without items")
  }

  if (medusaConfig.enabled) {
    try {
      const response = await medusaFetch<{
        cart: { id: string }
        payment_session?: { id: string; client_secret?: string }
      }>("/store/carts", {
        method: "POST",
        body: JSON.stringify({
          items: items.map((item) => ({
            quantity: item.quantity,
            variant_id: item.id,
          })),
        }),
      })

      return {
        sessionId: response.payment_session?.id ?? response.cart.id,
        clientSecret: response.payment_session?.client_secret ?? null,
        provider: "medusa",
      }
    } catch (error) {
      console.warn("[medusa] Checkout session failed, falling back to Stripe:", error)
    }
  }

  const stripeResponse = await fetch("/api/stripe/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ items }),
  })

  if (!stripeResponse.ok) {
    const errorData = await stripeResponse.json().catch(() => ({}))
    throw new Error(errorData.error ?? "Failed to create checkout session")
  }

  const data = await stripeResponse.json()
  return {
    sessionId: data.sessionId,
    clientSecret: data.clientSecret ?? null,
    provider: "stripe",
  }
}
