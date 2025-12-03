import { cache } from "react"
import { products as fallbackProducts, type Product } from "@/lib/products"

// NOTE: Environment variables must be accessed directly as process.env.NEXT_PUBLIC_*
// for Next.js to inline them at build time. Dynamic access like process.env[key]
// will not be replaced and will be undefined in the browser.
const medusaEnv = {
  enabled: process.env.NEXT_PUBLIC_MEDUSA_ENABLED === "true",
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BASE_URL,
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
}

// Debug logging for Medusa configuration (helps diagnose env var issues)
if (typeof window === "undefined") {
  // Server-side logging
  console.log("[medusa] Server config:", {
    enabled: medusaEnv.enabled,
    baseUrl: medusaEnv.baseUrl ? "SET" : "NOT SET",
    publishableKey: medusaEnv.publishableKey ? "SET" : "NOT SET",
    raw_enabled: process.env.NEXT_PUBLIC_MEDUSA_ENABLED,
  })
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

export interface PaymentSessionResult {
  sessionId: string
  clientSecret: string | null
  provider: "medusa" | "medusa-stripe"
}

// Cart API types for Medusa v2
export interface MedusaLineItem {
  id: string
  cart_id: string
  title: string
  description?: string
  thumbnail?: string
  quantity: number
  variant_id: string
  product_id: string
  unit_price: number
  subtotal: number
  total: number
  original_total: number
  discount_total: number
  tax_total: number
}

export interface MedusaCart {
  id: string
  region_id: string
  email?: string
  customer_id?: string
  shipping_address?: MedusaAddress
  billing_address?: MedusaAddress
  items: MedusaLineItem[]
  subtotal: number
  total: number
  tax_total: number
  discount_total: number
  shipping_total: number
  payment_session?: {
    id: string
    provider_id: string
    data: {
      client_secret?: string
    }
  }
  payment_sessions?: Array<{
    id: string
    provider_id: string
    data: {
      client_secret?: string
    }
  }>
}

export interface MedusaAddress {
  first_name?: string
  last_name?: string
  address_1?: string
  address_2?: string
  city?: string
  province?: string
  postal_code?: string
  country_code?: string
  phone?: string
}

export interface MedusaRegion {
  id: string
  name: string
  currency_code: string
  countries: Array<{ iso_2: string; name: string }>
  payment_providers: Array<{ id: string }>
}

const fallbackProductMap = new Map(fallbackProducts.map((product) => [product.id, product]))

// Medusa v2 stores prices in MAJOR units (dollars), not minor units (cents)
// See: https://docs.medusajs.com/learn/introduction/from-v1-to-v2#prices-are-stored-in-major-units
const normalizePrice = (amount?: number) => {
  if (typeof amount !== "number") return undefined
  return amount
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

  // Map Medusa variants to ProductVariant format, matching by name/title
  // This preserves static variant metadata (badge, description) while adding Medusa variant IDs
  const mergedVariants = fallback?.variants?.map((staticVariant) => {
    // Find matching Medusa variant by title
    const medusaVariant = raw.variants?.find(
      (mv) => mv.title?.toLowerCase() === staticVariant.name.toLowerCase()
    )
    const variantPrice = medusaVariant?.prices?.find((p) => p.currency_code?.toLowerCase() === "usd")
      ?? medusaVariant?.prices?.[0]

    return {
      ...staticVariant,
      // Use Medusa price if available
      price: normalizePrice(variantPrice?.amount) ?? staticVariant.price,
      // Add Medusa variant ID for cart integration
      medusaVariantId: medusaVariant?.id,
    }
  })

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
    variants: mergedVariants ?? fallback?.variants,
    reviews: fallback?.reviews,
    installGuide: fallback?.installGuide,
    inStock:
      (raw.variants?.some((variant) => {
        if (variant.manage_inventory === false) return true
        return (variant.inventory_quantity ?? 0) > 0
      })) ?? fallback?.inStock ?? true,
    featured: fallback?.featured,
    // Include first variant ID for Medusa cart integration
    variantId: firstVariant?.id,
  }

  return normalized
}

const medusaHeaders = (): HeadersInit => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    // Identify requests from the storefront worker
    "User-Agent": "OpticWorks-Storefront/1.0",
  }

  if (medusaEnv.publishableKey) {
    headers["x-publishable-api-key"] = medusaEnv.publishableKey
    console.log("[medusa] Headers:", JSON.stringify(headers))
  } else {
    console.warn("[medusa] No publishable key available!")
  }

  return headers
}

const medusaFetch = async <T>(path: string, init?: RequestInit): Promise<T> => {
  if (!medusaEnv.baseUrl) {
    throw new Error("MEDUSA_BASE_URL is not configured")
  }

  const url = `${medusaEnv.baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`
  console.log(`[medusa] ${init?.method ?? "GET"} ${url}`)

  const response = await fetch(url, {
    ...init,
    headers: {
      ...medusaHeaders(),
      ...(init?.headers ?? {}),
    },
  })

  console.log(`[medusa] Response: ${response.status} ${response.statusText}`)

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Unknown error")
    console.error(`[medusa] Error response body:`, errorBody)
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
    // Include variant prices in the response
    const response = await medusaFetch<MedusaListResponse>("/store/products?fields=*variants.prices")
    return response.products.map(transformMedusaProduct)
  } catch (error) {
    console.warn("[medusa] Falling back to static products:", error)
    return fallbackProducts
  }
}

/**
 * Fetch a product by ID/handle.
 * Wrapped with React cache() to deduplicate calls within the same request.
 * This prevents duplicate API calls when both generateMetadata and the page
 * component need the same product data.
 */
export const getProductById = cache(async (id: string): Promise<Product | undefined> => {
  if (!medusaConfig.enabled) {
    return fallbackProductMap.get(id)
  }

  try {
    // Medusa v2 uses handle for product lookup (id is the URL slug which matches handle)
    const response = await medusaFetch<MedusaListResponse>(`/store/products?handle=${id}&fields=*variants.prices`)
    const product = response.products?.[0]
    if (!product) {
      console.warn(`[medusa] No product found with handle ${id}, falling back to static data`)
      return fallbackProductMap.get(id)
    }
    return transformMedusaProduct(product)
  } catch (error) {
    console.warn(`[medusa] Failed to fetch product ${id}, falling back to static data`, error)
    return fallbackProductMap.get(id)
  }
})

// Legacy createPaymentSession removed - use createMedusaPaymentSession instead

// =============================================================================
// Cart API Functions (Track 3)
// =============================================================================

/**
 * Fetch available regions. Returns the first region's ID for cart creation.
 */
export async function getRegions(): Promise<MedusaRegion[]> {
  const response = await medusaFetch<{ regions: MedusaRegion[] }>("/store/regions")
  return response.regions
}

/**
 * Get the default region ID (US region or first available).
 */
export async function getDefaultRegionId(): Promise<string> {
  const regions = await getRegions()
  // Prefer US region if available
  const usRegion = regions.find((r) =>
    r.countries.some((c) => c.iso_2.toLowerCase() === "us")
  )
  const defaultRegion = usRegion ?? regions[0]
  if (!defaultRegion) {
    throw new Error("No regions configured in Medusa. Please configure at least one region.")
  }
  return defaultRegion.id
}

/**
 * Create a new cart with the specified region.
 */
export async function createCart(regionId: string): Promise<MedusaCart> {
  const response = await medusaFetch<{ cart: MedusaCart }>("/store/carts", {
    method: "POST",
    body: JSON.stringify({ region_id: regionId }),
  })
  return response.cart
}

/**
 * Retrieve an existing cart by ID.
 */
export async function getCart(cartId: string): Promise<MedusaCart> {
  const response = await medusaFetch<{ cart: MedusaCart }>(`/store/carts/${cartId}`)
  return response.cart
}

/**
 * Add a line item to the cart.
 */
export async function addLineItem(
  cartId: string,
  variantId: string,
  quantity: number
): Promise<MedusaCart> {
  const response = await medusaFetch<{ cart: MedusaCart }>(
    `/store/carts/${cartId}/line-items`,
    {
      method: "POST",
      body: JSON.stringify({ variant_id: variantId, quantity }),
    }
  )
  return response.cart
}

/**
 * Update a line item's quantity.
 */
export async function updateLineItem(
  cartId: string,
  lineItemId: string,
  quantity: number
): Promise<MedusaCart> {
  const response = await medusaFetch<{ cart: MedusaCart }>(
    `/store/carts/${cartId}/line-items/${lineItemId}`,
    {
      method: "POST",
      body: JSON.stringify({ quantity }),
    }
  )
  return response.cart
}

/**
 * Remove a line item from the cart.
 */
export async function removeLineItem(
  cartId: string,
  lineItemId: string
): Promise<MedusaCart> {
  const response = await medusaFetch<{ cart: MedusaCart }>(
    `/store/carts/${cartId}/line-items/${lineItemId}`,
    {
      method: "DELETE",
    }
  )
  return response.cart
}

/**
 * Update cart with customer email and/or addresses.
 */
export async function updateCart(
  cartId: string,
  data: {
    email?: string
    shipping_address?: MedusaAddress
    billing_address?: MedusaAddress
    customer_id?: string
  }
): Promise<MedusaCart> {
  const response = await medusaFetch<{ cart: MedusaCart }>(`/store/carts/${cartId}`, {
    method: "POST",
    body: JSON.stringify(data),
  })
  return response.cart
}

// =============================================================================
// Shipping Functions - Medusa v2 API
// =============================================================================

/**
 * Shipping option from Medusa v2
 */
export interface MedusaShippingOption {
  id: string
  name: string
  price_type: string
  service_zone_id: string
  shipping_profile_id: string
  provider_id: string
  data: Record<string, unknown>
  type: {
    id: string
    label: string
    description: string
    code: string
  }
  amount: number
}

/**
 * Get available shipping options for a cart.
 * Requires cart to have a shipping address set first.
 */
export async function getShippingOptions(cartId: string): Promise<MedusaShippingOption[]> {
  console.log("[medusa] Getting shipping options for cart:", cartId)
  const response = await medusaFetch<{ shipping_options: MedusaShippingOption[] }>(
    `/store/shipping-options?cart_id=${cartId}`
  )
  console.log("[medusa] Found", response.shipping_options.length, "shipping options")
  return response.shipping_options
}

/**
 * Add a shipping method to the cart.
 */
export async function addShippingMethod(
  cartId: string,
  optionId: string
): Promise<MedusaCart> {
  console.log("[medusa] Adding shipping method to cart:", cartId, "option:", optionId)
  const response = await medusaFetch<{ cart: MedusaCart }>(
    `/store/carts/${cartId}/shipping-methods`,
    {
      method: "POST",
      body: JSON.stringify({ option_id: optionId }),
    }
  )
  console.log("[medusa] Shipping method added successfully")
  return response.cart
}

// =============================================================================
// Payment Session Functions (Track 4) - Medusa v2 API
// =============================================================================

/**
 * Payment collection response from Medusa v2
 */
interface MedusaPaymentCollection {
  id: string
  currency_code: string
  amount: number
  payment_sessions: Array<{
    id: string
    currency_code: string
    provider_id: string
    amount: number
    status: string
    data: {
      id?: string
      client_secret?: string
      [key: string]: unknown
    }
  }>
}

/**
 * Create a payment collection for the cart.
 * In Medusa v2, payment collections are separate from carts.
 */
export async function createPaymentCollection(cartId: string): Promise<MedusaPaymentCollection> {
  console.log("[medusa] Creating payment collection for cart:", cartId)
  const response = await medusaFetch<{ payment_collection: MedusaPaymentCollection }>(
    "/store/payment-collections",
    {
      method: "POST",
      body: JSON.stringify({ cart_id: cartId }),
    }
  )
  console.log("[medusa] Payment collection created:", response.payment_collection.id)
  return response.payment_collection
}

/**
 * Create a payment session on a payment collection with a specific provider.
 * In Medusa v2, this is how you initialize Stripe payments.
 */
export async function createPaymentSession(
  paymentCollectionId: string,
  providerId: string
): Promise<MedusaPaymentCollection> {
  console.log("[medusa] Creating payment session with provider:", providerId)
  const response = await medusaFetch<{ payment_collection: MedusaPaymentCollection }>(
    `/store/payment-collections/${paymentCollectionId}/payment-sessions`,
    {
      method: "POST",
      body: JSON.stringify({ provider_id: providerId }),
    }
  )
  console.log("[medusa] Payment session created. Sessions:", response.payment_collection.payment_sessions.length)
  return response.payment_collection
}

/**
 * Create a payment session via Medusa's Stripe provider.
 * Returns the Stripe client_secret for use with Stripe Elements.
 *
 * Medusa v2 flow:
 * 1. Create payment collection for the cart
 * 2. Create payment session with Stripe provider on the collection
 * 3. Extract client_secret from the payment session data
 */
export async function createMedusaPaymentSession(cartId: string): Promise<PaymentSessionResult> {
  console.log("[medusa] createMedusaPaymentSession called with cartId:", cartId)

  try {
    // 1. Create payment collection for the cart
    console.log("[medusa] Step 1: Creating payment collection...")
    const paymentCollection = await createPaymentCollection(cartId)
    console.log("[medusa] Payment collection created:", paymentCollection.id)

    // 2. Create payment session with Stripe provider
    console.log("[medusa] Step 2: Creating Stripe payment session...")
    const collectionWithSession = await createPaymentSession(
      paymentCollection.id,
      "pp_stripe_stripe"
    )

    // 3. Extract client_secret from the Stripe payment session
    const stripeSession = collectionWithSession.payment_sessions.find(
      (s) => s.provider_id === "pp_stripe_stripe"
    )
    console.log("[medusa] Step 3: Extracting client_secret. Session data keys:",
      stripeSession?.data ? Object.keys(stripeSession.data) : "no data"
    )

    if (!stripeSession?.data?.client_secret) {
      console.error("[medusa] No client_secret in session data:", stripeSession?.data)
      throw new Error("Stripe payment session did not return a client_secret")
    }

    console.log("[medusa] Success! Got client_secret (length:", stripeSession.data.client_secret.length, ")")
    return {
      sessionId: stripeSession.id,
      clientSecret: stripeSession.data.client_secret,
      provider: "medusa-stripe",
    }
  } catch (error) {
    console.error("[medusa] Payment session creation failed:", error)
    throw error
  }
}

/**
 * Complete the cart and create an order after payment succeeds.
 */
export async function completeCart(cartId: string): Promise<{ order: { id: string; display_id: number } }> {
  const response = await medusaFetch<{
    type: string
    order: { id: string; display_id: number }
  }>(`/store/carts/${cartId}/complete`, {
    method: "POST",
  })
  return { order: response.order }
}

/**
 * Retrieve an order by ID.
 */
export async function getOrder(orderId: string): Promise<{
  id: string
  display_id: number
  email: string
  items: MedusaLineItem[]
  subtotal: number
  total: number
  tax_total: number
  shipping_total: number
  status: string
}> {
  const response = await medusaFetch<{ order: {
    id: string
    display_id: number
    email: string
    items: MedusaLineItem[]
    subtotal: number
    total: number
    tax_total: number
    shipping_total: number
    status: string
  } }>(`/store/orders/${orderId}`)
  return response.order
}

// =============================================================================
// Authentication API Functions (Track 6)
// =============================================================================

export interface MedusaCustomer {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  token: string
}

export interface CustomerResponse {
  customer: MedusaCustomer
}

/**
 * Register a new customer with email and password.
 * Returns a JWT token for authentication.
 */
export async function registerCustomer(
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await medusaFetch<AuthResponse>(
    "/auth/customer/emailpass/register",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }
  )
  return response
}

/**
 * Authenticate a customer with email and password.
 * Returns a JWT token for authentication.
 */
export async function loginCustomer(
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await medusaFetch<AuthResponse>(
    "/auth/customer/emailpass",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }
  )
  return response
}

/**
 * Create a customer profile after registration.
 * Requires JWT token from registration.
 */
export async function createCustomerProfile(
  token: string,
  data: {
    email: string
    first_name?: string
    last_name?: string
    phone?: string
  }
): Promise<CustomerResponse> {
  const response = await medusaFetch<CustomerResponse>("/store/customers", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  return response
}

/**
 * Get the currently authenticated customer.
 * Requires JWT token.
 */
export async function getCurrentCustomer(
  token: string
): Promise<CustomerResponse> {
  const response = await medusaFetch<CustomerResponse>("/store/customers/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response
}

/**
 * Update customer profile.
 * Requires JWT token.
 */
export async function updateCustomerProfile(
  token: string,
  data: {
    first_name?: string
    last_name?: string
    phone?: string
  }
): Promise<CustomerResponse> {
  const response = await medusaFetch<CustomerResponse>("/store/customers/me", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  return response
}

/**
 * Refresh an authentication token.
 */
export async function refreshAuthToken(token: string): Promise<AuthResponse> {
  const response = await medusaFetch<AuthResponse>("/auth/token/refresh", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response
}
