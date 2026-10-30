import { toMinor } from "./money"
import type { BagLine, CheckoutContact, CheckoutQuote, Offer, ShippingChoice, StoreBackend } from "./types"
import { StoreError } from "./types"

export interface MedusaConfig {
  /** e.g. https://backend.optic.works */
  baseUrl: string
  publishableKey: string
  /** Cloudflare Access service token, while the backend is dark. */
  accessClientId?: string
  accessClientSecret?: string
  fetch?: typeof fetch
}

/** Shown when the order can't be placed because payment isn't wired up yet. */
export const PAYMENT_NOT_CONNECTED =
  "Payment isn't connected yet. This test checkout stops before payment, so no order is placed."

type Amount = number | string | null | undefined

interface MedusaVariant {
  id: string
  calculated_price?: { calculated_amount: Amount; currency_code: string } | null
}
interface MedusaProduct {
  handle: string
  title: string
  variants?: MedusaVariant[]
}
interface MedusaLineItem {
  product_handle: string | null
  product_title: string | null
  title: string
  quantity: number
  unit_price: Amount
}
interface MedusaCart {
  id: string
  currency_code: string
  items?: MedusaLineItem[]
  shipping_methods?: { shipping_option_id: string }[]
  item_subtotal: Amount
  shipping_total: Amount
  tax_total: Amount
  total: Amount
}
interface MedusaShippingOption {
  id: string
  name: string
  price_type: "flat" | "calculated"
  amount?: Amount
}

const cartIdPattern = /^cart_[A-Za-z0-9]+$/

export function createMedusaBackend(config: MedusaConfig): StoreBackend {
  const doFetch = config.fetch ?? fetch
  let regionId: string | undefined

  async function request<T>(method: "GET" | "POST" | "DELETE", path: string, body?: unknown): Promise<T> {
    const headers: Record<string, string> = {
      "x-publishable-api-key": config.publishableKey,
      "content-type": "application/json",
    }
    if (config.accessClientId && config.accessClientSecret) {
      headers["CF-Access-Client-Id"] = config.accessClientId
      headers["CF-Access-Client-Secret"] = config.accessClientSecret
    }
    let response: Response
    try {
      response = await doFetch(`${config.baseUrl}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        cache: "no-store",
      })
    } catch {
      throw new StoreError("The store is unavailable right now. Please try again shortly.")
    }
    const data = (await response.json().catch(() => ({}))) as T & {
      message?: string
    }
    if (!response.ok) {
      // Medusa's 4xx messages describe the shopper's input; 5xx and Access
      // failures are not for display.
      if (response.status < 500 && response.status !== 401 && response.status !== 403 && data.message) {
        throw new StoreError(data.message)
      }
      throw new StoreError("The store is unavailable right now. Please try again shortly.")
    }
    return data
  }

  async function region(): Promise<string> {
    if (regionId) return regionId
    const { regions } = await request<{ regions: { id: string }[] }>("GET", "/store/regions?currency_code=usd")
    if (!regions[0]) throw new StoreError("The store is unavailable right now. Please try again shortly.")
    regionId = regions[0].id
    return regionId
  }

  async function listOffers(): Promise<Offer[]> {
    const fields = "id,handle,title,*variants.calculated_price"
    const { products } = await request<{ products: MedusaProduct[] }>(
      "GET",
      `/store/products?region_id=${await region()}&fields=${encodeURIComponent(fields)}&limit=50`,
    )
    return products.flatMap((product) => {
      const variant = product.variants?.[0]
      const price = variant?.calculated_price
      if (!variant || !price || price.calculated_amount == null) return []
      return [
        {
          handle: product.handle,
          title: product.title,
          variantId: variant.id,
          price: toMinor(price.calculated_amount),
          currency: price.currency_code,
        },
      ]
    })
  }

  async function shippingChoices(cartId: string): Promise<ShippingChoice[]> {
    const { shipping_options } = await request<{
      shipping_options: MedusaShippingOption[]
    }>("GET", `/store/shipping-options?cart_id=${cartId}`)
    const choices = await Promise.all(
      shipping_options.map(async (option): Promise<ShippingChoice | null> => {
        if (option.price_type === "flat")
          return {
            id: option.id,
            name: option.name,
            amount: toMinor(option.amount),
          }
        try {
          const { shipping_option } = await request<{
            shipping_option: MedusaShippingOption
          }>("POST", `/store/shipping-options/${option.id}/calculate`, {
            cart_id: cartId,
          })
          return {
            id: option.id,
            name: option.name,
            amount: toMinor(shipping_option.amount),
          }
        } catch {
          // A carrier without a rate for this address is simply not offered.
          return null
        }
      }),
    )
    return choices.filter((choice): choice is ShippingChoice => choice !== null).sort((a, b) => a.amount - b.amount)
  }

  async function quote(cart: MedusaCart): Promise<CheckoutQuote> {
    const selectedShippingId = cart.shipping_methods?.[0]?.shipping_option_id
    return {
      currency: cart.currency_code,
      lines: (cart.items ?? []).map((item) => {
        const unitPrice = toMinor(item.unit_price)
        return {
          handle: item.product_handle ?? "",
          title: item.product_title ?? item.title,
          quantity: item.quantity,
          unitPrice,
          total: unitPrice * item.quantity,
        }
      }),
      shippingOptions: await shippingChoices(cart.id),
      selectedShippingId,
      subtotal: toMinor(cart.item_subtotal),
      shipping: toMinor(cart.shipping_total),
      tax: toMinor(cart.tax_total),
      total: toMinor(cart.total),
      placeOrderBlocked: selectedShippingId ? PAYMENT_NOT_CONNECTED : "Choose a shipping method.",
    }
  }

  function address(contact: CheckoutContact) {
    return {
      first_name: contact.firstName,
      last_name: contact.lastName,
      address_1: contact.address1,
      address_2: contact.address2 ?? "",
      city: contact.city,
      province: contact.state.toLowerCase(),
      postal_code: contact.postalCode,
      country_code: "us",
      phone: contact.phone ?? "",
    }
  }

  function cartId(token: string): string {
    if (!cartIdPattern.test(token)) throw new StoreError("Your checkout expired. Please start again.")
    return token
  }

  return {
    mode: "medusa",
    listOffers,

    async startCheckout(lines: BagLine[], contact: CheckoutContact) {
      const offers = await listOffers()
      const items = lines.flatMap((line) => {
        const offer = offers.find((o) => o.handle === line.handle)
        return offer ? [{ variant_id: offer.variantId, quantity: line.quantity }] : []
      })
      if (!items.length) throw new StoreError("Your bag is empty.")

      // The full address goes on the cart before any item: Stripe Tax can't
      // price a line item without a US ZIP code, so the backend rejects adding
      // items to a cart that only knows its region.
      let { cart } = await request<{ cart: MedusaCart }>("POST", "/store/carts", {
        region_id: await region(),
        email: contact.email,
        shipping_address: address(contact),
        billing_address: address(contact),
      })
      for (const item of items) {
        ;({ cart } = await request<{ cart: MedusaCart }>("POST", `/store/carts/${cart.id}/line-items`, item))
      }
      return { token: cart.id, quote: await quote(cart) }
    },

    async selectShipping(token: string, optionId: string) {
      const { cart } = await request<{ cart: MedusaCart }>("POST", `/store/carts/${cartId(token)}/shipping-methods`, {
        option_id: optionId,
      })
      return { token: cart.id, quote: await quote(cart) }
    },

    async placeOrder(token: string) {
      cartId(token)
      throw new StoreError(PAYMENT_NOT_CONNECTED)
    },
  }
}
