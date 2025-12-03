import { products as fallbackProducts, type Product } from "@/lib/products"

type EnvKey = "MEDUSA_ENABLED" | "MEDUSA_BASE_URL" | "MEDUSA_PUBLISHABLE_KEY"

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
  publishableKey: readEnv("MEDUSA_PUBLISHABLE_KEY"),
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
  provider: "medusa" | "stripe" | "medusa-stripe"
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

  if (medusaEnv.publishableKey) {
    headers["x-publishable-api-key"] = medusaEnv.publishableKey
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
    // Include variant prices in the response
    const response = await medusaFetch<MedusaListResponse>("/store/products?fields=*variants.prices")
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
    // Include variant prices in the response
    const product = await medusaFetch<{ product: MedusaProductResponse }>(`/store/products/${id}?fields=*variants.prices`)
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
// Payment Session Functions (Track 4)
// =============================================================================

/**
 * Initialize payment sessions on the cart.
 * This prepares the cart for payment by creating sessions with all available providers.
 */
export async function initializePaymentSessions(cartId: string): Promise<MedusaCart> {
  const response = await medusaFetch<{ cart: MedusaCart }>(
    `/store/carts/${cartId}/payment-sessions`,
    { method: "POST" }
  )
  return response.cart
}

/**
 * Select a specific payment provider for the cart.
 */
export async function selectPaymentSession(
  cartId: string,
  providerId: string
): Promise<MedusaCart> {
  const response = await medusaFetch<{ cart: MedusaCart }>(
    `/store/carts/${cartId}/payment-session`,
    {
      method: "POST",
      body: JSON.stringify({ provider_id: providerId }),
    }
  )
  return response.cart
}

/**
 * Create a payment session via Medusa's Stripe provider.
 * Returns the Stripe client_secret for use with Stripe Elements.
 */
export async function createMedusaPaymentSession(cartId: string): Promise<PaymentSessionResult> {
  try {
    // 1. Initialize payment sessions
    await initializePaymentSessions(cartId)

    // 2. Select Stripe as the payment provider
    const cartWithStripe = await selectPaymentSession(cartId, "pp_stripe_stripe")

    // 3. Extract client_secret from the selected payment session
    const stripeSession = cartWithStripe.payment_session
    if (!stripeSession?.data?.client_secret) {
      throw new Error("Stripe payment session did not return a client_secret")
    }

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
