import { describe, expect, it } from "vitest"

import { addToBag, bagCount, parseBag, parseContact, serializeBag, setQuantity, MAX_QUANTITY } from "./bag"
import { createMedusaBackend, PAYMENT_NOT_CONNECTED } from "./medusa"
import { mockBackend, MOCK_PRICES } from "./mock"
import { resolveStoreMode } from "./mode"
import { formatMoney, toMinor } from "./money"
import type { CheckoutContact } from "./types"
import { StoreError } from "./types"

const contact: CheckoutContact = {
  email: "test@optic.works",
  firstName: "Test",
  lastName: "Buyer",
  address1: "3077B Clairemont Dr",
  address2: "#201",
  city: "San Diego",
  state: "CA",
  postalCode: "92117",
}

describe("store mode", () => {
  it("is off on production hosts unless STORE_MODE is set", () => {
    expect(resolveStoreMode(undefined, "optic.works")).toBe("off")
    expect(resolveStoreMode(undefined, "www.optic.works")).toBe("off")
    expect(resolveStoreMode("", "optic.works")).toBe("off")
    expect(resolveStoreMode("medusa", "optic.works")).toBe("medusa")
  })

  it("defaults to mock on local and Workers preview hosts", () => {
    expect(resolveStoreMode(undefined, "localhost:3000")).toBe("mock")
    expect(resolveStoreMode(undefined, "abc123-opticworks-store.ryan-39f.workers.dev")).toBe("mock")
    expect(resolveStoreMode("off", "localhost:3000")).toBe("off")
  })

  it("treats an unknown STORE_MODE as off", () => {
    expect(resolveStoreMode("live", "localhost")).toBe("off")
  })
})

describe("money", () => {
  it("converts Medusa major units to cents, rounding long decimals", () => {
    expect(toMinor(5999)).toBe(599900)
    expect(toMinor(464.920010415)).toBe(46492)
    expect(toMinor("8.07")).toBe(807)
    expect(toMinor(null)).toBe(0)
  })

  it("formats cents as currency", () => {
    expect(formatMoney(599900, "usd")).toBe("$5,999.00")
  })
})

describe("bag", () => {
  it("round-trips and drops malformed or duplicate lines", () => {
    const raw = JSON.stringify([
      { handle: "vmc", quantity: 2 },
      { handle: "vmc", quantity: 1 },
      { handle: "Bad Handle", quantity: 1 },
      { handle: "mach-1", quantity: 0 },
      { handle: "mach-1", quantity: 99 },
      "junk",
    ])
    expect(parseBag(raw)).toEqual([
      { handle: "vmc", quantity: 2 },
      { handle: "mach-1", quantity: MAX_QUANTITY },
    ])
    expect(parseBag("not json")).toEqual([])
    expect(parseBag(serializeBag([{ handle: "vmc", quantity: 1 }]))).toEqual([{ handle: "vmc", quantity: 1 }])
  })

  it("adds, updates in place, clamps and removes", () => {
    let bag = addToBag([], "vmc")
    bag = addToBag(bag, "mach-1")
    bag = addToBag(bag, "vmc")
    expect(bag).toEqual([
      { handle: "vmc", quantity: 2 },
      { handle: "mach-1", quantity: 1 },
    ])
    expect(setQuantity(bag, "vmc", 50)[0]).toEqual({ handle: "vmc", quantity: MAX_QUANTITY })
    expect(setQuantity(bag, "vmc", 0)).toEqual([{ handle: "mach-1", quantity: 1 }])
    expect(bagCount(bag)).toBe(3)
  })

  it("validates checkout contact details", () => {
    expect(parseContact({ ...contact, state: "ca" }).contact?.state).toBe("CA")
    const { contact: parsed, errors } = parseContact({ ...contact, email: "nope", state: "XX", postalCode: "123" })
    expect(parsed).toBeUndefined()
    expect(Object.keys(errors).sort()).toEqual(["email", "postalCode", "state"])
  })
})

describe("mock backend", () => {
  it("offers both programs at the provisional list price", async () => {
    const offers = await mockBackend.listOffers()
    expect(offers.map((o) => [o.handle, o.price])).toEqual([
      ["vmc", 599900],
      ["mach-1", 599900],
    ])
    expect(MOCK_PRICES).toEqual({ vmc: 599900, "mach-1": 599900 })
  })

  it("runs a simulated checkout without placing a real order", async () => {
    const started = await mockBackend.startCheckout([{ handle: "vmc", quantity: 2 }], contact)
    expect(started.quote.subtotal).toBe(1199800)
    expect(started.quote.placeOrderBlocked).toBeDefined()
    await expect(mockBackend.placeOrder(started.token)).rejects.toBeInstanceOf(StoreError)

    const shipped = await mockBackend.selectShipping(started.token, started.quote.shippingOptions[0].id)
    expect(shipped.quote.placeOrderBlocked).toBeUndefined()
    const order = await mockBackend.placeOrder(shipped.token)
    expect(order).toMatchObject({ simulated: true, total: 1199800, email: contact.email })
    expect(order.id).toMatch(/^MOCK-/)
  })

  it("prices from the catalog, ignoring unknown handles", async () => {
    await expect(mockBackend.startCheckout([{ handle: "ow-1", quantity: 1 }], contact)).rejects.toThrow("empty")
  })
})

describe("medusa backend", () => {
  type Call = { method: string; path: string; body?: unknown; headers: Record<string, string> }

  function fakeMedusa() {
    const calls: Call[] = []
    const cart = {
      id: "cart_01TEST",
      currency_code: "usd",
      items: [] as { product_handle: string; product_title: string; title: string; quantity: number; unit_price: number }[],
      shipping_methods: [] as { shipping_option_id: string }[],
      item_subtotal: 0,
      shipping_total: 0,
      tax_total: 0,
      total: 0,
    }
    const routes: Record<string, (body: Record<string, unknown>) => unknown> = {
      "GET /store/regions": () => ({ regions: [{ id: "reg_us" }] }),
      "GET /store/products": () => ({
        products: [
          {
            handle: "vmc",
            title: "Compact VMC",
            variants: [{ id: "variant_vmc", calculated_price: { calculated_amount: 5999, currency_code: "usd" } }],
          },
          { handle: "unpriced", title: "No price", variants: [{ id: "variant_x", calculated_price: null }] },
        ],
      }),
      "POST /store/carts": () => ({ cart }),
      "POST /store/carts/cart_01TEST/line-items": (body) => {
        cart.items.push({
          product_handle: "vmc",
          product_title: "Compact VMC",
          title: "Standard",
          quantity: body.quantity as number,
          unit_price: 5999,
        })
        cart.item_subtotal = 5999 * (body.quantity as number)
        cart.tax_total = 464.920010415
        cart.total = cart.item_subtotal + cart.tax_total
        return { cart }
      },
      "GET /store/shipping-options": () => ({
        shipping_options: [
          { id: "so_priority", name: "USPS Priority Mail", price_type: "calculated" },
          { id: "so_ground", name: "USPS Ground Advantage", price_type: "calculated" },
        ],
      }),
      "POST /store/shipping-options/so_priority/calculate": () => ({ shipping_option: { amount: 8.07 } }),
      "POST /store/shipping-options/so_ground/calculate": () => ({ shipping_option: { amount: 6.19 } }),
      "POST /store/carts/cart_01TEST/shipping-methods": (body) => {
        cart.shipping_methods = [{ shipping_option_id: body.option_id as string }]
        cart.shipping_total = 6.19
        cart.total = cart.item_subtotal + cart.tax_total + cart.shipping_total
        return { cart }
      },
    }
    const fetchImpl = async (input: string | URL | Request, init?: RequestInit) => {
      const url = new URL(String(input))
      const method = init?.method ?? "GET"
      const body = init?.body ? JSON.parse(String(init.body)) : undefined
      calls.push({ method, path: url.pathname, body, headers: init?.headers as Record<string, string> })
      const handler = routes[`${method} ${url.pathname}`]
      if (!handler) return new Response(JSON.stringify({ message: "not found" }), { status: 404 })
      return new Response(JSON.stringify(handler(body ?? {})), { status: 200 })
    }
    const backend = createMedusaBackend({
      baseUrl: "https://backend.example",
      publishableKey: "pk_test",
      accessClientId: "id",
      accessClientSecret: "secret",
      fetch: fetchImpl as typeof fetch,
    })
    return { backend, calls }
  }

  it("lists only priced products, in cents, sending the key and Access headers", async () => {
    const { backend, calls } = fakeMedusa()
    expect(await backend.listOffers()).toEqual([
      { handle: "vmc", title: "Compact VMC", variantId: "variant_vmc", price: 599900, currency: "usd" },
    ])
    expect(calls[0].headers).toMatchObject({
      "x-publishable-api-key": "pk_test",
      "CF-Access-Client-Id": "id",
      "CF-Access-Client-Secret": "secret",
    })
  })

  it("creates the cart with the address before adding items, then quotes shipping", async () => {
    const { backend, calls } = fakeMedusa()
    const { token, quote } = await backend.startCheckout([{ handle: "vmc", quantity: 1 }], contact)
    const create = calls.find((c) => c.method === "POST" && c.path === "/store/carts")
    expect(create?.body).toMatchObject({
      region_id: "reg_us",
      email: contact.email,
      shipping_address: { postal_code: "92117", province: "ca", country_code: "us" },
    })
    expect(calls.findIndex((c) => c.path === "/store/carts")).toBeLessThan(
      calls.findIndex((c) => c.path.endsWith("/line-items")),
    )
    expect(token).toBe("cart_01TEST")
    expect(quote).toMatchObject({ subtotal: 599900, tax: 46492, placeOrderBlocked: "Choose a shipping method." })
    expect(quote.shippingOptions.map((o) => [o.id, o.amount])).toEqual([
      ["so_ground", 619],
      ["so_priority", 807],
    ])

    const shipped = await backend.selectShipping(token, "so_ground")
    expect(shipped.quote).toMatchObject({ selectedShippingId: "so_ground", shipping: 619, total: 599900 + 46492 + 619 })
    expect(shipped.quote.placeOrderBlocked).toBe(PAYMENT_NOT_CONNECTED)
    await expect(backend.placeOrder(token)).rejects.toThrow(PAYMENT_NOT_CONNECTED)
  })

  it("rejects tampered checkout tokens", async () => {
    const { backend } = fakeMedusa()
    await expect(backend.selectShipping("../admin", "so_ground")).rejects.toBeInstanceOf(StoreError)
  })

  it("hides server errors from shoppers", async () => {
    const backend = createMedusaBackend({
      baseUrl: "https://backend.example",
      publishableKey: "pk_test",
      fetch: (async () =>
        new Response(JSON.stringify({ message: "Tax could not be calculated" }), { status: 500 })) as typeof fetch,
    })
    await expect(backend.listOffers()).rejects.toThrow("The store is unavailable right now")
  })
})
