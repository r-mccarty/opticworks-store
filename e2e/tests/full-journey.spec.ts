import { test, expect } from "@playwright/test"
import { StorePage } from "../fixtures/page-objects/store-page"
import { ProductPage } from "../fixtures/page-objects/product-page"
import { CartPage } from "../fixtures/page-objects/cart-page"
import { CheckoutPage } from "../fixtures/page-objects/checkout-page"
import {
  generateTestEmail,
  testProducts,
  testAddress,
  testCards,
} from "../fixtures/test-data"

test.describe("Full User Journey", () => {
  test("complete journey: browse -> cart -> checkout (guest)", async ({ page }) => {
    const storePage = new StorePage(page)
    const productPage = new ProductPage(page)
    const cartPage = new CartPage(page)
    const checkoutPage = new CheckoutPage(page)

    // Step 1: Browse store
    console.log("[Journey] Step 1: Browse store")
    await storePage.goto()
    await storePage.waitForProducts()

    // Step 2: Navigate to product
    console.log("[Journey] Step 2: Navigate to product")
    await storePage.clickProduct(testProducts.flagship.name)
    await productPage.waitForProduct()

    // Step 3: Add to cart
    console.log("[Journey] Step 3: Add to cart")
    await productPage.addToCart()

    // Step 4: Go to cart
    console.log("[Journey] Step 4: View cart")
    await cartPage.goto()
    await cartPage.waitForCartHydration()
    expect(await cartPage.hasItems()).toBe(true)

    // Step 5: Proceed to checkout
    console.log("[Journey] Step 5: Proceed to checkout")
    await cartPage.proceedToPayment()

    // Step 6: Fill checkout form
    console.log("[Journey] Step 6: Fill checkout form")
    await checkoutPage.waitForCheckoutReady()

    const checkoutEmail = generateTestEmail()
    await checkoutPage.fillEmail(checkoutEmail)
    await checkoutPage.fillShippingAddress(testAddress)

    // Step 7: Fill payment details
    console.log("[Journey] Step 7: Fill payment details")
    await checkoutPage.waitForStripeElements()
    await checkoutPage.fillCardDetails(testCards.success)

    // Step 8: Submit payment
    console.log("[Journey] Step 8: Submit payment")
    await checkoutPage.submitPayment()

    // Step 9: Verify success
    console.log("[Journey] Step 9: Verify success")
    await checkoutPage.waitForSuccess()
    expect(page.url()).toContain("/success")

    console.log("[Journey] Complete! Order placed successfully")
  })

  test("verify store navigation doesn't cause 404s", async ({ page }) => {
    const storePage = new StorePage(page)

    // Go to store
    await storePage.goto()
    await storePage.waitForProducts()

    // Get all product hrefs
    const hrefs = await storePage.getAllProductHrefs()
    console.log(`[Journey] Found ${hrefs.length} product links`)

    // Click each product and verify it loads
    for (let i = 0; i < Math.min(hrefs.length, 3); i++) {
      const href = hrefs[i]
      console.log(`[Journey] Testing product ${i + 1}: ${href}`)

      await page.goto(href)
      await page.waitForLoadState("domcontentloaded")

      // Check we're on a product page with content
      const h1 = await page.locator("h1").first().textContent()
      expect(h1).toBeTruthy()
      expect(h1?.toLowerCase()).not.toContain("not found")
      expect(h1?.toLowerCase()).not.toContain("404")

      console.log(`[Journey] Product loaded: ${h1}`)
    }

    console.log("[Journey] All tested products loaded successfully")
  })

  test("cart persists across navigation", async ({ page }) => {
    const storePage = new StorePage(page)
    const productPage = new ProductPage(page)
    const cartPage = new CartPage(page)

    // Add product to cart
    await productPage.goto(testProducts.flagship.slug)
    await productPage.waitForProduct()
    await productPage.addToCart()

    // Navigate away to store
    await storePage.goto()
    await storePage.waitForProducts()

    // Navigate back to cart
    await cartPage.goto()
    await cartPage.waitForCartHydration()

    // Verify cart still has items
    expect(await cartPage.hasItems()).toBe(true)
    console.log("[Journey] Cart persisted across navigation")
  })
})
