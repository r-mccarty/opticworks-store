import { test, expect } from "@playwright/test"
import { StorePage } from "../fixtures/page-objects/store-page"
import { ProductPage } from "../fixtures/page-objects/product-page"
import { CartPage } from "../fixtures/page-objects/cart-page"
import { testProducts } from "../fixtures/test-data"

test.describe("Store Navigation", () => {
  test("store page displays products", async ({ page }) => {
    const storePage = new StorePage(page)

    await storePage.goto()
    await storePage.waitForProducts()

    // Verify products are displayed
    const productCount = await storePage.getProductCount()
    expect(productCount).toBeGreaterThan(0)

    console.log(`[Test] Store page displays ${productCount} products`)
  })

  test("product links use correct slug format", async ({ page }) => {
    const storePage = new StorePage(page)

    await storePage.goto()
    await storePage.waitForProducts()

    // Get all product hrefs
    const hrefs = await storePage.getAllProductHrefs()
    console.log(`[Test] Product hrefs: ${hrefs.join(", ")}`)

    // Verify each href is a valid slug format
    for (const href of hrefs) {
      expect(href).toMatch(/^\/products\/[a-z0-9-]+$/)
    }
  })

  test("clicking product navigates to product detail page", async ({ page }) => {
    const storePage = new StorePage(page)

    await storePage.goto()
    await storePage.waitForProducts()

    // Click on first product
    await storePage.clickProductByIndex(0)

    // Verify we're on a product page
    expect(page.url()).toContain("/products/")

    // Should not be a 404
    const heading = await page.locator("h1").textContent()
    expect(heading).toBeTruthy()
    expect(heading?.toLowerCase()).not.toContain("not found")

    console.log(`[Test] Navigated to product: ${heading}`)
  })

  test("flagship product page loads correctly", async ({ page }) => {
    const productPage = new ProductPage(page)

    await productPage.goto(testProducts.flagship.slug)
    await productPage.waitForProduct()

    // Verify product title
    const title = await productPage.getTitle()
    expect(title).toContain(testProducts.flagship.name)

    // Verify add to cart is available
    const canAddToCart = await productPage.isAddToCartAvailable()
    expect(canAddToCart).toBe(true)
  })

  test("user can add product to cart from product page", async ({ page }) => {
    const productPage = new ProductPage(page)
    const cartPage = new CartPage(page)

    // Go to product page
    await productPage.goto(testProducts.flagship.slug)
    await productPage.waitForProduct()

    // Add to cart
    await productPage.addToCart()

    // Go to cart and verify item is there
    await cartPage.goto()
    await cartPage.waitForCartHydration()

    const hasItems = await cartPage.hasItems()
    expect(hasItems).toBe(true)

    const itemCount = await cartPage.getItemCount()
    expect(itemCount).toBeGreaterThan(0)

    console.log(`[Test] Cart has ${itemCount} item(s)`)
  })

  test("navigate store -> product -> cart flow", async ({ page }) => {
    const storePage = new StorePage(page)
    const productPage = new ProductPage(page)
    const cartPage = new CartPage(page)

    // Start at store
    await storePage.goto()
    await storePage.waitForProducts()
    console.log("[Test] Step 1: Store page loaded")

    // Click on a product
    await storePage.clickProduct(testProducts.flagship.name)
    console.log("[Test] Step 2: Clicked on product")

    // Verify we're on the product page
    await productPage.waitForProduct()
    const title = await productPage.getTitle()
    expect(title).toBeTruthy()
    console.log(`[Test] Step 3: On product page: ${title}`)

    // Add to cart
    await productPage.addToCart()
    console.log("[Test] Step 4: Added to cart")

    // Go to cart
    await cartPage.goto()
    await cartPage.waitForCartHydration()

    // Verify item in cart
    const hasItems = await cartPage.hasItems()
    expect(hasItems).toBe(true)
    console.log("[Test] Step 5: Item in cart verified")
  })

  test("all store products are accessible (no 404s)", async ({ page }) => {
    const storePage = new StorePage(page)

    await storePage.goto()
    await storePage.waitForProducts()

    // Get all product hrefs
    const hrefs = await storePage.getAllProductHrefs()
    const uniqueHrefs = [...new Set(hrefs)]

    console.log(`[Test] Testing ${uniqueHrefs.length} unique product pages`)

    // Test each product page
    const results: { href: string; status: "ok" | "error"; error?: string }[] = []

    for (const href of uniqueHrefs.slice(0, 5)) {
      // Test first 5 to keep test fast
      try {
        await page.goto(href)
        await page.waitForLoadState("domcontentloaded")

        // Check if it's a 404
        const heading = await page.locator("h1").textContent()
        if (heading?.toLowerCase().includes("not found")) {
          results.push({ href, status: "error", error: "404 Not Found" })
        } else {
          results.push({ href, status: "ok" })
        }
      } catch (error) {
        results.push({
          href,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    // Log results
    for (const result of results) {
      console.log(`[Test] ${result.href}: ${result.status}${result.error ? ` - ${result.error}` : ""}`)
    }

    // All should be OK
    const errors = results.filter((r) => r.status === "error")
    expect(errors).toHaveLength(0)
  })
})
