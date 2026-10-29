import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { products } from "@/lib/products"

const fetchMock = vi.fn(() => Promise.reject(new Error("unexpected network request")))

describe("commerce kill switch", () => {
  beforeEach(() => {
    // Even with the env flag on, COMMERCE_ENABLED=false must keep Medusa off.
    vi.stubEnv("NEXT_PUBLIC_MEDUSA_ENABLED", "true")
    vi.stubEnv("NEXT_PUBLIC_MEDUSA_BASE_URL", "https://api.optic.works")
    vi.stubGlobal("fetch", fetchMock)
    vi.resetModules()
    fetchMock.mockClear()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it("is disabled", async () => {
    const { COMMERCE_ENABLED } = await import("@/lib/commerce")
    expect(COMMERCE_ENABLED).toBe(false)
  })

  it("serves the static catalog without calling Medusa", async () => {
    const medusa = await import("@/lib/api/medusa")

    expect(medusa.medusaConfig.enabled).toBe(false)
    await expect(medusa.listProducts()).resolves.toEqual(products)
    await expect(medusa.getProductById("ow-1-dev-kit")).resolves.toMatchObject({ id: "ow-1-dev-kit" })
    await expect(medusa.createCart("reg_123")).rejects.toThrow(/disabled/)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("does not initialize or sync a Medusa cart", async () => {
    const { useCart } = await import("@/hooks/useCart")

    await useCart.getState().initializeCart()
    await useCart.getState().syncWithMedusa()

    expect(useCart.getState().cartId).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
