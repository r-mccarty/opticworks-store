import { describe, expect, it } from "vitest"

import type { Product } from "@/lib/products"
import type { CartItem } from "./types"
import { normalizeCartItem, normalizeCartItems, summarizeSpecifications } from "./utils"

const baseProduct: Product = {
  id: "test-product",
  name: "Test Product",
  description: "Legacy catalog entry",
  price: 199,
  image: "/image.png",
  category: "sensor",
  specifications: [
    { label: "Power", value: "USB-C" },
    { label: "Warranty", value: "2 years" },
  ],
  inStock: true,
}

describe("cart utils", () => {
  it("normalizes missing specifications to an empty array", () => {
    const legacyProduct = {
      ...baseProduct,
      specifications: undefined,
    } as unknown as Product

    const normalized = normalizeCartItem(legacyProduct)
    expect(normalized.specifications).toEqual([])
  })

  it("clamps invalid quantities when normalizing", () => {
    const invalidQuantityItem = {
      ...baseProduct,
      quantity: 0,
    } as unknown as CartItem

    const normalized = normalizeCartItem(invalidQuantityItem)
    expect(normalized.quantity).toBe(1)
  })

  it("normalizes persisted arrays with malformed specs", () => {
    const legacyItems = [
      {
        ...baseProduct,
        specifications: null,
        quantity: 2,
      },
    ] as unknown as CartItem[]

    const normalized = normalizeCartItems(legacyItems)
    expect(normalized).toHaveLength(1)
    expect(normalized[0].specifications).toEqual([])
    expect(normalized[0].quantity).toBe(2)
  })

  it("summarizes specifications with a limit", () => {
    const summary = summarizeSpecifications(baseProduct.specifications, 1)
    expect(summary).toBe("Power: USB-C")
  })

  it("returns an empty summary when no specifications exist", () => {
    const summary = summarizeSpecifications(undefined)
    expect(summary).toBe("")
  })
})
